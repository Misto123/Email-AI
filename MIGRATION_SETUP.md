# Supabase Migration Setup Guide

## Quick Start

### Step 1: Get Your Database Connection String

1. Go to your Supabase project: https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/settings/database
2. Scroll to "Connection String"
3. Select **URI** format
4. Click "Show" to reveal your password
5. Copy the entire connection string

It will look like:
```
postgresql://postgres.xecxfqdhqjiwngblekgf:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 2: Add to .env.local

Open `.env.local` and add this line (replace `[YOUR-PASSWORD]` with your actual password):

```bash
DATABASE_URL=postgresql://postgres.xecxfqdhqjiwngblekgf:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Step 3: Run Migrations

```bash
# Run all pending migrations
npm run migrate

# Or run a specific migration
npm run migrate 003
npm run migrate 004
npm run migrate 005
```

## Available Migrations

- **003_folders_and_spam_learning.sql** - Adds folder, is_spam, spam_training table
- **004_spam_settings.sql** - Adds spam_threshold and spam_keywords to settings
- **005_connection_status.sql** - Adds IMAP/SMTP connection monitoring columns

## What the Script Does

✅ Runs migrations in a transaction (rolls back on error)
✅ Provides clear success/failure messages
✅ Shows which migration failed and why
✅ Safe to run multiple times (IF NOT EXISTS checks in migrations)

## Troubleshooting

**Error: "relation already exists"**
- This is normal - the table/column already exists
- The migration was already applied
- You can safely ignore this

**Error: "Missing DATABASE_URL"**
- Follow Step 1 & 2 above
- Make sure you saved .env.local
- Restart your terminal/IDE if needed

**Error: "Connection refused"**
- Check your password is correct
- Make sure you copied the full connection string
- Verify your Supabase project is active

## Manual Alternative

If you prefer to run migrations manually:

1. Go to: https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/editor
2. Click "SQL Editor" 
3. Click "New Query"
4. Copy/paste the migration file content
5. Click "Run"

Repeat for each migration file in `supabase/migrations/`
