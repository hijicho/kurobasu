package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// Helper functions - shared across all handlers

// successResponse sends a successful JSON response
func successResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"data": data})
}

// errorResponse sends an error JSON response with status code
func errorResponse(w http.ResponseWriter, statusCode int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
}

// extractID extracts a path parameter and converts it to int64
func extractID(r *http.Request, paramName string) int64 {
	idStr := r.PathValue(paramName)
	id, _ := strconv.ParseInt(idStr, 10, 64)
	return id
}
