package models

import "time"

type SiteSettings struct {
	SettingsID          int16     `gorm:"primaryKey;column:settings_id;not null;default:1" json:"settings_id"`
	DefaultAcademicYear int16     `gorm:"column:default_academic_year;not null;check:default_academic_year>=2000 AND default_academic_year<=2100" json:"default_academic_year"`
	DefaultTerm         string    `gorm:"column:default_term;type:varchar(20);not null" json:"default_term"`
	UpdatedAt           time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`
}

func (SiteSettings) TableName() string {
	return "site_settings"
}
