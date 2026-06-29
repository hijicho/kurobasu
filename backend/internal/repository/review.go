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
		Preload("Offering").
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

// CreateReview creates a new review
func (r *ReviewRepository) CreateReview(review *models.UserReview) error {
	// Ensure the referenced offering exists to avoid FK constraint errors
	var off models.Offering
	if err := config.DB.First(&off, review.OfferingID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: %d", ErrOfferingNotFound, review.OfferingID)
		}
		return err
	}

	// Default status to pending if empty
	if review.Status == "" {
		review.Status = models.UserReviewStatusPending
	}

	return config.DB.Create(review).Error
}
