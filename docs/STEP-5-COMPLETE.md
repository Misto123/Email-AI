# Multi-Site Platform - Step 5 Complete

## ✅ What We've Accomplished

### Site Configuration System (STEP 5)

Created a complete site configuration and resolution system that enables true multi-tenancy. Each request automatically resolves to the correct site based on the domain, with full configuration management.

---

## 📁 Files Created

### 1. `src/lib/sites/database.ts` - Database Operations Layer

**Core Operations:**

**Site CRUD:**
```typescript
siteDb.listSites()
siteDb.getSiteById(id)
siteDb.getSiteBySiteId(siteId)
siteDb.getSiteByDomain(domain)
siteDb.createSite(input)
siteDb.updateSite(id, input)
siteDb.deleteSite(id)
```

**Site Configuration:**
```typescript
siteDb.getSiteConfig(siteId)
siteDb.createSiteConfig(input)
siteDb.updateSiteConfig(siteId, input)
siteDb.deleteSiteConfig(siteId)
```

**Combined Operations:**
```typescript
siteDb.getSiteWithConfig(siteId)
siteDb.getSiteWithConfigByDomain(domain)
siteDb.getSiteWithConfigBySiteId(siteId)
siteDb.createSiteWithConfig(siteInput, configInput)  // Transaction
```

**Site Domains:**
```typescript
siteDb.listSiteDomains(siteId)
siteDb.addSiteDomain(siteId, domain, isPrimary)
siteDb.removeSiteDomain(domainId)
```

**Query Helpers:**
```typescript
siteDb.siteExists(siteId)
siteDb.isDomainAvailable(domain)
siteDb.getActiveSites()
siteDb.searchSites(query)
```

---

### 2. `src/lib/sites/resolver.ts` - Site Resolution (Server-Side)

**Key Feature:** Automatically resolves which site is being accessed based on request headers.

**Core Functions:**

```typescript
// Get current site (cached per request)
const site = await getCurrentSite();

// Require site (throws if not found)
const site = await requireCurrentSite();

// Get current domain
const domain = getCurrentDomain();

// Feature checks
const hasFeature = await hasFeature('blog');
const isDisabled = await isFeatureDisabled('comments');

// Configuration access
const value = await getSiteConfigValue('hero_title', 'Default Title');
const gaId = await getTrackingId('ga');
const amazonTag = await getAffiliateLink('amazon');

// Metadata helpers
const metadata = await getSiteMetadata();
const colors = await getSiteColors();
const isActive = await isSiteActive();

// Manual resolution
const site = await resolveSiteByDomain('example.com');
const site = await resolveSiteBySiteId('anwb-energie');
```

**How It Works:**
1. Reads `host` header from incoming request
2. Looks up site in database by domain
3. Falls back to checking `site_domains` table
4. Returns `null` if no site found
5. **Cached per request** to avoid multiple DB calls

---

### 3. `src/lib/sites/context.tsx` - React Context (Client-Side)

**Provider Component:**
```typescript
import { SiteProvider } from '@/lib/sites';

export default function RootLayout({ children }) {
  const site = await getCurrentSite(); // Server-side
  
  return (
    <SiteProvider site={site}>
      {children}
    </SiteProvider>
  );
}
```

**React Hooks:**

```typescript
// Access site
const { site, hasFeature, getConfigValue } = useSite();

// Feature checks
const hasBlog = useFeature('blog');

// Configuration
const heroTitle = useConfigValue('hero_title', 'Welcome');

// Tracking & affiliates
const gaId = useTrackingId('ga');
const amazonTag = useAffiliateLink('amazon');

// Metadata
const { title, description, locale } = useSiteMetadata();

// Styling
const { primary, secondary } = useSiteColors();

// Status
const isActive = useIsSiteActive();
```

---

### 4. `src/lib/sites/dev-helpers.ts` - Development Utilities

**Quick Site Creation:**
```typescript
import { createTestSite, seedDevelopmentSites } from '@/lib/sites/dev-helpers';

// Create single test site
await createTestSite(
  'my-site',
  'localhost:3000',
  'My Test Site',
  {
    language: 'en',
    primaryColor: '#0066cc',
    features: ['blog', 'comments'],
  }
);

// Seed multiple test sites
await seedDevelopmentSites();
```

**Development CLI:**
```typescript
import { devCli } from '@/lib/sites/dev-helpers';

await devCli.seed();              // Create test sites
await devCli.list();              // List all sites
await devCli.debug('localhost:3000');  // Debug site info
await devCli.clear();             // Clear all sites
await devCli.updateDomain('anwb-energie', 'new-domain.com');
```

**Other Utilities:**
```typescript
await clearAllSites();            // Delete all sites (dev only)
await debugSite('localhost:3000'); // Print site details
await listAllSites();             // List all sites
await updateSiteDomain('site-id', 'new-domain.com');
```

---

### 5. `src/lib/sites/dev-override.ts` - Development Mode Override

**Environment Variable Override:**

Test different sites in development without DNS configuration:

```bash
# Terminal 1: Test ANWB site
SITE_ID=anwb-energie npm run dev

# Terminal 2: Test Memorable site
SITE_ID=memorable-me npm run dev
```

**Or add to `.env.local`:**
```env
SITE_ID=anwb-energie
```

**Functions:**
```typescript
// Resolve with dev override support
const site = await resolveSiteWithOverride(requestDomain);

// Check if using override
const usingOverride = isUsingDevOverride();

// Get dev site ID
const devSiteId = getDevSiteId();

// Print instructions
printDevInstructions();
```

---

### 6. Management Scripts

**`scripts/seed-sites.mjs`** - Create test sites
```bash
node scripts/seed-sites.mjs
```

**`scripts/list-sites.mjs`** - List all sites
```bash
node scripts/list-sites.mjs
```

**`scripts/debug-site.mjs`** - Debug site info
```bash
node scripts/debug-site.mjs localhost:3000
```

---

## 🎯 Usage Examples

### Example 1: Server Component with Site Context

```typescript
// app/page.tsx
import { getCurrentSite, getSiteMetadata } from '@/lib/sites';

export async function generateMetadata() {
  const metadata = await getSiteMetadata();
  
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
  };
}

export default async function HomePage() {
  const site = await getCurrentSite();
  
  if (!site) {
    return <div>Site not found</div>;
  }
  
  return (
    <div>
      <h1>{site.name}</h1>
      <p>Domain: {site.domain}</p>
    </div>
  );
}
```

### Example 2: Client Component with Hooks

```typescript
// components/Header.tsx
'use client';

import { useSite, useFeature, useSiteColors } from '@/lib/sites';

export function Header() {
  const { site } = useSite();
  const hasBlog = useFeature('blog');
  const { primary } = useSiteColors();
  
  return (
    <header style={{ backgroundColor: primary }}>
      <h1>{site?.name}</h1>
      {hasBlog && <a href="/blog">Blog</a>}
    </header>
  );
}
```

### Example 3: API Route with Site Resolution

```typescript
// app/api/posts/route.ts
import { NextRequest } from 'next/server';
import { getCurrentSite } from '@/lib/sites';

export async function GET(request: NextRequest) {
  const site = await getCurrentSite();
  
  if (!site) {
    return Response.json({ error: 'Site not found' }, { status: 404 });
  }
  
  // Fetch posts for this specific site
  const posts = await fetchPostsForSite(site.id);
  
  return Response.json({ posts });
}
```

### Example 4: Conditional Features

```typescript
// app/layout.tsx
import { hasFeature } from '@/lib/sites';
import { Comments } from '@/components/Comments';
import { Newsletter } from '@/components/Newsletter';

export default async function Layout({ children }) {
  const showComments = await hasFeature('comments');
  const showNewsletter = await hasFeature('newsletter');
  
  return (
    <html>
      <body>
        {children}
        {showComments && <Comments />}
        {showNewsletter && <Newsletter />}
      </body>
    </html>
  );
}
```

### Example 5: Dynamic Theming

```typescript
// app/layout.tsx
import { getSiteColors } from '@/lib/sites';

export default async function RootLayout({ children }) {
  const colors = await getSiteColors();
  
  return (
    <html>
      <head>
        <style>{`
          :root {
            --color-primary: ${colors.primary};
            --color-secondary: ${colors.secondary};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🔄 How Multi-Tenancy Works

### Request Flow:

1. **User visits:** `https://anwb-energie.nl`
2. **Next.js receives request** with `host: anwb-energie.nl` header
3. **Site resolver** calls `getCurrentSite()`
4. **Database lookup** finds site by domain
5. **Site config loaded** with all settings
6. **Cached for request** - subsequent calls return cached value
7. **App renders** with site-specific config

### Configuration Hierarchy:

```typescript
// Check order for config values:
1. site.config.custom_settings[key]
2. site.config.content_config[key]
3. site.config[key]
4. defaultValue
```

---

## 🎨 Development Workflow

### 1. Initial Setup

```bash
# Apply migrations (if not done yet)
node scripts/apply-migrations.mjs

# Seed test sites
node scripts/seed-sites.mjs
```

### 2. Test Different Sites

**Option A: Environment Variable**
```bash
SITE_ID=anwb-energie npm run dev
# http://localhost:3000 → serves ANWB site
```

**Option B: Local Hosts File**
```bash
# Edit /etc/hosts (macOS/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 anwb-energie.local
127.0.0.1 memorable.local

# Then access:
# http://anwb-energie.local:3000
# http://memorable.local:3000
```

### 3. Debug Site Configuration

```bash
# Check what's in the database
node scripts/list-sites.mjs

# Debug specific site
node scripts/debug-site.mjs localhost:3000
```

---

## ✅ Key Features

- ✅ **Automatic Site Resolution** - Based on request domain
- ✅ **Request-Level Caching** - Avoid duplicate DB queries
- ✅ **Server & Client Support** - Functions + React hooks
- ✅ **Feature Flags** - Enable/disable features per site
- ✅ **Multi-Domain Support** - Multiple domains per site
- ✅ **Development Override** - Test sites locally with SITE_ID
- ✅ **Comprehensive Utilities** - Scripts for setup and debugging
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Transaction Safety** - Site + config created atomically

---

## 🔜 Next: STEP 6 - Deployment Service

Now we'll integrate everything to build the deployment service that:
- Reads site config from database
- Generates worker script from Next.js build
- Deploys to Cloudflare using our service layer
- Records deployment in database
- Handles rollbacks

Ready to proceed!
