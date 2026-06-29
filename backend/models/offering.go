package models

import (
	"database/sql/driver"
	"time"

	"github.com/lib/pq"
)

// Term: spring/fall/intensive/year
type Term string

const (
	TermSpring     Term = "spring"
	TermFall       Term = "fall"
	TermIntensive  Term = "intensive"
	TermYear       Term = "year"
)

func (t Term) Value() (driver.Value, error) {
	return string(t), nil
}

// Modality: onsite/online/hybrid/unknown
type Modality string

const (
	ModalityOnsite   Modality = "onsite"
	ModalityOnline   Modality = "online"
	ModalityHybrid   Modality = "hybrid"
	ModalityUnknown  Modality = "unknown"
)

func (m Modality) Value() (driver.Value, error) {
	return string(m), nil
}

type Offering struct {
	OfferingID      int64          `gorm:"primaryKey;column:offering_id" json:"offering_id"`
	SubjectID       int64          `gorm:"column:subject_id;not null;index" json:"subject_id"`
	AcademicYear    int16          `gorm:"column:academic_year;not null;check:academic_year>=2000 AND academic_year<=2100" json:"academic_year"`
	Term            string         `gorm:"column:term;type:varchar(20);not null" json:"term"`
	Modality        string         `gorm:"column:modality;type:varchar(20);not null;default:'unknown'" json:"modality"`
	InstructorNames pq.StringArray `gorm:"column:instructor_names;type:text[];not null;default:'{}'" json:"instructor_names"`
	CreatedAt       time.Time      `gorm:"column:created_at;not null;default:current_timestamp" json:"created_at"`

	// リレーション (no FK constraint, only for eager loading)
	Subject *Subject `gorm:"foreignKey:SubjectID;references:SubjectID;-:all" json:"subject,omitempty"`
}

func (Offering) TableName() string {
	return "offerings"
}
