# Deployment Quick Start

## One-Time Setup (5 minutes)

1. **Create Turso Account** (free)
   ```bash
   # This will open your browser
   npm run setup:turso
   ```

2. **Follow the prompts** to:
   - Login to Turso
   - Create your database
   - Get your credentials

3. **Add to Vercel**:
   - Go to https://vercel.com/dashboard
   - Select your project (or create new)
   - Settings → Environment Variables
   - Add the 3 variables shown by the setup script:
     - `TURSO_DATABASE_URL`
     - `TURSO_AUTH_TOKEN`
     - `ENCRYPTION_KEY`

## Deploy

```bash
# Deploy to Vercel
npm run deploy

# Or quick deploy (skips checks)
npm run deploy:quick
```

## That's it! 🎉

Your app is now deployed with:
- ✅ SQLite database (via Turso)
- ✅ Global edge deployment
- ✅ Automatic SSL
- ✅ Serverless functions

## Local Development

```bash
# Start dev server (with DB check)
npm run dev

# Open Prisma Studio
npm run db:studio
```

## Troubleshooting

### "Turso not found"
```bash
# Add to your shell profile
export PATH="$HOME/.turso:$PATH"
```

### "Database not found"
```bash
# List your databases
turso db list

# Show database info
turso db show taskifye-[your-id]
```

### "Build failed on Vercel"
- Check environment variables are set
- Ensure TURSO_DATABASE_URL starts with `libsql://`
- Check build logs in Vercel dashboard