#!/bin/bash

# 🌱 Renewable Energy Platform - Backend Startup Script
echo "🌱 Starting Renewable Energy Platform Backend..."
echo "================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. You can customize it if needed."
fi

# Pull latest images
echo "📦 Pulling Docker images..."
docker-compose pull

# Start services
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U user -d renewable_energy_db > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready" 
fi

# Check MinIO
if curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
    echo "✅ MinIO is ready"
else
    echo "❌ MinIO is not ready"
fi

# Show service URLs
echo ""
echo "🎉 Services are starting up!"
echo "================================================="
echo "🔗 Service URLs:"
echo "   • API Server:     http://localhost:8000"
echo "   • API Docs:       http://localhost:8000/docs"
echo "   • MinIO Console:  http://localhost:9001"
echo "   • PostgreSQL:     localhost:5432"
echo "   • Redis:          localhost:6379"
echo ""
echo "🔑 Default Credentials:"
echo "   • Student:  admin / admin"
echo "   • Teacher:  admin1 / admin1"
echo "   • MinIO:    minioadmin / minioadmin"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f api"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "✨ Your backend is ready for action!"

# Follow API logs
echo "📋 Following API logs (Ctrl+C to stop):"
echo "================================================="
docker-compose logs -f api