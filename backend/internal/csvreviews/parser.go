// Package csvreviews parses the admin's "口コミ一括追加" CSV: one row per
// student response, matched against an offering already on file for a
// chosen (category, academic_year, term) scope (imported earlier via the
// admin timetable CSV importer or manual entry — see
// internal/handlers/review_import.go for the matching logic).
//
// Unlike internal/csvtimetable, this format has no 年度/学期 columns: the
// scope is chosen by the admin in the UI, not read from the file.
package csvreviews

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"regexp"
	"strconv"
	"strings"

	"github.com/hageruto/kurobasu/internal/csvtimetable"
)

// ParsedRow is one student response extracted from the bulk-add CSV.
type ParsedRow struct {
	// Day: 1=月 .. 5=金. nil when blank or unrecognized.
	Day *int16
	// Period: 1.. nil when blank or unrecognized.
	Period *int16
	// Format: 講義・実習等の実施形態 (e.g. 講義, 演習, 実習) — free text,
	// there's no dedicated column for it on Offering, so it's folded into an
	// "others" review row by the caller.
	Format      string
	CourseName  string
	Instructor  string
	Criteria    string
	TestBringIn string
	Pros        string
	Cons        string
	// AdviceForJuniors: 試験やレポート、発表に関して、後輩に伝えたいことはありますか？
	AdviceForJuniors string
	// Score: 授業のおすすめ度を教えてください, parsed as 1-5. nil when blank
	// or not a recognizable 1-5 score.
	Score     *int16
	OtherInfo string
}

var dayNumbers = map[string]int16{"月": 1, "火": 2, "水": 3, "木": 4, "金": 5, "土": 6, "日": 7}

var scoreDigitsRe = regexp.MustCompile(`[0-9]+`)

type columnIndex struct {
	day, period, format, courseName, instructor int
	criteria, testBringIn, pros, cons           int
	advice, score, otherInfo                    int
}

// Parse reads the bulk-add CSV and returns every row that has a 講義名.
func Parse(r io.Reader) ([]ParsedRow, error) {
	decoded, err := csvtimetable.DecodeJapaneseCSV(r)
	if err != nil {
		return nil, err
	}

	cr := csv.NewReader(bytes.NewReader(decoded))
	cr.FieldsPerRecord = -1
	cr.TrimLeadingSpace = true
	cr.LazyQuotes = true
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

	var rows []ParsedRow
	for _, rec := range records[1:] {
		courseName := field(rec, idx.courseName)
		if courseName == "" {
			continue
		}

		rows = append(rows, ParsedRow{
			Day:              parseDay(field(rec, idx.day)),
			Period:           parsePeriod(field(rec, idx.period)),
			Format:           field(rec, idx.format),
			CourseName:       courseName,
			Instructor:       field(rec, idx.instructor),
			Criteria:         field(rec, idx.criteria),
			TestBringIn:      field(rec, idx.testBringIn),
			Pros:             field(rec, idx.pros),
			Cons:             field(rec, idx.cons),
			AdviceForJuniors: field(rec, idx.advice),
			Score:            parseScore(field(rec, idx.score)),
			OtherInfo:        field(rec, idx.otherInfo),
		})
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("口コミデータがCSVから見つかりませんでした")
	}
	return rows, nil
}

// buildColumnIndex maps the CSV header to column positions by name, so the
// parser tolerates column reordering as long as the header labels match.
func buildColumnIndex(header []string) (columnIndex, error) {
	idx := columnIndex{
		day: -1, period: -1, format: -1, courseName: -1, instructor: -1,
		criteria: -1, testBringIn: -1, pros: -1, cons: -1,
		advice: -1, score: -1, otherInfo: -1,
	}

	for i, col := range header {
		switch {
		case matchesHeader(col, "曜日"):
			idx.day = i
		case matchesHeader(col, "時限"):
			idx.period = i
		case matchesHeader(col, "講義・実習等の実施形態"):
			idx.format = i
		case matchesHeader(col, "講義名"):
			idx.courseName = i
		case strings.HasPrefix(strings.TrimSpace(col), "担当教員名"):
			idx.instructor = i
		case matchesHeader(col, "評価基準"):
			idx.criteria = i
		case matchesHeader(col, "テスト持ち込み"):
			idx.testBringIn = i
		case matchesHeader(col, "授業の良かったところは？"):
			idx.pros = i
		case matchesHeader(col, "授業の悪かったところは？"):
			idx.cons = i
		case matchesHeader(col, "試験やレポート、発表に関して、後輩に伝えたいことはありますか？"):
			idx.advice = i
		case matchesHeader(col, "授業のおすすめ度を教えてください"):
			idx.score = i
		case matchesHeader(col, "その他情報があれば教えてください"):
			idx.otherInfo = i
		}
	}

	if idx.courseName < 0 {
		return idx, fmt.Errorf("CSVのヘッダーに必要な列がありません: 講義名")
	}
	return idx, nil
}

func matchesHeader(col, want string) bool {
	return strings.TrimSpace(col) == want
}

func field(rec []string, i int) string {
	if i < 0 || i >= len(rec) {
		return ""
	}
	return strings.TrimSpace(rec[i])
}

func parseDay(s string) *int16 {
	n, ok := dayNumbers[s]
	if !ok {
		return nil
	}
	v := n
	return &v
}

func parsePeriod(s string) *int16 {
	digits := scoreDigitsRe.FindString(s)
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

// parseScore extracts a 1-5 recommendation score from a free-text answer
// (e.g. "5", "5 - とても良い"). Returns nil if no 1-5 value is found.
func parseScore(s string) *int16 {
	digits := scoreDigitsRe.FindString(s)
	if digits == "" {
		return nil
	}
	v, err := strconv.ParseInt(digits, 10, 16)
	if err != nil || v < 1 || v > 5 {
		return nil
	}
	n := int16(v)
	return &n
}
