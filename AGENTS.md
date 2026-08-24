# Sarga Haus — project memory

Handoff context for any AI assistant (Cursor, Claude Code, etc.) working on this
repo. Read this before writing code. It encodes decisions that are expensive to
rediscover and rules that are non-negotiable.

---

## 1. What this is

**Sarga Haus** is a founder-led product studio for nontechnical operators
(founders, creators, consultants, coaches, agencies, service businesses). One
accountable partner builds the product, automates the workflow, and fills the
pipeline. Flat fees, fixed scope, priced before work starts. No hourly billing.

Two shipped things live in this repo:

| Path | What it is | Stack |
|---|---|---|
| `sarga-haus/` | The public marketing site | Next.js 15 App Router, React 19, Tailwind v4, Framer Motion 12 |
| `studio/` | The Studio OS — the machine that runs the business | Node ESM + TypeScript, tsx, vitest, hono, Supabase, Claude Agent SDK |

The repo root also contains ~35 unrelated side projects (`hyperbuild`,
`churnhunter`, `phoenix-score`, …). **Ignore them** unless explicitly asked.
Work only in `sarga-haus/` and `studio/`.

Shipped client work (real, live, safe to reference): **EverPage**
(everpage.blog), **The Common Collective** (thecommoncollective.space),
**Styloire** (styloire.co), **Taxflow** (iOS, App Store).

---

## 2. Hard rules — never violate these

These are brand and legal constraints, not preferences. Breaking one is a defect.

1. **No em dashes in site copy.** Ever. Use commas, colons, or full stops. (Code
   comments and this file are exempt; user-facing copy is not.)
2. **No invented metrics, testimonials, or clients.** Every number on the site
   must be a fact that is true today and durable. No "500+ projects", no fake
   logos, no placeholder quotes. If a number is volatile (test counts, revenue),
   do not publish it.
3. **Illustrative work is always labeled illustrative.** Real work is labeled
   real. Never blur the line.
4. **Case studies publish only with written client approval.** Do not add client
   screenshots or names without it.
5. **Agents draft, humans decide.** Every client-facing artifact from the Studio
   OS is a draft until a named human approves it. This is enforced in code
   (database constraints + the effector seam), not by policy. Never add a code
   path that lets an agent send, sign, bill, or publish directly.
6. **Flat-fee positioning.** Never imply hourly billing or unbounded scope.
7. **Honesty about AI.** The site says plainly that supervised agents draft
   research, outreach, reports, and paperwork, and that a person approves
   everything. Do not hide it, do not oversell it.
8. **No guarantees of lead volume or revenue.** The studio publishes that policy.

---

## 3. Design system — "Form"

Defined in `sarga-haus/src/app/globals.css` via Tailwind v4 `@theme`. See
`sarga-haus/docs/02-design-system.md`.

**Two grounds, one accent.** Sections declare `data-ground="ink"` or
`data-ground="bone"`; semantic tokens flip automatically and components stay
ground-agnostic. Never hardcode a hex in a component — use the semantic token.

```
Raw:      --color-ink #0d0c0a   --color-bone #f2eee6   --color-brass #a98d5f
          --color-coal #161411  --color-paper #faf8f2  --color-brass-bright #c4a87a
          --color-cream #ede9e0 (+ -dim, -faint)  --color-soot #1a1814 (+ -dim, -faint)

Semantic: bg-ground bg-raised  text-t1 text-t2 text-t3  border-line
          border-line-strong  text-accent  (all flip with data-ground)
```

**Type.** `--font-display` = Fraunces (serif, headings, `.font-display`,
weights ~420-480). `--font-sans` = Instrument Sans (body). `.serif-italic` is
the brass italic accent used on key nouns. `.label` is the uppercase
letterspaced eyebrow. `.drop-cap` opens essay ledes.

**Motion.** `EASE` from `src/lib/motion.ts` is the Framer tuple
`[0.22, 1, 0.36, 1]`; `--ease-form` is the same curve as CSS `cubic-bezier` for
stylesheet use. Every animated component must honor
`useReducedMotionSafe()` from `src/lib/use-reduced-motion.ts`. Reduced motion
should reach the same end state instantly, never a broken layout.

**Feel.** Editorial, restrained, expensive. Apple/A24/Linear as the bar. The
anti-patterns to avoid: cheap visuals and fast animations.

---

## 4. The site (`sarga-haus/`)

### Routes
`/` home · `/services` · `/how-it-works` · `/builds` · `/about` · `/start`
(intake) · `/journal` + `/journal/[slug]` (essays) · `/audit` (10-question
lead-magnet diagnostic) · plus `sitemap.ts`, `robots.ts`, `manifest.ts`,
`feed.xml`, `llms.txt`, OG images, `not-found.tsx`, `template.tsx` (route veil).

### Home page order
`Hero → ShortVersion → PositioningStrip (bento board) → ScrollStory →
ServicesChapters → Gallery → OperatingSystem → LeadEngine → AutomationToggle →
BuildsPreview → FounderStatement → Faq → GovernedTicker → FinalCta`

### Signature interactions (the site's whole personality — do not casually remove)

- **The dark-room hero** (`components/hero.tsx`). The hero opens dimmed but
  fully legible (copy at 0.58 opacity, ink scrim over the canvas) with a pendant
  bulb on a draggable cord. Pull the cord (or tap the bulb) and the room ignites
  in place: filament flicker, light wash, sparks, a yanked swing, brass words
  igniting character by character, copy to full strength. Nobody gets stuck:
  scrolling past 120px or eight idle seconds lights it, `sessionStorage`
  (`sarga-lamp-lit`) remembers it for the session, reduced motion starts lit
  with no pendant. Once lit, the cord replays the full Overture (900ms grace
  period so a double-tap does not fire it).
- **The Overture** (`components/overture.tsx`). An *opt-in* overlay, never a
  gate. Three beats: "Do you have an idea?" (Yes/No, each with its own reply) →
  pull-cord light → a four-beat journey (The build / The machine / The pipeline
  / Lights on) that auto-advances every 3s, hurried by tap, Enter, Space, or
  ArrowRight. Escape and Skip exit throughout; 60s safety; reduced motion never
  sees it. Triggered via `requestOverture()`.
- **The gate bus** (`src/lib/overture-gate.ts`). `revealPage()` / `onReveal()`
  (fires immediately now — the page is never blocked) and `requestOverture()` /
  `onOvertureRequest()`.
- **Torchlight** (`components/torch.tsx` + `[data-torch]` rules in globals.css).
  One rAF pointermove listener sets `--tx/--ty/--to`; CSS pseudo-elements do the
  rest. Add `data-torch` to any raised surface.
- **Bento proof board** (in `home-sections.tsx`, `PositioningStrip`). Asymmetric
  tiles: 4 shipped products (2x2, rolled numeral), 17 agents, 15/day send cap,
  1-click opt-out, 5 offers, and one inverted **bone** tile carrying the audit
  link. Hover scale 1.015.
- **Governed-facts ticker** (`GovernedTicker`). A 46s lap of house rules above
  the final CTA. `.ticker-track` in globals.css; hover pauses; reduced motion
  renders a static wrapped list by hiding the second copy.
- **The unlit 404** (`app/not-found.tsx`). A pendant over "This page never took
  form."; tap to light, 6s idle auto-lights, reduced motion starts lit.
- **Audit gauge** (`components/audit-flow.tsx`). A 240° brass arc that sweeps to
  the score, number in its mouth, `role="img"` with an accessible label.
- **Reading thread** (`components/reading-thread.tsx`). Brass hairline under the
  nav that fills as an essay is read; spring-eased, direct-bound when reduced.
- **Blueprint mode.** Press `B` — every section reveals its `data-bp` label. Keep
  `data-bp` on new sections.

### Content as typed data (never hardcode in JSX)
- `src/lib/essays.ts` — journal essays (blocks, qa, related). Feeds the essay
  pages, `/journal`, `feed.xml`, `sitemap.ts`, JSON-LD, OG images, `llms.txt`.
- `src/lib/faqs.ts` — FAQs (also emitted as FAQPage JSON-LD).
- `src/lib/audit.ts` — 10 questions, `MAX_SCORE = AUDIT.length * 2` (= 20),
  `VERDICTS` ranges [0,8] / [9,14] / [15,20], `verdictFor`, `categoryFor`.
- `src/lib/builds.ts`, `src/lib/site.ts` (SITE, `absoluteUrl`, `ORG_JSON_LD`).

### SEO / AEO
JSON-LD via `components/json-ld.tsx` (Organization, WebSite, BlogPosting,
FAQPage, BreadcrumbList, Blog, ProfessionalService + OfferCatalog,
WebApplication). Canonicals on every page. `llms.txt` is a plain honest briefing
for answer engines — update it when offers or essays change.

---

## 5. The Studio OS (`studio/`)

The business machine. Runs with **zero API keys** in dry-run mode (LocalStore +
FixtureEngine + a file outbox), which is how you should test.

### Architecture seams
- `src/os/` — `StorePort` with two twins: `SupabaseStore` and `LocalStore`.
  `enforceInsertInvariants` mirrors the DB constraints so local runs fail the
  same way production would. Events, approvals, notify, constants.
- `src/agents/` — 17 agents (9 ops + designer, builder, gtm-strategist,
  content-writer, distribution-planner, finance-analyst, legal-drafter,
  strategy-partner). `ClaudeEngine` (Claude Agent SDK, path-jailed tools,
  structured output via zod) and `FixtureEngine` (reads
  `fixtures/agents/<slug>/<variant>.json`). Every action writes an event with
  actor `agent:<slug>`; every output lands in `approvals` with a forced
  `[draft]` prefix.
- `src/effects.ts` + `registerEffector` — **the only path from an approval to
  the world.** Anything that touches a client goes through here. `decide()`
  enforces the 48h equity cooling-off.
- `src/leads/` — ICP rubric 25/25/20/15/15 (≥60 qualifies), ≥3 approved cited
  facts before contact, verified emails only, permanent suppressions with HMAC
  one-click unsubscribe, `MAX_DAILY_SENDS = 15`, quiet hours, 4 touches over 21
  days, reply classes confirmed by a human, weekly metrics counting approved
  sends only. Maps scraping is gated behind `--i-understand-tos` and excluded
  from n8n.
- `src/factory/` — scaffolds client MVPs from `templates/client-app/`, runs a
  real build, screenshots with Playwright, and loops a Designer critic across 8
  dimensions (pass = avg ≥4, none <3, max 3 iterations). Client repos in
  `studio/clients/` are gitignored.
- `src/server/` — hono app; **HQ command deck at `/hq`** (self-contained
  `hq.html`, polls `/hq/data` every 6s, approve/reject wired to real `decide()`).
- `db/migrations/001_studio.sql` + `seed.sql` — Postgres/Supabase schema. The
  constraints (`outbound_requires_approval`, `trg_block_opted_out`,
  suppressions, `facts.source_url`, `approvals.decided_by`) are the real
  enforcement layer.
- `deploy/` — docker-compose, Dockerfile, and 12 generated n8n workflow JSONs.

### Docs
`studio/docs/RUNBOOK.md` (how to operate), `AGENTS.md` (what each agent does),
`COMPLIANCE.md` (which rule is enforced where). `sarga-haus/docs/01`–`10` cover
brief, design system, motion, architecture, data model, operations, lead engine,
agents, roadmap, scale thesis.

---

## 6. Commands

```bash
# Site
cd sarga-haus
npm run dev            # next dev — port comes from $PORT, no hardcoded flag
npm run build          # must be clean before any commit
npm start              # prod server

# Studio OS (all work with no API keys)
cd studio
npm install            # node_modules is not committed; do this first
npm test               # vitest, 34 cases across 7 files
npm run typecheck
npm run sarga -- doctor        # environment check
npm run sarga -- <agent|leads|approve|queue|business|factory|db|serve|source>
npm run sim:leadflow           # end-to-end lead sim, dry run
npm run sim:factory            # end-to-end factory sim
npm run serve                  # hono + HQ at /hq
```

---

## 7. Workflow conventions

- **Branch:** work on `claude/elegant-bardeen-xylsui`. Never commit straight to
  `main`.
- **Ship:** commit → `git push -u origin <branch>` → `git checkout main` →
  `git merge --no-ff <branch>` → `git push origin main` → switch back.
- **Deploy:** Railway watches `main` with root directory `sarga-haus/`. Merging
  to main redeploys the site. Changes outside `sarga-haus/` do not deploy.
- **Verify before shipping.** `npm run build` clean, then drive the real page
  with Playwright (chromium at `/opt/pw-browsers/chromium`) at 1440 and 390,
  checking console errors, horizontal overflow, and a reduced-motion pass.
  Do not claim something works because it compiled.
- **Commit messages:** what changed and why, plus the verification result. No
  model identifiers in anything pushed to the repo.

---

## 8. Gotchas — hard-won, do not relearn these

**Site**
- `whileInView` on a mask-clipped child never fires (IntersectionObserver ratio
  is 0). Hoist the trigger to an unclipped ancestor and drive children with
  variants.
- The CSS minifier strips duplicate-declaration `svh` fallbacks. Use
  `@supports not (height: 100svh)` instead.
- Never put `position` on a sticky host — it breaks the pin.
- `[data-torch]` rules must stay unlayered; Tailwind layers lose the cascade.
- satori / `next/og`: any `div` with more than one child needs an explicit
  `display: flex`, and text interpolations must be a single template string.
- `AnimatePresence` exit veils still intercept pointer events — wait for the
  exit to finish before asserting clicks in tests.
- A fixed nav can intercept clicks on hero elements; select the intended element
  precisely in tests rather than by coordinates.

**Environment**
- `pkill` returns exit 144 and kills the rest of a chained command. Kill node
  servers with `ps aux | grep next-server | awk '{print $2}' | xargs -r kill`
  and run `git` as its own command.
- Start a prod server for QA with `(npx next start -p PORT &) > /dev/null 2>&1;
  sleep 9`.
- Playwright is reachable via
  `createRequire("/opt/node22/lib/node_modules/playwright/")`.
- The shell working directory drifts — always `cd` explicitly.
- Outbound network goes through a proxy; most external hosts are blocked.

**Studio**
- zod must be `^4` (Claude Agent SDK peer dependency).
- `LocalStore` needs a `DEFAULTS` map mirroring Postgres column defaults, or
  rows come back with undefined status.
- `noUncheckedIndexedAccess` requires casts on store rows; supabase-js generics
  need `SupabaseClient<any, any, any>`.
- Numeric cross-checks must extract plain digits (`/\d+(?:\.\d+)?/g`) — a
  comma-aware regex merges JSON arrays and produces false rejections.

---

## 9. Open items (need the human, not the assistant)

Documented in the Owner's Manual PDF. Not blockers for site work.

- **Keys/env:** Railway domain, Supabase project + schema push, Resend,
  Anthropic, Hyperbrowser, Apollo/Hunter, Stripe, Cal.com, Slack, postal address
  for the unsubscribe footer.
- **Content:** founder name, photo, and bio for `/about`; one-liners for EverPage
  and Styloire; scope tags for The Common Collective and Taxflow; client
  screenshots (only with written approval).
- **Review:** attorney review of the legal templates; Safari confirmation on a
  real device.

---

## 10. Working style

Match the surrounding code: the comment density is deliberate (short, plain,
explaining *why*), components are ground-agnostic, and copy is written like an
editor wrote it. When adding a section, give it a `data-bp` label, a
`data-ground`, semantic tokens only, a reduced-motion path, and real facts.
