package pdftimetable

import (
	"fmt"
	"io"
	"regexp"
	"strings"

	"github.com/ledongthuc/pdf"
)

// ParseIntensiveCourses extracts 集中講義 (intensive/concentrated-schedule)
// courses from the university's "集中講義日程一覧" PDF. These courses meet
// on specific calendar dates instead of a weekly 曜日×時限 slot, so unlike
// ParseGeneralEducation the returned rows always have a nil Day/Period; the
// date/period/room description goes in Note instead of Classroom, so it
// survives publishing even though no Meeting gets created for these rows
// (see internal/repository/timetable_import.go's PublishBatch).
//
// The source document groups courses under a 科目区分 (subject category:
// 総合教養科目, 基礎教育科目, 教職科目, ...) via a vertically-written,
// row-spanning left column. That label's glyphs land out of order in both
// of ledongthuc/pdf's extraction modes, so rather than parse it, this
// scopes to the 総合教養科目 group specifically by cutting the text at the
// first occurrence of the next group's label ("礎教育科目", from
// "基礎教育科目") — 総合教養科目 is always listed first in this document.
// MergeIntensiveRows combines the main timetable's rows with the intensive
// (集中講義) PDF's rows. A course that meets on specific calendar dates
// still shows up in the main timetable PDF too (usually under a nominal
// registration 曜日・時限), so the main row is dropped in favor of the
// intensive one — otherwise the same course would appear twice: once in
// the weekly grid, once in the 集中講義 list below it.
func MergeIntensiveRows(mainRows, intensiveRows []ParsedRow) []ParsedRow {
	intensiveCodes := make(map[string]bool, len(intensiveRows))
	for _, row := range intensiveRows {
		intensiveCodes[row.CourseCode] = true
	}

	merged := make([]ParsedRow, 0, len(mainRows)+len(intensiveRows))
	for _, row := range mainRows {
		if intensiveCodes[row.CourseCode] {
			continue
		}
		merged = append(merged, row)
	}
	return append(merged, intensiveRows...)
}

func ParseIntensiveCourses(reader io.ReaderAt, size int64) ([]ParsedRow, error) {
	r, err := pdf.NewReader(reader, size)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF: %w", err)
	}

	var all strings.Builder
	for i := 1; i <= r.NumPage(); i++ {
		page := r.Page(i)
		if page.V.IsNull() {
			continue
		}
		txt, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}
		all.WriteString(txt)
		all.WriteString("\n")
	}

	text := all.String()
	if idx := strings.Index(text, "礎教育科目"); idx >= 0 {
		text = text[:idx]
		// The category label's first character ("基") renders on its own,
		// just before "礎教育科目", due to the source column's vertical
		// (top-to-bottom) writing direction — trim it along with the label.
		text = strings.TrimRight(text, "基 \t\n")
	}

	rows := parseIntensiveSection(text)
	if len(rows) == 0 {
		return nil, fmt.Errorf("集中講義日程PDFから総合教養科目の行が見つかりませんでした")
	}
	return rows, nil
}

var replacementCharRe = regexp.MustCompile(`\x{FFFD}`)

// roomBoundaryRe inserts a space between a period marker and a directly
// glued-on room/campus name, e.g. "5限植物園" -> "5限 植物園". Source cells
// have no delimiter between them, so this is cosmetic best-effort only.
var roomBoundaryRe = regexp.MustCompile(`(限)(植物園|森之宮キャンパス|杉本キャンパス|中百舌鳥|全学共通教育棟|旧教養地区|[A-ZＡ-Ｚ][0-9０-９])`)

// firstDigitRe finds where the 期間 (date schedule) column starts — it's
// always a digit (half or full-width), and title/instructor text never
// contains one.
var firstDigitRe = regexp.MustCompile(`[0-9０-９]`)

func parseIntensiveSection(text string) []ParsedRow {
	locs := courseCodeRe.FindAllStringIndex(text, -1)
	rows := make([]ParsedRow, 0, len(locs))

	for i, loc := range locs {
		start, end := loc[0], loc[1]
		var rest string
		if i+1 < len(locs) {
			rest = text[end:locs[i+1][0]]
		} else {
			rest = text[end:]
		}

		name, instructor, schedule := splitIntensiveTitleInstructor(rest)
		if name == "" {
			continue
		}

		rows = append(rows, ParsedRow{
			CourseCode: text[start:end],
			CourseName: name,
			Instructor: instructor,
			Note:       cleanIntensiveSchedule(schedule),
			Raw:        text[start:end] + rest,
		})
	}

	return rows
}

// splitIntensiveTitleInstructor separates "<title><instructor>" with no
// delimiter between them (e.g. "植物と人間厚井　聡") from the schedule text
// that follows. Unlike the main timetable, this document has no annotation
// suffix to anchor on, so the split instead relies on: the schedule always
// starts at the first digit, and a name's family/given name segments are
// joined by a single full-width space. The 2-character family name
// assumption is a heuristic (common, but not universal for longer Japanese
// surnames) — good enough since results land in an editable draft.
func splitIntensiveTitleInstructor(rest string) (title, instructor, schedule string) {
	digitLoc := firstDigitRe.FindStringIndex(rest)
	head, tail := rest, ""
	if digitLoc != nil {
		head, tail = rest[:digitLoc[0]], rest[digitLoc[0]:]
	}

	spaceIdx := strings.LastIndex(head, "　")
	if spaceIdx < 0 {
		return strings.TrimSpace(head), "", tail
	}

	beforeSpace := []rune(head[:spaceIdx])
	givenName := strings.TrimSpace(head[spaceIdx+len("　"):])

	familyLen := 2
	if len(beforeSpace) < familyLen {
		familyLen = len(beforeSpace)
	}
	familyName := string(beforeSpace[len(beforeSpace)-familyLen:])
	title = strings.TrimSpace(string(beforeSpace[:len(beforeSpace)-familyLen]))
	instructor = familyName + "　" + givenName
	return title, instructor, tail
}

func cleanIntensiveSchedule(s string) string {
	s = replacementCharRe.ReplaceAllString(s, "")
	s = strings.Join(strings.Fields(s), " ")
	s = roomBoundaryRe.ReplaceAllString(s, "$1 $2")
	return strings.TrimSpace(s)
}
