package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// MeetingRepository handles meeting data access
type MeetingRepository struct{}

// GetMeetingsByOffering returns all meetings for an offering
func (r *MeetingRepository) GetMeetingsByOffering(offeringID int64) ([]models.Meeting, error) {
	var meetings []models.Meeting
	err := config.DB.
		Where("offering_id = ?", offeringID).
		Order("day ASC, period ASC").
		Find(&meetings).Error
	return meetings, err
}
