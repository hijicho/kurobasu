package models

type Meeting struct {
	MeetingID  int64 `gorm:"primaryKey;column:meeting_id" json:"meeting_id"`
	OfferingID int64 `gorm:"column:offering_id;not null;index" json:"offering_id"`
	Day        int16 `gorm:"column:day;not null;check:day>=1 AND day<=7" json:"day"`
	Period     int16 `gorm:"column:period;not null;check:period>=1 AND period<=10" json:"period"`

	// リレーション (no FK constraint, only for eager loading)
	Offering *Offering `gorm:"foreignKey:OfferingID;references:OfferingID" json:"offering,omitempty"`
}

func (Meeting) TableName() string {
	return "meetings"
}
