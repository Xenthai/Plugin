# States: every condition a view can be in

Implements: fuera del playbook (X9)

A view is designed in all its states or it is not designed. The happy path with data is the state the owner sees in
a mockup; the others are the states users meet on their worst day. Each state below is specified for every view in
scope, as a frame or a written line, before code.

## The state matrix

| State | What triggers it | What the view must do |
|---|---|---|
| First use | The person has never created anything here | Say what this place is for and offer the one action that fills it |
| Cleared | Everything was done or removed | Confirm the good outcome; no call to create unless it is the next job |
| No results | A search or filter matched nothing | Echo the query or filters, offer to widen or clear them |
| Loading | Data is on its way | Keep the frame stable, show progress proportional to the wait |
| Partial | Some data arrived, some failed or is still coming | Show what arrived, mark what is missing, retry the missing part only |
| Error | The request failed or input is invalid | Say what happened, why if known, and the next step |
| Success | An action completed | Confirm in place, near where the action happened |
| Offline | The connection is gone | Keep what is readable, say what will and will not work, queue safe actions |
| No permission | The person may not see or do this | Say so and who can grant it; never a blank page |
| Stale | Data on screen is older than its source | Say how old, offer refresh; never present it as live |
| Too much | Volume beyond the normal case | Paginate or virtualise; truncation keeps the full value reachable |

1. The three empty states are different states with different copy. A single "No data" for all three is a defect.
2. Empty states sit in the same box and rhythm as the filled view (`PATTERNS.md`).
3. Nothing fake fills an empty or deferred slot: no invented numbers, charts or names.

## Loading by duration

| Expected wait | Treatment |
|---|---|
| Under about 1 second | No indicator beyond the control's own pending state; the person keeps their flow of thought |
| About 1 to 10 seconds | A skeleton shaped like the content, or a spinner where the shape is unknown |
| Over about 10 seconds | Determinate progress with what is happening, and a way to cancel or leave it running |

1. Reserve the space of content that has not arrived; nothing jumps when it lands.
2. The timing of skeletons and their fade belong to `MOTION.md`; do not restate them here.
3. Optimistic updates for actions that almost never fail and can be reverted; on failure, roll back visibly and
   say so.

## Actions and forms

1. Every async action has four outcomes designed: pending, success, failure, and the person leaving mid-way. A flow
   that designs only success ships the other three by accident.
2. Input survives every failure and every way back; nothing the person typed is lost to an error state.
3. How fields are labelled, validated, announced and focused on error is decided in `UX-ACCESSIBILITY-FORMS.md`;
   what an error message says is decided with `design-ux-copy`. This file only decides that the state exists and
   what the person can do from it.

## Offline and partial

1. Decide per action what offline means: readable from cache, queued for later, or refused. Write the decision down.
2. Queued actions are visible as pending and reconcile when the connection returns; a conflict is shown, never
   silently overwritten.
3. A partial failure retries only the part that failed and keeps the rest on screen.

## Before you finish

- Every view in scope has each reachable state as a frame or a written line.
- First use, cleared and no results are three different states with three copies.
- Loading treatment matches the expected wait; space is reserved.
- Every async action has pending, success, failure and abandon designed; input survives every failure.
- Offline behaviour is decided per action; partial failure keeps what arrived.
- No fake content fills any state.
