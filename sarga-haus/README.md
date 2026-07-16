# Sarga Haus

A founder-led product studio. Build the product. Automate the workflow.
Fill the pipeline.

This repository contains the complete Sarga Haus foundation:

- **The site** — Next.js 15, TypeScript, Tailwind v4, Framer Motion, a custom
  canvas hero, and a multi-step intake flow. All visuals are code: zero image
  weight, zero layout shift.
- **The strategy** — brand brief, design system, motion storyboard, and
  technical architecture in [`docs/`](docs/).
- **The operating system** — CRM structure, delivery workflows, lead engine,
  and the human-supervised agent layer, in [`docs/06`](docs/06-operations.md)
  through [`docs/08`](docs/08-agents.md).
- **The data layer** — intake + lead engine schema in
  [`supabase/schema.sql`](supabase/schema.sql).

## Run it

```bash
npm install
npm run dev
```

## Deploy

Vercel, zero config. Copy `.env.example` to configure integrations; the site
runs fully without them (intake accepts and logs, emails are skipped):

- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — persist intake submissions
  (run `supabase/schema.sql` first)
- `RESEND_API_KEY` + `INTAKE_*` — notification and confirmation emails
- `NEXT_PUBLIC_BOOKING_URL` — booking link on the intake thank-you state
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — analytics

## Docs index

1. [Brand and product brief](docs/01-brief.md)
2. [Design system](docs/02-design-system.md)
3. [Motion storyboard](docs/03-motion-storyboard.md)
4. [Site and technical architecture](docs/04-architecture.md)
5. [Data model](docs/05-data-model.md)
6. [Internal operating system](docs/06-operations.md)
7. [Lead engine](docs/07-lead-engine.md)
8. [Agentic layer](docs/08-agents.md)
9. [Roadmap](docs/09-roadmap.md)
