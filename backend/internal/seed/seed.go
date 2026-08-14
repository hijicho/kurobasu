package seed

import (
	"log"
	"time"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// =====================
// RunSeeds: テストデータをデータベースに挿入
// =====================
// 役割：既存データがない場合にサンプルデータを挿入
// 複数回実行しても重複しないよう、FirstOrCreate を使用
func RunSeeds() error {
	log.Println("Starting database seeding...")

	// カテゴリーのシード
	categories := seedCategories()
	if len(categories) == 0 {
		return nil
	}

	// 科目のシード
	subjects := seedSubjects(categories)

	// 開講情報のシード
	offerings := seedOfferings(subjects)

	// 授業時間のシード
	seedMeetings(offerings)

	// ユーザーのシード
	users := seedUsers()

	// 時間割のシード
	seedTimetables(users)

	// レビューのシード
	seedReviews(offerings, users)

	log.Println("Database seeding completed successfully")
	return nil
}

// =====================
// seedCategories: カテゴリーデータをシード
// =====================
func seedCategories() []models.Category {
	categories := []models.Category{
		{Slug: "science", Name: "Science", SortOrder: 1},
		{Slug: "mathematics", Name: "Mathematics", SortOrder: 2},
		{Slug: "languages", Name: "Languages", SortOrder: 3},
		{Slug: "arts", Name: "Arts", SortOrder: 4},
	}
	for i := range categories {
		if err := config.DB.Where(models.Category{Slug: categories[i].Slug}).FirstOrCreate(&categories[i]).Error; err != nil {
			log.Printf("Error seeding category %s: %v", categories[i].Slug, err)
			return nil
		}
	}

	log.Println("✓ Categories seeded")
	return categories
}

// =====================
// seedSubjects: 科目データをシード
// =====================
func seedSubjects(categories []models.Category) []models.Subject {
	var subjects []models.Subject

	subjectData := []struct {
		title      string
		categoryID int64
	}{
		{"Physics", categories[0].CategoryID},
		{"Chemistry", categories[0].CategoryID},
		{"Biology", categories[0].CategoryID},
		{"Calculus", categories[1].CategoryID},
		{"Linear Algebra", categories[1].CategoryID},
		{"English", categories[2].CategoryID},
		{"Japanese", categories[2].CategoryID},
	}

	for _, data := range subjectData {
		sub := models.Subject{
			CategoryID: data.categoryID,
			Title:      data.title,
		}
		if err := config.DB.Where(models.Subject{Title: sub.Title, CategoryID: sub.CategoryID}).FirstOrCreate(&sub).Error; err != nil {
			log.Printf("Error seeding subject %s: %v", sub.Title, err)
			continue
		}
		subjects = append(subjects, sub)
	}

	log.Printf("✓ Subjects seeded: %d records", len(subjects))
	return subjects
}

// =====================
// seedOfferings: 開講情報データをシード
// =====================
func seedOfferings(subjects []models.Subject) []models.Offering {
	var offerings []models.Offering

	offeringData := []struct {
		subjectID       int64
		academicYear    int16
		term            string
		modality        string
		instructorNames []string
	}{
		{subjects[0].SubjectID, 2026, "spring", "onsite", []string{"Dr. Smith"}},
		{subjects[1].SubjectID, 2026, "spring", "onsite", []string{"Prof. Johnson"}},
		{subjects[3].SubjectID, 2026, "spring", "hybrid", []string{"Dr. Williams"}},
		{subjects[0].SubjectID, 2026, "fall", "online", []string{"Dr. Smith"}},
		{subjects[5].SubjectID, 2026, "spring", "onsite", []string{"Ms. Brown"}},
	}

	for _, data := range offeringData {
		off := models.Offering{
			SubjectID:       data.subjectID,
			AcademicYear:    data.academicYear,
			Term:            data.term,
			Modality:        data.modality,
			InstructorNames: data.instructorNames,
			CreatedAt:       time.Now(),
		}
		if err := config.DB.Where(models.Offering{SubjectID: off.SubjectID, AcademicYear: off.AcademicYear, Term: off.Term}).FirstOrCreate(&off).Error; err != nil {
			log.Printf("Error seeding offering: %v", err)
			continue
		}
		offerings = append(offerings, off)
	}

	log.Printf("✓ Offerings seeded: %d records", len(offerings))
	return offerings
}

// =====================
// seedMeetings: 授業時間データをシード
// =====================
func seedMeetings(offerings []models.Offering) {
	if len(offerings) == 0 {
		return
	}

	meetingData := []struct {
		offeringID int64
		day        int16
		period     int16
	}{
		{offerings[0].OfferingID, 1, 3}, // Monday 3rd
		{offerings[0].OfferingID, 3, 3}, // Wednesday 3rd
		{offerings[1].OfferingID, 2, 4}, // Tuesday 4th
		{offerings[1].OfferingID, 4, 4}, // Thursday 4th
		{offerings[2].OfferingID, 1, 2}, // Monday 2nd
		{offerings[2].OfferingID, 5, 2}, // Friday 2nd
	}

	for _, data := range meetingData {
		mtg := models.Meeting{
			OfferingID: data.offeringID,
			Day:        data.day,
			Period:     data.period,
		}
		config.DB.Where(models.Meeting{OfferingID: mtg.OfferingID, Day: mtg.Day, Period: mtg.Period}).FirstOrCreate(&mtg)
	}

	log.Println("✓ Meetings seeded")
}

// =====================
// seedUsers: ユーザーデータをシード
// =====================
func seedUsers() []models.User {
	var users []models.User

	userData := []struct {
		displayName string
		authUID     string
	}{
		{"Alice Johnson", "seed_user_alice"},
		{"Bob Smith", "seed_user_bob"},
		{"Carol White", "seed_user_carol"},
		{"David Brown", "seed_user_david"},
	}

	for _, data := range userData {
		user := models.User{
			DisplayName: data.displayName,
			AuthUID:     data.authUID,
			CreatedAt:   time.Now(),
		}
		if err := config.DB.Where(models.User{AuthUID: user.AuthUID}).FirstOrCreate(&user).Error; err != nil {
			log.Printf("Error seeding user %s: %v", user.DisplayName, err)
			continue
		}
		users = append(users, user)
	}

	log.Printf("✓ Users seeded: %d records", len(users))
	return users
}

// =====================
// seedTimetables: 時間割データをシード
// =====================
func seedTimetables(users []models.User) {
	if len(users) == 0 {
		return
	}
	timetableData := []struct {
		userID   int64
		title    string
		year     int16
		term     string
		isPublic bool
	}{
		{users[0].UserID, "Spring 2026 Schedule", 2026, "spring", true},
		{users[1].UserID, "My Courses 2026", 2026, "spring", false},
		{users[2].UserID, "Spring 2026", 2026, "spring", true},
	}

	for _, data := range timetableData {
		tt := models.Timetable{
			UserID:    data.userID,
			Title:     data.title,
			Year:      data.year,
			Term:      data.term,
			IsPublic:  data.isPublic,
			CreatedAt: time.Now(),
		}
		config.DB.Where(models.Timetable{UserID: tt.UserID}).FirstOrCreate(&tt)
	}

	log.Println("✓ Timetables seeded")
}

// =====================
// seedReviews: レビューデータをシード
// =====================
func seedReviews(offerings []models.Offering, users []models.User) {
	if len(offerings) < 3 || len(users) == 0 {
		return
	}

	reviewData := []struct {
		offeringIndex int
		userIndex     int
		comment       string
	}{
		{0, 0, "Great introduction to the subject. Well-structured lectures."},
		{1, 1, "Hands-on assignments were helpful, but grading was strict."},
		{2, 2, "Clear explanations, recommended for beginners."},
	}

	for _, data := range reviewData {
		if data.offeringIndex >= len(offerings) || data.userIndex >= len(users) {
			continue
		}
		rev := models.UserReview{
			UserID:     users[data.userIndex].UserID,
			OfferingID: offerings[data.offeringIndex].OfferingID,
			Comment:    data.comment,
			Status:     models.UserReviewStatusApproved,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		config.DB.Where(models.UserReview{UserID: rev.UserID, OfferingID: rev.OfferingID, Comment: rev.Comment}).FirstOrCreate(&rev)
	}

	log.Println("✓ Reviews seeded")
}
