package models

import "time"

type User struct {
	UserID      int64  `gorm:"primaryKey;column:user_id" json:"user_id"`
	DisplayName string `gorm:"column:display_name;not null" json:"display_name"`
	FirebaseUID string `gorm:"column:firebase_uid;uniqueIndex;not null" json:"firebase_uid"`
	CreatedAt   time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
}

func (User) TableName() string {
	return "users"
}
