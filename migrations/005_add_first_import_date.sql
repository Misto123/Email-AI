-- Migration: Add first_import_date to mailboxes
-- Date: 2026-09-29
-- Purpose: Track when each mailbox started importing emails

-- Add first_import_date column to mailboxes
ALTER TABLE mailboxes
ADD COLUMN IF NOT EXISTS first_import_date TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN mailboxes.first_import_date IS 'Date when first email was imported from this mailbox';
