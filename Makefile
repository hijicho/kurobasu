.PHONY: help run migrate clean

help:
	@echo "Available commands:"
	@echo "  make run       - Start the server"
	@echo "  make migrate   - Run database migrations"
	@echo "  make clean     - Clean build artifacts"

run:
	go run ./cmd/server

migrate:
	go run ./cmd/migrate

clean:
	go clean
