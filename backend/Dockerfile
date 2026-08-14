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

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binaries from builder
COPY --from=builder /app/server .
COPY --from=builder /app/migrate .

# Copy .env if needed (or mount as volume)
# COPY .env .env

EXPOSE 8080

CMD ["./server"]
