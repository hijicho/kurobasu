package sheets

import (
	"context"
	"fmt"
	"os"
	"regexp"
	"strings"

	"github.com/hageruto/kurobasu/models"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

// GoogleSheetsProvider creates (and re-syncs) a real Google Sheet per batch
// via a service account. Requires the Sheets API and Drive API to be
// enabled on the backing Google Cloud project.
//
// This is a one-way export: EditLink pushes the batch's current rows into
// the sheet so it always reflects the latest draft, but nothing reads
// changes back out of the sheet. Saving edits still happens through this
// app's own admin editor, which is what publishing reads from.
type GoogleSheetsProvider struct {
	sheetsSvc *sheets.Service
	driveSvc  *drive.Service
	shareWith []string
}

func newGoogleSheetsProvider(credentialsJSON []byte) (*GoogleSheetsProvider, error) {
	ctx := context.Background()
	scopes := option.WithScopes(sheets.SpreadsheetsScope, drive.DriveFileScope)
	creds := option.WithCredentialsJSON(credentialsJSON)

	sheetsSvc, err := sheets.NewService(ctx, creds, scopes)
	if err != nil {
		return nil, fmt.Errorf("failed to init Sheets API client: %w", err)
	}
	driveSvc, err := drive.NewService(ctx, creds, scopes)
	if err != nil {
		return nil, fmt.Errorf("failed to init Drive API client: %w", err)
	}

	var shareWith []string
	if raw := strings.TrimSpace(os.Getenv("GOOGLE_SHEETS_SHARE_WITH")); raw != "" {
		for _, email := range strings.Split(raw, ",") {
			if email = strings.TrimSpace(email); email != "" {
				shareWith = append(shareWith, email)
			}
		}
	}

	return &GoogleSheetsProvider{sheetsSvc: sheetsSvc, driveSvc: driveSvc, shareWith: shareWith}, nil
}

func (p *GoogleSheetsProvider) Name() string { return "google_sheets" }

func (p *GoogleSheetsProvider) EditLink(batch *models.TimetableImportBatch, rows []models.TimetableImportRow) (string, error) {
	if id := spreadsheetIDFromURL(batch.SheetURL); id != "" {
		if err := p.writeRows(id, rows); err != nil {
			return "", err
		}
		return batch.SheetURL, nil
	}

	title := fmt.Sprintf("kurobasu 時間割インポート #%d（%s %d年度 %s）", batch.ImportBatchID, batch.CategorySlug, batch.AcademicYear, termLabel(batch.Term))
	spreadsheet, err := p.sheetsSvc.Spreadsheets.Create(&sheets.Spreadsheet{
		Properties: &sheets.SpreadsheetProperties{Title: title},
	}).Do()
	if err != nil {
		return "", fmt.Errorf("failed to create spreadsheet: %w", err)
	}

	if err := p.writeRows(spreadsheet.SpreadsheetId, rows); err != nil {
		return "", err
	}
	if err := p.share(spreadsheet.SpreadsheetId); err != nil {
		return "", err
	}

	return spreadsheet.SpreadsheetUrl, nil
}

func (p *GoogleSheetsProvider) writeRows(spreadsheetID string, rows []models.TimetableImportRow) error {
	values := [][]interface{}{{"曜日", "時限", "授業コード", "科目名称", "代表教員", "講義室", "備考"}}
	for _, row := range rows {
		values = append(values, []interface{}{
			dayLabel(row.Day), periodLabel(row.Period), row.CourseCode, row.CourseName, row.Instructor, row.Classroom, row.Note,
		})
	}

	_, err := p.sheetsSvc.Spreadsheets.Values.
		Update(spreadsheetID, "A1", &sheets.ValueRange{Values: values}).
		ValueInputOption("RAW").
		Do()
	if err != nil {
		return fmt.Errorf("failed to write rows to spreadsheet: %w", err)
	}
	return nil
}

func (p *GoogleSheetsProvider) share(spreadsheetID string) error {
	if len(p.shareWith) == 0 {
		// No specific admins configured to share with: fall back to
		// "anyone with the link can edit" so the feature still works out
		// of the box. Set GOOGLE_SHEETS_SHARE_WITH to restrict this.
		_, err := p.driveSvc.Permissions.Create(spreadsheetID, &drive.Permission{Type: "anyone", Role: "writer"}).Do()
		return err
	}
	for _, email := range p.shareWith {
		_, err := p.driveSvc.Permissions.Create(spreadsheetID, &drive.Permission{
			Type: "user", Role: "writer", EmailAddress: email,
		}).SendNotificationEmail(false).Do()
		if err != nil {
			return fmt.Errorf("failed to share spreadsheet with %s: %w", email, err)
		}
	}
	return nil
}

var spreadsheetIDRe = regexp.MustCompile(`/spreadsheets/d/([a-zA-Z0-9_-]+)`)

func spreadsheetIDFromURL(url string) string {
	m := spreadsheetIDRe.FindStringSubmatch(url)
	if len(m) < 2 {
		return ""
	}
	return m[1]
}

func dayLabel(d *int16) string {
	if d == nil {
		return ""
	}
	labels := []string{"", "月", "火", "水", "木", "金", "土", "日"}
	if int(*d) >= 1 && int(*d) < len(labels) {
		return labels[*d]
	}
	return ""
}

func periodLabel(p *int16) string {
	if p == nil {
		return ""
	}
	return fmt.Sprintf("%d限", *p)
}

func termLabel(term string) string {
	switch term {
	case "spring":
		return "前期"
	case "fall":
		return "後期"
	default:
		return term
	}
}
