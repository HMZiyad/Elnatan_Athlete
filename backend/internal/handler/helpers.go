// Package handler provides convenience helpers used by the router for inline handlers.
package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/uag/backend/internal/middleware"
	"github.com/uag/backend/internal/utils"
)

// GetUID extracts the authenticated user UUID from the request context.
func GetUID(r *http.Request) uuid.UUID {
	v := r.Context().Value(middleware.ContextKeyUserID)
	if uid, ok := v.(uuid.UUID); ok {
		return uid
	}
	return uuid.Nil
}

// ParseUUID parses a UUID URL param. Returns uuid.Nil on failure.
func ParseUUID(r *http.Request, param string) (uuid.UUID, error) {
	return uuid.Parse(chi.URLParam(r, param))
}

// DecodeBody is a shorthand for utils.Decode.
func DecodeBody(r *http.Request, dest interface{}) error {
	return utils.Decode(r, dest)
}

// OK is a shorthand for utils.Success.
func OK(w http.ResponseWriter, data interface{}) {
	utils.Success(w, data)
}

// Created is a shorthand for utils.Created.
func Created(w http.ResponseWriter, data interface{}) {
	utils.Created(w, data)
}

// NoContent is a shorthand for utils.NoContent.
func NoContent(w http.ResponseWriter) {
	utils.NoContent(w)
}

// BadReq is a shorthand for utils.BadRequest.
func BadReq(w http.ResponseWriter, code, msg string) {
	utils.BadRequest(w, code, msg)
}

// NotFoundErr is a shorthand for utils.NotFound.
func NotFoundErr(w http.ResponseWriter, resource string) {
	utils.NotFound(w, resource)
}

// InternalErr is a shorthand for utils.InternalError.
func InternalErr(w http.ResponseWriter) {
	utils.InternalError(w)
}
