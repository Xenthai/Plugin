# Flow: journeys, structure, navigation and reading order

Implements: fuera del playbook (X9)

A flow is designed before a screen is drawn. Pixels make a structure look settled; a wrong structure drawn well is
approved and built. Every artefact here is written from the job stories and observations of `UX-RESEARCH.md`, never
from a taste for a layout.

## Journey map

1. One map per job and segment, from the trigger that starts the job to the outcome that ends it, including the parts
   outside the product (a call, a spreadsheet, a wait for someone).
2. Each stage carries: what the person does, what they need to know, the touchpoint, where it breaks, the evidence.
3. A pain point without a participant code behind it is marked as an assumption.
4. The map ends in a ranked list of moments to change, ordered by how often they occur times how much they cost.

## Information architecture

1. Name things in the users' words. Research notes carry the vocabulary; an internal or technical name on a label
   is a defect.
2. Group by the way people look for things, which is often not the way the organisation is built.
3. Test the grouping, do not argue it:

| Question | Method | Pass mark |
|---|---|---|
| How do people group these items, and what do they call the groups | Open card sort, about 15 participants | Clusters agree across most participants |
| Do people place items in the groups we chose | Closed card sort | Each item lands in its intended group for most participants |
| Can people find things in the proposed tree, with no visual design | Tree test with tasks, at least 50 participants for numbers | Direct success per task high, and every low task explained |

4. Prefer a broad, shallow tree with clear labels over a deep one. Depth costs a guess at every level; a guess
   that fails hides everything below it.
5. Every item has one home. Cross-links are allowed; duplicate homes are not.

## Task flows

1. Write each flow as a numbered list or a diagram of steps and decisions, from entry point to outcome, with every
   branch: the happy path, the validation failure, the system failure, the cancel, the return later.
2. Count the steps and the decisions on the happy path. Each removable step is removed; each decision the system can
   make from data it already has is made by the system.
3. Complexity that cannot be removed is moved to the system, not to the person: defaults from history, inferred
   values, prefilled fields. Someone always carries the irreducible complexity; it should be the software.
4. Every flow has an exit and a way back. Browser back and the platform's back gesture return to the previous state
   without losing input.
5. Destructive steps follow the pattern the product already approved; where none exists, an undo window beats a
   confirmation dialog, and a confirmation is reserved for what cannot be undone (`PATTERNS.md`).

## Navigation

1. The person can always answer three questions: where am I, where can I go, how do I get back. The current
   location is visibly marked in the navigation.
2. Follow the conventions people learned on other products: logo returns home, search where search usually sits,
   account menu at the trailing edge. A novel navigation pays a learning cost every visit.
3. View state people would share or return to (filters, tab, page, selected item, open panel) lives in the URL.
4. Links are real links, so open-in-new-tab and copy-link work; buttons are for actions, links are for places.
5. Breadcrumbs only where the hierarchy is three levels or deeper and people arrive mid-tree.
6. The number of primary destinations is set by the content and its frequency of use, not by a fixed cap. Short-term
   memory limits apply to things a person must hold in mind, not to items they can see on screen.
7. More choices on one screen cost more decision time. Highlight the frequent path and push rare options one level
   down, rather than cutting options people need.

## Progressive disclosure

1. Show what most people need for the current step; put the rest one deliberate action away.
2. Decide the split from data: what is used in most sessions stays visible, what is used rarely moves behind
   "more", "advanced" or a detail view.
3. Hidden content carries a visible cue: a labelled control, a count, a peek of the next item. Content with no cue
   is treated as absent.
4. Two levels at most. A third level of disclosure means the structure is wrong.
5. Never hide something required to complete the current task, or an error inside a collapsed section.

## Reading order and grouping for meaning

1. Order each view by importance to the job: the fact the person came for first, near the top and the leading edge;
   metadata and secondary actions trail.
2. Within a row, the identifying content leads and actions trail.
3. One primary action per view. When secondary actions pass three, group them in a menu.
4. Grouping states a claim: things placed together are read as belonging together. Group by meaning first; the
   spacing and alignment that express it belong to `design-ui-layout`.
5. DOM order equals visual order and reading order. A layout that reorders visually but not in the markup breaks
   keyboard and screen-reader paths.
6. The first screenful is a table of contents, not the whole book: a short view linking deeper beats a long view
   showing everything at one level.

## Wireframes

1. A wireframe settles structure and flow only: which blocks, in which order, with which states. Grey boxes, real
   copy keys or real draft text, no colour, no final type.
2. Use one when the structure is undecided. When structure is decided, go straight to the mockup (`MOCKUP.md`);
   a wireframe of a settled structure is ceremony.
3. Each wireframe frame shows one step of a task flow and links to the next, so the owner reviews a sequence, not a
   gallery. It runs through the same comment loop as a mockup.
4. Every state of `UX-STATES.md` the step can reach has a frame or a written line.

## Before you finish

- Each journey and flow traces to a job story and observed evidence.
- Labels use the users' vocabulary; the tree was tested, not argued.
- Every flow lists its branches, exits and way back; avoidable steps are gone.
- Location is always marked; shareable view state is in the URL; links are links.
- Disclosure is driven by frequency of use, cued, and at most two levels deep.
- DOM order matches reading order; one primary action per view.
