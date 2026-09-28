-- ============================================
-- COMPREHENSIVE MIGRATION - Run all at once
-- ============================================

-- 1. Add Knowledge Base columns to mailboxes
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);

-- 2. Set DeepSeek as default AI model
UPDATE settings 
SET openrouter_model = 'deepseek/deepseek-chat' 
WHERE openrouter_model IS NULL 
   OR openrouter_model = 'openai/gpt-5.6-luna';

-- If no settings exist, create one
INSERT INTO settings (openrouter_model) 
SELECT 'deepseek/deepseek-chat'
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);

-- 3. Verify migrations
SELECT 'Knowledge Base columns' AS migration, 
       CASE WHEN column_name IS NOT NULL THEN '✅ Success' ELSE '❌ Failed' END AS status
FROM information_schema.columns 
WHERE table_name = 'mailboxes' AND column_name = 'knowledge_base'
UNION ALL
SELECT 'DeepSeek default model' AS migration,
       CASE WHEN openrouter_model = 'deepseek/deepseek-chat' THEN '✅ Success' ELSE '❌ Failed' END AS status
FROM settings
LIMIT 1;
