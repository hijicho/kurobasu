package repository

import (
	"strings"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/internal/csvtimetable"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

// OfferingRepository handles offering data access
type OfferingRepository struct{}

// GetOfferingsByCategory returns offerings filtered by category slug, academic year, and term
func (r *OfferingRepository) GetOfferingsByCategory(categoryID int64, academicYear int16, term string) ([]models.Offering, error) {
	var offerings []models.Offering
	err := config.DB.
		Preload("Subject").
		Joins("JOIN subjects ON offerings.subject_id = subjects.subject_id").
		Where("subjects.category_id = ? AND offerings.academic_year = ? AND offerings.term = ?",
			categoryID, academicYear, term).
		Order("offerings.created_at ASC").
		Find(&offerings).Error
	return offerings, err
}

// GetOfferingByID returns a single offering with subject info
func (r *OfferingRepository) GetOfferingByID(offeringID int64) (*models.Offering, error) {
	var offering models.Offering
	err := config.DB.Preload("Subject").First(&offering, offeringID).Error
	return &offering, err
}

// ReplaceForScope wipes every offering/meeting currently in
// (categoryID, academicYear, term) and recreates it from rows. This is the
// single write path shared by CSV import and the admin's manual row editor —
// both just funnel their rows through here, admin CSV import feature or a
// saved edit, gets the exact same "delete this scope's data first" full
// replace, matching the previous PublishBatch behavior (offering_ratings for
// this scope are lost via ON DELETE CASCADE; callers must warn about this).
func (r *OfferingRepository) ReplaceForScope(
	categoryID int64,
	academicYear int16,
	term string,
	rows []csvtimetable.ParsedRow,
) ([]models.Offering, error) {
	var created []models.Offering

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		const offeringScopeSQL = `
			SELECT o.offering_id FROM offerings o
			JOIN subjects s ON s.subject_id = o.subject_id
			WHERE s.category_id = ? AND o.academic_year = ? AND o.term = ?
		`
		if err := tx.Exec("DELETE FROM meetings WHERE offering_id IN ("+offeringScopeSQL+")",
			categoryID, academicYear, term).Error; err != nil {
			return err
		}
		if err := tx.Exec("DELETE FROM offerings WHERE offering_id IN ("+offeringScopeSQL+")",
			categoryID, academicYear, term).Error; err != nil {
			return err
		}

		// Resolve every row's subject in bulk (one SELECT for existing
		// titles, one INSERT for missing ones) instead of a per-row round
		// trip, since a several-hundred-row import over a networked DB turns
		// "one round trip per row" into a very visible multi-second delay.
		rowTitle := make([]string, len(rows))
		var wantedTitles []string
		seenTitle := map[string]bool{}
		for i, row := range rows {
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
			if err := tx.Where("category_id = ? AND title IN ?", categoryID, wantedTitles).
				Find(&existing).Error; err != nil {
				return err
			}
			for _, s := range existing {
				subjectCache[s.Title] = s.SubjectID
			}

			var newSubjects []models.Subject
			for _, title := range wantedTitles {
				if _, ok := subjectCache[title]; !ok {
					newSubjects = append(newSubjects, models.Subject{CategoryID: categoryID, Title: title})
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

		// Build every offering up front and insert them in one batch, then
		// do the same for meetings once offering IDs come back.
		rowClassroom := make([]string, len(rows))
		offerings := make([]models.Offering, 0, len(rows))
		offeringRowIdx := make([]int, 0, len(rows)) // offerings[j] came from rows[offeringRowIdx[j]]
		for i, row := range rows {
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
				AcademicYear:    academicYear,
				Term:            term,
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

		// Always create a meeting, even for rows with no fixed weekly slot
		// (集中講義 / 時間割外, Day/Period nil) — it's the only place a
		// campus/classroom string can live, since Offering itself has no
		// classroom field. A meeting with nil Day/Period just doesn't place
		// onto the weekly grid; callers that build that grid filter on Day
		// being non-nil instead of on meeting presence.
		meetings := make([]models.Meeting, len(offerings))
		for j, offering := range offerings {
			row := rows[offeringRowIdx[j]]
			meetings[j] = models.Meeting{
				OfferingID: offering.OfferingID,
				Day:        row.Day,
				Period:     row.Period,
				Classroom:  rowClassroom[offeringRowIdx[j]],
			}
		}
		if len(meetings) > 0 {
			if err := tx.Create(&meetings).Error; err != nil {
				return err
			}
		}

		created = offerings
		return nil
	})
	if err != nil {
		return nil, err
	}
	return created, nil
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
