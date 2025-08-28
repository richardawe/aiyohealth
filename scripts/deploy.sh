#!/bin/bash

# Aiyo Health Deployment Script for Railway
# This script helps prepare and deploy the application

set -e

echo "🚀 Starting Aiyo Health deployment..."

# Check if we're in the right directory
if [ ! -f "railway.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if logged into Railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged into Railway. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI found and authenticated"

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Check if build was successful
if [ ! -d "frontend/dist" ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

echo "✅ Frontend built successfully"

# Copy frontend build to backend for serving
echo "📁 Copying frontend build to backend..."
cp -r frontend/dist backend/static

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at the Railway URL"
echo "📊 Check the Railway dashboard for logs and status" 