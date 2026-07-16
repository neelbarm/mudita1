-- Sarga Haus — system of record.
-- Run in Supabase SQL editor. Postgres 15+.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- intake

create table if not exists intake_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  link text,
  building text not null,
  broken text,
  impact text,
  category text not null check (category in ('product','automation','pipeline','combination')),
  timeline text check (timeline in ('now','quarter','exploring')),
  budget text check (budget in ('under_10k','10k_25k','25k_60k','60k_plus','unsure')),
  tools text,
  notes text,
  status text not null default 'new'
    check (status in ('new','reviewed','call_booked','proposal','won','lost','disqualified')),
  source text,
  user_agent text
);

-- ------------------------------------------------------------ lead engine

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  domain text,
  segment text check (segment in ('founder','creator','consultant','coach','agency','service_business')),
  size text,
  geo text,
  source text,
  icp_score int check (icp_score between 0 and 100),
  icp_notes text,
  status text not null default 'research'
    check (status in ('research','qualified','outreach','conversation','opportunity','client','recycled','disqualified'))
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  account_id uuid not null references accounts(id) on delete cascade,
  full_name text not null,
  role text,
  email text,
  linkedin_url text,
  email_status text not null default 'unverified'
    check (email_status in ('unverified','verified','bounced','opted_out')),
  enrichment jsonb not null default '{}'::jsonb,
  opted_out_at timestamptz
);

create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  account_id uuid not null references accounts(id) on delete cascade,
  type text not null check (type in ('hiring','launch','funding','content','tooling_gap','manual_workflow_evidence')),
  detail text not null,
  observed_at date,
  url text
);

create table if not exists sequences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  channel_mix text,
  status text not null default 'draft' check (status in ('draft','active','retired'))
);

create table if not exists sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid not null references sequences(id) on delete cascade,
  day_offset int not null,
  channel text not null check (channel in ('email','linkedin','call')),
  template text,
  requires_human_approval boolean not null default true
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  contact_id uuid not null references contacts(id) on delete cascade,
  sequence_id uuid not null references sequences(id),
  current_step int not null default 0,
  state text not null default 'draft'
    check (state in ('draft','pending_approval','active','replied','paused','finished','opted_out')),
  next_action_at timestamptz
);

create table if not exists touches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  direction text not null check (direction in ('outbound','inbound')),
  channel text not null check (channel in ('email','linkedin','call')),
  body text,
  approved_by text,
  reply_class text check (reply_class in ('interested','question','later','referral','negative','opt_out','auto')),
  -- Outbound messages require a named human approver. Non-negotiable.
  constraint outbound_requires_approval
    check (direction <> 'outbound' or approved_by is not null)
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  account_id uuid references accounts(id) on delete set null,
  intake_id uuid references intake_submissions(id) on delete set null,
  offer text not null check (offer in ('validation','build','automation','pipeline','growth')),
  stage text not null default 'discovery'
    check (stage in ('discovery','proposal','negotiation','won','lost')),
  value_estimate numeric,
  probability int check (probability between 0 and 100),
  next_step text,
  next_step_due date,
  lost_reason text
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  opportunity_id uuid not null references opportunities(id),
  offer text not null,
  state text not null default 'onboarding'
    check (state in ('onboarding','in_build','qa','launched','retainer','closed')),
  start_date date,
  target_ship_date date,
  repo_url text,
  weekly_update_day text
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  entity text not null,
  entity_id uuid not null,
  actor text not null,
  action text not null,
  detail jsonb not null default '{}'::jsonb
);

-- Opted-out contacts can never be enrolled again.
create or replace function block_enrollment_if_opted_out()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from contacts c where c.id = new.contact_id and c.opted_out_at is not null) then
    raise exception 'contact % is suppressed (opted out)', new.contact_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_block_opted_out on enrollments;
create trigger trg_block_opted_out
  before insert on enrollments
  for each row execute function block_enrollment_if_opted_out();

-- ------------------------------------------------------------------ views

create or replace view v_pipeline as
  select o.stage, count(*) as deals, coalesce(sum(o.value_estimate),0) as value,
         avg(extract(day from now() - o.created_at))::int as avg_age_days
  from opportunities o where o.stage not in ('won','lost')
  group by o.stage;

create or replace view v_lead_flow as
  select date_trunc('week', created_at) as week, status, count(*) as accounts
  from accounts group by 1,2 order by 1 desc;

create or replace view v_intake_quality as
  select category, budget, status, count(*) as submissions
  from intake_submissions group by 1,2,3;

create or replace view v_stalled as
  select 'enrollment' as kind, e.id, e.updated_at
  from enrollments e
  where e.state = 'active' and e.updated_at < now() - interval '14 days'
  union all
  select 'opportunity', o.id, o.updated_at
  from opportunities o
  where o.stage in ('discovery','proposal','negotiation')
    and o.updated_at < now() - interval '14 days';

-- ------------------------------------------------------------------- RLS

alter table intake_submissions enable row level security;
alter table accounts enable row level security;
alter table contacts enable row level security;
alter table signals enable row level security;
alter table sequences enable row level security;
alter table sequence_steps enable row level security;
alter table enrollments enable row level security;
alter table touches enable row level security;
alter table opportunities enable row level security;
alter table projects enable row level security;
alter table events enable row level security;
-- No anon policies: only the service role (server-side) touches these tables.
