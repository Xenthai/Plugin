# Engineering profile

Implements: fuera del playbook (X9)

Doctrine is invariant; these knobs are not. Each was answered "depends on the project" when this doctrine was written.
Resolve once per repo, record, never re-ask.

## Where the profile lives

1. the project memory entry named `engineering-profile` (frontmatter `type: project`), linked
   from `MEMORY.md`. One line per knob: `knob: answer (YYYY-MM-DD, who)`.
2. If the repo's `AGENTS.md` or `CLAUDE.md` states a knob, that record wins and is not duplicated.
3. A standing grant the operator gives in chat is recorded with its
   exact scope and date, quoted. It never widens by inference.

## Protocol

1. At session start read the profile. For each knob the current task touches and the profile
   does not record, ask with AskUserQuestion. Batch up to four knobs in one call.
2. Offer the options below verbatim, recommended first. Add "Other" implicitly (the tool does).
3. Record the answer before continuing. Detectable knobs are detected, never asked.
4. A knob is re-asked only when the operator says the answer changed, or the repo's record changed.

## Knobs

| Knob | Options (recommended first) | When to resolve |
|---|---|---|
| Git authority | Commit at green milestones; push, PR, merge and deploy each on instruction · Nothing without current-turn instruction · Commit, push and open ready PRs autonomously; merge and deploy on instruction · Standing merge grant with stated scope (green CI only, named PRs, time window) | Before the first commit |
| Feature flags | None: no rollout flags, dual-read, shadow-write or cutover toggles; rollback is backup plus atomic cut · Dark-launch behind one env variable until live proof exists, plus fail-closed kill switches on new money or destructive paths, both removed or justified once proven · Documented flags accepted when each has a decision record and an owner | Before introducing any flag or env toggle |
| Scope stance | Ambitious when the operator chooses between options (recommend and price the complete one); literal when the operator names a fix, file or layer · Always literal · Always complete, stating what was widened | At the first task where options exist |
| Exact numbers | Integer minor units end to end: bigint or language equivalent, decimal-integer string on the wire, guard script blocks casts · Integer units in a plain number type within a proven safe range; bigint for ledgers · Rule applies to money only | Before introducing a quantity type |
| Non-compliant repo | Fix on touch and flag nearby violations as follow-ups, never sweep · Follow the repo as it is, raise doctrine only when asked · Propose a migration plan to doctrine before feature work | At the first touch of a repo that violates doctrine |
| Dev server | Claude starts the preview and attaches screenshots as proof · The operator runs the dev server; Claude health-probes only and never starts, kills or restarts the operator's processes | Before the first preview |

## Detected, never asked

| Fact | Detect from |
|---|---|
| Deliverables system | Repo docs: a decisions log, spec, roadmap, or `docs/plans/`. None found → default bundle in `WORKFLOW.md` |
| Test placement | Existing `__tests__/` beside code, or `<pkg>/test/`; match the sibling package |
| Migration tool and naming | Existing migration directory and its runner script |
| Doc numbering | Existing decision, research or debt identifiers; next number claimed early when sessions run in parallel |
| Package manager, formatter, test runner | Lockfile, config files, `package.json` scripts; never the defaults table while the repo has one |
| Branch base and PR target | Repo docs, open PRs, branch protection; never a framework default |
| Commit message style | Last twenty commits; Conventional Commits when free |

## Recording template

```markdown
---
name: engineering-profile
description: Resolved per-repository knobs of the engineering doctrine
metadata:
  type: project
---

- git-authority: commit at green milestones; push/PR/merge on instruction (2026-10-13, operator)
- feature-flags: dark-launch + kill switch (2026-10-13, operator)
- scope-stance: ambitious when choosing, literal when naming (2026-10-13, operator)
- exact-numbers: integer minor units end to end (2026-10-13, operator)
- non-compliant-repo: fix on touch (2026-10-13, operator)
- dev-server: Claude runs the preview (2026-10-13, operator)
- standing-grants: "merge the PRs when they are ready" = green CI only (2026-10-05, operator, quoted)
```

## Before you finish

- Every knob this task touched has a recorded answer, dated, with source.
- No knob was guessed on a destructive path (commit, push, merge, deploy, delete, migrate).
- No standing grant was widened beyond its quoted scope.
