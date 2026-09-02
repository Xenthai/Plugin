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
claude plugin marketplace add xenthai/xenthai-plugin
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

| Skill             | When it runs                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `social`          | The mandatory entry point. Binds the session to one company and routes to the phase that company is actually in               |
| `social-identity` | Phase 1 — legal and trade name, sector and regulator, who approves public claims, who actually decides, what it sells to whom |
| `social-voice`    | Phase 2 — derives voice from what the company already published, turns it into word-level rules, fills the claims register    |
| `social-plan`     | The editorial plan. Ends at an approval gate rather than producing anything                                                   |
| `social-produce`  | Copy, then render. Refuses to emit an asset that breaches a platform limit                                                    |
| `social-handoff`  | The delivery package: schedule, assets, and an honest note about what still needs a hand                                      |

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
skills/             one directory per skill, one level deep
hooks/              journal and company guard
bin/                CLIs a skill invokes without reading their source
lib/                shared across capabilities: company binding, PNG reader
capabilities/
  social/
    doctrine/       LAYOUT.md, COPY.md — the rules with numbers in them
    engine/         formats.json, render.mjs, template.html (every archetype), fonts/ (OFL palette)
scaffold/company/   the blank document set created for a new company
test/               three suites: hooks, engine assertions, and every archetype on every target
```

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

Three suites. The hook suite proves the guard vetoes only what it should, that a share is
announced and journaled rather than blocked, and that the journal does not leak content — including
the paths inside a shell command. The template suite renders all eight archetypes on all four
targets through the real template with a fixture company and requires every asset to pass every
assertion. The render suite proves the assertions **fail** when they should —
a piece pushed into a keep-out, an overflowing canvas, a substituted font, a wrong pixel colour.
Testing that an assertion catches a violation matters more than testing it passes when nothing is
wrong.

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
