-- Create function to get mailboxes bypassing PostgREST cache
-- Migration: 025_mailbox_getter_function.sql

-- Function to get all mailbox data including IMAP/SMTP
CREATE OR REPLACE FUNCTION get_mailboxes_with_config()
RETURNS TABLE (
  id UUID,
  email TEXT,
  encrypted_password TEXT,
  ai_enabled BOOLEAN,
  prompt TEXT,
  imap_host TEXT,
  imap_port INTEGER,
  smtp_host TEXT,
  smtp_port INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.email,
    m.encrypted_password,
    m.ai_enabled,
    m.prompt,
    m.imap_host,
    m.imap_port,
    m.smtp_host,
    m.smtp_port
  FROM mailboxes m;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_mailboxes_with_config() TO authenticated;
GRANT EXECUTE ON FUNCTION get_mailboxes_with_config() TO service_role;

-- Test the function
SELECT * FROM get_mailboxes_with_config()
WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
LIMIT 2;

COMMENT ON FUNCTION get_mailboxes_with_config() IS 'Bypass PostgREST cache to get mailbox configuration';
