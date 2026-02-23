package models

import "time"

type Subject struct {
	SubjectID  int64     `gorm:"primaryKey;column:subject_id" json:"subject_id"`
	CategoryID int64     `gorm:"column:category_id;not null;index" json:"category_id"`
	Title      string    `gorm:"column:title;not null;index:,type:btree" json:"title"`
	CreatedAt  time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt  time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`

	// リレーション (no FK constraint, only for eager loading)
	Category *Category `gorm:"foreignKey:CategoryID;references:CategoryID;-:all" json:"category,omitempty"`
}

func (Subject) TableName() string {
	return "subjects"
}
