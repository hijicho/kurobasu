package models

import "time"

// AdImage stores the currently configured ad image for a target bucket.
// instrument_key is intentionally generic because the frontend can decide
// whether the target represents an instrument, department, page, or campaign.
type AdImage struct {
	AdID             int64     `gorm:"primaryKey;column:ad_id" json:"ad_id"`
	InstrumentKey    string    `gorm:"column:instrument_key;type:varchar(80);not null;index" json:"instrument_key"`
	ImageURL         string    `gorm:"column:image_url;type:text;not null" json:"image_url"`
	StoragePath      string    `gorm:"column:storage_path;type:text;not null" json:"storage_path"`
	OriginalFilename string    `gorm:"column:original_filename;type:text;not null" json:"original_filename"`
	ContentType      string    `gorm:"column:content_type;type:varchar(120);not null" json:"content_type"`
	FileSize         int64     `gorm:"column:file_size;not null" json:"file_size"`
	IsActive         bool      `gorm:"column:is_active;not null;default:true;index" json:"is_active"`
	CreatedAt        time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`
}

func (AdImage) TableName() string {
	return "ad_images"
}
