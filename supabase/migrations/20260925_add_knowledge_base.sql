-- Add knowledge base and website URL to mailboxes
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE mailboxes ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}';

-- Index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_mailboxes_knowledge_base ON mailboxes USING GIN (knowledge_base);

-- Comment explaining the structure
COMMENT ON COLUMN mailboxes.knowledge_base IS 'Structured knowledge base: {faq: [{q,a}], website_context: string, common_responses: {type: string}, brand_voice: string}';
