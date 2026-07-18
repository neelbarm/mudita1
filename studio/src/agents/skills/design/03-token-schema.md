# Skill: token schema

Tokens are the design's constitution: few, named, and enforced. The
builder may not introduce a color, size, or easing that has no token.

## Grounds (1 or 2)
The room's surfaces. Each ground pairs a background value with its
"on" text color, both AA-checked. Two grounds maximum (a light and a
dark, or one ground and one raised paper). Flipping ground mid-page
is a compositional beat; use it like a chapter break.

## Accent (exactly 1)
One accent with a written rule for where it may appear. The rule is
part of the token ("punctuation only: active states, one primary
action per screen, the drawn line"). If the brand demands a second
accent, the answer is no; brightness steps of the one accent are
allowed.

## Neutrals (2 to 4)
Dimmed text steps derived from the ground's "on" color, never gray
picked in isolation. Name them by role (text-dim, text-faint, line),
not by value.

## Derivation
Palette comes from the brand adjectives and any physical referents
the interview gave (materials, places, objects). "Warm plaster, wood,
black iron" is a palette brief; convert materials to values, then
verify contrast. Never start from a trending palette site.

## Output form
tokens.css custom properties on :root, semantic names, one comment
per token stating its rule. The spec's JSON mirrors the same values;
the two must never drift.
