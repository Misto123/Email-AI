-- Force Supabase to reload the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify sites table exists
SELECT COUNT(*) as table_exists FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'sites';

-- Show sites table structure
\d sites
