-- Add spam settings to settings table
-- Migration: 004_spam_settings.sql

-- Add spam_threshold and spam_keywords to settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS spam_threshold INTEGER DEFAULT 80 CHECK (spam_threshold >= 0 AND spam_threshold <= 100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS spam_keywords TEXT DEFAULT '';

-- Add comment for clarity
COMMENT ON COLUMN settings.spam_threshold IS 'Spam score threshold (0-100). Emails with score >= this value will be auto-hidden. Default: 80';
COMMENT ON COLUMN settings.spam_keywords IS 'Custom spam keywords, one per line. Used to calculate spam scores.';
