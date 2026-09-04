# Multi-Site Platform - Setup Guide

## Quick Start

This guide will help you set up and deploy the multi-site platform from scratch.

---

## Prerequisites

- **Node.js** 22+ (required by package.json)
- **Git** (for version control)
- **Supabase Account** (for database)
- **Cloudflare Account** (for Workers deployment)
- **Vercel Account** (optional, for hosting the admin dashboard)

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd my-clone

# Install dependencies
npm install

# Verify installation
npm run typecheck
```

---

## Step 2: Environment Configuration

Create `.env.local` in the project root:

```env
# ============================================================================
# DATABASE (Supabase)
# ============================================================================

# Supabase Project URL (from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (Public, safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role Key (Secret, server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Postgres Connection String (for direct database access)
POSTGRES_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# ============================================================================
# CLOUDFLARE
# ============================================================================

# Cloudflare Account ID (from Cloudflare Dashboard → Workers & Pages)
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Cloudflare API Token (with Workers permissions)
# Create at: https://dash.cloudflare.com/profile/api-tokens
# Required permissions: Workers Scripts:Edit, Workers Routes:Edit
CLOUDFLARE_API_TOKEN=your-api-token

# ============================================================================
# ADMIN API
# ============================================================================

# Admin API Key (create a strong random string)
# Used to authenticate admin API requests
ADMIN_API_KEY=your-secret-admin-key-here

# Public Admin API Key (for frontend)
NEXT_PUBLIC_ADMIN_API_KEY=your-secret-admin-key-here

# ============================================================================
# DEVELOPMENT
# ============================================================================

# Optional: Override site resolution in development
# SITE_ID=anwb-energie

# Optional: OpenRouter API Key (for AI features, if used)
# OPENROUTER_API_KEY=your-openrouter-key
```

---

## Step 3: Database Setup

### 3.1 Get Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Go to **Settings → API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings → Database**
6. Copy Connection String → `POSTGRES_URL`

### 3.2 Run Migrations

Apply the database schema:

```bash
# Option 1: Using the migration script
node scripts/apply-migrations.mjs

# Option 2: Manual via Supabase Dashboard
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of supabase/migrations/001_multi_site_platform.sql
# 3. Paste and run
# 4. Repeat for 002_seed_data.sql
```

### 3.3 Verify Database

```bash
# Test connection
node scripts/test-db-connection.mjs

# Should output: ✅ Database connected
```

### 3.4 Seed Test Sites

```bash
# Create test sites
node scripts/seed-sites.mjs

# List sites
node scripts/list-sites.mjs
```

---

## Step 4: Cloudflare Setup

### 4.1 Get Cloudflare Credentials

1. Go to https://dash.cloudflare.com
2. Go to **Workers & Pages**
3. Copy Account ID → `CLOUDFLARE_ACCOUNT_ID`

### 4.2 Create API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template
4. Permissions needed:
   - Account → Workers Scripts → Edit
   - Account → Workers Routes → Edit
   - Zone → Workers Routes → Edit
5. Copy token → `CLOUDFLARE_API_TOKEN`

### 4.3 Test Cloudflare Connection

```bash
# Test connection
node -e "
  import { getCloudflareServices } from './src/lib/cloudflare/index.js';
  const cf = getCloudflareServices();
  cf.testConnection().then(ok => console.log(ok ? '✅ Connected' : '❌ Failed'));
"
```

---

## Step 5: Development

### 5.1 Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Server starts at http://localhost:3000
```

### 5.2 Test Site Resolution

**Option A: Environment Variable Override**
```bash
# Test specific site
SITE_ID=anwb-energie npm run dev
# Visit http://localhost:3000
```

**Option B: Local Hosts File**
```bash
# Edit /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
# Add:
127.0.0.1 anwb-energie.local
127.0.0.1 memorable.local

# Then access:
# http://anwb-energie.local:3000
# http://memorable.local:3000
```

### 5.3 Access Admin Interface

```bash
# Admin dashboard
http://localhost:3000/admin

# Note: Update admin pages to use API (see STEP-8-SUMMARY.md)
```

---

## Step 6: Deploy a Site

### 6.1 Via CLI

```bash
# Deploy site
node scripts/deploy-site-cli.mjs anwb-energie

# Deploy with options
node scripts/deploy-site-cli.mjs anwb-energie \
  --environment production \
  --deployed-by "admin@example.com" \
  --notes "Initial deployment"
```

### 6.2 Via API

```bash
# Deploy via API
curl -X POST http://localhost:3000/api/admin/sites/anwb-energie/deploy \
  -H "x-admin-key: your-admin-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "deployedBy": "admin@example.com",
    "notes": "Test deployment"
  }'
```

### 6.3 Check Deployment Status

```bash
# List deployments
node scripts/list-deployments.mjs anwb-energie

# Via API
curl http://localhost:3000/api/admin/sites/anwb-energie/deploy \
  -H "x-admin-key: your-admin-api-key"
```

---

## Step 7: Production Deployment

### 7.1 Deploy to Vercel (Admin Dashboard)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts
# Set environment variables in Vercel dashboard
```

### 7.2 Deploy Sites to Cloudflare Workers

```bash
# Deploy each site
node scripts/deploy-site-cli.mjs site-1
node scripts/deploy-site-cli.mjs site-2
node scripts/deploy-site-cli.mjs site-3

# Or via API endpoint
```

### 7.3 Configure Custom Domains

1. Add domain to Cloudflare
2. Update site domain in database
3. Redeploy site
4. Domain routing configured automatically

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
node scripts/test-db-connection.mjs

# Check if project is paused (free tier)
# Go to Supabase dashboard → restore project

# Verify connection string in .env.local
```

### Cloudflare Deployment Fails

```bash
# Check API token permissions
# Ensure token has Workers:Edit permission

# Test connection
node -e "
  import { getCloudflareServices } from './src/lib/cloudflare/index.js';
  const cf = getCloudflareServices();
  cf.testConnection().then(console.log);
"
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

### Site Not Resolving

```bash
# Check site exists in database
node scripts/list-sites.mjs

# Check SITE_ID environment variable
echo $SITE_ID

# Try explicit override
SITE_ID=anwb-energie npm run dev
```

---

## Useful Commands

```bash
# Development
npm run dev                          # Start dev server
npm run build                        # Build for production
npm run typecheck                    # TypeScript check
npm run lint                         # ESLint

# Database
node scripts/apply-migrations.mjs    # Apply migrations
node scripts/test-db-connection.mjs  # Test DB connection
node scripts/seed-sites.mjs          # Seed test sites
node scripts/list-sites.mjs          # List all sites
node scripts/debug-site.mjs <domain> # Debug site info

# Deployment
node scripts/deploy-site-cli.mjs <site-id>           # Deploy site
node scripts/list-deployments.mjs <site-id>          # List deployments
node scripts/rollback-deployment.mjs <site-id> <id>  # Rollback

# Cloudflare
npx wrangler login                   # Login to Cloudflare
npx wrangler whoami                  # Check auth status
```

---

## Security Checklist

- [ ] Change default `ADMIN_API_KEY` to strong random string
- [ ] Keep `SUPABASE_SERVICE_ROLE_KEY` secret (never commit)
- [ ] Keep `CLOUDFLARE_API_TOKEN` secret (never commit)
- [ ] Use environment variables, never hardcode secrets
- [ ] Enable Supabase RLS (Row Level Security) policies
- [ ] Use HTTPS in production
- [ ] Rotate API keys regularly
- [ ] Limit Cloudflare API token permissions
- [ ] Enable Vercel authentication for admin dashboard
- [ ] Use separate admin API key for production

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Run database migrations
3. ✅ Seed test sites
4. ✅ Test local development
5. ✅ Deploy first site
6. 🔄 Connect admin UI to API
7. 🔄 Deploy to production
8. 🔄 Configure custom domains
9. 🔄 Set up monitoring
10. 🔄 Add more sites

---

## Support

**Documentation:**
- `docs/ARCHITECTURE-PROPOSAL.md` - System architecture
- `docs/ADMIN-API.md` - API reference
- `docs/STEP-*-COMPLETE.md` - Implementation details

**Scripts:**
- All scripts in `scripts/` directory
- Run with `node scripts/<script-name>.mjs`

**Troubleshooting:**
- Check logs in console
- Verify environment variables
- Test database connection
- Check Cloudflare API status
