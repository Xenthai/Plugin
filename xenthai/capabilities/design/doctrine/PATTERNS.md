# Approved interface patterns

Implements: fuera del playbook (X9)

Patterns an owner has approved for a product that triages items awaiting a human decision across messaging channels.
Start from them for any similar surface; the owner's comment on the live mockup still outranks them.

## Lists

| Part | Rule |
|---|---|
| Row | One action glyph tile plus two lines: the action as a verb line, then a preview line |
| Identity | Once, in the group header; never repeated per row |
| Row chrome | No time, no chips. Hairline between groups, none between rows of a group |
| Tabs | Named by intent ("To approve", "Decided"), each with an icon; a count lives in a badge only |
| Empty state | Same box, same rhythm as a filled list, one line of text |

## Decision card

| Part | Rule |
|---|---|
| Header | Avatar with the channel badge on its corner; one meta line with icons (who, where, when) |
| Details | An (i) button opens a popover of icon rows, channel first; icon-only buttons all carry tooltips |
| Conversation | Only when one exists: rendered as the channel's native chat, incoming left, outgoing right, no per-bubble times |
| Sender line | Inside the outgoing bubble, with the sending agent's icon |
| Reason | A note box below the thread with an icon; when no conversation exists the agent line heads the note box |
| Publication | The network's native post preview; the media is a labelled slot, never a stock image |
| Checklist | Row = icon, text, checkbox at the right. A destructive item is unchecked by default |

## Action bar

| Action | Treatment |
|---|---|
| Approve or send | Primary green, the action as the label ("Send reply", never "OK") |
| Edit | Yellow |
| Discard | Red with a trash icon. The word "reject" never appears |
| Later | Neutral, only where the product has a defer concept |

1. The primary action dominates; one tap commits.
2. Keyboard shortcuts mirror the bar and animate nothing (`MOTION.md`).

## Feedback

1. Toasts float over the layout and never push it. At the top. Coloured by outcome with an icon (green done, red
   failed, neutral info).
2. Undo window is 5 s after a decision. A second decision inside the window commits the first immediately.
3. A warning is a full soft fill, not an outlined box; its link takes the icon's colour.
4. Never an alert dialog for ephemeral feedback.

## Phone: the swipe deck

| Part | Rule |
|---|---|
| Gesture | Right approves, left discards, up defers |
| Card box | One box aligned to the same gutters as the controls |
| Controls | Four equal circles floating over the card, fading at the card's edge |
| Text | Compact; no per-bubble times |
| Decided list | Inside the same card box, same rhythm |
| Empty state | Inside the same box |

1. The circles are the full path; a swipe is a shortcut to them, never the only way.
2. A swipe commits past a distance threshold or a velocity threshold, whichever is reached first.

## Rhythm and consistency

1. One spacing rhythm and one radius for every stacked box on the page. A different radius for a nested box is a
   defect unless it is the parent radius minus the padding.
2. A surface the owner approved in one frame is reused, not redrawn, in another: the phone's decided card is the
   desktop's decided card at narrower width.
3. Group by the way data really is. Never invent a grouping for flat data.

## Failure modes

| Failure | Prevention |
|---|---|
| Identity repeated in every row, the list reads as noise | Identity in the group header only |
| Icon-only button with no tooltip | A tooltip on every one, with the action's verb |
| Toast shifts the page down | Toast is positioned over the layout |
| Pinned action bar covers editable content | Show the payload before the decision; never pin a decision over editable content unasked |
| Phone deck and desktop list look unrelated | The same card components, different containers |

## Before you finish

- Rows carry one glyph and two lines; identity appears once per group.
- Every icon-only button has a tooltip.
- Action bar: green primary labelled with the action, yellow edit, red discard with trash, never "reject".
- Toasts float at the top; undo is 5 s and a second decision commits the first.
- Phone: gestures, four circles, one card box, empty states inside it.
- One spacing rhythm and one radius across stacked boxes.
