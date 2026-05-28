#!/bin/bash
set -e

cd ~/devlink-backend

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding and restarting containers..."
docker compose down
docker compose up --build -d

echo "Cleanup unused images..."
docker image prune -f

echo "Backend deployed successfully!"
