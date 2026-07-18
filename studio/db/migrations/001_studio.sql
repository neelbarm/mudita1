-- Sarga Studio OS — additive migration 001.
-- Run AFTER sarga-haus/supabase/schema.sql, in the Supabase SQL editor.
-- Adds the operating layer: agent runs, the approval queue, facts,
-- suppressions, sourcing provenance, briefs, design specs, build runs,
-- and the ledger. NEVER modifies the original 11 tables.

create extension if not exists pgcrypto;

-- ------------------------------------------------------------- agent runs

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  agent text not null check (agent in (
    'account-researcher','pain-point-analyst','outreach-drafter','call-summarizer',
    'proposal-drafter','brief-preparer','reporting-writer','stall-watcher','automation-scout',
    'designer','builder',
    'gtm-strategist','content-writer','distribution-planner',
    'finance-analyst','legal-drafter','strategy-partner'
  )),
  mode text not null check (mode in ('live','dry_run')),
  status text not null default 'running' check (status in ('running','succeeded','failed')),
  trigger text not null default 'cli' check (trigger in ('cli','server','n8n','sim')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,
  model text,
  num_turns int,
  input_tokens int,
  output_tokens int,
  cost_usd numeric,
  duration_ms int,
  transcript_path text,
  entity text,
  entity_id uuid
);

-- --------------------------------------------------------- approval queue

-- Every agent output lands here as a draft. Nothing reaches the outside
-- world except through an approved row (see src/os/effectors.ts).
create table if not exists approvals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in (
    'account_brief','pain_hypotheses','outreach_message','reply_class','icp_override',
    'call_summary','proposal','project_brief','weekly_report','stall_action',
    'automation_candidate','sourcing_batch',
    'design_spec','build_review','launch_checklist',
    'gtm_brief','content_draft','distribution_plan','case_study',
    'finance_digest','invoice_reminder','legal_draft','strategy_memo'
  )),
  title text not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  agent_run_id uuid references agent_runs(id) on delete set null,
  entity text,
  entity_id uuid,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','expired')),
  decided_by text,
  decided_at timestamptz,
  decision_note text,
  edited_payload jsonb,
  expires_at timestamptz,
  -- Decisions require a named human. Mirror of touches.outbound_requires_approval.
  constraint decision_requires_human
    check (status in ('pending','expired') or decided_by is not null)
);

create index if not exists idx_approvals_pending on approvals (status, created_at) where status = 'pending';

-- ------------------------------------------------------------------ facts

-- The ">= 3 usable public facts" gate becomes a COUNT over approved rows.
-- No source URL, no fact (docs/08 rule 4: cite it or discard it).
create table if not exists facts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  account_id uuid not null references accounts(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  fact text not null,
  source_url text not null,
  source_type text,
  observed_at date,
  status text not null default 'candidate'
    check (status in ('candidate','approved','rejected','stale')),
  approved_by text,
  used_in_touch_id uuid references touches(id) on delete set null
);

create index if not exists idx_facts_account on facts (account_id, status);

-- ----------------------------------------------------------- suppressions

-- Permanent. Survives contact deletion and re-import. Checked in code
-- before every enrollment and every send, on top of trg_block_opted_out.
create table if not exists suppressions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  domain text,
  reason text not null check (reason in ('opt_out','hard_bounce','manual','legal')),
  source text,
  note text
);

create unique index if not exists idx_suppressions_email on suppressions (lower(email));

-- --------------------------------------------------------------- sourcing

create table if not exists source_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null check (kind in (
    'maps_scrape','directory_crawl','site_signal_crawl',
    'apollo_search','hunter_domain_search','csv_import'
  )),
  query jsonb not null default '{}'::jsonb,
  provider text,
  status text not null default 'running'
    check (status in ('running','succeeded','failed')),
  stats jsonb not null default '{}'::jsonb,
  error text,
  started_at timestamptz,
  finished_at timestamptz
);

-- Raw provenance landing zone. Candidates only; promotion to accounts and
-- contacts happens exclusively through an approved sourcing_batch.
create table if not exists raw_source_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_job_id uuid references source_jobs(id) on delete set null,
  provider text not null,
  external_id text,
  url text,
  kind text not null check (kind in ('company','person','signal')),
  raw jsonb not null default '{}'::jsonb,
  dedupe_key text,
  normalized_at timestamptz,
  account_id uuid references accounts(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null
);

create index if not exists idx_raw_dedupe on raw_source_records (dedupe_key);
create unique index if not exists idx_raw_provider_ext
  on raw_source_records (provider, external_id) where external_id is not null;

-- ----------------------------------------------------------------- briefs

create table if not exists briefs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  opportunity_id uuid references opportunities(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','approved')),
  approved_by text,
  approved_at timestamptz
);

-- ---------------------------------------------------------- build factory

create table if not exists design_specs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  brief_id uuid references briefs(id) on delete set null,
  version int not null default 1,
  tokens jsonb not null default '{}'::jsonb,
  type_system jsonb not null default '{}'::jsonb,
  motion jsonb not null default '{}'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  rubric_scores jsonb,
  status text not null default 'draft' check (status in ('draft','approved'))
);

create table if not exists build_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  project_slug text not null,
  brief_id uuid references briefs(id) on delete set null,
  design_spec_id uuid references design_specs(id) on delete set null,
  phase text not null check (phase in ('scaffold','tokens','build','qa','review','launch')),
  section text,
  iteration int not null default 1,
  status text not null default 'running'
    check (status in ('running','passed','failed','approved')),
  screenshot_paths jsonb not null default '[]'::jsonb,
  critique jsonb,
  scores jsonb
);

-- ----------------------------------------------------------------- ledger

-- One queryable money stream: Stripe mirror when the key exists,
-- CSV/manual entries otherwise. external_id keeps Stripe imports idempotent.
create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_date date not null,
  kind text not null check (kind in ('invoice','payment','expense','refund','credit')),
  amount numeric not null,
  currency text not null default 'usd',
  project_id uuid references projects(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  external_id text,
  source text not null default 'manual' check (source in ('stripe','csv','manual')),
  status text not null default 'open' check (status in ('open','paid','void','overdue')),
  due_date date,
  counterparty text,
  memo text
);

create unique index if not exists idx_ledger_external
  on ledger_entries (external_id) where external_id is not null;

-- ------------------------------------------------------------------ views

create or replace view v_approval_queue as
  select a.id, a.kind, a.title, a.summary, a.entity, a.entity_id,
         a.created_at, extract(epoch from now() - a.created_at)::int / 3600 as age_hours,
         r.agent as drafted_by
  from approvals a
  left join agent_runs r on r.id = a.agent_run_id
  where a.status = 'pending'
  order by a.created_at asc;

-- Outreach readiness, docs/07 step 6, as SQL. The code-side twin is
-- src/leads/readiness.ts; both must agree.
create or replace view v_outreach_ready as
  select c.id as contact_id, c.account_id, c.full_name, c.email, a.icp_score,
         (select count(*) from facts f
           where f.account_id = c.account_id and f.status = 'approved') as approved_facts,
         e.id as enrollment_id
  from contacts c
  join accounts a on a.id = c.account_id
  left join enrollments e on e.contact_id = c.id and e.state in ('draft','active','pending_approval')
  where c.email_status = 'verified'
    and c.opted_out_at is null
    and coalesce(a.icp_score, 0) >= 60
    and not exists (select 1 from suppressions s where lower(s.email) = lower(c.email))
    and (select count(*) from facts f
          where f.account_id = c.account_id and f.status = 'approved') >= 3;

-- The seven weekly metrics from docs/07 step 11. Contacted counts
-- APPROVED outbound sends only.
create or replace view v_weekly_metrics as
  select
    (select count(*) from accounts where created_at > now() - interval '7 days') as accounts_researched,
    (select count(*) from events where entity = 'account' and action = 'account.qualified'
       and created_at > now() - interval '7 days') as qualified,
    (select count(*) from touches where direction = 'outbound' and approved_by is not null
       and created_at > now() - interval '7 days') as contacted,
    (select count(*) from touches where direction = 'inbound'
       and created_at > now() - interval '7 days') as replies,
    (select count(*) from events where entity = 'account' and action = 'account.conversation'
       and created_at > now() - interval '7 days') as conversations,
    (select count(*) from opportunities where created_at > now() - interval '7 days') as opportunities,
    (select coalesce(sum(value_estimate), 0) from opportunities
       where stage not in ('won','lost')) as pipeline_value;

create or replace view v_cash as
  select
    (select coalesce(sum(amount), 0) from ledger_entries
       where kind = 'invoice' and status = 'open') as open_invoices,
    (select coalesce(sum(amount), 0) from ledger_entries
       where kind = 'invoice' and status = 'overdue') as overdue_invoices,
    (select coalesce(sum(amount), 0) from ledger_entries
       where kind = 'payment' and entry_date > now() - interval '30 days') as received_30d,
    (select coalesce(sum(amount), 0) from ledger_entries
       where kind = 'expense' and entry_date > now() - interval '30 days') as spent_30d;

-- ------------------------------------------------------------------- RLS

-- Same posture as the core schema: service role only, no anon policies.
alter table agent_runs enable row level security;
alter table approvals enable row level security;
alter table facts enable row level security;
alter table suppressions enable row level security;
alter table source_jobs enable row level security;
alter table raw_source_records enable row level security;
alter table briefs enable row level security;
alter table design_specs enable row level security;
alter table build_runs enable row level security;
alter table ledger_entries enable row level security;

-- OPTIONAL (commented out, honoring "never modify existing tables"):
-- a belt-and-braces trigger that also blocks enrollments for any contact
-- whose email is on the suppressions list. The code path already checks.
--
-- create or replace function block_enrollment_if_suppressed()
-- returns trigger language plpgsql as $$
-- begin
--   if exists (
--     select 1 from contacts c
--     join suppressions s on lower(s.email) = lower(c.email)
--     where c.id = new.contact_id
--   ) then
--     raise exception 'contact % is suppressed', new.contact_id;
--   end if;
--   return new;
-- end $$;
-- drop trigger if exists trg_block_suppressed on enrollments;
-- create trigger trg_block_suppressed
--   before insert on enrollments
--   for each row execute function block_enrollment_if_suppressed();
