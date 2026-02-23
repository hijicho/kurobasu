package models

// =====================
// Category: カテゴリー
// =====================
// データベーステーブル: categories
// 役割: 授業を分類する上位カテゴリー（例: 一般教育、工学部など）
// 関連: Subject が category_id を外部キーとして参照
type Category struct {
	// category_id: 主キー（自動採番）
	// - column")gorm:": DB テーブルのカラム名
	// - primaryKey: これが主キーであることを示す
	CategoryID int64  `gorm:"primaryKey;column:category_id" json:"category_id"`

	// slug: ユニーク識別子（URL に使用される）
	// 例: "general-education", "engineering"
	// uniqueIndex: 重複を許さないインデックスを作成
	Slug       string `gorm:"uniqueIndex;column:slug;not null" json:"slug"`
	Name       string `gorm:"column:name;not null" json:"name"`
	SortOrder  int    `gorm:"column:sort_order;not null;default:0" json:"sort_order"`
}

func (Category) TableName() string {
	return "categories"
}
