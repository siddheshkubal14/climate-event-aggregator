#!/bin/bash

# set -e

# echo "Running tests..."
# npm test
# if [ $? -ne 0 ]; then
#   echo "Tests failed. Exiting deployment."
#   exit 1
# fi

# echo "Tests passed, proceeding with deployment."

# Configuration
DOCKER_USERNAME="sid0014"
DOCKER_IMAGE_NAME="climate-event-aggregator"
TAG=$(date +'%Y%m%d%H%M%S')
DOCKER_COMPOSE_FILE="docker-compose.yml"

echo "Cleaning up previous containers..."
docker compose -f $DOCKER_COMPOSE_FILE down --remove-orphans

echo "Removing old local images (if any)..."
docker rmi ${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:latest || true
docker rmi ${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:${TAG} || true

echo "Building Docker image..."
docker build -t ${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:latest .

echo "Tagging image as ${TAG}..."
docker tag ${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:latest ${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:${TAG}

echo "Pushing images to Docker Hub..."
docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:latest
docker push ${DOCKER_USERNAME}/${DOCKER_IMAGE_NAME}:${TAG}

echo "Deploying application with Docker Compose..."
docker compose -f $DOCKER_COMPOSE_FILE up -d --build

echo "Deployment complete. Service status:"
docker compose -f $DOCKER_COMPOSE_FILE ps

echo "🌐 Frontend: http://localhost:5173"
echo "🛠️ Backend (GraphQL): http://localhost:4000"
