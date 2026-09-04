# Multi-Site Platform Architecture Proposal

## Executive Summary

This document proposes the architecture for transforming the current Next.js 16 project into a multi-site platform where **ONE CODEBASE serves MANY SITES** via Cloudflare Workers.

---

## Current State Analysis

### Framework & Technology Stack
- **Next.js 16.2.11** (App Router, React 19, TypeScript strict)
- **Database:** PostgreSQL via Supabase + Vercel Postgres
- **Styling:** Tailwind CSS v4, shadcn/ui
- **Deployment:** Already configured for Cloudflare Workers (OpenNext)
- **Build:** `@opennextjs/cloudflare` adapter v1.20.2

### Existing Infrastructure
✅ **Supabase fully configured** - We'll use this for site/deployment metadata  
✅ **Cloudflare Workers configured** - `wrangler.jsonc` exists with OpenNext adapter  
✅ **Database schemas present** - Blog, coupons, admin functionality  
✅ **Admin section exists** - Can be extended for multi-site management  
✅ **TypeScript strict mode** - Good foundation for type safety  

### Key Finding
The project is **already set up for Cloudflare Workers deployment** via OpenNext. This is perfect for our multi-site architecture.

---

## Proposed Architecture

### Core Concept: Request Routing

```
Internet Request → Cloudflare Worker → Site Resolver → Site Config → App Render
                                             ↓
                                      Database Lookup
                                    (hostname → site_id)
```

**Flow:**
1. Request arrives at `example.com`
2. Worker extracts hostname
3. Query database: `SELECT * FROM sites WHERE domain = 'example.com'`
4. Load site-specific config
5. Render Next.js app with site context
6. Response uses site-specific branding/content

---

## Architecture Components

### 1. Database Layer (Supabase)

**New Tables:**

```sql
-- Sites table: Core site registry
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT UNIQUE NOT NULL,           -- e.g., 'site-a'
  domain TEXT UNIQUE NOT NULL,             -- e.g., 'example.com'
  worker_name TEXT NOT NULL,               -- e.g., 'worker-site-a'
  name TEXT NOT NULL,                      -- e.g., 'Example Site'
  status TEXT NOT NULL DEFAULT 'active',   -- active/disabled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site configuration: All site-specific settings
CREATE TABLE site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Locale & Language
  language TEXT DEFAULT 'en',
  locale TEXT DEFAULT 'en-US',
  
  -- Branding
  site_name TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  og_image_url TEXT,
  
  -- Affiliate & Tracking
  affiliate_links JSONB DEFAULT '{}',
  tracking_ids JSONB DEFAULT '{}',
  
  -- Content Configuration
  content_config JSONB DEFAULT '{}',
  
  -- Features
  features_enabled TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(site_id)
);

-- Deployments: Track all deployments
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  
  commit_sha TEXT NOT NULL,
  commit_message TEXT,
  
  status TEXT NOT NULL,                    -- pending/deploying/success/failed
  worker_name TEXT NOT NULL,
  
  deployed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  error_message TEXT,
  logs TEXT,
  
  deployed_by TEXT,                        -- User who triggered deployment
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_sites_domain ON sites(domain);
CREATE INDEX idx_sites_site_id ON sites(site_id);
CREATE INDEX idx_deployments_site_id ON deployments(site_id);
CREATE INDEX idx_deployments_status ON deployments(status);
```

**Why this design:**
- Separate tables for sites, config, and deployments
- JSONB for flexible configuration (affiliate links, tracking, features)
- UUIDs for primary keys (better for distributed systems)
- Text site_id for human-readable references
- Proper foreign keys and cascading deletes
- Indexes on commonly queried fields

---

### 2. Application Architecture Changes

#### A. Site Context System

**File: `src/lib/sites/context.ts`**

The site context makes the current site available throughout the app:

```typescript
// Server-side site resolution
export async function resolveSite(hostname: string): Promise<Site | null>

// Site context for React components
export const SiteContext = createContext<Site | null>(null)
export function useSite(): Site
```

**Integration point:** Root layout (`src/app/layout.tsx`)

```typescript
// Pseudo-code
export default async function RootLayout({ children }) {
  const hostname = headers().get('host')
  const site = await resolveSite(hostname)
  
  if (!site) return <NotFound />
  
  return (
    <SiteProvider site={site}>
      <html lang={site.config.language}>
        {/* Apply site-specific branding */}
        <body>{children}</body>
      </html>
    </SiteProvider>
  )
}
```

#### B. Cloudflare Service Layer

**File structure:**
```
src/lib/cloudflare/
├── client.ts          # Cloudflare API client wrapper
├── workers.ts         # Workers API (create, update, delete)
├── domains.ts         # Custom domains API
├── deployments.ts     # Deployment orchestration
└── types.ts           # Cloudflare API types
```

**Responsibilities:**
- Abstract Cloudflare REST API
- Handle authentication (API token)
- Retry logic and error handling
- Type-safe responses

#### C. Deployment Service

**File: `src/lib/deployment/service.ts`**

**Core functions:**
```typescript
createSite(config: SiteConfig): Promise<Site>
deploySite(siteId: string): Promise<Deployment>
redeploySite(siteId: string): Promise<Deployment>
deleteSite(siteId: string, confirmed: boolean): Promise<void>
getSiteStatus(siteId: string): Promise<SiteStatus>
listSites(): Promise<Site[]>
```

**Deployment flow:**
1. Validate site configuration
2. Get current Git commit SHA
3. Run Next.js build
4. Deploy to Cloudflare Workers via Wrangler CLI
5. Update custom domain routing (if needed)
6. Store deployment record in database
7. Return deployment status

---

### 3. Admin Interface

**Extend existing admin section:** `/src/app/admin/`

**New routes:**
```
/admin/sites              # List all sites
/admin/sites/new          # Create new site
/admin/sites/[id]         # Edit site
/admin/sites/[id]/deploy  # Deploy site
/admin/deployments        # Deployment history
```

**UI Components:**
- Site list with status indicators
- Site creation/edit form
- Deployment status dashboard
- Live deployment logs (if available)
- Confirmation dialogs for destructive actions

---

### 4. Local Development Strategy

**Challenge:** How to test multiple sites locally?

**Solution: Environment variable override**

```bash
# Terminal 1: Test Site A
SITE_ID=site-a npm run dev

# Terminal 2: Test Site B  
SITE_ID=site-b npm run dev -- -p 3001
```

**Implementation:**
```typescript
// In site resolver
export async function resolveSite(hostname: string): Promise<Site | null> {
  // Development override
  if (process.env.NODE_ENV === 'development' && process.env.SITE_ID) {
    return await getSiteBySiteId(process.env.SITE_ID)
  }
  
  // Production: resolve by hostname
  return await getSiteByDomain(hostname)
}
```

**Alternative:** Local hosts file
```
127.0.0.1  site-a.local
127.0.0.1  site-b.local
```

---

## Cloudflare Workers Architecture

### Current Setup
The project uses **OpenNext Cloudflare adapter** which converts Next.js into Cloudflare Workers format.

**Current config (`wrangler.jsonc`):**
```json
{
  "name": "shared-source-multi-site",
  "compatibility_date": "2026-08-24",
  "node_compat": true
}
```

### Multi-Site Worker Strategy

**Option 1: One Worker per Site (RECOMMENDED)**

```
example.com → worker-site-a (running shared codebase)
example.net → worker-site-b (running shared codebase)
example.org → worker-site-c (running shared codebase)
```

**Pros:**
- Each site is isolated (failures don't affect others)
- Independent scaling and monitoring
- Easier to disable individual sites
- Clear deployment boundaries

**Cons:**
- Multiple worker deployments required
- Slightly more complex deployment orchestration

**Option 2: Single Worker with domain routing**

```
example.com ↘
example.net → worker-multi-site (one worker handles all)
example.org ↗
```

**Pros:**
- Single deployment updates all sites
- Simpler deployment process

**Cons:**
- Shared failure domain (one worker crash affects all sites)
- Harder to debug individual site issues
- Domain routing configuration more complex

**Recommendation: Option 1** for better isolation and production safety.

---

## Deployment Workflow

### Manual Deployment (via Admin Interface)

```
1. User clicks "Deploy" for Site A
2. Backend validates site configuration
3. Get current Git commit SHA
4. Trigger build: npm run build
5. Deploy to Cloudflare:
   wrangler deploy --name worker-site-a --env site-a
6. Update custom domain (if needed):
   Cloudflare API: add route example.com → worker-site-a
7. Store deployment record in database
8. Return success/failure to UI
```

### Automated Deployment (Future)

```
Git push → GitHub Actions → Deploy all sites with changes
```

---

## Configuration Separation

### Global Configuration (Shared)
**Location: `src/config/`**

- Next.js configuration
- Build settings
- Cloudflare worker settings
- Shared UI components
- Shared utilities

### Site-Specific Configuration (Database)
**Location: `site_config` table**

- Domain, branding, colors
- SEO defaults
- Language/locale
- Affiliate links
- Tracking IDs
- Feature flags
- Content overrides

**Access pattern:**
```typescript
const site = useSite()
const primaryColor = site.config.primary_color
const affiliateLink = site.config.affiliate_links.amazon
```

---

## Content Management

### Current Content
- Blog posts (database)
- Coupons (database)
- Static pages (code)

### Multi-Site Content Strategy

**Option A: Shared content with filtering**
```sql
SELECT * FROM blog_posts WHERE site_id = 'site-a'
```

**Option B: Content references in site_config**
```json
{
  "content_config": {
    "blog_enabled": true,
    "blog_categories": ["tech", "deals"],
    "featured_posts": [1, 2, 3]
  }
}
```

**Recommendation:** Start with Option B for flexibility.

---

## Security & Safety

### Production Safety Checks
1. **Never auto-delete workers** - Require explicit confirmation
2. **Validate target before deployment** - Show domain/worker name
3. **Environment variable validation** - Check required vars before deploy
4. **Deployment dry-run** - Option to validate without deploying
5. **Rollback capability** - Store previous deployment info

### Credentials Management
```bash
# Required environment variables
CLOUDFLARE_API_TOKEN=xxx
CLOUDFLARE_ACCOUNT_ID=xxx

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Never store in database.** Use environment variables or Cloudflare Workers secrets.

---

## Migration Path

### Phase 1: Foundation (Steps 1-3)
- Database schema
- TypeScript types
- Site context system

### Phase 2: Cloudflare Integration (Steps 4-6)
- Cloudflare service layer
- Deployment service
- Git tracking

### Phase 3: Admin Interface (Steps 7-8)
- Admin API routes
- Admin UI components
- Deployment dashboard

### Phase 4: Production Ready (Steps 9-10)
- Environment configuration
- Testing
- Documentation

---

## Required Changes to Existing Application

### Minimal Changes Needed

1. **Root Layout (`src/app/layout.tsx`)**
   - Add site resolution
   - Wrap with SiteProvider
   - Apply site-specific branding

2. **Environment Variables**
   - Add Cloudflare API credentials
   - Add site override for local dev

3. **Build Process**
   - Parameterize worker name for deployments
   - Add deployment scripts

4. **Content Queries**
   - Add optional site filtering (if needed)

### No Changes Needed
- Existing components
- Existing pages
- Existing API routes (except admin)
- Existing database tables (blog, coupons)
- Styling system

---

## Scalability Considerations

### Handling Hundreds of Sites

**Database:**
- Indexes on `sites.domain` (already planned)
- Consider read replicas for site lookups
- Cache frequently accessed site configs

**Deployments:**
- Queue-based deployment system
- Deploy sites in parallel (within Cloudflare limits)
- Skip unchanged sites

**Cloudflare Workers:**
- Each site gets its own worker (isolation)
- Workers are automatically scaled by Cloudflare
- No infrastructure management needed

**Monitoring:**
- Track deployment success rates
- Monitor worker errors per site
- Alert on failed deployments

---

## Cost Implications

### Cloudflare Workers Pricing
- **Free tier:** 100,000 requests/day
- **Paid ($5/month):** 10M requests/month + $0.50 per additional million

**For 100 sites:**
- Option 1 (one worker per site): 100 workers × $5 = $500/month (if all exceed free tier)
- Option 2 (single worker): $5/month (but shared failure domain)

**Recommendation:** Start with Option 1, optimize later if cost becomes an issue.

### Database (Supabase)
- Site metadata is small (KB per site)
- 100 sites ≈ 100 KB of config data
- No meaningful cost impact

---

## Timeline Estimate

| Step | Description | Estimated Time |
|------|-------------|----------------|
| 1 | Project Discovery | ✅ Complete |
| 2 | Database Schema | 1-2 hours |
| 3 | TypeScript Types | 1 hour |
| 4 | Cloudflare Service Layer | 3-4 hours |
| 5 | Site Configuration System | 2-3 hours |
| 6 | Deployment Service | 4-5 hours |
| 7 | Admin Backend API | 2-3 hours |
| 8 | Admin Frontend UI | 4-5 hours |
| 9 | Environment & Config | 1-2 hours |
| 10 | Testing & Documentation | 2-3 hours |
| **Total** | | **20-30 hours** |

---

## Success Metrics

### Technical Goals
- ✅ Single codebase serves multiple sites
- ✅ Sites configurable without code changes
- ✅ Safe deployment with validation
- ✅ Git-tracked deployments
- ✅ Local development without production setup

### User Experience
- Admin can create a new site in < 5 minutes
- Deployment completes in < 2 minutes
- Clear error messages on failures
- No manual Cloudflare dashboard needed

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenNext compatibility issues | High | Test thoroughly; maintain fallback to Vercel |
| Cloudflare API rate limits | Medium | Implement retry logic, queue deployments |
| Site config conflicts | Medium | Strict validation, schema enforcement |
| Deployment failures | Medium | Store previous state, enable rollback |
| Cost overruns | Low | Monitor usage, set billing alerts |

---

## Next Steps

1. **Review & Approve** this architecture proposal
2. **Proceed to Step 2:** Database schema implementation
3. **Iterative development:** Complete steps 2-10 sequentially

---

## Questions for Review

1. **Worker strategy:** Approve one-worker-per-site approach?
2. **Local development:** Environment variable override acceptable?
3. **Content strategy:** Shared content vs. per-site content?
4. **Deployment triggers:** Manual only, or also Git-based automation?
5. **Admin authentication:** Use existing auth or add separate admin auth?

---

## Conclusion

This architecture leverages the existing Next.js + Cloudflare Workers setup to create a production-ready multi-site platform. The design is:

- ✅ **Simple:** Minimal changes to existing code
- ✅ **Scalable:** Supports hundreds of sites
- ✅ **Safe:** Validation and confirmation for destructive actions
- ✅ **Maintainable:** Clear separation of concerns
- ✅ **Cost-effective:** Uses existing infrastructure (Supabase, Cloudflare)

**Ready to proceed with Step 2: Database Schema Design.**
