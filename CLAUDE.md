# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A Claude Code **marketplace** with one plugin. `.claude-plugin/marketplace.json` at the repo root
points at `./xenthai`, which is the plugin itself (`xenthai/.claude-plugin/plugin.json`). This split
exists because the desktop app syncs a marketplace over HTTP and cannot clone a second repository —
so catalogue and plugin must live in one repo, catalogue at the root. `xenthai/test/ops.test.mjs`
asserts this shape; do not flatten it.

All real work happens under `xenthai/`. Read `xenthai/README.md` first — it explains what the
plugin does — then `xenthai/CONTRIBUTING.md` before writing any code in it.

## Git conventions

- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`,
  `refactor:`, `test:`, `chore:`, etc.), describing what changes.
- Branches: `feat/<description>`, `fix/<description>`, `chore/<description>`, `docs/<description>`,
  etc., matching the task.

## Commands (run from `xenthai/`)

```bash
npm install --ignore-scripts   # required flag — see "Dependencies" below
npm test                       # runs every test/*.test.mjs, discovered by glob
node test/<name>.test.mjs      # run a single suite, e.g. node test/hooks.test.mjs
node test/run.mjs <substring>  # run suites whose filename matches, e.g. node test/run.mjs doctor
npm run eval:skills            # node test/skill-eval.mjs — needs a `claude` CLI login, costs money, NOT part of npm test
npm run spike:render           # node test/spike/render-spike.mjs
```

Every CLI in `tools/` and `hooks/` answers `--help` and exits 0 doing it (e.g.
`node tools/doctor.mjs --help`, `node capabilities/social/engine/render.mjs --help`).

**Never edit `package.json`'s `test` script or add a suite there.** `test/run.mjs` discovers
`test/*.test.mjs` by glob specifically so parallel agents adding suites never race on one shared
file. A new test is a new file in `test/`, nothing else.

**`--ignore-scripts` is required, not optional.** Claude Code installs a plugin's dependencies this
way with a 60-second timeout, so any dependency needing a lifecycle script would install cleanly
here and fail only on a client's machine. This is why the plugin depends on `playwright-core` and
never on `playwright` (whose postinstall downloads a browser). Adding any new npm dependency needs a
stated reason.

## Architecture

### The three places code is allowed to live (from CONTRIBUTING.md's "vanilla" rule)

1. **Hooks** (`hooks/`) — because an instruction is followed ~99% of the time and a hook runs 100%,
   and "a journal with gaps is worse than no journal." Declared in
   `xenthai/.claude-plugin/plugin.json`:
   - `bootstrap.mjs` (SessionStart) — announces the bound company and plugin root, states the
     language rule.
   - `guard-company.mjs` (PreToolUse) — the only two vetoes in the plugin (see below).
   - `journal.mjs` (PostToolUse, PostToolUseFailure, SessionEnd, PermissionRequest) — records every
     tool call automatically.
2. **Where an exact answer exists** — pixel-exact rendering, journal aggregation, CSV parsing —
   lives in `tools/` (CLIs) and `lib/` (shared code) and `capabilities/*/engine/`.
3. **Everything that is judgement** is a skill in prose (`skills/<name>/SKILL.md`), read by Claude,
   never encoded in JavaScript. If you're about to write JS for something Claude could decide by
   reading a document, write the document instead.

### Company binding and the guard

A session is bound to exactly one company by a `.company.json` walked up from the working directory
(`lib/company.mjs`, `readCompany()`). Binding is never at the home directory by default — that's the
ambient-authority pattern the guard specifically avoids. `.company.json` carries a `kind`
(`"client"` or `"personal"`, default `"client"`) declaring whose store it is; an unrecognised kind
is refused rather than defaulted (same reasoning as `future-schema`).

`guard-company.mjs` (a `PreToolUse` hook, matcher `*`) vetoes exactly two things and nothing else:
- a store write when no company is bound,
- a local write outside the bound company's directory.

Everything else sensitive-but-reversible (sharing a file, trashing one) is journaled and announced,
never blocked — deliberately no allowlist of folders/emails to maintain, and no "switch company and
continue" escape hatch for the two vetoed cases. Shell redirects are **not** covered by the guard;
skills forbid writing company material through the shell instead, and the journal extracts touched
paths from shell commands so a violation is at least visible.

### The journal

`lib/journal.mjs` / `hooks/journal.mjs` record **references, not content**: actor, timestamp, what
was touched, a digest of the payload, why, and (since schema 2) `store_kind`. Rows carry a `schema`
version — a version bump, never a nullable field slipped in, whenever old rows can't be told apart
from a new distinction (e.g. schema 1 rows have no `store_kind` and are read as `client`, since
schema 1 could only bind to a client). `tools/journal.mjs --event <name> --why "<reason>"` records
semantic events a hook can't infer (a review starting, a named approval, an escalation) — the
vocabulary is `EVENTS` in `lib/journal.mjs`; never add an event elsewhere. Never put client content
or a secret in `--why` or `--detail`.

### Render engine

`capabilities/social/engine/render.mjs` produces pixel-exact social assets via `playwright-core`
against the browser already on the machine, and **exits non-zero rather than shipping a bad asset**.
Seven assertions per asset, including the actually-rendered font family (catches silent OS font
substitution) and a brand colour read back from pixels in the output PNG (catches an occluded
element passing a computed-style check).

### Skills — two independent tracks

Twenty-six skills, one directory each, one level deep (`skills/<name>/SKILL.md` — nesting is
unattested, verified against 65/65 skills elsewhere). Frontmatter is only `name` and `description`;
the description states **when** to invoke, never **how** the skill works (a summarised workflow
becomes a shortcut the model takes instead of reading the body).

Comunicación and Operación are numbered independently — phase numbers are meaningless without
naming the track:
- **Comunicación** (phases 0–2): `social` (mandatory router) → `social-presence` → `social-identity`
  → `social-voice` → `social-plan` → `social-produce` → `social-handoff`.
- **Operación** (phases 1–5): `process` (router) → `company-profile` → `company-evidence` →
  `process-map` → `process-access` → `automate-spec` → `automate-handover`.
- Setup/utility skills (`setup`, `company-new`, `doctor`, `resume`, `coverage`, `baseline`,
  `report`, `opportunities`, `feedback`, `zapier-mcp-ops`) sit outside both tracks.

### Where a fact belongs (one subject, one file — a fact in two is a defect)

| File | Answers |
| --- | --- |
| `xenthai/CHANGELOG.md` | What changed, per version |
| `xenthai/DECISIONS.md` | What was chosen, the evidence, the rejected alternative, what would reverse it |
| `xenthai/ROADMAP.md` | What's next / shipped / deliberately refused |
| `xenthai/CONTRIBUTING.md` | How to write code here and why |
| `xenthai/IDEAS.md` | Raw, unargued; promoted to the roadmap once it has a reason and a cost |
| `capabilities/*/doctrine/` | Why the work is done this way — read by skills, not people |

## Non-obvious rules that will cause a rejected change

- **Language**: code, comments, journal fields, plugin docs → English. Anything a client reads
  (scaffolds in `scaffold/company/`, review docs, reports) → es-MX, default *usted*. Identifiers
  are English (`company` not `empresa`); *bitácora* only appears in client-facing text.
- **Comments**: only a `/** */` JSDoc block on a module-scope declaration or class method. Never a
  standalone `//`, trailing comment, or comment inside a function body. Derivability test: if
  covering the comment and reading only the declaration teaches you nothing new, delete it.
- **Company documents are markdown, always** — never a Google Doc as the source of truth, since that
  would break the storage adapter's agnosticism. A Doc is a *derived* artefact for review (comments
  are the approval mechanism); each revision is a new file so lineage stays visible.
- **Nothing publishable that is not verifiable**: no outcome figure, client name, credential,
  timeline or comparison in client-facing text without a row in that company's claims register
  naming its source, who confirmed it, and a re-verification date.
- **The artefact proves the claim**: copy that asserts something must be demonstrated by the image
  or document next to it.
- **File ownership in a parallel wave**: touch only the files your brief assigns; write out an
  otherwise-needed change to a file you don't own instead of making it.
- `${CLAUDE_PLUGIN_ROOT}` is guaranteed inside hooks but undocumented for a skill's shell — skills
  fall back to the plugin root the bootstrap hook announces at session start.

## Requirements

- Node 20+
- A Chromium-family browser on the machine (Windows has Edge; macOS/Linux need a one-time
  `npx playwright install chromium`) — its absence is why `doctor.test.mjs`, `render.test.mjs` and
  `template.test.mjs` report `browser:fail(none)` in a bare container.
