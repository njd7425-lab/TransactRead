#!/bin/bash

# TransactRead Deployment Script
echo "🚀 Starting TransactRead deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp env.example .env
    echo "📝 Please update the .env file with your actual API keys and configuration."
    echo "   Required: ETHERSCAN_API_KEY, GEMINI_API_KEY, Firebase credentials"
    exit 1
fi

# Build and start the application
echo "🔨 Building Docker image..."
docker-compose build

echo "🚀 Starting application..."
docker-compose up -d

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access the application at: http://localhost:3001"
    echo "📊 Health check: http://localhost:3001/api/health"
else
    echo "❌ Application failed to start. Check the logs:"
    docker-compose logs
    exit 1
fi

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env file with your API keys"
echo "   2. Restart with: docker-compose restart"
echo "   3. View logs with: docker-compose logs -f"
echo "   4. Stop with: docker-compose down"
