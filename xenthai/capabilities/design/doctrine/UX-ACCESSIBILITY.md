# Accessibility: semantics, keyboard, focus, targets, zoom

Implements: fuera del playbook (X9)

The target is WCAG 2.2 level AA. Widget behaviour follows the WAI-ARIA Authoring Practices (APG). Forms, announcements,
alternative text and media live in `UX-ACCESSIBILITY-FORMS.md`. Contrast ratios are measured under `design-ui-system`;
reduced motion is decided under `design-ui-motion`.

## Semantics before ARIA

1. If an HTML element already has the role and behaviour, use it. A rebuilt control needs a role, a tab stop, key
   handlers and states, and usually forgets one.
2. ARIA changes what assistive technology is told, never what the element does. A role promises its full keyboard
   model and states; wrong ARIA is a worse defect than none, because a screen reader trusts it.
3. Never override native semantics (`<h2 role="button">`): put a button inside the heading.

| Intent | Element | Never |
|---|---|---|
| Goes somewhere, changes the URL, can open in a new tab | `<a href>` | A button that calls `navigate()` |
| Does something here (save, open, toggle, delete) | `<button type="button">` or `type="submit"` | `<div>` or `<span>` with a click handler |
| Shows or hides a region | `<button aria-expanded>` controlling it, or `<details>` | An icon with a click handler |
| Modal task | `<dialog>` opened with `showModal()` | A positioned `<div>` without `aria-modal` and a trap |
| Site navigation list | `<nav>` with a list of links | `role="menu"`, which promises application arrow-key behaviour |

## Names, roles and states

1. Every interactive element has an accessible name. Source order of preference: visible text, `aria-labelledby` to
   visible text, `aria-label`, never `title` alone.
2. Visible label text appears inside the accessible name, starting with it (WCAG 2.5.3). A button reading "Enviar"
   whose name is "Submit form" breaks voice control.
3. Icon-only buttons carry `aria-label` naming the action, and the icon is `aria-hidden="true"`. The tooltip the design
   doctrine requires on them is a visual aid; it does not replace the name.
4. States are exposed, not drawn: `aria-expanded`, `aria-pressed`, `aria-selected`, `aria-checked`, `aria-current`.
   A selected row shown only by a background colour is unannounced.
5. `aria-hidden="true"` never sits on or above a focusable element. To hide an interactive thing, remove it from the
   tab order too, or use `inert`.
6. Every id referenced by `aria-labelledby`, `aria-describedby` or `aria-controls` exists; a dangling id fails silently.

## Page structure

1. `<html lang>` is set to the interface language (`es-MX` for client surfaces); a passage in another language carries
   its own `lang` so it is pronounced correctly.
2. `<title>` names the current view, most specific part first.
3. One visible `<main>`; repeated landmarks of one type get distinct `aria-label`s ("Principal", "Migas de pan").
4. Headings describe their section and nest without gaps. Report a skipped level as a finding only when it breaks
   navigation or meaning; the level is chosen by outline, the size by CSS.
5. When navigation precedes `<main>`, the first focusable element is a skip link to it, visible on focus.
6. A client-side route change updates `<title>` and moves focus to the new view's heading (`tabindex="-1"`) or `<main>`.

## Keyboard

1. Every pointer action has a keyboard path that completes the same task. A gesture is a shortcut to a visible
   control, never the only way (WCAG 2.5.7 for dragging: a single-pointer alternative exists).
2. Tab order follows reading order. `tabindex="0"` only on a custom focusable control, `tabindex="-1"` only for a
   programmatic target; a positive value is a defect: fix the DOM order.
3. A composite widget (tabs, toolbar, listbox, radio group, menu, grid) is one tab stop; arrow keys move inside it
   with a roving `tabindex` (active item `0`, the rest `-1`) or `aria-activedescendant`.
4. No keyboard trap outside a modal (WCAG 2.1.2): focus can always leave by Tab, Shift+Tab or Escape.
5. Escape closes the most recently opened layer: tooltip, then popover or menu, then dialog.
6. A single-character shortcut can be turned off or remapped, or fires only while its component has focus.

| Widget | Keys the APG pattern expects |
|---|---|
| Dialog | Tab and Shift+Tab cycle inside; Escape closes |
| Tabs | Left and Right move between tabs, wrapping; Home and End to the ends; Tab leaves to the panel |
| Menu button | Enter, Space or Down opens on the first item; Up opens on the last; Escape closes and returns to the button |
| Disclosure, accordion | The header is a button; Enter and Space toggle |
| Combobox | Down opens and enters the list; Enter accepts; Escape closes and keeps focus in the input |
| Listbox, radio group | Arrows move the selection; one tab stop for the group |

Tabs activate on arrow focus when the panel renders instantly, and on Enter or Space when switching is expensive.

## Focus

1. Focus is always visible (2.4.7). Style `:focus-visible`; never remove the outline without a replacement that is
   at least a 2 px solid perimeter. Its contrast against every colour it touches is measured under `design-ui-system`.
2. In forced-colours mode the ring stays visible: keep the system adjustment or use a system colour such as
   `Highlight`.
3. The focused element is never fully hidden by a sticky header, footer, toast or banner (2.4.11). Use
   `scroll-padding-top` equal to the sticky height.
4. Opening a modal: background becomes `inert`, focus moves inside, to the least destructive action when the dialog
   confirms a destructive one. Closing: focus returns to the trigger, or to its nearest surviving container.
5. Focus moves only on the user's action or on an error they must fix; new content never steals it.
6. Content shown on hover or focus (tooltips, previews) closes with Escape, can itself be hovered, and stays until
   dismissed (1.4.13).

## Targets

1. Floor: every pointer target is at least 24 by 24 CSS px (2.5.8), or passes the spacing exception: a 24 px circle
   centred on it overlaps no other target or other target's circle. Inline links in text and controls whose size the
   browser sets are exempt.
2. Recommended: 44 by 44 CSS px for every control that may be touched, and for primary actions everywhere. A dense
   desktop table may drop to the floor; record that choice in the mockup Notas.
3. A small visual can keep a large target: grow the hit area with padding or a pseudo-element on the wrapping button
   or label, never on the `<input>`.
4. Hit areas never overlap; where two would, shrink both to the largest size that does not collide.
5. Decorative overlays (scrims, glows, gradients) get `pointer-events: none` and `aria-hidden="true"`. A scrim that
   dismisses on click is a control and keeps its events.
6. A checkbox or radio and its label text are one target with no dead gap.

## Zoom, reflow, spacing

1. Text resized to 200% loses no content or function (1.4.4); the viewport meta never blocks zoom.
2. At 320 CSS px wide, the width of 1280 at 400%, the page scrolls in one direction only (1.4.10). Data tables, maps
   and code may scroll inside their own box. The 375 mockup frame does not prove this; check 320 too.
3. Overriding line height to 1.5, paragraph spacing to 2 times, letter spacing to 0.12 and word spacing to 0.16 of the
   font size clips nothing (1.4.12). Fixed heights on text boxes are the usual cause; use `min-height`.

## Colour is never the only signal

1. Status, errors, required fields, selection, links inside text and chart series each carry a second cue: an icon,
   text, a pattern, an underline or a shape (1.4.1).
2. A red border alone on an invalid field fails; pair it with the error text and an icon.
3. Contrast ratios are measured under `design-ui-system`, not here.

## Before you finish

- Every control is the native element for its intent, or a custom one that keeps the whole APG keyboard model.
- Every interactive element has a name containing its visible label; every icon-only button is labelled.
- States are attributes, not only colours; no `aria-hidden` covers a focusable element; no dangling id.
- `lang`, `<title>`, one `<main>`, a skip link where navigation precedes it, an ordered outline.
- The whole flow completes by keyboard; no positive `tabindex`; Escape closes the top layer.
- Focus is visible, never hidden under sticky chrome, trapped in modals and restored on close.
- Targets meet 24 px or the spacing exception; touchable and primary controls reach 44 px.
- 200% text, 320 px reflow and the text-spacing override break nothing.
- Every colour signal has a second cue.
