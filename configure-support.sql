-- Quick configuration for support@maxvisits.com
-- REPLACE 'YOUR_PASSWORD' below with the actual PurelyMail password

UPDATE mailboxes
SET 
  imap_host = 'imap.purelymail.com',
  imap_port = 993,
  smtp_host = 'smtp.purelymail.com',
  smtp_port = 465,
  encrypted_password = encode(digest('YOUR_PASSWORD', 'sha256'), 'hex')
WHERE email = 'support@maxvisits.com'
RETURNING email, imap_host, imap_port, smtp_host, smtp_port, 
  CASE WHEN encrypted_password IS NOT NULL THEN '✓ Password set' ELSE '✗ No password' END as status;
