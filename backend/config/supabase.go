package config

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type SupabaseUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// supabaseTokenCacheTTL bounds how long a verified access token is trusted
// without re-checking with Supabase. Admin actions like publishing a
// timetable import fire several authenticated requests back-to-back with the
// same token (the frontend's getSession() doesn't mint a new one each call),
// so without this every one of those requests paid a full network round trip
// to Supabase's Auth API just to re-confirm the same result.
const supabaseTokenCacheTTL = 60 * time.Second

type supabaseTokenCacheEntry struct {
	user      SupabaseUser
	expiresAt time.Time
}

var (
	supabaseTokenCacheMu sync.Mutex
	supabaseTokenCache   = map[string]supabaseTokenCacheEntry{}
)

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
	if user, ok := cachedSupabaseUser(accessToken); ok {
		return &user, nil
	}

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

	cacheSupabaseUser(accessToken, user)
	return &user, nil
}

func cachedSupabaseUser(accessToken string) (SupabaseUser, bool) {
	supabaseTokenCacheMu.Lock()
	defer supabaseTokenCacheMu.Unlock()

	entry, ok := supabaseTokenCache[accessToken]
	if !ok || time.Now().After(entry.expiresAt) {
		return SupabaseUser{}, false
	}
	return entry.user, true
}

func cacheSupabaseUser(accessToken string, user SupabaseUser) {
	supabaseTokenCacheMu.Lock()
	defer supabaseTokenCacheMu.Unlock()

	supabaseTokenCache[accessToken] = supabaseTokenCacheEntry{user: user, expiresAt: time.Now().Add(supabaseTokenCacheTTL)}

	// Opportunistic cleanup so the map doesn't grow unbounded over the
	// process lifetime as distinct tokens (logins, refreshes) accumulate.
	if len(supabaseTokenCache) > 1000 {
		now := time.Now()
		for token, entry := range supabaseTokenCache {
			if now.After(entry.expiresAt) {
				delete(supabaseTokenCache, token)
			}
		}
	}
}
