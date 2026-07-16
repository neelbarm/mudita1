# Sarga Haus — Build Roadmap

## Phase 0 — Foundation (this build)
- [x] Concept audit, positioning, message hierarchy (docs/01)
- [x] Design system "Form" (docs/02, implemented in globals.css)
- [x] Motion storyboard (docs/03)
- [x] Technical architecture (docs/04)
- [x] Data model: intake + lead engine (docs/05, supabase/schema.sql)
- [x] Operating system + workflows (docs/06)
- [x] Lead engine design (docs/07), agentic layer (docs/08)

## Phase 1 — The site (this build)
- [x] Home: hero formation, positioning, scroll story, services chapters,
      gallery, OS walkthrough, lead engine, automation, builds, founder,
      FAQ, final CTA, footer
- [x] Services, How It Works, Selected Builds, About, Journal shell
- [x] Start a Project: multi-step intake, validation, API route,
      Supabase + Resend integration with graceful degradation
- [x] Accessibility: reduced motion, keyboard, contrast, semantics
- [x] SEO: metadata, sitemap, robots
- [x] QA: production build, lint pass

## Phase 2 — Go live (next session, ~days)
1. Create Supabase project, run schema.sql, set env vars on Vercel
2. Verify Resend domain; wire INTAKE_* addresses
3. Set NEXT_PUBLIC_BOOKING_URL (Cal.com) for post-submit booking
4. Deploy to Vercel, connect domain, set Plausible domain
5. Add Sentry DSN + @sentry/nextjs
6. Real founder line + photo decision on About (optional; page works without)

## Phase 3 — Studio dashboard (week 2–3)
1. Internal Next.js app on the same schema (auth: Supabase)
2. Intake inbox + triage → opportunity conversion
3. Pipeline board, stalled list, approval queue
4. Weekly report generation (agent draft → approval)

## Phase 4 — Lead engine live (week 3–5)
1. Choose licensed enrichment provider; wire verification
2. First ICP slice: 50 accounts, hand-reviewed
3. Sequence templates + approval queue flow
4. Friday reporting loop

## Phase 5 — Proof (ongoing)
1. First three client builds documented via workflow 14 (docs/06)
2. Replace illustrative systems with real case studies as approvals land
3. Journal: one essay per month, only when there is something to say
