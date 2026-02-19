package models

import "time"

type ReviewStatus string

const (
	ReviewStatusPublic  ReviewStatus = "public"
	ReviewStatusPrivate ReviewStatus = "private"
	ReviewStatusDeleted ReviewStatus = "deleted"
)

type Review struct {
	ReviewID    int64  `gorm:"primaryKey;column:review_id" json:"review_id"`
	OfferingID  int64  `gorm:"column:offering_id;not null;index" json:"offering_id"`
	MdURL       string `gorm:"column:md_url;not null" json:"md_url"`
	ReviewCount int64  `gorm:"column:review_count;default:0" json:"review_count"`
	Status      string `gorm:"column:status;type:varchar(20);not null;default:'public'" json:"status"`
	CreatedAt   time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`

	// リレーション
	Offering *Offering `gorm:"foreignKey:OfferingID;references:OfferingID;constraint:OnDelete:CASCADE" json:"offering,omitempty"`
}

func (Review) TableName() string {
	return "reviews"
}
