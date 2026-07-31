package repository

import (
	"database/sql"
	"encoding/json"
	"strings"
)

func parseJSONMap(raw sql.NullString) map[string]interface{} {
	if !raw.Valid {
		return nil
	}
	return parseJSONBytes([]byte(strings.TrimSpace(raw.String)))
}

func parseJSONColumn(v interface{}) map[string]interface{} {
	if v == nil {
		return nil
	}
	switch x := v.(type) {
	case []byte:
		return parseJSONBytes(x)
	case string:
		return parseJSONBytes([]byte(strings.TrimSpace(x)))
	case map[string]interface{}:
		return x
	default:
		return nil
	}
}

func parseJSONBytes(b []byte) map[string]interface{} {
	s := strings.TrimSpace(string(b))
	if s == "" || s == "null" {
		return nil
	}
	var m map[string]interface{}
	if err := json.Unmarshal(b, &m); err != nil {
		return nil
	}
	return m
}
