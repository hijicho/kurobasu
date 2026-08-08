package repository

import (
	"errors"
	"fmt"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

// ReviewRepository handles review data access
type ReviewRepository struct{}

// ErrOfferingNotFound is returned when the referenced offering does not exist
var ErrOfferingNotFound = errors.New("offering not found")

// GetReviewsByOffering returns all public reviews for an offering
func (r *ReviewRepository) GetReviewsByOffering(offeringID int64) ([]models.UserReview, error) {
	var reviews []models.UserReview
	err := config.DB.
		Where("offering_id = ? AND status = ?", offeringID, string(models.UserReviewStatusApproved)).
		Order("created_at DESC").
		Find(&reviews).Error
	return reviews, err
}

// GetReviewsByUser returns all reviews created by the given user.
func (r *ReviewRepository) GetReviewsByUser(userID int64) ([]models.UserReview, error) {
	var reviews []models.UserReview
	err := config.DB.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&reviews).Error
	return reviews, err
}

// GetReviewByID returns a single review by ID
func (r *ReviewRepository) GetReviewByID(reviewID int64) (*models.UserReview, error) {
	var review models.UserReview
	err := config.DB.Preload("Offering").First(&review, reviewID).Error
	return &review, err
}

// GetReviewByIDForUser returns a single review by ID for the given user.
func (r *ReviewRepository) GetReviewByIDForUser(userID, reviewID int64) (*models.UserReview, error) {
	var review models.UserReview
	err := config.DB.
		Where("user_id = ?", userID).
		First(&review, reviewID).Error
	return &review, err
}

// CreateReviews creates the rows (pros/cons/[others]) for a single review
// submission atomically. All rows must reference the same offering.
func (r *ReviewRepository) CreateReviews(reviews []*models.UserReview) error {
	if len(reviews) == 0 {
		return nil
	}

	// Ensure the referenced offering exists to avoid FK constraint errors
	offeringID := reviews[0].OfferingID
	var off models.Offering
	if err := config.DB.First(&off, offeringID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: %d", ErrOfferingNotFound, offeringID)
		}
		return err
	}

	return config.DB.Transaction(func(tx *gorm.DB) error {
		for _, review := range reviews {
			if review.Status == "" {
				review.Status = models.UserReviewStatusPending
			}
			if err := tx.Create(review).Error; err != nil {
				return err
			}
		}
		return nil
	})
}
