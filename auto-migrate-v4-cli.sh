#!/bin/bash
set -e

# Email AI - Automated Migration v4 (Supabase CLI)
# Uses official Supabase CLI for 100% reliability

PROJECT_ID="xecxfqdhqjiwngblekgf"
PROJECT_NAME="Email AI"

echo "🚀 $PROJECT_NAME - Automated Migrations v4 (CLI)"
echo "=================================================="
echo ""

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not installed"
    echo "   Install: brew install supabase/tap/supabase"
    exit 1
fi
echo "✓ Supabase CLI installed"

# Check if logged in
echo "🔐 Checking authentication..."
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "   Please login:"
    echo "   $ supabase login"
    echo ""
    echo "   Then run this script again"
    exit 1
fi
echo "✓ Authenticated"

# Create combined SQL
echo "📝 Preparing migrations..."
cat supabase/migrations/*.sql > /tmp/combined-migrations.sql
LINES=$(wc -l < /tmp/combined-migrations.sql | tr -d ' ')
echo "   ✓ $LINES lines ready"

# Execute using CLI with project ref
echo "🔧 Executing SQL via Supabase CLI..."
echo ""

# Use db query with project ref (not --linked which has permission issues)
if supabase db query "$(cat /tmp/combined-migrations.sql)" --project-ref "$PROJECT_ID" > /tmp/migration-output.txt 2>&1; then
    echo "✅ SQL executed successfully!"
else
    echo "❌ Execution failed"
    cat /tmp/migration-output.txt
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if Network Restrictions are enabled:"
    echo "      https://supabase.com/dashboard/project/$PROJECT_ID/database/settings"
    echo "   2. If blocked, temporarily disable restrictions or add your IP"
    echo "   3. Or use manual paste: /tmp/combined-migrations.sql"
    exit 1
fi

# Verify
echo "✅ Verifying columns..."

if [ ! -f .env.local ]; then
    echo "   ⚠️  No .env.local - skipping verification"
    exit 0
fi

ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)

CHECK=$(curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/emails?select=is_spam,folder&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" 2>&1)

if [[ "$CHECK" == *"does not exist"* ]]; then
    echo ""
    echo "❌ Verification failed - columns still missing"
    echo "   This might be a PostgREST cache issue"
    echo ""
    echo "   Try restarting the Supabase project:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_ID/settings/general"
    exit 1
fi

echo "   ✓ Column 'is_spam' exists!"
echo "   ✓ Column 'folder' exists!"

rm -f /tmp/combined-migrations.sql /tmp/migration-output.txt

echo ""
echo "=================================================="
echo "✅ All migrations completed successfully!"
echo ""
echo "🎉 Test: https://email-ai-mu.vercel.app/drafts"
echo "   Mark as Spam should now work!"
echo "=================================================="
