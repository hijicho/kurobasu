package repository

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// ReviewRepository handles review data access
type ReviewRepository struct{}

// AdminReviewRecord is the joined projection used by the moderation UI.
type AdminReviewRecord struct {
	ReviewID        int64
	UserID          *int64
	UserDisplayName sql.NullString
	OfferingID      int64
	SubjectTitle    string
	InstructorNames pq.StringArray `gorm:"type:text[]"`
	AcademicYear    int16
	Term            string
	Comment         string
	Type            string
	Status          string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

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

// ListAdminReviews returns reviews with enough joined context for moderation.
func (r *ReviewRepository) ListAdminReviews(status string) ([]AdminReviewRecord, error) {
	var reviews []AdminReviewRecord
	query := r.adminReviewQuery().Order("user_reviews.created_at DESC")

	if status != "" {
		query = query.Where("user_reviews.status = ?", status)
	}

	err := query.Find(&reviews).Error
	return reviews, err
}

func (r *ReviewRepository) getAdminReviewRecord(reviewID int64) (*AdminReviewRecord, error) {
	var review AdminReviewRecord
	result := r.adminReviewQuery().
		Where("user_reviews.user_review_id = ?", reviewID).
		Limit(1).
		Find(&review)
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &review, nil
}

func (r *ReviewRepository) adminReviewQuery() *gorm.DB {
	return config.DB.
		Table("user_reviews").
		Select(`
			user_reviews.user_review_id AS review_id,
			user_reviews.user_id,
			users.display_name AS user_display_name,
			user_reviews.offering_id,
			subjects.title AS subject_title,
			offerings.instructor_names,
			offerings.academic_year,
			offerings.term,
			user_reviews.comment,
			user_reviews.type,
			user_reviews.status,
			user_reviews.created_at,
			user_reviews.updated_at
		`).
		Joins("LEFT JOIN users ON users.user_id = user_reviews.user_id").
		Joins("LEFT JOIN offerings ON offerings.offering_id = user_reviews.offering_id").
		Joins("LEFT JOIN subjects ON subjects.subject_id = offerings.subject_id")
}

// UpdateReviewStatus changes a review's moderation status.
func (r *ReviewRepository) UpdateReviewStatus(reviewID int64, status models.UserReviewStatus) (*AdminReviewRecord, error) {
	var review models.UserReview
	if err := config.DB.First(&review, reviewID).Error; err != nil {
		return nil, err
	}

	review.Status = status
	if err := config.DB.Save(&review).Error; err != nil {
		return nil, err
	}

	return r.getAdminReviewRecord(reviewID)
}

// DeleteReview physically removes a review row.
func (r *ReviewRepository) DeleteReview(reviewID int64) error {
	result := config.DB.Delete(&models.UserReview{}, reviewID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

// CreateReviews creates review rows atomically. All rows must reference the same offering.
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
