package pdftimetable

import "testing"

// Literal excerpt from Page.GetPlainText() on the real 2026年度前期
// 集中講義日程 PDF: title and instructor share no delimiter at all (unlike
// the main timetable, which at least has "_<campus>" to anchor on).
const intensiveSectionFixture = "授業コード科目名担当教員期間教室備考" +
	"1GAH011301植物と人間厚井　聡8/17(月)、8/19(水)、8/26(水)各日１限～5限植物園" +
	"1GAH013201工学研究の最先端小西　啓治8/6（木）、8/7（金）、8/10 （月）各日１限～5限中百舌鳥A5-大教室" +
	"1GAJ014201高年次ゼミナール畑野　快8/17(月) 2限~5限8/18(火) 2限~5限森之宮キャンパス611小教室"

func TestParseIntensiveSection(t *testing.T) {
	rows := parseIntensiveSection(intensiveSectionFixture)
	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d: %+v", len(rows), rows)
	}

	cases := []struct {
		code, name, instructor string
	}{
		{"1GAH011301", "植物と人間", "厚井　聡"},
		{"1GAH013201", "工学研究の最先端", "小西　啓治"},
		{"1GAJ014201", "高年次ゼミナール", "畑野　快"},
	}
	for i, c := range cases {
		if rows[i].CourseCode != c.code {
			t.Errorf("row%d code = %q, want %q", i, rows[i].CourseCode, c.code)
		}
		if rows[i].CourseName != c.name {
			t.Errorf("row%d name = %q, want %q", i, rows[i].CourseName, c.name)
		}
		if rows[i].Instructor != c.instructor {
			t.Errorf("row%d instructor = %q, want %q", i, rows[i].Instructor, c.instructor)
		}
		if rows[i].Day != nil || rows[i].Period != nil {
			t.Errorf("row%d should have nil day/period (集中講義 has no weekly slot), got day=%v period=%v", i, rows[i].Day, rows[i].Period)
		}
		if rows[i].Note == "" {
			t.Errorf("row%d note (schedule/room) should not be empty", i)
		}
	}

	if rows[0].Note != "8/17(月)、8/19(水)、8/26(水)各日１限～5限 植物園" {
		t.Errorf("row0 note = %q", rows[0].Note)
	}
}

func TestSplitIntensiveTitleInstructor(t *testing.T) {
	title, instructor, schedule := splitIntensiveTitleInstructor("高年次ゼミナール畑野　快8/17(月) 2限~5限")
	if title != "高年次ゼミナール" {
		t.Errorf("title = %q", title)
	}
	if instructor != "畑野　快" {
		t.Errorf("instructor = %q", instructor)
	}
	if schedule != "8/17(月) 2限~5限" {
		t.Errorf("schedule = %q", schedule)
	}
}

func TestMergeIntensiveRows(t *testing.T) {
	d, p := day(1), period(5)
	mainRows := []ParsedRow{
		{CourseCode: "1GAH011301", CourseName: "植物と人間（主表）", Day: d, Period: p},
		{CourseCode: "1GAF028201", CourseName: "スポーツと社会", Day: d, Period: p},
	}
	intensiveRows := []ParsedRow{
		{CourseCode: "1GAH011301", CourseName: "植物と人間", Note: "8/17(月) 各日１限～5限 植物園"},
	}

	merged := MergeIntensiveRows(mainRows, intensiveRows)
	if len(merged) != 2 {
		t.Fatalf("expected 2 rows (main dup dropped + intensive kept), got %d: %+v", len(merged), merged)
	}

	var sawIntensive, sawUnrelated bool
	for _, row := range merged {
		if row.CourseCode == "1GAH011301" {
			sawIntensive = true
			if row.Day != nil {
				t.Errorf("1GAH011301 should keep the intensive (unscheduled) version, got day=%v", row.Day)
			}
			if row.Note == "" {
				t.Errorf("1GAH011301 should keep its schedule note")
			}
		}
		if row.CourseCode == "1GAF028201" {
			sawUnrelated = true
		}
	}
	if !sawIntensive {
		t.Error("1GAH011301 missing from merged rows")
	}
	if !sawUnrelated {
		t.Error("unrelated main-only row 1GAF028201 should be kept")
	}
}
