-- Configure support@maxvisits.com and contact@kaufrank.com
-- Migration: 016_configure_purelymail_mailboxes.sql

-- Configure support@maxvisits.com
DO $$
DECLARE
  mailbox_count INTEGER;
BEGIN
  -- Check if mailbox exists
  SELECT COUNT(*) INTO mailbox_count
  FROM mailboxes
  WHERE email = 'support@maxvisits.com';
  
  IF mailbox_count > 0 THEN
    UPDATE mailboxes 
    SET 
      imap_host = 'imap.purelymail.com',
      imap_port = 993,
      smtp_host = 'smtp.purelymail.com',
      smtp_port = 465,
      encrypted_password = encode(digest('DZN*xaz6jre7zqu*zyu', 'sha256'), 'hex')
    WHERE email = 'support@maxvisits.com';
    
    RAISE NOTICE '✅ Configured support@maxvisits.com';
  ELSE
    RAISE NOTICE '⚠️ Mailbox support@maxvisits.com not found';
  END IF;
END $$;

-- Configure contact@kaufrank.com
DO $$
DECLARE
  mailbox_count INTEGER;
BEGIN
  -- Check if mailbox exists
  SELECT COUNT(*) INTO mailbox_count
  FROM mailboxes
  WHERE email = 'contact@kaufrank.com';
  
  IF mailbox_count > 0 THEN
    UPDATE mailboxes 
    SET 
      imap_host = 'imap.purelymail.com',
      imap_port = 993,
      smtp_host = 'smtp.purelymail.com',
      smtp_port = 465,
      encrypted_password = encode(digest('a6fbWu8mXx0QhI8gcLnGt', 'sha256'), 'hex')
    WHERE email = 'contact@kaufrank.com';
    
    RAISE NOTICE '✅ Configured contact@kaufrank.com';
  ELSE
    RAISE NOTICE '⚠️ Mailbox contact@kaufrank.com not found';
  END IF;
END $$;

-- Verify configuration
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'MAILBOX CONFIGURATION SUMMARY';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  FOR rec IN 
    SELECT 
      email,
      imap_host,
      imap_port,
      smtp_host,
      smtp_port,
      CASE WHEN encrypted_password IS NOT NULL THEN 'SET' ELSE 'NOT SET' END as pwd
    FROM mailboxes
    WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
    ORDER BY email
  LOOP
    RAISE NOTICE 'Email: %', rec.email;
    RAISE NOTICE '  IMAP: %:%', rec.imap_host, rec.imap_port;
    RAISE NOTICE '  SMTP: %:%', rec.smtp_host, rec.smtp_port;
    RAISE NOTICE '  Password: %', rec.pwd;
    RAISE NOTICE '';
  END LOOP;
END $$;
