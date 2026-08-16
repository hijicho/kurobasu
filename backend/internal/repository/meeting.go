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

// GetMeetingsByOfferingIDs returns all meetings for the given offerings in a
// single query, grouped by offering ID. Used instead of calling
// GetMeetingsByOffering in a loop, which turns "list N offerings" into N+1
// round trips — cheap on localhost but very slow against a networked DB.
func (r *MeetingRepository) GetMeetingsByOfferingIDs(offeringIDs []int64) (map[int64][]models.Meeting, error) {
	result := make(map[int64][]models.Meeting, len(offeringIDs))
	if len(offeringIDs) == 0 {
		return result, nil
	}
	var meetings []models.Meeting
	if err := config.DB.
		Where("offering_id IN ?", offeringIDs).
		Order("offering_id ASC, day ASC, period ASC").
		Find(&meetings).Error; err != nil {
		return nil, err
	}
	for _, m := range meetings {
		result[m.OfferingID] = append(result[m.OfferingID], m)
	}
	return result, nil
}
