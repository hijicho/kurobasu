package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// TimetableRepository handles timetable data access
type TimetableRepository struct{}

// GetTimetableByID returns a timetable with its items
func (r *TimetableRepository) GetTimetableByID(timetableID int64) (*models.Timetable, error) {
	var timetable models.Timetable
	err := config.DB.Preload("Items").First(&timetable, timetableID).Error
	return &timetable, err
}

// GetTimetableByUserID returns the timetable for a user (assuming 1 per user)
func (r *TimetableRepository) GetTimetableByUserID(userID int64) (*models.Timetable, error) {
	var timetable models.Timetable
	err := config.DB.Preload("Items").Where("user_id = ?", userID).First(&timetable).Error
	return &timetable, err
}

// CreateTimetable creates a new timetable
func (r *TimetableRepository) CreateTimetable(timetable *models.Timetable) error {
	return config.DB.Create(timetable).Error
}

// UpdateTimetable updates timetable information
func (r *TimetableRepository) UpdateTimetable(timetable *models.Timetable) error {
	return config.DB.Save(timetable).Error
}
