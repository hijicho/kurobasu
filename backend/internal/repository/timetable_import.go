package repository

import (
	"fmt"
	"strings"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

// TimetableImportRepository handles PDF-imported timetable draft batches and
// publishing them into the live categories/subjects/offerings/meetings
// tables that the public course pages read from.
type TimetableImportRepository struct{}

// CreateBatch inserts a new draft batch together with its parsed rows.
func (r *TimetableImportRepository) CreateBatch(batch *models.TimetableImportBatch) error {
	return config.DB.Create(batch).Error
}

// ListBatches returns batches for a category, most recent first, without rows
// (used for the admin "past uploads" list).
func (r *TimetableImportRepository) ListBatches(categorySlug string) ([]models.TimetableImportBatch, error) {
	var batches []models.TimetableImportBatch
	err := config.DB.
		Where("category_slug = ?", categorySlug).
		Order("created_at DESC").
		Find(&batches).Error
	return batches, err
}

// GetBatchByID returns a single batch with its rows in sheet order.
func (r *TimetableImportRepository) GetBatchByID(id int64) (*models.TimetableImportBatch, error) {
	var batch models.TimetableImportBatch
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
// saves edits from the spreadsheet-style editor).
func (r *TimetableImportRepository) ReplaceRows(batchID int64, rows []models.TimetableImportRow) error {
	return config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("import_batch_id = ?", batchID).Delete(&models.TimetableImportRow{}).Error; err != nil {
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

// UpdateSheetURL stores the (possibly newly created) editable-sheet link for
// a batch.
func (r *TimetableImportRepository) UpdateSheetURL(batchID int64, url string) error {
	return config.DB.Model(&models.TimetableImportBatch{}).
		Where("import_batch_id = ?", batchID).
		Update("sheet_url", url).Error
}

// DeleteBatch removes a draft batch and its rows. Published batches should
// not normally be deleted (the data they produced lives on independently in
// offerings/meetings), but this isn't enforced here — callers decide.
func (r *TimetableImportRepository) DeleteBatch(id int64) error {
	return config.DB.Delete(&models.TimetableImportBatch{}, id).Error
}

// PublishBatch writes a batch's rows into categories/subjects/offerings/meetings
// for the batch's (category, academic_year, term), replacing whatever was
// previously published for that same scope. It then marks the batch published.
func (r *TimetableImportRepository) PublishBatch(batchID int64) (*models.TimetableImportBatch, error) {
	var published models.TimetableImportBatch

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var batch models.TimetableImportBatch
		if err := tx.
			Preload("Rows", func(db *gorm.DB) *gorm.DB {
				return db.Order("sort_order ASC, import_row_id ASC")
			}).
			First(&batch, batchID).Error; err != nil {
			return err
		}

		var category models.Category
		if err := tx.Where("slug = ?", batch.CategorySlug).First(&category).Error; err != nil {
			return fmt.Errorf("category %q not found: %w", batch.CategorySlug, err)
		}

		// Replace whatever this (category, year, term) previously published:
		// find its offerings, delete their meetings, then the offerings.
		var offeringIDs []int64
		if err := tx.Model(&models.Offering{}).
			Joins("JOIN subjects ON offerings.subject_id = subjects.subject_id").
			Where("subjects.category_id = ? AND offerings.academic_year = ? AND offerings.term = ?",
				category.CategoryID, batch.AcademicYear, batch.Term).
			Pluck("offerings.offering_id", &offeringIDs).Error; err != nil {
			return err
		}
		if len(offeringIDs) > 0 {
			if err := tx.Where("offering_id IN ?", offeringIDs).Delete(&models.Meeting{}).Error; err != nil {
				return err
			}
			if err := tx.Where("offering_id IN ?", offeringIDs).Delete(&models.Offering{}).Error; err != nil {
				return err
			}
		}

		subjectCache := map[string]int64{} // title -> subject_id, avoids repeat lookups within this publish
		for _, row := range batch.Rows {
			title := strings.TrimSpace(row.CourseName)
			if title == "" {
				title = strings.TrimSpace(row.CourseCode)
			}
			if title == "" {
				continue
			}

			subjectID, ok := subjectCache[title]
			if !ok {
				subject := models.Subject{CategoryID: category.CategoryID, Title: title}
				if err := tx.Where(models.Subject{CategoryID: category.CategoryID, Title: title}).
					FirstOrCreate(&subject).Error; err != nil {
					return err
				}
				subjectID = subject.SubjectID
				subjectCache[title] = subjectID
			}

			var instructors []string
			if name := strings.TrimSpace(row.Instructor); name != "" {
				instructors = []string{name}
			}

			offering := models.Offering{
				SubjectID:       subjectID,
				AcademicYear:    batch.AcademicYear,
				Term:            batch.Term,
				Modality:        inferModality(row.Classroom),
				CourseCode:      strings.TrimSpace(row.CourseCode),
				Note:            strings.TrimSpace(row.Note),
				InstructorNames: instructors,
			}
			if err := tx.Create(&offering).Error; err != nil {
				return err
			}

			if row.Day != nil && row.Period != nil {
				meeting := models.Meeting{
					OfferingID: offering.OfferingID,
					Day:        *row.Day,
					Period:     *row.Period,
					Classroom:  strings.TrimSpace(row.Classroom),
				}
				if err := tx.Create(&meeting).Error; err != nil {
					return err
				}
			}
		}

		if err := tx.Model(&batch).Updates(map[string]interface{}{
			"status":       "published",
			"published_at": gorm.Expr("current_timestamp"),
		}).Error; err != nil {
			return err
		}

		return tx.Preload("Rows", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC, import_row_id ASC")
		}).First(&published, batchID).Error
	})
	if err != nil {
		return nil, err
	}
	return &published, nil
}

func inferModality(classroom string) string {
	switch {
	case strings.Contains(classroom, "遠隔"):
		return "online"
	case classroom == "":
		return "unknown"
	default:
		return "onsite"
	}
}
