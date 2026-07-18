# Sarga Studio OS

The operating machine behind Sarga Haus: a lead engine, seventeen
draft-only agents, one approval queue, compliant outreach, finance,
legal drafting, GTM, and an MVP build factory. Everything runs with
zero API keys (local JSON store, dry-run agents, outbox emails) and
each key you add unlocks exactly one capability.

## Quickstart (two minutes, no keys)

```bash
cd studio
npm install
npm run sarga -- doctor        # what's live, what's degraded, what unlocks each
npm run sarga -- hq            # HEADQUARTERS: the live command deck at /hq
npm run sim:leadflow           # the whole lead engine, end to end
npm run sim:factory            # the MVP factory: real build, real screenshots
npm run sarga -- agent list    # the 17 agents
npm run sarga -- approve       # the queue (the founder's daily two minutes)
```

Headquarters (`sarga hq`, then http://localhost:8787/hq) is the room
where you watch everything: the decision queue with approve/reject,
the live wire of every agent action and human decision, the staff wall
of all seventeen agents, lead flow, pipeline, delivery, money, and the
stalled list. It refreshes itself every six seconds and works with
zero keys against the local store.

Tip: `npm run sarga -- <args>` works everywhere; `npx sarga <args>`
or a global link gives you the bare `sarga` command.

## Going live (in this order, each optional)

1. Supabase: create a project, run `sarga-haus/supabase/schema.sql`
   then `studio/db/migrations/001_studio.sql` (or `sarga db print --all --seed`
   and paste). Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
2. Anthropic: set `ANTHROPIC_API_KEY`; agents flip from fixtures to live.
3. Resend: verified domain, `RESEND_API_KEY` + `OUTREACH_FROM_EMAIL` +
   `STUDIO_POSTAL_ADDRESS` (live send refuses without a postal address)
   + `UNSUBSCRIBE_SECRET`. Point the inbound webhook at
   `/webhooks/resend-inbound`.
4. Sourcing: `HYPERBROWSER_API_KEY` for site-signal and directory
   crawls; `APOLLO_API_KEY` or `HUNTER_API_KEY` for licensed
   enrichment and email verification.
5. Money: `STRIPE_API_KEY` + webhook secret, or live on
   `sarga finance import <csv>`.
6. Orchestration: `docker compose -f deploy/docker-compose.yml up -d`,
   open n8n on :5678, import `deploy/n8n/workflows/*.json`, create one
   Header Auth credential "Studio API" with your `STUDIO_API_TOKEN`.

`sarga doctor` always tells you what is missing and what it unlocks.

## The shape of the machine

```
sourcing -> raw records -> [sourcing gate] -> accounts/contacts
  -> signals + cited facts -> [fact approval] -> ICP score (>=60)
  -> readiness (verified email + 3 facts + no suppression)
  -> enrollment -> daily queue -> Outreach Drafter -> [message gate]
  -> compliant send -> replies -> [class gate] -> conversation
  -> call summary -> proposal -> [founder gate] -> won
  -> project (refuses without signature + deposit)
  -> Designer spec -> [spec gate] -> scaffold -> Builder loop
  -> [build review] -> launch checklist -> [go decision]
```

Every bracket is a human decision in `sarga approve`. Agents draft;
you decide; effectors are the only code path from a decision to the
world; the events table records all of it.

## Map

- `src/os/` store (Supabase/local twins), events, approvals, effectors
- `src/agents/` the harness: registry, runner, engines, prompts, skills
- `src/leads/` sourcing, scoring, facts, sequences, compliance, mail
- `src/finance/` `src/legal/`+templates `src/gtm/` `src/strategy/`
- `src/factory/` designer, scaffold, build loop, launch checklist
- `src/server/` the HTTP surface n8n talks to; `deploy/` compose + n8n
- `docs/` RUNBOOK (the cadence), AGENTS (the roster), COMPLIANCE (the rules in code)
- `fixtures/` everything needed to run the whole machine key-free

## Verification

```bash
npm run typecheck && npm test   # 32 tests: invariants, rubric, gates
npm run sim:leadflow            # 16 beats, 3 human gates, 17 events
npm run sim:factory             # real scaffold/build/screenshots
npm run compose:check           # compose file validates
```
