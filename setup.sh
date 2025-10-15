#!/bin/bash

# TransactRead Setup Script
echo "🔧 Setting up TransactRead..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "⚠️  Please update the .env file with your actual API keys and configuration."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Setup database
echo "🗄️  Setting up database..."
cd server && npx prisma generate && npx prisma db push && cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env file with your API keys"
echo "   2. Run: npm run dev"
echo "   3. Or deploy with Docker: ./deploy.sh"
