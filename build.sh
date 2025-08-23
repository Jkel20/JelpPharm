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

# Set up client environment for production build
echo "🔧 Setting up client environment..."
cat > .env.production << EOF
REACT_APP_API_URL=https://jelppharm-pms.onrender.com/api
REACT_APP_SERVER_URL=https://jelppharm-pms.onrender.com
GENERATE_SOURCEMAP=false
NODE_ENV=production
EOF

# Build client
echo "🔨 Building client..."
npm run build

# Verify build output
echo "🔍 Verifying build output..."
if [ -f "build/index.html" ]; then
    echo "✅ Client build successful - index.html found"
else
    echo "❌ Client build failed - index.html not found"
    exit 1
fi

cd ..

echo "✅ Build completed successfully!"
