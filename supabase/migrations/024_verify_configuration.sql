-- Verify configuration is actually in database
-- Migration: 024_verify_configuration.sql

-- Direct verification query
SELECT 
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator,
  'DIRECT DATABASE VERIFICATION' as title,
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' as separator2;

SELECT 
  email,
  imap_host,
  imap_port,
  smtp_host,
  smtp_port,
  CASE 
    WHEN encrypted_password IS NOT NULL AND length(encrypted_password) > 0 
    THEN '✅ SET (' || length(encrypted_password) || ' chars)' 
    ELSE '❌ NOT SET' 
  END as password_status
FROM mailboxes
WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com')
ORDER BY email;

-- Summary
SELECT 
  CASE 
    WHEN COUNT(*) FILTER (WHERE imap_host IS NOT NULL) = 2 THEN '✅ Both mailboxes configured in database'
    WHEN COUNT(*) FILTER (WHERE imap_host IS NOT NULL) = 1 THEN '⚠️ Only 1 mailbox configured'
    ELSE '❌ No mailboxes configured'
  END as result
FROM mailboxes
WHERE email IN ('support@maxvisits.com', 'contact@kaufrank.com');
