package models

import "time"

// =====================
// User: ユーザー
// =====================
// データベーステーブル: users
// 役割: 授業評価プラットフォームのユーザー情報
// 認証: Supabase Auth と連携
// 関連: Timetable が user_id を外部キーとして参照
type User struct {
	// user_id: 主キー（自動採番）
	UserID int64 `gorm:"primaryKey;column:user_id" json:"user_id"`

	// display_name: ユーザーが入力した表示名
	// 例: 「田中太郎」
	DisplayName string `gorm:"column:display_name;not null" json:"display_name"`

	// auth_uid: Supabase Auth user id
	AuthUID string `gorm:"column:auth_uid;uniqueIndex;not null" json:"auth_uid"`
	// role: ユーザーの権限 ('user' or 'admin')
	Role      string    `gorm:"column:role;type:varchar(20);not null;default:'user'" json:"role"`
	CreatedAt time.Time `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
}

func (User) TableName() string {
	return "users"
}
