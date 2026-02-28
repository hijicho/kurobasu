package handlers

import (
	"net/http"

	"github.com/hageruto/kurobasu/internal/dto"
	"github.com/hageruto/kurobasu/internal/repository"
)

// ListCategories - GET /api/v1/categories
func ListCategories(w http.ResponseWriter, r *http.Request) {
	repo := &repository.CategoryRepository{}
	categories, err := repo.GetAllCategories()
	if err != nil {
		errorResponse(w, http.StatusInternalServerError, "Failed to fetch categories")
		return
	}

	items := make([]dto.CategoryResponse, len(categories))
	for i, cat := range categories {
		items[i] = dto.CategoryResponse{
			CategoryID: cat.CategoryID,
			Slug:       cat.Slug,
			Name:       cat.Name,
			SortOrder:  cat.SortOrder,
		}
	}

	successResponse(w, dto.ListResponse{Items: items})
}
