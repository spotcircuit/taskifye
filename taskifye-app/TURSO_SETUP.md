# Turso Database Setup Guide

## Step 1: Create Turso Account

1. Go to https://turso.tech and sign up (free)
2. Verify your email

## Step 2: Install Turso CLI

```bash
# If not already installed
curl -sSfL https://get.tur.so/install.sh | bash

# Add to PATH (add this to your ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.turso:$PATH"
```

## Step 3: Login to Turso

```bash
turso auth login
```

This will open your browser. Login with your Turso account.

## Step 4: Create Database

```bash
# Create a new database
turso db create taskifye --region iad

# Get your database URL
turso db show taskifye --url

# Create an auth token
turso db tokens create taskifye
```

## Step 5: Save Credentials

Create a `.env.local` file:

```env
# Turso Database (for production)
TURSO_DATABASE_URL=libsql://taskifye-[your-username].turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Encryption key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=your-32-character-encryption-key

# Local database for development
DATABASE_URL=file:./prisma/dev.db
```

## Step 6: Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:
   - `TURSO_DATABASE_URL` - Your Turso database URL
   - `TURSO_AUTH_TOKEN` - Your auth token
   - `ENCRYPTION_KEY` - Your encryption key

## Step 7: Deploy

```bash
# Deploy to Vercel
vercel --prod

# Or use our script
npm run deploy
```

## Troubleshooting

### "turso: command not found"
```bash
# Make sure Turso is in your PATH
export PATH="$HOME/.turso:$PATH"
```

### "Authentication required"
```bash
# Login again
turso auth login
```

### Database Connection Issues
```bash
# List your databases
turso db list

# Check database details
turso db show taskifye
```

## Local Development

For local development, the app uses SQLite file (`prisma/dev.db`).
In production on Vercel, it automatically switches to Turso.

```bash
# Run locally
npm run dev

# Open Prisma Studio
npm run db:studio
```