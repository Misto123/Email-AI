-- Create SQL function to update mailbox bypassing PostgREST cache
-- Migration: 010_mailbox_update_function.sql

-- Drop function if exists
DROP FUNCTION IF EXISTS update_mailbox_config;

-- Create function to update mailbox configuration
CREATE OR REPLACE FUNCTION update_mailbox_config(
  p_mailbox_id UUID,
  p_imap_host TEXT DEFAULT NULL,
  p_imap_port INTEGER DEFAULT NULL,
  p_smtp_host TEXT DEFAULT NULL,
  p_smtp_port INTEGER DEFAULT NULL,
  p_encrypted_password TEXT DEFAULT NULL
) RETURNS SETOF mailboxes AS $$
BEGIN
  RETURN QUERY
  UPDATE mailboxes
  SET 
    imap_host = COALESCE(p_imap_host, imap_host),
    imap_port = COALESCE(p_imap_port, imap_port),
    smtp_host = COALESCE(p_smtp_host, smtp_host),
    smtp_port = COALESCE(p_smtp_port, smtp_port),
    encrypted_password = COALESCE(p_encrypted_password, encrypted_password)
  WHERE id = p_mailbox_id
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION update_mailbox_config TO anon, authenticated;
