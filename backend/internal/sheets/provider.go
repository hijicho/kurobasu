// Package sheets provides the "editable link" a timetable import batch is
// handed off to an admin through, so parsed rows can be reviewed/fixed
// before publishing.
//
// A real Google Sheets integration needs a Google Cloud service account,
// which this project doesn't have configured yet. Rather than fake a
// Google Sheets link, Provider is an interface with two implementations:
//
//   - LocalProvider (default): points at this app's own admin editor page
//     (/admin/timetable/imports/{id}), a lightweight in-app spreadsheet.
//     This is what actually backs "保存"/"公開" today.
//   - GoogleSheetsProvider: creates and populates a real Google Sheet via
//     the Sheets/Drive APIs once GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON (or
//     _FILE) is set. It's a one-way export for now — edits made directly
//     in the Google Sheet are not read back into the app, so the in-app
//     editor stays the source of truth publishing reads from.
package sheets

import (
	"fmt"
	"os"
	"strings"

	"github.com/hageruto/kurobasu/models"
)

// Provider returns an edit link for a timetable import batch.
type Provider interface {
	// Name identifies the provider for logging/debugging (e.g. "local", "google_sheets").
	Name() string
	// EditLink returns a URL an admin can open to review/edit a batch's
	// rows. Implementations may create backing resources (e.g. a Google
	// Sheet) on first call and should be safe to call again for the same
	// batch.
	EditLink(batch *models.TimetableImportBatch, rows []models.TimetableImportRow) (string, error)
}

// NewProviderFromEnv selects a Provider based on environment configuration.
// GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON (raw JSON) or
// GOOGLE_SHEETS_SERVICE_ACCOUNT_FILE (path to a JSON key file) enables the
// real Google Sheets provider; otherwise the local in-app editor is used.
func NewProviderFromEnv() Provider {
	if creds := googleCredentialsJSON(); len(creds) > 0 {
		provider, err := newGoogleSheetsProvider(creds)
		if err == nil {
			return provider
		}
		fmt.Fprintf(os.Stderr, "sheets: failed to initialize Google Sheets provider, falling back to local editor: %v\n", err)
	}
	return NewLocalProvider(frontendBaseURL())
}

func googleCredentialsJSON() []byte {
	if raw := strings.TrimSpace(os.Getenv("GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON")); raw != "" {
		return []byte(raw)
	}
	if path := strings.TrimSpace(os.Getenv("GOOGLE_SHEETS_SERVICE_ACCOUNT_FILE")); path != "" {
		data, err := os.ReadFile(path)
		if err == nil {
			return data
		}
		fmt.Fprintf(os.Stderr, "sheets: failed to read GOOGLE_SHEETS_SERVICE_ACCOUNT_FILE: %v\n", err)
	}
	return nil
}

func frontendBaseURL() string {
	if v := strings.TrimSpace(os.Getenv("FRONTEND_BASE_URL")); v != "" {
		return strings.TrimRight(v, "/")
	}
	return "http://localhost:3000"
}

// LocalProvider points admins at this app's own admin editor page, which
// behaves like a lightweight spreadsheet (add/edit/delete rows, save,
// publish) backed directly by the batch's rows in our own database.
type LocalProvider struct {
	baseURL string
}

func NewLocalProvider(baseURL string) *LocalProvider {
	return &LocalProvider{baseURL: strings.TrimRight(baseURL, "/")}
}

func (p *LocalProvider) Name() string { return "local" }

func (p *LocalProvider) EditLink(batch *models.TimetableImportBatch, _ []models.TimetableImportRow) (string, error) {
	return fmt.Sprintf("%s/admin/timetable/imports/%d", p.baseURL, batch.ImportBatchID), nil
}
