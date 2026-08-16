package models

import "time"

// =====================
// TimetableImportBatch: 時間割CSVインポートの1回分
// =====================
// 管理画面からアップロードされた時間割CSVを解析した結果をひとまとめにするバッチ。
// draft の間はスプレッドシート（編集画面）で行を修正でき、
// publish されると対象カテゴリの subjects/offerings/meetings に反映される。
type TimetableImportBatch struct {
	ImportBatchID  int64  `gorm:"primaryKey;column:import_batch_id" json:"import_batch_id"`
	CategorySlug   string `gorm:"column:category_slug;type:varchar(60);not null;index" json:"category_slug"`
	AcademicYear   int16  `gorm:"column:academic_year;not null;check:academic_year>=2000 AND academic_year<=2100" json:"academic_year"`
	Term           string `gorm:"column:term;type:varchar(20);not null" json:"term"`
	SourceFilename string `gorm:"column:source_filename;type:text;not null;default:''" json:"source_filename"`
	// Status: draft（編集中）/ published（公開済み）
	Status string `gorm:"column:status;type:varchar(20);not null;default:'draft'" json:"status"`
	// SheetURL: 行編集用のリンク（Google スプレッドシートが未設定の場合は管理画面内の編集ページ）
	SheetURL        string     `gorm:"column:sheet_url;type:text;not null;default:''" json:"sheet_url"`
	CreatedByUserID *int64     `gorm:"column:created_by_user_id" json:"created_by_user_id,omitempty"`
	CreatedAt       time.Time  `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`
	PublishedAt     *time.Time `gorm:"column:published_at" json:"published_at,omitempty"`

	Rows []TimetableImportRow `gorm:"foreignKey:ImportBatchID;references:ImportBatchID" json:"rows,omitempty"`
}

func (TimetableImportBatch) TableName() string {
	return "timetable_import_batches"
}

// TimetableImportRow: インポートされた時間割の1コマ分
// CSV から自動抽出された内容、またはスプレッドシート編集画面で手直しされた内容を保持する。
type TimetableImportRow struct {
	ImportRowID   int64 `gorm:"primaryKey;column:import_row_id" json:"import_row_id"`
	ImportBatchID int64 `gorm:"column:import_batch_id;not null;index" json:"import_batch_id"`
	// Day: 1=月...5=金。時間割外・集中講義など曜日が定まらない行は NULL
	Day *int16 `gorm:"column:day;check:day IS NULL OR (day>=1 AND day<=7)" json:"day"`
	// Period: 1〜5限。時間割外の行は NULL
	Period     *int16 `gorm:"column:period;check:period IS NULL OR (period>=1 AND period<=10)" json:"period"`
	CourseCode string `gorm:"column:course_code;type:varchar(40);not null;default:''" json:"course_code"`
	CourseName string `gorm:"column:course_name;type:text;not null;default:''" json:"course_name"`
	Instructor string `gorm:"column:instructor;type:text;not null;default:''" json:"instructor"`
	Campus     string `gorm:"column:campus;type:text;not null;default:''" json:"campus"`
	Classroom  string `gorm:"column:classroom;type:text;not null;default:''" json:"classroom"`
	Note       string `gorm:"column:note;type:varchar(120);not null;default:''" json:"note"`
	SortOrder  int    `gorm:"column:sort_order;not null;default:0" json:"sort_order"`
}

func (TimetableImportRow) TableName() string {
	return "timetable_import_rows"
}
