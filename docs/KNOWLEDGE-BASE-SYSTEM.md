# Multi-Site Knowledge Base System - Implementation Guide

## 🎉 Overview

A comprehensive, SEO-optimized knowledge base system with **topical mapping**, **structured data (Schema.org)**, and **beautiful UI** for your multi-site platform.

---

## ✨ Key Features

### 1. **Hierarchical Content Structure**
- **Topics** → Top-level content clusters (topical authority)
- **Categories** → Subtopics within topics
- **Articles** → Individual knowledge base content
- **Sections** → H2 headings within articles (table of contents)
- **FAQs** → Structured FAQ items with Schema.org support

### 2. **SEO-First Architecture**
- ✅ **Schema.org structured data**:
  - Article schema
  - FAQ schema
  - Breadcrumb schema
- ✅ **Meta tags** (title, description, keywords, canonical)
- ✅ **Open Graph** and **Twitter Cards**
- ✅ **Index/noindex** control per article
- ✅ **Automatic sitemap generation** ready
- ✅ **Internal linking** system for topical authority

### 3. **Topical Mapping**
- Link related articles automatically
- Build topic clusters for SEO
- Track link types: related, prerequisite, next-step, parent, child
- Visualize content relationships

### 4. **Beautiful UI**
- Modern, responsive design
- Color-coded topics with icons
- Featured articles grid
- Reading time estimates
- View counters
- "Was this helpful?" voting
- Related articles sidebar
- Sticky table of contents

### 5. **Analytics & Tracking**
- Article views
- Helpful votes
- View trends (7-day, 30-day)
- Popular articles
- Search analytics ready

---

## 📊 Database Schema

### Core Tables

#### `kb_topics`
Top-level topic clusters for topical authority.

```sql
- id (UUID)
- site_id (UUID) → references sites
- name (TEXT) - e.g., "Energy Savings"
- slug (TEXT) - URL-friendly
- description (TEXT)
- meta_title, meta_description (SEO)
- icon (TEXT) - emoji or icon name
- color (TEXT) - brand color
- pillar_article_id (UUID) - main pillar article
- display_order (INTEGER)
- status (active | hidden | archived)
```

#### `kb_categories`
Categories within topics (subtopics).

```sql
- id (UUID)
- site_id, topic_id (UUID)
- name, slug, description
- meta_title, meta_description
- icon, display_order
- status
```

#### `kb_articles`
Individual knowledge base articles.

```sql
- id (UUID)
- site_id, topic_id, category_id (UUID)
- title, slug, excerpt, content
- meta_title, meta_description, meta_keywords[]
- canonical_url
- article_type (article | guide | faq | tutorial | comparison)
- author_name, author_bio
- published_at, updated_at
- reading_time_minutes, word_count
- featured_image_url
- is_pillar, is_featured (booleans)
- index_status (index | noindex)
- view_count, helpful_count
- status (draft | published | archived)
```

#### `kb_article_sections`
H2 sections within articles (for table of contents).

```sql
- id (UUID)
- article_id (UUID)
- title, slug, content
- display_order
```

#### `kb_faqs`
FAQ items with structured data.

```sql
- id (UUID)
- article_id (UUID)
- question, answer
- display_order
```

#### `kb_article_links`
Internal linking between articles.

```sql
- id (UUID)
- source_article_id, target_article_id (UUID)
- anchor_text (TEXT)
- link_type (related | prerequisite | next-step | parent | child)
```

#### `kb_tags`
Flexible tagging system.

```sql
- id (UUID)
- site_id (UUID)
- name, slug, color
```

---

## 🎨 UI Components

### `<KBHomePage />`
Beautiful homepage with:
- Hero section with search
- Topics grid with stats
- Featured articles
- Recent articles
- CTA sections

**Props:**
```typescript
{
  topics: KBTopicWithStats[];
  featuredArticles: KBArticlePreview[];
  recentArticles: KBArticlePreview[];
  siteName: string;
}
```

### `<KBArticleView />`
Full article view with:
- Breadcrumbs
- Schema.org structured data (Article, FAQ, Breadcrumb)
- Hero section with meta info
- Table of contents
- Styled content with proper typography
- FAQ accordion
- Author bio
- Related articles sidebar
- "Was this helpful?" button
- CTA

**Props:**
```typescript
{
  article: KBArticleFull;
  siteUrl: string;
  siteName: string;
  logoUrl?: string;
}
```

---

## 🚀 API Endpoints

### Admin Endpoints

All require `x-admin-key` header.

#### Topics
```bash
GET    /api/admin/sites/:siteId/kb/topics
POST   /api/admin/sites/:siteId/kb/topics
```

#### Categories
```bash
GET    /api/admin/sites/:siteId/kb/categories
POST   /api/admin/sites/:siteId/kb/categories
```

#### Articles
```bash
GET    /api/admin/sites/:siteId/kb/articles?q=query&topic_id=uuid&status=published
POST   /api/admin/sites/:siteId/kb/articles
PUT    /api/admin/kb/articles/:articleId
POST   /api/admin/kb/articles/:articleId/publish
```

### Public Endpoints

```bash
GET    /knowledge-base                    # Homepage
GET    /knowledge-base/:slug              # Article page
GET    /knowledge-base/topics/:slug       # Topic page
GET    /knowledge-base/search?q=query     # Search
```

---

## 📝 Usage Examples

### 1. Create a Topic

```bash
curl -X POST http://localhost:3000/api/admin/sites/memorable-me/kb/topics \
  -H "x-admin-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Saving Guides",
    "slug": "saving-guides",
    "description": "Practical ways to compare offers and spend with confidence",
    "icon": "💰",
    "color": "#1f7138",
    "display_order": 1
  }'
```

### 2. Create a Category

```bash
curl -X POST http://localhost:3000/api/admin/sites/memorable-me/kb/categories \
  -H "x-admin-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "topic-uuid",
    "name": "Getting Started",
    "slug": "getting-started",
    "description": "Simple guides for making the most of every offer",
    "icon": "🚀",
    "display_order": 0
  }'
```

### 3. Create an Article

```bash
curl -X POST http://localhost:3000/api/admin/sites/memorable-me/kb/articles \
  -H "x-admin-key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "topic-uuid",
    "category_id": "category-uuid",
    "title": "How to compare energy offers before you switch",
    "slug": "how-to-compare-energy-offers",
    "excerpt": "A practical checklist for comparing rates, conditions, and the real value of an energy offer.",
    "content": "<p>The best offer depends on how much energy your household uses...</p>",
    "meta_title": "How to Compare Energy Offers | Complete Guide",
    "meta_description": "Learn how to compare energy offers effectively with our step-by-step guide.",
    "meta_keywords": ["energy offer", "compare energy", "saving guide"],
    "article_type": "guide",
    "author_name": "John Doe",
    "featured_image_url": "/images/energy-comparison.jpg",
    "is_featured": true,
    "sections": [
      {
        "title": "Check the conditions",
        "slug": "check-the-conditions",
        "content": "<p>Read the eligibility rules...</p>",
        "display_order": 0
      }
    ],
    "faqs": [
      {
        "question": "What should I compare first?",
        "answer": "Compare the total estimated annual cost...",
        "display_order": 0
      }
    ]
  }'
```

### 4. Publish an Article

```bash
curl -X POST http://localhost:3000/api/admin/kb/articles/:articleId/publish \
  -H "x-admin-key: your-key"
```

---

## 🔍 SEO Features

### Automatic Schema.org Generation

Every article automatically generates:

**1. Article Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "description": "Article excerpt",
  "image": "featured-image.jpg",
  "author": { "@type": "Person", "name": "Author Name" },
  "publisher": { "@type": "Organization", "name": "Site Name" },
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-15"
}
```

**2. FAQ Schema** (if FAQs present)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Question text?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Answer text"
      }
    }
  ]
}
```

**3. Breadcrumb Schema**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home" },
    { "@type": "ListItem", "position": 2, "name": "Knowledge Base" },
    { "@type": "ListItem", "position": 3, "name": "Topic" },
    { "@type": "ListItem", "position": 4, "name": "Article" }
  ]
}
```

---

## 🎯 Topical Mapping Strategy

### Building Topic Clusters

**1. Pillar Content**
- Create comprehensive pillar articles for each topic
- Mark as `is_pillar: true`
- Link from all related articles

**2. Supporting Content**
- Create 5-10 supporting articles per topic
- Link to pillar article
- Cross-link related supporting articles

**3. Internal Linking**
```typescript
// Link articles together
await createArticleLink({
  source_article_id: 'article-1',
  target_article_id: 'pillar-article',
  anchor_text: 'Learn more about energy savings',
  link_type: 'parent'
});
```

### Link Types

- **related**: General related content
- **prerequisite**: Read this first
- **next-step**: Read this next
- **parent**: Parent/pillar article
- **child**: Child/supporting article

---

## 📈 Analytics

### Track Article Views

Automatically tracked on page load:
```typescript
await trackArticleView(articleId, {
  userIp: 'hashed-ip',
  referrer: 'https://google.com',
  sessionId: 'session-123'
});
```

### Mark Article Helpful

```typescript
await markArticleHelpful(articleId);
```

### Get Article Stats

```typescript
const stats = await getArticleStats(articleId);
// Returns: views, helpful_count, views_last_7_days, etc.
```

---

## 🎨 Customization Per Site

### Site-Specific Content

Each site can have:
- Custom topics with unique colors and icons
- Site-specific articles
- Custom branding in articles
- Different author attribution

### Content Reuse

Share articles across sites by:
1. Creating articles in a "shared" site
2. Importing/syncing to other sites
3. Or use `site_id` filtering in queries

---

## 🚀 Setup Instructions

### 1. Apply Database Migration

```bash
node scripts/apply-migrations.mjs
# Or manually apply: supabase/migrations/004_knowledge_base_system.sql
```

### 2. Create Topics

```bash
# Via API or admin UI
curl -X POST .../kb/topics ...
```

### 3. Create Articles

```bash
# Via API or admin UI
curl -X POST .../kb/articles ...
```

### 4. Access Knowledge Base

```
http://localhost:3000/knowledge-base-v2
```

---

## 📁 File Structure

```
src/
├── types/
│   └── knowledge-base.ts           # All TypeScript types
├── lib/
│   └── knowledge-base/
│       └── db.ts                   # Database service layer
├── components/
│   └── knowledge-base/
│       ├── KBHomePage.tsx          # Homepage component
│       └── KBArticleView.tsx       # Article view component
├── app/
│   ├── knowledge-base-v2/
│   │   ├── page.tsx                # Homepage
│   │   └── [slug]/page.tsx         # Article page
│   └── api/admin/
│       ├── sites/[siteId]/kb/
│       │   ├── topics/route.ts
│       │   ├── categories/route.ts
│       │   └── articles/route.ts
│       └── kb/articles/[articleId]/route.ts
└── supabase/migrations/
    └── 004_knowledge_base_system.sql
```

---

## ✅ Features Checklist

- [x] Hierarchical content structure (topics → categories → articles)
- [x] SEO-optimized (meta tags, Schema.org, Open Graph)
- [x] Beautiful, responsive UI
- [x] Internal linking system
- [x] FAQ support with structured data
- [x] Article sections with table of contents
- [x] View tracking
- [x] Helpful voting
- [x] Tag system
- [x] Search functionality (database layer ready)
- [x] Admin API for CRUD operations
- [x] Automatic word count and reading time
- [x] Featured articles
- [x] Pillar content support
- [x] Multi-site support
- [ ] Admin dashboard UI (API ready)
- [ ] Rich text editor integration
- [ ] Image upload system
- [ ] Advanced search UI
- [ ] Analytics dashboard

---

## 🎊 Summary

You now have a **production-ready knowledge base system** with:

✅ **SEO-first architecture** with Schema.org structured data  
✅ **Topical mapping** for content authority  
✅ **Beautiful UI** with modern design  
✅ **Complete API** for content management  
✅ **Multi-site support** built-in  
✅ **Analytics tracking** ready  
✅ **Internal linking** system  
✅ **FAQ support** with structured data  

**Ready to build topical authority and drive organic traffic!** 🚀

---

## 📚 Next Steps

1. ✅ Apply database migration
2. ✅ Create topics for your site
3. ✅ Write pillar articles
4. ✅ Create supporting content
5. ✅ Build internal link structure
6. 🔄 Build admin dashboard UI
7. 🔄 Integrate rich text editor
8. 🔄 Add image upload
9. 🔄 Launch and monitor SEO performance

**Need help with admin UI or content strategy? Let me know!**
