#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Vercel Deployment Script ===${NC}"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
fi

# Check if we have required environment variables
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    echo -e "${YELLOW}Run ./scripts/setup-turso.sh first to set up your database${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check for Turso credentials
if [ -z "$TURSO_DATABASE_URL" ] || [ -z "$TURSO_AUTH_TOKEN" ]; then
    echo -e "${RED}Error: Turso credentials not found in .env.local${NC}"
    echo -e "${YELLOW}Run ./scripts/setup-turso.sh to set up your database${NC}"
    exit 1
fi

echo -e "${BLUE}Pre-deployment checks...${NC}"

# 1. Run TypeScript check
echo -e "${BLUE}Running TypeScript check...${NC}"
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "${RED}TypeScript errors found. Please fix before deploying.${NC}"
    exit 1
fi

# 2. Run build locally to check for errors
echo -e "${BLUE}Running test build...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}All checks passed!${NC}"
echo ""

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel...${NC}"
echo -e "${YELLOW}Make sure you've added these environment variables to Vercel:${NC}"
echo "  - TURSO_DATABASE_URL"
echo "  - TURSO_AUTH_TOKEN"
echo "  - ENCRYPTION_KEY"
echo ""
echo -e "${YELLOW}Press Enter to continue or Ctrl+C to cancel${NC}"
read

# Deploy to production
vercel --prod

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Post-deployment steps:${NC}"
echo "1. Check your deployment at: https://taskifye.vercel.app"
echo "2. Run database migrations if needed"
echo "3. Monitor logs for any errors"