# Colour system and contrast

Implements: fuera del playbook (X9)

Colour has exact answers: lightness, gamut and contrast are computed, never eyeballed. This file is the only place in
the design suite that defines how contrast is measured and which thresholds apply; other files point here.

## Notation

1. An existing product keeps its notation. A hex codebase stays hex; one `oklch()` value dropped into it is a
   defect unless a migration is the task.
2. A new system is written in `oklch()`: its lightness is perceptual and its hue holds, so ramps behave predictably.
3. Compute with a colour library (culori, colorjs.io, chroma.js) in a perceptual space and emit the project's
   notation. Never build a ramp by varying HSL lightness; HSL lightness is not perceived lightness and its hue drifts.
4. Wide-gamut (P3) values are an enhancement: declare the sRGB value first, override inside
   `@media (color-gamut: p3)`. A P3 value with no sRGB fallback fails on most screens.

## Ramps: primitives by hue

1. The set is one neutral ramp, one accent ramp, and a status ramp only for each state the product actually renders
   (danger, warning, success, info). A ramp nothing consumes is deleted.
2. Every step exists because a role consumes it: page background, subtle surface, component fill, hover, selected,
   subtle border, border, strong border and focus ring, solid fill, solid hover, secondary text, primary text. About
   twelve steps cover them; generate no step without a role.
3. A well-formed ramp: even steps in perceived lightness, constant hue, chroma highest mid-ramp and falling toward
   both ends, steps closer together at the light end, neither end reaching pure white or black.
4. Across hues, the same step has the same perceived lightness, and chroma is set as the same proportion of each
   hue's own maximum. Copying one chroma number across hues leaves yellow and cyan weak.
5. A brand colour is placed on the step its job needs. A contractually fixed brand value is pinned and the ramp is
   built around it; otherwise it is snapped onto the ramp. A brand colour too light for white text stays the brand
   colour on a lighter step; interactive fills use a darker step. Never darken the brand silently.
6. Neutrals may be pure grey or tinted a few percent toward the accent hue, warm or cool; whichever, hold it across
   the whole ramp. The neutral ramp never has fewer steps than the accent.
7. Status hues are kept visibly apart from the accent: a red brand moves danger toward crimson until primary and
   destructive buttons read as different side by side.

## Semantics: tokens by role

Primitives (`--blue-600`) name a value and are never used in a component. Semantic tokens name a job and point at a
primitive; components reference only them. The naming grammar and tier rules are in `UI-SYSTEM-TOKENS.md`.

The colour roles a complete system names: surfaces (page, surface, raised, sunken, scrim), text (primary,
secondary, disabled, inverse, on-accent), borders (subtle, default, strong, focus, separator), accent (subtle bg,
border, solid, solid hover, text) and per shipped status (subtle bg, border, solid, text).

1. A token is used only in its role. A border token used as text colour breaks the day borders get lighter; if a
   role lacks a token, add the token.
2. One hue, one meaning across the product; hues within about 15 degrees count as the same hue. If the accent means
   interactive, it never colours static text, and no interactive element is left neutral.
3. Colour is never the only carrier of a meaning; the paired icon, label or shape is required
   (`design-ux-accessibility` owns that rule).
4. Locale meanings matter where colour carries money or status: gain and loss are per-locale tokens when the product
   ships to markets that read red as gain.

## One filled action per view

When a filled accent marks primary emphasis, exactly one action in a view gets it; peers are neutral or outlined.
Colour goes on the background, not only the label. Several filled colours are fine when they encode different
categories or outcomes rather than competing for "primary", and an owner-approved action bar
(`PATTERNS.md`) is an owner ruling that stands as approved. Selected state (an active tab, a checked segment) may use
the accent; it is state, not emphasis.

## Dark mode is derived, never inverted

1. Start from swapping the semantic tier to the dark end of the same ramps; that swap is the first draft only.
2. Then tune: lower accent chroma one or two steps (saturated colour glows on near-black), widen separation between
   the darkest steps (dark surfaces collapse into each other), and express elevation by lighter surfaces rather than
   shadows.
3. Re-measure every pair in dark; contrast is not symmetric, so a pair passing in light can fail mirrored.
4. One switching mechanism for the whole product: `prefers-color-scheme` alone when there is no toggle; a class or
   attribute on the root once users can override, with the media query only seeding the initial value;
   `light-dark()` only with `color-scheme` set. Mixing them half-themes the page.
5. A `prefers-contrast: more` variant, when shipped, widens the foreground-background lightness gap and is measured
   again.

## Contrast: measure the rendered pair

1. Identify the background the foreground actually renders on: the nearest painted ancestor, a card, a tinted row,
   an image. The page background is usually the wrong one.
2. Measure in both themes, for every state that changes colour (hover, selected, disabled, focus).
3. Translucent surfaces, `color-mix()`, relative colour syntax and alpha modifiers resolve at render time: measure
   the rendered result, and for a blurred or translucent bar, against the lightest and darkest content that scrolls
   under it. Text on an image or gradient is measured at its worst region, or given a scrim.
4. Never report a value that was not computed. Report the pair, its value and the threshold it misses.

### Thresholds

WCAG 2.2 is the gate, because conformance claims and law reference it:

| Content | Minimum (AA) | Enhanced (AAA) |
|---|---|---|
| Body and UI text below large size | 4.5:1 | 7:1 |
| Large text: 24 px regular or about 18.7 px bold and up | 3:1 | 4.5:1 |
| Non-text: control boundaries, focus indicators, meaningful icons and chart marks | 3:1 | not defined |

APCA is the second check, because WCAG 2 ratios misjudge dark-mode pairs and mid-tone backgrounds. Use its Lc value
as a tiebreaker above the gate: about Lc 75 for body text (90 preferred), Lc 60 for other text, Lc 45 for large
display text, Lc 30 for disabled text and placeholder-level UI, Lc 15 as the floor for any visible non-text mark.
Lc is signed by polarity; compare its absolute value. A pair that passes WCAG and falls far below the APCA guide is
flagged, not silently accepted.

### Fixing a failing pair

1. Report first; change colours only when the change is in scope, since they are a design decision.
2. Move lightness, holding hue and chroma; hue changes barely move contrast.
3. A mid-lightness background caps achievable contrast: body text needs a background near one end of the ramp.
4. Pushing lightness can leave the gamut; reduce chroma to stay renderable. Re-measure after every change.

## Gradients

The interpolation space is a look: `in oklab` gives even brightness and is the default; `in oklch` keeps
saturation by travelling round the hue wheel; default sRGB greys out the midpoint between opposite hues. Large
low-contrast gradients band; widen the stops or add fine noise. Keep text off gradients where possible.

## Before you finish

- The project's notation was kept; new systems are in `oklch()` computed by a library.
- Each ramp step has a consuming role; status ramps exist only for rendered states.
- Components reference semantic tokens only; no token is borrowed outside its role.
- Exactly one filled primary per view, unless an owner-approved pattern says otherwise.
- Dark mode was tuned after the swap and uses one switching mechanism.
- Every text and non-text pair was measured on its rendered background, in both themes, against WCAG 2.2, with
  APCA as a second check; unmeasured pairs are reported as not verified.
