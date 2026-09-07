# Email-AI Enhancement Plan
**Created:** 2026-09-04
**Status:** Planning Phase

## Overview
Transform Email-AI from simple draft generator to intelligent context-aware email responder.

## Current Issues to Fix

### 1. Mailbox Page - Missing Instructions
**Problem:** Users don't know how to add Purelymail mailboxes
**Solution:** Add step-by-step instructions with:
- How to get Purelymail credentials
- IMAP/SMTP server details (imap.purelymail.com:993, smtp.purelymail.com:465)
- Security notes about encryption
- Test connection instructions

### 2. 404 Error After 30 Seconds
**Problem:** Page shows 404 after 30 seconds
**Likely Causes:**
- Missing 404 page component
- Route timeout issue
- Client-side navigation bug
**Solution:** 
- Create custom 404 page
- Debug routing issues
- Add proper error boundaries

## New Features Required

### 3. Knowledge Base Upload System
**Purpose:** Upload company knowledge base for AI context
**Requirements:**
- Upload multiple documents (PDF, TXT, MD, DOCX)
- Parse and store in vector database (Supabase pgvector)
- Associate KB with specific mailboxes or global
- Search/retrieve relevant KB chunks when drafting

**Database Changes:**
```sql
create table knowledge_base (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid references mailboxes(id) on delete cascade,
  title text not null,
  content text not null,
  embedding vector(1536), -- OpenAI embeddings
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index on knowledge_base using ivfflat (embedding vector_cosine_ops);
```

### 4. Website Details Upload
**Purpose:** Store website content/details for AI reference
**Requirements:**
- Upload website pages, product info, pricing, FAQs
- Similar to KB but specifically for website content
- Can scrape URLs or upload directly
- Associate with mailboxes

**Database Changes:**
```sql
create table website_content (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid references mailboxes(id) on delete cascade,
  url text,
  title text not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

### 5. Past Email Logs Upload
**Purpose:** Learn from past email conversations
**Requirements:**
- Upload .mbox, .eml files, or raw email logs
- Parse and store conversations
- Index for semantic search
- Use as reference for tone/style

**Database Changes:**
```sql
create table email_history (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid references mailboxes(id) on delete cascade,
  from_address text,
  to_address text,
  subject text,
  body text,
  sent_at timestamptz,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

## Project Structure (Separate Modules)

```
Email-AI/
├── src/
│   ├── app/
│   │   ├── mailboxes/          # Existing
│   │   ├── knowledge-base/     # NEW: KB management
│   │   ├── website-content/    # NEW: Website content management
│   │   ├── email-history/      # NEW: Past emails management
│   │   └── ai-settings/        # NEW: AI configuration
│   ├── lib/
│   │   ├── kb/                 # NEW: KB utilities
│   │   ├── embeddings/         # NEW: Vector embeddings
│   │   └── ai-context/         # NEW: Context building for AI
```

## Implementation Phases

### Phase 1: Fix Current Issues (IMMEDIATE)
- [ ] Add instructions to mailbox page
- [ ] Fix 404 error
- [ ] Create custom 404 page
- [ ] Deploy fixes

### Phase 2: Database Schema (Day 1)
- [ ] Add pgvector extension to Supabase
- [ ] Create knowledge_base table
- [ ] Create website_content table
- [ ] Create email_history table
- [ ] Run migrations

### Phase 3: Knowledge Base Module (Day 1-2)
- [ ] Create KB upload UI
- [ ] Implement file parsing (PDF, TXT, MD, DOCX)
- [ ] Generate embeddings via OpenRouter
- [ ] Store in Supabase with pgvector
- [ ] Create KB management interface

### Phase 4: Website Content Module (Day 2-3)
- [ ] Create website content upload UI
- [ ] Add URL scraping capability
- [ ] Generate embeddings
- [ ] Store and manage content

### Phase 5: Email History Module (Day 3-4)
- [ ] Create email log upload UI
- [ ] Parse .mbox, .eml files
- [ ] Generate embeddings
- [ ] Build search interface

### Phase 6: AI Context Integration (Day 4-5)
- [ ] Modify email-ai.ts to query KB/website/history
- [ ] Implement RAG (Retrieval Augmented Generation)
- [ ] Include relevant context in AI prompts
- [ ] Test and refine

### Phase 7: Testing & Deployment (Day 5-6)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Deploy to production
- [ ] Update documentation

## Technical Stack Additions

### New Dependencies
```json
{
  "pdf-parse": "^1.1.1",           // PDF parsing
  "mammoth": "^1.8.0",             // DOCX parsing
  "cheerio": "^1.0.0",             // HTML scraping
  "@supabase/postgrest-js": "latest" // Enhanced Supabase client
}
```

### Supabase Extensions
```sql
create extension if not exists vector;  -- pgvector for embeddings
```

## Cost Considerations

### OpenRouter Embeddings
- Estimated: $0.0001 per 1K tokens
- 100 documents × 5K tokens avg = 500K tokens
- Cost: ~$0.05 per batch

### Supabase Storage
- Free tier: 500MB
- Paid: $0.021/GB/month
- Estimated: <1GB for most use cases

## Success Metrics
- AI reply quality improves with context
- Reduced manual editing of drafts
- Faster response times
- Better tone/style matching

## Next Steps
1. Fix mailbox instructions (30 min)
2. Debug and fix 404 error (1 hour)
3. Deploy fixes
4. Start Phase 2 (database schema)
