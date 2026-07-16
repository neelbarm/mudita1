# Sarga Haus — Site and Technical Architecture

## Sitemap

```
/                 Home — the full narrative
/services         The five offers in depth
/how-it-works     The five-stage process
/builds           Selected builds (real work + labeled illustrative systems)
/about            Founder conviction + the name
/start            Multi-step intake (the product of the site)
/journal          Insights structure (launch-ready shell, no filler posts)
/api/intake       POST endpoint for the intake form
```

## Home section architecture

1. Cinematic hero (formation field, scroll-linked)
2. Positioning strip (one paragraph, three principles)
3. Scroll story: Idea → Product → Automation → Pipeline (sticky)
4. Services chapters (five editorial spreads)
5. What we build gallery (horizontal, illustrative-labeled mock UIs)
6. Operating system walkthrough (interactive five stages)
7. Lead engine (schematic + honest framing)
8. Automation before/after (state toggle)
9. Selected builds preview (three entries)
10. Founder conviction statement
11. FAQ (seven questions, incl. pricing posture and equity discipline)
12. Final CTA ("If it is real, it deserves to exist.")
13. Footer (wordmark, nav, pronunciation line, colophon)

## Technical architecture

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4.** Server components
  by default; client components only where interaction demands.
- **Framer Motion** for all UI motion, scroll-linking (`useScroll`/`useTransform`),
  and the sticky story. No GSAP: nothing here exceeds what Framer Motion does
  well, and one motion system keeps the easing language consistent.
- **Custom 2D canvas** for the hero formation field (~160 segments, one rAF
  loop, devicePixelRatio-aware, paused when off-screen, disabled under reduced
  motion). No Three.js: the concept is hairline draftsmanship, not 3D; 2D canvas
  hits 60fps on phones without a WebGL payload.
- **No smooth-scroll library.** Native scroll preserves accessibility and feel;
  scroll-linked interpolation provides the cinematic quality instead.
- **Fonts** self-hosted via `next/font/local`: Fraunces variable (display),
  Instrument Sans variable (text). Two files, preloaded, no CLS.
- **Icons**: Lucide, imported per-icon.
- **Intake pipeline**: client form (multi-step, validated) → `POST /api/intake`
  (zod-style manual validation, honeypot, rate limit) → Supabase REST insert
  (service role, server-side only) → Resend notification + confirmation email.
  Every integration degrades gracefully: without env keys the endpoint validates
  and accepts, logging a warning, so the UX never breaks in preview.
- **Analytics**: Plausible via a single script tag when
  `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. No cookies, no consent burden.
- **Error monitoring**: Sentry-ready (documented, not installed — no dead
  dependency in the payload until a DSN exists).
- **Payments**: Stripe-ready architecture — invoice/payment workflow is modeled
  in the data layer (docs/05, docs/06); no checkout on the marketing site.
- **Deployment**: Vercel. No special config required; `vercel.json` omitted
  intentionally. Static generation for all pages; the API route is the only
  dynamic surface.

## Performance budget

- JS shipped to the client: the motion layer + form only; every heavy section
  is a lazy client island below the fold.
- No images at launch: all visuals are code (canvas, SVG, styled DOM) — the
  entire visual system costs ~0 network weight and cannot ship layout shift.
- Fonts: 2 woff2 files ≈ 67KB total, preloaded.
- Canvas paused off-screen; scroll listeners passive; no long-running loops.
- Static fallback for every animated surface.

## Accessibility commitments

Semantic landmarks, skip link, one h1 per page, focus-visible styling,
keyboard-complete tabs/accordion/form, AA contrast, reduced-motion variants,
no scroll traps, 44px touch targets, labeled form fields with inline errors.
