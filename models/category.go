package models

import "gorm.io/datatypes"

type Category struct {
	CategoryID int64  `gorm:"primaryKey;column:category_id" json:"category_id"`
	Slug       string `gorm:"uniqueIndex;column:slug;not null" json:"slug"`
	Name       string `gorm:"column:name;not null" json:"name"`
	SortOrder  int    `gorm:"column:sort_order;not null;default:0" json:"sort_order"`
}

func (Category) TableName() string {
	return "categories"
}
