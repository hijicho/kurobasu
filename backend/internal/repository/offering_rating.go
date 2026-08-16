package repository

import (
	"errors"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
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

func (r *OfferingRatingRepository) SaveRating(offeringID int64, userID *int64, score int16) (OfferingRatingSummary, error) {
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
		if userID != nil {
			var existing models.OfferingRating
			err := tx.Where("offering_id = ? AND user_id = ?", offeringID, *userID).First(&existing).Error
			if err == nil {
				existing.Score = score
				existing.UpdatedAt = now
				if err := tx.Save(&existing).Error; err != nil {
					return err
				}
			} else if errors.Is(err, gorm.ErrRecordNotFound) {
				if err := tx.Create(&models.OfferingRating{
					OfferingID: offeringID,
					UserID:     userID,
					Score:      score,
					CreatedAt:  now,
					UpdatedAt:  now,
				}).Error; err != nil {
					return err
				}
			} else {
				return err
			}
		} else {
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
