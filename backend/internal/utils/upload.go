package utils

import (
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// UploadType defines allowed upload categories.
type UploadType string

const (
	UploadAvatar       UploadType = "avatar"
	UploadIDDoc        UploadType = "id_doc"
	UploadPhoto        UploadType = "photo"
	UploadClip         UploadType = "clip"
	UploadProductImage UploadType = "product_image"
)

type uploadConfig struct {
	subDir      string
	maxSizeBytes int64
	allowedMIME  []string
}

var uploadConfigs = map[UploadType]uploadConfig{
	UploadAvatar:       {subDir: "avatars", maxSizeBytes: 5 << 20, allowedMIME: []string{"image/jpeg", "image/png"}},
	UploadIDDoc:        {subDir: "id_docs", maxSizeBytes: 10 << 20, allowedMIME: []string{"image/jpeg", "image/png", "application/pdf"}},
	UploadPhoto:        {subDir: "photos", maxSizeBytes: 10 << 20, allowedMIME: []string{"image/jpeg", "image/png"}},
	UploadClip:         {subDir: "clips", maxSizeBytes: 200 << 20, allowedMIME: []string{"video/mp4", "video/quicktime"}},
	UploadProductImage: {subDir: "products", maxSizeBytes: 10 << 20, allowedMIME: []string{"image/jpeg", "image/png"}},
}

// UploadResult holds the result of a successful upload.
type UploadResult struct {
	URL       string `json:"url"`
	Type      string `json:"type"`
	SizeBytes int64  `json:"size_bytes"`
	Filename  string `json:"filename"`
}

// SaveUpload validates and saves a multipart file to local disk.
// Returns the public URL relative to BaseURL.
func SaveUpload(file multipart.File, header *multipart.FileHeader, uploadType UploadType, baseDir, baseURL string) (*UploadResult, error) {
	cfg, ok := uploadConfigs[uploadType]
	if !ok {
		return nil, fmt.Errorf("unknown upload type: %s", uploadType)
	}

	// Validate size
	if header.Size > cfg.maxSizeBytes {
		return nil, fmt.Errorf("FILE_TOO_LARGE")
	}

	// Detect MIME type
	buf := make([]byte, 512)
	n, _ := file.Read(buf)
	detectedMIME := http.DetectContentType(buf[:n])
	// Also check header's content type
	declared := header.Header.Get("Content-Type")
	if declared != "" {
		parsed, _, _ := mime.ParseMediaType(declared)
		detectedMIME = parsed
	}
	if !mimeAllowed(detectedMIME, cfg.allowedMIME) {
		return nil, fmt.Errorf("UNSUPPORTED_FILE_TYPE")
	}

	// Seek back to beginning
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}

	// Build destination path
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", uuid.New().String(), time.Now().Unix(), ext)
	destDir := filepath.Join(baseDir, cfg.subDir)
	if err := os.MkdirAll(destDir, 0755); err != nil {
		return nil, fmt.Errorf("creating upload directory: %w", err)
	}
	destPath := filepath.Join(destDir, filename)

	// Write file
	dst, err := os.Create(destPath)
	if err != nil {
		return nil, fmt.Errorf("creating destination file: %w", err)
	}
	defer dst.Close()

	written, err := io.Copy(dst, file)
	if err != nil {
		return nil, fmt.Errorf("writing file: %w", err)
	}

	// Build public URL
	publicURL := fmt.Sprintf("%s/uploads/%s/%s", strings.TrimRight(baseURL, "/"), cfg.subDir, filename)

	return &UploadResult{
		URL:       publicURL,
		Type:      string(uploadType),
		SizeBytes: written,
		Filename:  filename,
	}, nil
}

func mimeAllowed(mime string, allowed []string) bool {
	for _, a := range allowed {
		if strings.EqualFold(mime, a) {
			return true
		}
	}
	return false
}
