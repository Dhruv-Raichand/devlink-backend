#!/bin/bash
set -e

cd ~/devlink-backend

echo "Pulling latest code..."
git pull origin main

echo "Stopping old container..."
docker rm -f backend || true

echo "Building Docker image..."
docker build -t devlink-backend .

echo "Starting new container..."
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name backend \
  --restart always \
  devlink-backend

echo "Backend deployed successfully!"
