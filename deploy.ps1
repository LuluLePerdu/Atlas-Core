# PowerShell Deployment Script for Windows
# Atlas Core Production Deployment

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('deploy', 'update', 'stop', 'logs', 'migrate', 'backup')]
    [string]$Action = 'deploy'
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Atlas Core - Deployment Script (Windows)" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running" -ForegroundColor Red
    exit 1
}

try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose found: $composeVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

# Check .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Yellow
    
    if (Test-Path ".env.production.example") {
        Copy-Item ".env.production.example" ".env"
        Write-Host "✅ .env file created from example" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env with your secure values before continuing!" -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ .env.production.example not found" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Check for placeholder values
$envContent = Get-Content ".env" -Raw
if ($envContent -match "CHANGEME") {
    Write-Host "⚠️  .env file contains CHANGEME placeholders!" -ForegroundColor Yellow
    Write-Host "Please replace all CHANGEME values with secure secrets." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file configured`n" -ForegroundColor Green

# Execute action
switch ($Action) {
    'deploy' {
        Write-Host "🏗️  Building and starting services...`n" -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml up -d --build
        
        Write-Host "`n⏳ Waiting for database to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate
        
        Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
        Write-Host "`nAccess your application at:"
        
        $domain = (Get-Content .env | Select-String "^DOMAIN=").ToString().Split('=')[1]
        $apiDomain = (Get-Content .env | Select-String "^API_DOMAIN=").ToString().Split('=')[1]
        
        Write-Host "  Frontend: https://$domain" -ForegroundColor Cyan
        Write-Host "  API: https://$apiDomain" -ForegroundColor Cyan
        Write-Host "  Traefik Dashboard: http://YOUR_SERVER_IP:8080" -ForegroundColor Cyan
    }
    
    'update' {
        Write-Host "🔄 Updating deployment...`n" -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml down
        docker-compose -f docker-compose.prod.yml up -d --build
        
        Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate
        
        Write-Host "`n✅ Update complete!" -ForegroundColor Green
    }
    
    'stop' {
        Write-Host "🛑 Stopping all services...`n" -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml down
        Write-Host "✅ All services stopped" -ForegroundColor Green
    }
    
    'logs' {
        Write-Host "📋 Showing logs (Ctrl+C to exit)...`n" -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml logs -f
    }
    
    'migrate' {
        Write-Host "🗄️  Running database migrations...`n" -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml exec backend npm run migrate
        Write-Host "`n✅ Migrations complete" -ForegroundColor Green
    }
    
    'backup' {
        $backupDir = ".\backups"
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir | Out-Null
        }
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupFile = "$backupDir\atlas_$timestamp.sql"
        
        Write-Host "💾 Creating database backup...`n" -ForegroundColor Cyan
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U atlas_admin atlas_core_prod | Out-File -FilePath $backupFile -Encoding utf8
        
        Write-Host "✅ Backup saved to: $backupFile" -ForegroundColor Green
        
        # Keep only last 7 backups
        Get-ChildItem $backupDir -Filter "atlas_*.sql" | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -Skip 7 | 
            Remove-Item
        
        Write-Host "🧹 Old backups cleaned (keeping last 7)" -ForegroundColor Green
    }
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "🎉 Done!`n" -ForegroundColor Green
