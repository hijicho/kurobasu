package models

import "time"

// OfferingRating stores a 1-5 recommendation score for one offering.
// Logged-in users update their own previous score; anonymous submissions are
// stored as separate rows.
type OfferingRating struct {
	OfferingRatingID int64     `gorm:"primaryKey;column:offering_rating_id" json:"offering_rating_id"`
	OfferingID       int64     `gorm:"column:offering_id;not null;index" json:"offering_id"`
	UserID           *int64    `gorm:"column:user_id;index" json:"user_id,omitempty"`
	Score            int16     `gorm:"column:score;not null;check:score>=1 AND score<=5" json:"score"`
	CreatedAt        time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`

	User     *User     `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	Offering *Offering `gorm:"foreignKey:OfferingID;references:OfferingID" json:"offering,omitempty"`
}

func (OfferingRating) TableName() string {
	return "offering_ratings"
}
