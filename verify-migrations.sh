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
