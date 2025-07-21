# Simple Vercel Deployment (with SQLite)

Since you want a database that deploys with your app, we have a few options:

## Option 1: Turso (Recommended) - Edge SQLite
Turso is SQLite for the edge, perfect for Vercel deployment.

### Setup Steps:

1. **Create a free Turso account** at https://turso.tech
2. **Create a database**:
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # Login
   turso auth login
   
   # Create database
   turso db create taskifye-db
   
   # Get connection details
   turso db show taskifye-db --url
   turso db tokens create taskifye-db
   ```

3. **Add to Vercel Environment Variables**:
   ```
   TURSO_DATABASE_URL=libsql://[your-database].turso.io
   TURSO_AUTH_TOKEN=[your-auth-token]
   ENCRYPTION_KEY=[generate-with-openssl-rand-hex-32]
   ```

4. **Deploy to Vercel** - That's it! No schema changes needed.

## Option 2: Vercel Postgres (Free Tier)
If you prefer PostgreSQL:

1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. It automatically adds DATABASE_URL
3. Change Prisma provider from "sqlite" to "postgresql"
4. Deploy

## Option 3: PlanetScale (MySQL, Free Tier)
1. Create account at planetscale.com
2. Create database
3. Get connection string
4. Add to Vercel as DATABASE_URL
5. Change Prisma provider to "mysql"

## Option 4: Keep SQLite (Not Recommended for Production)
SQLite files don't persist on Vercel's serverless functions, so data would be lost on each deployment.

## Quick Turso Setup (Recommended)

Here's the fastest way:

1. **Sign up for Turso** (free tier includes 5GB storage)
2. **Run these commands**:
   ```bash
   # One-time setup
   npm install -g @turso/cli
   turso auth login
   
   # Create database
   turso db create taskifye --region iad
   
   # Get credentials
   turso db show taskifye --url
   turso db tokens create taskifye
   ```

3. **Add to Vercel**:
   - Go to your project settings
   - Environment Variables
   - Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN

4. **Update your database client** (already done in lib/db/turso.ts)

5. **Deploy**:
   ```bash
   vercel --prod
   ```

That's it! Your SQLite database will work in production with Turso.

## Why Turso?
- It's SQLite (no schema changes needed)
- Edge-native (fast globally)
- Free tier is generous
- Works perfectly with Vercel
- No separate database server to manage

## Environment Variables Summary
```bash
# Required for Vercel deployment
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
ENCRYPTION_KEY=your-32-char-key
```

## After Deployment
1. Run database migrations:
   ```bash
   npx turso db shell taskifye < prisma/migrations/init.sql
   ```

2. Seed initial data through your app's UI or API

That's all you need for a simple deployment with an embedded database!