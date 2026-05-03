# Database Configuration Guide

This project supports seamless switching between **local** and **production** databases without any code changes.

## Environment Files

### `.env.local` (Active Configuration)
- **Purpose**: Used by Next.js during development and production
- **Auto-generated**: Copy from `.env.development` or `.env.production`
- **Never commit**: Already in `.gitignore`

### `.env.development` (Local Database)
- **Database**: MySQL on localhost
- **Host**: `localhost:3306`
- **User**: `root`
- **Password**: `password1`
- **Database**: `ibudget`

### `.env.production` (TiDB Cloud)
- **Database**: TiDB Cloud
- **Host**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000`
- **User**: `3jrEfY6r2Jti193.root`
- **Password**: `ysz4dcWUedfvjLnl`
- **Database**: `ibudget`

## Quick Start

### Option 1: Using the Switch Script (Recommended)

```bash
# Switch to LOCAL database
./scripts/switch-db.sh local

# Switch to PRODUCTION database
./scripts/switch-db.sh production
```

### Option 2: Manual Setup

```bash
# For local development
cp .env.development .env.local

# For production
cp .env.production .env.local
```

### Option 3: Direct Environment Variables

Set these before running your app:

**Local:**
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USERNAME=root
export DB_PASSWORD=password1
export DB_DATABASE=ibudget
export DB_ENV=development
```

**Production:**
```bash
export DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
export DB_PORT=4000
export DB_USERNAME=3jrEfY6r2Jti193.root
export DB_PASSWORD=ysz4dcWUedfvjLnl
export DB_DATABASE=ibudget
export DB_ENV=production
```

## How It Works

The database connection logic in `src/lib/db.ts` automatically detects the environment:

1. **Checks `DB_ENV` variable** - Explicit environment indicator
2. **Checks `DB_HOST`** - Determines if local or remote
3. **Adjusts connection settings**:
   - Local: Port 3306, SSL disabled, 5 connections
   - Production: Port 4000, SSL enabled, 10 connections

## Verification

After switching, verify the connection:

```bash
# Check current configuration
grep "^DB_" .env.local | grep -v "DB_PASSWORD"

# Test connection (if you have mysql-cli installed)
mysql -h $DB_HOST -u $DB_USERNAME -p$DB_PASSWORD -D $DB_DATABASE -e "SELECT 1;"
```

## Development Workflow

1. **Start with local database**:
   ```bash
   ./scripts/switch-db.sh local
   npm run dev
   ```

2. **Test with production database** (optional):
   ```bash
   ./scripts/switch-db.sh production
   npm run build
   npm start
   ```

3. **Switch back to local**:
   ```bash
   ./scripts/switch-db.sh local
   ```

## Important Notes

- ✅ **No code changes needed** - Just switch environment files
- ✅ **Same database schema** - Both use identical table structures
- ✅ **Automatic SSL handling** - Production uses SSL, local doesn't
- ✅ **Connection pooling** - Optimized for each environment
- ⚠️ **Never commit `.env.local`** - It's in `.gitignore`
- ⚠️ **Keep credentials secure** - Don't share `.env.production`

## Troubleshooting

### Connection Refused
- **Local**: Ensure MySQL is running on `localhost:3306`
- **Production**: Check internet connection and TiDB Cloud status

### Authentication Failed
- **Local**: Verify user is `root` with password `password1`
- **Production**: Verify credentials in `.env.production`

### Database Not Found
- **Local**: Create database: `CREATE DATABASE ibudget;`
- **Production**: Database should already exist in TiDB Cloud

### SSL Certificate Error
- **Production**: Ensure `DB_ENV=production` is set (enables SSL)
- **Local**: Should have SSL disabled automatically
