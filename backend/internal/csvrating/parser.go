// Package csvrating extracts おすすめ度 (recommendation score) survey rows
// from the CSV an admin uploads on the 評価 admin screen. Each row is one
// respondent's answer for one course: 科目名 (course title) and おすすめ度
// (a 0-5 score). The same course title appears on many rows; the caller
// averages them per title before ranking (see internal/repository/rating_import.go).
package csvrating

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"
	"unicode/utf8"

	"golang.org/x/text/encoding/japanese"
)

// ParsedRow is a single respondent's おすすめ度 answer for one course.
type ParsedRow struct {
	CourseName string
	Score      float64
}

type columnIndex struct {
	courseName, score int
}

// buildColumnIndex maps the CSV header to column positions by name, so the
// parser tolerates column reordering as long as the header labels match.
func buildColumnIndex(header []string) (columnIndex, error) {
	idx := columnIndex{courseName: -1, score: -1}
	targets := map[string]*int{
		"科目名":   &idx.courseName,
		"おすすめ度": &idx.score,
	}
	for i, col := range header {
		if p, ok := targets[strings.TrimSpace(col)]; ok {
			*p = i
		}
	}

	var missing []string
	if idx.courseName < 0 {
		missing = append(missing, "科目名")
	}
	if idx.score < 0 {
		missing = append(missing, "おすすめ度")
	}
	if len(missing) > 0 {
		return idx, fmt.Errorf("CSVのヘッダーに必要な列がありません: %s", strings.Join(missing, ", "))
	}
	return idx, nil
}

// Parse reads an おすすめ度 CSV and returns every valid row (rows missing a
// course name or with an unparsable score are skipped).
func Parse(r io.Reader) ([]ParsedRow, error) {
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

	var rows []ParsedRow
	for _, rec := range records[1:] {
		courseName := field(rec, idx.courseName)
		scoreStr := field(rec, idx.score)
		if courseName == "" || scoreStr == "" {
			continue
		}
		score, err := strconv.ParseFloat(scoreStr, 64)
		if err != nil {
			continue
		}
		rows = append(rows, ParsedRow{CourseName: courseName, Score: score})
	}

	if len(rows) == 0 {
		return nil, fmt.Errorf("評価データがCSVから見つかりませんでした")
	}
	return rows, nil
}

func field(rec []string, i int) string {
	if i < 0 || i >= len(rec) {
		return ""
	}
	return strings.TrimSpace(rec[i])
}

// decodeJapaneseCSV reads r fully and returns its content as UTF-8 bytes.
// Accepts UTF-8 (with or without a BOM) or Shift-JIS.
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
