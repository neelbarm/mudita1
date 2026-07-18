# The Runbook

How one operator runs the studio on this machine. The n8n schedules
fire the drafts; your job is decisions. Total honest overhead: about
thirty minutes a day.

The room for all of it is Headquarters: `sarga hq`, then open
http://localhost:8787/hq. The queue, the wire, the staff, the floor,
the money, and the stalled list, refreshing live. Decisions made
there are recorded exactly like `sarga approve` decisions.

## Daily (morning, ~15 minutes)

1. `sarga approve` — walk the queue. Outreach messages, reply
   classifications, reminders, briefs. Approve, edit-then-approve, or
   reject with a note. The queue empty is the system healthy.
2. Interested replies got flagged same-day: answer them yourself,
   today. That rule outranks everything else in this file.
3. `sarga queue` — see what is due; n8n (workflow 01) already drafted
   it at 08:00. LinkedIn steps: send by hand, the approval records it.
4. Glance at the dunning pings (09:30): day 10 means pick up the
   phone today; day 14 means decide about pausing work today.

## Weekly

- Monday 07:00: the Strategy Partner memo lands. Read it with coffee;
  approving it updates the ICP slice that sourcing uses at 09:00.
- Monday: sourcing runs (workflow 04). Accept or reject the batch;
  rejected batches cost nothing.
- Wednesday: pick 3 qualified accounts, `sarga source enrich <id>`,
  approve facts (`sarga facts list/approve`), `sarga enroll` the
  ready ones. Fifteen minutes; low volume is the strategy.
- Friday 14:00: finance digest. 15:00: weekly report. Approve both;
  the report can cite the digest because it runs an hour later.
- Friday: `sarga accounts list --status conversation` — anything
  there deserves a next step with a date before the weekend.

## Per deal

1. Call happens (Cal.com webhook flags it; intake flips call_booked).
2. `sarga agent run call-summarizer --input <transcript.json>` then
   approve the summary.
3. `sarga agent run proposal-drafter` from the approved summary; edit
   in the queue; send it yourself. Proposals expire in 21 days.
4. Won: `sarga legal sow --input deal.json`, get it signed, invoice
   the deposit (Stripe or manual ledger entry).
5. `sarga project new <oppId> --contract-signed --deposit-paid` (it
   refuses without both), then `sarga agent run brief-preparer`.
   Onboarding checklist inside 24 hours (docs/06 §10).

## Per build

1. `sarga factory spec <slug> --brief brief.json --interview interview.json`
   then approve the design spec: tokens and sections become law.
2. `sarga factory scaffold <slug> --name "Client Name"`.
3. Section by section: `sarga factory build <slug> --section hero`.
   The Builder implements, the build must pass, screenshots are taken,
   the critic scores them, and the evidence lands in your queue.
4. `sarga factory checklist <slug>` when sections are approved; the
   LAUNCH.md gates the go decision. You run the deploy.
5. Weekly: Monday plan, Friday written update (Reporting Writer
   drafts; you approve). Scope changes are change memos, never quiet.

## When something feels off

- `sarga doctor` first: something probably degraded quietly.
- `sarga approve --list` — a stuck queue is usually one unmade
  decision wearing a process costume.
- The stall watcher (08:30) names anything idle 14 days with one
  suggested action. Take the action or kill the item; never wait.
- Every mystery has an audit trail: the events table, filterable by
  entity, actor, and action.
