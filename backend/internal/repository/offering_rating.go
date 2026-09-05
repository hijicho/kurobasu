package repository

import (
	"errors"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type OfferingRatingSummary struct {
	OfferingID   int64
	AverageScore float64
	SampleCount  int
}

type OfferingRatingRepository struct{}

func (r *OfferingRatingRepository) GetSummariesByOfferingIDs(offeringIDs []int64) (map[int64]OfferingRatingSummary, error) {
	result := make(map[int64]OfferingRatingSummary, len(offeringIDs))
	if len(offeringIDs) == 0 {
		return result, nil
	}

	var rows []struct {
		OfferingID   int64
		AverageScore float64
		SampleCount  int
	}
	if err := config.DB.
		Model(&models.OfferingRating{}).
		Select("offering_id, AVG(score) AS average_score, COUNT(*) AS sample_count").
		Where("offering_id IN ?", offeringIDs).
		Group("offering_id").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	for _, row := range rows {
		result[row.OfferingID] = OfferingRatingSummary{
			OfferingID:   row.OfferingID,
			AverageScore: row.AverageScore,
			SampleCount:  row.SampleCount,
		}
	}
	return result, nil
}

// SaveRating records a score for an offering. Logged-in submissions
// (userID set) are deduped per (offering, user); anonymous submissions
// (userID nil) are deduped per (offering, voterKey) instead, where voterKey
// is an opaque id from the caller's anonymous-voter cookie. An anonymous
// submission with no voterKey at all (cookie blocked/unavailable) always
// inserts a new row, same as before this dedup existed.
//
// The dedup is enforced by a DB-level partial unique index per case (see
// migration.ensureOfferingRatingUniqueIndexes), and this upserts (ON
// CONFLICT) against it rather than doing a check-then-write. A plain
// check-then-write has a race: two concurrent requests from the same voter
// can both see "no existing row" before either commits, landing two rows for
// what should be one vote — letting someone bypass the dedup by firing
// requests in parallel. The unique index (and this upsert) close that.
func (r *OfferingRatingRepository) SaveRating(offeringID int64, userID *int64, voterKey string, score int16) (OfferingRatingSummary, error) {
	var summary OfferingRatingSummary
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var offering models.Offering
		if err := tx.Select("offering_id").First(&offering, offeringID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrOfferingNotFound
			}
			return err
		}

		now := time.Now()
		switch {
		case userID != nil:
			rating := models.OfferingRating{
				OfferingID: offeringID,
				UserID:     userID,
				Score:      score,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			if err := tx.Clauses(clause.OnConflict{
				Columns:     []clause.Column{{Name: "offering_id"}, {Name: "user_id"}},
				TargetWhere: clause.Where{Exprs: []clause.Expression{clause.Expr{SQL: "user_id IS NOT NULL"}}},
				DoUpdates:   clause.AssignmentColumns([]string{"score", "updated_at"}),
			}).Create(&rating).Error; err != nil {
				return err
			}
		case voterKey != "":
			rating := models.OfferingRating{
				OfferingID: offeringID,
				VoterKey:   voterKey,
				Score:      score,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			if err := tx.Clauses(clause.OnConflict{
				Columns:     []clause.Column{{Name: "offering_id"}, {Name: "voter_key"}},
				TargetWhere: clause.Where{Exprs: []clause.Expression{clause.Expr{SQL: "voter_key <> ''"}}},
				DoUpdates:   clause.AssignmentColumns([]string{"score", "updated_at"}),
			}).Create(&rating).Error; err != nil {
				return err
			}
		default:
			if err := tx.Create(&models.OfferingRating{
				OfferingID: offeringID,
				Score:      score,
				CreatedAt:  now,
				UpdatedAt:  now,
			}).Error; err != nil {
				return err
			}
		}

		var row struct {
			OfferingID   int64
			AverageScore float64
			SampleCount  int
		}
		if err := tx.
			Model(&models.OfferingRating{}).
			Select("offering_id, AVG(score) AS average_score, COUNT(*) AS sample_count").
			Where("offering_id = ?", offeringID).
			Group("offering_id").
			Scan(&row).Error; err != nil {
			return err
		}
		summary = OfferingRatingSummary{
			OfferingID:   row.OfferingID,
			AverageScore: row.AverageScore,
			SampleCount:  row.SampleCount,
		}
		return nil
	})
	return summary, err
}
