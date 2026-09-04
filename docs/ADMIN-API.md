# Admin API Documentation

## Authentication

All admin API endpoints require authentication via API key.

**Header Required:**
```
x-admin-key: your-admin-api-key
```

**Setup:**
Add to `.env.local`:
```env
ADMIN_API_KEY=your-secret-admin-key-here
```

---

## Endpoints

### Sites Management

#### List Sites
```http
GET /api/admin/sites
```

**Query Parameters:**
- `status` - Filter by status (active)
- `search` - Search by name, domain, or site_id

**Response:**
```json
{
  "success": true,
  "data": {
    "sites": [...],
    "count": 10
  }
}
```

---

#### Get Site
```http
GET /api/admin/sites/:id
```

**Parameters:**
- `id` - Site UUID or site_id (slug)

**Response:**
```json
{
  "success": true,
  "data": {
    "site": {
      "id": "uuid",
      "site_id": "anwb-energie",
      "name": "ANWB Energie",
      "domain": "anwb-energie.nl",
      "worker_name": "worker-anwb-energie",
      "status": "active",
      "config": {
        "language": "nl",
        "locale": "nl-NL",
        "primary_color": "#0066cc",
        ...
      }
    },
    "domains": [...]
  }
}
```

---

#### Create Site
```http
POST /api/admin/sites
```

**Body:**
```json
{
  "site_id": "my-site",
  "domain": "my-site.com",
  "worker_name": "worker-my-site",
  "name": "My Site",
  "status": "active",
  "language": "en",
  "locale": "en-US",
  "primary_color": "#0066cc",
  "secondary_color": "#ff6600",
  "features_enabled": ["blog", "comments"],
  "tracking_ids": {
    "ga": "UA-XXXXXXX-X"
  }
}
```

**Required Fields:**
- `site_id` - Lowercase, numbers, hyphens only
- `domain` - Valid domain name
- `worker_name` - Worker identifier
- `name` - Display name

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "site": {...}
  }
}
```

---

#### Update Site
```http
PUT /api/admin/sites/:id
```

**Body:** (all fields optional)
```json
{
  "domain": "new-domain.com",
  "name": "Updated Name",
  "status": "disabled",
  "primary_color": "#ff0000",
  "features_enabled": ["blog", "newsletter"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "site": {...}
  }
}
```

---

#### Delete Site
```http
DELETE /api/admin/sites/:id?force=true
```

**Query Parameters:**
- `force=true` - Required for safety

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Site deleted successfully",
    "siteId": "uuid"
  }
}
```

---

### Deployments

#### Deploy Site
```http
POST /api/admin/sites/:id/deploy
```

**Body:** (all optional)
```json
{
  "commitSha": "abc123...",
  "commitMessage": "Deploy new feature",
  "branch": "main",
  "deployedBy": "admin@example.com",
  "notes": "Hotfix deployment",
  "environment": "production",
  "skipBuild": false
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "message": "Deployment started",
    "site": {...},
    "options": {...}
  }
}
```

---

#### Get Deployment Status
```http
GET /api/admin/sites/:id/deploy
```

**Response:**
```json
{
  "success": true,
  "data": {
    "site": {...},
    "latestDeployment": {...},
    "activeDeployments": [...],
    "hasActiveDeployment": false
  }
}
```

---

#### List Deployments
```http
GET /api/admin/deployments
```

**Query Parameters:**
- `site_id` - Filter by site
- `status` - Filter by status (success, failed, pending, building, deploying)
- `environment` - Filter by environment (production, staging, preview)
- `deployment_type` - Filter by type (manual, auto, rollback)
- `deployed_by` - Filter by user
- `from_date` - ISO timestamp
- `to_date` - ISO timestamp
- `limit` - Max results (default: 50, max: 100)
- `offset` - Pagination offset
- `include_site=true` - Include site details

**Response:**
```json
{
  "success": true,
  "data": {
    "deployments": [...],
    "count": 25,
    "limit": 50,
    "offset": 0
  }
}
```

---

#### Get Deployment
```http
GET /api/admin/deployments/:id
```

**Query Parameters:**
- `include_logs=true` - Include detailed logs (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "deployment": {
      "id": "uuid",
      "site_id": "uuid",
      "commit_sha": "abc123...",
      "commit_message": "Deploy feature",
      "status": "success",
      "environment": "production",
      "build_time_seconds": 180,
      "deploy_time_seconds": 45,
      "logs_detailed": [...]
    },
    "site": {...}
  }
}
```

---

#### Rollback Deployment
```http
POST /api/admin/deployments/:id/rollback
```

**Body:** (optional)
```json
{
  "deployedBy": "admin@example.com"
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "data": {
    "message": "Rollback started",
    "targetDeployment": {...},
    "site": {...}
  }
}
```

---

### Dashboard Stats

#### Get Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sites": {
      "total": 10,
      "active": 8,
      "inactive": 2
    },
    "deployments": {
      "total": 150,
      "successful": 142,
      "failed": 8,
      "active": 1,
      "successRate": 94.7,
      "avgBuildTime": 185,
      "avgDeployTime": 42
    },
    "recentDeployments": [...],
    "siteDeployments": [...]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid API key)
- `404` - Not Found
- `409` - Conflict (duplicate site_id, domain in use)
- `500` - Internal Server Error

---

## Examples

### Create and Deploy a Site

```bash
# 1. Create site
curl -X POST https://your-domain.com/api/admin/sites \
  -H "x-admin-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "site_id": "my-new-site",
    "domain": "my-new-site.com",
    "worker_name": "worker-my-new-site",
    "name": "My New Site",
    "language": "en",
    "primary_color": "#0066cc",
    "features_enabled": ["blog"]
  }'

# 2. Deploy site
curl -X POST https://your-domain.com/api/admin/sites/my-new-site/deploy \
  -H "x-admin-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "deployedBy": "admin@example.com",
    "notes": "Initial deployment"
  }'

# 3. Check deployment status
curl https://your-domain.com/api/admin/sites/my-new-site/deploy \
  -H "x-admin-key: your-api-key"
```

### List Recent Deployments

```bash
curl "https://your-domain.com/api/admin/deployments?limit=10&status=success&include_site=true" \
  -H "x-admin-key: your-api-key"
```

### Rollback to Previous Deployment

```bash
# 1. List deployments to find target
curl "https://your-domain.com/api/admin/deployments?site_id=my-site&status=success&limit=5" \
  -H "x-admin-key: your-api-key"

# 2. Rollback to specific deployment
curl -X POST https://your-domain.com/api/admin/deployments/deployment-uuid/rollback \
  -H "x-admin-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"deployedBy": "admin@example.com"}'
```

### Get Dashboard Stats

```bash
curl https://your-domain.com/api/admin/stats \
  -H "x-admin-key: your-api-key"
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production using:
- Upstash Rate Limit
- Vercel Edge Config
- Custom middleware with Redis

---

## Webhooks (Future)

Planned webhook events:
- `deployment.started`
- `deployment.completed`
- `deployment.failed`
- `site.created`
- `site.updated`
- `site.deleted`

---

## TypeScript SDK (Future)

A TypeScript SDK could be generated from these endpoints for type-safe API calls:

```typescript
import { AdminAPIClient } from '@my-platform/admin-sdk';

const client = new AdminAPIClient({ apiKey: 'xxx' });

const site = await client.sites.create({
  siteId: 'my-site',
  domain: 'my-site.com',
  ...
});

await client.sites.deploy(site.id);
```
