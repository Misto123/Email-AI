-- Simple catch-all update function that PostgREST should recognize
-- Migration: 011_simple_mailbox_update.sql

-- Create a super simple function with JSON input
CREATE OR REPLACE FUNCTION update_mailbox_simple(
  mailbox_id UUID,
  config JSONB
) RETURNS mailboxes AS $$
DECLARE
  result mailboxes;
BEGIN
  UPDATE mailboxes
  SET 
    imap_host = COALESCE((config->>'imap_host')::TEXT, imap_host),
    imap_port = COALESCE((config->>'imap_port')::INTEGER, imap_port),
    smtp_host = COALESCE((config->>'smtp_host')::TEXT, smtp_host),
    smtp_port = COALESCE((config->>'smtp_port')::INTEGER, smtp_port),
    encrypted_password = COALESCE((config->>'encrypted_password')::TEXT, encrypted_password),
    default_language = COALESCE((config->>'default_language')::TEXT, default_language),
    reply_language = COALESCE((config->>'reply_language')::TEXT, reply_language),
    ai_enabled = COALESCE((config->>'ai_enabled')::BOOLEAN, ai_enabled),
    prompt = COALESCE((config->>'prompt')::TEXT, prompt)
  WHERE id = mailbox_id
  RETURNING * INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION update_mailbox_simple TO anon, authenticated;

-- Force PostgREST to notice this function
NOTIFY pgrst, 'reload schema';
