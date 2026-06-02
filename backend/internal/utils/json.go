package utils

import (
	"encoding/json"
	"io"
	"net/http"
)

// encode writes v as JSON to w.
func encode(w io.Writer, v interface{}) error {
	return json.NewEncoder(w).Encode(v)
}

// Decode reads and decodes a JSON request body into dest.
func Decode(r *http.Request, dest interface{}) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(dest)
}
