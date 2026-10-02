-- Add forward rules for BoostChamp and New Order
-- Migration: 008_add_boostchamp_forward_rules.sql

-- Add forward rules
INSERT INTO forward_rules (subject_contains, forward_to, enabled, created_at)
VALUES 
  ('[BoostChamp]: Order #', 'bram@rebelinternet.nl', true, NOW()),
  ('New Order', 'bram@rebelinternet.nl', true, NOW())
ON CONFLICT (subject_contains, forward_to) DO NOTHING;
