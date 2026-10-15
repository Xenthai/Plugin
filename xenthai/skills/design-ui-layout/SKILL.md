---
name: design-ui-layout
description: Use when arranging a screen or component — spacing and the spacing scale, grouping, alignment, visual hierarchy, grids, content width, responsive behaviour and breakpoints, content growth from translation or long values, or density — and before laying out a mockup frame. For the order of steps and sections or progressive disclosure use design-ux-flow; for target sizes, reflow and zoom requirements use design-ux-accessibility; for colour, type and token values use design-ui-system; for corner, depth and optical alignment polish use design-ui-polish.
---

# UI layout — space that groups, edges that align, structure that holds

This skill arranges what is on a screen so the structure reads before the words do: one spacing scale, groups made
by proximity rather than lines, few shared edges, the important thing in the prominent place, and a layout that
survives narrow and wide windows, zoom, translation and long real values. It works inside the product's system: the
product's spacing scale and the owner's recorded breakpoints replace every default here. The order in which content
and steps are presented, and what is disclosed progressively, are decided in `design-ux-flow` first; this skill gives
that order its spatial form.

## Procedure

1. **Read the product's layout system.** Spacing scale, shell geometry (sidebar, rail, header, tab bar, gutters),
   grid, content max-width, recorded breakpoints, density. Copy them exactly; defaults in
   `capabilities/design/doctrine/UI-LAYOUT.md` apply only where the product has none.
2. **Take the content order from `design-ux-flow`** and list each element with its importance. Do not reorder
   content here to make a layout easier.
3. **Group by proximity.** Gap between groups at least twice the gap within; add a background shape only for units
   that act as one, a separator only for dense data.
4. **Set edges and hierarchy.** Few shared alignment edges, one indent step per level, the most important content at
   the top and leading edge with the most space, one primary action per view.
5. **Fit the grid and widths.** Content width from the content (measure for text, columns for tables); text and
   controls inside margins and safe areas; media may bleed.
6. **Make it responsive.** Recorded breakpoints first; otherwise break where content stops fitting, collapse late,
   container queries for components, the shell by viewport. Check the narrowest and widest widths first, then zoom.
7. **Stress the content.** Empty, short, typical and longest realistic values; the longest locale; async content
   with reserved space; no clipped critical action.
8. **Set density** for the use, by swapping spacing tokens, never by shrinking targets.
9. **Prove it** with captured frames at every breakpoint the mockup carries
   (`capabilities/design/doctrine/MOCKUP.md`, `capabilities/design/doctrine/PROOF.md`).

## Always-on rules

1. Every gap, padding and margin is a step of the product's spacing scale; a stray value is a defect or a proposal.
2. The owner's recorded breakpoints are never re-argued; mockup frames use the widths in `MOCKUP.md`.
3. Space groups first; never a separator line and a large gap for the same boundary.
4. Direction-dependent spacing uses logical properties.
5. No fixed width or height on anything holding text; buttons size from their label.
6. Never a horizontal page scroll; wide tables scroll inside their own container.
7. A critical action is never placed where scrolling, resizing or the keyboard can clip it.
8. Controls look like controls; static elements do not mimic them.
9. Compact density reduces padding, never target size or target spacing (`design-ux-accessibility`).
10. One spacing rhythm and one radius rhythm per page, as the owner approved (`PATTERNS.md`).

## STOP conditions

- **The content order or what is shown at first is undecided.** Settle it in `design-ux-flow` before laying out.
- **The product has no recorded breakpoints and the owner has a preference to state.** Ask once through
  AskUserQuestion; record the answer so it is never asked again.
- **A layout only works by shrinking targets or text below the floors.** Change the layout, not the floors.
- **A needed spacing step does not exist** in the product's scale. Propose it; never introduce it inline.
- **The longest real value or locale breaks the layout** and truncation would hide something the user must act on.
  Redesign the slot.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UI-LAYOUT.md` | Choosing spacing steps, grouping, aligning, setting widths and grids, adding breakpoints, checking growth or density |
| `capabilities/design/doctrine/UI-SYSTEM-TYPE.md` | Setting a text column's measure or deciding how a long value wraps or truncates |
| `capabilities/design/doctrine/UI-SYSTEM-TOKENS.md` | Naming spacing or breakpoint tokens, or placing sticky and floating layers in the stacking order |
| `capabilities/design/doctrine/PATTERNS.md` | Laying out a list, decision card, action bar, toast or phone deck the owner already approved |
| `capabilities/design/doctrine/MOCKUP.md` | Building the breakpoint frames and data volumes the layout is judged on |
