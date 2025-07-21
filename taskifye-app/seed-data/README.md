# Seed Data Scripts

This folder contains various data seeding scripts for development and testing.

## Main Database Seed
- `prisma/seed.ts` - Main database seed (creates agencies, clients, users)

## Pipedrive Seeding Scripts
These scripts populate Pipedrive with test data:

- `seed-now.js` - Quick Pipedrive seeding with basic data
- `run-seeder.js` - Interactive Pipedrive seeding with API key prompt
- `comprehensive-seed.mjs` - Full Pipedrive data including contacts, deals, activities
- `create-more-leads.mjs` - Adds additional leads to existing Pipedrive data
- `seed-with-products.mjs` - Seeds Pipedrive with product catalog
- `simple-products-seed.mjs` - Basic product seeding
- `wipe-and-seed-pipedrive.mjs` - Clears and re-seeds Pipedrive (DESTRUCTIVE)

## Usage

### Database Seeding
```bash
DATABASE_URL="file:./dev.db" npx prisma db seed
```

### Pipedrive Seeding
Most scripts use the API key: `2911f330137024c4d04b3e0256f67d7a83102f1a`

```bash
# Quick seed
node seed-data/seed-now.js

# Interactive seed
node seed-data/run-seeder.js

# Comprehensive seed
node seed-data/comprehensive-seed.mjs
```

## Note
These are development scripts only. Do not use in production.