// Command import_ratings is a one-off CLI that loads a 総合教養科目 course
// evaluation survey export (Google Forms-style CSV: one response per row,
// free-text 講義名/担当教員名 plus a 1-5 「おすすめ度」 score) into the
// existing offering_ratings table, matching each response to the offering
// already on file (imported earlier via the admin timetable CSV importer).
//
// Survey course/instructor names are free text and inconsistent (spacing,
// kanji variants like 邉/邊), so matching is done on whitespace-normalized
// strings with a small Levenshtein fallback, disambiguating by instructor
// when a title matches multiple offerings. Rows that can't be matched
// confidently are skipped and listed in the summary rather than guessed.
//
// Usage: go run ./cmd/import_ratings [-dry-run] <csv-path>
package main

import (
	"bytes"
	"encoding/csv"
	"flag"
	"fmt"
	"log"
	"os"
	"sort"
	"strconv"
	"strings"
	"unicode"
	"unicode/utf8"

	"github.com/joho/godotenv"
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"github.com/lib/pq"
	"golang.org/x/text/encoding/japanese"
)

// Column indices in the survey export (see header row); only the first of
// up to 5 possible course slots is ever populated in practice.
const (
	colCourseName = 5
	colInstructor = 6
	colScore      = 11
)

type offeringCandidate struct {
	OfferingID   int64
	Title        string
	NormTitle    string
	Instructor   string
	NormInstr    string
	Term         string
	AcademicYear int16
}

func main() {
	dryRun := flag.Bool("dry-run", false, "report matches without writing to the database")
	flag.Parse()
	args := flag.Args()
	if len(args) < 1 {
		log.Fatal("usage: import_ratings <csv-path> [-dry-run]")
	}
	csvPath := args[0]

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		envOr("DB_HOST", "localhost"), envOr("DB_PORT", "5432"), envOr("DB_USER", "postgres"),
		envOr("DB_PASSWORD", "postgres"), envOr("DB_NAME", "kurobasu"), envOr("DB_SSLMODE", "disable"))
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	candidates, err := loadOfferingCandidates()
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
	matched, inserted, skippedNoScore := 0, 0, 0

	for i, rec := range rows[1:] {
		title := field(rec, colCourseName)
		instructor := field(rec, colInstructor)
		scoreStr := field(rec, colScore)
		if title == "" {
			continue
		}
		if scoreStr == "" {
			skippedNoScore++
			continue
		}
		score, err := strconv.Atoi(scoreStr)
		if err != nil || score < 1 || score > 5 {
			skippedNoScore++
			continue
		}

		normTitle := normalize(title)
		cands, ok := byTitle[normTitle]
		usedFuzzyTitle := false
		if !ok {
			if best, distance, unique := bestFuzzyMatch(normTitle, titles); unique && distance <= fuzzyThreshold(normTitle) {
				cands = byTitle[best]
				usedFuzzyTitle = true
			}
		}
		if len(cands) == 0 {
			unmatched[unmatchedKey{title, instructor}]++
			continue
		}

		chosen, matchedByInstructor := disambiguateByInstructor(cands, instructor)
		if chosen == nil {
			unmatched[unmatchedKey{title, instructor}]++
			continue
		}
		// A fuzzy (non-exact) title match is only trustworthy when the
		// instructor also corroborates it — otherwise a short title that
		// merely resembles a different course (e.g. differs by one kanji)
		// can silently attach a review to the wrong course.
		if usedFuzzyTitle && !matchedByInstructor {
			unmatched[unmatchedKey{title, instructor}]++
			continue
		}
		if usedFuzzyTitle || !matchedByInstructor {
			fuzzyNotes = append(fuzzyNotes, fmt.Sprintf("row %d: %q / %q -> offering_id=%d (%q / %q)%s",
				i+2, title, instructor, chosen.OfferingID, chosen.Title, chosen.Instructor,
				noteSuffix(usedFuzzyTitle, matchedByInstructor)))
		}
		matched++

		if !*dryRun {
			rating := models.OfferingRating{
				OfferingID: chosen.OfferingID,
				UserID:     nil,
				VoterKey:   fmt.Sprintf("csvimport:%s:%d", csvBase(csvPath), i),
				Score:      int16(score),
			}
			if err := config.DB.Create(&rating).Error; err != nil {
				log.Printf("row %d: insert failed: %v", i+2, err)
				continue
			}
		}
		inserted++
	}

	fmt.Println()
	fmt.Printf("Total data rows: %d\n", len(rows)-1)
	fmt.Printf("Skipped (no score): %d\n", skippedNoScore)
	fmt.Printf("Matched: %d\n", matched)
	if *dryRun {
		fmt.Println("(dry-run: no rows written)")
	} else {
		fmt.Printf("Inserted: %d\n", inserted)
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

func csvBase(path string) string {
	base := path
	if idx := strings.LastIndexAny(base, "/\\"); idx >= 0 {
		base = base[idx+1:]
	}
	return base
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

// loadOfferingCandidates loads every 総合教養科目 offering as a match target.
func loadOfferingCandidates() ([]offeringCandidate, error) {
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
		Where("c.slug = ?", "general-education").
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
