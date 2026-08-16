package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// SubjectRatingRepository reads the AA/A/B/C rank published from 評価CSV
// imports, keyed by subject.
type SubjectRatingRepository struct{}

// GetRankBySubjectIDs returns subject_id -> rank_label for whichever of the
// given subjects have a published rating. Subjects with no rating are
// simply absent from the result.
func (r *SubjectRatingRepository) GetRankBySubjectIDs(subjectIDs []int64) (map[int64]string, error) {
	result := map[int64]string{}
	if len(subjectIDs) == 0 {
		return result, nil
	}
	var ratings []models.SubjectRating
	if err := config.DB.Where("subject_id IN ?", subjectIDs).Find(&ratings).Error; err != nil {
		return nil, err
	}
	for _, rating := range ratings {
		result[rating.SubjectID] = rating.RankLabel
	}
	return result, nil
}
