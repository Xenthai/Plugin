# Xenth AI Plugin

Applied-AI consulting, executable.

This plugin maps a company, produces its communication from that company's own documents, and
records every action it takes with the actor and the timestamp. People decide, the AI executes, and
everything is written down.

It is **company-agnostic**. No client's material lives in this repository — each company's
documents, assets and journal live in that company's own store. The plugin knows how to read and
write a store; it does not know who the clients are.

---

## Install

```bash
claude plugin marketplace add Xenthai/Plugin
```

```bash
claude plugin install xenthai@xenthai
```

Updates arrive automatically, once per session. You only receive a version that was deliberately
released: the `version` field in `plugin.json` is the release gate, so work in progress on `main`
never reaches an installed copy.

Then authorize the connectors it needs. **A plugin cannot declare or install a connector**, so this
is the one step a person has to do by hand — see [MCP.md](MCP.md) for what to authorize and how to
verify it actually works.

---

## What it does today

Twenty skills. Two are routers that bind the session and decide which phase a company is in; the
rest do one thing each.

| | Skill | When it runs |
| --- | --- | --- |
| **Setup** | `setup` | The first visit. Reads the seven steps back before running anything, then reports which are owed and by whom |
| | `company-new` | Writes the `.company.json` that binds a session to exactly one company, and adopts whatever the store already holds |
| | `doctor` | Whether this machine and the bound company's connectors can do the work about to be promised |
| **Mapping** | `company-intake` | Asks for the files the company already has instead of interviewing for every fact |
| | `company-offer` | What it sells and on what terms — stock, lead times, CFDI, the discount limit and who authorises exceeding it |
| | `process-map` | Phase 3, the *Diagnóstico*: every process it actually runs, breadth before depth |
| | `process-access` | Phase 4, the *Mapeo integral*: pain, access, authority, and a scored shortlist |
| | `process` | The router for those two |
| | `baseline` | The before, while it still exists. It cannot be reconstructed afterwards |
| **Communication** | `social` | The mandatory entry point for anything published |
| | `social-presence` | The perishable before: every account that exists, dated, append-only |
| | `social-identity` | Phase 1 — names, sector, regulator, who approves a public claim, who actually decides |
| | `social-voice` | Phase 2 — voice derived from what they already published, as word-level rules |
| | `social-plan` | The editorial plan. Ends at an approval gate rather than producing anything |
| | `social-produce` | Copy, then render. Refuses to emit an asset that breaches a platform limit |
| | `social-handoff` | The delivery package: schedule, assets, and an honest note about what still needs a hand |
| **Closing the loop** | `automate-handover` | Acceptance and liability, not results. The test is whether the client can switch it off alone |
| | `report` | The journal read back, per cadence, with what the evidence cannot support |
| | `opportunities` | What recurred across periods, as questions rather than recommendations |
| | `feedback` | What to fix in **this plugin**, from evidence, carrying nothing about any company |

Onboarding is one phase per session, deliberately. A longer instrument measurably reduces both
starts and completions, and phase 1 ends with something the client can look at — a director who
spends an hour answering questions and leaves with a filled-in document has no reason to return.

---

## The parts that are not prose

### The render engine

`capabilities/social/engine/render.mjs` produces exact-pixel assets and **exits non-zero rather
than shipping a bad one**. It drives the browser already installed on the machine through
`playwright-core`, so on Windows there is no download at all.

Seven assertions run per asset. Two of them catch what no geometry check can see:

- **the font family that actually rendered** — a silent OS font substitution passes every size and
  position check while destroying the brand
- **a brand colour at a known pixel, read from the PNG itself** — a computed style proves the CSS
  asked for a colour, not that the colour reached the screen past an occluding element

The other five: exact output dimensions, no container overflow, nothing message-bearing inside a
platform's hard keep-out, nothing at all beyond the soft bound, and a fill floor.

`node capabilities/social/engine/render.mjs --help` for the interface.

### The journal

Every tool call is recorded by a hook, not by an instruction. That distinction is the whole point:
an instruction depends on the model remembering, in every action of every session, and **a journal
with gaps is worse than no journal** — a missing entry cannot be told apart from an action that
never happened.

It records **references, not content**: actor, timestamp, what was touched, a digest of the
payload, and why. The payload stays in the store that already holds it. That is how the journal
stays complete enough to be evidence without becoming a second copy of a client's data.

`node bin/journal.mjs --help` to record the semantic events a hook cannot know the meaning of — a
person starting a review, an approval with a named approver, an escalation.

### The company guard

A `PreToolUse` hook vetoes exactly two things, and neither needs a list to maintain: a store
write when no company is bound, and a local write outside the bound company's directory. Not a
warning — a veto, before the write happens.

Everything else that is sensitive but reversible — sharing a file, trashing one, writing to a
store folder — is journaled and announced rather than blocked. A guard that interrupts often is
one the operator learns to click through, and there is deliberately no "switch company and
continue" path for the two cases it does veto.

Shell commands are not covered: a `Bash` redirect writes anywhere. Skills forbid writing company
material through the shell, and the journal extracts the paths a command touches so a violation
is visible. Visible is not prevented; that is the honest limit.

The binding lives in a `.company.json` in the working directory, never in a home directory: a
home-level default is the ambient-authority pattern that makes people act on the wrong target in
every tool that has one.

---

## Structure

```
.claude-plugin/     plugin and marketplace manifests
skills/             one directory per skill, one level deep — the only depth that loads
hooks/              journal and company guard
bin/                CLIs a skill invokes without reading their source
lib/                shared across capabilities: company binding, journal, PNG reader
capabilities/
  social/
    doctrine/       LAYOUT.md, COPY.md — the rules with numbers in them
    engine/         formats.json, render.mjs, template.html (every archetype), fonts/ (OFL palette)
  process/
    doctrine/       PROCESS.md — SIPOC boundaries, capture fields, suitability scoring
  baseline/
    doctrine/       MEASUREMENT.md — what may be measured, and what may be claimed from it
  automate/
    doctrine/       HANDOVER.md — the autonomy ladder, and why agreement is not accuracy
  report/
    doctrine/       REPORTING.md — which cadence answers which question
    templates/      one per cadence, es-MX, each declaring the question it answers
  company/
    doctrine/       CONTROLS.md, INTAKE.md, SESSION.md, SCHEDULING.md, MATURITY.md,
                    REGULATORS-MX.md, STANDARDS.md
scaffold/company/   the blank document set created for a new company, es-MX
test/               one suite per subsystem, discovered by glob — `npm test` runs all of them
```

Every CLI answers `--help` and exits 0 doing it, because a caller reads a non-zero exit as a broken
tool and stops:

| CLI | What it answers |
| --- | --- |
| `bin/status.mjs` | Which documents exist, how many fields are pending, which phase owes each, and **whether what was written is actually in es-MX** |
| `bin/journal.mjs` | Records a semantic event a hook cannot infer — a review, an approval with a named approver, an escalation |
| `bin/doctor.mjs` | Whether this machine and the bound company's connectors can do the work about to be promised |
| `bin/report.mjs` | Journal rows to an engagement report, with the SHA-256 of the bytes it read so the client can check it |
| `bin/watch.mjs` | Engagement health as counts, dates and verdicts, with **no company data in it** — the file the practice is given |
| `bin/opportunities.mjs` | What recurred across distinct periods, with the rows behind each pattern |
| `bin/legible.mjs` | How hard an es-MX document is to read, on the INFLESZ scale. Refuses anything that is not Spanish |

---

## Two rules that outrank convenience

**Nothing publishable that is not verifiable.** No outcome figure, client name, credential,
timeline or comparison enters client-facing text without a row in that company's claims register
naming its source, who confirmed it, and when it must be re-verified. A row that expired is not
publishable until it is checked again.

**The artefact proves the claim.** If the copy asserts something, the image or document
demonstrates it. Copy that says "months of history" beside timestamps from a single night is a
contradiction the reader will find.

---

## Development

```bash
npm install --ignore-scripts
```

```bash
npm test
```

Fifteen suites. The hook suite proves the guard vetoes only what it should, that a share is
announced and journaled rather than blocked, and that the journal does not leak content — including
the paths inside a shell command. The template suite renders every archetype on all four
targets through the real template with a fixture company and requires every asset to pass every
assertion. The render suite proves the assertions **fail** when they should —
a piece pushed into a keep-out, an overflowing canvas, a substituted font, a wrong pixel colour.
Testing that an assertion catches a violation matters more than testing it passes when nothing is
wrong.

`node test/skill-eval.mjs` is deliberately outside `npm test`: it asks the `claude` CLI which skill a
query routes to, so it needs a login and costs money. It is the only instrument that measures whether
the skills route correctly, and a description is their sole trigger surface.

### Where each kind of record lives

One subject, one file. A fact in two of them is a defect.

| File | What it answers |
| --- | --- |
| [CHANGELOG.md](CHANGELOG.md) | **What changed**, per version, so a client can trace what produced their material |
| [DECISIONS.md](DECISIONS.md) | **What was chosen and what evidence chose it** — with the rejected alternative and what would reverse it. Also what is blocked, on whom, and since when |
| [ROADMAP.md](ROADMAP.md) | **What is next**, what has shipped, and what is deliberately refused |
| [CONTRIBUTING.md](CONTRIBUTING.md) | **How to write code here**, and why each rule exists |
| [IDEAS.md](IDEAS.md) | Raw and unargued. An item leaves for the roadmap once it has a reason and a cost |
| `capabilities/*/doctrine/` | **Why the work is done this way** — read by the skills, not by a person browsing |

`--ignore-scripts` is not a preference. Claude Code installs a plugin's dependencies that way, so
anything depending on a lifecycle script would install cleanly here and fail only on a client's
machine. That is why this depends on `playwright-core` and never on the full `playwright` package,
whose browser download is exactly such a script.

---

## Requirements

- Node 20 or later
- A Chromium-family browser on the machine. Windows has Edge already; macOS and Linux need a
  one-time `npx playwright install chromium`
- The connectors in [MCP.md](MCP.md), authorized by a person

## License

[Functional Source License 1.1, Apache 2.0 future](LICENSE) — free to use, install and modify;
competing commercial use is not permitted; converts to Apache 2.0 two years after release.

Bundled typefaces are SIL OFL 1.1 and ship with their license text.
