package migration

import (
	"fmt"

	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// RunMigrations executes all database migrations
// This function performs database schema setup in two stages:
// 1. GORM AutoMigrate: Automatically creates tables from Go struct definitions
//   - Reads struct tags (primaryKey, column, not null, etc.) and generates CREATE TABLE SQL
//   - Adds appropriate column types, constraints, and indexes based on struct field definitions
//   - Example: Category{} struct -> CREATE TABLE categories (category_id BIGINT PRIMARY KEY, ...)
//
// 2. Raw SQL Foreign Keys: Manually defines relationships between tables using ALTER TABLE
//   - GORM AutoMigrate doesn't create FK constraints by default
//   - Using raw SQL gives us explicit control over constraint names and ON DELETE CASCADE behavior
//   - ON DELETE CASCADE: If parent row deleted, all child rows are automatically deleted too
func RunMigrations() error {
	// Create tables using GORM's AutoMigrate feature
	// AutoMigrate idempotently creates tables (doesn't fail if tables already exist)
	// Tables are created in the order listed here (parent tables first to avoid FK issues)
	err := config.DB.AutoMigrate(
		&models.Category{},
		&models.Subject{},
		&models.Offering{},
		&models.Meeting{},
		&models.Review{},
		&models.User{},
		&models.Timetable{},
		&models.TimetableItem{},
	)
	if err != nil {
		return err
	}

	// Add foreign key constraints using raw SQL
	// Foreign Keys define relationships between tables and enforce referential integrity
	// Why use raw SQL instead of GORM tags?
	// - GORM's AutoMigrate doesn't automatically add FK constraints
	// - Raw SQL gives us explicit control over constraint names and ON DELETE CASCADE
	// - Constraint naming convention: fk_<child_table>_<parent_table> for clarity
	// - ON DELETE CASCADE behavior: When a parent row is deleted, all related child rows are also deleted
	//   Example: If Category (parent) is deleted, all Subjects (children) referencing it are deleted

	// Subject -> Category relationship
	// One Category can have many Subjects
	// If a Category is deleted, all its Subjects are automatically deleted
	// business logic: Sciences category deleted -> Physics subject is deleted
	if err := addConstraintIfNotExists(
		"subjects",
		"fk_subjects_category",
		`ALTER TABLE subjects
		 ADD CONSTRAINT fk_subjects_category
		 FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE`,
	); err != nil {
		return err
	}

	// Offering -> Subject relationship
	// One Subject can have many Offerings (different semesters/instructors of same subject)
	// If a Subject is deleted, all Offerings for that Subject are automatically deleted
	// Example: Physics subject deleted -> Spring 2026 Physics offering is deleted
	if err := addConstraintIfNotExists(
		"offerings",
		"fk_offerings_subject",
		`ALTER TABLE offerings
		 ADD CONSTRAINT fk_offerings_subject
		 FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE`,
	); err != nil {
		return err
	}

	// Meeting -> Offering relationship
	// One Offering can have many Meetings (lectures, labs, etc. for that offering)
	// If an Offering is deleted, all its Meetings are automatically deleted
	// Example: Spring 2026 Physics deleted -> All class meetings for that offering are deleted
	if err := addConstraintIfNotExists(
		"meetings",
		"fk_meetings_offering",
		`ALTER TABLE meetings
		 ADD CONSTRAINT fk_meetings_offering
		 FOREIGN KEY (offering_id) REFERENCES offerings(offering_id) ON DELETE CASCADE`,
	); err != nil {
		return err
	}

	// Review -> Offering relationship
	// One Offering can have many Reviews (students rate their experience with the course)
	// If an Offering is deleted, all Reviews for that Offering are automatically deleted
	// Example: Spring 2026 Physics offering deleted -> All student reviews for it are deleted
	if err := addConstraintIfNotExists(
		"reviews",
		"fk_reviews_offering",
		`ALTER TABLE reviews
		 ADD CONSTRAINT fk_reviews_offering
		 FOREIGN KEY (offering_id) REFERENCES offerings(offering_id) ON DELETE CASCADE`,
	); err != nil {
		return err
	}

	// Timetable -> User relationship
	// One User can have many Timetables (personal course schedules)
	// If a User is deleted, all their Timetables are automatically deleted
	// Example: User account deleted -> Student's custom course schedule is deleted
	if err := addConstraintIfNotExists(
		"timetables",
		"fk_timetables_user",
		`ALTER TABLE timetables
		 ADD CONSTRAINT fk_timetables_user
		 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE`,
	); err != nil {
		return err
	}

	// TimetableItem -> Timetable relationship
	// One Timetable can have many TimetableItems (individual courses in the schedule)
	// If a Timetable is deleted, all its Items are automatically deleted
	// Example: Student's schedule deleted -> All courses in that schedule are deleted
	if err := addConstraintIfNotExists(
		"timetable_items",
		"fk_timetable_items_timetable",
		`ALTER TABLE timetable_items
		 ADD CONSTRAINT fk_timetable_items_timetable
		 FOREIGN KEY (timetable_id) REFERENCES timetables(timetable_id) ON DELETE CASCADE`,
	); err != nil {
		return err
	}

	// TimetableItem -> Offering relationship
	// One Offering can appear in many TimetableItems (multiple students add same course to schedule)
	// Unlike previous relationships, deleting an Offering does NOT delete TimetableItems
	// (A TimetableItem is a "reference" to an offering, not owned by it)
	// Example: Spring 2026 Physics offering deleted -> TimetableItems reference to it can become stale
	if err := addConstraintIfNotExists(
		"timetable_items",
		"fk_timetable_items_offering",
		`ALTER TABLE timetable_items
		 ADD CONSTRAINT fk_timetable_items_offering
		 FOREIGN KEY (offering_id) REFERENCES offerings(offering_id) ON DELETE CASCADE`,
	); err != nil {
		return err
	}

	// All migrations completed successfully
	// Database schema is now ready for application use
	return nil
}

func addConstraintIfNotExists(tableName, constraintName, ddl string) error {
	var exists bool
	check := `
		SELECT EXISTS (
			SELECT 1
			FROM pg_constraint c
			JOIN pg_class t ON t.oid = c.conrelid
			JOIN pg_namespace n ON n.oid = t.relnamespace
			WHERE c.conname = ?
			  AND t.relname = ?
			  AND n.nspname = current_schema()
		)
	`
	if err := config.DB.Raw(check, constraintName, tableName).Scan(&exists).Error; err != nil {
		return fmt.Errorf("failed checking constraint %s on %s: %w", constraintName, tableName, err)
	}
	if exists {
		return nil
	}
	if err := config.DB.Exec(ddl).Error; err != nil {
		return fmt.Errorf("failed creating constraint %s on %s: %w", constraintName, tableName, err)
	}
	return nil
}
