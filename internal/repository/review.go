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
func (r *ReviewRepository) GetReviewsByOffering(offeringID int64) ([]models.Review, error) {
	var reviews []models.Review
	err := config.DB.
		Preload("Offering").
		Where("offering_id = ? AND status = ?", offeringID, "public").
		Order("created_at DESC").
		Find(&reviews).Error
	return reviews, err
}

// GetReviewByID returns a single review by ID
func (r *ReviewRepository) GetReviewByID(reviewID int64) (*models.Review, error) {
	var review models.Review
	err := config.DB.Preload("Offering").First(&review, reviewID).Error
	return &review, err
}

// CreateReview creates a new review
func (r *ReviewRepository) CreateReview(review *models.Review) error {
	// Ensure the referenced offering exists to avoid FK constraint errors
	var off models.Offering
	if err := config.DB.First(&off, review.OfferingID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("%w: %d", ErrOfferingNotFound, review.OfferingID)
		}
		return err
	}

	return config.DB.Create(review).Error
}
