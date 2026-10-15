# Design and UI process

Implements: fuera del playbook (X9)

## Design first

1. A new surface starts as a mockup published as an artifact plus a written spec, reviewed by the operator
   before any code. Iterate on the operator's comments, v1 to vN, until the operator says build it. A UI built
   without the loop reads generic.
2. A surface that already runs is changed live: build it, show it in the preview with screenshots,
   iterate there. A static mockup of a running surface is the wrong medium.
3. Multi-variant mockups when direction is open: the operator chooses visually.
4. Every factual sentence in mockup copy is traced to code before the operator sees it. The operator approves layout and
   tone; the approved mockup becomes the contract, so a wrong fact becomes a wrong promise.
5. A design the operator hands over is a structural contract: list what each card holds, check alignment and
   centering, compare side by side before saying done.
6. Take the operator's layout words literally. "Text below the image" means directly below, not a network's
   reinterpretation of it.

## Skill stack

Route the design of a screen to `design`, which dispatches to its `design-ux-*` and `design-ui-*` skills; name the
ones in scope in every UI brief and have reviewers check against them. The harness's artifact-design and dataviz
skills apply to artifacts and charts. Use the component library's own tooling to search and reuse primitives before
building any.

## UX doctrine

1. The primary action dominates; one tap; fewest clicks; no explanatory chrome once the user knows
   the flow; less text; glanceable.
2. Show the payload before the decision. Never pin a decision button over editable content without asking.
3. Reading order beats a pinned action.
4. One place per action; no duplicate entry points for the same act.
5. URL state over local storage for anything reconstructible from ids.
6. Toasts for ephemeral feedback; never alert boxes.
7. Nothing fake: no placeholder charts, numbers or copy. A deferred element is an empty slot or a dash.
8. Model data the way it actually is; never impose artificial UI groupings on flat data.
9. Support and operator views are the real app, never a parallel shell. Why: parallel shells cost
   more than they save.
10. Motion: restrained in application UI, no decorative movement; marketing pages may loop
    noticeable animation when asked, and "animación" there means continuous keyframes, not transitions.
11. Breakpoints and sidebar rails follow the repo's recorded rule; never argue them again once set.
12. Brand and logo assets are SVG only.
13. One source of design tokens; never a framework that restates them.

## Proof

1. Visual proof in the same turn: a screenshot of the real surface, or a standalone demo for motion.
   The operator cannot see tool calls or the browser pane.
2. UI and design PRs carry screenshots in the body. The operator reviews from the PR page and will not check
   out branches.
3. Layout rules are reviewed by a person at each breakpoint; a budget or guard test covers what is
   mechanically decidable.

## Before you finish

- New surface: mockup plus spec reviewed before code. Existing surface: shown live.
- Every mockup sentence traced to code; the operator's layout words applied literally.
- Primitives reused; strings in dictionaries; nothing fake on screen.
- Screenshot in the turn and in the PR.
