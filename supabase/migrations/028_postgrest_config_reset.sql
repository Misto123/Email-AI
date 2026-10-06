-- Nuclear option: Modify PostgREST config directly
-- Migration: 028_postgrest_config_reset.sql

-- Check if pgrst schema exists
SELECT 
  'pgrst schema exists: ' || EXISTS(
    SELECT 1 FROM pg_namespace WHERE nspname = 'pgrst'
  )::TEXT as status;

-- Try to access postgrest internal schema
SELECT 
  'postgrest schema exists: ' || EXISTS(
    SELECT 1 FROM pg_namespace WHERE nspname = 'postgrest'
  )::TEXT as status;

-- List all schemas to see if PostgREST has internal tables
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE '%post%' OR schema_name LIKE '%rest%';

-- Check for any PostgREST-related tables
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
AND (tablename LIKE '%cache%' OR tablename LIKE '%schema%' OR tablename LIKE '%post%')
ORDER BY schemaname, tablename;

-- One more aggressive reload attempt
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Force PostgreSQL to refresh its own caches
DISCARD ALL;

COMMENT ON DATABASE postgres IS 'PostgREST reset attempted at ' || NOW()::TEXT;
