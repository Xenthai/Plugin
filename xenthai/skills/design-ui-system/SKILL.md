---
name: design-ui-system
description: Use when defining, extending or auditing a product's design tokens — colour ramps and semantic roles, dark mode, contrast checks, the type scale, line-height, measure, numerals and font loading, radius, elevation and token naming — or when any colour or text contrast must be measured. To choose a look for a surface with no system yet use design-ui-direction; for spacing, grids and breakpoints use design-ui-layout; for motion tokens use design-ui-motion; to read tokens off an existing interface use design-ui-inspect.
---

# UI system — tokens by role, contrast by measurement, type by roles

This skill builds and maintains the token layer every page reads from: colour ramps named by hue and semantic tokens
named by role, a type system of a few named roles, and the shared radius, elevation and stacking scales. Colour and
type have exact answers, so this skill computes and measures instead of eyeballing, and it is the only place in the
design suite where contrast is measured and judged. On a product that ships, the product's existing tokens are the
starting point and win every conflict; on a new product, the approved direction from `design-ui-direction` is the
brief. Spacing values and breakpoints belong to `design-ui-layout`; durations and easings to `design-ui-motion`.

## Procedure

1. **Read what exists.** Token files, theme config, component library, font loading, both theme blocks. Note the
   notation (hex, rgb, oklch) and the switching mechanism for dark mode. Existing tokens are copied, never restyled
   (precedence rule 1 of `skills/design/SKILL.md`).
2. **Inventory before changing.** On an existing product, list the literal colours, sizes, radii, shadows and
   z-indexes the code repeats, collapse near-duplicates and assign roles; show the inventory as a proposal
   (`capabilities/design/doctrine/UI-SYSTEM-TOKENS.md`). The spec that turns literals into tokens follows
   `capabilities/design/doctrine/PROCESS.md`.
3. **Colour.** Build or extend ramps per hue with a colour library in a perceptual space, map steps to roles, name
   semantic tokens by role, then derive dark mode from the same ramps and tune it
   (`capabilities/design/doctrine/UI-SYSTEM-COLOR.md`).
4. **Type.** Define named roles (size, line-height, weight, tracking), heading mapping, measure, numeral rules,
   phone input size and wrapping rules (`capabilities/design/doctrine/UI-SYSTEM-TYPE.md`).
5. **Shared scales.** Radius, elevation and stacking as small named scales mapped to roles and layers, in one naming
   grammar (`capabilities/design/doctrine/UI-SYSTEM-TOKENS.md`).
6. **Measure contrast** for every text and non-text pair on the background it actually renders on, in light and
   dark and in every colour-changing state, against WCAG 2.2 with APCA as a second check. Report pair, value and
   threshold for each failure.
7. **Record** the token set and every judgement in the design-line spec and in the mockup's Notas, so the build
   copies values rather than approximating them (`capabilities/design/doctrine/MOCKUP.md`).

## Always-on rules

1. Keep the project's notation and switching mechanism; a new system uses `oklch()` and one mechanism.
2. Components reference semantic tokens only; primitives never appear in a component, and a token is never borrowed
   outside its role because its value happens to match.
3. Every ramp step and every token has a consumer; a token nobody uses is deleted.
4. One hue, one meaning across the product. Colour never carries meaning alone (`design-ux-accessibility`).
5. Exactly one filled primary action per view, unless an owner-approved pattern rules otherwise
   (`capabilities/design/doctrine/PATTERNS.md`).
6. Dark mode is derived from the same ramps and tuned, never a mechanical inversion; every pair is re-measured.
7. Never report a contrast value that was not computed; never repaint a failing pair outside the task's scope, report
   it. Fix by moving lightness, holding hue.
8. Two type families at most plus a functional monospace; every used weight loaded; sizes in `rem`.
9. Long text 45 to 75 characters per line; changing numbers in tabular figures; phone inputs at 16 px or larger
   without blocking zoom.
10. Token names are English identifiers; interface copy never lives in tokens.

## STOP conditions

- **A needed token does not exist in the product** while building a mockup. Raise it as a proposal; never invent one
  silently (STOP list of `skills/design/SKILL.md`).
- **A brand colour fails contrast at the step the design wants.** Report it with measured values and the step that
  passes; never darken the brand without the owner's word.
- **Contrast cannot be measured** because the background is an image, video or translucent layer with unknown
  content. Report it as not verified and propose a scrim or opaque surface.
- **A token migration or notation change would touch screens outside the task.** Present the inventory and wait for
  the owner's decision.
- **No system and no approved direction** exist for a new product. Use `design-ui-direction` first.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UI-SYSTEM-COLOR.md` | Building ramps, naming colour roles, deriving dark mode, measuring or fixing contrast, choosing gradient interpolation |
| `capabilities/design/doctrine/UI-SYSTEM-TYPE.md` | Setting the type scale, line-height, tracking, measure, numerals, font loading, phone inputs, wrapping or truncation |
| `capabilities/design/doctrine/UI-SYSTEM-TOKENS.md` | Naming any token, deciding a tier, defining radius, elevation or z-index scales, auditing literals |
| `capabilities/design/doctrine/PROCESS.md` | Writing the design-line spec that replaces literals with tokens, and ordering the base-token PR |
| `capabilities/design/doctrine/MOCKUP.md` | Copying the product's tokens into a mockup in their exact notation |
