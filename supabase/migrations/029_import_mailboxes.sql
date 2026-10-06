-- Import mailbox data from old project
-- All 13 mailboxes with IMAP/SMTP configuration

INSERT INTO mailboxes (id, email, encrypted_password, ai_enabled, prompt, imap_host, imap_port, smtp_host, smtp_port, created_at)
VALUES 
  -- PurelyMail configured mailboxes
  ('1d7677e0-74f1-4d1d-9f69-c5d38d79229c', 'support@maxvisits.com', 
   encode(digest('DZN*xaz6jre7zqu*zyu', 'sha256'), 'hex'),
   true, NULL,
   'imap.purelymail.com', 993, 'smtp.purelymail.com', 465,
   '2025-01-01 00:00:00+00'),
   
  ('2e8788f1-85g2-5e2e-8a7a-d6e49e8a230d', 'contact@kaufrank.com',
   encode(digest('a6fbWu8mXx0QhI8gcLnGt', 'sha256'), 'hex'),
   true, NULL,
   'imap.purelymail.com', 993, 'smtp.purelymail.com', 465,
   '2025-01-01 00:00:01+00'),
   
  -- Gmail mailboxes (auto-detect)
  (gen_random_uuid(), 'bram.1592@gmail.com', 
   encode(digest('fmfh njpm wfby idnz', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:02+00'),
   
  (gen_random_uuid(), 'rens@itsrens.nl',
   encode(digest('ogom dloe txal qvhq', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:03+00'),
   
  (gen_random_uuid(), 'hello@itsrens.nl',
   encode(digest('ugqr rqrm sstv gcxv', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:04+00'),
   
  (gen_random_uuid(), 'buy@ecomads.nl',
   encode(digest('kszu gbkl cfmo gbfx', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:05+00'),
   
  (gen_random_uuid(), 'wouter@ecomads.nl',
   encode(digest('tsvu kqvv iwhp gejp', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:06+00'),
   
  (gen_random_uuid(), 'hello@ecomads.nl',
   encode(digest('kvgh abkm hdsv svkw', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:07+00'),
   
  (gen_random_uuid(), 'wouter@the-quickest.com',
   encode(digest('vxwk mzaf upkz vjya', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:08+00'),
   
  (gen_random_uuid(), 'hello@the-quickest.com',
   encode(digest('oafl jjrx wpqb qcvi', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:09+00'),
   
  (gen_random_uuid(), 'wouter@kaufrank.com',
   encode(digest('ggpb rvkk oepf jbzq', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:10+00'),
   
  (gen_random_uuid(), 'hello@kaufrank.com',
   encode(digest('okzc pqzc hjww fhyz', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:11+00'),
   
  (gen_random_uuid(), 'wouter@maxvisits.com',
   encode(digest('xwnm fwhv qgmm rfbp', 'sha256'), 'hex'),
   true, NULL,
   NULL, NULL, NULL, NULL,
   '2025-01-01 00:00:12+00')
ON CONFLICT (id) DO NOTHING;

-- Verify import
SELECT 
  COUNT(*) as total_mailboxes,
  COUNT(*) FILTER (WHERE imap_host IS NOT NULL) as configured_custom_imap
FROM mailboxes;
