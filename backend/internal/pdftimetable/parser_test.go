package pdftimetable

import "testing"

func day(n int16) *int16    { return &n }
func period(n int16) *int16 { return &n }

// Row texts below are literal output captured from
// pdf.Page.GetTextByRow() against the real 2026年度 前期 総合教養科目
// timetable PDF, so the parser is verified against the source format's
// actual quirks rather than idealized input.
func TestParseRowTexts_CleanRows(t *testing.T) {
	rows := parseRowTexts([]string{
		"月",
		"1限",
		"1GAF028201スポーツと社会 /全_森中山　健401大教室抽選",
		"1GAA003301日本史の見方 /全_森磐下　徹403大教室抽選",
		"2限",
		"1GAG016301日本の近代文学 /全_森奥野　久美子516大教室抽選",
	})

	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d: %+v", len(rows), rows)
	}

	if rows[0].CourseCode != "1GAF028201" || *rows[0].Day != 1 || *rows[0].Period != 1 {
		t.Errorf("row0 code/day/period mismatch: %+v", rows[0])
	}
	if rows[0].Instructor != "中山　健" {
		t.Errorf("row0 instructor = %q, want 中山　健", rows[0].Instructor)
	}
	if rows[0].Classroom != "401大教室" {
		t.Errorf("row0 classroom = %q, want 401大教室", rows[0].Classroom)
	}
	if rows[0].Note != "抽選" {
		t.Errorf("row0 note = %q, want 抽選", rows[0].Note)
	}

	if rows[1].CourseCode != "1GAA003301" || *rows[1].Day != 1 || *rows[1].Period != 1 {
		t.Errorf("row1 code/day/period mismatch: %+v", rows[1])
	}
	if rows[2].CourseCode != "1GAG016301" || *rows[2].Period != 2 {
		t.Errorf("row2 code/period mismatch: %+v", rows[2])
	}
}

func TestParseRowTexts_DayMarkerCenteredMidBlock(t *testing.T) {
	// The 曜日 cell is vertically centered within its rowspan, so "月"
	// arrives *after* several course rows that visually belong to it.
	rows := parseRowTexts([]string{
		"1限",
		"1GAF028201スポーツと社会 /全_森中山　健401大教室抽選",
		"2限",
		"1GAG016301日本の近代文学 /全_森奥野　久美子516大教室抽選",
		"月",
		"1GAG024301アーツマネジメント /全_森菅原　真弓303中教室抽選",
	})

	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d", len(rows))
	}
	for i, r := range rows {
		if r.Day == nil || *r.Day != 1 {
			t.Errorf("row %d: expected day=月(1) backfilled, got %v", i, r.Day)
		}
	}
	if *rows[0].Period != 1 || *rows[1].Period != 2 || *rows[2].Period != 2 {
		t.Errorf("period mismatch: %v %v %v", rows[0].Period, rows[1].Period, rows[2].Period)
	}
}

func TestParseRowTexts_DayPeriodCombinedPrefix(t *testing.T) {
	rows := parseRowTexts([]string{
		"水3限1GAF030301観光研究入門 /全_森天野　景太402大教室抽選",
	})
	if len(rows) != 1 {
		t.Fatalf("expected 1 row, got %d", len(rows))
	}
	if *rows[0].Day != 3 || *rows[0].Period != 3 {
		t.Errorf("expected 水(3)/3限, got day=%v period=%v", *rows[0].Day, *rows[0].Period)
	}
}

func TestParseRowTexts_UnscheduledIntensiveCourse(t *testing.T) {
	rows := parseRowTexts([]string{
		"金5限",
		"1GAJ004201大学でどう学ぶか /全_遠隔山東　功遠隔授業抽選",
		"時間割外",
		"1GAH011301植物と人間 /全_植物園厚井　聡植物園抽選　※1",
	})
	if len(rows) != 2 {
		t.Fatalf("expected 2 rows, got %d", len(rows))
	}
	if rows[0].Day == nil || *rows[0].Day != 5 {
		t.Errorf("row0 should keep 金(5), got %v", rows[0].Day)
	}
	if rows[1].Day != nil || rows[1].Period != nil {
		t.Errorf("時間割外 row should have nil day/period, got day=%v period=%v", rows[1].Day, rows[1].Period)
	}
}

func TestParseRowTexts_OrphanClassroomContinuation(t *testing.T) {
	rows := parseRowTexts([]string{
		"月1限",
		"1GAF018301現代の経営 /全(商以外)_森高橋　信弘遠隔授業（定期試験は対面）抽選",
		"講堂",
	})
	if len(rows) != 1 {
		t.Fatalf("expected 1 row, got %d", len(rows))
	}
	if got := rows[0].Classroom; got != "遠隔授業（定期試験は対面）講堂" {
		t.Errorf("classroom = %q, want continuation appended", got)
	}
}

func TestParseRowTexts_LongOrphanLineIsIgnoredAsFooter(t *testing.T) {
	rows := parseRowTexts([]string{
		"金5限",
		"1GAJ015301キャリアと実践 2 ～問いの実装～/Ⅱ全_森市田　秀樹　後日掲示",
		"※★※　2年次配当科目　※※3年次配当科目※1　植物園開講　※2　中百舌鳥開講　それ以外は森之宮キャンパス開講",
	})
	if len(rows) != 1 {
		t.Fatalf("expected 1 row, got %d", len(rows))
	}
	if len([]rune(rows[0].Classroom)) > maxOrphanContinuationRunes {
		t.Errorf("footer legend text leaked into classroom: %q", rows[0].Classroom)
	}
}

func TestParseRowTexts_GarbledJustifiedTitleStillYieldsUsableFields(t *testing.T) {
	// Real extracted text for 1GAF018301 ("現代の経営 /全(商以外)_森"): the
	// PDF's justified-title glyphs come out of visual order, but the
	// course code, instructor, classroom, and note anchors are untouched.
	rows := parseRowTexts([]string{
		"月1限",
		"1GAF018301/商代の経営 森現全(以外)_高橋　信弘遠隔授業（定期試験は対面）抽選",
	})
	if len(rows) != 1 {
		t.Fatalf("expected 1 row, got %d", len(rows))
	}
	r := rows[0]
	if r.CourseCode != "1GAF018301" {
		t.Errorf("course code = %q", r.CourseCode)
	}
	if r.Instructor != "高橋　信弘" {
		t.Errorf("instructor = %q, want 高橋　信弘 (must survive title scrambling)", r.Instructor)
	}
	if r.Note != "抽選" {
		t.Errorf("note = %q, want 抽選", r.Note)
	}
	if r.CourseName == "" {
		t.Errorf("course name should not be dropped entirely, even if scrambled")
	}
	if r.Raw == "" {
		t.Errorf("raw text must be preserved so admins can fix garbled titles")
	}
}

func TestTermHeaderKeyword(t *testing.T) {
	cases := map[string]string{"spring": "前期", "fall": "後期", "intensive": "", "year": ""}
	for term, want := range cases {
		if got := TermHeaderKeyword(term); got != want {
			t.Errorf("TermHeaderKeyword(%q) = %q, want %q", term, got, want)
		}
	}
}

func TestStripAnnotation(t *testing.T) {
	cases := map[string]string{
		"現代の経営 /全(商以外)_森":        "現代の経営",
		"スポーツと社会 /全_森":           "スポーツと社会",
		"国際活動とキャリア A組/全_森":       "国際活動とキャリア A組",
		"キャリアと実践 2 ～問いの実装～/Ⅱ全_森": "キャリアと実践 2 ～問いの実装～",
		"タイトルのみ":                 "タイトルのみ",
		"":                       "",
		"/商代の経営 森現全(以外)_":        "", // annotation-only garbage with nothing safe before the slash
	}
	for input, want := range cases {
		if got := stripAnnotation(input); got != want {
			t.Errorf("stripAnnotation(%q) = %q, want %q", input, got, want)
		}
	}
}

func TestExtractPlainTextRecords(t *testing.T) {
	// Literal excerpt from Page.GetPlainText() on the real PDF, including
	// the row whose GetTextByRow() extraction comes out scrambled.
	plainText := `【開講：森之宮キャンパス・植物園】
4/17　修正
年次
時限
授業コード
科目名称
代表教員
講義室
備考
遠隔授業（定期試験は対面）
講堂
1GAF028201
スポーツと社会 /全_森
中山　健
401大教室
抽選
1GAJ003301
国際活動とキャリア A組/全_森
松井　利之
後日掲示
通年
1GAF018301
現代の経営 /全(商以外)_森
高橋　信弘
抽選`

	records := extractPlainTextRecords(plainText)

	if got := records["1GAF028201"]; got.Title != "スポーツと社会" || got.Instructor != "中山　健" {
		t.Errorf("1GAF028201 = %+v", got)
	}
	if got := records["1GAJ003301"]; got.Title != "国際活動とキャリア A組" || got.Instructor != "松井　利之" {
		t.Errorf("1GAJ003301 = %+v", got)
	}
	if got := records["1GAF018301"]; got.Title != "現代の経営" || got.Instructor != "高橋　信弘" {
		t.Errorf("1GAF018301 = %+v (this is the row GetTextByRow scrambles; GetPlainText must recover it)", got)
	}
}

func TestParseRowTexts_UnscheduledMarkerGluedToFirstCourseCode(t *testing.T) {
	// Unlike 曜日/時限 markers, "時間割外" doesn't always land on its own row:
	// it can be glued directly onto the first course code of the block.
	rows := parseRowTexts([]string{
		"金5限",
		"1GAH013201工学研究の最先端 /全_中小西　啓治後日掲示　　　※2",
		"時間割外1GAJ003301国際活動とキャリア A組/全_森松井　利之後日掲示通年",
		"1GAJ003302国際活動とキャリア B組/全_森松井　利之後日掲示通年",
	})
	if len(rows) != 3 {
		t.Fatalf("expected 3 rows, got %d: %+v", len(rows), rows)
	}
	if rows[0].Day == nil || *rows[0].Day != 5 || rows[0].Period == nil || *rows[0].Period != 5 {
		t.Errorf("row0 (工学研究の最先端) should stay 金5限, got day=%v period=%v", rows[0].Day, rows[0].Period)
	}
	for i := 1; i < 3; i++ {
		if rows[i].Day != nil || rows[i].Period != nil {
			t.Errorf("row%d (%s) should be unscheduled, got day=%v period=%v", i, rows[i].CourseCode, rows[i].Day, rows[i].Period)
		}
	}
}

func TestExtractPlainTextRecords_RejectsMisplacedRowContent(t *testing.T) {
	// Real excerpt around 1GAC003302 ("物理学への招待"): for this one row,
	// GetPlainText's content-stream order doesn't put the title/instructor
	// right after the code either — "5限" and the next page's header text
	// land there instead. The correction must be rejected so the (correct)
	// GetTextByRow-derived title survives instead of being clobbered.
	plainText := `火
1限
2限
3限
1GAC003302
5限
2026年度　後期　時間割表（総合教養科目）
曜日
1年次
月
2限
1GAD001301
歴史のなかの大阪 /全_森
齊藤　紘子
抽選`

	records := extractPlainTextRecords(plainText)

	if _, ok := records["1GAC003302"]; ok {
		t.Errorf("1GAC003302 should have no correction (candidates are page furniture), got %+v", records["1GAC003302"])
	}
	if got := records["1GAD001301"]; got.Title != "歴史のなかの大阪" || got.Instructor != "齊藤　紘子" {
		t.Errorf("1GAD001301 = %+v, want a clean correction (unaffected by the previous row's misplacement)", got)
	}
}
