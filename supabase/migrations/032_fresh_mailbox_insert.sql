-- Fresh mailbox insert - DELETE and re-insert
-- Migration: 032_fresh_mailbox_insert.sql

-- Delete any existing mailboxes
DELETE FROM mailboxes;

-- Insert PurelyMail configured mailboxes
INSERT INTO mailboxes (email, encrypted_password, ai_enabled, imap_host, imap_port, smtp_host, smtp_port)
VALUES 
  ('support@maxvisits.com', 
   encode(digest('DZN*xaz6jre7zqu*zyu', 'sha256'), 'hex'),
   true,
   'imap.purelymail.com', 993, 'smtp.purelymail.com', 465),
   
  ('contact@kaufrank.com',
   encode(digest('a6fbWu8mXx0QhI8gcLnGt', 'sha256'), 'hex'),
   true,
   'imap.purelymail.com', 993, 'smtp.purelymail.com', 465);

-- Verify insert
SELECT 
  'Inserted ' || COUNT(*) || ' mailboxes' as result
FROM mailboxes;

-- Show what was inserted
SELECT 
  email,
  imap_host || ':' || imap_port as imap,
  smtp_host || ':' || smtp_port as smtp,
  CASE WHEN encrypted_password IS NOT NULL THEN 'YES' ELSE 'NO' END as has_password
FROM mailboxes
ORDER BY email;
