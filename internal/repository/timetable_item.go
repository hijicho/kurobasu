package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// TimetableItemRepository handles timetable item data access
type TimetableItemRepository struct{}

// CreateTimetableItem adds an offering to a timetable
func (r *TimetableItemRepository) CreateTimetableItem(item *models.TimetableItem) error {
	return config.DB.Create(item).Error
}

// DeleteTimetableItem removes an offering from a timetable
func (r *TimetableItemRepository) DeleteTimetableItem(timetableID, offeringID int64) error {
	return config.DB.Where("timetable_id = ? AND offering_id = ?", timetableID, offeringID).Delete(&models.TimetableItem{}).Error
}
