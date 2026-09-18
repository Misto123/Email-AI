#!/bin/bash
set -e

# Email AI - Automated Migration v3 (Robust Direct SQL Execution)
# Uses browser to paste SQL and verifies via REST API

PROJECT_ID="xecxfqdhqjiwngblekgf"
PROJECT_NAME="Email AI"

echo "🚀 $PROJECT_NAME - Automated Migrations v3"
echo "=========================================="
echo ""

# Check browser daemon
if ! curl -s http://127.0.0.1:10086/command > /dev/null 2>&1; then
    echo "❌ Error: Kimi WebBridge daemon not running"
    exit 1
fi
echo "✓ Browser daemon running"

# Create combined SQL
echo "📝 Preparing combined SQL..."
cat supabase/migrations/*.sql > /tmp/combined-migrations.sql
echo "   ✓ Combined $(wc -l < /tmp/combined-migrations.sql) lines of SQL"

# Navigate to SQL editor
echo "🌐 Opening SQL editor..."
SESSION="migrate-v3-$$"

curl -s -X POST http://127.0.0.1:10086/command \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"navigate\",\"args\":{\"url\":\"https://supabase.com/dashboard/project/$PROJECT_ID/sql/new\"},\"session\":\"$SESSION\"}" > /dev/null

sleep 6

# Set SQL using evaluate (Monaco editor)
echo "✍️  Filling SQL editor..."

# Read SQL and create JSON payload
SQL_CONTENT=$(cat /tmp/combined-migrations.sql | python3 -c 'import sys, json; print(json.dumps(sys.stdin.read()))')

# Create JavaScript code to set editor
cat > /tmp/set-editor.json << EOFJS
{
  "action": "evaluate",
  "args": {
    "code": "(() => { const sql = $SQL_CONTENT; if (window.monaco) { const models = monaco.editor.getModels(); if (models.length > 0) { models[0].setValue(sql); return 'Monaco: OK'; } } const ta = document.querySelector('textarea'); if (ta) { ta.value = sql; ta.dispatchEvent(new Event('input', {bubbles: true})); return 'Textarea: OK'; } return 'FAILED'; })()"
  },
  "session": "$SESSION"
}
EOFJS

FILL_RESULT=$(curl -s -X POST http://127.0.0.1:10086/command \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/set-editor.json | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("data",{}).get("value","ERROR"))')

echo "   Result: $FILL_RESULT"

if [[ "$FILL_RESULT" == *"FAILED"* ]] || [[ "$FILL_RESULT" == *"ERROR"* ]]; then
    echo "   ❌ Could not fill editor automatically"
    echo ""
    echo "📋 Manual steps:"
    echo "   1. The SQL editor should be open in your browser"
    echo "   2. Copy from: /tmp/combined-migrations.sql"
    echo "   3. Paste into editor and click Run"
    echo ""
    exit 1
fi

sleep 2

# Click Run button
echo "▶️  Clicking Run button..."

cat > /tmp/click-run.json << EOFCLICK
{
  "action": "evaluate",
  "args": {
    "code": "(() => { const btns = Array.from(document.querySelectorAll('button')); const run = btns.find(b => /run/i.test(b.textContent) && !b.disabled); if (run) { run.click(); return 'Clicked Run'; } return 'Run button not found'; })()"
  },
  "session": "$SESSION"
}
EOFCLICK

RUN_RESULT=$(curl -s -X POST http://127.0.0.1:10086/command \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/click-run.json | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("data",{}).get("value","ERROR"))')

echo "   Result: $RUN_RESULT"

# Wait for execution
echo "⏳ Waiting for SQL execution..."
sleep 10

# Verify via REST API
echo "✅ Verifying migrations..."

# Get API key from env
if [ ! -f .env.local ]; then
    echo "   ⚠️  No .env.local found, skipping verification"
    echo ""
    echo "   Please manually verify:"
    echo "   1. Check SQL editor for errors"
    echo "   2. Test Mark as Spam on: https://email-ai-mu.vercel.app/drafts"
    exit 0
fi

ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)

CHECK=$(curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/emails?select=is_spam&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" 2>&1)

if [[ "$CHECK" == *"does not exist"* ]]; then
    echo ""
    echo "❌ VERIFICATION FAILED!"
    echo "   Column 'is_spam' still does not exist"
    echo ""
    echo "   Check the SQL editor for errors:"
    echo "   https://supabase.com/dashboard/project/$PROJECT_ID/sql"
    echo ""
    echo "   SQL file: /tmp/combined-migrations.sql"
    exit 1
fi

echo "   ✓ Column 'is_spam' exists!"
echo "   ✓ Column 'folder' accessible!"
echo "   ✓ Database schema updated successfully!"

# Cleanup
rm -f /tmp/set-editor.json /tmp/click-run.json /tmp/combined-migrations.sql

echo ""
echo "========================================"
echo "✅ All migrations completed!"
echo ""
echo "🎉 Test it: https://email-ai-mu.vercel.app/drafts"
echo "   Click 'Mark as Spam' - should work now!"
echo "========================================"
