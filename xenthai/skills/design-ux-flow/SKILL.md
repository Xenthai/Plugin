---
name: design-ux-flow
description: Use when the users and their job are known and the next decision is structure — mapping a journey, organising content and naming navigation, writing a task flow with its branches, deciding what to show now and what to disclose later, setting the reading order of a view, sketching a wireframe, or listing every state a view can be in (empty, loading, error, partial, success, offline) — and before a mockup of a new surface. For who the users are and what they need use design-ux-research; for spacing, alignment and breakpoints use design-ui-layout; for the words on screen use design-ux-copy; for judging an existing flow with users use design-ux-evaluate.
---

# Design UX flow — structure and states before pixels

This skill decides how a product is organised and how a person moves through it to finish a job: the journey, the
information architecture, the task flows, the navigation, what is disclosed when, the reading order of each view,
and every state each view can be in. It works from the brief of `design-ux-research` and hands a settled structure to
the mockup of the `design` loop. Visual spacing, alignment and breakpoints are `design-ui-layout`'s; words are
`design-ux-copy`'s.

## Procedure

1. **Read the brief.** Job stories, findings and the users' vocabulary. No brief and no records: route to
   `design-ux-research`, or record every structural choice as an assumption the owner accepts.
2. **Map the journey** for each job in scope, inside and outside the product, and rank the moments to change
   (`capabilities/design/doctrine/UX-FLOW.md`).
3. **Settle the structure.** Inventory the content, name it in the users' words, group it by how they look for it.
   When the grouping is disputed or new, test it with a card sort or tree test instead of arguing it.
4. **Write each task flow** from entry to outcome with every branch: failure, cancel, back, return later. Cut each
   avoidable step; move irreducible complexity into the system.
5. **Set navigation and URL state**: where am I, where can I go, how do I get back, answered on every view.
6. **Decide disclosure per view** from frequency of use: visible, one action away, or a detail view.
7. **Order each view** by importance to the job; one primary action; DOM order equals reading order.
8. **Fill the state matrix** for every view in scope (`capabilities/design/doctrine/UX-STATES.md`).
9. **Choose the artefact.** Structure still open: a wireframe sequence through the owner's comment loop. Structure
   settled: go straight to the mockup (`capabilities/design/doctrine/MOCKUP.md`).
10. **Hand over** the flows, the tree, the state matrix and the open assumptions as part of the mockup's brief.

## Always-on rules

1. Labels use the users' words from research, never the organisation's or the codebase's.
2. Every item has one home in the tree.
3. Every flow has a way back that keeps the person's input.
4. Shareable view state (filters, tab, page, selection) lives in the URL; places are links, actions are buttons.
5. Never cap navigation at a magic number. Memory limits apply to what must be remembered, not to what is visible;
   cut rare options to a lower level instead of removing needed ones.
6. Follow the conventions people already know from other products unless research shows they fail here.
7. Hidden content always has a visible cue. Never more than two levels of disclosure; never hide what the current
   task requires or an error.
8. Reversible destructive steps get an undo; a confirmation only for what cannot be undone (`PATTERNS.md`).
9. First use, cleared and no results are three states with three copies.
10. Nothing fake fills an empty or deferred slot.
11. A view is not designed until each reachable state has a frame or a written line.

## STOP conditions

- **The users or the job are undecided** and the owner will not accept the structure as an assumption. Route to
  `design-ux-research`.
- **The grouping is contested** between the owner and the evidence. Propose a tree test; do not settle it by taste.
- **A flow needs a decision only the business can make** (what happens to a refund, who may approve). Ask the owner
  through AskUserQuestion before drawing either branch.
- **The question is spacing, alignment or a breakpoint.** Use `design-ui-layout`.
- **The structure is settled and approved.** Stop wireframing; the next artefact is the mockup.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UX-FLOW.md` | Mapping a journey, building or testing the content tree, writing a task flow, setting navigation, disclosure, reading order, or drawing a wireframe |
| `capabilities/design/doctrine/UX-STATES.md` | Listing the states of any view: empty, loading, error, partial, success, offline, no permission, stale, high volume |
| `capabilities/design/doctrine/PATTERNS.md` | The surface resembles an approved list, decision card, action bar, toast or phone deck, or a destructive step needs its treatment |
| `capabilities/design/doctrine/MOCKUP.md` | The structure is settled and the next step is the mockup |
| `capabilities/design/doctrine/UX-RESEARCH.md` | A structural choice lacks evidence and needs a quick study before it is drawn |
