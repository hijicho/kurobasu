// Command import_reviews is a one-off CLI that loads a course evaluation
// survey export (Google Forms-style CSV) into the existing user_reviews
// table, matching each response to the offering already on file (imported
// earlier via the admin timetable CSV importer). -category selects which
// category's offerings to match against (default: foundation-list).
//
// Imported reviews land as pending by default, same as a normal user
// submission, so they go through the existing admin review queue before
// showing up publicly — pass -approve to skip that and publish immediately.
//
// The form asks about one course per response, but which column group holds
// the answer depends on a department branch the respondent took earlier in
// the form (講義名/授業名/講義名 2/講義名 3/講義名 4, each with its own
// 担当教員名・評価基準・テスト持ち込み・良かった/悪かったところ・その他
// columns) — see colGroups below. A response's course/instructor name is
// free text and sometimes carries registration-system noise (e.g.
// "線形代数2A /選:工<建・都>_森"), so matching first tries an exact
// whitespace-normalized match, then the same string with trailing
// "/選:..." and "(...)" annotations stripped, then a small Levenshtein
// fallback — disambiguating by instructor when a title matches multiple
// offerings, exactly as cmd/import_ratings does. Rows that can't be matched
// confidently are skipped and listed in the summary rather than guessed.
//
// Each matched response can contribute up to five review rows (pros, cons,
// an 評価基準 note, a テスト持ち込み note, and a free-text その他 note),
// inserted as approved user_reviews so they show up on the course detail
// page immediately.
//
// Usage: go run ./cmd/import_reviews [-dry-run] [-category=slug] [-approve] <csv-path>
package main

import (
	"bytes"
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"os"
	"regexp"
	"sort"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/joho/godotenv"
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"github.com/lib/pq"
	"golang.org/x/text/encoding/japanese"
)

const defaultCategorySlug = "foundation-list"

// colGroup is one repeated block of course-detail columns in the survey
// export. score is -1 for every group but the first: the 「おすすめ度」
// question only appears once in the form.
type colGroup struct {
	title, instructor, criteria, testBringIn, pros, cons, others, score int
}

var colGroups = []colGroup{
	{title: 5, instructor: 6, criteria: 7, testBringIn: 8, pros: 9, cons: 10, others: 12, score: 11},
	{title: 16, instructor: 17, criteria: 18, testBringIn: 19, pros: 20, cons: 21, others: 22, score: -1},
	{title: 27, instructor: 28, criteria: 29, testBringIn: 30, pros: 31, cons: 32, others: 33, score: -1},
	{title: 38, instructor: 39, criteria: 40, testBringIn: 41, pros: 42, cons: 43, others: 44, score: -1},
	{title: 48, instructor: 49, criteria: 50, testBringIn: 51, pros: 52, cons: 53, others: 54, score: -1},
}

// teacherLabelRe extracts names out of the "担当教員: 小川　拓水 [教員] 担当教員: ..."
// format some omnibus-course rows use instead of a plain name.
var teacherLabelRe = regexp.MustCompile(`担当教員[:：]\s*([^\[\]]+?)\s*[\[［]`)

// trailingAnnotationRe strips a trailing parenthetical annotation such as
// " (電物)" that isn't part of the actual course title.
var trailingAnnotationRe = regexp.MustCompile(`[（(][^（）()]*[）)]\s*$`)

type offeringCandidate struct {
	OfferingID   int64
	Title        string
	NormTitle    string
	Instructor   string
	NormInstr    string
	Term         string
	AcademicYear int16
}

type reviewDraft struct {
	reviewType models.UserReviewType
	comment    string
}

func main() {
	dryRun := flag.Bool("dry-run", false, "report matches without writing to the database")
	category := flag.String("category", defaultCategorySlug, "category slug to match offerings against")
	approve := flag.Bool("approve", false, "insert reviews as already-approved (default: pending, for admin review before they go public)")
	flag.Parse()
	args := flag.Args()
	if len(args) < 1 {
		log.Fatal("usage: import_reviews [-dry-run] [-category=slug] [-approve] <csv-path>")
	}
	csvPath := args[0]

	status := models.UserReviewStatusPending
	if *approve {
		status = models.UserReviewStatusApproved
	}

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		envOr("DB_HOST", "localhost"), envOr("DB_PORT", "5432"), envOr("DB_USER", "postgres"),
		envOr("DB_PASSWORD", "postgres"), envOr("DB_NAME", "kurobasu"), envOr("DB_SSLMODE", "disable"))
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	candidates, err := loadOfferingCandidates(*category)
	if err != nil {
		log.Fatalf("Failed to load offerings: %v", err)
	}
	byTitle := map[string][]offeringCandidate{}
	var titles []string
	for _, c := range candidates {
		if _, ok := byTitle[c.NormTitle]; !ok {
			titles = append(titles, c.NormTitle)
		}
		byTitle[c.NormTitle] = append(byTitle[c.NormTitle], c)
	}
	sort.Strings(titles)

	rows, err := readCSV(csvPath)
	if err != nil {
		log.Fatalf("Failed to read CSV: %v", err)
	}
	if len(rows) < 2 {
		log.Fatal("CSV has no data rows")
	}

	type unmatchedKey struct{ title, instructor string }
	unmatched := map[unmatchedKey]int{}
	var fuzzyNotes []string
	groupsSeen, matchedGroups, insertedRows, skippedEmpty := 0, 0, 0, 0

	for i, rec := range rows[1:] {
		for _, g := range colGroups {
			rawTitle := field(rec, g.title)
			if rawTitle == "" {
				continue
			}
			groupsSeen++

			drafts := buildDrafts(rec, g)
			if len(drafts) == 0 {
				skippedEmpty++
				continue
			}

			rawInstr := field(rec, g.instructor)
			instructor := primaryInstructor(rawInstr)

			chosen, usedFuzzyTitle, matchedByInstructor := matchOffering(rawTitle, instructor, byTitle, titles)
			if chosen == nil {
				unmatched[unmatchedKey{rawTitle, instructor}]++
				continue
			}
			if usedFuzzyTitle && !matchedByInstructor {
				unmatched[unmatchedKey{rawTitle, instructor}]++
				continue
			}
			if usedFuzzyTitle || !matchedByInstructor {
				fuzzyNotes = append(fuzzyNotes, fmt.Sprintf("row %d: %q / %q -> offering_id=%d (%q / %q)%s",
					i+2, rawTitle, instructor, chosen.OfferingID, chosen.Title, chosen.Instructor,
					noteSuffix(usedFuzzyTitle, matchedByInstructor)))
			}
			matchedGroups++

			for _, d := range drafts {
				if !*dryRun {
					review := models.UserReview{
						OfferingID: chosen.OfferingID,
						UserID:     nil,
						Comment:    d.comment,
						Type:       d.reviewType,
						Status:     status,
					}
					if err := config.DB.Create(&review).Error; err != nil {
						log.Printf("row %d: insert failed: %v", i+2, err)
						continue
					}
				}
				insertedRows++
			}
		}
	}

	fmt.Println()
	fmt.Printf("Total data rows: %d\n", len(rows)-1)
	fmt.Printf("Course-answer groups seen: %d\n", groupsSeen)
	fmt.Printf("Skipped (no pros/cons/criteria/testBringIn/others content): %d\n", skippedEmpty)
	fmt.Printf("Matched groups: %d\n", matchedGroups)
	if *dryRun {
		fmt.Printf("Review rows that would be inserted: %d\n", insertedRows)
		fmt.Println("(dry-run: no rows written)")
	} else {
		fmt.Printf("Review rows inserted: %d\n", insertedRows)
	}

	if len(fuzzyNotes) > 0 {
		fmt.Printf("\nFuzzy/instructor-ambiguous matches (%d), please spot-check:\n", len(fuzzyNotes))
		for _, n := range fuzzyNotes {
			fmt.Println("  " + n)
		}
	}

	if len(unmatched) > 0 {
		fmt.Printf("\nUnmatched course/instructor pairs (%d distinct):\n", len(unmatched))
		type kv struct {
			k unmatchedKey
			n int
		}
		var list []kv
		for k, n := range unmatched {
			list = append(list, kv{k, n})
		}
		sort.Slice(list, func(i, j int) bool { return list[i].n > list[j].n })
		for _, e := range list {
			fmt.Printf("  x%-3d %q / %q\n", e.n, e.k.title, e.k.instructor)
		}
	}
}

// buildDrafts turns one course-answer group into the individual review rows
// it should produce. 評価基準 and テスト持ち込み become their own labeled
// "others" rows (rather than being merged into one multi-line comment) since
// the review UI renders each user_reviews row as its own list item without
// preserving line breaks.
func buildDrafts(rec []string, g colGroup) []reviewDraft {
	var drafts []reviewDraft
	if pros := field(rec, g.pros); pros != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypePros, pros})
	}
	if cons := field(rec, g.cons); cons != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeCons, cons})
	}
	if criteria := field(rec, g.criteria); criteria != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeOthers, "評価基準：" + criteria})
	}
	if bringIn := field(rec, g.testBringIn); bringIn != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeOthers, "テスト持ち込み：" + bringIn})
	}
	if others := field(rec, g.others); others != "" {
		drafts = append(drafts, reviewDraft{models.UserReviewTypeOthers, others})
	}
	return drafts
}

// primaryInstructor returns the name to use for instructor matching: the
// field as-is, or the first name pulled out of the
// "担当教員: X [教員] 担当教員: Y [教員] ..." format some omnibus rows use
// (matching loadOfferingCandidates, which likewise only keeps the first
// instructor of a multi-instructor offering).
func primaryInstructor(raw string) string {
	if !strings.Contains(raw, "[教員") && !strings.Contains(raw, "［教員") {
		return raw
	}
	m := teacherLabelRe.FindStringSubmatch(raw)
	if len(m) == 2 && strings.TrimSpace(m[1]) != "" {
		return strings.TrimSpace(m[1])
	}
	return raw
}

// cleanCourseTitle strips registration-system noise some respondents copied
// verbatim from the timetable (e.g. "/選:工<建・都>1_森") or an unrelated
// trailing annotation (e.g. " (電物)"), for use as a fallback match key when
// the raw title doesn't match any offering exactly.
func cleanCourseTitle(s string) string {
	s = strings.TrimSpace(s)
	if idx := strings.IndexAny(s, "/／"); idx > 0 {
		s = s[:idx]
	}
	s = trailingAnnotationRe.ReplaceAllString(s, "")
	return strings.TrimSpace(s)
}

// matchOffering finds the offering a survey answer refers to, trying (in
// order) an exact match on the raw title, an exact match on the cleaned
// title, and finally a fuzzy match on the cleaned title.
func matchOffering(rawTitle, instructor string, byTitle map[string][]offeringCandidate, titles []string) (chosen *offeringCandidate, usedFuzzyTitle, matchedByInstructor bool) {
	if cands, ok := byTitle[normalize(rawTitle)]; ok {
		c, byInstr := disambiguateByInstructor(cands, instructor)
		if c != nil {
			return c, false, byInstr
		}
	}

	cleanNorm := normalize(cleanCourseTitle(rawTitle))
	if cleanNorm != normalize(rawTitle) {
		if cands, ok := byTitle[cleanNorm]; ok {
			c, byInstr := disambiguateByInstructor(cands, instructor)
			if c != nil {
				return c, false, byInstr
			}
		}
	}

	best, distance, unique := bestFuzzyMatch(cleanNorm, titles)
	if !unique || distance > fuzzyThreshold(cleanNorm) {
		return nil, false, false
	}
	c, byInstr := disambiguateByInstructor(byTitle[best], instructor)
	if c == nil {
		return nil, false, false
	}
	return c, true, byInstr
}

func noteSuffix(fuzzyTitle, matchedByInstructor bool) string {
	switch {
	case fuzzyTitle && !matchedByInstructor:
		return " [fuzzy title, no instructor match]"
	case fuzzyTitle:
		return " [fuzzy title]"
	default:
		return " [no instructor match, single candidate]"
	}
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func field(rec []string, i int) string {
	if i < 0 || i >= len(rec) {
		return ""
	}
	return strings.TrimSpace(rec[i])
}

// loadOfferingCandidates loads every offering in the given category as a
// match target.
func loadOfferingCandidates(categorySlug string) ([]offeringCandidate, error) {
	var rows []struct {
		OfferingID      int64
		Title           string
		InstructorNames pq.StringArray `gorm:"type:text[]"`
		Term            string
		AcademicYear    int16
	}
	err := config.DB.Table("offerings o").
		Select("o.offering_id, s.title, o.instructor_names, o.term, o.academic_year").
		Joins("JOIN subjects s ON s.subject_id = o.subject_id").
		Joins("JOIN categories c ON c.category_id = s.category_id").
		Where("c.slug = ?", categorySlug).
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	var out []offeringCandidate
	for _, r := range rows {
		instr := ""
		if len(r.InstructorNames) > 0 {
			instr = r.InstructorNames[0]
		}
		out = append(out, offeringCandidate{
			OfferingID:   r.OfferingID,
			Title:        r.Title,
			NormTitle:    normalize(r.Title),
			Instructor:   instr,
			NormInstr:    normalize(instr),
			Term:         r.Term,
			AcademicYear: r.AcademicYear,
		})
	}
	return out, nil
}

// disambiguateByInstructor picks the offering matching instructor most
// closely among same-title candidates; if only one candidate exists it's
// used even without an instructor match (matchedByInstructor=false in that
// case, so callers can flag it for review).
func disambiguateByInstructor(cands []offeringCandidate, instructor string) (*offeringCandidate, bool) {
	if len(cands) == 1 {
		return &cands[0], normalize(instructor) == cands[0].NormInstr
	}

	normInstr := normalize(instructor)
	var exact []offeringCandidate
	for _, c := range cands {
		if c.NormInstr == normInstr && normInstr != "" {
			exact = append(exact, c)
		}
	}
	if len(exact) == 0 {
		var fuzzy []offeringCandidate
		for _, c := range cands {
			if normInstr != "" && c.NormInstr != "" && levenshtein(normInstr, c.NormInstr) <= 2 {
				fuzzy = append(fuzzy, c)
			}
		}
		exact = fuzzy
	}
	if len(exact) == 0 {
		return nil, false
	}
	if len(exact) == 1 {
		return &exact[0], true
	}
	// Multiple offerings share title+instructor (e.g. spring & fall): prefer fall, else lowest ID.
	sort.Slice(exact, func(i, j int) bool {
		if (exact[i].Term == "fall") != (exact[j].Term == "fall") {
			return exact[i].Term == "fall"
		}
		return exact[i].OfferingID < exact[j].OfferingID
	})
	return &exact[0], true
}

func fuzzyThreshold(s string) int {
	n := utf8.RuneCountInString(s)
	switch {
	case n <= 4:
		return 1
	case n <= 10:
		return 2
	default:
		return 3
	}
}

// bestFuzzyMatch returns the closest title by Levenshtein distance, and
// whether it's unambiguously the best (strictly closer than the runner-up).
func bestFuzzyMatch(target string, titles []string) (string, int, bool) {
	best, second := -1, -1
	bestTitle := ""
	for _, t := range titles {
		d := levenshtein(target, t)
		if best == -1 || d < best {
			second = best
			best, bestTitle = d, t
		} else if d < second || second == -1 {
			second = d
		}
	}
	if best == -1 {
		return "", -1, false
	}
	return bestTitle, best, second == -1 || best < second
}

func normalize(s string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsSpace(r) {
			return -1
		}
		return r
	}, s)
}

func levenshtein(a, b string) int {
	ra, rb := []rune(a), []rune(b)
	la, lb := len(ra), len(rb)
	if la == 0 {
		return lb
	}
	if lb == 0 {
		return la
	}
	prev := make([]int, lb+1)
	curr := make([]int, lb+1)
	for j := 0; j <= lb; j++ {
		prev[j] = j
	}
	for i := 1; i <= la; i++ {
		curr[0] = i
		for j := 1; j <= lb; j++ {
			cost := 1
			if ra[i-1] == rb[j-1] {
				cost = 0
			}
			curr[j] = min3(curr[j-1]+1, prev[j]+1, prev[j-1]+cost)
		}
		prev, curr = curr, prev
	}
	return prev[lb]
}

func min3(a, b, c int) int {
	if b < a {
		a = b
	}
	if c < a {
		a = c
	}
	return a
}

func readCSV(path string) ([][]string, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	raw = bytes.TrimPrefix(raw, []byte{0xEF, 0xBB, 0xBF})
	if !utf8.Valid(raw) {
		decoded, derr := japanese.ShiftJIS.NewDecoder().Bytes(raw)
		if derr != nil {
			return nil, fmt.Errorf("could not decode as UTF-8 or Shift-JIS: %w", derr)
		}
		raw = decoded
	}
	cr := csv.NewReader(bytes.NewReader(raw))
	cr.FieldsPerRecord = -1
	cr.LazyQuotes = true
	return cr.ReadAll()
}
