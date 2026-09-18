#!/bin/bash
set -e

# Email AI - Fully Automated Migration with Account Check
# Ensures correct Supabase account before running migrations

PROJECT_ID="xecxfqdhqjiwngblekgf"
PROJECT_NAME="Email AI"
REQUIRED_ORG="T1954Edu"

echo "🚀 $PROJECT_NAME - Automated Migrations"
echo "========================================"
echo ""

# Check if browser daemon is running
if ! curl -s http://127.0.0.1:10086/command > /dev/null 2>&1; then
    echo "❌ Error: Kimi WebBridge daemon not running"
    echo "   Start it first, then run this script again"
    exit 1
fi

echo "✓ Browser daemon running"

# Check logged-in organization
echo "🔍 Verifying Supabase account..."

SESSION="migrate-$$"

python3 << EOF
import json
cmd = {
    "action": "navigate",
    "args": {"url": "https://supabase.com/dashboard"},
    "session": "$SESSION"
}
with open('/tmp/nav-check-$$.json', 'w') as f:
    json.dump(cmd, f)
EOF

curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/nav-check-$$.json -H "Content-Type: application/json" > /dev/null
sleep 3

python3 << EOF
import json
cmd = {
    "action": "evaluate",
    "args": {
        "code": "(()=>{const t=document.body.innerText;return t.includes('$REQUIRED_ORG')?'$REQUIRED_ORG':'WRONG_ACCOUNT'})()"
    },
    "session": "$SESSION"
}
with open('/tmp/check-org-$$.json', 'w') as f:
    json.dump(cmd, f)
EOF

CURRENT_ORG=$(curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/check-org-$$.json -H "Content-Type: application/json" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('data',{}).get('value','UNKNOWN'))")

if [ "$CURRENT_ORG" != "$REQUIRED_ORG" ]; then
    echo "❌ Wrong Supabase account!"
    echo "   Current: $CURRENT_ORG"
    echo "   Required: $REQUIRED_ORG"
    echo ""
    echo "   Please:"
    echo "   1. Go to https://supabase.com/dashboard"
    echo "   2. Click your profile → Switch organization"
    echo "   3. Select '$REQUIRED_ORG'"
    echo "   4. Run this script again"
    exit 1
fi

echo "✓ Correct account: $REQUIRED_ORG"
echo "✓ Project: $PROJECT_ID ($PROJECT_NAME)"
echo ""

# Migration files in order
MIGRATIONS=(
    "001_email_drafts.sql"
    "002_enhancements.sql"
    "003_folders_and_spam_learning.sql"
    "004_spam_settings.sql"
    "005_connection_status.sql"
)

# Function to run a single migration
run_migration() {
    local file=$1
    local name=$2
    
    echo "📦 Running: $name"
    
    # Navigate to SQL editor
    python3 << EOF
import json
cmd = {
    "action": "navigate",
    "args": {"url": "https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"},
    "session": "$SESSION"
}
with open('/tmp/nav-$$.json', 'w') as f:
    json.dump(cmd, f)
EOF
    
    curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/nav-$$.json -H "Content-Type: application/json" > /dev/null
    sleep 5
    
    # Fill SQL
    python3 << EOF
import json
with open('supabase/migrations/$file') as f:
    sql = f.read()
cmd = {
    "action": "fill",
    "args": {"selector": "textarea", "value": sql},
    "session": "$SESSION"
}
with open('/tmp/fill-$$.json', 'w') as f:
    json.dump(cmd, f)
EOF
    
    if ! curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/fill-$$.json -H "Content-Type: application/json" | grep -q '"ok":true'; then
        echo "   ❌ Failed to fill SQL"
        return 1
    fi
    
    sleep 2
    
    # Click Run
    python3 << EOF
import json
cmd = {
    "action": "click",
    "args": {"selector": "button:has-text('Run')"},
    "session": "$SESSION"
}
with open('/tmp/run-$$.json', 'w') as f:
    json.dump(cmd, f)
EOF
    
    curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/run-$$.json -H "Content-Type: application/json" > /dev/null
    sleep 4
    
    # Check for errors
    python3 << EOF
import json
cmd = {
    "action": "evaluate",
    "args": {
        "code": "(()=>{const t=document.body.innerText.toLowerCase();return t.includes('error')?'ERROR':'SUCCESS'})()"
    },
    "session": "$SESSION"
}
with open('/tmp/check-$$.json', 'w') as f:
    json.dump(cmd, f)
EOF
    
    RESULT=$(curl -s -X POST http://127.0.0.1:10086/command --data-binary @/tmp/check-$$.json -H "Content-Type: application/json" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('data',{}).get('value','UNKNOWN'))")
    
    if [ "$RESULT" = "ERROR" ]; then
        echo "   ❌ Migration failed!"
        return 1
    fi
    
    echo "   ✓ Success"
    sleep 1
}

# Run each migration
for i in "${!MIGRATIONS[@]}"; do
    num=$((i + 1))
    run_migration "${MIGRATIONS[$i]}" "Migration $num: ${MIGRATIONS[$i]}"
    
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Migration failed at step $num"
        echo "   Check: https://supabase.com/dashboard/project/$PROJECT_ID/sql"
        rm -f /tmp/*-$$.json
        exit 1
    fi
done

# Cleanup
rm -f /tmp/*-$$.json

echo ""
echo "========================================"
echo "✅ All 5 migrations completed successfully!"
echo ""
echo "Database is ready with:"
echo "  • Tables: mailboxes, emails, drafts, settings, folders"
echo "  • Spam detection & filtering"
echo "  • Connection monitoring"
echo "  • Email threading"
echo ""
echo "🎉 Visit: https://email-ai-mu.vercel.app"
echo "========================================"
