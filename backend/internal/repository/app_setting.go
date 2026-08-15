package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// SettingRepository handles the single-row app_settings table.
type SettingRepository struct{}

// GetDefaultTermOverride returns the admin-configured default term override,
// or nil if no override is set (meaning callers should fall back to the
// calendar-based default).
func (r *SettingRepository) GetDefaultTermOverride() (*string, error) {
	var setting models.AppSetting
	if err := config.DB.First(&setting, 1).Error; err != nil {
		return nil, err
	}
	return setting.DefaultTerm, nil
}

// SetDefaultTermOverride sets (or clears, when term is nil) the admin-configured
// default term override.
func (r *SettingRepository) SetDefaultTermOverride(term *string) error {
	return config.DB.Model(&models.AppSetting{}).Where("id = ?", 1).Update("default_term", term).Error
}
