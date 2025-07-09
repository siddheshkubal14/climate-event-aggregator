#!/bin/bash

set -e

# Config
DOCKER_USERNAME="sid0014"
REPO_NAME="climate-event-aggregator"
TAG=$(date +'%Y%m%d%H%M%S')

# Step 1: Cleanup
echo "Stopping containers..."
docker compose down --remove-orphans || true

# Step 2: Remove old images
docker rmi ${DOCKER_USERNAME}/${REPO_NAME}:backend-latest || true
docker rmi ${DOCKER_USERNAME}/${REPO_NAME}:frontend-latest || true
docker rmi ${DOCKER_USERNAME}/${REPO_NAME}:simulator-latest || true

# Step 3: Build images with appropriate tags
echo "Building images..."
docker build -t ${DOCKER_USERNAME}/${REPO_NAME}:backend-latest ./backend
docker tag ${DOCKER_USERNAME}/${REPO_NAME}:backend-latest ${DOCKER_USERNAME}/${REPO_NAME}:backend-${TAG}

docker build -t ${DOCKER_USERNAME}/${REPO_NAME}:frontend-latest ./frontend
docker tag ${DOCKER_USERNAME}/${REPO_NAME}:frontend-latest ${DOCKER_USERNAME}/${REPO_NAME}:frontend-${TAG}

docker build -t ${DOCKER_USERNAME}/${REPO_NAME}:simulator-latest -f ./backend/Dockerfile.simulator ./backend
docker tag ${DOCKER_USERNAME}/${REPO_NAME}:simulator-latest ${DOCKER_USERNAME}/${REPO_NAME}:simulator-${TAG}

# Step 4: Push images to Docker Hub
echo "Pushing to Docker Hub..."
docker push ${DOCKER_USERNAME}/${REPO_NAME}:backend-latest
docker push ${DOCKER_USERNAME}/${REPO_NAME}:backend-${TAG}
docker push ${DOCKER_USERNAME}/${REPO_NAME}:frontend-latest
docker push ${DOCKER_USERNAME}/${REPO_NAME}:frontend-${TAG}
docker push ${DOCKER_USERNAME}/${REPO_NAME}:simulator-latest
docker push ${DOCKER_USERNAME}/${REPO_NAME}:simulator-${TAG}

# Step 5: Deploy using local images
echo "Deploying locally using Docker Compose..."
docker compose up -d --build

echo ""
echo "Deployment complete. Service status:"
docker compose ps
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:4000"
echo "Simulator WS: ws://localhost:8765"
echo "Redis: http://localhost:6379"
echo "To stop the application, run: docker compose -f $DOCKER_COMPOSE_FILE down"