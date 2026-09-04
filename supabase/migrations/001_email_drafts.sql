create extension if not exists pgcrypto;

create table if not exists mailboxes (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  encrypted_password text not null,
  ai_enabled boolean not null default true,
  prompt text,
  created_at timestamptz not null default now()
);

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid not null references mailboxes(id) on delete cascade,
  message_id text not null,
  thread_id text,
  from_email text,
  from_name text,
  subject text,
  body text,
  received_at timestamptz,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (mailbox_id, message_id)
);

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  email_id uuid not null references emails(id) on delete cascade,
  mailbox_id uuid not null references mailboxes(id) on delete cascade,
  draft_body text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email_id)
);

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  openrouter_model text not null default 'openai/gpt-5.6-luna',
  created_at timestamptz not null default now()
);

insert into settings (openrouter_model)
select 'openai/gpt-5.6-luna'
where not exists (select 1 from settings);

alter table mailboxes enable row level security;
alter table emails enable row level security;
alter table drafts enable row level security;
alter table settings enable row level security;

-- This v1 has no browser auth. All application access uses the service role server-side.
