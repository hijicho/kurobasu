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
	query := config.DB.Order("instrument_key asc, created_at desc")
	if !includeInactive {
		query = query.Where("is_active = ?", true)
	}
	err := query.Find(&ads).Error
	return ads, err
}

func (r *AdRepository) GetActiveAd(instrumentKey string) (*models.AdImage, error) {
	var ad models.AdImage
	err := config.DB.
		Where("instrument_key = ? AND is_active = ?", instrumentKey, true).
		Order("created_at desc").
		First(&ad).Error
	return &ad, err
}

func (r *AdRepository) ReplaceActiveAd(ad *models.AdImage) error {
	now := time.Now()
	return config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.AdImage{}).
			Where("instrument_key = ? AND is_active = ?", ad.InstrumentKey, true).
			Updates(map[string]interface{}{"is_active": false, "updated_at": now}).Error; err != nil {
			return err
		}

		ad.IsActive = true
		ad.CreatedAt = now
		ad.UpdatedAt = now
		return tx.Create(ad).Error
	})
}

func (r *AdRepository) DeactivateAd(adID int64) (*models.AdImage, error) {
	var ad models.AdImage
	if err := config.DB.First(&ad, adID).Error; err != nil {
		return nil, err
	}

	ad.IsActive = false
	ad.UpdatedAt = time.Now()
	if err := config.DB.Save(&ad).Error; err != nil {
		return nil, err
	}
	return &ad, nil
}
