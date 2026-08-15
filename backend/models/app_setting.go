package models

import "time"

// AppSetting is a single-row table holding global site settings.
// DefaultTerm overrides the calendar-based default term shown to users
// on the timetable pages when set (spring/fall); null means "auto".
type AppSetting struct {
	ID          int64     `gorm:"primaryKey;column:id" json:"id"`
	DefaultTerm *string   `gorm:"column:default_term;type:varchar(20)" json:"default_term"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`
}

func (AppSetting) TableName() string {
	return "app_settings"
}
