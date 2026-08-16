// Package csvtimetable extracts timetable schedule rows from the
// university's official timetable CSV exports. Any category (総合教養科目,
// 専門科目, 第二外国語, etc.) can be imported as long as its export uses the
// shared column layout below.
//
// Two exports share the same column layout (年度,学期,曜日,時限,科目名,
// 担当教員,授業コード,講義室, plus an optional 実施キャンパス column):
//   - the regular weekly timetable, where most rows carry a 曜日/時限 but a
//     trailing "時間割外" section lists courses with no fixed weekly slot
//     (on-demand, correspondence, etc.)
//   - the 集中講義 (intensive/concentrated-schedule) list, where every row
//     is unscheduled in the same way since those courses meet on specific
//     calendar dates instead of a weekly slot.
//
// Both are parsed with the same Parse function; the caller (see
// internal/handlers/timetable_rows.go) merges the two files via
// MergeIntensiveRows.
package csvtimetable

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf8"

	"golang.org/x/text/encoding/japanese"
)

// ParsedRow is a single コマ (course slot) extracted from a timetable CSV.
type ParsedRow struct {
	// Day: 1=月 .. 5=金. nil when the row has no fixed day (時間割外/集中講義).
	Day *int16
	// Period: 1..5. nil alongside Day when unscheduled.
	Period     *int16
	CourseCode string
	CourseName string
	Instructor string
	Campus     string
	Classroom  string
	Note       string
}

var dayNumbers = map[string]int16{"月": 1, "火": 2, "水": 3, "木": 4, "金": 5, "土": 6, "日": 7}

// unscheduledMarker is the 曜日 column's value for courses with no fixed
// weekly slot (時間割外/集中講義).
const unscheduledMarker = "時間割外"

var periodDigitsRe = regexp.MustCompile(`[0-9]+`)

// TermLabel maps the app's internal semester key ("spring"/"fall") to the 学期
// label used in the university's CSV export.
func TermLabel(term string) string {
	switch term {
	case "spring":
		return "前期"
	case "fall":
		return "後期"
	default:
		return ""
	}
}

type columnIndex struct {
	term, day, period, courseName, instructor, courseCode, campus, classroom int
}

// buildColumnIndex maps the CSV header to column positions by name, so the
// parser tolerates column reordering as long as the header labels match.
func buildColumnIndex(header []string) (columnIndex, error) {
	idx := columnIndex{term: -1, day: -1, period: -1, courseName: -1, instructor: -1, courseCode: -1, campus: -1, classroom: -1}
	targets := map[string]*int{
		"学期":     &idx.term,
		"曜日":     &idx.day,
		"時限":     &idx.period,
		"科目名":    &idx.courseName,
		"担当教員":   &idx.instructor,
		"授業コード":  &idx.courseCode,
		"実施キャンパス": &idx.campus,
		"講義室":    &idx.classroom,
	}
	for i, col := range header {
		if p, ok := targets[strings.TrimSpace(col)]; ok {
			*p = i
		}
	}

	required := []struct {
		label string
		idx   int
	}{
		{"曜日", idx.day},
		{"時限", idx.period},
		{"科目名", idx.courseName},
		{"担当教員", idx.instructor},
		{"授業コード", idx.courseCode},
		{"講義室", idx.classroom},
	}
	var missing []string
	for _, req := range required {
		if req.idx < 0 {
			missing = append(missing, req.label)
		}
	}
	if len(missing) > 0 {
		return idx, fmt.Errorf("CSVのヘッダーに必要な列がありません: %s", strings.Join(missing, ", "))
	}
	return idx, nil
}

// Parse reads a timetable CSV and returns every row matching the given term
// (rows with no 学期 value, or when term is unrecognized, are not filtered
// out).
func Parse(r io.Reader, term string) ([]ParsedRow, error) {
	decoded, err := decodeJapaneseCSV(r)
	if err != nil {
		return nil, err
	}

	cr := csv.NewReader(bytes.NewReader(decoded))
	cr.FieldsPerRecord = -1
	cr.TrimLeadingSpace = true
	records, err := cr.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("CSVの読み込みに失敗しました: %w", err)
	}
	if len(records) < 2 {
		return nil, fmt.Errorf("CSVにデータ行がありません")
	}

	idx, err := buildColumnIndex(records[0])
	if err != nil {
		return nil, err
	}

	termLabel := TermLabel(term)

	var rows []ParsedRow
	for _, rec := range records[1:] {
		courseCode := field(rec, idx.courseCode)
		courseName := field(rec, idx.courseName)
		if courseCode == "" && courseName == "" {
			continue
		}
		if termLabel != "" {
			if t := field(rec, idx.term); t != "" && t != termLabel {
				continue
			}
		}

		rows = append(rows, ParsedRow{
			Day:        parseDay(field(rec, idx.day)),
			Period:     parsePeriod(field(rec, idx.period)),
			CourseCode: courseCode,
			CourseName: courseName,
			Instructor: field(rec, idx.instructor),
			Campus:     field(rec, idx.campus),
			Classroom:  field(rec, idx.classroom),
		})
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("時間割データがCSVから見つかりませんでした")
	}
	return rows, nil
}

// MergeIntensiveRows combines the main timetable CSV's rows with the
// intensive (集中講義) CSV's rows. A course that meets on specific calendar
// dates can also show up in the main export (usually under 時間割外), so the
// main row is dropped in favor of the intensive one to avoid duplicates.
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

func field(rec []string, i int) string {
	if i < 0 || i >= len(rec) {
		return ""
	}
	return strings.TrimSpace(rec[i])
}

func parseDay(s string) *int16 {
	if s == "" || s == unscheduledMarker {
		return nil
	}
	n, ok := dayNumbers[s]
	if !ok {
		return nil
	}
	v := n
	return &v
}

func parsePeriod(s string) *int16 {
	digits := periodDigitsRe.FindString(s)
	if digits == "" {
		return nil
	}
	v, err := strconv.ParseInt(digits, 10, 16)
	if err != nil {
		return nil
	}
	n := int16(v)
	return &n
}

// decodeJapaneseCSV reads r fully and returns its content as UTF-8 bytes.
// University-issued CSV exports commonly use Shift-JIS, but the app also
// accepts plain UTF-8 (with or without a BOM) so an admin can re-save the
// file in either encoding.
func decodeJapaneseCSV(r io.Reader) ([]byte, error) {
	raw, err := io.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("CSVの読み込みに失敗しました: %w", err)
	}
	raw = bytes.TrimPrefix(raw, []byte{0xEF, 0xBB, 0xBF})
	if utf8.Valid(raw) {
		return raw, nil
	}

	decoded, err := japanese.ShiftJIS.NewDecoder().Bytes(raw)
	if err != nil {
		return nil, fmt.Errorf("CSVの文字コードを判別できませんでした（UTF-8またはShift-JISに対応しています）: %w", err)
	}
	return decoded, nil
}
