# Skill: motion language

Motion is structure made visible over time. The studio's grammar:

- One easing family per site. Default: cubic-bezier(0.22, 1, 0.36, 1),
  the confident settle. Durations live in one range (0.4s to 0.9s for
  reveals; 0.15s to 0.3s for feedback). A site with seven durations
  has none.
- Transform and opacity only. Nothing animates layout, color flood,
  or blur on scroll. Cheap properties keep 60fps on old phones, which
  is where trust is won.
- Three legitimate jobs:
  1. Reveal structure: content enters in the order the eye should
     read it: mask-rise for lines of display type, small y-rise with
     stagger for grids.
  2. Confirm action: a pressed button settles, a completed step seats
     itself into place. Feedback is felt, brief, and singular.
  3. Continuity: a sticky scene scrubbed by scroll turns explanation
     into experience. At most one scroll-driven scene per page; it is
     usually the signature.
- Reduced motion is a first-class rendering: everything collapses to
  opacity or static, nothing disappears, meaning survives. Build it
  in the same commit, not after.
- The kill test for every animation: cover it and ask what the
  visitor no longer understands or feels. If the answer is nothing,
  delete it.
