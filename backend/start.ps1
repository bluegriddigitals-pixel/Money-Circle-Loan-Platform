# MoneyCircle Windows Setup Script
Write-Host "🚀 Starting MoneyCircle Development Environment..." -ForegroundColor Green

# Check Docker
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start databases
Write-Host "🐳 Starting PostgreSQL and Redis..." -ForegroundColor Cyan
docker-compose up -d

# Wait for databases
Write-Host "⏳ Waiting for databases to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if .env exists
if (!(Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file with your settings" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Build project
Write-Host "🔨 Building project..." -ForegroundColor Cyan
npm run build

# Create database if not exists
Write-Host "🗄️ Creating database..." -ForegroundColor Cyan
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE moneycircle;" 2>$null | Out-Null

# Run seed
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
npm run seed

Write-Host "✅ Setup complete! Run: npm run start:dev" -ForegroundColor Green
Write-Host "🌐 API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📚 Docs: http://localhost:3000/api/docs" -ForegroundColor Cyan