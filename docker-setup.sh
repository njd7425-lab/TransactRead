#!/bin/bash

# TransactRead Docker Setup Script
echo "🐳 Setting up TransactRead with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp docker.env.example .env
    echo "⚠️  Please edit .env file with your API keys before running the application."
    echo "   Required keys: ETHERSCAN_API_KEY, GEMINI_API_KEY, FIREBASE_*"
fi

# Build and start the application
echo "🔨 Building and starting TransactRead..."
docker-compose up --build -d

# Wait for the application to start
echo "⏳ Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ TransactRead is running successfully!"
    echo "🌐 Frontend: http://localhost:3001"
    echo "🔍 Health Check: http://localhost:3001/api/health"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Initialize database: docker-compose exec app npm run seed"
    echo "   2. View logs: docker-compose logs -f"
    echo "   3. Stop application: docker-compose down"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
    exit 1
fi
