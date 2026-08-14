package repository

import (
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
	"gorm.io/gorm"
)

type AdRepository struct{}

func (r *AdRepository) ListAds(includeInactive bool) ([]models.AdImage, error) {
	var ads []models.AdImage
	query := config.DB.Order("academic_year desc, term asc, created_at desc")
	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}
	err := query.Find(&ads).Error
	return ads, err
}

func (r *AdRepository) ListActiveAdsByTerm(academicYear int16, term string) ([]models.AdImage, error) {
	var ads []models.AdImage
	err := config.DB.
		Where("academic_year = ? AND term = ? AND is_active = ?", academicYear, term, true).
		Order("created_at desc").
		Find(&ads).Error
	return ads, err
}

func (r *AdRepository) CreateAd(ad *models.AdImage) error {
	now := time.Now()
	ad.IsActive = true
	ad.CreatedAt = now
	ad.UpdatedAt = now
	return config.DB.Create(ad).Error
}

func (r *AdRepository) GetAdByID(adID int64) (*models.AdImage, error) {
	var ad models.AdImage
	if err := config.DB.First(&ad, adID).Error; err != nil {
		return nil, err
	}
	return &ad, nil
}

func (r *AdRepository) DeleteAd(adID int64) error {
	result := config.DB.Delete(&models.AdImage{}, adID)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
