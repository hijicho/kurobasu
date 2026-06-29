package models

import "time"

type TimetableItem struct {
	TimetableID int64     `gorm:"column:timetable_id;not null;primaryKey" json:"timetable_id"`
	OfferingID  int64     `gorm:"column:offering_id;not null;primaryKey" json:"offering_id"`
	DayOfWeek   *int16    `gorm:"column:day_of_week;check:day_of_week>=1 AND day_of_week<=7" json:"day_of_week"`
	Period      *int16    `gorm:"column:period;check:period>=1 AND period<=10" json:"period"`
	IsSelected  bool      `gorm:"column:is_selected;not null;default:true" json:"is_selected"`
	CreatedAt   time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`

	// リレーション (no FK constraint, only for eager loading)
	Timetable *Timetable `gorm:"foreignKey:TimetableID;references:TimetableID;-:all" json:"timetable,omitempty"`
	Offering  *Offering  `gorm:"foreignKey:OfferingID;references:OfferingID;-:all" json:"offering,omitempty"`
}

func (TimetableItem) TableName() string {
	return "timetable_items"
}
