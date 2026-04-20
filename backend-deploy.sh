#!/bin/bash

cd ~/devlink-backend

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building project..."
npm run build

echo "Reloading server..."
pm2 reload devlink-backend || pm2 start dist/app.js --name devlink-backend

echo "Backend deployed!"
