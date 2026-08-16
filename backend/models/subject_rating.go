package models

import "time"

// =====================
// SubjectRating: 科目ごとのおすすめ度ランク
// =====================
// 評価CSVインポートの公開時に、同一科目（Subject）へのおすすめ度回答の平均値から
// 算出される。ランクは以下の閾値で決まる（AverageScore が高いほど「楽単」寄り）:
//
//	AA: 4点以上
//	A : 2点以上4点未満
//	B : 1点以上2点未満
//	C : 1点未満
type SubjectRating struct {
	SubjectRatingID int64 `gorm:"primaryKey;column:subject_rating_id" json:"subject_rating_id"`
	// SubjectID: 1科目につき1レコード（公開のたびに最新の集計へ置き換わる）
	SubjectID    int64     `gorm:"column:subject_id;not null;uniqueIndex" json:"subject_id"`
	AverageScore float64   `gorm:"column:average_score;not null;default:0" json:"average_score"`
	SampleCount  int       `gorm:"column:sample_count;not null;default:0" json:"sample_count"`
	RankLabel    string    `gorm:"column:rank_label;type:varchar(4);not null;default:''" json:"rank_label"`
	UpdatedAt    time.Time `gorm:"column:updated_at;not null;default:current_timestamp" json:"updated_at"`
}

func (SubjectRating) TableName() string {
	return "subject_ratings"
}
