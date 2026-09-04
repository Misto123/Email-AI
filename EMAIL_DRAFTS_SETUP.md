# InboxDraft deployment

InboxDraft is a Next.js App Router application for Purelymail inboxes. It polls mail server-side, creates suggested replies with OpenRouter, and only sends after an explicit dashboard click.

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/007_email_drafts.sql` in the SQL editor, or apply it with the Supabase CLI.
3. Copy the project URL, anon key, and service-role key into Vercel. The service-role key is used only by server route handlers.

RLS is enabled on all four tables. This v1 has no user authentication, so the application intentionally accesses these tables only from server-side code with the service role. Put the deployment behind Vercel access protection or add authentication before exposing it publicly.

## Vercel

Import the repository into Vercel and add every variable listed in `.env.example`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `MAILBOX_ENCRYPTION_KEY` (use a long random secret; changing it makes stored mailbox passwords unreadable)
- `CRON_SECRET` (a long random secret)

The included `vercel.json` invokes `/api/cron/check-mail` every five minutes. Vercel sends the configured cron secret as `Authorization: Bearer ...`; requests without the matching secret receive `401`.

## Local development

Copy `.env.example` to `.env.local`, fill the values, then run:

```bash
npm install
npm run dev
```

Add mailboxes from `/mailboxes`. Purelymail credentials are encrypted before storage and are never included in API responses. IMAP and SMTP connections, OpenRouter calls, and the cron poller all run in Node.js server routes. The poller has a unique mailbox/message constraint, so repeating a poll cannot create a second email or draft.
