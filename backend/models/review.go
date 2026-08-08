package models

import "time"

// UserReviewStatus はレビューの状態を表します
type UserReviewStatus string

const (
	UserReviewStatusPending  UserReviewStatus = "pending"
	UserReviewStatusApproved UserReviewStatus = "approved"
)

// UserReviewType は1行が良い点・悪い点・その他のどれかを表します
type UserReviewType string

const (
	UserReviewTypePros   UserReviewType = "pros"
	UserReviewTypeCons   UserReviewType = "cons"
	UserReviewTypeOthers UserReviewType = "others"
)

// UserReview テーブル: ユーザーが投稿する授業レビュー
// 1回のレビュー投稿（良い点・悪い点・任意のその他コメント）は、
// type ごとに複数行（pros/cons/[others]）として保存される
type UserReview struct {
	UserReviewID int64            `gorm:"primaryKey;column:user_review_id" json:"user_review_id"`
	UserID       int64            `gorm:"column:user_id;not null;index" json:"user_id"`
	OfferingID   int64            `gorm:"column:offering_id;not null;index" json:"offering_id"`
	Comment      string           `gorm:"column:comment;type:text;not null" json:"comment"`
	// Type: 既存行（pros/cons区別導入前）の移行時は 'others' で埋める（default:'others'）
	Type         UserReviewType   `gorm:"column:type;type:varchar(20);not null;default:'others'" json:"type"`
	Status       UserReviewStatus `gorm:"column:status;type:varchar(20);not null;default:'pending'" json:"status"`
	CreatedAt    time.Time        `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt    time.Time        `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`

	// リレーション用（オプション）
	User     *User     `gorm:"foreignKey:UserID;references:UserID;-:all" json:"user,omitempty"`
	Offering *Offering `gorm:"foreignKey:OfferingID;references:OfferingID;-:all" json:"offering,omitempty"`
}

func (UserReview) TableName() string {
	return "user_reviews"
}
