-- Add comprehensive logging for all operations
-- Migration: 015_add_logging_tables.sql

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL, -- 'email_received', 'email_sent', 'draft_generated', 'forward_sent', 'check_mail', 'error'
  mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
  user_action TEXT, -- 'manual' or 'automatic'
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp ON activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_event_type ON activity_log(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_mailbox ON activity_log(mailbox_id);

-- Email send log (for forwards and AI replies)
CREATE TABLE IF NOT EXISTS email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
  to_email TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  send_type TEXT, -- 'forward', 'reply', 'manual'
  status TEXT, -- 'sent', 'failed', 'pending'
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_send_log_mailbox ON email_send_log(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_email_send_log_status ON email_send_log(status);
CREATE INDEX IF NOT EXISTS idx_email_send_log_sent_at ON email_send_log(sent_at DESC);

-- Error log
CREATE TABLE IF NOT EXISTS error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL, -- 'imap_error', 'smtp_error', 'api_error', 'database_error'
  mailbox_id UUID REFERENCES mailboxes(id) ON DELETE CASCADE,
  error_code TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_error_log_created ON error_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_log_type ON error_log(error_type);
CREATE INDEX IF NOT EXISTS idx_error_log_resolved ON error_log(resolved) WHERE NOT resolved;

-- Grant access
GRANT ALL ON activity_log TO service_role, authenticated;
GRANT ALL ON email_send_log TO service_role, authenticated;
GRANT ALL ON error_log TO service_role, authenticated;

-- RLS policies (allow all for service_role)
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_send_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON activity_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON email_send_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON error_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Helper function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_event_type TEXT,
  p_mailbox_id UUID DEFAULT NULL,
  p_email_id UUID DEFAULT NULL,
  p_draft_id UUID DEFAULT NULL,
  p_user_action TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_log(event_type, mailbox_id, email_id, draft_id, user_action, details, error_message)
  VALUES (p_event_type, p_mailbox_id, p_email_id, p_draft_id, p_user_action, p_details, p_error_message)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION log_activity TO service_role, authenticated;

COMMENT ON TABLE activity_log IS 'Comprehensive activity log for all email operations';
COMMENT ON TABLE email_send_log IS 'Log of all emails sent (forwards and replies)';
COMMENT ON TABLE error_log IS 'Log of all errors with context';
