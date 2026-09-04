// Command fix_instructor_casing is a one-off data-cleanup tool for the
// 外国語科目(英語必修)ー英語教師 (english-native) category: existing
// instructor_names were imported from the university's roster in full-width,
// all-caps Latin (e.g. "ＭＡＴＴ ＢＡＮＨＡＭ"), which reads poorly on the
// site. This folds them to half-width and re-cases any word made entirely
// of uppercase letters to Title Case ("Matt Banham"). Words that already
// carry a lowercase letter (e.g. "McAvoy") are left untouched, since we
// can't recover their intended casing once a name has been flattened to
// all caps.
//
// Usage:
//
//	go run ./cmd/fix_instructor_casing [-dry-run] [-category=english-native]
//
// Run with -dry-run first to review the planned changes; rerun without it
// to write them. Safe to run more than once (a no-op once names are fixed).
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"unicode"

	"github.com/hageruto/kurobasu/config"
	"github.com/joho/godotenv"
	"github.com/lib/pq"
	"golang.org/x/text/width"
)

func main() {
	dryRun := flag.Bool("dry-run", false, "report changes without writing to the database")
	categorySlug := flag.String("category", "english-native", "category slug to fix instructor_names for")
	flag.Parse()

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		requiredEnv("DB_HOST"),
		envWithDefault("DB_PORT", "5432"),
		requiredEnv("DB_USER"),
		requiredEnv("DB_PASSWORD"),
		requiredEnv("DB_NAME"),
		envWithDefault("DB_SSLMODE", "require"),
	)
	if err := config.InitDB(dsn); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	type offeringRow struct {
		OfferingID      int64
		InstructorNames pq.StringArray
	}
	sqlRows, err := config.DB.Raw(`
		SELECT o.offering_id, o.instructor_names
		FROM offerings o
		JOIN subjects s ON s.subject_id = o.subject_id
		JOIN categories c ON c.category_id = s.category_id
		WHERE c.slug = ?
		ORDER BY o.offering_id
	`, *categorySlug).Rows()
	if err != nil {
		log.Fatalf("Failed to load offerings: %v", err)
	}
	var rows []offeringRow
	for sqlRows.Next() {
		var r offeringRow
		if err := sqlRows.Scan(&r.OfferingID, &r.InstructorNames); err != nil {
			sqlRows.Close()
			log.Fatalf("Failed to scan offering row: %v", err)
		}
		rows = append(rows, r)
	}
	sqlRows.Close()
	if len(rows) == 0 {
		log.Fatalf("No offerings found for category %q", *categorySlug)
	}

	changed := 0
	for _, r := range rows {
		newNames := make(pq.StringArray, len(r.InstructorNames))
		rowChanged := false
		for i, name := range r.InstructorNames {
			newName := normalizeInstructorName(name)
			newNames[i] = newName
			if newName != name {
				rowChanged = true
			}
		}
		if !rowChanged {
			continue
		}
		changed++
		fmt.Printf("offering %d: %v -> %v\n", r.OfferingID, []string(r.InstructorNames), []string(newNames))
		if !*dryRun {
			if err := config.DB.Exec(
				`UPDATE offerings SET instructor_names = ? WHERE offering_id = ?`,
				newNames, r.OfferingID,
			).Error; err != nil {
				log.Fatalf("Failed to update offering %d: %v", r.OfferingID, err)
			}
		}
	}

	if *dryRun {
		fmt.Printf("\n%d/%d offerings would change (dry run, nothing written)\n", changed, len(rows))
	} else {
		fmt.Printf("\n%d/%d offerings updated\n", changed, len(rows))
	}
}

// normalizeInstructorName folds full-width Latin characters to half-width,
// then re-cases any word made entirely of uppercase letters to Title Case
// (first letter upper, rest lower — capitalizing again after any internal
// hyphen/apostrophe). Words that already contain a lowercase letter are
// left untouched, and non-Latin words (e.g. kanji) pass through unchanged
// since they have no case to fold.
func normalizeInstructorName(name string) string {
	folded := width.Fold.String(name)
	words := strings.Fields(folded)
	for i, word := range words {
		words[i] = titleCaseIfAllUpper(word)
	}
	return strings.Join(words, " ")
}

func titleCaseIfAllUpper(word string) string {
	hasLower := false
	hasLetter := false
	for _, r := range word {
		if unicode.IsLower(r) {
			hasLower = true
			break
		}
		if unicode.IsLetter(r) {
			hasLetter = true
		}
	}
	if hasLower || !hasLetter {
		return word
	}

	var b strings.Builder
	prevIsLetter := false
	for _, r := range word {
		if unicode.IsLetter(r) {
			if prevIsLetter {
				b.WriteRune(unicode.ToLower(r))
			} else {
				b.WriteRune(unicode.ToUpper(r))
			}
			prevIsLetter = true
		} else {
			b.WriteRune(r)
			prevIsLetter = false
		}
	}
	return b.String()
}

func requiredEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("%s is required", key)
	}
	return value
}

func envWithDefault(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
