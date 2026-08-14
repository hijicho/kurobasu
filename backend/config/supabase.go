package config

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type SupabaseUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

func SupabaseURL() string {
	return strings.TrimRight(os.Getenv("SUPABASE_URL"), "/")
}

func SupabaseAnonKey() string {
	return os.Getenv("SUPABASE_ANON_KEY")
}

func SupabaseServiceRoleKey() string {
	return os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
}

func VerifySupabaseAccessToken(ctx context.Context, accessToken string) (*SupabaseUser, error) {
	baseURL := SupabaseURL()
	anonKey := SupabaseAnonKey()
	if baseURL == "" || anonKey == "" {
		return nil, fmt.Errorf("SUPABASE_URL and SUPABASE_ANON_KEY are required")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, baseURL+"/auth/v1/user", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("apikey", anonKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("invalid supabase access token")
	}

	var user SupabaseUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	if user.ID == "" {
		return nil, fmt.Errorf("missing supabase user id")
	}

	return &user, nil
}
