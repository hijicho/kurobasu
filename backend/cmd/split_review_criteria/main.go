// Command split_review_criteria is a one-off data-cleanup tool for
// user_reviews imported by cmd/import_reviews: that importer folded the
// survey's 評価基準・テスト持ち込み answers into ordinary "others" rows
// prefixed with "評価基準：" / "テスト持ち込み：", so they showed up mixed
// into the course detail page's 「その他の情報」 list instead of their own
// section.
//
// This finds every "others" row that starts with one of those prefixes,
// strips the prefix, and reclassifies the row as the new "criteria" /
// "test_bring_in" review type so it renders in the dedicated 評価基準・
// テスト持ち込み section instead. No rows are deleted — display-time
// deduplication of repeated answers happens in the API response, not here.
//
// Usage:
//
//	go run ./cmd/split_review_criteria [-dry-run]
//
// Run with -dry-run first to review the planned changes; rerun without it
// to write them. Safe to run more than once (a no-op once rows are split).
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/hageruto/kurobasu/config"
	"github.com/joho/godotenv"
)

const (
	criteriaPrefix    = "評価基準："
	testBringInPrefix = "テスト持ち込み："
)

func main() {
	dryRun := flag.Bool("dry-run", false, "report changes without writing to the database")
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

	type row struct {
		UserReviewID int64
		Comment      string
	}
	var rows []row
	if err := config.DB.Raw(
		`SELECT user_review_id, comment FROM user_reviews WHERE type = 'others' ORDER BY user_review_id`,
	).Scan(&rows).Error; err != nil {
		log.Fatalf("Failed to load reviews: %v", err)
	}

	criteriaCount, testBringInCount := 0, 0
	for _, r := range rows {
		var newType, newComment string
		switch {
		case strings.HasPrefix(r.Comment, criteriaPrefix):
			newType = "criteria"
			newComment = strings.TrimSpace(strings.TrimPrefix(r.Comment, criteriaPrefix))
			criteriaCount++
		case strings.HasPrefix(r.Comment, testBringInPrefix):
			newType = "test_bring_in"
			newComment = strings.TrimSpace(strings.TrimPrefix(r.Comment, testBringInPrefix))
			testBringInCount++
		default:
			continue
		}

		fmt.Printf("review %d: others %q -> %s %q\n", r.UserReviewID, r.Comment, newType, newComment)
		if !*dryRun {
			if err := config.DB.Exec(
				`UPDATE user_reviews SET type = ?, comment = ? WHERE user_review_id = ?`,
				newType, newComment, r.UserReviewID,
			).Error; err != nil {
				log.Fatalf("Failed to update review %d: %v", r.UserReviewID, err)
			}
		}
	}

	total := criteriaCount + testBringInCount
	if *dryRun {
		fmt.Printf("\n%d rows would change (%d -> criteria, %d -> test_bring_in) (dry run, nothing written)\n",
			total, criteriaCount, testBringInCount)
	} else {
		fmt.Printf("\n%d rows updated (%d -> criteria, %d -> test_bring_in)\n", total, criteriaCount, testBringInCount)
	}
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
