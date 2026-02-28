.PHONY: help run migrate seed clean

help:
	@echo "Available commands:"
	@echo "  make run       - Start the server"
	@echo "  make migrate   - Run database migrations"
	@echo "  make seed      - Run database seed (includes migrations)"
	@echo "  make clean     - Clean build artifacts"

run:
	go run ./cmd/server

migrate:
	go run ./cmd/migrate

seed:
	go run ./cmd/seed

clean:
	go clean
