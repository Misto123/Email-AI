#!/bin/bash

# Helper script to configure support@maxvisits.com
# Usage: ./configure-mailbox.sh

echo "🔐 Configure support@maxvisits.com"
echo "=================================="
echo ""

# Check if migration file exists
MIGRATION_FILE="supabase/migrations/014_configure_support_mailbox.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ Migration file not found: $MIGRATION_FILE"
  exit 1
fi

# Ask for password
echo -n "Enter PurelyMail password for support@maxvisits.com: "
read -s PASSWORD
echo ""

if [ -z "$PASSWORD" ]; then
  echo "❌ Password cannot be empty"
  exit 1
fi

# Create temporary migration with password
TEMP_FILE=$(mktemp)
sed "s/YOUR_PASSWORD_HERE/$PASSWORD/g" "$MIGRATION_FILE" > "$TEMP_FILE"

echo ""
echo "📄 Running migration..."
echo ""

# Run migration
~/.config/opencode/supabase/migrate-api.sh xecxfqdhqjiwngblekgf < "$TEMP_FILE"

# Clean up
rm "$TEMP_FILE"

echo ""
echo "✅ Done! Now test at: https://email-ai-mu.vercel.app/drafts"
echo "   Click 'Check Now' to sync emails"
