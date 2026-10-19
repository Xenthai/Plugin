---
name: hub-atlas
description: Turns a code repository into the technical atlas of a system — 8 to 12 diagrams with file-and-line evidence (overview, frontend, backend, code organisation, data model, entity states, critical business flows, authentication, payments or core processes, CI/CD) plus a list of findings (risks, debt, questions to confirm) — ready to publish as an engineering hub. Use when someone asks for architecture diagrams, to document the system, to understand a repo, for technical onboarding, a map of the code or an engineering hub, or when a newcomer needs to understand how a product is built, even without asking for diagrams. Before hub-build for an engineering hub. For how the practice itself writes code use engineering.
---

# Hub atlas

Turns a repository into verifiable diagrams and findings useful to the team. **Archify** is the
recommended diagram tool — diagrams validated against evidence in the code — and is a third-party
skill this plugin recommends but does not ship. Without it, diagrams are Mermaid or hand-drawn SVG,
following the same selection.

## Step 0 — Archify, asked once

Check whether Archify is installed (`~/.claude/skills/archify/` or the project's `.claude/skills/`).
If it is not, ask the operator once:

> Para diagramas validados contra el código se recomienda la skill Archify (MIT). ¿La instalo?
> `npx skills add tt-a1i/archify -g`

Run the command only on a yes. On a no, or with no network, continue with Mermaid/SVG and say so in
the delivery. Never install anything else without permission.

## Step 1 — Identity and the repo's own rules

- Record the commit (`git rev-parse HEAD`), the origin url **without credentials**, and whether there
  are uncommitted changes. Every diagram cites that commit.
- Read `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md` and `docs/ARCHITECTURE.md` (or equivalents) first.
  Their rules win: if they say the AI makes no commits, make none; zones that are not to be touched
  go into the findings.

## Step 2 — Map the system (one broad pass)

With an exploration agent or by reading: apps and their framework, databases, storage, queues,
external integrations, authentication and permissions, domain libraries, the main business flow,
CI/CD and deployment. Ask for file paths for every statement and **never** copy secrets, `.env`
values, hosts, accounts or bucket names.

## Step 3 — Choose the diagrams

From `capabilities/hub/doctrine/DIAGRAMS.md`, choose 8–12 covering system, data, 2–4 business flows,
and delivery. Never one per module; group, and leave the detail to cards.

## Step 4 — Generate in parallel

1. Write the shared brief from `capabilities/hub/doctrine/AGENT-BRIEF.md` (repo, commit, output
   folder, language, evidence and forbidden-information rules, how to validate, what to report).
2. Launch one agent per diagram, in parallel and in the background, each with its type, topic,
   starting files and what goes to cards. Each validates its diagram (Archify: `finalize` until it
   passes) and looks at its own screenshot.
3. While they work, do not duplicate their exploration.

## Step 5 — Review

- Look at the screenshot of **every** diagram: overlapping, clipped or unreadable text is fixed
  before going on.
- Collect what each agent reported as differences with the documentation, unconfirmed or out of
  scope. The most valuable findings are there ("table X is written by no code in the repo").

## Step 6 — Findings

Write them per `capabilities/hub/doctrine/FINDINGS.md`: to confirm, risks and debt, each with where it
was seen. No adjectives, no alarm; a finding is a verifiable fact plus the question it opens.

## Step 7 — Images for the hub

Interactive viewers can fail inside an artifact (scroll or drag that does not respond). Take an
image of each diagram:

```bash
node "${CLAUDE_PLUGIN_ROOT}/capabilities/hub/engine/capture.mjs" <diagrams-folder> hubs/ingenieria/img [--chrome <path>]
```

The diagram canvas at 2x, light theme, without the viewer's controls. Then go to `hub-build`: one page
per diagram with its `figure` (image + interactive in `d/`), "¿Qué hay que saber?" (3–4 facts),
`[por confirmar]` notices and "¿Dónde está en el código?" (`paths`). A "¿Cómo trabajamos?" page with
the repo's rules goes first, the Hallazgos page last.

## Step 8 — Delivery

No commits unless asked. If the environment requires a clean tree, exclude the working folder with
`.git/info/exclude` (local, unversioned) and say so. In the reply: the link to the hub or the files,
the top 3–5 findings, what could not be verified, and whether Archify or Mermaid/SVG was used.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability hub --why "engineering atlas at commit <short sha>"
```

## STOP conditions

- **The repository's rules forbid what a step needs** (no agents, no files outside a folder). Follow
  the repo, and say which step was cut.
- **A diagram would need a secret, a host or customer data to be accurate.** Draw it without them and
  record the gap as `[por confirmar]`.
- **No repository is reachable.** Ask for it; an atlas from documentation alone is not an atlas.
- **The request is how to write or review code in this repo.** That is `engineering`.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/hub/doctrine/DIAGRAMS.md` | Choosing the diagrams (Step 3) |
| `capabilities/hub/doctrine/AGENT-BRIEF.md` | Launching the diagram agents (Step 4) |
| `capabilities/hub/doctrine/FINDINGS.md` | Writing findings (Step 6) |
| `capabilities/hub/doctrine/PITFALLS.md` | Before handing the images to `hub-build` |
