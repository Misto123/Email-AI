#!/bin/bash
set -e

# Email AI - Migration Helper (Final Solution)
# Supabase CLI is blocked by org permissions, so we help with manual paste

PROJECT_ID="xecxfqdhqjiwngblekgf"
PROJECT_NAME="Email AI"

echo "🚀 $PROJECT_NAME - Migration Helper"
echo "===================================="
echo ""
echo "⚠️  Supabase CLI access blocked by organization permissions"
echo "   Using clipboard + browser method instead"
echo ""

# Create combined SQL
echo "📝 Preparing SQL..."
cat supabase/migrations/*.sql > /tmp/combined-migrations.sql
LINES=$(wc -l < /tmp/combined-migrations.sql | tr -d ' ')
echo "   ✓ Combined $LINES lines"

# Copy to clipboard
cat /tmp/combined-migrations.sql | pbcopy
echo "   ✓ Copied to clipboard"

# Open SQL editor
echo "🌐 Opening SQL editor..."
open "https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"

sleep 3

echo ""
echo "✅ Ready! Next steps:"
echo ""
echo "   1. SQL editor opened in browser"
echo "   2. SQL already in clipboard"
echo "   3. Paste (Cmd+V) and click 'Run'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 After running, verify with:"
echo ""
echo "   ./verify-migrations.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create verification script
cat > verify-migrations.sh << 'EOFVERIFY'
#!/bin/bash
echo "🔍 Verifying migrations..."

if [ ! -f .env.local ]; then
    echo "❌ No .env.local found"
    exit 1
fi

ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)
PROJECT_ID="xecxfqdhqjiwngblekgf"

CHECK=$(curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/emails?select=is_spam,folder&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" 2>&1)

if [[ "$CHECK" == *"does not exist"* ]]; then
    echo "❌ Columns still missing!"
    echo "   Response: $CHECK"
    echo ""
    echo "   The SQL may not have run, or PostgREST cache needs reload"
    exit 1
fi

echo "✅ Success! Columns exist!"
echo ""
echo "🎉 Test the app:"
echo "   https://email-ai-mu.vercel.app/drafts"
echo ""
echo "   Click 'Mark as Spam' - it should work!"
EOFVERIFY

chmod +x verify-migrations.sh

echo ""
echo "Waiting for you to paste and run..."
echo "(Press Enter when done)"
read -r

./verify-migrations.sh
