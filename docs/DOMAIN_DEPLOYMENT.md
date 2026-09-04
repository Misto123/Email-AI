# Domain Deployment Architecture

## Current Status

### ✅ What's Already Built:
1. **Site Configuration Database** - Store domain, branding, settings
2. **Admin UI** - Create sites, configure domains
3. **Deployment API** - `/api/admin/sites/[id]/deploy` endpoint
4. **Cloudflare Integration**:
   - `CloudflareDeploymentOrchestrator` - Full deployment workflow
   - `CloudflareWorkerService` - Deploy/update Workers
   - `CloudflareDomainService` - Attach domains to Workers
   - `CloudflareClient` - API wrapper

### ❌ What's NOT Automated Yet:
- DNS record creation (NS/CNAME setup)
- Environment variables for Cloudflare API credentials
- Automated triggering from admin UI
- Build artifact generation for Workers

---

## How Domain Deployment Works (Your Setup)

Since your domains are already on Cloudflare, here's the workflow:

### Step 1: Site Creation (✅ Working)
```
User creates site in admin panel
  ↓
Saves to database: domain, branding, site_id, worker_name
  ↓
Site configuration ready
```

### Step 2: Domain Setup (Manual - But Can Be Automated)

#### For Domains Already on Cloudflare:

**Current Manual Process:**
1. Domain: `anwb-energie.nl` → Already managed by Cloudflare
2. You manually deploy Worker via Cloudflare dashboard
3. You manually attach domain to Worker

**What Can Be Automated (Code Already Exists):**

The deployment service can automatically:
```typescript
// Already built in src/lib/cloudflare/deployment.ts
await cloudflareDeployment.deploySite({
  siteName: 'ANWB Energie',
  workerName: 'anwb-energie-worker',
  domain: 'anwb-energie.nl',
  script: workerCode, // Your Next.js build artifact
  module: true,
});
```

This will:
1. ✅ Deploy Worker to Cloudflare
2. ✅ Attach domain to Worker
3. ✅ Create route: `anwb-energie.nl/*` → `anwb-energie-worker`

**DNS**: Since domain is already on Cloudflare, DNS is already correct! No NS changes needed.

---

## Required Environment Variables

To enable automatic deployment, you need:

```env
# Cloudflare API Credentials
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id  # For domains on Cloudflare

# Optional: For deployment tracking
DEPLOYMENT_WEBHOOK_URL=https://your-webhook.com
```

### How to Get These:

1. **Account ID**: Cloudflare Dashboard → Overview → Copy Account ID
2. **API Token**: 
   - Cloudflare Dashboard → Profile → API Tokens
   - Create Token with permissions:
     - Workers Scripts: Edit
     - Workers Routes: Edit
     - Zone: Read
3. **Zone ID**: Cloudflare Dashboard → Select Domain → Overview → Copy Zone ID

---

## Domain Deployment Scenarios

### Scenario A: Domain on Cloudflare (Your Case - EASIEST)

**Prerequisites:**
- ✅ Domain already on Cloudflare
- ✅ DNS managed by Cloudflare
- ✅ Cloudflare API credentials configured

**Deployment Flow:**
```
1. User creates site in admin
   ↓
2. Click "Deploy" button (needs to be added to UI)
   ↓
3. POST /api/admin/sites/{id}/deploy
   ↓
4. CloudflareDeploymentOrchestrator runs:
   - Builds Worker script (Next.js SSR handler)
   - Deploys Worker to Cloudflare
   - Attaches domain to Worker route
   ↓
5. Done! Site live at domain
```

**DNS:** Already correct (domain on Cloudflare)
**Time:** ~30 seconds

---

### Scenario B: Domain NOT on Cloudflare

**Prerequisites:**
- Domain registered elsewhere (GoDaddy, Namecheap, etc.)
- Need to point to Cloudflare

**Deployment Flow:**
```
1. User creates site in admin
   ↓
2. System provides Cloudflare nameservers:
   - NS: alexa.ns.cloudflare.com
   - NS: evan.ns.cloudflare.com
   ↓
3. User manually updates NS at domain registrar
   ↓
4. Wait for DNS propagation (~5-48 hours)
   ↓
5. Once DNS propagates, click "Deploy"
   ↓
6. Worker deployed, domain attached
```

**Manual Step:** User must update NS at registrar
**Time:** 5 minutes setup + DNS propagation time

---

## Current Implementation Status

### What Works Right Now:

```typescript
// Site creation - ✅ Working
POST /api/admin/sites
{
  "domain": "anwb-energie.nl",
  "name": "ANWB Energie Vriendenkorting",
  "worker_name": "anwb-energie-worker",
  "site_id": "anwb-energie",
  // ... branding, locale, features
}
```

### What Needs Setup:

#### 1. **Add Deploy Button to Admin UI**
Currently missing from `/admin/sites` page.

Location: `src/app/admin/sites/page.tsx`

Add button:
```tsx
<button onClick={() => deploySite(site.id)}>
  Deploy to Cloudflare
</button>
```

#### 2. **Configure Cloudflare Credentials**
Add to `.env.local`:
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_token
```

#### 3. **Build Worker Script**
The deployment service needs a Worker script to deploy.

Current placeholder in code:
```typescript
// src/lib/cloudflare/deployment.ts
script: config.script  // ← Needs actual Worker code
```

This should be your Next.js build artifact wrapped in Worker format.

---

## Recommended Next Steps

### For Your Domains on Cloudflare (Quickest Path):

1. **Get Cloudflare API Credentials** (5 minutes)
   - Account ID
   - API Token with Workers + Zone permissions
   - Zone ID for your domain zone

2. **Add to Environment Variables** (1 minute)
   ```env
   CLOUDFLARE_ACCOUNT_ID=abc123
   CLOUDFLARE_API_TOKEN=xyz789
   CLOUDFLARE_ZONE_ID=def456
   ```

3. **Add Deploy Button to Admin UI** (10 minutes)
   ```tsx
   // In site list or detail page
   <button onClick={() => deployToCloudflare(site.id)}>
     Deploy
   </button>
   ```

4. **Test with One Domain** (5 minutes)
   - Create site in admin
   - Click deploy
   - Worker deploys automatically
   - Domain routes to Worker
   - Site goes live!

5. **Repeat for All Sites** (Automated)
   - One-click deployment
   - No manual Cloudflare dashboard work
   - Fully automated

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Your Workflow                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Admin Panel (/admin/sites/new)                             │
│    ↓                                                         │
│  Create Site (POST /api/admin/sites)                        │
│    ↓                                                         │
│  Database (Supabase)                                         │
│    - Store: domain, branding, site_id, worker_name          │
│    ↓                                                         │
│  [Deploy Button] (POST /api/admin/sites/[id]/deploy)        │
│    ↓                                                         │
│  CloudflareDeploymentOrchestrator                           │
│    ├─ Build Worker Script (Next.js SSR handler)             │
│    ├─ Deploy Worker (CloudflareWorkerService)               │
│    └─ Attach Domain (CloudflareDomainService)               │
│         ↓                                                    │
│  Cloudflare                                                  │
│    ├─ Worker: anwb-energie-worker                           │
│    └─ Route: anwb-energie.nl/* → Worker                     │
│         ↓                                                    │
│  ✅ Live Site: https://anwb-energie.nl                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## DNS Configuration (No Changes Needed for Cloudflare Domains)

### Your Domains Already on Cloudflare:
```
Domain: anwb-energie.nl
  ↓
Nameservers: Already pointing to Cloudflare
  ↓
Cloudflare DNS: Already configured
  ↓
Deploy Worker + Attach Domain = DONE
```

**No NS changes, no CNAME records, no waiting!**

---

## Summary

**Current State:**
- ✅ Full deployment code exists
- ✅ Site creation works
- ✅ Database configured
- ❌ Missing: Cloudflare API credentials in env
- ❌ Missing: Deploy button in admin UI
- ❌ Missing: Worker script generation

**What You Need to Do:**
1. Add Cloudflare API credentials to `.env.local`
2. Add "Deploy" button to admin UI
3. Generate/provide Worker script for deployment

**Then:**
- Create site → Click deploy → Live in 30 seconds
- No manual Cloudflare dashboard work
- No NS changes (domains already on Cloudflare)
- Fully automated multi-site deployment

---

**Would you like me to:**
1. Add the Deploy button to the admin UI?
2. Show you how to get Cloudflare API credentials?
3. Create the Worker script generation logic?
