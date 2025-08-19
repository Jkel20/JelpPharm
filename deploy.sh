#!/bin/bash

# JelpPharm Deployment Script
echo "🚀 Starting JelpPharm deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy production.env to .env and fill in your values"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output:"
    echo "   - Server: dist/"
    echo "   - Client: client/build/"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if dist and client/build directories exist
if [ -d "dist" ] && [ -d "client/build" ]; then
    echo "✅ All build artifacts present"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Deploy to your chosen platform (Heroku, Vercel, Railway, etc.)"
    echo "2. Set environment variables on your platform"
    echo "3. Connect your MongoDB Atlas database"
    echo ""
    echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Build artifacts missing!"
    exit 1
fi

echo "🎉 Deployment script completed!"
