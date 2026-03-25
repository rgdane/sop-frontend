include .env
export $(shell sed 's/=.*//' .env)

.PHONY: help run stop restart build rebuild logs clean ps shell fresh

# Default target
help:
	@echo "Available commands:"
	@echo "  make run         - Run container"
	@echo "  make stop        - Stop container"
	@echo "  make restart     - Restart container"
	@echo "  make build       - Build docker image"
	@echo "  make rebuild     - Rebuild image without cache"
	@echo "  make logs        - Show container logs"
	@echo "  make ps          - Show running container"
	@echo "  make clean       - Remove container and image"
	@echo "  make shell       - Enter container shell"
	@echo "  make fresh       - Rebuild and run fresh container"

# Build Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Rebuild without cache
rebuild:
	docker build --no-cache --build-arg NODE_ENV=dev -t $(IMAGE_NAME) .

# Run container
run:
	docker run -d --env-file=./src/.env -p ${PORT}:${PORT} --name $(CONTAINER_NAME) $(IMAGE_NAME)

# Stop container
stop:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# Restart container
restart: stop run

# Show logs
logs:
	docker logs -f $(CONTAINER_NAME)

# Show running container
ps:
	docker ps | grep $(CONTAINER_NAME) || true

# Clean up
clean:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
	docker rmi $(IMAGE_NAME) || true

# Enter container shell
shell:
	docker exec -it $(CONTAINER_NAME) sh

# Rebuild and run fresh
fresh: clean build run
