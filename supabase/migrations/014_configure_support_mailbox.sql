-- Configure support@maxvisits.com mailbox
-- Migration: 014_configure_support_mailbox.sql
-- IMPORTANT: Replace 'YOUR_PASSWORD_HERE' with actual password before running

-- Find the mailbox
DO $$
DECLARE
  mailbox_id UUID;
  test_password TEXT := 'YOUR_PASSWORD_HERE';  -- REPLACE THIS
BEGIN
  -- Get mailbox ID
  SELECT id INTO mailbox_id
  FROM mailboxes
  WHERE email = 'support@maxvisits.com';
  
  IF mailbox_id IS NULL THEN
    RAISE EXCEPTION 'Mailbox support@maxvisits.com not found!';
  END IF;
  
  -- Update configuration
  UPDATE mailboxes
  SET 
    imap_host = 'imap.purelymail.com',
    imap_port = 993,
    smtp_host = 'smtp.purelymail.com',
    smtp_port = 465,
    encrypted_password = encode(digest(test_password, 'sha256'), 'hex')
  WHERE id = mailbox_id;
  
  RAISE NOTICE 'Configured support@maxvisits.com with ID: %', mailbox_id;
END $$;

-- Verify the configuration
SELECT 
  email,
  imap_host,
  imap_port,
  smtp_host,
  smtp_port,
  imap_status,
  smtp_status,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN '✓ Password set'
    ELSE '✗ No password'
  END as password_status
FROM mailboxes
WHERE email = 'support@maxvisits.com';
