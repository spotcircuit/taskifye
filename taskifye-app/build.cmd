@echo off
echo 🔧 Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma generation failed
    exit /b 1
)

echo ✅ Prisma client generated successfully
echo 🏗️ Building Next.js application...
npx next build