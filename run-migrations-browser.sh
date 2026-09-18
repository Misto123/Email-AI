#!/bin/bash
set -e

# Email AI - Automated Database Migrations
# This script runs migrations using Supabase SQL Editor via browser automation

echo "🚀 Email AI - Automated Migration Runner"
echo "========================================"
echo ""

# Check if browser daemon is running
if ! curl -s http://127.0.0.1:10086/command > /dev/null 2>&1; then
    echo "❌ Error: Kimi WebBridge daemon not running"
    echo "   Start it first, then run this script again"
    exit 1
fi

echo "✓ Browser daemon running"
echo "✓ Project: xecxfqdhqjiwngblekgf (Email AI)"
echo ""

# Combined migrations file
SQL_FILE="run-all-migrations.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: $SQL_FILE not found"
    exit 1
fi

echo "📦 Loading migrations from: $SQL_FILE"
echo ""

# Read SQL content
SQL_CONTENT=$(cat "$SQL_FILE")

# Create JSON payload
python3 << EOF
import json
sql = '''$SQL_CONTENT'''
cmd = {
    "action": "navigate",
    "args": {"url": "https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new"},
    "session": "auto-migrate"
}
with open('/tmp/migrate-nav.json', 'w') as f:
    json.dump(cmd, f)
EOF

echo "🌐 Opening Supabase SQL Editor..."
curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/migrate-nav.json -H "Content-Type: application/json" > /dev/null

sleep 8

# Fill editor
echo "📝 Filling SQL editor..."
python3 << EOF
import json
with open('$SQL_FILE') as f:
    sql = f.read()
cmd = {
    "action": "fill",
    "args": {"selector": "@e49", "value": sql},
    "session": "auto-migrate"
}
with open('/tmp/migrate-fill.json', 'w') as f:
    json.dump(cmd, f)
EOF

if curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/migrate-fill.json -H "Content-Type: application/json" | grep -q '"ok":true'; then
    echo "✓ SQL loaded successfully"
else
    echo "❌ Failed to fill editor"
    exit 1
fi

# Click Run button
echo "▶️  Running migrations..."
curl -s -X POST http://127.0.0.1:10086/command -d '{"action":"click","args":{"selector":"@e49"},"session":"auto-migrate"}' > /dev/null

sleep 6

# Check result
echo "🔍 Checking results..."
curl -s -X POST http://127.0.0.1:10086/command -d '{"action":"evaluate","args":{"code":"(()=>{const t=document.body.innerText;return t.includes(\"Success\")||t.includes(\"CREATE\")?\"SUCCESS\":t.toLowerCase().includes(\"error\")?\"ERROR\":\"UNKNOWN\"})()"},"session":"auto-migrate"}' | grep -q "SUCCESS" && echo "✅ Migrations completed!" || echo "⚠️  Check dashboard for results"

echo ""
echo "========================================"
echo "Visit: https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/editor"
echo "App: https://email-ai-mu.vercel.app"
