package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// ReviewRepository handles review data access
type ReviewRepository struct{}

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
	return config.DB.Create(review).Error
}
