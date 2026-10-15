# Tokens: tiers, naming, radius, elevation

Implements: fuera del playbook (X9)

A token is a named decision. It earns its place by replacing a literal the code already repeats or a role the system
needs; a token nobody consumes is speculation. Colour values are built in `UI-SYSTEM-COLOR.md`, type roles in
`UI-SYSTEM-TYPE.md`, the spacing scale in `UI-LAYOUT.md`, durations and easings by `design-ui-motion`. This file
holds what they share: tiers, naming, and the radius, elevation and stacking scales.

## Three tiers

| Tier | Names | Used by | Example |
|---|---|---|---|
| Primitive | A value: hue and step, size step | Only the semantic tier | `--blue-600`, `--radius-3`, `--space-4` |
| Semantic | A job | Every component | `--color-text-secondary`, `--radius-control`, `--shadow-raised` |
| Component | One component's deliberate divergence | That component only | `--button-danger-bg` |

1. Components reference semantic tokens. A primitive in a component removes the theming seam: a dark theme, a
   high-contrast theme or a white-label skin can no longer repoint one tier and leave the components alone.
2. A component token is a documented exception. Several of them for the same need mean a semantic role is missing;
   add the role instead.
3. Themes (dark, high contrast, a second brand) repoint the semantic tier only. Primitives never change meaning
   between themes.
4. In a utility-class framework that generates classes from tokens (for example a Tailwind `@theme` block), both
   tiers become classes; the discipline is that templates use the semantic classes and a primitive class in a
   component is flagged.

## Naming grammar

1. One shape for the whole system: `--{category}-{role}-{variant}-{state}`, for example `--color-bg-surface`,
   `--color-border-strong`, `--color-accent-solid-hover`, `--radius-control`, `--shadow-overlay`.
2. One word per concept, never synonyms: `text` (not fg, foreground, ink), `bg` (not background, fill), `border`
   (not stroke, outline, line), `accent` for the brand colour.
3. `primary` means one thing only. Use `accent` for the brand and keep `primary` for "most prominent of its group"
   (`--color-text-primary`). A `--color-primary` beside `--color-text-primary` is the commonest collision.
4. Never name a semantic token by appearance (`--color-blue-button`), by first use (`--color-sidebar-grey`), by a
   relative lightness that inverts in dark mode (`--color-light-grey`), or by a bare number (`--color-text-2`).
5. Separator and border are separate roles even when equal today; they diverge the first time inputs are restyled.
6. Token names are English; they are identifiers, not copy.

## Radius scale

1. Three to five radii cover a product: none, small (inputs, chips, tags), medium (controls and cards), large
   (sheets, dialogs, hero media), full (pills, avatars). Each maps to a semantic role (`--radius-control`,
   `--radius-surface`, `--radius-overlay`).
2. Stacked boxes on one page share one radius rhythm; a nested box follows the rule in `PATTERNS.md` (parent radius
   minus the padding between them). Optical refinements of corners belong to `design-ui-polish`.
3. Radius is part of the direction: sharp corners read technical and editorial, large ones soft and consumer. Do not
   mix sharp and round families on one surface without a reason the owner approved.

## Elevation scale

1. Elevation is a small set of named levels tied to layers, not to components: flat (page), raised (cards that need
   separation), overlay (menus, popovers), modal (dialogs, sheets), toast. Four or five levels at most.
2. In light themes a level is a shadow plus, where needed, a border; in dark themes a level is a lighter surface
   step, with shadow reduced or removed, because shadows vanish on near-black.
3. Each level's shadow is one token (`--shadow-raised`) possibly composed of two layers (a tight contact shadow and
   a soft ambient one). Shadow colour is tinted from the neutral ramp, never pure black at high opacity.
4. Grouping is done with space first (`UI-LAYOUT.md`); elevation marks layers, not groups. A page where every box
   floats has no layers.

## Stacking order

Define z-index as named layers with gaps, never raw numbers in components: base, sticky header, dropdown, overlay
scrim, modal, popover inside modal, toast, tooltip. Toasts float above layout and never push it (`PATTERNS.md`).

## Other shared tokens

Border widths (hairline and default), focus-ring width and offset, opacity steps for disabled and scrim, and icon
sizes are tokens too when the code repeats them. Breakpoints are tokens owned by `UI-LAYOUT.md`; motion tokens by
`design-ui-motion`.

## Introducing or auditing tokens

1. On an existing product, inventory the literals first (colours, radii, shadows, z-index, sizes), including SVG
   attributes, chart configs and e-mail templates. The spec procedure that replaces literals with tokens is in
   `PROCESS.md`; follow it rather than inventing tokens ahead of use.
2. Collapse near-duplicates (two values closer than one scale step are one value that drifted): keep the most used,
   never average.
3. Assign each survivor a role. A value matching no role is a missing token or a mistake; say which.
4. Present the consolidation as a proposal; it changes rendered output on screens nobody asked to touch.
5. In a mockup, tokens are copied from the product exactly, in its notation (`MOCKUP.md`).

## Before you finish

- Components reference only semantic tokens; component tokens are rare and justified.
- Names follow one grammar with one word per concept; no `primary` collision, no appearance names.
- Radius, elevation and z-index are small named scales, each mapped to a role or a layer.
- Dark elevation uses surface lightness, not heavier shadows.
- Every new token replaces a repeated literal or fills a named role; the inventory was shown before consolidation.
