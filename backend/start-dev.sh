#!/bin/bash

echo "🚀 Starting MoneyCircle Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Start services with Docker Compose
echo "🐳 Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run migrations
echo "🗄️  Running database migrations..."
npm run migration:run

# Seed database
echo "🌱 Seeding database with test data..."
npm run seed

# Start the backend
echo "⚡ Starting NestJS backend..."
npm run start:dev

echo "✅ Development environment is ready!"
echo "🌐 Backend API: http://localhost:3000"
echo "📚 API Docs: http://localhost:3000/api/docs"
echo "🐘 PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"