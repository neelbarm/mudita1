# Sarga Haus — Motion Storyboard

The narrative every moving element serves:

> Fragments → Form → System → Motion.
> An idea is fragmented. Sarga Haus gives it shape, turns it into a product,
> automates the system, builds the pipeline. The scroll makes that visible.

Global rules
- One easing family: `cubic-bezier(0.22, 1, 0.36, 1)`. Entrances 0.6–0.9s.
- GPU-friendly properties only: transform, opacity, clip-path.
- Native scroll. No hijacking, no forced snap on long sections.
- Every animation has an origin and a destination that mean something.
- One signature moment per page. Everything else stays quiet.
- Reduced motion: all storyboards below have a static final-state fallback.

## Home

**S1. Hero — "The idea becomes real" (signature moment, v2: dimensional)**
Hundreds of hairline fragments tumble in a true 3D volume, rendered by a
hand-rolled projection engine on a 2D canvas. Scroll assembles them into a
wireframe monolith carrying the ledger interface on its front face; the
pointer tilts the formed object with inertia; depth fog and perspective
line-weight sell the dimension; on completion a single brass pulse travels
the perimeter once. The original storyboard below stands as the narrative
spec; v2 upgrades the material from a flat field to an object with mass.

Original spec —
Black frame. A field of ~160 hairline fragments (short strokes, cream at low
alpha, a few brass) drifts slowly, disordered. The pointer bends the field
gently within a 140px radius — the material feels present, not gimmicky.
As the user scrolls the first viewport, every fragment interpolates from its
scattered pose to its position on a formed object: a rounded-square system
frame with an inner grid — the Sarga mark at architectural scale. Progress is
scroll-linked (scrub, not trigger), so the user personally performs the act of
formation. Headline sets word-by-word (120ms stagger, 0.8s each): "Build the
product. / Automate the workflow. / Fill the pipeline." A thin scroll cue pulses
once, then stays still.
Fallback: formed state rendered immediately; headline fades in as one block.

**S2. Positioning strip**
Ink ground. One paragraph reveals per-line with a 60px rise, 80ms stagger.
Three numbered principles underneath draw their top hairline from 0 to 100%
width when in view (0.7s, staggered).

**S3. Scroll story — four stages (sticky)**
The section pins for ~320vh on desktop. A single visual object transforms:
1. *Idea* — scattered dashes and dots, one brass fragment among them.
2. *Product* — fragments snap into an interface frame: header bar, rows, a
   primary action. Snap is sharp (0.5s) after a slow gather — tension, release.
3. *Automation* — hairline conduits extend from the interface to three small
   nodes; a single pulse of light travels each conduit once.
4. *Pipeline* — rows stream into the frame from the left edge and settle into a
   ranked list; a counter ticks from 0 to a neutral "qualified" state.
Stage copy crossfades in a fixed left column; a 4-step progress rail on the
right fills in brass. Mobile/reduced motion: four static stacked panels, same
visuals frozen at their end state.

**S4. Services chapters**
Each of the five chapters enters as an editorial spread: index number
(01–05) clips up from below the baseline; title sets in serif; the chapter's
mini-visual performs one loop-free demonstration when 60% in view (e.g. the
Build chapter's wireframe fills to a finished surface in 0.9s). Alternating
5/7 and 7/5 grids so the rhythm never repeats.

**S5. What we build — gallery**
Horizontal scroll-linked track (vertical scroll drives horizontal motion,
±1 viewport of travel, never trapped). Cards are live HTML mock interfaces with
2° perspective tilt that flattens as each card reaches center. "Illustrative
system" label on every card. Mobile: native snap scroll, no linkage.

**S6. Operating system walkthrough**
Five-stage tablist (Clarify, Build, Automate, Acquire, Improve). Switching
stages slides a brass indicator along a rail and crossfades the detail panel
(0.4s). Fully keyboard-operable; hover previews, click commits.

**S7. Lead engine**
A schematic pipeline draws itself left to right when in view: five labeled
chambers connected by conduits; three abstract signal dots enter, one is
filtered at qualification (drops away, honest), two reach "pipeline." Runs
once. Replays only via an explicit "run again" control.

**S8. Automation before/after**
A two-state segmented control: "By hand" / "With a system." Switching
crossfades and re-lays-out the same set of objects: scattered inbox/spreadsheet
fragments reorganize into an intake → CRM → follow-up → report flow with one
human approval point highlighted in brass. State machine, not a loop.

**S9–S12. Builds preview, founder statement, FAQ, final CTA**
Quiet reveals only (12px rise + fade). The final CTA is the second display-xl
moment: "If it is real, it deserves to exist." sets against ink with a slow
2.5% scale settle of the formation mark behind it — the only ambient motion on
the page, and it stops after settling.

## Services / How It Works / Builds / About
One signature each: services chapters draw their deliverable lists as ruled
ledger lines; How It Works animates a single continuous hairline that threads
through all five stages as the user scrolls; Builds cards develop from a
wireframe outline to full surface on first reveal; About sets its conviction
lines one at a time at reading pace.

## Start a Project
The form is the moment: each step slides 24px with crossfade; the progress
rail fills in brass; the submit button carries a working state; the thank-you
state re-forms the mark from fragments once (0.9s) — the brand gesture at the
moment of commitment.
