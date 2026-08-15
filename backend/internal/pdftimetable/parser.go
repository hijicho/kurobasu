// Package pdftimetable extracts 総合教養科目 (general education) schedule
// rows from the university's official timetable PDF ("授業時間割表").
//
// The source PDF is a print-style export (courses laid out in a table of
// 曜日 × 時限) and does not embed any machine-readable table structure —
// only positioned glyphs, reconstructed here via two complementary passes:
//
//   - Page.GetTextByRow(): groups glyphs by visual row (top-to-bottom), which
//     is what lets us track which 曜日/時限 block each course code falls in.
//     However, for a minority of rows the source PDF places a
//     right-justified (均等割付) course title's glyphs out of visual X order
//     within that row, so text recovered this way can come out scrambled.
//   - Page.GetPlainText(): walks the PDF content stream directly and, for
//     course title/instructor text specifically, reliably recovers correct
//     reading order even for the rows that GetTextByRow scrambles (it does
//     NOT reliably preserve which 曜日/時限 block a row belongs to, so it's
//     not used for that).
//
// The two are combined: day/period/classroom/note come from the
// GetTextByRow-based pass, while course_name/instructor are corrected
// against a course-code-keyed lookup built from GetPlainText when available.
// Imported rows still land in an editable draft batch before publishing, so
// any row the correction doesn't reach can be fixed by hand.
package pdftimetable

import (
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"

	"github.com/ledongthuc/pdf"
)

// ParsedRow is a single コマ (course slot) extracted from the timetable PDF.
type ParsedRow struct {
	// Day: 1=月 .. 5=金. nil when the row has no fixed day (時間割外/集中講義).
	Day *int16
	// Period: 1..5. nil alongside Day when unscheduled.
	Period     *int16
	CourseCode string
	CourseName string
	Instructor string
	Classroom  string
	Note       string
	// Raw is the row's full extracted text before splitting, kept so an
	// admin can cross-check a garbled CourseName against the source line.
	Raw string
}

var dayNumbers = map[string]int16{"月": 1, "火": 2, "水": 3, "木": 4, "金": 5}

// TermHeaderKeyword returns the substring that identifies a page as
// belonging to the given term's 総合教養科目 table ("前期"/"後期"). Other
// terms (intensive/year) don't get a dedicated section in this PDF, so no
// keyword filter is applied for them.
func TermHeaderKeyword(term string) string {
	switch term {
	case "spring":
		return "前期"
	case "fall":
		return "後期"
	default:
		return ""
	}
}

// ParseGeneralEducation reads a timetable PDF and returns every 総合教養科目
// row found on pages matching the given term.
func ParseGeneralEducation(reader io.ReaderAt, size int64, term string) ([]ParsedRow, error) {
	r, err := pdf.NewReader(reader, size)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF: %w", err)
	}

	keyword := TermHeaderKeyword(term)
	numPages := r.NumPage()
	var matchingPages []int
	for i := 1; i <= numPages; i++ {
		page := r.Page(i)
		if page.V.IsNull() {
			continue
		}
		rows, err := page.GetTextByRow()
		if err != nil || len(rows) == 0 {
			continue
		}
		header := joinRows(rows, 6)
		if !strings.Contains(header, "総合教養科目") {
			continue
		}
		if keyword != "" && !strings.Contains(header, keyword) {
			continue
		}
		matchingPages = append(matchingPages, i)
	}

	if len(matchingPages) == 0 {
		return nil, fmt.Errorf("総合教養科目の時間割ページが見つかりませんでした（term=%s）", term)
	}

	var rowTexts []string
	corrections := map[string]plainTextRecord{}
	for _, pn := range matchingPages {
		page := r.Page(pn)
		rows, err := page.GetTextByRow()
		if err != nil {
			continue
		}
		for _, row := range rows {
			text := joinWords(row.Content)
			if text == "" {
				continue
			}
			rowTexts = append(rowTexts, text)
		}

		if plainText, err := page.GetPlainText(nil); err == nil {
			for code, rec := range extractPlainTextRecords(plainText) {
				corrections[code] = rec
			}
		}
	}

	parsed := parseRowTexts(rowTexts)
	for i := range parsed {
		if rec, ok := corrections[parsed[i].CourseCode]; ok {
			parsed[i].CourseName = rec.Title
			if rec.Instructor != "" {
				parsed[i].Instructor = rec.Instructor
			}
		} else {
			parsed[i].CourseName = stripAnnotation(parsed[i].CourseName)
		}
	}
	return parsed, nil
}

// plainTextRecord is one course's corrected title/instructor, read from
// Page.GetPlainText() output.
type plainTextRecord struct {
	Title      string
	Instructor string
}

// extractPlainTextRecords scans GetPlainText() output for
// "<course code>\n<title>[/annotation]\n<instructor>\n..." blocks. Course
// codes render on their own line, immediately followed by the title, so
// this holds even for rows GetTextByRow scrambles.
func extractPlainTextRecords(plainText string) map[string]plainTextRecord {
	lines := strings.Split(plainText, "\n")
	records := map[string]plainTextRecord{}

	for i, raw := range lines {
		line := strings.TrimSpace(raw)
		if !exactCourseCodeRe.MatchString(line) {
			continue
		}

		var title, instructor string
		if i+1 < len(lines) {
			title = stripAnnotation(strings.TrimSpace(lines[i+1]))
		}
		if i+2 < len(lines) {
			candidate := strings.TrimSpace(lines[i+2])
			if instructorRe.MatchString(candidate) && !exactCourseCodeRe.MatchString(candidate) {
				instructor = candidate
			}
		}
		// GetPlainText() usually puts the title/instructor right after the
		// code, but not always (content-stream order can misplace a whole
		// row, e.g. onto page furniture like "5限" / the page header). Only
		// trust a candidate that actually looks like title/instructor text,
		// so a bad correction can't clobber a good GetTextByRow-derived one.
		if !looksLikeCourseTitle(title) {
			continue
		}
		if !looksLikeInstructorName(instructor) {
			instructor = ""
		}
		records[line] = plainTextRecord{Title: title, Instructor: instructor}
	}

	return records
}

// stripAnnotation drops the 履修区分 annotation from a course title, e.g.
// "現代の経営 /全(商以外)_森" -> "現代の経営". Titles never legitimately
// contain a "/", so cutting at the first one is safe.
func stripAnnotation(title string) string {
	if i := strings.IndexAny(title, "/／"); i > 0 {
		return strings.TrimSpace(title[:i])
	}
	if i := strings.IndexAny(title, "/／"); i == 0 {
		// Only the annotation survived (e.g. a correction wasn't found and
		// the scrambled fallback title happens to start with the slash);
		// nothing safe to keep.
		return ""
	}
	return strings.TrimSpace(title)
}

// pageFurnitureRe matches text that belongs to the table's header/legend
// chrome, not actual row data (page headers, column headers, footnotes).
var pageFurnitureRe = regexp.MustCompile(`時間割表|曜日|年度|授業コード|代表教員|講義室|備考|【開講|修正$`)

// looksLikeCourseTitle rejects GetPlainText() candidates that are clearly
// not a title: page furniture, or a bare day/period marker like "5限" that
// only ended up "after the code" because that row's content was misplaced
// in the content stream.
func looksLikeCourseTitle(s string) bool {
	if s == "" {
		return false
	}
	if dayPeriodRe.MatchString(s) || dayOnlyRe.MatchString(s) {
		return false
	}
	if pageFurnitureRe.MatchString(s) {
		return false
	}
	return true
}

// looksLikeInstructorName rejects GetPlainText() candidates too long or too
// furniture-like to plausibly be a person's name (real names top out around
// 10-15 characters even for multi-part foreign names).
func looksLikeInstructorName(s string) bool {
	if s == "" {
		return true
	}
	if pageFurnitureRe.MatchString(s) {
		return false
	}
	return len([]rune(s)) <= 20
}

func joinRows(rows pdf.Rows, limit int) string {
	var sb strings.Builder
	for i, row := range rows {
		if i >= limit {
			break
		}
		sb.WriteString(joinWords(row.Content))
	}
	return sb.String()
}

func joinWords(words []pdf.Text) string {
	var sb strings.Builder
	for _, w := range words {
		sb.WriteString(w.S)
	}
	return strings.TrimSpace(sb.String())
}

// ==================== row-text parsing (pure, unit-testable) ====================

var (
	courseCodeRe      = regexp.MustCompile(`1[A-Z]{3}[0-9]{6}`)
	exactCourseCodeRe = regexp.MustCompile(`^1[A-Z]{3}[0-9]{6}$`)
	// day/period prefix appearing immediately before a course code on the
	// same extracted line, e.g. "水3限", "4限", "月" (rare), or empty.
	dayPeriodRe = regexp.MustCompile(`^([月火水木金])?([0-9])?限?$`)
	dayOnlyRe   = regexp.MustCompile(`^[月火水木金]$`)
	noteRe      = regexp.MustCompile(`(抽選|不開講|通年)[★※0-9]*\s*$`)
	// Instructor names are rendered as space-separated runs of
	// kanji/kana/(sometimes full/half-width Latin for overseas staff),
	// e.g. "高橋　信弘" or "ＫＩＭＢＡＬＬ　ＭＡＲＴＩＮ" or
	// "Joseph　Mark　McAvoy". Course titles/annotations use punctuation
	// (/, _, (, )) that falls outside this character class, so it acts as
	// a natural boundary even on otherwise garbled lines.
	nameCharClass = `[\p{Han}\p{Katakana}\p{Hiragana}A-Za-zＡ-Ｚａ-ｚー・.]`
	instructorRe  = regexp.MustCompile(nameCharClass + `+[　 ]` + nameCharClass + `+([　 ]` + nameCharClass + `+)?`)
	// The 履修区分 annotation on every course title ends in "_<campus>" or
	// "＿<campus>" (e.g. "／全(商以外)_森"), immediately followed by the
	// instructor name with no separator. The underscore survives even on
	// otherwise-scrambled titles, so it's used as the anchor to keep the
	// campus code out of the instructor name (a real surname can start
	// with the same kanji, e.g. 森田, so it can't be stripped on its own).
	titleAnnotationRe = regexp.MustCompile(`^.*[_＿]`)
	campusCodeRe      = regexp.MustCompile(`^(遠隔|植物園|阿倍野|森|杉|中|阿|り)`)
	// A given name is immediately followed by the classroom with no
	// delimiter (e.g. "信弘遠隔授業"), so instructorRe's greedy second
	// name-segment can swallow the start of the classroom. These are the
	// classroom vocabulary markers seen in the source PDF; when one shows
	// up inside a matched instructor name, the match is cut back to it.
	classroomMarkerRe = regexp.MustCompile(`(遠隔授業|講堂|植物園|後日掲示|全学共通教育棟|りんくう|[0-9０-９]+(大教室|中教室|小教室))`)
	// Lines that are table chrome (headers/legends), not data.
	skipLineRe = regexp.MustCompile(`時間割表|^曜日|^時限授業コード|^年次|^1年次|^【開講|^※`)
	// A stray continuation line (extra classroom text wrapped onto the next
	// visual line) is always short; anything long is almost certainly page
	// footer/legend text that slipped past skipLineRe and should be ignored
	// rather than glued onto the previous row.
	maxOrphanContinuationRunes = 30
)

// parseRowTexts turns already-row-grouped, top-to-bottom text lines into
// ParsedRow values. It is kept independent of the PDF library so it can be
// unit tested with literal strings.
func parseRowTexts(rowTexts []string) []ParsedRow {
	var results []ParsedRow
	// dayRaw/periodRaw mirror results but keep the marker as extracted
	// ("", "月".."金", or the sentinel "時間割外") so backfillDayPeriod can
	// propagate it before it's converted to the final *int16 fields.
	var dayRaw, periodRaw []string
	var curDay, curPeriod string

	markUnscheduled := func() {
		// 時間割外 clears the period the same way a real day marker would;
		// it's just another value the 曜日 column can take.
		curDay, curPeriod = unscheduledMarker, ""
	}

	for _, text := range rowTexts {
		if text == "" || skipLineRe.MatchString(text) {
			continue
		}

		locs := courseCodeRe.FindAllStringIndex(text, -1)
		if len(locs) == 0 {
			if dayOnlyRe.MatchString(text) {
				curDay = text
				continue
			}
			if m := dayPeriodRe.FindStringSubmatch(text); m != nil {
				if m[1] != "" {
					curDay = m[1]
				}
				if m[2] != "" {
					curPeriod = m[2]
				}
				continue
			}
			if text == unscheduledMarker || text == "割外" {
				markUnscheduled()
				continue
			}
			// Orphan continuation of the previous row's classroom (a cell
			// that wrapped onto a second visual line, e.g. "講堂" under
			// "遠隔授業（定期試験は対面）").
			if len(results) > 0 && len([]rune(text)) <= maxOrphanContinuationRunes {
				results[len(results)-1].Classroom += text
			}
			continue
		}

		for i, loc := range locs {
			start, end := loc[0], loc[1]
			if prefix := strings.TrimSpace(text[:start]); prefix != "" {
				if prefix == unscheduledMarker || prefix == "割外" {
					// Unlike day/period markers, 時間割外 doesn't always get
					// its own row: it can be glued directly onto the first
					// course code of the block (e.g. "時間割外1GAJ003301...").
					markUnscheduled()
				} else if p := dayPeriodRe.FindStringSubmatch(prefix); p != nil {
					if p[1] != "" {
						curDay = p[1]
					}
					if p[2] != "" {
						curPeriod = p[2]
					}
				}
			}

			var rest string
			if i+1 < len(locs) {
				rest = text[end:locs[i+1][0]]
			} else {
				rest = text[end:]
			}

			note := ""
			if nm := noteRe.FindString(rest); nm != "" {
				note = nm
				rest = rest[:len(rest)-len(nm)]
			}

			name, instructor, classroom := splitTitleInstructorClassroom(rest)

			results = append(results, ParsedRow{
				CourseCode: text[start:end],
				CourseName: cleanupText(name),
				Instructor: cleanupText(instructor),
				Classroom:  cleanupText(classroom),
				Note:       cleanupText(note),
				Raw:        text,
			})
			dayRaw = append(dayRaw, curDay)
			periodRaw = append(periodRaw, curPeriod)
		}
	}

	backfillDayPeriod(results, dayRaw, periodRaw)
	return results
}

// unscheduledMarker is the 曜日 column's value for 時間割外/集中講義 rows,
// tracked as just another possible curDay value (alongside 月..金) so the
// same backward-fill logic in backfillDayPeriod applies to it uniformly.
const unscheduledMarker = "時間割外"

// backfillDayPeriod fixes rows that appear before their block's 曜日/時限
// marker in the extracted stream. The 曜日 cell (whether a weekday or
// 時間割外) spans the whole block and is vertically centered within it, so
// it is emitted mid-block rather than at the top; period markers can be
// similarly delayed across a page break. Rows are filled in from the next
// row that does carry a value, which is always that same block's marker.
func backfillDayPeriod(rows []ParsedRow, dayRaw, periodRaw []string) {
	nextDay, nextPeriod := "", ""
	for i := len(rows) - 1; i >= 0; i-- {
		if dayRaw[i] != "" {
			nextDay = dayRaw[i]
		} else {
			dayRaw[i] = nextDay
		}
		if periodRaw[i] != "" {
			nextPeriod = periodRaw[i]
		} else {
			periodRaw[i] = nextPeriod
		}
	}

	for i := range rows {
		if dayRaw[i] == "" || dayRaw[i] == unscheduledMarker {
			rows[i].Day, rows[i].Period = nil, nil
			continue
		}
		rows[i].Day = parseDay(dayRaw[i])
		rows[i].Period = parsePeriod(periodRaw[i])
	}
}

func parseDay(s string) *int16 {
	n, ok := dayNumbers[s]
	if !ok {
		return nil
	}
	return &n
}

func parsePeriod(s string) *int16 {
	if s == "" {
		return nil
	}
	v, err := strconv.ParseInt(s, 10, 16)
	if err != nil {
		return nil
	}
	n := int16(v)
	return &n
}

func cleanupText(s string) string {
	return strings.TrimSpace(s)
}

// splitTitleInstructorClassroom splits the text between a course code and
// the next boundary (note/next code) into (course name, instructor,
// classroom). See the titleAnnotationRe/campusCodeRe comment for why the
// split anchors on the last "_"/"＿" rather than scanning from the start.
func splitTitleInstructorClassroom(rest string) (name, instructor, classroom string) {
	name, instructor, classroom = rest, "", ""

	searchFrom := rest
	prefixLen := 0
	if loc := titleAnnotationRe.FindStringIndex(rest); loc != nil {
		prefixLen = loc[1]
		searchFrom = rest[prefixLen:]
		if m := campusCodeRe.FindString(searchFrom); m != "" {
			prefixLen += len(m)
			searchFrom = rest[prefixLen:]
		}
	}

	if im := instructorRe.FindStringIndex(searchFrom); im != nil {
		name = rest[:prefixLen+im[0]]
		instructor, classroom = trimInstructorAtClassroomMarker(searchFrom[im[0]:im[1]], searchFrom[im[1]:])
		return name, instructor, classroom
	}

	// No annotation anchor (or no name-shaped match after it): fall back
	// to searching the whole segment so we still extract something.
	if im := instructorRe.FindStringIndex(rest); im != nil {
		name = rest[:im[0]]
		instructor, classroom = trimInstructorAtClassroomMarker(rest[im[0]:im[1]], rest[im[1]:])
	}
	return name, instructor, classroom
}

// trimInstructorAtClassroomMarker cuts a greedily-matched instructor name
// back to where a classroom keyword starts, in case the name's second
// segment ran on into the (unseparated) classroom text.
func trimInstructorAtClassroomMarker(instructor, classroom string) (string, string) {
	if loc := classroomMarkerRe.FindStringIndex(instructor); loc != nil {
		return strings.TrimSpace(instructor[:loc[0]]), instructor[loc[0]:] + classroom
	}
	return instructor, classroom
}
