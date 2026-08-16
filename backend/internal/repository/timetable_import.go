package repository

import (
	"fmt"
	"strings"
	"time"

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

// ListBatches returns batches, most recent first, without rows (used for the
// admin "past uploads" list). An empty categorySlug returns batches across
// every category.
func (r *TimetableImportRepository) ListBatches(categorySlug string) ([]models.TimetableImportBatch, error) {
	var batches []models.TimetableImportBatch
	query := config.DB.Order("created_at DESC")
	if categorySlug != "" {
		query = query.Where("category_slug = ?", categorySlug)
	}
	err := query.Find(&batches).Error
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

		// Replace whatever this (category, year, term) previously published.
		// Deleting via a subquery instead of first Pluck-ing the offering IDs
		// into Go and then deleting by that list saves a round trip; running
		// these unconditionally (even when there's nothing to delete) is
		// still a net win since most publishes are re-publishes of an
		// already-populated scope.
		const offeringScopeSQL = `
			SELECT o.offering_id FROM offerings o
			JOIN subjects s ON s.subject_id = o.subject_id
			WHERE s.category_id = ? AND o.academic_year = ? AND o.term = ?
		`
		if err := tx.Exec("DELETE FROM meetings WHERE offering_id IN ("+offeringScopeSQL+")",
			category.CategoryID, batch.AcademicYear, batch.Term).Error; err != nil {
			return err
		}
		if err := tx.Exec("DELETE FROM offerings WHERE offering_id IN ("+offeringScopeSQL+")",
			category.CategoryID, batch.AcademicYear, batch.Term).Error; err != nil {
			return err
		}

		// Resolve every row's subject in bulk (one SELECT for existing titles,
		// one INSERT for missing ones) instead of a per-row round trip, since
		// a several-hundred-row import over a networked DB turns "one round
		// trip per row" into a very visible multi-second delay.
		rowTitle := make([]string, len(batch.Rows))
		var wantedTitles []string
		seenTitle := map[string]bool{}
		for i, row := range batch.Rows {
			title := strings.TrimSpace(row.CourseName)
			if title == "" {
				title = strings.TrimSpace(row.CourseCode)
			}
			rowTitle[i] = title
			if title != "" && !seenTitle[title] {
				seenTitle[title] = true
				wantedTitles = append(wantedTitles, title)
			}
		}

		subjectCache := map[string]int64{} // title -> subject_id
		if len(wantedTitles) > 0 {
			var existing []models.Subject
			if err := tx.Where("category_id = ? AND title IN ?", category.CategoryID, wantedTitles).
				Find(&existing).Error; err != nil {
				return err
			}
			for _, s := range existing {
				subjectCache[s.Title] = s.SubjectID
			}

			var newSubjects []models.Subject
			for _, title := range wantedTitles {
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
		}

		// Build every offering up front and insert them in one batch, then do
		// the same for meetings once offering IDs come back.
		rowClassroom := make([]string, len(batch.Rows))
		offerings := make([]models.Offering, 0, len(batch.Rows))
		offeringRowIdx := make([]int, 0, len(batch.Rows)) // offerings[j] came from batch.Rows[offeringRowIdx[j]]
		for i, row := range batch.Rows {
			title := rowTitle[i]
			if title == "" {
				continue
			}
			classroom := strings.TrimSpace(strings.TrimSpace(row.Campus) + strings.TrimSpace(row.Classroom))
			rowClassroom[i] = classroom

			var instructors []string
			if name := strings.TrimSpace(row.Instructor); name != "" {
				instructors = []string{name}
			}

			offerings = append(offerings, models.Offering{
				SubjectID:       subjectCache[title],
				AcademicYear:    batch.AcademicYear,
				Term:            batch.Term,
				Modality:        inferModality(classroom),
				CourseCode:      strings.TrimSpace(row.CourseCode),
				Note:            strings.TrimSpace(row.Note),
				InstructorNames: instructors,
			})
			offeringRowIdx = append(offeringRowIdx, i)
		}
		if len(offerings) > 0 {
			if err := tx.Create(&offerings).Error; err != nil {
				return err
			}
		}

		var meetings []models.Meeting
		for j, offering := range offerings {
			row := batch.Rows[offeringRowIdx[j]]
			if row.Day != nil && row.Period != nil {
				meetings = append(meetings, models.Meeting{
					OfferingID: offering.OfferingID,
					Day:        *row.Day,
					Period:     *row.Period,
					Classroom:  rowClassroom[offeringRowIdx[j]],
				})
			}
		}
		if len(meetings) > 0 {
			if err := tx.Create(&meetings).Error; err != nil {
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

		// batch.Rows is untouched by everything above, so the response can
		// be built from what's already in memory instead of paying another
		// two round trips (batch + Rows) to re-fetch what we just wrote.
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
