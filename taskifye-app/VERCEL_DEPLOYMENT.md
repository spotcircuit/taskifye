# Vercel Deployment Guide

## Prerequisites

1. A Vercel account
2. Vercel CLI installed (optional): `npm i -g vercel`
3. A production database (PostgreSQL recommended)

## Step 1: Set Up Production Database

### Option A: Vercel Postgres (Easiest)
1. Go to your Vercel dashboard
2. Select your project
3. Go to the "Storage" tab
4. Click "Create Database" → "Postgres"
5. Follow the setup wizard
6. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option B: External Database Provider
Choose one of these providers:
- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech
- **PlanetScale**: https://planetscale.com
- **Railway**: https://railway.app

Get your PostgreSQL connection string in this format:
```
postgresql://username:password@host:port/database?schema=public
```

## Step 2: Configure Environment Variables in Vercel

Go to your project settings → Environment Variables and add:

```bash
# Database connection (if not using Vercel Postgres)
DATABASE_URL="your-postgresql-connection-string"

# Encryption key for API credentials (generate with: openssl rand -hex 32)
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# Optional: Specify Node version
NODE_VERSION="20.x"
```

## Step 3: Update Prisma Schema for Production

Before deploying, you need to switch from SQLite to PostgreSQL:

```bash
# Copy the production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# Commit the change
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

## Step 4: Deploy to Vercel

### Option A: Via Vercel Dashboard
1. Import your GitHub repository
2. Configure build settings:
   - Build Command: `npm run vercel-build` (should be auto-detected)
   - Output Directory: `.next` (should be auto-detected)
3. Click "Deploy"

### Option B: Via CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel

# For production deployment
vercel --prod
```

## Step 5: Initialize Production Database

After your first deployment, you need to create the database schema:

```bash
# Option 1: Use Vercel CLI to run commands
vercel env pull .env.production.local
npx prisma db push --skip-generate

# Option 2: Use the Vercel dashboard
# Go to Functions tab → Run a function
# Create an API route to run prisma.db.push()
```

## Step 6: Seed Initial Data (Optional)

Create a one-time setup API route or use Vercel Functions to seed initial data:

```typescript
// app/api/setup/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  // Protect this endpoint
  const { authorization } = request.headers
  if (authorization !== `Bearer ${process.env.SETUP_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Create initial agency and user
    const hashedPassword = await bcrypt.hash('changeme123', 10)
    
    const agency = await prisma.agency.create({
      data: {
        name: 'Your Agency',
        slug: 'your-agency',
        email: 'admin@youragency.com',
        users: {
          create: {
            email: 'admin@youragency.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          }
        }
      }
    })

    return NextResponse.json({ success: true, agencyId: agency.id })
  } catch (error) {
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}
```

## Troubleshooting

### Build Errors

1. **Prisma Generate Error**
   ```
   Error: @prisma/client did not initialize yet
   ```
   Solution: Make sure `postinstall` script runs: `"postinstall": "prisma generate"`

2. **Database Connection Error**
   ```
   Error: Can't reach database server
   ```
   Solution: Check DATABASE_URL format and whitelist Vercel IPs in your database

3. **Module Not Found**
   ```
   Module not found: Can't resolve '@prisma/client'
   ```
   Solution: Add to package.json:
   ```json
   "vercel-build": "prisma generate && next build"
   ```

### Common Issues

1. **Environment Variables Not Loading**
   - Make sure variables are added to Vercel project settings
   - Check variable names match exactly
   - Redeploy after adding variables

2. **Database Schema Out of Sync**
   - Run `prisma db push` after schema changes
   - Or use migrations: `prisma migrate deploy`

3. **Build Timeout**
   - Increase build timeout in Vercel settings
   - Optimize build by removing dev dependencies

## Production Checklist

- [ ] Database configured and accessible
- [ ] Environment variables set in Vercel
- [ ] Prisma schema updated for PostgreSQL
- [ ] Build command set to `npm run vercel-build`
- [ ] Initial admin user created
- [ ] API keys encrypted with production ENCRYPTION_KEY
- [ ] Error tracking configured (optional)
- [ ] Analytics configured (optional)

## Security Notes

1. **Never commit .env files**
2. **Use strong ENCRYPTION_KEY** - Generate with: `openssl rand -hex 32`
3. **Rotate API keys regularly**
4. **Enable Vercel's DDoS protection**
5. **Set up proper CORS headers if needed**

## Monitoring

After deployment:
1. Check Vercel Functions logs for errors
2. Monitor database connections
3. Set up alerts for failed API calls
4. Track performance metrics

## Next Steps

1. Set up custom domain
2. Configure email service for notifications
3. Set up backup strategy for database
4. Implement rate limiting
5. Add error tracking (Sentry, etc.)