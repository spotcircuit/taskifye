#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Turso Database Setup for Taskifye ===${NC}"
echo ""

# Check if turso is installed
if ! command -v turso &> /dev/null; then
    echo -e "${RED}Turso CLI not found. Installing...${NC}"
    curl -sSfL https://get.tur.so/install.sh | bash
    export PATH="$HOME/.turso:$PATH"
fi

# Function to generate random string
generate_random_string() {
    openssl rand -hex 16
}

# Check if we're in setup mode or deployment mode
if [ "$1" == "deploy" ]; then
    echo -e "${BLUE}Running in deployment mode...${NC}"
    
    # Check for required environment variables
    if [ -z "$TURSO_DATABASE_URL" ] || [ -z "$TURSO_AUTH_TOKEN" ]; then
        echo -e "${RED}Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Using existing Turso database${NC}"
    echo -e "URL: $TURSO_DATABASE_URL"
    
else
    echo -e "${BLUE}Running in setup mode...${NC}"
    
    # Check if user is logged in
    if ! turso auth status &> /dev/null; then
        echo -e "${YELLOW}You need to login to Turso first${NC}"
        echo -e "Opening browser for authentication..."
        turso auth login
    fi
    
    # Database name
    DB_NAME="taskifye-$(generate_random_string)"
    
    echo -e "${BLUE}Creating Turso database: $DB_NAME${NC}"
    
    # Create database
    turso db create $DB_NAME --region iad
    
    # Get database URL
    DB_URL=$(turso db show $DB_NAME --url)
    
    # Create auth token
    AUTH_TOKEN=$(turso db tokens create $DB_NAME)
    
    # Generate encryption key
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    
    echo -e "${GREEN}Database created successfully!${NC}"
    echo ""
    echo -e "${BLUE}=== Environment Variables ===${NC}"
    echo "TURSO_DATABASE_URL=$DB_URL"
    echo "TURSO_AUTH_TOKEN=$AUTH_TOKEN"
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
    echo ""
    
    # Create .env.local if it doesn't exist
    if [ ! -f .env.local ]; then
        echo -e "${BLUE}Creating .env.local file...${NC}"
        cat > .env.local << EOF
# Turso Database
TURSO_DATABASE_URL=$DB_URL
TURSO_AUTH_TOKEN=$AUTH_TOKEN

# Encryption key for API credentials
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Database URL for Prisma (using local file for development)
DATABASE_URL="file:./prisma/dev.db"
EOF
        echo -e "${GREEN}.env.local created${NC}"
    else
        echo -e "${YELLOW}.env.local already exists. Add these variables manually:${NC}"
        echo "TURSO_DATABASE_URL=$DB_URL"
        echo "TURSO_AUTH_TOKEN=$AUTH_TOKEN"
        echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
    fi
    
    echo ""
    echo -e "${BLUE}=== Next Steps ===${NC}"
    echo "1. Add these environment variables to Vercel:"
    echo "   - Go to https://vercel.com/dashboard"
    echo "   - Select your project"
    echo "   - Go to Settings > Environment Variables"
    echo "   - Add TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, and ENCRYPTION_KEY"
    echo ""
    echo "2. Run database migrations:"
    echo "   npm run db:push"
    echo ""
    echo "3. Deploy to Vercel:"
    echo "   npm run deploy"
fi