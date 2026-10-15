---
name: design-ux-accessibility
description: Use when building, mockup-checking or reviewing an interface for accessibility — semantics and ARIA, keyboard paths, focus order and visibility, screen-reader names and announcements, form labels and error wiring, alt text, touch and pointer target sizes, zoom and reflow, or colour used as the only signal; for measuring contrast use design-ui-system, for reduced motion use design-ui-motion, for the words of a label or error use design-ux-copy.
---

# Design UX accessibility — WCAG 2.2 AA by construction, then by two walks

This skill makes an interface usable by keyboard, screen reader, voice control, magnification and touch, to WCAG 2.2
level AA, with widget behaviour taken from the WAI-ARIA Authoring Practices. Most of it costs nothing when the platform
is used as shipped: native elements, bound labels and a visible focus ring. The work is to choose those first, and to
prove the result with a keyboard walk and a screen-reader walk rather than by reading markup. It applies to a mockup
before the owner sees it and to code before it merges; the owner loop itself is `design`'s.

## Boundaries

| Question | Owner |
|---|---|
| Is this pair of colours readable, does the focus ring contrast | `design-ui-system` measures it; this skill only names the requirement |
| Should this animate under reduced motion | `design-ui-motion` |
| What should the label, hint or error say | `design-ux-copy`; this skill wires and announces it |
| How a mockup is built, reviewed and proven | `capabilities/design/doctrine/MOCKUP.md`, `REVIEW-LOOP.md`, `PROOF.md` |

Hit and touch target sizes live only here.

## Decision order

Settle each in order for every control or surface; a later step cannot repair an earlier one.

1. **Element.** Is there a native element for this intent? Use it. Only when none exists, build a custom control and
   take on the whole APG pattern for its role.
2. **Name, role, state.** Every interactive element has a name that contains its visible label; states are attributes.
3. **Keyboard path.** The task completes without a pointer; composite widgets are one tab stop with arrow keys inside;
   every gesture has a visible control that does the same.
4. **Focus.** Visible, in reading order, never hidden under sticky chrome, trapped in a modal and returned on close.
5. **Announcement.** Each change that happens without a page load reaches the screen reader by the lowest fitting rung:
   focus move, `aria-describedby`, polite status, alert.
6. **Forms.** Bound labels, `autocomplete` tokens, submit enabled, errors inline and linked, focus to the first error.
7. **Non-text content.** `alt` chosen by the image's job; meaningful SVG named, decorative SVG hidden; captions.
8. **Targets.** 24 CSS px floor or the spacing exception; 44 px for anything touchable and every primary action.
9. **Zoom and reflow.** 200% text, 320 px width and the text-spacing override break nothing.
10. **Colour.** Every colour signal has a second cue.

## Always-on rules

1. Remove ARIA before adding it. A role is a promise of its whole keyboard model; a broken promise is worse than none.
2. `<button>` acts, `<a href>` goes somewhere. A clickable `<div>` is always a defect.
3. Never `outline: none` without a replacement ring of at least 2 px; style `:focus-visible`.
4. No positive `tabindex`, no keyboard trap outside a modal, Escape closes the top layer.
5. A placeholder is never a label, and a red border is never the whole error.
6. Submit buttons are never disabled to signal an invalid form.
7. Polite by default; `role="alert"` only for an urgent problem not tied to a field.
8. A timed element never holds the only path to an action, and pauses while hovered or focused. Where an approved
   pattern uses a short undo window, the undo also exists after the window closes.
9. Icon-only buttons have an `aria-label`; the tooltip `design` requires is in addition, not instead, and it can be
   dismissed with Escape and hovered.
10. Interface language is set with `lang` (`es-MX` for client surfaces); accessible names, `alt` text and
    visually-hidden text come from the same i18n dictionaries as visible copy.
11. Every claim of conformance names the check that was run. A check not run is reported as `Not verified`, never
    passed by inference.

## Review procedure

1. **Read the source** for the cheap failures: native elements, names, labels, `alt`, `tabindex` values, ARIA ids,
   `lang`, outline removal, target sizes in CSS.
2. **Keyboard walk.** Tab the whole flow from the address bar. At every stop: is the ring visible, is the order the
   reading order, does every action complete, does Escape close what opened, does focus return.
3. **Screen-reader walk** (NVDA or VoiceOver, or the browser's accessibility tree when neither is available). Every
   stop announces name, role and state; every dynamic change is announced once, at the right urgency.
4. **Zoom walk.** 200% text, then a 320 px wide viewport, then the text-spacing override.
5. **Automated audit** (axe or Lighthouse) last. Rules engines catch only the machine-decidable criteria; a clean run proves little.
6. **Report.** One row per root cause, listing every location:

| Severity | Location | Criterion | Before | After | Impact |
|---|---|---|---|---|---|

`High`: a task cannot be completed, content is hidden from assistive technology, or the defect is systemic. `Medium`:
the task is meaningfully harder. `Low`: isolated polish. End with `Block` while any `High` remains, otherwise
`Approve`, and list the checks not run.

## Conflicts resolved

1. **Target size.** The floor is WCAG's 24 px; the recommendation is one number, 44 px, matching platform guidance for
   touch, not a separate desktop figure. A dense desktop table may use the floor when the Notas record it.
2. **Heading levels.** One `<h1>` and no skipped level is the default outline, but a skip is reported only when it
   breaks navigation or meaning; it is not a standalone failure.
3. **Undo toasts.** A short undo window is compatible with timing rules only with a paused timer on focus and a second
   path to reverse the decision.

## STOP conditions

- **A custom widget has no APG pattern that fits.** Do not invent a keyboard model; split it into native parts or ask.
- **The owner asks to remove a focus ring, block zoom or block paste.** Explain the criterion it breaks and who it
  excludes, once; if confirmed, record the decision in the Notas and do not ship it as conformant.
- **A contrast or motion question appears.** Hand it to `design-ui-system` or `design-ui-motion`; do not measure or
  decide it here.
- **The only proof available is the source.** Report keyboard and screen-reader results as `Not verified`.
- **No dictionary exists for an accessible name or `alt` text.** Mark it `data-new-copy` with a proposed key, as for
  any new string.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UX-ACCESSIBILITY.md` | Choosing elements and ARIA, naming controls, building keyboard support, handling focus, sizing targets, checking zoom, reflow and colour cues |
| `capabilities/design/doctrine/UX-ACCESSIBILITY-FORMS.md` | Wiring a form, validation or error summary, choosing how a change is announced, writing alt text, timing a toast, captioning media |
| `capabilities/design/doctrine/MOCKUP.md` | An accessible name, alt text or hint is new copy that must be marked and tabled in a mockup |
| `capabilities/design/doctrine/PROOF.md` | Claiming a surface passes, or capturing the evidence of a keyboard or zoom walk |
