#!/usr/bin/env pwsh
# PowerShell build script for Taskifye

Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma client generated successfully" -ForegroundColor Green
    Write-Host "🏗️ Building Next.js application..." -ForegroundColor Blue
    npx next build
} else {
    Write-Host "❌ Prisma generation failed" -ForegroundColor Red
    exit 1
}