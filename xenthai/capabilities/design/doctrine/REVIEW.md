# The combined review

Implements: fuera del playbook (X9)

The critique pass before the owner looks, on a mockup round, a screen, a diff or a pull request. Lenses
are read-only agents on a cheap model (`DELEGATION.md`); their findings go to the writer, not to the owner. The
owner's comment loop starts after this pass (`REVIEW-LOOP.md`). Correctness, tests and security belong to the
engineering review: name one once and drop it.

## 1 · Resolve the scope

| Target | Resolves to |
|---|---|
| A screen, flow or mockup | Every state of it: empty, loading, error, two data volumes, each recorded breakpoint, both themes |
| No target, branch ahead of the merge base | Merge base to `HEAD` plus uncommitted and untracked files; report both counts |
| No target, only a dirty tree | The uncommitted and untracked files |
| A named branch, ref or range | Branch: three-dot against the merge base. Range: the dots the user wrote |
| A pull request | Its head fetched into a remote-tracking ref and read there with `git show` |

1. Check the merge base before the working tree, or one stray edit hides a whole branch.
2. Nothing to review (clean tree, nothing ahead): gather branch, last commit SHA and subject, any open pull request,
   and ask through AskUserQuestion. Never fall back to the last commit unasked.
3. Mid-rebase, mid-merge or mid-cherry-pick, `git diff` returns something else. Detect it with
   `git rev-parse --git-path` and stop.
4. Exclude lockfiles, snapshots, build output, generated sources, vendored code and binaries, and name them. Keep the
   code that references a new font or image.
5. A changed file is evidence, not the subject. Expand to its consumers one hop, two for tokens, theme values and
   shared primitives; search a token by name. Review at most five: route and layout entries first, then by importer
   count, then nearest. State how many were not expanded.
6. A screen scope too large to inspect narrows to one complete flow; state what it excluded.
7. Read-only, checkout included: `git fetch` is allowed; checkout, switch and stash are not. A rendered review of a
   pull request uses a temporary worktree, removed afterwards.

## 2 · Recon and declared intent

1. Name the stack, tokens, dictionaries and breakpoints; every fix uses the project's own idiom.
2. Read what the project wrote about its interface. A documented convention changes where a finding is reported,
   never whether: when a guideline or shared token causes it, report it once against that source.
3. Read the intent: the pull request title and body, commit subjects, the spec, the approved mockup version and every
   ruling the owner made. A finding the owner already ruled on is dropped.

## 3 · Read the removed lines

Regressions are invisible after the change. Search only deleted lines, then read each hunk whole. A removal is a lead,
routed to its lens, and becomes a finding only when that lens confirms nothing replaced it.

| Removed | Lens |
|---|---|
| Accessible names, roles, live regions, alt text, labels, native elements, focus styles, `tabindex` | `design-ux-accessibility` |
| A reduced-motion query, a duration or curve token | `design-ui-motion` |
| A token swapped for a literal or a lighter step, a type or contrast token | `design-ui-system` |
| Logical properties, a breakpoint, an overflow or wrap rule | `design-ui-layout` |
| Tabular figures, truncation with a way to the full value, a state style (hover, disabled, selected) | `design-ui-polish` |
| A user-facing string or dictionary key | `design-ux-copy` |
| A step, a confirmation, an undo, a back path | `design-ux-flow` |

Equivalent replacements clear the lead: a label moved to visible text referenced by id, a role dropped because the
element became native, an outline replaced by a ring that still meets the focus rule, a literal replaced by a token
measuring the same, a string moved into the dictionary.

## 4 · Dispatch the lenses

Order, so foundations are not buried under polish: `design-ux-accessibility`, `design-ux-flow`,
`design-ui-layout`, `design-ui-system`, `design-ux-copy`, `design-ui-motion`, `design-ui-polish`.

1. One lens per agent per surface, never per finding. Each gets the scope block, the captured images (`PROOF.md`),
   the files at the reviewed ref, and the owner's rulings.
2. A lens returns location, rule, evidence and a proposed change. It never edits.
3. The lens owns the rule; this file owns cost, order and format. A lens that could not run is `Not reviewed`, named;
   its rules are not recreated from memory.
4. An issue two lenses see goes to the owner of the underlying rule; the other effect goes in its Why.

## 5 · Evidence

1. Every finding cites `path:line` at the reviewed ref, or the frame image and element for a mockup.
2. A visual claim needs a rendered capture; a code claim needs the source. A check that could not run is
   `Not verified`.

## 6 · Classify and order

Status, by what the diff touched (confirm with `git blame` against the base): `Introduced`, `Regression` (weakened
something that was correct), `Pre-existing`.

| Severity | Means |
|---|---|
| HIGH | Blocks a task, misleads, hides content or a control, risks data, or repeats across the product |
| MEDIUM | Harms comprehension, efficiency, adaptability or consistency |
| LOW | Isolated polish |

HIGH on sight once its lens confirms it: a control with no accessible name; keyboard
focus invisible or a path pointer-only; content clipped or unreachable at 320 px or 200 % zoom; text failing its
contrast pair; meaning carried by colour alone or by motion alone; motion ignoring the reduced-motion preference; a
destructive act with no confirmation, undo or distinct treatment; an error with no way out; truncation with no way to
the full value; a semantic colour used against its meaning. A `Regression` against one of these is always HIGH.

Order: HIGH-on-sight first, then severity, then reach; a token or shared component fix outranks one leaf. Propose the
cheapest fix that works, in this order: delete, use the platform, reuse an existing token or component, correct the
value, add. Proposing an addition where a deletion works is itself a finding.

## 7 · Consolidate

1. One root cause is one row listing every location.
2. At most fifteen `Introduced` and `Regression` findings. HIGH-on-sight ones are never cut; say how many the cap
   excluded.
3. `Pre-existing`: at most three, outside the cap and the verdict.
4. Never pad; no findings is valid.

## 8 · Hold the change to its intent

A screen review misses the incomplete change, because it only sees states that exist:

1. A new variant, size or theme applied to some states but not hover, focus, active, disabled, loading or selected.
2. A new component with no empty, loading, error, disabled or narrow-width state.
3. A new visible string with no key in both dictionaries.
4. A control added to one surface but not to siblings that carry its peers.
5. A build that differs from the approved mockup version.

Scope creep is not a finding.

## 9 · Output

1. **Scope block**: target, base ref and SHA, head ref and SHA, commit and uncommitted counts, files after exclusions,
   exclusions, surfaces expanded and not, intent sources read.
2. **Coverage**: one row per lens with the evidence inspected and a count, `Clear`, `Not reviewed` with the reason,
   or `Not reviewed: no evidence in the change scope`.
3. **Findings**: `Severity | Lens | Status | Location | Now | Change | Why`, one row per root cause. Why names the
   rule and the user impact. LOW rows may collapse to `path:line — issue` lines grouped by file. With none, write
   that there are no actionable findings.
4. **Pre-existing**, at most three, stated as not this change's responsibility.
5. **Verification**: each command or interaction and what it showed, split from what was `Not verified`.
6. **Verdict**: `Block` while any HIGH remains, otherwise `Approve`, which claims only the coverage reported.

`Block` returns the findings to the writer; the owner sees the surface after the fix and a fresh capture.
`Approve` hands the round to the owner's loop.

## Before you finish

- The scope is named with refs and SHAs, exclusions and unexpanded consumers stated.
- Removed lines were searched and each lead routed to its lens.
- Every lens ran read-only or is marked `Not reviewed`.
- Every finding has a status, a location at the reviewed ref and evidence of the right kind.
- Owner rulings dropped, systemic findings merged, HIGH-on-sight findings never cut.
- Missing states, dictionary keys and divergence from the approved mockup were checked.
- Nothing was checked out, edited or shown to the owner before a verdict.
