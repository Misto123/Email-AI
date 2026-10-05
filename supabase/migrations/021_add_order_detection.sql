-- Add order detection and auto-forwarding feature
-- Migration: 021_add_order_detection.sql

-- Create order_keywords table to store order detection patterns
CREATE TABLE IF NOT EXISTS order_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  keyword_type TEXT NOT NULL DEFAULT 'subject', -- 'subject', 'body', 'from'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create order_forwards table to store forwarding rules for detected orders
CREATE TABLE IF NOT EXISTS order_forwards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
  forward_to TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  theme_color TEXT DEFAULT '#10b981', -- Color for visual distinction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mailbox_id, forward_to)
);

-- Add order detection flag to emails table
ALTER TABLE emails ADD COLUMN IF NOT EXISTS is_order BOOLEAN DEFAULT FALSE;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS order_detected_at TIMESTAMPTZ;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS order_forwarded BOOLEAN DEFAULT FALSE;

-- Create index for faster order queries
CREATE INDEX IF NOT EXISTS idx_emails_is_order ON emails(is_order) WHERE is_order = TRUE;
CREATE INDEX IF NOT EXISTS idx_emails_order_detected ON emails(order_detected_at) WHERE order_detected_at IS NOT NULL;

-- Add common order keywords for all mailboxes
INSERT INTO order_keywords (mailbox_id, keyword, keyword_type)
SELECT 
  id as mailbox_id,
  keyword,
  'subject' as keyword_type
FROM mailboxes
CROSS JOIN (
  VALUES 
    ('order'),
    ('purchase'),
    ('payment'),
    ('invoice'),
    ('receipt'),
    ('confirmation'),
    ('order #'),
    ('order number'),
    ('thank you for your order'),
    ('your order'),
    ('new order')
) AS keywords(keyword)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE order_keywords IS 'Keywords/patterns to detect incoming orders in emails';
COMMENT ON TABLE order_forwards IS 'Auto-forward rules for detected orders';
COMMENT ON COLUMN emails.is_order IS 'TRUE if email was detected as an order';
COMMENT ON COLUMN emails.order_detected_at IS 'Timestamp when order was detected';
COMMENT ON COLUMN emails.order_forwarded IS 'TRUE if order was auto-forwarded';
