package middleware

import (
	"net/http"
	"os"
	"strings"
)

// CORS wraps a handler with CORS headers so the frontend can call the API with
// credentials such as the Authorization header.
//
// Allowed origins are read from the CORS_ALLOWED_ORIGINS env var.
func CORS(next http.Handler) http.Handler {
	allowedOrigins := parseAllowedOrigins()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" && isOriginAllowed(origin, allowedOrigins) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func parseAllowedOrigins() []string {
	raw := os.Getenv("CORS_ALLOWED_ORIGINS")
	if strings.TrimSpace(raw) == "" {
		return nil
	}

	var origins []string
	for _, o := range strings.Split(raw, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			origins = append(origins, o)
		}
	}
	return origins
}

func isOriginAllowed(origin string, allowed []string) bool {
	for _, o := range allowed {
		if o == origin {
			return true
		}
	}
	return false
}
