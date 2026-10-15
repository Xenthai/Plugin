---
name: design-ux-copy
description: Use when writing or reviewing the words inside a product interface — button and menu labels, form labels, hints and placeholders, error messages, empty states, confirmation dialogs, toasts, tooltips, onboarding text — or when a new user-visible string needs a dictionary key; for persuasive page copy on a landing, pricing or about page use brand-copy, for how an error is announced to a screen reader use design-ux-accessibility.
---

# Design UX copy — interface words that tell people what happens

This skill writes and reviews the words a person reads while using a product: what a button does, what went wrong
and how to fix it, what to do on an empty screen, what a dialog is about to do. The measure is whether a tired person
acts correctly on the first read, in the product's existing voice, in the client's language. Every string is a
dictionary entry before it is a sentence on a screen. It does not persuade; persuasion on marketing pages is
`brand-copy`'s job and runs on the company's claims register.

## Boundaries

| Question | Owner |
|---|---|
| Landing, pricing, feature or about page copy, headlines, sales CTAs | `brand-copy` |
| How an error or status is wired and announced (`aria-describedby`, live regions) | `design-ux-accessibility` |
| How a long string fits, truncates or wraps | `design-ui-layout` |
| How new copy is marked and tabled in a mockup | `capabilities/design/doctrine/MOCKUP.md` |

## Procedure

1. **Read the voice.** Open the dictionaries for the surface and its neighbours, and the copy already on screen. List
   the terms in use for the objects and actions the new copy touches. A brand voice in `VOICE.md`, when the product
   is a client's, constrains tone; the product's existing strings constrain terminology.
2. **Read what the code does.** Each string that states a fact (what a button does, what is saved, who is notified,
   whether it can be undone) is checked against the behaviour before it is written.
3. **Remove the need for words.** If a message explains a confusing interaction, propose the interaction change first;
   copy is the second fix.
4. **Write by component** following `capabilities/design/doctrine/UX-COPY.md`: verb-first buttons naming the outcome,
   errors with cause and fix, empty states with the next step, dialogs naming the action.
5. **Write both locales.** es-MX for client surfaces, with *usted* by default, and the second locale the dictionary
   carries. A sentence with a variable is one template with placeholders and plural forms.
6. **Key it.** Reuse an existing key when the meaning is identical; otherwise propose a key in the dictionary's
   naming. In a mockup the string is marked as new copy as `MOCKUP.md` requires.
7. **Read it in place.** Check the longest locale at the narrowest frame, and read the flow aloud from start to end:
   one verb per role, one word per concept.

## Always-on rules

1. No hardcoded user-visible string, including accessible names, `alt` text, tooltips and toast text.
2. A button starts with a verb and names what happens to what. "OK", "Sí" and "Aceptar" never confirm a consequential
   action.
3. A confirmation dialog's confirm button repeats its title's verb; the dialog says whether the action can be undone.
4. An error says what happened and what to do, sits beside its cause, keeps the person's input and blames no one.
5. An empty state says what belongs here and offers one next action; a no-results state echoes the query and an exit.
6. A placeholder is a format example, never the label.
7. One concept, one word, across the whole product. A synonym is a new concept to the reader.
8. Sentence case. Numerals for counts. Locale API for dates, numbers and money.
9. No "Ups", no exclamation marks in errors, no humour where money, data or security is at stake.
10. A factual sentence that the code does not back is removed before the owner sees it.
11. Interface copy never makes a marketing claim. A claim of outcome, speed or savings belongs to `brand-copy` and the
    company's `PROOF.md`.

## Conflicts resolved

1. **"Get started" and generic CTAs.** Inside a product flow a fixed, consistent flow vocabulary beats inventiveness;
   on a marketing page the CTA names what the visitor gets. The first is this skill's, the second `brand-copy`'s.
2. **First person.** In errors, state the fact rather than "we are having trouble"; an established first-person voice
   may stay in low-stakes, warm moments.
3. **Possessives.** Avoid "su" and "mi" in navigation labels ("Proyectos", not "Sus proyectos"); keep them where
   ownership is the point ("Su plan actual").

## Review output

One row per root cause listing every location, as `UX-COPY.md` sets out, ordered by severity, ending with `Block` or
`Approve`. A review that did not open the dictionaries says so and does not approve terminology.

## STOP conditions

- **The behaviour is unknown.** Do not write the sentence that describes it; read the code or ask.
- **No i18n dictionary exists** in the product. Raise it; do not hardcode strings as a workaround.
- **The request is persuasive copy** for a marketing page. Route to `brand-copy`.
- **The owner's wording conflicts with a rule here.** The owner wins on the surface; record the wording as the rule for
  the rest of it, as `capabilities/design/doctrine/REVIEW-LOOP.md` sets out.
- **A string would state a claim** (results, savings, compliance, a client's name). Remove it, or route to
  `brand-copy` with the claim named.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UX-COPY.md` | Writing or reviewing any interface string: tone, plain language, es-MX conventions, templates, each component's rules |
| `capabilities/design/doctrine/MOCKUP.md` | A new string has to be marked, keyed and tabled in a mockup |
| `capabilities/design/doctrine/UX-ACCESSIBILITY-FORMS.md` | An error, hint or status message also has to be wired and announced |
| `capabilities/social/doctrine/COPY.md` | Checking anglicisms, register or a regulated term in client-facing text |
