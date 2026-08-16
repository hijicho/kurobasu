package models

// Day/Period are nullable: a meeting with no fixed weekly slot (集中講義 /
// 時間割外) still gets a row here so its Classroom has somewhere to live —
// otherwise that offering's campus/room info has no table to persist to at
// all (Offering itself has no classroom field). NULL passes Postgres CHECK
// constraints by default, so day>=1 AND day<=7 still holds for scheduled
// meetings without needing a NULL-aware rewrite.
type Meeting struct {
	MeetingID  int64  `gorm:"primaryKey;column:meeting_id" json:"meeting_id"`
	OfferingID int64  `gorm:"column:offering_id;not null;index" json:"offering_id"`
	Day        *int16 `gorm:"column:day;check:day>=1 AND day<=7" json:"day"`
	Period     *int16 `gorm:"column:period;check:period>=1 AND period<=10" json:"period"`
	Classroom  string `gorm:"column:classroom;type:varchar(120);not null;default:''" json:"classroom"`

	// リレーション (no FK constraint, only for eager loading)
	Offering *Offering `gorm:"foreignKey:OfferingID;references:OfferingID" json:"offering,omitempty"`
}

func (Meeting) TableName() string {
	return "meetings"
}
