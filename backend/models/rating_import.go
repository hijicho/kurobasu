package models

import "time"

// =====================
// RatingImportBatch: 評価（おすすめ度）CSVインポートの1回分
// =====================
// 管理画面からアップロードされた総合教養科目のおすすめ度CSV（1行=1件の回答）を
// ひとまとめにするバッチ。draft の間は編集画面で行を修正でき、publish されると
// 同一科目の回答が平均され、subject_ratings に AA/A/B/C ランクとして反映される。
type RatingImportBatch struct {
	ImportBatchID  int64  `gorm:"primaryKey;column:import_batch_id" json:"import_batch_id"`
	SourceFilename string `gorm:"column:source_filename;type:text;not null;default:''" json:"source_filename"`
	// Status: draft（編集中）/ published（公開済み）
	Status          string     `gorm:"column:status;type:varchar(20);not null;default:'draft'" json:"status"`
	CreatedByUserID *int64     `gorm:"column:created_by_user_id" json:"created_by_user_id,omitempty"`
	CreatedAt       time.Time  `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`
	PublishedAt     *time.Time `gorm:"column:published_at" json:"published_at,omitempty"`

	Rows []RatingImportRow `gorm:"foreignKey:ImportBatchID;references:ImportBatchID" json:"rows,omitempty"`
}

func (RatingImportBatch) TableName() string {
	return "rating_import_batches"
}

// RatingImportRow: インポートされたおすすめ度の1回答分
// CSV から自動抽出された内容、または編集画面で手直しされた内容を保持する。
type RatingImportRow struct {
	ImportRowID   int64   `gorm:"primaryKey;column:import_row_id" json:"import_row_id"`
	ImportBatchID int64   `gorm:"column:import_batch_id;not null;index" json:"import_batch_id"`
	CourseName    string  `gorm:"column:course_name;type:text;not null;default:''" json:"course_name"`
	Score         float64 `gorm:"column:score;not null;default:0" json:"score"`
	SortOrder     int     `gorm:"column:sort_order;not null;default:0" json:"sort_order"`
}

func (RatingImportRow) TableName() string {
	return "rating_import_rows"
}
