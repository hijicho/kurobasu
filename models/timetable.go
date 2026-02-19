package models

import "time"

type Timetable struct {
	TimetableID int64     `gorm:"primaryKey;column:timetable_id" json:"timetable_id"`
	UserID      int64     `gorm:"column:user_id;not null;index" json:"user_id"`
	Title       string    `gorm:"column:title;not null" json:"title"`
	Year        int16     `gorm:"column:year;not null;check:year>=2000 AND year<=2100" json:"year"`
	Term        string    `gorm:"column:term;type:varchar(20);not null" json:"term"`
	IsPublic    bool      `gorm:"column:is_public;not null;default:false" json:"is_public"`
	CreatedAt   time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`

	// リレーション
	User  *User            `gorm:"foreignKey:UserID;references:UserID;constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Items []TimetableItem  `gorm:"foreignKey:TimetableID;references:TimetableID;constraint:OnDelete:CASCADE" json:"items,omitempty"`
}

func (Timetable) TableName() string {
	return "timetables"
}
