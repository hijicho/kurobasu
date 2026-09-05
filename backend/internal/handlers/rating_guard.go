package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Anti-abuse for anonymous offering ratings. There's no login requirement,
// so instead of a user_id we hand each anonymous visitor an opaque id and use
// that to dedupe repeat votes on the same offering (see
// OfferingRatingRepository.SaveRating). A per-IP rate limit backs that up in
// case a visitor clears their id / uses a new browser to vote again — it
// doesn't stop a determined person, but it raises the bar past "click the
// button a bunch of times".
//
// The id itself is sent by the frontend as the voterKeyHeader header, backed
// by localStorage rather than a cookie: the frontend and API live on
// different sites in production (Vercel + Cloud Run), so a cookie set by the
// API response is a cross-site cookie, and browsers increasingly refuse to
// store/send those (Safari ITP, Firefox ETP, Chrome's third-party-cookie
// phase-out) — which silently broke deletes ("rating not found") for anyone
// whose browser dropped the cookie between the create and delete requests.
// The legacy cookie is still read as a fallback so any pre-existing rows
// keyed by it stay reachable, but it's no longer minted for new votes.
const voterCookieName = "kb_voter"
const voterCookieMaxAge = 2 * 365 * 24 * time.Hour // ~2 years
const voterKeyHeader = "X-Voter-Key"

// voterKeyFromRequest returns the caller's anonymous voter id: the
// voterKeyHeader header if the frontend sent one, the legacy voterCookieName
// cookie if present, or a newly minted cookie-backed id otherwise (kept for
// clients that don't send the header). Only meaningful for anonymous
// (not-logged-in) requests.
func voterKeyFromRequest(w http.ResponseWriter, r *http.Request) string {
	if key := strings.TrimSpace(r.Header.Get(voterKeyHeader)); key != "" {
		return key
	}
	if c, err := r.Cookie(voterCookieName); err == nil && c.Value != "" {
		return c.Value
	}

	key := generateVoterKey()
	secure := isSecureRequest(r)
	// SameSite=None requires Secure; browsers drop such cookies over plain
	// HTTP, so local dev (http://localhost) falls back to Lax instead. Lax
	// still round-trips fine there since the frontend/backend dev ports
	// share the same site (registrable domain) per the SameSite spec.
	sameSite := http.SameSiteLaxMode
	if secure {
		sameSite = http.SameSiteNoneMode
	}
	http.SetCookie(w, &http.Cookie{
		Name:     voterCookieName,
		Value:    key,
		Path:     "/",
		MaxAge:   int(voterCookieMaxAge.Seconds()),
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSite,
	})
	return key
}

// voterKeyIfPresent returns the caller's anonymous voter id from the
// voterKeyHeader header or the legacy voterCookieName cookie, or "" if
// neither is present. Unlike voterKeyFromRequest, it never mints a new
// cookie — for read-only lookups (e.g. "what's my own rating?") and for
// deletes, where a freshly minted id obviously has no prior rating to find.
func voterKeyIfPresent(r *http.Request) string {
	if key := strings.TrimSpace(r.Header.Get(voterKeyHeader)); key != "" {
		return key
	}
	if c, err := r.Cookie(voterCookieName); err == nil {
		return c.Value
	}
	return ""
}

func generateVoterKey() string {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		// Extremely unlikely (crypto/rand failure); fall back to a
		// timestamp-derived value so the request can still proceed instead
		// of failing the rating outright.
		return hex.EncodeToString([]byte(time.Now().String()))
	}
	return hex.EncodeToString(buf)
}

func isSecureRequest(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}
	return strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
}

// clientIP extracts the caller's IP, preferring X-Forwarded-For (set by the
// reverse proxy in front of the deployed backend) over RemoteAddr.
func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if first := strings.TrimSpace(strings.Split(xff, ",")[0]); first != "" {
			return first
		}
	}
	if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return host
	}
	return r.RemoteAddr
}

const (
	ratingRateLimitWindow = 10 * time.Minute
	ratingRateLimitMax    = 10 // max anonymous rating submissions per IP per window
)

type rateLimitEntry struct {
	count      int
	windowFrom time.Time
}

var (
	ratingRateLimitMu sync.Mutex
	ratingRateLimit   = map[string]*rateLimitEntry{}
)

// allowRatingSubmission reports whether another anonymous rating submission
// from this IP is allowed right now, recording the attempt either way.
func allowRatingSubmission(ip string) bool {
	ratingRateLimitMu.Lock()
	defer ratingRateLimitMu.Unlock()

	now := time.Now()
	entry, ok := ratingRateLimit[ip]
	if !ok || now.Sub(entry.windowFrom) > ratingRateLimitWindow {
		ratingRateLimit[ip] = &rateLimitEntry{count: 1, windowFrom: now}
		return true
	}
	if entry.count >= ratingRateLimitMax {
		return false
	}
	entry.count++

	// Opportunistic cleanup so the map doesn't grow unbounded over the
	// process lifetime as distinct IPs accumulate.
	if len(ratingRateLimit) > 1000 {
		for key, e := range ratingRateLimit {
			if now.Sub(e.windowFrom) > ratingRateLimitWindow {
				delete(ratingRateLimit, key)
			}
		}
	}
	return true
}
