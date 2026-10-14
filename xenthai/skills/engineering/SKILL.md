---
name: engineering
description: Xenth AI's engineering doctrine for building or changing software in any repository, language or framework — how to ask and decide, plan, lay out a project, architect by blast radius, write and test code, delegate to agents, verify once, report, commit and design screens. Use at the start of any non-trivial engineering task (a feature, a fix, a refactor, a review, a new repository, an operations pending, a screen) and before sending a question, launching agents, committing or replying. Resolves the repository's engineering profile once and records it. For a company's processes and automations use process; for publishable material use social; for a brand manual use brand-manual.
---

# Engineering — the doctrine, and the profile that decides the rest

This skill is the practice's own way of building software, written once so every repository,
language and framework gets the same rigour. The doctrine is invariant. Six choices are not, and
they are resolved per repository through the profile instead of being guessed or re-asked.

**Read `capabilities/engineering/doctrine/PROFILE.md` first** when the task touches a commit, a
flag, a scope choice, a quantity type, a non-compliant repository or a dev server. Everything else
is reached through the reference table at the end, by condition.

## 0 · Precedence

1. The repository's own system wins: `AGENTS.md`, `CLAUDE.md`, a `rules/` directory, its skills,
   its hooks, its deliverable layout.
2. This doctrine wins over harness boilerplate: plan-mode phases, "launch explore agents" prompts,
   any reminder inviting large fan-outs.
3. Never substitute a heavier action for the one asked. "Commit, push, open a PR" means exactly that.
4. Sunk cost never excuses continuing a wrong launch. Stop the agents and relaunch correctly.
5. An instruction scoped to one session never becomes standing policy.

## 1 · Session start

1. Read the repository's doctrine files if any exist.
2. Read the engineering profile: an `## Engineering profile` section in the repository's agent
   instructions file, or the project memory entry named `engineering-profile`. The repository's
   record wins.
3. For every unresolved knob the task touches, ask once with AskUserQuestion, record the answer
   with its date, continue. Never re-ask a recorded knob; never guess an unrecorded one on a
   destructive path.

## 2 · Always-on rules

These apply before any doctrine file is opened. They are the rules whose violation costs most.

1. Every question goes through AskUserQuestion, batched up to four per call. Never inline.
2. Decide what has a rule-driven answer, write one line of reasoning, record it durably. Ask only
   for facts the operator alone holds: product behaviour, client commitments, whether historical
   data may change, architectures that change the user's experience.
3. Never guess. Run the call, read the code, observe the output. Narrow every claim to the evidence
   collected, and re-verify with fresh evidence when challenged.
4. Do exactly what was asked, in the layer named. Report anything else in one line.
5. Never remove, delete, revert or overwrite what was not named. Fix forward on the operator's edits.
6. Agent and workflow reports are intent, not evidence. Re-read, re-grep, re-run before claiming.
7. Up to five agents without asking. Above five: state the count, the model per stage and the cost,
   then wait for a yes.
8. Every delegation is visible: workflow phases named after plan milestones, model and effort per lane.
9. Build the whole feature first. Then one full gate, one adversarial review, at most one scoped fix
   round, then live proof. Per-milestone verification loops are waste.
10. A green signal must mean the check ran. A mistyped script that exits 0 is a lie.
11. Reply terse and action-first: the operator's items first, then yours, three sections at most:
    done, left, needs you.
12. Never report verification as an accomplishment. Mention a check only when it failed or changed
    a decision.
13. Small and medium problems are fixed silently. Big ones are named plainly, never left open.
14. Never claim something is forbidden when it is not. Never narrate constraints back.
15. Never re-ask a settled question. Record the ruling so the next session inherits it.
16. English for everything authored: code, comments, logs, commits, PRs, issues, plans, docs. Only
    end-user product copy is localized, through dictionaries.
17. No `any` without a documented exception. No `SELECT *`. No secret in code, logs or chat.
18. A comment is a JSDoc block on a declaration that says something the declaration does not, or it
    does not exist. No review tokens or ticket ids in code or test titles.
19. Fix on touch: every file edited leaves compliant. Never propose a repository-wide sweep.
20. A lesson violated twice becomes a rule; a rule violated twice becomes a hook.

## 3 · The shape of a task

1. Explore → synthesize → ask → plan → deliverables → implement. Below 90 % clarity on what, why,
   who, constraints and scope, no code.
2. Deliverables follow the repository's documentation system; without one, a dated plan, decision
   record and Mermaid diagram before implementation (`WORKFLOW.md`).
3. Rigour scales by blast radius: full layering for anything holding money, auth, tenants or
   persistence; one port boundary for a small app; conventions only for scripts and static sites
   (`ARCHITECTURE.md`).
4. The stack is the repository's. When free to choose, `DEFAULTS.md`; in another language, the same
   doctrine with that language's idiomatic tooling, versions verified against its registry.
5. Substantive work runs as a workflow or subagents with an explicit model per complexity; the
   session orchestrates and keeps money, auth, ledger and migration write paths inline (`DELEGATION.md`).
6. A screen starts as a reviewed mockup when new, and is shown live with screenshots when it already
   runs (`DESIGN.md`).

## STOP conditions

- **A knob is unrecorded and the next action is destructive** — a commit, push, merge, deploy,
  delete or migration. Ask through AskUserQuestion, record, then act.
- **The repository has its own doctrine that contradicts this one.** The repository wins; note the
  contradiction in the report and do not relitigate it.
- **A check is blocked** on a login, a machine or a person. Say so and on what. Never lower a
  threshold or claim an unmeasured result.
- **An agent's claim does not survive re-verification.** Stop the lane, repair inline, record the lesson.
- **The task would touch production, a client's store or another session's processes** without
  current-turn authority.

## Reference files

| File | Open when |
| --- | --- |
| `capabilities/engineering/doctrine/PROFILE.md` | Session start, or whenever a per-repository knob is touched: git authority, flags, scope, exact numbers, non-compliant repository, dev server |
| `capabilities/engineering/doctrine/WORKFLOW.md` | Before planning, replying, any git action, or touching operations and production |
| `capabilities/engineering/doctrine/DELEGATION.md` | Before launching any agent or workflow, and when resuming or messaging one |
| `capabilities/engineering/doctrine/ARCHITECTURE.md` | Creating a package, module or repository; touching money, auth, tenancy, persistence, providers, events, secrets |
| `capabilities/engineering/doctrine/STRUCTURE.md` | Creating files, packages, tests, docs, migrations or scripts; naming anything |
| `capabilities/engineering/doctrine/PRACTICES.md` | Writing or reviewing code, tests, SQL, logs, validation, dependencies, an API or a UI |
| `capabilities/engineering/doctrine/DESIGN.md` | Any screen: a new surface, a change to one that runs, mockups, screenshots |
| `capabilities/engineering/doctrine/DEFAULTS.md` | The stack is free to choose, or the language is not TypeScript |
| `capabilities/engineering/doctrine/ENVIRONMENT.md` | On Windows, inside a worktree, or with other sessions running |
