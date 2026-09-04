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
