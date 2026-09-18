#!/bin/bash
set -e

# Email AI - Quick Migration Helper
# Opens Supabase SQL Editor so you can paste and run

echo "🚀 Email AI - Quick Migration Helper"
echo "===================================="
echo ""

# Check if browser daemon is running
if ! curl -s http://127.0.0.1:10086/command > /dev/null 2>&1; then
    echo "❌ Error: Kimi WebBridge daemon not running"
    echo "   Start it first, then run this script again"
    exit 1
fi

SQL_FILE="run-all-migrations.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: $SQL_FILE not found"
    exit 1
fi

echo "✓ Browser daemon running"
echo "✓ SQL ready: $SQL_FILE"
echo ""

# Copy SQL to clipboard
echo "📋 Copying SQL to clipboard..."
cat "$SQL_FILE" | pbcopy
echo "✓ SQL copied!"
echo ""

# Open Supabase SQL Editor
echo "🌐 Opening Supabase SQL Editor..."
python3 << 'EOF'
import json
cmd = {
    "action": "navigate",
    "args": {"url": "https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new"},
    "session": "quick-migrate"
}
with open('/tmp/open-editor.json', 'w') as f:
    json.dump(cmd, f)
EOF

curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/open-editor.json -H "Content-Type: application/json" > /dev/null

echo "✓ SQL Editor opened in browser"
echo ""
echo "===================================="
echo "✅ NEXT STEPS:"
echo ""
echo "1. The SQL is already copied to your clipboard"
echo "2. In the SQL Editor, press Cmd+V to paste"
echo "3. Click the RUN button"
echo "4. Wait ~5 seconds for completion"
echo ""
echo "That's it! Your database will be fully migrated."
echo "===================================="
