-- Allow the status name used by the deployment API.
-- Supabase project: gmsrnnwaripxnkfyiydi
ALTER TABLE sites DROP CONSTRAINT IF EXISTS sites_deployment_status_check;
ALTER TABLE sites ADD CONSTRAINT sites_deployment_status_check
  CHECK (deployment_status IN ('never_deployed', 'queued', 'building', 'deploying', 'ready', 'deployed', 'failed'));
