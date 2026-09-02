# Changelog

All notable changes to the Xenth AI Plugin are recorded in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the version numbers follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**The `version` field in `.claude-plugin/plugin.json` is the release gate.** Claude Code re-copies an
installed plugin only when that field changes, so a client machine holds exactly what a version
names and nothing merged after it. Three consequences govern this file:

- **Every entry is a version bump, and every bump has an entry.** A bump without an entry ships
  work nobody described; an entry without a bump describes work no client has.
- **`[Unreleased]` is what is merged and not shipped.** It is on no client machine. When it ships,
  it moves under a new version heading in the same commit that bumps the field.
- **`package.json` carries the same number.** `test/ops.test.mjs` fails when the two disagree, or
  when this file has no entry for the version the manifest names.

Every journal row carries `plugin: <version>`, so the rules a company's pieces were produced under
are traceable to an entry here. That traceability is only as good as the entry.

## [Unreleased]

Nothing yet.

## [0.1.0] - 2026-09-02

The baseline every later entry is measured against. Company-agnostic from the first commit: no
client material lives in the repository; a company's documents, assets and journal live in that
company's own store, bound to a session by a `.company.json` in the working directory.

### Added

- **Six skills** under `skills/`, one directory each. `social` is the mandatory entry point: it
  states the bound company, reads the phase from the documents in the store, and routes.
  `social-identity` runs phase 1 (`BRAND.md`, `DESIGN.md`, `PROOF.md`, two or three draft pieces).
  `social-voice` runs phase 2 (`VOICE.md` as word-level rules; `PROOF.md` rows with re-verification
  dates). `social-plan` is approval gate 1 (`plan.md` plus a review Doc, then stop).
  `social-produce` writes copy, then renders; its first batch is approval gate 2. `social-handoff`
  builds the delivery package: `README.txt`, `schedule.csv` as UTF-8 with BOM, assets prefixed by
  piece id, vendor import files for Metricool, Publer or Buffer only when already paid for, and
  `reminders.ics` as due dates only.
- **Hooks** (`hooks/`). `SessionStart` announces the bound company and the plugin root.
  `PreToolUse` is the company guard: it vetoes exactly two things — a store write with no company
  bound, and a local write outside the bound company's directory — and announces a share instead of
  blocking it. `PostToolUse`, `PostToolUseFailure` and `SessionEnd` journal every tool call.
- **Journal** (`lib/journal.mjs`, `bin/journal.mjs`). One JSONL row per action in
  `journal/execution/<YYYY-MM>.jsonl`, row schema 1, stamped with the plugin version. Rows carry
  references and a digest, never content; the paths inside a shell command are extracted for audit.
  A fixed vocabulary of sixteen events, twelve of them semantic and recorded through the CLI.
- **Company binding** (`lib/company.mjs`). `.company.json` is found by walking up from the working
  directory, never from a home directory. Manifest schema 1; a higher schema is refused.
- **Render engine** (`capabilities/social/engine/`). `render.mjs` on `playwright-core` 1.58.2
  drives the browser already installed — Edge, then Chrome, then their beta and dev channels — and
  runs seven assertions per asset, including the font family that actually rendered and a brand
  colour read from the PNG itself; exit 0, 1 or 2. `formats.json` (schema 1, verified 2026-09-02)
  carries a hard and a soft safe-zone tier and marks every unverified value as such.
  `template.html` renders eight archetypes — hero, record, statement, list, question, quote,
  announcement, contrast — on four targets: 1080×1920, 1080×1350, 1080×1080 and 1200×630. Bundled
  OFL typefaces Archivo, Hanken Grotesk and JetBrains Mono ship with their licence texts.
  `lib/png.mjs` is the dependency-free PNG reader behind the pixel assertion.
- **Doctrine** (`capabilities/social/doctrine/`). `LAYOUT.md`: ten numbered composition rules and
  the measurement traps behind them. `COPY.md`: the copy rules and the two questions asked of every
  piece.
- **Company scaffold** (`scaffold/company/`, es-MX): `.company.json.template`, `BRAND.md`,
  `DESIGN.md`, `PROOF.md`, `SOCIAL.md`, `VOICE.md`.
- **Tests** (`test/`). Hooks: the guard vetoes only what it should and the journal leaks nothing.
  Render: every assertion proven to fail when it should. Template: all archetypes on all targets
  through the shipped template. Ops: CI, runbook and changelog consistency, each violation proven
  caught.
- **Operations.** A GitHub Actions workflow that runs `npm ci --ignore-scripts`, the suites, and
  `claude plugin validate --strict` on every push and pull request. `INSTALL.md`, the operator's
  runbook for a client machine. This changelog.
- **Documentation.** `README.md`, `CONTRIBUTING.md`, `MCP.md` (the connectors a person must
  authorize, and how to prove they work), `ROADMAP.md`, `IDEAS.md`. Licence: Functional Source
  License 1.1 with an Apache 2.0 future.
