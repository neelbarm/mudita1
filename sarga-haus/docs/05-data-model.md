# Sarga Haus — Data Model (Intake + Lead Engine)

Implemented in `supabase/schema.sql`. Postgres via Supabase. All tables have
`id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`.

## Intake

**`intake_submissions`** — every Start a Project submission, verbatim.
- `name text`, `email text`, `company text`, `link text`
- `building text` (what are you trying to build)
- `broken text` (what is broken today)
- `impact text` (expected business impact)
- `category text` — `product | automation | pipeline | combination`
- `timeline text` — `now | quarter | exploring`
- `budget text` — `under_10k | 10k_25k | 25k_60k | 60k_plus | unsure`
- `tools text`, `notes text`
- `status text` — `new | reviewed | call_booked | proposal | won | lost | disqualified`
- `source text` (utm/referrer), `user_agent text`

## Lead engine

**`accounts`** — target companies.
- `name`, `domain`, `segment` (founder, creator, consultant, coach, agency,
  service_business), `size`, `geo`, `source` (where discovered, compliant only)
- `icp_score int` (0–100, see docs/07), `icp_notes text`
- `status` — `research | qualified | outreach | conversation | opportunity |
  client | recycled | disqualified`

**`contacts`** — people at accounts.
- `account_id fk`, `full_name`, `role`, `email`, `linkedin_url`
- `email_status` — `unverified | verified | bounced | opted_out`
- `enrichment jsonb` (title history, public signals; compliant sources only)
- `opted_out_at timestamptz` (suppression is permanent)

**`signals`** — why a lead is a lead.
- `account_id fk`, `type` (hiring, launch, funding, content, tooling_gap,
  manual_workflow_evidence), `detail text`, `observed_at`, `url`

**`sequences`** / **`sequence_steps`** — outreach structure.
- sequence: `name`, `channel_mix`, `status`
- step: `sequence_id fk`, `day_offset int`, `channel` (email, linkedin, call),
  `template text`, `requires_human_approval bool default true`

**`enrollments`** — a contact moving through a sequence.
- `contact_id fk`, `sequence_id fk`, `current_step int`
- `state` — `draft | pending_approval | active | replied | paused | finished |
  opted_out`
- `next_action_at timestamptz`

**`touches`** — every message actually sent or received.
- `enrollment_id fk`, `direction` (outbound/inbound), `channel`, `body`
- `approved_by text` (human approver, required for outbound)
- `reply_class` — `interested | question | later | referral | negative |
  opt_out | auto` (agent-suggested, human-confirmed)

**`opportunities`** — pipeline.
- `account_id fk`, `intake_id fk nullable` (inbound joins here too)
- `offer` — `validation | build | automation | pipeline | growth`
- `stage` — `discovery | proposal | negotiation | won | lost`
- `value_estimate numeric`, `probability int`, `next_step text`,
  `next_step_due date`, `lost_reason text`

**`projects`** — delivery after won.
- `opportunity_id fk`, `offer`, `state` — `onboarding | in_build | qa |
  launched | retainer | closed`
- `start_date`, `target_ship_date`, `repo_url`, `weekly_update_day`

**`events`** — append-only audit of everything (state changes, agent actions,
approvals). `entity`, `entity_id`, `actor` (`human:<name>` / `agent:<name>`),
`action`, `detail jsonb`.

## Views / dashboard queries

- `v_pipeline`: opportunities by stage with value and age.
- `v_lead_flow`: weekly counts research → qualified → conversation.
- `v_intake_quality`: submissions by category/budget/status.
- `v_stalled`: enrollments and opportunities with no activity in 14 days.

## Integrity rules

- Outbound `touches` require `approved_by` (enforced by check constraint).
- `contacts.opted_out_at` set ⇒ trigger blocks new enrollments.
- Every state change writes an `events` row (application responsibility).
