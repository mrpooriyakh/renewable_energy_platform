@echo off
REM 🌱 Renewable Energy Platform - Backend Startup Script (Windows)
echo 🌱 Starting Renewable Energy Platform Backend...
echo =================================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/install/windows-install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ Created .env file. You can customize it if needed.
)

REM Pull latest images
echo 📦 Pulling Docker images...
docker-compose pull

REM Start services
echo 🚀 Starting all services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 Services are starting up!
echo =================================================
echo 🔗 Service URLs:
echo    • API Server:     http://localhost:8000
echo    • API Docs:       http://localhost:8000/docs
echo    • MinIO Console:  http://localhost:9001
echo    • PostgreSQL:     localhost:5432
echo    • Redis:          localhost:6379
echo.
echo 🔑 Default Credentials:
echo    • Student:  admin / admin
echo    • Teacher:  admin1 / admin1
echo    • MinIO:    minioadmin / minioadmin
echo.
echo 📊 View logs:
echo    docker-compose logs -f api
echo.
echo 🛑 Stop services:
echo    docker-compose down
echo.
echo ✨ Your backend is ready for action!
echo.

REM Ask user if they want to view logs
set /p choice="Would you like to view API logs? (y/n): "
if /i "%choice%"=="y" (
    echo 📋 Following API logs (Ctrl+C to stop):
    echo =================================================
    docker-compose logs -f api
)

pause