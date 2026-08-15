package handlers

import "strings"

func normalizeSemesterTerm(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "spring", "fall":
		return value
	default:
		return ""
	}
}
