# Environment Variables Reference

Complete reference for all environment variables used in the multi-site platform.

---

## Required Variables

### Database (Supabase)

```env
# Supabase Project URL
# Where: Supabase Dashboard → Settings → API → Project URL
# Example: https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (Public)
# Where: Supabase Dashboard → Settings → API → Project API keys → anon public
# Safe to expose to client-side code
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (Secret)
# Where: Supabase Dashboard → Settings → API → Project API keys → service_role
# ⚠️ NEVER expose to client-side code
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Postgres Connection String
# Where: Supabase Dashboard → Settings → Database → Connection string → URI
# Used for direct database access and migrations
POSTGRES_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### Cloudflare

```env
# Cloudflare Account ID
# Where: Cloudflare Dashboard → Workers & Pages → right sidebar
# Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Cloudflare API Token
# Where: Cloudflare Dashboard → Profile → API Tokens → Create Token
# Required permissions:
#   - Account → Workers Scripts → Edit
#   - Account → Workers Routes → Edit
#   - Zone → Workers Routes → Edit
# ⚠️ Keep secret
CLOUDFLARE_API_TOKEN=your-api-token
```

### Admin API

```env
# Admin API Key
# Create a strong random string (32+ characters)
# Used to authenticate admin API requests
# ⚠️ Keep secret
ADMIN_API_KEY=your-secret-admin-key-minimum-32-characters

# Public Admin API Key (for frontend)
# Same as ADMIN_API_KEY but exposed to client
# Only use in trusted environments
NEXT_PUBLIC_ADMIN_API_KEY=your-secret-admin-key-minimum-32-characters
```

---

## Optional Variables

### Development

```env
# Site ID Override
# Forces a specific site to load in development
# Useful for testing without configuring local DNS
# Example: anwb-energie, memorable-me
SITE_ID=anwb-energie

# Node Environment
# Automatically set by Next.js
# NODE_ENV=development | production | test
```

### AI Features (Optional)

```env
# OpenRouter API Key
# Only needed if using AI features in the codebase
# Where: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-...
```

### Analytics (Optional)

```env
# Google Analytics
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Monitoring (Optional)

```env
# Sentry
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# LogDNA / LogTail
LOGDNA_INGESTION_KEY=...
```

---

## Example .env.local

```env
# ============================================================================
# DATABASE (Supabase) - REQUIRED
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://gmsrnnwaripxnkfyiydi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE5NTU1NzYwMDB9.abc123def456
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2NDAwMDAwMDAsImV4cCI6MTk1NTU3NjAwMH0.xyz789
POSTGRES_URL=postgresql://postgres:your-password@db.gmsrnnwaripxnkfyiydi.supabase.co:5432/postgres

# ============================================================================
# CLOUDFLARE - REQUIRED
# ============================================================================
CLOUDFLARE_ACCOUNT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token-here

# ============================================================================
# ADMIN API - REQUIRED
# ============================================================================
ADMIN_API_KEY=super-secret-admin-key-change-this-in-production-minimum-32-chars
NEXT_PUBLIC_ADMIN_API_KEY=super-secret-admin-key-change-this-in-production-minimum-32-chars

# ============================================================================
# DEVELOPMENT - OPTIONAL
# ============================================================================
# Uncomment to test a specific site
# SITE_ID=anwb-energie

# ============================================================================
# AI FEATURES - OPTIONAL
# ============================================================================
# OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Security Best Practices

### ✅ DO

- ✅ Use strong random strings for API keys (32+ characters)
- ✅ Keep `.env.local` in `.gitignore` (already configured)
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use environment-specific keys in Vercel/deployment platform
- ✅ Limit API token permissions to minimum required
- ✅ Store secrets in password manager

### ❌ DON'T

- ❌ Commit `.env.local` to git
- ❌ Share API keys in Slack/Discord/email
- ❌ Use the same keys across environments
- ❌ Hardcode secrets in source code
- ❌ Expose service role keys to client-side
- ❌ Use weak or predictable API keys

---

## Setting Up in Vercel

1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add each variable:
   - Name: Variable name (e.g., `SUPABASE_SERVICE_ROLE_KEY`)
   - Value: The secret value
   - Environments: Select Production, Preview, Development as needed
3. Redeploy for changes to take effect

---

## Setting Up in Other Platforms

### Netlify
```bash
netlify env:set VARIABLE_NAME "value"
```

### Railway
Add in Railway dashboard → Variables section

### Fly.io
```bash
fly secrets set VARIABLE_NAME="value"
```

### Docker
```bash
docker run -e VARIABLE_NAME="value" ...
```

---

## Generating Strong API Keys

```bash
# Generate random API key (32 characters)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or using online tool
# https://www.random.org/strings/
```

---

## Environment Variable Validation

Create `env.ts` to validate at startup:

```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'POSTGRES_URL',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN',
  'ADMIN_API_KEY',
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}`
    );
  }
}

// Call in app startup
validateEnv();
```

---

## Testing Environment Setup

```bash
# Test database connection
node scripts/test-db-connection.mjs

# Test Cloudflare connection
node -e "
  import { getCloudflareServices } from './src/lib/cloudflare/index.js';
  const cf = getCloudflareServices();
  cf.testConnection().then(ok => console.log(ok ? '✅ CF OK' : '❌ CF Failed'));
"

# Test admin API
curl http://localhost:3000/api/admin/stats \
  -H "x-admin-key: $ADMIN_API_KEY"
```

---

## Troubleshooting

### "Supabase credentials not configured"
- Check `NEXT_PUBLIC_SUPABASE_URL` is set
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Restart dev server after adding variables

### "Cloudflare credentials not configured"
- Check `CLOUDFLARE_ACCOUNT_ID` is set
- Check `CLOUDFLARE_API_TOKEN` is set
- Verify token has correct permissions

### "401 Unauthorized" on admin API
- Check `ADMIN_API_KEY` matches in `.env.local`
- Check `x-admin-key` header is set correctly
- Restart dev server

### Variables not loading
- Ensure `.env.local` is in project root
- Restart Next.js dev server
- Check for typos in variable names
- Ensure no quotes around values (unless value contains spaces)

---

## Reference

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/architecture#environment-variables)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
