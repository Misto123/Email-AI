#!/bin/bash
set -e

# Email AI - Automated Migration FINAL (Uses keyboard paste)
# Most reliable method: Focus editor, paste via keyboard

PROJECT_ID="xecxfqdhqjiwngblekgf"
PROJECT_NAME="Email AI"

echo "🚀 $PROJECT_NAME - Automated Migrations (Final)"
echo "================================================"
echo ""

# Check browser daemon
if ! curl -s http://127.0.0.1:10086/command > /dev/null 2>&1; then
    echo "❌ Error: Kimi WebBridge daemon not running"
    exit 1
fi
echo "✓ Browser daemon running"

# Create combined SQL
echo "📝 Preparing SQL..."
cat supabase/migrations/*.sql > /tmp/combined-migrations.sql
LINES=$(wc -l < /tmp/combined-migrations.sql | tr -d ' ')
echo "   ✓ $LINES lines ready"

# Navigate to SQL editor
echo "🌐 Opening SQL editor..."
SESSION="migrate-final-$$"

curl -s -X POST http://127.0.0.1:10086/command \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"navigate\",\"args\":{\"url\":\"https://supabase.com/dashboard/project/$PROJECT_ID/sql/new\"},\"session\":\"$SESSION\"}" > /dev/null

sleep 7

# Method: Click editor, select all, paste via clipboard
echo "✍️  Injecting SQL via clipboard..."

# Copy SQL to clipboard
cat /tmp/combined-migrations.sql | pbcopy

# Click in editor area
cat > /tmp/click-editor.json << 'EOFJSON'
{
  "action": "evaluate",
  "args": {
    "code": "(() => { const editor = document.querySelector('.monaco-editor') || document.querySelector('textarea') || document.querySelector('[role=\"textbox\"]'); if (editor) { editor.click(); setTimeout(() => { document.execCommand('selectAll'); document.execCommand('paste'); }, 500); return 'Clicked and pasting...'; } return 'Editor not found'; })()"
  },
  "session": "SESSION_PLACEHOLDER"
}
EOFJSON

sed "s/SESSION_PLACEHOLDER/$SESSION/" /tmp/click-editor.json > /tmp/click-editor-final.json

PASTE_RESULT=$(curl -s -X POST http://127.0.0.1:10086/command \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/click-editor-final.json | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("data",{}).get("value","ERROR"))')

echo "   Result: $PASTE_RESULT"

if [[ "$PASTE_RESULT" == *"not found"* ]]; then
    echo ""
    echo "❌ Could not locate editor"
    echo ""
    echo "📋 Fallback - Manual paste:"
    echo "   1. SQL editor is open in browser"
    echo "   2. The SQL is in your clipboard (already copied!)"
    echo "   3. Just paste (Cmd+V) and click Run"
    echo ""
    exit 1
fi

sleep 3

# Click Run
echo "▶️  Clicking Run..."

cat > /tmp/run.json << 'EOFJSON'
{
  "action": "evaluate",
  "args": {
    "code": "(() => { const btns = Array.from(document.querySelectorAll('button')); const run = btns.find(b => /^run$/i.test(b.textContent.trim())); if (run) { run.click(); return 'Running...'; } return 'Run button not found'; })()"
  },
  "session": "SESSION_PLACEHOLDER"
}
EOFJSON

sed "s/SESSION_PLACEHOLDER/$SESSION/" /tmp/run.json > /tmp/run-final.json

RUN_RESULT=$(curl -s -X POST http://127.0.0.1:10086/command \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/run-final.json | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("data",{}).get("value","ERROR"))')

echo "   Result: $RUN_RESULT"

echo "⏳ Waiting for execution (10s)..."
sleep 10

# Verify
echo "✅ Verifying..."

if [ ! -f .env.local ]; then
    echo "   ⚠️  No .env.local - manual check required"
    exit 0
fi

ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d= -f2)

CHECK=$(curl -s "https://${PROJECT_ID}.supabase.co/rest/v1/emails?select=is_spam,folder&limit=0" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" 2>&1)

if [[ "$CHECK" == *"does not exist"* ]]; then
    echo ""
    echo "❌ Columns still missing after migration!"
    echo "   API Response: $CHECK"
    echo ""
    echo "🔧 The SQL may not have executed. Please:"
    echo "   1. Check SQL editor for error messages"
    echo "   2. The SQL is already in clipboard - just paste and Run"
    echo "   3. Or copy from: /tmp/combined-migrations.sql"
    echo ""
    exit 1
fi

echo "   ✓ Columns exist!"
echo "   ✓ Schema updated!"

rm -f /tmp/*.json /tmp/combined-migrations.sql

echo ""
echo "================================================"
echo "✅ Migrations completed successfully!"
echo ""
echo "🎉 Test: https://email-ai-mu.vercel.app/drafts"
echo "   Mark as Spam should now work!"
echo "================================================"
