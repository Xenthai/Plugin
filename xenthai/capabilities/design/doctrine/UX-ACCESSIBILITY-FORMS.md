# Accessibility: forms, announcements, images and media

Implements: fuera del playbook (X9)

Semantics, keyboard, focus, targets and zoom live in `UX-ACCESSIBILITY.md`. The wording of labels, hints and error
messages is decided under `design-ux-copy`; this file decides how they are wired and announced.

## Labels and fields

1. Every field has a visible label bound to it: `<label for>` or a wrapping `<label>`. A placeholder is never the label;
   it disappears on input and rarely meets contrast.
2. A group of radios or checkboxes sits in a `<fieldset>` whose `<legend>` asks the question.
3. Required fields use native `required` plus a visible marker; the marker is explained once at the top of the form.
   Where most fields are required, mark the optional ones instead, in words.
4. A hint (format, constraint) sits between label and field and is linked with `aria-describedby`, so it is read with
   the field. It is shown before the mistake, not only after.
5. Fields that collect the user's own data carry the matching `autocomplete` token (1.3.5): `name`, `email`, `tel`,
   `street-address`, `postal-code`, `username`, `current-password`, `new-password`, `one-time-code`.
6. Input type summons the right keyboard: `email`, `tel`, `url`; codes and card numbers are `type="text"` with
   `inputmode="numeric"`; money is `inputmode="decimal"`; `type="number"` only for true quantities.
7. `spellcheck="false"` on emails, codes and usernames.

## Never fight the user's tools

1. Paste is never blocked, in any field.
2. Password managers and one-time-code autofill work: a real `<form>`, real inputs, correct tokens.
3. Authentication never requires remembering, transcribing or solving something unless an alternative exists:
   paste, a manager, a link by email or a passkey (3.3.8).
4. Information the user already entered in this process is filled in or offered for selection, not asked again
   (3.3.7), unless re-entry is essential, as for a password confirmation.
5. Typing is never filtered character by character; accept the text, trim it, then validate.
6. Typed input survives a re-render and a failed submit; leaving with unsaved changes asks first.

## Validation and errors

1. Submit stays enabled. Validate on submit, and on blur only for a field the user has already left with a mistake.
   A disabled submit gives no reason and cannot be focused.
2. A failing field gets `aria-invalid="true"`, removed when fixed, and an inline message beside it, linked by
   `aria-describedby`, starting with an icon or the word for error, never colour alone.
3. On submit with errors, focus moves to the first invalid field. For a form longer than one screen, an error summary
   at the top lists each error as a link to its field, and focus moves to the summary; its heading names the count.
4. The message says what to do to fix it. Its wording comes from `design-ux-copy`; it never blames.
5. An error not tied to a field (network, session expired, permission) is announced as an alert and keeps the input.
6. While a submit is in flight, the button keeps its label, shows a spinner beside it and blocks a second submit.

## Disabled controls

1. Native `disabled` when the control is truly unavailable: it leaves the tab order and is not submitted.
2. A disabled control gives its reason in visible text nearby. A tooltip on a natively disabled control never opens for
   keyboard or touch users.
3. `aria-disabled="true"` when the control must stay discoverable by keyboard; then the code blocks activation, the
   style shows the state, including in forced colours, and the reason is nearby. Never both attributes at once.

## Announcing a change

Take the first rung that fits:

| Situation | Mechanism |
|---|---|
| Focus moves to it anyway (opened dialog, first invalid field) | Nothing more; the focus move announces it |
| Tied to one control (field error, character count) | `aria-describedby` on that control |
| Not urgent, not tied to a control (saved, result count, a toast, loading) | A polite region, `role="status"` |
| Urgent, not tied to a control (failed submit, session about to expire) | `role="alert"` |

1. A polite region is in the DOM, empty, before its text changes; a region inserted together with its text is
   announced unreliably.
2. Polite is the default. `assertive` and `role="alert"` interrupt whatever is being read; using them for routine
   confirmations is the most common live-region defect.
3. Messages are short and complete on their own, because the whole region is re-read on change.
4. Loading: `aria-busy="true"` on the updating region, a polite "Cargando" and then the outcome with its count.
5. Focus never moves to a toast. The toast is announced, focus stays where the user works.

## Toasts and timing

1. A toast reporting an error, or carrying the only path to an action, stays until dismissed.
2. Any timed element pauses while hovered or focused, and its time can be extended or turned off (2.2.1).
3. Content that moves, blinks or updates by itself for more than five seconds has a visible pause (2.2.2).
4. An undo offered in a timed toast is also reachable after the toast: the decided item can be reopened from where it
   now lives. A design with a short undo window passes only with that second path and a paused timer while focused.

## Alternative text

Decide by the image's job, not its look:

| Job | `alt` |
|---|---|
| Decoration, or repeats adjacent text | `alt=""`, present and empty |
| Carries information | The information, in the interface language, not "image of" |
| Is the link or the button | The action or destination ("Buscar", not "lupa") |
| Shows text | That text; better, real text |
| Chart or diagram | A one-line summary, with the full data as a table or text next to it |

1. A missing `alt` is worse than an empty one: screen readers fall back to the file name.
2. Decorative inline SVG: `aria-hidden="true"` and `focusable="false"`. Meaningful SVG: `role="img"` with a name, from
   `aria-label` or a `<title>` referenced by `aria-labelledby`.
3. An image slot in a mockup states in the Notas what its `alt` will be, or that it is decorative.
4. Text visible only to screen readers uses a visually-hidden class (1 px clipped box), never `display: none`.

## Media

1. Prerecorded video with speech has captions; audio-only content has a transcript.
2. Nothing plays sound on its own; every player shows its controls.
3. Video that conveys information only by picture has a text or audio description of it.

## Before you finish

- Every field has a bound visible label; groups have a legend; hints are linked and shown early.
- Personal-data fields carry `autocomplete`; types and `inputmode` fit; paste and managers work.
- Submit stays enabled; errors are inline, linked, flagged with `aria-invalid`, and focus goes to the first one or to
  the summary.
- Disabled controls give their reason in text.
- Each dynamic change uses the lowest rung of the announcement table; polite regions pre-exist; alerts are rare.
- No timed element holds the only path to an action; timers pause on hover and focus.
- Every image has an `alt` chosen by its job; SVGs are hidden or named.
- Captions and transcripts exist for media.
