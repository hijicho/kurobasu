package models

import "time"

// OfferingRating stores a 1-5 recommendation score for one offering.
// Logged-in users update their own previous score (keyed by UserID).
// Anonymous submissions are identified by VoterKey instead — an opaque id
// stored in a long-lived cookie on the visitor's browser (see
// internal/handlers/rating_guard.go) — so re-submitting from the same
// browser also updates the existing row rather than creating a new one.
type OfferingRating struct {
	OfferingRatingID int64     `gorm:"primaryKey;column:offering_rating_id" json:"offering_rating_id"`
	OfferingID       int64     `gorm:"column:offering_id;not null;index" json:"offering_id"`
	UserID           *int64    `gorm:"column:user_id;index" json:"user_id,omitempty"`
	VoterKey         string    `gorm:"column:voter_key;type:varchar(64);index" json:"-"`
	Score            int16     `gorm:"column:score;not null;check:score>=1 AND score<=5" json:"score"`
	CreatedAt        time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt        time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`

	User     *User     `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	Offering *Offering `gorm:"foreignKey:OfferingID;references:OfferingID" json:"offering,omitempty"`
}

func (OfferingRating) TableName() string {
	return "offering_ratings"
}
