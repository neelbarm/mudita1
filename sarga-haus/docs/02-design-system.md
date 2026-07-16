# Sarga Haus — Design System

The system is called **Form**. It exists so the few big moments land against a
quiet field. Tokens live in `src/app/globals.css` under `@theme`.

## 1. Color and semantic usage

Two grounds, one accent. No gradients, no neon, no colored icon chips.

| Token | Value | Use |
|---|---|---|
| `ink` | `#0D0C0A` | Primary dark ground. Hero, story, closing. |
| `coal` | `#161411` | Raised surface on ink (cards, panels). |
| `bone` | `#F2EEE6` | Light ground. Editorial sections, services page. |
| `paper` | `#FAF8F2` | Raised surface on bone. |
| `cream` | `#EDE9E0` | Primary text on ink. |
| `cream-dim` | `#A9A296` | Secondary text on ink. |
| `cream-faint` | `#6B655B` | Tertiary/labels on ink. |
| `soot` | `#1A1814` | Primary text on bone. |
| `soot-dim` | `#5B564C` | Secondary text on bone. |
| `brass` | `#A98D5F` | The only accent. Rules, indices, active states, small labels. |
| `brass-bright` | `#C4A87A` | Brass on ink where contrast requires it. |

Rules:
- Brass is punctuation, never a background fill and never body text.
- Hairlines: `cream` at 12% on ink, `soot` at 14% on bone.
- Art-directed grounds instead of a user theme toggle: the page alternates ink
  and bone deliberately. Both palettes are defined semantically so a toggle can
  be added later without redesign.

## 2. Typography

- **Display**: Fraunces (variable, optical serif). Weights 380–560. Used only for
  moments: heroes, chapter titles, the closing line. Tracking -0.02em to -0.035em.
- **Text/UI**: Instrument Sans (variable). Weights 400–600. Body, nav, labels,
  buttons, forms, all UI.
- **Labels**: Instrument Sans 500, 11–12px, letter-spacing 0.14em, uppercase.
  Usually `brass` or `*-faint`.

Scale (fluid, clamp-based):

| Step | Size | Use |
|---|---|---|
| display-xl | clamp(2.75rem, 7.5vw, 6rem) | Hero, final CTA only |
| display-l | clamp(2.25rem, 5vw, 4rem) | Page heroes, story stages |
| display-m | clamp(1.75rem, 3.2vw, 2.75rem) | Section titles |
| display-s | clamp(1.35rem, 2.2vw, 1.9rem) | Chapter/card titles |
| body-l | 1.125–1.25rem | Standfirst paragraphs |
| body | 1rem / 1.65 | Default |
| small | 0.875rem | Meta, captions |
| label | 0.6875–0.75rem caps | Eyebrows, indices |

Not every heading is enormous. display-xl appears exactly twice on the homepage.

## 3. Grid

12-column fluid grid, max-width 80rem (1280px), gutter 1.5rem, page padding
clamp(1.25rem, 5vw, 4rem). Editorial layouts use asymmetric spans (5/7, 4/8).
Full-bleed only for the hero, story canvas, and gallery.

## 4. Spacing

Base 4px. Section rhythm tokens: `--space-section` = clamp(6rem, 14vh, 10rem);
`--space-chapter` = clamp(4rem, 10vh, 7rem). Whitespace is the default state;
density must be argued for.

## 5. Buttons

- **Primary**: cream fill on ink grounds (soot fill on bone), 1px transparent
  border, radius 999px, padding 0.8em 1.6em, label 0.9375rem/500. Hover: fill
  shifts toward brass-tinted cream, arrow glyph translates 2px. Active: scale 0.98.
- **Secondary**: 1px hairline border, transparent fill. Hover: border brightens,
  background at 4% opacity.
- **Tertiary/inline**: label + underline offset 4px, hover shifts to brass.
- Focus: 2px brass outline, offset 3px, on `:focus-visible` only. Never removed.

## 6. Cards

Radius 12px (large surfaces 16px), 1px hairline border, ground `coal`/`paper`.
No drop shadows on dark; a single 24px/6% shadow on light. Hover: border
brightens and content lifts 2px; no glow, no scale-up beyond 1.01.

## 7. Navigation

Fixed top bar, 64px, transparent over the hero; after 24px of scroll it gains an
ink/86% backdrop-blur ground and a bottom hairline. Left: wordmark. Right: five
links + primary CTA. Mobile: full-screen ink overlay, links in display-s serif,
staggered 40ms. The bar never disappears on scroll-up tricks.

## 8. Motion principles

See docs/03-motion-storyboard.md. Summary: one easing family
`cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) for entrances, 0.6–0.9s; transforms
and opacity only; motion must reveal structure, never decorate; one signature
moment per page; everything readable with motion off.

## 9. Iconography

Lucide, 1.5px stroke, 16–20px, always monochrome (current text color). Icons
only where they carry meaning (form states, small utility marks). Never in
colored circles. The brand mark and stage glyphs are custom SVG hairline drawings.

## 10. Light and dark behavior

The site is art-directed: ink sections and bone sections alternate to create
cinema and editorial relief. Semantic tokens (`--ground`, `--ground-raised`,
`--text-1`, `--text-2`, `--text-3`, `--line`, `--accent`) flip per section via a
`data-ground` attribute, so components are ground-agnostic.

## 11. Mobile behavior

Mobile is composed, not scaled: the hero formation renders a simplified field;
sticky story becomes a stepped vertical sequence with the same four stages; the
gallery becomes native horizontal snap-scroll; chapters stack with preserved
indices; nav becomes the overlay. Touch targets ≥ 44px.

## 12. Accessibility behavior

WCAG AA contrast on all text (cream on ink 13.9:1, soot on bone 14.6:1,
brass used only at label sizes where it passes, brass-bright on ink for small
text). Semantic landmarks, one h1 per page, skip link, visible focus, forms with
real labels + inline errors + `aria-describedby`, accordions and tabs with full
keyboard support and ARIA state, `scroll-margin-top` on anchors.

## 13. Reduced motion behavior

`prefers-reduced-motion: reduce` collapses the system to opacity-only, ≤200ms:
the hero renders its resolved (formed) state as a static composition; the scroll
story becomes four static panels; parallax, magnetic hover, and canvas animation
disable. No content is gated behind animation.
