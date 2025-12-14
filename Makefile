# Variables
IMAGE_NAME = 2048-game
CONTAINER_NAME = 2048-game-container
PORT = 3080

# Phony targets
.PHONY: build run stop clean help

# Default target
help:
	@echo "Available commands:"
	@echo "  make build  - Build Docker image"
	@echo "  make run    - Run Docker container"
	@echo "  make stop   - Stop Docker container"
	@echo "  make clean  - Remove Docker container and image"

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the Docker container
run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		$(IMAGE_NAME)
	@echo "Application is running at http://localhost:$(PORT)"

# Stop the Docker container
stop:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

# Clean up Docker resources
clean: stop
	docker rmi $(IMAGE_NAME)

# Development commands
dev:
	npm run dev 