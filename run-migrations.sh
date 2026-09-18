#!/bin/bash
set -e

# Email AI - Automated Database Migrations
# Project: xecxfqdhqjiwngblekgf

echo "🚀 Email AI - Running Database Migrations"
echo "=========================================="
echo ""

# Use PostgreSQL 16 from Homebrew
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# Database connection (from .env.local)
DB_URL="postgresql://postgres.xecxfqdhqjiwngblekgf:S%25E%5Bd%7DR3YjC8@aws-0-us-west-1.pooler.supabase.com:5432/postgres"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql not found"
    echo "   Install: brew install postgresql@16"
    exit 1
fi

echo "✓ psql found: $(which psql)"
echo "✓ Database: xecxfqdhqjiwngblekgf"
echo ""

# Test connection
echo "Testing connection..."
if ! psql "$DB_URL" -c "SELECT version();" > /dev/null 2>&1; then
    echo "❌ Connection failed!"
    echo "   Make sure the project is not paused in Supabase dashboard"
    exit 1
fi
echo "✓ Connection successful"
echo ""

# Run migrations in order
MIGRATIONS=(
    "001_email_drafts.sql"
    "002_enhancements.sql"
    "003_folders_and_spam_learning.sql"
    "004_spam_settings.sql"
    "005_connection_status.sql"
)

for migration in "${MIGRATIONS[@]}"; do
    echo "📦 Running: $migration"
    if psql "$DB_URL" -f "supabase/migrations/$migration" > /dev/null 2>&1; then
        echo "   ✓ Success"
    else
        echo "   ❌ Failed!"
        echo ""
        echo "Error details:"
        psql "$DB_URL" -f "supabase/migrations/$migration"
        exit 1
    fi
done

echo ""
echo "=========================================="
echo "✅ All migrations completed successfully!"
echo ""
echo "Your Email AI database is ready:"
echo "  • mailboxes, emails, drafts, settings tables"
echo "  • Spam detection & filtering"
echo "  • Folder organization"
echo "  • Connection status monitoring"
echo ""
echo "🎉 Visit your app: https://email-ai-mu.vercel.app"
