-- Force add archived column to emails table
-- This migration explicitly adds the archived column if it doesn't exist

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'emails' 
          AND column_name = 'archived'
    ) THEN
        ALTER TABLE public.emails 
        ADD COLUMN archived BOOLEAN DEFAULT FALSE NOT NULL;
        
        RAISE NOTICE 'Added archived column to emails table';
    ELSE
        RAISE NOTICE 'archived column already exists';
    END IF;
END $$;

-- Create index for archived queries
CREATE INDEX IF NOT EXISTS idx_emails_archived 
ON public.emails(archived) 
WHERE archived = false;

-- Verify column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'emails' 
  AND column_name = 'archived';
