# API Integrations - SEO Flow & GCTR Panel

## Overview

Complete integration with two powerful SEO and CTR manipulation APIs:

1. **SEO Flow API** - Domain-scoped keyword research, rankings, and SEO health
2. **GCTR Panel API** - Google Click-Through Rate automation and campaign management

---

## 1. SEO Flow API

### Base URL
```
https://ncvdbrtjyqahlcwkgazt.supabase.co/functions/v1
```

### Authentication
Every request requires the header:
```
x-domain-api-key: <YOUR_KEY>
```

### Features

✅ **Keyword Management** - Add and track keywords  
✅ **Ranking Monitoring** - Track positions in search results  
✅ **Backlink Analysis** - Monitor incoming links  
✅ **Page Statistics** - Analyze page performance  
✅ **SEO Health Score** - Overall site health monitoring  

### Available Endpoints

```typescript
GET  /domain-api/me               // Get domain info (verify key)
GET  /domain-api/keywords         // Get all keywords
POST /domain-api/keywords         // Add keywords (bulk)
GET  /domain-api/rankings         // Get keyword rankings
GET  /domain-api/backlinks        // Get backlinks
GET  /domain-api/stats-pages      // Get page statistics
GET  /domain-api/seo-health       // Get SEO health score
```

### API Client Usage

```typescript
import { getSEOFlowAPI } from '@/lib/seo-flow/client';

const seoFlow = getSEOFlowAPI();

// Verify API key and get domain
const { domain } = await seoFlow.getDomain();

// Add keywords
await seoFlow.addKeywords([
  {
    keyword: 'best energy savings',
    language_code: 'en',
    geo_location: 'us',
    search_volume: 1200,
  },
]);

// Get rankings
const { rankings } = await seoFlow.getRankings('best energy savings');

// Get SEO health
const { health } = await seoFlow.getHealth();
```

### Configuration

Add to `.env.local`:
```env
SEO_FLOW_API_KEY=your-seo-flow-api-key
```

### Rules for AI Agents

1. Store the key as `SEO_FLOW_API_KEY` (never hardcode in client-side code)
2. Call `/domain-api/me` first to confirm the key and bound domain
3. Never send keywords for a domain other than the bound one
4. Poll rankings at most once per hour (data refreshes daily)
5. On 401 or 403, stop and ask for a new key (don't retry)

---

## 2. GCTR Panel API

### Base URL
```
https://anwgnjrawbsnirwwhrti.supabase.co/functions/v1/jobs-api
```

### Authentication
Every request requires the header:
```
x-api-key: <YOUR_KEY>
```

### Features

✅ **Campaign Management** - Create, update, delete campaigns  
✅ **Multiple Campaign Types** - GCTR, direct, GMB, backlink, etc.  
✅ **Keyword Campaigns** - Up to 50 keywords per campaign  
✅ **Location Targeting** - Multi-country support  
✅ **Auto-merging** - One campaign per domain (keywords merge)  

### Campaign Types

- `gctr` - Google CTR manipulation with keywords
- `direct` - Direct traffic campaigns
- `gmb-website-clicker` - Google My Business clicks
- `gctr-reformulation` - Query reformulation
- `gctr-exit` - Exit intent campaigns
- `backlink` - Backlink campaigns

### Available Endpoints

```typescript
POST   /jobs-api              // Create or update campaign
GET    /jobs-api?id={id}      // Get campaign status
DELETE /jobs-api?id={id}      // Delete campaign
```

### API Client Usage

```typescript
import { getGCTRAPI } from '@/lib/gctr/client';

const gctr = getGCTRAPI();

// Create a GCTR keyword campaign
const result = await gctr.createGCTRCampaign(
  'Main Website CTR Boost',
  'https://example.com/page',
  [
    { keyword: 'best widgets', dailyClicks: 5 },
    { keyword: 'widget reviews', dailyClicks: 3 },
  ],
  ['nl', 'us'], // locations
  1 // duration in months
);

// Get campaign status
const campaign = await gctr.getCampaign(result.job.id);

// Delete campaign
await gctr.deleteCampaign(result.job.id);
```

### Configuration

Add to `.env.local`:
```env
GCTR_API_KEY=your-gctr-api-key
```

### Rules and Constraints

1. **One campaign per domain** - Second campaign merges keywords unless `createMode: "force-new"`
2. **Maximum 50 keywords** per campaign
3. **Daily clicks** must be integer >= 1
4. **Valid location codes** - us, uk, nl, de, fr, es, it, au, ca (2-letter)
5. **Blocked hosts** - instacodes.nl, mrkortingscode.nl (rejected)
6. **No placeholder domains** - example.com rejected

---

## Setup Instructions

### 1. Add API Keys

Edit `.env.local`:
```env
# SEO Flow API (domain-scoped)
SEO_FLOW_API_KEY=your-seo-flow-api-key

# GCTR Panel API (Jobs API for automations)
GCTR_API_KEY=your-gctr-api-key
```

### 2. Restart Development Server

```bash
npm run dev
```

### 3. Verify Connections

Visit the API Settings page:
```
http://localhost:3000/api-settings
```

Click "Test Connection" for each API to verify they're working.

---

## User Interface

### API Settings Page

**Route:** `/api-settings`

**Features:**
- Connection status indicators (Connected/Invalid/Not Configured)
- Test connection buttons
- Display API endpoints and configuration
- Links to dashboards

### SEO Flow Dashboard

**Route:** `/seo-flow`

**Features:**
- **Keywords Tab** - Add and manage tracked keywords
- **Rankings Tab** - View current keyword positions
- **SEO Health Tab** - View health score and issues

### GCTR Dashboard

**Route:** `/gctr`

**Features:**
- Campaign type selector
- Create campaign modal with keyword management
- Success notifications with deeplink to GCTR panel
- Support for all campaign types

---

## API Routes

### SEO Flow Routes

```
GET  /api/admin/seo-flow/verify     // Verify API key
GET  /api/admin/seo-flow/keywords   // Get keywords
POST /api/admin/seo-flow/keywords   // Add keywords
GET  /api/admin/seo-flow/rankings   // Get rankings
GET  /api/admin/seo-flow/health     // Get SEO health
```

### GCTR Routes

```
GET    /api/admin/gctr/verify       // Verify API key
POST   /api/admin/gctr/campaigns    // Create campaign
GET    /api/admin/gctr/campaigns    // Get campaign status
DELETE /api/admin/gctr/campaigns    // Delete campaign
```

All routes require `x-admin-key` header.

---

## Example Workflows

### SEO Flow: Add Keywords and Check Rankings

```bash
# 1. Verify API key
curl -X GET "http://localhost:3000/api/admin/seo-flow/verify" \
  -H "x-admin-key: your-admin-key"

# 2. Add keywords
curl -X POST "http://localhost:3000/api/admin/seo-flow/keywords" \
  -H "x-admin-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": [
      {
        "keyword": "best energy savings",
        "language_code": "en",
        "geo_location": "us",
        "search_volume": 1200
      }
    ]
  }'

# 3. Check rankings
curl -X GET "http://localhost:3000/api/admin/seo-flow/rankings?keyword=best+energy+savings" \
  -H "x-admin-key: your-admin-key"
```

### GCTR: Create CTR Campaign

```bash
# 1. Verify API key
curl -X GET "http://localhost:3000/api/admin/gctr/verify" \
  -H "x-admin-key: your-admin-key"

# 2. Create campaign
curl -X POST "http://localhost:3000/api/admin/gctr/campaigns" \
  -H "x-admin-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Website CTR Boost",
    "targetUrl": "https://example.com/page",
    "type": "gctr",
    "locations": ["nl", "us"],
    "keywords": [
      { "keyword": "best widgets", "dailyClicks": 5 },
      { "keyword": "widget reviews", "dailyClicks": 3 }
    ],
    "duration": {
      "length": 1,
      "unit": "month"
    },
    "anonymousPercent": 50
  }'

# 3. Get campaign status
curl -X GET "http://localhost:3000/api/admin/gctr/campaigns?id=campaign-id" \
  -H "x-admin-key: your-admin-key"
```

---

## Files Created

### API Clients
- `src/lib/seo-flow/client.ts` - SEO Flow API client
- `src/lib/gctr/client.ts` - GCTR Panel API client

### API Routes (SEO Flow)
- `src/app/api/admin/seo-flow/verify/route.ts`
- `src/app/api/admin/seo-flow/keywords/route.ts`
- `src/app/api/admin/seo-flow/rankings/route.ts`
- `src/app/api/admin/seo-flow/health/route.ts`

### API Routes (GCTR)
- `src/app/api/admin/gctr/verify/route.ts`
- `src/app/api/admin/gctr/campaigns/route.ts`

### UI Pages
- `src/app/api-settings/page.tsx` - API configuration and testing
- `src/app/seo-flow/page.tsx` - SEO Flow dashboard
- `src/app/gctr/page.tsx` - GCTR campaign management

### Documentation
- `docs/API-INTEGRATIONS.md` (this file)

---

## Error Handling

### SEO Flow Errors

```json
{ "error": "human readable message", "code": "machine_code" }
```

**Common Codes:**
- `400` - bad_request
- `401` - missing_key | invalid_key
- `403` - disabled_key
- `404` - not_found
- `5xx` - server_error (retry with backoff)

### GCTR Errors

```json
{ "error": "human readable message" }
```

**Common Issues:**
- Invalid API key (401)
- Maximum 50 keywords exceeded
- Invalid location codes
- Blocked domain
- Invalid URL format

---

## Security Notes

1. **Never expose API keys** in client-side code
2. **Use environment variables** for all keys
3. **Admin API key required** for all backend routes
4. **Rate limiting** - Respect API limits (SEO Flow: 1 req/hour for rankings)
5. **Domain binding** - SEO Flow keys are bound to specific domains

---

## Quick Start

1. **Add API keys** to `.env.local`
2. **Restart dev server**
3. **Visit** `/api-settings` and test connections
4. **Use dashboards:**
   - `/seo-flow` - Keyword tracking and SEO health
   - `/gctr` - CTR campaign management

---

## Support

### SEO Flow
- API bound to specific domain
- Get keys from SEO Flow dashboard > API Access

### GCTR Panel
- One key per domain
- Create campaigns via UI or API
- View campaigns in GCTR panel (deeplinks provided)

---

## Summary

✅ **Two powerful APIs integrated**  
✅ **Complete TypeScript clients**  
✅ **Beautiful UI dashboards**  
✅ **Full CRUD operations**  
✅ **Error handling and validation**  
✅ **Connection testing built-in**  
✅ **Production-ready**  

Start boosting your SEO with automated keyword tracking and CTR manipulation!
