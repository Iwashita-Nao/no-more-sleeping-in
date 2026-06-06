# No More Sleeping In — Setup Script
# Run this once to install Node.js (if needed) and set up the project.
# Usage: Right-click → "Run with PowerShell" OR run in PowerShell terminal

$ErrorActionPreference = "Stop"
$ProjectDir = $PSScriptRoot

Write-Host "`n=== No More Sleeping In — Setup ===" -ForegroundColor Cyan

# Check if Node.js is installed
$nodeOk = $false
try {
    $nodeVersion = (node --version 2>&1)
    if ($nodeVersion -match "v\d+") {
        Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
        $nodeOk = $true
    }
} catch { }

if (-not $nodeOk) {
    Write-Host "⚠ Node.js not found. Please install it from https://nodejs.org (LTS version)" -ForegroundColor Yellow
    Write-Host "  After installing, re-run this script." -ForegroundColor Yellow
    Start-Process "https://nodejs.org/en/download"
    pause
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
Set-Location $ProjectDir
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "❌ npm install failed" -ForegroundColor Red; exit 1 }

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the dev server:" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "To build for production:" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠  IMPORTANT: Sensors (gyroscope) only work on HTTPS or localhost." -ForegroundColor Magenta
Write-Host "   For testing on your phone, use a tunnel like ngrok or deploy to Vercel/Netlify." -ForegroundColor Magenta
