package csvtimetable

import (
	"strings"
	"testing"

	"golang.org/x/text/encoding/japanese"
)

const sampleCSV = `年度,学期,曜日,時限,科目名,担当教員,授業コード,講義室
2026年度,後期,月,2限,数学への招待,山口 智,1GAC002301,講堂
2026年度,後期,火,3限,物理学への招待,石丸 秀樹,1GAC003302,遠隔授業（定期試験は対面） / 403大教室
2026年度,前期,月,1限,春学期の科目,春田 太郎,1GAA000101,401大教室
2026年度,後期,時間割外,,日本国憲法,松本 直信,1GAB001302,遠隔授業
`

func TestParseFiltersByTerm(t *testing.T) {
	rows, err := Parse(strings.NewReader(sampleCSV), "fall")
	if err != nil {
		t.Fatalf("Parse returned error: %v", err)
	}
	// 3 fall rows expected (2 scheduled + 1 unscheduled); the spring row is excluded.
	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d: %+v", len(rows), rows)
	}
	for _, row := range rows {
		if row.CourseCode == "1GAA000101" {
			t.Fatalf("spring-term row leaked into fall results: %+v", row)
		}
	}
}

func TestParseScheduledRow(t *testing.T) {
	rows, err := Parse(strings.NewReader(sampleCSV), "fall")
	if err != nil {
		t.Fatalf("Parse returned error: %v", err)
	}
	row := rows[0]
	if row.Day == nil || *row.Day != 1 {
		t.Fatalf("expected Day=1 (月), got %v", row.Day)
	}
	if row.Period == nil || *row.Period != 2 {
		t.Fatalf("expected Period=2, got %v", row.Period)
	}
	if row.CourseName != "数学への招待" || row.Instructor != "山口 智" || row.Classroom != "講堂" {
		t.Fatalf("unexpected row contents: %+v", row)
	}
}

func TestParseUnscheduledRow(t *testing.T) {
	rows, err := Parse(strings.NewReader(sampleCSV), "fall")
	if err != nil {
		t.Fatalf("Parse returned error: %v", err)
	}
	var found bool
	for _, row := range rows {
		if row.CourseCode != "1GAB001302" {
			continue
		}
		found = true
		if row.Day != nil || row.Period != nil {
			t.Fatalf("expected nil Day/Period for 時間割外 row, got day=%v period=%v", row.Day, row.Period)
		}
	}
	if !found {
		t.Fatalf("did not find unscheduled row in results: %+v", rows)
	}
}

func TestParseShiftJIS(t *testing.T) {
	encoded, err := japanese.ShiftJIS.NewEncoder().String(sampleCSV)
	if err != nil {
		t.Fatalf("failed to encode fixture as Shift-JIS: %v", err)
	}
	rows, err := Parse(strings.NewReader(encoded), "fall")
	if err != nil {
		t.Fatalf("Parse returned error for Shift-JIS input: %v", err)
	}
	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d", len(rows))
	}
}

func TestParseMissingRequiredColumn(t *testing.T) {
	csv := "年度,学期,曜日,時限,科目名,担当教員,講義室\n2026年度,後期,月,2限,数学への招待,山口 智,講堂\n"
	_, err := Parse(strings.NewReader(csv), "fall")
	if err == nil {
		t.Fatal("expected error for CSV missing 授業コード column")
	}
}

func TestMergeIntensiveRowsDropsDuplicateCode(t *testing.T) {
	dayVal := int16(1)
	periodVal := int16(2)
	mainRows := []ParsedRow{
		{CourseCode: "1GAJ003301", CourseName: "国際活動とキャリア", Day: &dayVal, Period: &periodVal},
		{CourseCode: "1GAC002301", CourseName: "数学への招待", Day: &dayVal, Period: &periodVal},
	}
	intensiveRows := []ParsedRow{
		{CourseCode: "1GAJ003301", CourseName: "国際活動とキャリア（集中）"},
	}

	merged := MergeIntensiveRows(mainRows, intensiveRows)
	if len(merged) != 2 {
		t.Fatalf("expected 2 merged rows, got %d: %+v", len(merged), merged)
	}
	for _, row := range merged {
		if row.CourseCode == "1GAJ003301" && row.CourseName != "国際活動とキャリア（集中）" {
			t.Fatalf("expected intensive row to win over main row, got %+v", row)
		}
	}
}
