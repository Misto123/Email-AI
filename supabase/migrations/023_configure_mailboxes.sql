-- Configure mailboxes with IMAP/SMTP settings
-- Migration: 023_configure_mailboxes.sql

-- Configure support@maxvisits.com
UPDATE mailboxes 
SET 
  imap_host = 'imap.purelymail.com',
  imap_port = 993,
  smtp_host = 'smtp.purelymail.com',
  smtp_port = 465,
  encrypted_password = encode(digest('DZN*xaz6jre7zqu*zyu', 'sha256'), 'hex')
WHERE email = 'support@maxvisits.com';

-- Configure contact@kaufrank.com  
UPDATE mailboxes 
SET 
  imap_host = 'imap.purelymail.com',
  imap_port = 993,
  smtp_host = 'smtp.purelymail.com',
  smtp_port = 465,
  encrypted_password = encode(digest('a6fbWu8mXx0QhI8gcLnGt', 'sha256'), 'hex')
WHERE email = 'contact@kaufrank.com';

-- Verify configuration
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'MAILBOX CONFIGURATION RESULT';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  FOR rec IN 
    SELECT 
      email,
      imap_host,
      imap_port,
      smtp_host,
      smtp_port,
      CASE WHEN encrypted_password IS NOT NULL AND length(encrypted_password) > 0 
        THEN 'SET' 
        ELSE 'NOT SET' 
      END as password_status
    FROM mailboxes
    WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
    ORDER BY email
  LOOP
    RAISE NOTICE '';
    RAISE NOTICE 'Email: %', rec.email;
    RAISE NOTICE '  IMAP: %:%', rec.imap_host, rec.imap_port;
    RAISE NOTICE '  SMTP: %:%', rec.smtp_host, rec.smtp_port;
    RAISE NOTICE '  Password: %', rec.password_status;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Configuration complete!';
END $$;
