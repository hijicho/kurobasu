package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
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
