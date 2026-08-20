# Dockerfile for kurobasu Go application
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o server ./cmd/server
RUN go build -o migrate ./cmd/migrate
RUN go build -o seed ./cmd/seed
RUN go build -o import_ratings ./cmd/import_ratings
RUN go build -o import_reviews ./cmd/import_reviews

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binaries from builder
COPY --from=builder /app/server .
COPY --from=builder /app/migrate .
COPY --from=builder /app/seed .
COPY --from=builder /app/import_ratings .
COPY --from=builder /app/import_reviews .
COPY --from=builder /app/data ./data

# Copy .env if needed (or mount as volume)
# COPY .env .env

EXPOSE 8080

CMD ["./server"]
