# __NAME__

Built by Sarga Haus on the studio's client template.

- `src/design/tokens.css` and `src/design/spec.json` carry the approved
  design system. Components use tokens only.
- `npm run dev` to work, `npm run build` to verify, `npm run qa` for
  screenshots, accessibility (axe), and the LCP < 2.5s gate.
- `lib/` holds env-gated integrations (Supabase, Stripe, Resend); the
  app runs with zero keys and each key unlocks one capability.
- See LAUNCH.md for the launch checklist once QA passes.
