-- Final attempt to configure mailboxes with verbose output
-- Migration: 018_configure_mailboxes_final.sql

-- First, check what exists
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'BEFORE UPDATE - Current State';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  FOR rec IN 
    SELECT 
      email,
      imap_host,
      imap_port,
      smtp_host,
      smtp_port,
      CASE WHEN encrypted_password IS NOT NULL THEN 'HAS PASSWORD' ELSE 'NO PASSWORD' END as pwd_status
    FROM mailboxes
    WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
  LOOP
    RAISE NOTICE 'Email: %', rec.email;
    RAISE NOTICE '  IMAP: % : %', rec.imap_host, rec.imap_port;
    RAISE NOTICE '  SMTP: % : %', rec.smtp_host, rec.smtp_port;
    RAISE NOTICE '  Password: %', rec.pwd_status;
    RAISE NOTICE '';
  END LOOP;
END $$;

-- Update support@maxvisits.com
UPDATE mailboxes 
SET 
  imap_host = 'imap.purelymail.com',
  imap_port = 993,
  smtp_host = 'smtp.purelymail.com',
  smtp_port = 465,
  encrypted_password = encode(digest('DZN*xaz6jre7zqu*zyu', 'sha256'), 'hex')
WHERE email = 'support@maxvisits.com';

-- Update contact@kaufrank.com  
UPDATE mailboxes 
SET 
  imap_host = 'imap.purelymail.com',
  imap_port = 993,
  smtp_host = 'smtp.purelymail.com',
  smtp_port = 465,
  encrypted_password = encode(digest('a6fbWu8mXx0QhI8gcLnGt', 'sha256'), 'hex')
WHERE email = 'contact@kaufrank.com';

-- Verify updates
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'AFTER UPDATE - New State';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  FOR rec IN 
    SELECT 
      email,
      imap_host,
      imap_port,
      smtp_host,
      smtp_port,
      length(encrypted_password) as pwd_len
    FROM mailboxes
    WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
  LOOP
    RAISE NOTICE 'Email: %', rec.email;
    RAISE NOTICE '  IMAP: %:%', rec.imap_host, rec.imap_port;
    RAISE NOTICE '  SMTP: %:%', rec.smtp_host, rec.smtp_port;
    RAISE NOTICE '  Password length: % chars', rec.pwd_len;
    RAISE NOTICE '';
  END LOOP;
  
  RAISE NOTICE '✅ Configuration complete!';
END $$;
