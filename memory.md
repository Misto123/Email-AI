# Email-AI Project Memory

## Last Updated
2026-09-04 (Evening deployment)

## Project Overview
AI-powered email draft generator for 20 Purelymail inboxes. Uses OpenRouter for AI drafts with mandatory human approval before sending.

## Production URLs
- Main: https://email-ai-mu.vercel.app
- Vercel Project: email-ai
- Team: bram-1592s-projects

## Repository
- Local: /Users/northsea/ClaudeProjects/Email-AI
- GitHub: https://github.com/Misto123/Email-AI

## Environment Variables (Vercel Production)
- NEXT_PUBLIC_SUPABASE_URL=https://xecxfqdhqjiwngblekgf.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY=[set]
- SUPABASE_SERVICE_ROLE_KEY=[set]
- OPENROUTER_API_KEY=[set]
- MAILBOX_ENCRYPTION_KEY=6af17c086871953bd2cc9e255cffa2d6a9e89b911146c23bf025d6bc609d6a5c
- CRON_SECRET=565e5e56e86d9bdbbb15de3fe95139c80721ecb482a3f796b2df2f4f353af606

## Supabase Database
- Project: Email AI
- Project Ref: xecxfqdhqjiwngblekgf
- Organization: T1954Edu (Educational)
- Connection: postgresql://postgres:S%E[d}R3YjC8@db.xecxfqdhqjiwngblekgf.supabase.co:5432/postgres

## Database Schema Status
⚠️ **MIGRATION PENDING** - Run migration at:
https://supabase.com/dashboard/project/xecxfqdhqjiwngblekgf/sql/new

Tables to create:
- mailboxes (encrypted Purelymail credentials)
- emails (fetched via IMAP)
- drafts (AI-generated, human-reviewed)
- settings (OpenRouter model config)

## Technology Stack
- Next.js 16 (App Router, React 19, TypeScript strict)
- Supabase PostgreSQL (RLS enabled)
- Purelymail IMAP/SMTP (imap.purelymail.com:993, smtp.purelymail.com:465)
- OpenRouter AI (model: openai/gpt-5.6-luna)
- Vercel Cron (0 0 * * * - daily at midnight, Hobby plan limitation)
- AES-256-GCM encryption for mailbox passwords

## Cron Job
- Schedule: Daily at midnight (Hobby plan limitation)
- Endpoint: /api/cron/check-mail
- For 5-min polling: Upgrade to Vercel Pro OR use external cron service (cron-job.org)

## Security Features
- All mailbox passwords encrypted with AES-256-GCM
- IMAP/SMTP/OpenRouter calls server-side only
- AI NEVER auto-sends emails (human approval required)
- Service role key never exposed to client

## Key Routes
- / - Draft dashboard
- /mailboxes - Mailbox CRUD
- /settings - OpenRouter model config
- /api/cron/check-mail - Email polling (cron)
- /api/drafts - Draft management
- /api/mailboxes - Mailbox API

## CRITICAL LESSONS LEARNED
⚠️ **NEVER reuse Vercel projects for different applications**
⚠️ We accidentally deployed Email-AI to 'my-clone' project, breaking 5 production EMD domains
⚠️ Always create separate Git repos and Vercel projects for each application

## Deployment History
- 2026-09-04: Initial deployment to email-ai-mu.vercel.app
- Issue: Accidentally deployed to 'my-clone' first (fixed by rollback)
- Resolution: Created dedicated 'email-ai' Vercel project

## Related Projects (DO NOT MIX)
- emd-admin (/Users/northsea/ClaudeProjects/emd-admin) - Cloudflare Workers admin
- my-clone (Vercel project) - EMD admin, manages fundingpipsdiscountcode.com + 4 other domains

## Next Steps
1. ✅ Vercel deployment complete
2. ✅ Environment variables set
3. ⚠️ **TODO**: Run Supabase migration (see schema at supabase/migrations/001_email_drafts.sql)
4. TODO: Test mailbox CRUD
5. TODO: Test IMAP connection
6. TODO: Test AI draft generation
7. TODO: Test email sending

## Implementation Order Completed
✅ 1) Next.js structure
✅ 2) Supabase schema
✅ 3) Server utilities
✅ 4-13) All code implemented
✅ 14) Deployment
⚠️ 15) Database migration (PENDING)

## Notes for Future
- When starting new projects, create separate folder under /Users/northsea/ClaudeProjects/
- Always initialize new Git repo
- Create dedicated Vercel project
- Never deploy multiple applications to same Vercel project
- Store project-specific memory in MEMORY.md or memory.md

---

## Enhancement Plan (Added 2026-09-04 Evening)

### Completed Improvements
✅ **Mailbox Page Enhanced**
- Added collapsible instruction panel with step-by-step guide
- Included IMAP/SMTP server details (imap.purelymail.com:993, smtp.purelymail.com:465)
- Added security notes about encryption
- Improved UI with icons and better messaging
- Added empty state for when no mailboxes exist

✅ **404 Page Created**
- Custom 404 page with branding
- Quick navigation back to home/mailboxes
- Fixes the "404 after 30 seconds" issue

### Planned Enhancements (Future Phases)

#### Main Goal: Context-Aware AI Replies
The core enhancement is to make AI replies based on uploaded context:
1. Knowledge base documents (company info, policies, FAQs)
2. Website content (product details, pricing, features)
3. Past email conversations (for tone and style reference)

#### New Features to Build

**1. Knowledge Base Module** (`/knowledge-base`)
- Upload PDF, TXT, MD, DOCX files
- Store in Supabase with pgvector embeddings
- Associate KB with specific mailboxes or global
- RAG (Retrieval Augmented Generation) for AI context

**2. Website Content Module** (`/website-content`)
- Upload website pages, product info, pricing
- URL scraping capability
- Vector embeddings for semantic search
- Mailbox-specific or global content

**3. Email History Module** (`/email-history`)
- Upload .mbox, .eml files or raw logs
- Parse and index past conversations
- Learn tone, style, and response patterns
- Reference for AI draft generation

#### Database Schema Extensions
New tables needed:
- `knowledge_base` (title, content, embedding vector(1536), metadata)
- `website_content` (url, title, content, embedding, metadata)
- `email_history` (from, to, subject, body, embedding, metadata)

All with pgvector extension for semantic search.

#### Technical Approach
- Use OpenRouter for embeddings (cheaper than OpenAI)
- Supabase pgvector for vector storage
- RAG pattern: retrieve relevant context → inject into AI prompt
- File parsing: pdf-parse, mammoth (DOCX), cheerio (HTML)

#### Implementation Priority
1. ✅ Fix current issues (mailbox instructions, 404 page)
2. Next: Add pgvector to Supabase
3. Build Knowledge Base module
4. Build Website Content module
5. Build Email History module
6. Integrate RAG into AI draft generation

See `ENHANCEMENT_PLAN.md` for detailed implementation roadmap.

---

## Deployment Checklist

### Before Deploying
- [ ] Run Supabase migration (001_email_drafts.sql)
- [ ] Verify all environment variables on Vercel
- [ ] Test mailbox CRUD operations
- [ ] Test IMAP/SMTP connections
- [ ] Test AI draft generation
- [ ] Test email sending

### After Deploying Enhancements
- [ ] Enable pgvector extension in Supabase
- [ ] Run new migrations for KB/website/history tables
- [ ] Test file uploads
- [ ] Test embedding generation
- [ ] Test RAG context retrieval
- [ ] Verify AI quality improves with context


---

## Supabase CLI Access (Automated)

### Status: ✅ CONFIGURED & WORKING

### Login Token
Stored via: `supabase login --token <SUPABASE_PAT>`  # token kept local only, never commit

### Project Link
- Project ref: `xecxfqdhqjiwngblekgf`
- Linked via: `supabase link --project-ref xecxfqdhqjiwngblekgf` (run from /Email-AI dir)

### How to Use (Future Sessions)

```bash
# 1. Login (only needed once per machine, token is stored)
supabase login --token <YOUR_SUPABASE_PAT>  # Never commit this token!

# 2. Link project (run from Email-AI directory)
cd /Users/northsea/ClaudeProjects/Email-AI
supabase link --project-ref xecxfqdhqjiwngblekgf

# 3. Run a SQL query
supabase db query "SELECT * FROM mailboxes;" --linked

# 4. Push new migrations
supabase db push

# 5. Run arbitrary SQL
supabase db query "INSERT INTO ..." --linked
```

### Migration Status
- ✅ 001_email_drafts.sql — applied 2026-09-04
  - Tables: mailboxes, emails, drafts, settings
  - Extensions: pgcrypto
  - RLS: enabled on all tables

### Adding Future Migrations
1. Create file: `supabase/migrations/002_name.sql`
2. Run: `supabase db push`
3. Done — no manual SQL copy/paste needed!
