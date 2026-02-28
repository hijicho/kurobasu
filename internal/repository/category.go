package repository

import (
	"github.com/hageruto/kurobasu/config"
	"github.com/hageruto/kurobasu/models"
)

// =====================
// CategoryRepository: カテゴリー操作用
// =====================
// 役割：カテゴリー関連のデータベース操作を担当
// GORM (Go Object-Relational Mapping) を使用してデータベース操作をシンプル化

type CategoryRepository struct{}

// GetAllCategories: すべてのカテゴリーを sort_order の昇順で返す
// 入力：なし
// 出力：models.Category の配列、またはエラー
// DB操作：SELECT * FROM categories ORDER BY sort_order ASC
func (r *CategoryRepository) GetAllCategories() ([]models.Category, error) {
	var categories []models.Category
	// GORM の Find() メソッドで複数行を取得
	if err := config.DB.Order("sort_order ASC").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

// GetCategoryBySlug returns a category by slug
func (r *CategoryRepository) GetCategoryBySlug(slug string) (*models.Category, error) {
	var category models.Category
	if err := config.DB.Where("slug = ?", slug).First(&category).Error; err != nil {
		return nil, err
	}
	return &category, nil
}
