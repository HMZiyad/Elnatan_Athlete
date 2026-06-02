# ─── Build Stage ──────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build both binaries
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/worker ./cmd/worker

# ─── API Runtime Stage ────────────────────────────────────────
FROM alpine:3.20 AS api

RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app

COPY --from=builder /bin/api .
COPY --from=builder /app/internal/database/migrations ./internal/database/migrations

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8080

CMD ["./api"]
