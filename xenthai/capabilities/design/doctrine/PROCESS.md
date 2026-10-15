# Design process

Implements: fuera del playbook (X9)

## Which medium

| Situation | Medium | Why |
|---|---|---|
| New surface, nothing runs yet | Mockup plus written spec, reviewed before any code | Code written before the loop reads generic, and rework costs more than the loop |
| Surface already runs | Change it live, show it in the preview with screenshots | A static mockup of a running surface drifts from the real one the moment it is drawn |
| Direction is open | Several variants in one mockup, owner picks | A choice made on pixels beats a choice made on adjectives |
| One property of a running surface (a colour, a gap) | Edit it, screenshot it, done | A loop for a one-line change is ceremony |

Decide the medium from this table. Ask the owner only when the surface is half-built and neither row fits.

## Variants

1. Offer variants only when the owner has not named a direction. A named direction gets one mockup.
2. Label each variant by its idea, never "A" and "B" alone: "list + detail", "swipe deck".
3. The owner may pick a hybrid per breakpoint. The proven split: list plus detail pane on desktop, a swipe deck on
   phone. Build the mockup so each breakpoint frame can come from a different variant.
4. After the pick, delete the losing variants from the file. Two live designs in one contract is ambiguity.

## The loop

1. Mockup published (`MOCKUP.md`), reviewed through anchored comments (`REVIEW-LOOP.md`), republished to the same
   URL each round. Versions are v1 to vN in the Notas paragraph, never in new URLs.
2. The owner says "build it" or "constrúyelo". Nothing earlier counts: silence, a thumbs-up on
   one comment or "looks good" on one frame is not approval.
3. The approved mockup is the contract. Every later deviation is raised as a question, never decided in code.
4. A fact in the mockup that turns out false is a false promise: fix the mockup first, show the owner, then build.

## Before any code: the design-line spec and the motion audit

| Artefact | Holds | Exists when |
|---|---|---|
| Design-line spec | Tokens, header rule, surface recipes, pills, typography, motion tokens, reduced-motion policy, per-page checklist | Always before the first design PR of a product; extended, never re-argued, afterwards |
| Motion audit | Every transition, animation and unanimated swap of the pages in scope, each judged by the frequency gate (`MOTION.md`) | Before any motion is created |

1. The spec lists every literal value the code uses today (durations, radii, easings) with a count, then replaces the
   literals by named tokens. A token with no replaced literal is speculation.
2. The audit is read-only and produces a table: location, what moves, how often it fires, verdict (keep, tokenise,
   remove, add). Leaving a swap still is a valid verdict and is recorded.
3. Both are documents the owner can comment on. The same loop applies.

## PR order

1. Base tokens and primitives first: colours, radii, durations, easings, reduced-motion policy, the shared recipes.
2. The new surface second.
3. Then one PR per existing page, in the order of how often people open it.
4. A page PR changes that page only. A token it needs that does not exist goes back to the base PR, never inline.
5. One gate at the end of the whole sequence, not per PR milestone. Fix rounds are scoped to the touched package.
6. Every design PR body carries screenshots (`PROOF.md`) and the commands that ran.

## Before you finish

- The medium was chosen from the table, not from habit.
- New surface: approved mockup plus spec plus motion audit exist before code.
- The owner's explicit "build it" is on record, with its date.
- PR order is tokens, surface, pages; each page PR touches one page.
- Losing variants are gone from the contract.
