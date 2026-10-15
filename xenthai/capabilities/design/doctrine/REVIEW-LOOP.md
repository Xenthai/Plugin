# The comment-driven review loop

Implements: fuera del playbook (X9)

## What a comment is

The owner comments on the published page, anchored on an element, in a few words and the imperative:
"quitar", "verde", "a la derecha", "debe de ser el primero". Each comment is one change and its wording is the rule.

1. Read the anchor's DOM path first; it names the element. Never guess the element from the words alone.
2. Apply exactly the change the words say, in the layer named. No neighbouring tidy-ups.
3. Keep every comment's wording as the rule for the rest of the surface: "quitar la hora" removes time from every
   row of that kind, not only the anchored one. Say so in the reply when it spread.
4. A comment that contradicts an earlier one is a question, not an override. Quote both and ask which stands.

## Two readings

When a comment admits two readings, ask once, with one question offering both. Never pick silently.

| Comment | Misread | Meant |
|---|---|---|
| "must be first" | The decision card must come first in the page | The order of rows inside a popover |
| "same style as the cards" | Mirror the generic card | The decided card of the desktop frame |

Two misreads in one project came from short words on a precise element. The anchor narrows it; if the anchor still
fits both readings, ask.

## Round

1. Collect every open comment before editing.
2. One writer applies the whole batch (`DELEGATION.md`), then the file is checked: syntax, diff against the
   snapshot, every frame captured (`PROOF.md`).
3. Republish to the same URL.
4. Reply in each thread with what changed in one sentence, then resolve it. Replies go out after the republish, in
   one batch, never one by one while the file is half-edited.
5. Never claim done before a screenshot of the changed element exists and was read.
6. A reply states the outcome, never the effort: "Quitada la hora de las filas", not "ajusté el diseño".

## Where taste converges

Over repeated rounds the owner's comments push one way: cleaner and simpler ("más limpia y sencilla"). Apply it
before it is asked, to every new element:

| Instead of | Do |
|---|---|
| A label next to an icon that already says it | Icon only, with a tooltip |
| The same identity (name, avatar) on every row of a group | Identity once, in the group header |
| Two icons for one element | One |
| A count as text in the title | A count in a badge |
| Metadata chips in a dense row | The one field that decides, or none |
| A second entry point for an act | One place per act |

This is a prior, not a licence: the owner's explicit comment wins over it every time.

## Closing a loop

1. The loop ends on the owner's "build it", not when comments run out.
2. On approval, write down the version approved (vN, date) in the Notas section and in the spec; it is the contract.
3. A comment that arrives after approval reopens the mockup first, then the code. Never patch the build alone.

## Before you finish

- Every open comment was read with its anchor's DOM path.
- Ambiguous comments went back as one question with both readings.
- Replies went out after the republish, with outcomes, and the threads are resolved.
- A screenshot of each changed element was read before "done" was said.
- The approved version is recorded.
