# Decisions

Why this plugin is the way it is, and what would change it back.

This is not a second changelog. `CHANGELOG.md` records **what changed**, per version, so a client can
trace what produced their material. This file records **what was chosen, what evidence chose it, and
what was rejected** — the reasoning that would otherwise have to be re-derived from a commit message
six months from now.

**Nothing enters without a rejected alternative.** A decision with no alternative is a description,
and descriptions belong in the changelog or in doctrine. Nothing is ever deleted here: a reversed
decision gets a new entry saying so, because why something was abandoned is information the next
engagement needs.

Every entry answers four things: the decision, the evidence, what was rejected, and **what would
reverse it** — that last one is what makes this a record rather than a defence.

---

## Blocked, and on whom

The only work that is not code. Each of these looks like a defect when it fails and is not.

| Since | What | Waiting on | Why it matters |
| --- | --- | --- | --- |
| 2026-09-02 | `node test/skill-eval.mjs` — the routing evaluation over 58 cases | `claude auth login` in an interactive terminal; the CLI answers "Not logged in" | The only instrument that measures whether 20 skills route correctly. A description is their sole trigger surface, and it is what would license cutting descriptions from a 522-character mean toward the 274 first-party median |
| 2026-09-02 | `/doctor` — Claude Code's own built-in, which rightsizes skills and CLAUDE.md | An interactive terminal; the command does not open in the desktop Code tab | Not the plugin's `doctor` skill. It is the tool for the description-length question above |
| 2026-09-02 | OAuth for seventeen MCP servers | claude.ai connector settings, or `/mcp` in an interactive session | Those capabilities are unavailable until authorised |
| 2026-09-03 | `${CLAUDE_PLUGIN_ROOT}` resolving inside a skill's shell | A real install on a second machine | Every semantic journal entry from a skill depends on it, and the documentation covers hook commands rather than a skill's later shell command |
| 2026-09-03 | A first-session dry run against a real company | A client | The suites prove each part in isolation. **Nothing has yet proven the parts compose**, and this is the only item no suite can ever replace |
| 2026-09-03 | Installing on a client's machine from the marketplace | The repository being reachable from that machine — it is private, so `marketplace add Xenthai/Plugin` fails there while working here | The failure looks like a typo rather than a permission. Until it is public, the alternative is a local-path install, which costs the auto-update |

---

## The decisions

### 1 · Doctrine lives in `capabilities/`, not inside each skill directory

Anthropic's own skill-creator puts references inside the skill's own folder. This does the opposite,
and the argument is a measurement rather than a preference: `CONTROLS.md` is read by **nine** skills,
`PROCESS.md` and `COPY.md` by four each, and eight of twelve doctrine files by two or more. The
per-skill layout would duplicate `CONTROLS.md` into nine directories.

**Rejected:** the documented per-skill layout. **Reverses if** sharing drops — a doctrine file read by
one skill has no claim on a shared directory and belongs in that skill's own.

### 2 · The plugin refuses exactly two things; everything else is advisory

A skill is a control, but only an advisory one: the model reads it and complies almost always, which
is not the same as cannot. A policy that must always hold needs something deterministic behind it, so
the hook refuses a store write with no company bound and a local write outside the company's folder,
and nothing else. A client asking "can this happen?" gets two tiers and must get the right one.

**Rejected:** enforcing more in hooks. Each addition is a permission prompt on work that is legitimate,
and the standing instruction is least restriction. **Reverses if** a client's own policy requires a
third refusal — then it is theirs, declared, not a default.

### 3 · No hash chain on the journal; the report's digest anchored in the client's store

A chain is computed by whoever writes the journal, so it detects nothing that party wants hidden. What
makes a digest mean something is where it comes to rest: `bin/report.mjs` prints the SHA-256 of the
bytes it read, and the report is written into the **client's** store, whose revision history the
practice cannot rewrite.

**Rejected:** per-row hash chaining, which would also need a lock across parallel hooks. **Reverses if**
a regulated client requires a published head — then the head must go somewhere the operator cannot
rewrite, which is the property a chain alone never had.

### 4 · Every routine is a Claude Desktop scheduled task

Cloud routines are disqualified three times over, any one sufficient: no access to local files and the
journal is the entire input; they belong to an individual account and draw down its allowance; and the
form is repository-centric while a company's material is in Drive. `/loop` and `CronCreate` are
session-scoped and expire after seven days.

**Rejected:** an operating-system task, which is technically better for the deterministic ones — free,
no app needed, cannot stall. It loses on one interface with run history, and on needing elevated
PowerShell a client's IT may refuse. **Reverses if** a client's machine cannot keep the app open, since
a Desktop task only fires while it is running.

### 5 · The engagement folder lives inside the Drive-synced company folder

The journal is written under the engagement folder. Outside a synced folder it exists on exactly one
machine, and that machine dying takes the audit trail and the ability to report with it. Worse, every
report tells the client to verify its digest against **their own copy of the journal**, and they had
none.

**Rejected:** a folder anywhere on disk, as originally documented. **Reverses if** Drive for Desktop is
unavailable — then something else has to make the journal durable before an engagement starts.

### 6 · Only the `digest` folder is shared with the practice, as Viewer

Standing access to a client's material has no upside and two costs: it makes the practice a processor
of the client's personal data under the LFPDPPP, and one compromised account becomes every client at
once. The digest carries counts, dates and verdicts and no company data, which is what makes access
to the rest unnecessary.

**Rejected:** clients sharing their whole Drive for a central view. **Reverses if** the practice takes
on operational delivery rather than enablement — and then the processor agreement comes first, not
after.

### 7 · `locale` gates rather than describes

It was declared in every manifest and read by nothing, which is worse than not having the field: it
looked like a control and was decoration. Every client-facing part is Spanish by construction, so a
manifest declaring `en-US` would have produced Spanish documents while claiming otherwise.

**Rejected:** making the toolchain locale-aware, which is a large build for a practice serving Mexican
companies. **Reverses the day a non-Spanish client arrives** — and the refusal then names exactly what
has to be built.

### 8 · Language is judged on function words OR accents, never character n-grams

Both signals are named families in the literature (Cole et al. 1997). The standard method, character
n-grams, reaches 98.6% on short documents but needs a trained profile per language and solves a harder
problem: Vatanen et al. (LREC 2010) test 281 languages on 5-to-21-character samples for 72.5% average
recall, while this task is binary with a strong prior. Validated externally — Mexican law 396 function
words per thousand, a Mexican company's buttons and taglines 219 and 188 accents, an English business
report 1 — against floors of 150 and 40.

**Rejected:** `AND` between the two signals, which reinstated the bug that found this — a real es-MX
chart piece reported as foreign. Each signal catches what the other misses. **Reverses if** a false
positive on correct Spanish appears, since crying wolf is the worse failure of the two.

### 9 · No composite score, anywhere

Not for engagement health, not for company improvement, not for automation suitability. Averaging a
silence signal against a governance defect hides whichever mattered, and a single improvement number
is indefensible with one client and no control group. `PROCESSES.md` §6 keeps its two judgement
criteria in separate columns as a **ceiling** rather than blending them into the research score.

**Rejected:** a headline number, which is what a client asks for. **Reverses never** on the improvement
score; a client's own process measure, before and now, is the honest substitute.

### 10 · A cadence report is scheduled as a reminder, not as the report

A report carries claims, and attribution has to be written by a person who can defend it out loud.
Everything else about it would automate cleanly, which is exactly the trap.

**Rejected:** generating the report on a schedule. **Reverses if** a cadence's report ever contains no
claim — the biweekly is closest, since it carries no outcome claim by design.

### 11 · No `argument-hint` in skill frontmatter

Sixty-seven first-party skills declare it. Two independent reasons here: it is not among the Agent
Skills spec's six portable fields, and **no skill in this plugin reads `$ARGUMENTS`** — so it would
advertise an interface that does not exist.

**Rejected:** matching first-party convention. **Reverses if** a skill actually consumes arguments.

### 12 · Hooks stay declared inline in `plugin.json`

The inline form is the working one: the caveman plugin installed on this machine declares its hooks
inline, has no `hooks/hooks.json`, and its `SessionStart` hook fires. The observation that no plugin in
`knowledge-work-plugins` declares hooks inline was a bad inference — those plugins declare no hooks.

**Rejected:** moving them to satisfy a convention that does not exist, at the risk of silently killing
the enforcement spine. **Reverses if** a documented loader change requires the file.

### 13 · `duration_ms` stays out of the journal row

`PostToolUse` inputs carry it and it is unmatched-proof in a way the manual `review_start`/`review_end`
pair is not. But it measures tool execution time, which is neither the human review time a client pays
for nor the cycle time a process improves on.

**Rejected:** adding it for completeness, at the cost of a `ROW_SCHEMA` bump. **Reverses if** `doctor`
needs it to diagnose a degrading store — that is its subject, not the report's.

### 14 · `userConfig` is not used

It prompts at enable time and the only value it would carry — the practice's digest account — is a
constant, so it would add a prompt to every install and buy nothing.

**Rejected:** using the supported configuration mechanism because it exists. **Reverses if** a value
becomes genuinely per-install and cannot be read from `.company.json`.

### 15 · A skill over its size ceiling is split, never given a bigger ceiling

`report` grew past the 12 KB body ceiling the suite enforces. Attribution and figure-reading moved to
`REPORTING.md` §10b and §10c; the skill kept the refusals and points at the evidence.

**Rejected:** raising the ceiling, which is how a skill becomes a document nobody loads deliberately.
**Reverses never.** The ceiling exists because the published finding behind this plugin's design is
that over 80% of a system prompt was removed with no measurable loss, diagnosed as overconstraining.

---

## Defects this plugin committed against its own rules

Kept because each one is the plugin's own doctrine catching the plugin, and the pattern repeats.

| What | The rule it broke |
| --- | --- |
| `MATURITY.md` was read by zero skills an hour after being written | The unreachable-record failure `CONTROLS.md` warns about |
| `legible.mjs` scored the plugin's English `INSTALL.md` at 87 and *muy fácil* | A wrong answer that looks right — the class this tool exists to catch |
| The journal fell back to the working directory, creating a `journal/` tree wherever `doctor` ran | The ambient-authority pattern `company-new` refuses for manifests |
| `locale` in every manifest, read by nothing | A control that is decoration is worse than no control |
| `ROUTINES.md` was owed by phases months away while the digest routine already ran | A routine nobody wrote down cannot be noticed missing — `REPORTING.md` §2b |
| The trigger dataset expected `none` for four capabilities that existed | An evaluation that penalises the correct answer |
| The threshold self-test derived its boundary from `1 - 0.8` and was off by one | Floating point, invisible until the dataset reached an exact multiple |
| A duplicate-policy fingerprint matched any mention of `CONTROLS.md` | A check broad enough to forbid reference does not detect duplication |
