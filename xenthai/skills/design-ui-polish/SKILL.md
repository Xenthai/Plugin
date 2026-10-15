---
name: design-ui-polish
description: Use when an interface works but does not yet look finished — nested radii that look off, icons that sit wrong or clash in weight, borders standing in for depth, translucent or layered surfaces, missing hover, pressed, disabled or loading states, a theme switch that smears, or a pass over the small details before a screen ships. For anything that moves use design-ui-motion; for tokens, colour and contrast use design-ui-system; for spacing and alignment edges use design-ui-layout; for hit and touch target sizes use design-ux-accessibility.
---

# Interface polish — the finish nobody names and everybody feels

This skill is the last pass before a screen is called done: the static details that, one at a time, nobody notices
and, together, decide whether an interface reads as deliberate. Concentric radii, optical alignment, shadows that lift
and borders that structure, materials that layer without losing legibility, icons matched to their text and their
context, every state of every pressable, and a theme switch that snaps. It works inside the product's tokens and
component library; it never restyles them.

## 0 · Precedence

1. The product's tokens, component library and recorded patterns win (`capabilities/design/doctrine/PATTERNS.md`).
2. The owner's explicit comment wins over every default in `capabilities/design/doctrine/UI-POLISH.md`.
3. Values here are defaults for what the product has not decided; a value the product lacks becomes a proposed
   token, never a literal in one component.

## 1 · The pass, in order

1. **Read the product.** Radius, elevation and icon tokens, the icon library, the component library's state styles,
   the theme mechanism.
2. **Radii.** Walk every nested rounded box; each is concentric or deliberately independent.
3. **Alignment.** Icon-and-text buttons, play and arrow glyphs, text in pills and badges: centre what the eye sees.
4. **Surfaces.** Each border is asked whether it structures or lifts; lifting borders become the elevation token;
   images carry the neutral outline.
5. **Materials.** Translucent layers never stack; fallbacks exist for reduced transparency and high contrast; text on
   material is checked against the worst background under it.
6. **Icons.** One library, stroke matched to the adjacent text weight, `currentColor`, outline at rest and fill when
   active, a verb per icon and a tooltip on every icon-only button.
7. **States.** Every pressable shows hover (pointer only), pressed on pointer-down, focus-visible, disabled and loading
   where it starts work.
8. **Theme switch.** Transitions suppressed for the one frame of the flip.
9. **Invisible details.** The list in `UI-POLISH.md` § The invisible details.
10. **Prove it.** Capture each state and both themes; read the images before claiming done.

## 2 · Always-on rules

1. A nested radius is the parent's minus the inset, or the two are deliberately separate surfaces.
2. Shadow for elevation, border for structure; form fields keep their border.
3. Never a translucent surface on another translucent surface.
4. One icon library per surface; one SVG per icon, coloured by `currentColor`.
5. Every icon-only button has a tooltip and an accessible name.
6. Pressed state lands on pointer-down and never on a disabled control.
7. A missing state (hover, pressed, focus, disabled, loading) is a defect, not a style.
8. The theme flip never animates; the one-frame suppression is not the banned reduced-motion rule.
9. Late content reserves its space; nothing below it jumps.
10. Every value used is a token or becomes one.

## STOP conditions

- **The fix needs a token the product lacks.** Propose the token; do not inline a value.
- **The change moves something** (a transition, a hover lift, an icon swap's timing). Settle the motion through
  `design-ui-motion` before shipping it.
- **The issue is spacing, grouping or alignment edges across a page.** That is `design-ui-layout`.
- **The issue is colour choice or a contrast ratio.** That is `design-ui-system`.
- **A target is too small to tap.** That is `design-ux-accessibility`.
- **The owner approved the current finish** in a pattern or a comment. Note the deviation; do not change it.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UI-POLISH.md` | Any polish pass: radii, optical alignment, surfaces, materials, icons, states, theme switch, invisible details, the report format |
| `capabilities/design/doctrine/PATTERNS.md` | The surface follows an approved pattern, or the radius and spacing rhythm is in question |
| `capabilities/design/doctrine/UI-SYSTEM-TOKENS.md` | Choosing an elevation level, shadow colour or radius token |
| `capabilities/design/doctrine/MOTION.md` | A polish fix touches a transition, a press duration or an icon swap |
| `capabilities/design/doctrine/PROOF.md` | Capturing states and themes before claiming the pass is done |
