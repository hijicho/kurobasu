package repository

import (
	"fmt"
	"strings"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// RatingImportRepository handles CSV-imported おすすめ度 draft batches and
// publishing them into subject_ratings, which the public course pages
// (via SubjectRatingRepository) read the AA/A/B/C rank from.
type RatingImportRepository struct{}

// CreateBatch inserts a new draft batch together with its parsed rows.
func (r *RatingImportRepository) CreateBatch(batch *models.RatingImportBatch) error {
	return config.DB.Create(batch).Error
}

// ListBatches returns batches, most recent first, without rows.
func (r *RatingImportRepository) ListBatches() ([]models.RatingImportBatch, error) {
	var batches []models.RatingImportBatch
	err := config.DB.Order("created_at DESC").Find(&batches).Error
	return batches, err
}

// GetBatchByID returns a single batch with its rows in sheet order.
func (r *RatingImportRepository) GetBatchByID(id int64) (*models.RatingImportBatch, error) {
	var batch models.RatingImportBatch
	err := config.DB.
		Preload("Rows", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC, import_row_id ASC")
		}).
		First(&batch, id).Error
	if err != nil {
		return nil, err
	}
	return &batch, nil
}

// ReplaceRows atomically replaces every row of a batch (used when the admin
// saves edits from the editor screen).
func (r *RatingImportRepository) ReplaceRows(batchID int64, rows []models.RatingImportRow) error {
	return config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("import_batch_id = ?", batchID).Delete(&models.RatingImportRow{}).Error; err != nil {
			return err
		}
		if len(rows) == 0 {
			return nil
		}
		for i := range rows {
			rows[i].ImportRowID = 0
			rows[i].ImportBatchID = batchID
			rows[i].SortOrder = i
		}
		return tx.Create(&rows).Error
	})
}

// DeleteBatch removes a draft batch and its rows. Published batches should
// not normally be deleted (the ranks they produced live on independently in
// subject_ratings), but this isn't enforced here — callers decide.
func (r *RatingImportRepository) DeleteBatch(id int64) error {
	return config.DB.Delete(&models.RatingImportBatch{}, id).Error
}

// PublishBatch averages every row's score per course title, resolves (or
// creates) each title's Subject within the 総合教養科目 category, and
// upserts the resulting AA/A/B/C rank into subject_ratings. It then marks
// the batch published.
func (r *RatingImportRepository) PublishBatch(batchID int64) (*models.RatingImportBatch, error) {
	var published models.RatingImportBatch

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var batch models.RatingImportBatch
		if err := tx.
			Preload("Rows", func(db *gorm.DB) *gorm.DB {
				return db.Order("sort_order ASC, import_row_id ASC")
			}).
			First(&batch, batchID).Error; err != nil {
			return err
		}

		var category models.Category
		if err := tx.Where("slug = ?", "general-education").First(&category).Error; err != nil {
			return fmt.Errorf("general-education category not found: %w", err)
		}

		type aggregate struct {
			sum   float64
			count int
		}
		aggByTitle := map[string]*aggregate{}
		var orderedTitles []string
		for _, row := range batch.Rows {
			title := strings.TrimSpace(row.CourseName)
			if title == "" {
				continue
			}
			a, ok := aggByTitle[title]
			if !ok {
				a = &aggregate{}
				aggByTitle[title] = a
				orderedTitles = append(orderedTitles, title)
			}
			a.sum += row.Score
			a.count++
		}

		if len(orderedTitles) > 0 {
			// Resolve every title's subject in bulk (one SELECT for existing
			// titles, one INSERT for missing ones), same approach as the
			// timetable import publish path.
			subjectCache := map[string]int64{}
			var existing []models.Subject
			if err := tx.Where("category_id = ? AND title IN ?", category.CategoryID, orderedTitles).
				Find(&existing).Error; err != nil {
				return err
			}
			for _, s := range existing {
				subjectCache[s.Title] = s.SubjectID
			}

			var newSubjects []models.Subject
			for _, title := range orderedTitles {
				if _, ok := subjectCache[title]; !ok {
					newSubjects = append(newSubjects, models.Subject{CategoryID: category.CategoryID, Title: title})
				}
			}
			if len(newSubjects) > 0 {
				if err := tx.Create(&newSubjects).Error; err != nil {
					return err
				}
				for _, s := range newSubjects {
					subjectCache[s.Title] = s.SubjectID
				}
			}

			now := time.Now()
			ratings := make([]models.SubjectRating, 0, len(orderedTitles))
			for _, title := range orderedTitles {
				a := aggByTitle[title]
				avg := a.sum / float64(a.count)
				ratings = append(ratings, models.SubjectRating{
					SubjectID:    subjectCache[title],
					AverageScore: avg,
					SampleCount:  a.count,
					RankLabel:    rankForScore(avg),
					UpdatedAt:    now,
				})
			}
			if err := tx.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "subject_id"}},
				DoUpdates: clause.AssignmentColumns([]string{"average_score", "sample_count", "rank_label", "updated_at"}),
			}).Create(&ratings).Error; err != nil {
				return err
			}
		}

		now := time.Now()
		if err := tx.Model(&batch).Updates(map[string]interface{}{
			"status":       "published",
			"published_at": now,
		}).Error; err != nil {
			return err
		}

		batch.Status = "published"
		batch.PublishedAt = &now
		batch.UpdatedAt = now
		published = batch
		return nil
	})
	if err != nil {
		return nil, err
	}
	return &published, nil
}

// rankForScore maps an average おすすめ度 score to its AA/A/B/C rank.
//
//	AA: 4点以上5点以下
//	A : 2点以上4点未満
//	B : 1点以上2点未満
//	C : 1点未満（0点含む）
func rankForScore(avg float64) string {
	switch {
	case avg >= 4:
		return "AA"
	case avg >= 2:
		return "A"
	case avg >= 1:
		return "B"
	default:
		return "C"
	}
}
