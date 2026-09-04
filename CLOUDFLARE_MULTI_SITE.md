# Cloudflare Multi-Site Deployment

## Architecture

```text
Git repository
  -> shared Next.js application and components
  -> OpenNext Cloudflare adapter
  -> one Wrangler Worker per registered site
  -> one custom domain per Worker
  -> Supabase site registry and deployment history
```

Sites are data, not folders or duplicated applications. Production site resolution uses the Worker `SITE_ID` variable; local development can use `SITE_ID=site-a`.

## Database

Run `supabase-cloudflare-sites.sql` in Supabase SQL Editor. It creates:

- `sites`: domain, Worker, locale, status, and current commit
- `site_config`: content, SEO, affiliate, branding, tracking, and feature flags
- `deployments`: immutable deployment history and errors

RLS is enabled and no public policies are created. The server-only Supabase service-role client is required for registry access.

## Environment Variables

Never commit these values:

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-scoped-api-token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
ADMIN_API_KEY=your-admin-api-key
SITE_ID=site-a # local development only, optional
```

Use a Cloudflare API token scoped to the required account/Workers/domain permissions. Do not use a global API key.

## Cloudflare Setup

1. Install dependencies with `npm install`.
2. Run the Supabase migration.
3. Add a site record and matching `site_config` record.
4. Authenticate Wrangler with `wrangler login`, or provide `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in CI.
5. Set the Supabase service key as a Worker secret:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

6. Deploy a site:

```bash
npm run cloudflare:deploy:site -- site-a
```

The script validates the site registry, refuses disabled sites, builds once, deploys only when the commit changed, and never deletes production resources.

## Custom Domains

Attach a domain only as an explicit operation after the zone is present in the same Cloudflare account. The service layer exposes `attachCustomDomain`; it does not modify unrelated zones or domains.

## Admin API

Deployment management APIs are protected by `x-admin-key: $ADMIN_API_KEY`:

- `GET /api/admin/sites`
- `POST /api/admin/sites`
- `GET /api/admin/sites/:id`
- `PATCH /api/admin/sites/:id`
- `DELETE /api/admin/sites/:id` requires `{ "confirm": true }` and only removes metadata
- `POST /api/admin/sites/:id/deploy` queues a deployment record

The admin site registry is available at `/admin/sites`. The existing admin UI must be authenticated before exposing it publicly; the API is denied when `ADMIN_API_KEY` is unset.

## Local Development

```bash
SITE_ID=site-a npm run dev
```

The regular Next.js dev server remains the fastest development path. For a Worker-compatible preview:

```bash
SITE_ID=site-a npm run cloudflare:dev
```

## Safety Rules

- Deployments include a commit SHA.
- Unchanged commits are skipped unless `FORCE_DEPLOY=true`.
- Disabled/error sites cannot be deployed by the site script.
- A failed deployment updates metadata but does not delete the previous Worker.
- Deleting site metadata never deletes the Worker or custom domain.
- Worker deletion is a separate explicit service call and is not wired to the admin delete action.
- Cloudflare credentials are never stored in Supabase.

## Current Limitations

- The admin deployment action queues metadata; CI or `deploy-site.mjs` performs the actual OpenNext/Wrangler deployment.
- Cloudflare Worker logs depend on Cloudflare Observability and are linked when a deployment provider supplies a logs URL.
- The current content UI still needs to be migrated fully to `site_config`/`domain_content`; the registry and resolution layers are ready for that migration.
- Admin authentication is not yet implemented in the existing project and must be added before public exposure.
