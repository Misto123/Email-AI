#!/bin/bash

# Supabase Database Setup Script
# Run this to create all tables in Supabase

SUPABASE_DB_URL="postgresql://postgres:4s,JM4f4xQ9=@db.gmsrnnwaripxnkfyiydi.supabase.co:5432/postgres"

echo "🚀 Setting up Supabase database..."
echo "📦 Installing required packages..."

npm install @supabase/supabase-js

echo ""
echo "📝 Database migration SQL is ready in: supabase-setup.sql"
echo ""
echo "⚠️  MANUAL STEPS REQUIRED:"
echo ""
echo "1. Go to https://supabase.com/dashboard/project/gmsrnnwaripxnkfyiydi"
echo "2. Click on 'SQL Editor' in the left sidebar"
echo "3. Click 'New Query'"
echo "4. Copy the contents of 'supabase-setup.sql' into the editor"
echo "5. Click 'Run' to execute the migration"
echo ""
echo "Alternatively, run via psql if available:"
echo "PGPASSWORD='4s,JM4f4xQ9=' psql -h db.gmsrnnwaripxnkfyiydi.supabase.co -U postgres -d postgres -f supabase-setup.sql"
echo ""
echo "✅ After running the migration, your database will have:"
echo "   - coupons table with security features"
echo "   - domains table for multi-domain support"
echo "   - domain_coupons junction table"
echo "   - admin_users table"
echo "   - admin_activity_log table"
echo "   - Sample coupon data"
echo ""
