# PowerShell Environment Setup Script
# Generates secure secrets and configures .env file

$ErrorActionPreference = "Stop"

Write-Host "`n🔐 Atlas Core - Environment Setup" -ForegroundColor Cyan
Write-Host "=================================`n" -ForegroundColor Cyan

# Check if .env already exists
if (Test-Path ".env") {
    $response = Read-Host ".env file already exists. Overwrite? (y/N)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Check example file
if (-not (Test-Path ".env.production.example")) {
    Write-Host "❌ .env.production.example not found" -ForegroundColor Red
    exit 1
}

Copy-Item ".env.production.example" ".env"
Write-Host "✅ .env file created`n" -ForegroundColor Green

# Generate secure secrets
Write-Host "🔑 Generating secure secrets..." -ForegroundColor Cyan

function Generate-SecureString {
    param([int]$Length = 32)
    
    $bytes = New-Object byte[] $Length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $base64 = [Convert]::ToBase64String($bytes)
    return $base64 -replace '[/+=]', '' | ForEach-Object { $_.Substring(0, [Math]::Min($Length, $_.Length)) }
}

$JWT_SECRET = Generate-SecureString -Length 64
$JWT_REFRESH_SECRET = Generate-SecureString -Length 64
$SESSION_SECRET = Generate-SecureString -Length 32
$DB_PASSWORD = Generate-SecureString -Length 32

Write-Host "✅ Secrets generated`n" -ForegroundColor Green

# Get domain configuration
Write-Host "📝 Domain Configuration" -ForegroundColor Cyan
Write-Host "----------------------" -ForegroundColor Cyan

$DOMAIN = Read-Host "Main domain (e.g., atlas.ludwig-emmanuel.dev)"
$API_DOMAIN = Read-Host "API domain (e.g., api.ludwig-emmanuel.dev)"
$ACME_EMAIL = Read-Host "Admin email for Let's Encrypt"

# Replace values in .env
$envContent = Get-Content ".env" -Raw

$envContent = $envContent -replace 'CHANGEME_SECURE_PASSWORD_HERE', $DB_PASSWORD
$envContent = $envContent -replace 'CHANGEME_LONG_RANDOM_SECRET_MIN_32_CHARS', $JWT_SECRET
$envContent = $envContent -replace 'CHANGEME_DIFFERENT_LONG_RANDOM_SECRET_MIN_32_CHARS', $JWT_REFRESH_SECRET
$envContent = $envContent -replace 'CHANGEME_ANOTHER_RANDOM_SECRET', $SESSION_SECRET
$envContent = $envContent -replace 'atlas\.ludwig-emmanuel\.dev', $DOMAIN
$envContent = $envContent -replace 'api\.ludwig-emmanuel\.dev', $API_DOMAIN
$envContent = $envContent -replace 'admin@ludwig-emmanuel\.dev', $ACME_EMAIL

$envContent | Set-Content ".env" -NoNewline

Write-Host "`n✅ Configuration complete!`n" -ForegroundColor Green

Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  Domain: $DOMAIN"
Write-Host "  API: $API_DOMAIN"
Write-Host "  Email: $ACME_EMAIL"

Write-Host "`n🔐 Secure secrets have been generated and saved to .env" -ForegroundColor Green

Write-Host "`n⚠️  IMPORTANT: Keep .env file secure and never commit it to git!" -ForegroundColor Yellow

Write-Host "`nNext steps:"
Write-Host "  1. Review .env file: notepad .env"
Write-Host "  2. Deploy: .\deploy.ps1 -Action deploy"
Write-Host ""
