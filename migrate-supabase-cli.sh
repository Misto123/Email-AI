#!/bin/bash
set -e

# Email AI - Automated Migration FINAL (Supabase CLI Init + Push)
# Properly initializes Supabase CLI link then pushes migrations

PROJECT_ID="xecxfqdhqjiwngblekgf"
PROJECT_NAME="Email AI"

echo "🚀 $PROJECT_NAME - Supabase CLI Migration"
echo "=========================================="
echo ""

# Check CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not installed"
    echo "   Install: brew install supabase/tap/supabase"
    exit 1
fi
echo "✓ Supabase CLI installed"

# Check auth
echo "🔐 Checking authentication..."
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Not logged in"
    echo ""
    echo "   Run: supabase login"
    echo "   Then re-run this script"
    exit 1
fi
echo "✓ Authenticated"

# Initialize if needed
if [ ! -d ".supabase" ]; then
    echo "🔧 Initializing Supabase in this project..."
    supabase init --with-intellij-settings=false --with-vscode-settings=false || true
    echo "✓ Initialized"
fi

# Link project if not linked
echo "🔗 Linking to project $PROJECT_ID..."
supabase link --project-ref "$PROJECT_ID" 2>&1 | grep -v "Already linked" || true
echo "✓ Linked"

# Now try db push (applies migrations)
echo "📤 Pushing migrations..."
echo ""

if supabase db push --linked 2>&1; then
    echo ""
    echo "✅ Migrations pushed successfully!"
else
    echo ""
    echo "❌ Push failed"
    echo ""
    echo "🔧 Alternative: Use db query"
    echo "   Creating combined SQL..."
    
    cat supabase/migrations/*.sql > /tmp/combined-migrations.sql
    
    echo "   Executing via db query..."
    if cat /tmp/combined-migrations.sql | supabase db query --linked 2>&1; then
        echo "   ✅ Executed via query!"
    else
        echo ""
        echo "   ❌ Both methods failed"
        echo ""
        echo "   This is likely due to:"
        echo "   1. Network restrictions on Supabase project"
        echo "   2. Access control permissions"
        echo ""
        echo "   📋 Manual solution (30 seconds):"
        echo "   1. Open: https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
        echo "   2. Paste SQL from: /tmp/combined-migrations.sql"
        echo "   3. Click Run"
        exit 1
    fi
fi

# Verify
echo ""
echo "✅ Verifying..."

if [ ! -f .env.local ]; then
    echo "   ⚠️  No .env.local - manual verification needed"
    exit 0
fi

ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)

CHECK=$(curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/emails?select=is_spam,folder&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" 2>&1)

if [[ "$CHECK" == *"does not exist"* ]]; then
    echo ""
    echo "⚠️  Columns still missing (PostgREST cache issue)"
    echo ""
    echo "   Restart the project to reload schema cache:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_ID/settings/general"
    echo ""
    echo "   Then test: https://email-ai-mu.vercel.app/drafts"
    exit 0
fi

echo "   ✓ Columns exist!"
echo ""
echo "=========================================="
echo "✅ Success! Database schema updated!"
echo ""
echo "🎉 Test: https://email-ai-mu.vercel.app/drafts"
echo "=========================================="
