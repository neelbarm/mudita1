# Sarga Haus — Internal Operating System

The studio runs on the same discipline it sells. Stack: Supabase (system of
record, schema in `supabase/schema.sql`), the studio dashboard (phase 2 build on
the same schema), Resend (email), Stripe (invoicing), Cal.com (booking),
Notion or repo docs (SOPs). Everything below is designed to run lean for a
founder-led studio and scale to a small team.

## 1. CRM structure

Two entry lanes, one pipeline:
- **Inbound**: `intake_submissions` → triage → `opportunities`.
- **Outbound**: `accounts`/`contacts` → sequences → replies → `opportunities`.
Objects: Account, Contact, Signal, Opportunity, Project. No deal lives outside
an opportunity; no client work lives outside a project.

## 2. Lead pipeline stages

Research → Qualified (ICP ≥ 60) → Outreach → Conversation → Opportunity
(Discovery → Proposal → Negotiation → Won/Lost) → Client → Recycled.
Rules: max 14 days idle per stage before `v_stalled` flags it; every stage
change writes an event; lost opportunities get a `lost_reason` (picklist, not
free text) so quarterly review is honest.

## 3. Lead engine data model

See docs/05-data-model.md and docs/07-lead-engine.md.

## 4. Lead sourcing and enrichment workflow

1. Define quarterly ICP slice (segment + geo + size + trigger).
2. Source candidate accounts from compliant sources only: public directories,
   job boards, launch platforms, podcast/newsletter guest lists, licensed data
   providers with lawful basis. No scraping that violates platform terms.
3. Agent drafts account research briefs (docs/08); human accepts/rejects.
4. Enrich contacts via a licensed provider; verify emails; record source.
5. Score (below). ICP ≥ 60 moves to Qualified.

## 5. Lead scoring (ICP score, 0–100)

- Segment fit (founder/creator/consultant/coach/agency/service) — 25
- Evidence of manual workflow pain or product need (signals) — 25
- Budget plausibility (size, pricing, funding, offer economics) — 20
- Reachability (verified contact, active channels) — 15
- Timing trigger (launch, hire, growth, tool churn) — 15
Human can override with a note; overrides are logged.

## 6. Outbound sequence structure

Default: 4 touches / 21 days. Day 0 email (specific observation + one idea),
day 4 follow-up with a concrete artifact (teardown sketch, workflow map), day
11 channel switch (LinkedIn), day 21 clean close ("closing the loop").
Every message human-approved before send. Reply classes route: interested →
book call; question → human reply same day; later → recycle with date;
opt-out → permanent suppression. Volume capped low; specificity over scale.

## 7. Proposal workflow

Discovery call (recorded, agent-summarized) → agent drafts proposal from the
template (situation, system to build, scope, out-of-scope, timeline, fixed
price, terms) → founder edits and approves → sent as a signed-link document →
7-day follow-up logic. Proposals expire in 21 days to keep the pipeline honest.

## 8. Contract workflow

Standard MSA + per-sprint SOW. E-sign (Dropbox Sign or equivalent). No work
before signature and deposit. Equity/rev-share deals require a separate memo
and a cooling-off review 48h later — never proposed in a first call.

## 9. Invoice and payment workflow

Stripe invoices. Sprints: 50% to schedule, 50% at delivery review. Growth
Partnership: monthly, auto-charged, 30-day notice. Dunning: automated day 3/7
reminders, human call day 10, work pauses day 14. All states mirrored to the
project record.

## 10. Client onboarding workflow

Trigger: contract signed + deposit paid. Within 24h: welcome email with the
plan, single shared channel (Slack Connect or email thread), intake of assets
and access (checklist), kickoff scheduled, project record created, weekly
update day fixed. The client always knows what happens next.

## 11. Project delivery workflow

Weekly cadence: Monday plan (3 bullets), ships mid-week, Friday written update
(what shipped, what is next, what is blocked, decisions needed). Scope changes
go through a one-paragraph change memo with price/time impact. Demos over
descriptions: every week shows the working system.

## 12. QA and launch workflow

Pre-launch checklist: functional pass on primary flows, mobile pass, a11y pass
(keyboard, contrast, reduced motion), performance pass (LCP < 2.5s on 4G),
error monitoring live, backups/rollback confirmed, analytics events firing,
legal pages present. Launch review with client; 7-day watch window with daily
checks; then handoff doc + Loom walkthrough.

## 13. Retainer (Growth Partnership) workflow

Monthly: roadmap review, prioritized backlog, shipped-list, metrics readout
(from the client's own dashboards). Quarterly: system audit (product,
automation, pipeline) with recommendations memo. Renewal is a decision, not a
default: each quarter re-justifies the retainer.

## 14. Case-study capture workflow

At launch +30 days: collect baseline vs current metrics the client owns and
verifies, a quote (approved in writing), screens (sanitized), stack list.
Nothing publishes without written approval. Until three real studies exist,
the site shows labeled illustrative systems only.

## 15. Dashboard requirements (studio dashboard, phase 2)

- Pipeline board (opportunities by stage, value, age, next step)
- Lead flow funnel (research → conversation weekly)
- Intake inbox (new submissions, triage actions)
- Stalled list (idle enrollments/opportunities)
- Delivery board (projects, ship dates, update status)
- Cash view (invoices outstanding/paid, MRR from retainers)
- Approval queue (agent drafts awaiting human sign-off)
Built on the same Supabase schema; Next.js internal app; auth via Supabase.
