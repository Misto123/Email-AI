# Rank Tracker System

## Overview

A complete SEO rank tracking system for monitoring keyword positions across search engines. Features domain validation (requires https://), displays domains as `domain.tld` in UI, and tracks rankings over time.

---

## Features

✅ **Multi-Project Support** - Track rankings for multiple domains  
✅ **Domain Validation** - All domains must include `https://` or `http://`  
✅ **Clean Display** - Shows only `domain.tld` in UI (not full URL)  
✅ **Keyword Tracking** - Monitor unlimited keywords per project  
✅ **Rank History** - Daily snapshots of position changes  
✅ **Competitor Tracking** - Monitor competitor domains  
✅ **Search Engine Support** - Google, Bing, Yahoo  
✅ **Multi-Country** - Track rankings by country/language  
✅ **Statistics Dashboard** - Top 10, Top 50, average position  

---

## Database Schema

### Tables Created

1. **`rank_tracker_projects`** - Tracking projects per site
2. **`rank_tracker_keywords`** - Keywords to monitor
3. **`rank_tracker_history`** - Daily rank snapshots
4. **`rank_tracker_competitors`** - Competitor domains

### Key Fields

```typescript
RankTrackerProject {
  target_domain: string;  // MUST include https:// or http://
  search_engine: 'google' | 'bing' | 'yahoo';
  country_code: string;   // us, uk, ca, au, etc.
  language_code: string;  // en, fr, de, etc.
}

RankTrackerKeyword {
  keyword: string;
  target_url?: string;    // Specific page to rank for
  search_volume?: number;
  difficulty_score?: number; // 0-100
}

RankTrackerHistory {
  rank_position?: number; // NULL if not in top 100
  ranked_url?: string;
  tracked_at: Date;
}
```

---

## API Endpoints

### Projects

**GET /api/admin/rank-tracker/projects?site_id={id}**
```bash
curl -X GET "http://localhost:3000/api/admin/rank-tracker/projects?site_id=memorable-me" \
  -H "x-admin-key: your-key"
```

**POST /api/admin/rank-tracker/projects**
```bash
curl -X POST http://localhost:3000/api/admin/rank-tracker/projects \
  -H "x-admin-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "memorable-me",
    "project_name": "Main Website",
    "target_domain": "https://example.com",
    "search_engine": "google",
    "country_code": "us",
    "language_code": "en"
  }'
```

**PATCH /api/admin/rank-tracker/projects/{projectId}**
```bash
curl -X PATCH http://localhost:3000/api/admin/rank-tracker/projects/{id} \
  -H "x-admin-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Updated Name",
    "is_active": true
  }'
```

**DELETE /api/admin/rank-tracker/projects/{projectId}**
```bash
curl -X DELETE http://localhost:3000/api/admin/rank-tracker/projects/{id} \
  -H "x-admin-key: your-key"
```

---

### Keywords

**GET /api/admin/rank-tracker/keywords?project_id={id}**
```bash
curl -X GET "http://localhost:3000/api/admin/rank-tracker/keywords?project_id={id}" \
  -H "x-admin-key: your-key"
```

**POST /api/admin/rank-tracker/keywords**
```bash
curl -X POST http://localhost:3000/api/admin/rank-tracker/keywords \
  -H "x-admin-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "uuid",
    "keyword": "energy savings tips",
    "target_url": "https://example.com/energy-tips",
    "search_volume": 1000,
    "difficulty_score": 45
  }'
```

**PATCH /api/admin/rank-tracker/keywords**
```bash
curl -X PATCH http://localhost:3000/api/admin/rank-tracker/keywords \
  -H "x-admin-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword_id": "uuid",
    "is_active": false
  }'
```

**DELETE /api/admin/rank-tracker/keywords?keyword_id={id}**
```bash
curl -X DELETE "http://localhost:3000/api/admin/rank-tracker/keywords?keyword_id={id}" \
  -H "x-admin-key: your-key"
```

---

## Domain Validation

### Requirements

- All domains **MUST** include `https://` or `http://`
- Domains are automatically normalized to `https://`
- Invalid URLs are rejected with error message

### Validation Function

```typescript
import { validateDomainUrl, normalizeDomainUrl, extractDomainTld } from '@/types/rank-tracker';

// Validate
const validation = validateDomainUrl('https://example.com');
if (!validation.valid) {
  console.error(validation.error);
}

// Normalize (force https)
const normalized = normalizeDomainUrl('http://example.com');
// Returns: "https://example.com"

// Extract for display
const display = extractDomainTld('https://www.example.com');
// Returns: "www.example.com"
```

### Error Messages

- `"Domain URL is required"` - Empty input
- `"Domain must start with https:// or http://"` - Missing protocol
- `"Invalid URL format"` - Malformed URL

---

## Display Format

### Storage vs Display

**In Database:**
```
target_domain: "https://www.example.com"
competitor_domain: "https://competitor.com"
```

**In UI:**
```
example.com
competitor.com
```

### Implementation

```typescript
// Project selector buttons
{projects.map((project) => (
  <button key={project.id}>
    {extractDomainTld(project.target_domain)}
  </button>
))}

// Always store full URL
const project = {
  target_domain: "https://example.com" // ✅ Correct
}

// Never store just domain
const project = {
  target_domain: "example.com" // ❌ Wrong
}
```

---

## Usage Example

### 1. Create Project

```typescript
const project = await createRankTrackerProject({
  site_id: 'memorable-me',
  project_name: 'Main Website SEO',
  target_domain: 'https://memorable.me',
  search_engine: 'google',
  country_code: 'us',
  language_code: 'en',
});
```

### 2. Add Keywords

```typescript
await addKeyword({
  project_id: project.id,
  keyword: 'energy savings tips',
  target_url: 'https://memorable.me/energy-tips',
  search_volume: 1200,
  difficulty_score: 42,
});

await addKeyword({
  project_id: project.id,
  keyword: 'how to save on energy bills',
  search_volume: 800,
  difficulty_score: 35,
});
```

### 3. Track Rankings

```typescript
// Manual rank entry (typically done by scraper/API)
await addRankHistory(
  keywordId,
  15, // Position #15
  'https://memorable.me/energy-tips'
);

// Not ranking (not in top 100)
await addRankHistory(keywordId, null);
```

### 4. View Stats

```typescript
const projects = await getRankTrackerProjects('memorable-me');

projects[0].total_keywords;        // 50
projects[0].keywords_in_top_10;    // 5
projects[0].keywords_in_top_50;    // 23
projects[0].keywords_not_ranking;  // 12
projects[0].average_position;      // 28
```

---

## UI Components

### Rank Tracker Page

**Route:** `/rank-tracker`

**Features:**
- Project selector (shows domain.tld only)
- Statistics dashboard
- Keywords table with current rank, change, best rank
- Add project modal (validates https://)
- Add keyword modal

**Color-coded Ranks:**
- Green: Top 3
- Blue: Top 10
- Yellow: Top 50
- Red: 51-100

### Settings Integration

Domain validation is also applied in `/settings` page for affiliate URLs:

```typescript
// Force https:// on all URL inputs
const validation = validateDomainUrl(affiliateUrl);
if (!validation.valid) {
  setError(validation.error);
}
```

---

## Migration

**File:** `supabase/migrations/006_rank_tracker_system.sql`

**Apply:**
```bash
node scripts/apply-migrations.mjs
```

**Tables Created:**
- `rank_tracker_projects`
- `rank_tracker_keywords`
- `rank_tracker_history`
- `rank_tracker_competitors`

---

## Integration with Existing System

### Sites Table

Projects reference `sites.site_id`:
```sql
site_id TEXT NOT NULL REFERENCES sites(site_id) ON DELETE CASCADE
```

### Multi-Site Support

Each site can have multiple rank tracking projects:
```typescript
const siteProjects = await getRankTrackerProjects('site-id-1');
const otherProjects = await getRankTrackerProjects('site-id-2');
```

---

## Future Enhancements

**Planned:**
- [ ] Automatic rank checking (scraper integration)
- [ ] Google Search Console API integration
- [ ] Email alerts for rank changes
- [ ] Competitor rank tracking
- [ ] Rank distribution charts
- [ ] Export to CSV
- [ ] Historical trend graphs
- [ ] SERP feature tracking (featured snippets, etc.)

---

## Files Created

### Database
- `supabase/migrations/006_rank_tracker_system.sql`

### Types
- `src/types/rank-tracker.ts`

### Services
- `src/lib/rank-tracker/db.ts`

### API Routes
- `src/app/api/admin/rank-tracker/projects/route.ts`
- `src/app/api/admin/rank-tracker/projects/[projectId]/route.ts`
- `src/app/api/admin/rank-tracker/keywords/route.ts`

### Pages
- `src/app/rank-tracker/page.tsx`

### Documentation
- `docs/RANK-TRACKER.md` (this file)

---

## Quick Start

1. **Apply migration:**
   ```bash
   node scripts/apply-migrations.mjs
   ```

2. **Visit rank tracker:**
   ```
   http://localhost:3000/rank-tracker
   ```

3. **Create first project:**
   - Click "New Project"
   - Enter domain with `https://`
   - Submit

4. **Add keywords:**
   - Select project
   - Click "Add Keyword"
   - Enter keyword and optional details

5. **Track rankings:**
   - Use API to record daily positions
   - View stats and history in dashboard

---

## API Client Example

```typescript
// Create a project
const response = await fetch('/api/admin/rank-tracker/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.ADMIN_API_KEY,
  },
  body: JSON.stringify({
    site_id: 'my-site',
    project_name: 'Main Site',
    target_domain: 'https://example.com',
  }),
});

const { project } = await response.json();

// Add keywords
await fetch('/api/admin/rank-tracker/keywords', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': process.env.ADMIN_API_KEY,
  },
  body: JSON.stringify({
    project_id: project.id,
    keyword: 'my keyword',
    search_volume: 1000,
  }),
});
```

---

## Summary

✅ Complete rank tracking system  
✅ Domain validation (https:// required)  
✅ Clean display (domain.tld only)  
✅ Full API and database layer  
✅ Beautiful UI with statistics  
✅ Multi-site support  
✅ Ready for integration with rank checking services  

**Access:** `http://localhost:3000/rank-tracker`
