#!/bin/bash

echo "🚀 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci

# Build server
echo "🔨 Building server..."
npm run build:server

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm ci

# Build client
echo "🔨 Building client..."
npm run build

echo "✅ Build completed successfully!"
