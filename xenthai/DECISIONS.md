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
| ~~2026-09-02~~ **unblocked 2026-09-08** | `node test/skill-eval.mjs` — the routing evaluation, now 67 cases | Nothing. It ran twice, 201 calls each: **test split 90.8% then 86.2%** against an 80% gate | The only instrument that measures whether 22 skills route correctly. Two things it settled today. The **standing defect is `process`**, 2/12 then 0/12, losing to `process-map` six times in both runs — a real routing failure, now measured rather than assumed. And **the instrument's own spread is wide**: the same suite moved 4.6 points between two runs an hour apart with almost identical confusion pairs, so a single run's number is not a measurement and a change of a few points is not a result |
| 2026-09-02 | `/doctor` — Claude Code's own built-in, which rightsizes skills and CLAUDE.md | An interactive terminal; the command does not open in the desktop Code tab | Not the plugin's `doctor` skill. It is the tool for the description-length question above |
| 2026-09-02 | OAuth for seventeen MCP servers | claude.ai connector settings, or `/mcp` in an interactive session | Those capabilities are unavailable until authorised |
| 2026-09-03 | `${CLAUDE_PLUGIN_ROOT}` resolving inside a skill's shell | A real install on a second machine | Every semantic journal entry from a skill depends on it, and the documentation covers hook commands rather than a skill's later shell command |
| 2026-09-03 | A first-session dry run against a real company | A client | The suites prove each part in isolation. **Nothing has yet proven the parts compose**, and this is the only item no suite can ever replace |
| 2026-09-03 | Installing on a client's machine from the marketplace | Nothing. The repository is public, the catalogue resolves, and decision 17 says which surface adds it | Kept until an install runs on a machine that is not this one. Verified from the outside as served bytes, never as a completed install elsewhere — and on this machine the two surfaces were added in the order that fails |
| 2026-09-03 | The plugin appearing in Cowork | A new Cowork session. Cowork keeps its own store at `~/.claude/cowork_plugins/`, reached with `--cowork`; it was empty, so the plugin was never there to be missing | Installed there now, 21 skills on disk. **Not measured in a session** — a running one mounts the store at start and will not see it |

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
makes a digest mean something is where it comes to rest: `tools/report.mjs` prints the SHA-256 of the
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
is indefensible with one client and no control group. `PROCESS.md` §5 keeps its three vetoes above
the score rather than blending them into it — see the narrowing below for how that score is now
computed.

**Rejected:** a headline number, which is what a client asks for. **Reverses never** on the improvement
score; a client's own process measure, before and now, is the honest substitute.

**Narrowed on 2026-09-17** (`CONFORMANCE.md` Ruling 1): this ban stays absolute for performance and
improvement claims — a client-facing "we improved X%" never comes from an average of unlike
criteria. It does not extend to every weighted ranking: `PROCESS.md` §5 adopts X3's eight-criterion,
18-weight formula for prioritisation, with three vetoes that outrank the number. That score orders
candidates for the backlog; it is never published as, and never becomes, an improvement figure. The
distinction is what the score is for — ranking what to build next, not reporting what got built —
not a loophole in the ban.

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

### 16 · One repository, catalogue at its root, plugin at `./xenthai`

The desktop app never showed this plugin, and neither did Cowork. Five explanations were measured and
disproved — a trailing slash, the branch name, the `"./"` source, non-ASCII characters in the
manifest, the repository split. Each was a guess about a closed system.

The sixth came from a working example rather than a guess: `fru-dev3/AI-Ready-Life`, confirmed working
in the app, declares its plugins as `"./health"` — a subdirectory of the same repository that carries
the catalogue. So the shapes were tested against each other instead of one at a time: one catalogue,
two entries, a URL source and a relative-path source, published together. **The relative one appeared
in the app. The URL one did not.**

The mechanism that explains it: the app syncs a marketplace over HTTP. It reads any file inside the
repository it synced and cannot clone a second one, so a plugin named by URL resolves nowhere and the
dialog reports only that the sync failed. A terminal clones, so both forms work there — which is why
this was invisible for a day.

That also retires `Xenthai/Marketplace`. A separate catalogue repository is the correct shape by every
other argument, and it cannot work in the app, so the argument loses to the measurement. It also
retires the `xenthai-dev` twin: one catalogue now serves a checkout and GitHub alike, and the twin's
whole reason was that Claude Code keeps one marketplace per name.

**Rejected:** a catalogue repository separate from the plugin, which keeps the version histories from
lying about each other. **Reverses if** a URL source is shown to resolve in the app — see the
correction below, which is why that is now an open question rather than a settled one.
`test/ops.test.mjs` asserts the shape.

**Corrected on 2026-09-03.** The mechanism above is not established. The run that produced it —
`prueba` appearing and `xenthai` not — also carried the settings mismatch of decision 17, which
alone explains why that entry never appeared. Two causes were present and only one was varied. What
survives is that a relative source **works**; that a URL source fails does not.

### 17 · The marketplace is added from one place, and the terminal is not it

The desktop app refused to add this catalogue for a day, saying only that the sync failed. Its own
log says the rest: the app sends `https://github.com/Xenthai/Plugin`, `claude plugin marketplace add`
had already written `{source: github, repo: Xenthai/Plugin}` into `settings.json` under the same name,
and the app refuses a source whose kind disagrees with what is declared for that name.

Both are correct spellings of the same repository. Neither side normalises to the other, and the
error surfaces as a URL problem, so the operator retypes the URL — which is the one thing that cannot
help.

The rule is therefore about **order, not shape**: whichever surface the client will actually use adds
the marketplace, and the other inherits the declaration from `settings.json`. For a client that is
the app, because that is where they work; the terminal picks it up afterwards. All three runbooks say
so and `test/ops.test.mjs` asserts they still do.

**Rejected:** editing `settings.json` by hand to match. It works and it teaches an operator to
hand-edit the file two surfaces write to. **Reverses if** either side normalises the source, at which
point the order stops mattering.

The exact shapes, since the error names neither: the terminal writes
`{"source": "github", "repo": "Xenthai/Plugin"}` and the dialog writes
`{"source": "git", "url": "https://github.com/Xenthai/Plugin.git"}`. `claude plugin install` touches
no declaration and is safe from either side; only `marketplace add` overwrites.

**The dialog says the same thing when it succeeded.** `Error al sincronizar el marketplace` is also
what it shows when the marketplace is **already added**, so a retry that looks like a failure is
often the first attempt having worked. `main.log` separates them — `Marketplace added: xenthai`
against `Marketplace already present, skipping add: xenthai` — and nothing on screen does.

**What this cost.** Five rounds of published probes, three renames, and one restructure, chasing a
cause the app had already written to `main.log` in one line, and then two further rounds of the
operator retrying a dialog that had already succeeded. The plugin runs inside that app. Nobody opened
its log until every remote explanation had been exhausted — see the defect below.

### 18 · A document owed by a skill is written by a command, not by a sentence

`ROUTINES.md` was instructed in bold by `company-new`, listed as owed by `tools/status.mjs`, and
still absent for two days after the session that should have created it. Nothing about that session
looked wrong, because a prose instruction leaves no trace when it is skipped — and the document in
question is the one whose whole purpose is that a routine nobody wrote down cannot be noticed
missing. `tools/scaffold.mjs` replaces the sentence with an exit code, and enforces the
never-overwrite rule that two skills state and neither could hold.

**Rejected:** a stronger wording in the skill, which is what the previous round already tried, and a
`status` check that would have reported the absence later — the point is to make the omission
impossible in the session, not legible afterwards. Also rejected: writing the store copy from the
CLI. It has no credentials, and a tool that appears to deliver and does not is worse than one that
says the session still owes the upload. **Reverses if** the document set becomes per-company, at
which point a fixed scaffold list stops being the right source.

### 19 · The escalation count means "a person had to decide", so a question is not one

`hooks/journal.mjs` recorded every `PermissionRequest` as an `escalation`, and `AskUserQuestion` —
which performs nothing and only asks — landed in the same column that `tools/report.mjs` presents to
the client as decisions that passed to a person. The inflation is silent and flatters: a larger
escalation count reads as more governance, not less, so nothing would ever have questioned it.

**Rejected:** counting every prompt and explaining the difference in the report, which pushes a
definition the reader cannot verify onto the reader. Also rejected: dropping the row entirely — the
call is still journaled by `PostToolUse`, so what changes is the label, not the record. **Reverses
if** a question-only tool starts carrying an effect, at which point it is no longer question-only.

### 20 · The browser is journaled by its verb, and governed by doctrine rather than by the guard

A browser-driving session produced 87 rows in one day, each with a null target, so the three calls
that rewrote a client's Gmail filters were indistinguishable from the 84 screenshots around them.
Copying the tool's own `action` fixes the trail without touching the content rule: the verb is the
tool's, the text is the client's and stays digested.

The guard is deliberately not extended. Decision 2 says the plugin refuses exactly two things, and a
browser click cannot be one of them — a guard cannot tell *Guardar* from *Cancelar*, since both are
a coordinate. What replaces enforcement is `MCP.md`: never `type` into a populated field, and re-read
the state after every configuration change. That is weaker, and it is what is actually available.

**Rejected:** a third veto on browser tools, which would prompt on legitimate work and still not
distinguish saving from cancelling; and journaling the typed text, which would put a client's data
in a row that exists precisely to avoid holding it. **Reverses if** a browser tool ever exposes a
structured description of the change it is about to make — that is checkable, and a coordinate is not.

### 21 · The journal's durability is a control, and the upload is a session's act

`lib/journal.mjs` writes to `<company root>/journal/execution/<YYYY-MM>.jsonl`. In a cloud container
that is a disk reclaimed when the session ends, and the loss is silent, because a deleted journal and
a quiet month leave the same empty directory. The chain is what makes it critical rather than
annoying: `opportunities` refuses below three distinct periods and the quarterly report is the first
cadence that may claim a result, so in that environment both are unreachable for ever — and both
refuse with a sentence that reads as *this engagement is young*. A refusal for the wrong reason is
worse than a failure, because nobody investigates it.

The design that was proposed — a `journal-sync` uploading a monthly digest, driven by a `SessionEnd`
hook — does not work, and both halves are worth recording. **A digest cannot restore either tool**:
`report` digests the exact bytes it reads and counts events, `opportunities` groups rows by period,
so what has to survive is the rows. **A hook cannot upload**: hooks and CLIs hold no connector
credentials, so nothing outside a session can write to a client's store, and a `SessionEnd` hook
runs when the model is already gone. What was built instead splits the work along that line — the
CLI stages the exact bytes, verifies what came back and refuses to claim a delivery it cannot prove;
the session uploads. `CONTROLS.md` §1b names the upload as an advisory control, in the same tier as
every other instruction, rather than describing the journal as automatically preserved.

**Rejected:** a monthly digest, which would have left both consumers as broken as before while
looking fixed. Also rejected at the time: uploading split parts instead of whole revisions — smaller,
but a missing part truncates a history silently while a missing revision leaves a gap in a numbered
sequence. That rejection was revisited once the arithmetic behind it was measured; see Decision 21c.
Also rejected: teaching the three readers to concatenate parts, which would have touched `report`,
`opportunities` and `watch` for a gain `--restore` already delivers by writing the canonical file.
**Reverses if** the connector ever gains a real append or content update, at which point revisions
stop being the only shape available.

### 21b · `doctor` fails on a month with no evidence in the store, not on an outstanding row

The finding asked for a FAIL whenever the current month held rows the store did not. Written that
way it cannot be satisfied, and the reason is structural: **staging writes a journal row, and the
sync check's own run writes another.** A rule failing on one outstanding row goes red the moment
after it goes green — and `company-new` STOPS on a doctor that is not green, so that rule would have
made an ephemeral engagement impossible to open at all. This was caught by running `doctor` twice in
a row while walking the lifecycle, not by reading the code.

What deserves a failure is a month with no evidence in the store at all, or a revision old enough
that the rows after it stopped being a session's tail. So: ephemeral and no revision for the month →
FAIL, which is the observed failure exactly; ephemeral and the newest revision over a day old →
FAIL; a closed month unsynced on any binding → FAIL; a session's own tail → reported in the OK line,
naming what is lost if nobody stages before the session ends.

**Rejected:** failing on any unsynced row, which is unsatisfiable and would have blocked the skill
that opens an engagement. Also rejected on durable machines: failing on the current month, which
would put every install that had not uploaded since breakfast in the red — and this plugin's own
doctrine says a control that interrupts constantly is one the operator learns to click through.
**Reverses if** a session is ever seen losing more than its tail — then the day-old window is too
generous and it shortens.

### 21c · Parts are allowed once the expected count travels inside every part's name

Decision 21 rejected split parts for a reason that was right as stated: a missing part truncates the
history silently, while a missing revision leaves a visible gap in a numbered sequence. What changed
is not the objection but the arithmetic behind it. A revision is uploaded by a session, and a
session's only way to create a file is to reproduce its bytes inside a tool call — a channel measured
truncating a 95 KB month to 22% of itself (`fileSize: 2735` against 9,186 actual bytes) while
reporting success. An unbounded single file is therefore not the safe option `journal-sync.mjs`
assumed it was; it is the one whose failure is silent, because the store ends up holding a file with
the right name and the wrong contents.

`tools/journal-sync.mjs` now shards a month past `--shard-bytes` (default 20,000) into
`<YYYY-MM>.rev-<NNN>.part-<NN>-of-<MM>.jsonl`. The total is inside every part's own name, so a
missing part is a visible gap in a numbered sequence in exactly the way a missing revision is,
readable from the folder listing alone without opening anything — the property the original objection
required, satisfied rather than overridden. `--receipt` will not settle a month until the
concatenation of every part hashes to the month it froze, and `--restore` refuses a revision whose
part set is incomplete, naming which parts are missing. A month that fits in one part keeps the old
single-file name; the shape only appears once a month outgrows what a session can carry inside one
tool call.

**Rejected:** leaving the single-file ceiling unbounded, which is what produced the silent truncation
this decision responds to. Also rejected: teaching the three readers (`report`, `opportunities`,
`watch`) to concatenate parts themselves — the same reason Decision 21 gave for keeping `--restore`
as the one place that writes the canonical file. **Reverses if** the upload channel's measured budget
changes enough that 20,000 bytes stops being a safe margin under it, or the connector gains a real
append or content update, per Decision 21.

### 21d · A revision after the first is a delta, the receipt carries the store's byte count, and a hook can upload after all

Measured on 2026-09-19 uploading `2026-09.rev-009` of the personal store: 29 parts, of which 26 were
byte-identical to rev-008 and were copied server-side in 64 seconds for 0 tokens, while the one part
the session had to type cost about two minutes and 13,000 tokens for 20 KB. Had none matched, the
turn would have run close to an hour. And the upload wrote journal rows of its own — rev-008 left 70
rows owed, rev-009 left 33 — so the count never reached zero. Four things follow, and one earlier
sentence is corrected.

**A revision after the first is a delta.** `<YYYY-MM>.rev-<NNN>.delta-after-<R>.jsonl` holds only
the rows appended since the receipt that settled `R` rows; `rev-001` stays the whole month, and a
whole-month revision above deltas is legal and becomes the new base. The receipt still records the
whole month's row count and digest, so `--check`, `doctor` and 21b are untouched, and 21c's property
survives: a part's total is still in its name, a delta's base is in its name, and `--restore`
refuses a missing revision between the base and the newest delta by number. A typical sync is one
file under the budget, and the bytes a sync uploads stop growing with the month. The months already
in the store under the whole-month spelling are not re-uploaded; they restore as before and the first
delta after them names the row count their last receipt settled.

**The receipt carries the size the store reports.** `--receipt` hashed only the local staged bytes
and never looked at the store's copy, so the 22% truncation 21c was written against would have
settled. It now takes `<id>:<size>` per file and refuses when the size differs from the staged
bytes. Reading a file's metadata is a read the journal does not record, so the check is free; the
connector exposes no hash, so size is the whole of what can be checked without downloading.

**A hook can upload — one kind of hook, on one event.** Decision 21 said a hook cannot upload
because it holds no connector credentials. That is true of a `command` hook and of anything on
`SessionEnd`, where there is no MCP client. It is false of a `PostToolUse` hook of type `mcp_tool`,
which calls a tool on the session's own connector with `${path}` substitutions from the hook's JSON
input. Verified in a cloud session on 2026-09-19: a hook added mid-session loaded without a restart;
the connector's name arrived in the hook input as `mcp_server.name` (`Google_Drive` on that host);
a Bash call's stdout of 19,973 bytes reached the hook whole, minus its final newline, which the
hook's `"${tool_response.stdout}\n"` restored; the file Drive created reported `fileSize` 19973 and
downloaded to the same SHA-256; 1.2 seconds from hook to file, and no byte generated by the model.
`--emit` prints a staged file for exactly this, and the hook is written per company into
`<company root>/.claude/settings.json`, because `server` is host-dependent and the target folder is
per store; it does not belong in `plugin.json`. The hook's call bypasses `PreToolUse`, so the guard
does not see it: the `if` filter on the emit command and a fixed folder id are the constraint. The
credentials remain the session's, nothing is stored, and the CLI still writes nothing to a store.

**The store provider is declared.** `store.kind` names `drive` or `onedrive` and is never inferred
from an id's shape or a connector's name; an unrecognised value is refused as `future-schema` is.
OneDrive is reached through the Microsoft 365 connector, whose seven write and six read-only method
names are known and are now in the guard's and the journal's regexes as a union, since an unbound
write must be vetoed whatever the provider. Its create tool's parameter names and size ceiling are
not published: the onboarding skill reads them from the connector's schema in the session and
records them in `store.tools`, which prose reads. A Graph path is an acceptable OneDrive root.

**Rejected:** silencing the journal rows that transport itself generates, as the handoff proposed —
a title regex is spoofable, `parentId` is optional in the connector's schema, and deltas make it
moot at roughly three rows per sync, which 21b already tolerates. A manifest file rewritten per sync
naming every part, which is the N+1 problem in miniature and a second file to lose. An OAuth refresh
token or a service account inside the CLI, which is a long-lived credential outside the session, is
what the owner ruled out, and is unnecessary once the hook exists. Raising `--shard-bytes` on its
own, which would have re-cut every part already in the store. **Reverses if** Claude Code stops
handing a hook the Bash call's stdout, or the connector gains a real append, per Decision 21.

### 21e · The chain's state is uploaded with the rows, and a first revision from a machine that cannot see the store is refused

Running 0.6.0 in the environment it was written for found the flaw the delta design had left
standing. `journal/sync/<month>.json` holds the chain — which revision came last, how many rows it
settled — and it lives on the same disk the whole scheme exists because it cannot trust. A container
that loses it starts with no receipt, and `--stage` reads that as "this month has never been
uploaded" and proposes `rev-001`. The store's folder already held `2026-09.rev-001.jsonl` from
September 17th. Two different files with one name, and a month that cannot be reconstructed from
its own folder: the evidence corrupted by following the instructions, with no error anywhere.

**The state travels with the rows.** `--receipt` names `<YYYY-MM>.sync.rev-<NNN>.json` — the receipt
itself — to upload into the same folder, and `--adopt-state` resumes a chain from that
file alone. Numbered like a revision for the same reason: a store cannot overwrite, a folder
tolerates two files with one name, and the highest must be unambiguous from the listing. It needs no
receipt of its own, since its name carries the revision it records and its content is the proof.

**`--restore` was never the answer to this question.** It brings the month's *rows* back and
therefore needs every revision file — for one live month, 31 files and ~600 KB arriving as base64
through the model, which is the cost deltas removed, paid in the other direction to learn a number.
Adoption answers "where does the chain stand"; restore answers "I need the history here". Keeping
them apart is what makes the cheap path cheap.

**A first revision is refused where it cannot be proven.** On an ephemeral binding the absence of a
receipt is ignorance, not a fact, so `--stage` stops with exit 4 and names the state file to look
for; `--first-revision` is the operator saying they listed the folder and it held nothing. Declared,
never sniffed — the same rule as Decision 22, applied to the store instead of the machine.

**A digest nobody can compute is null.** A machine that adopted holds a window into the month, so
the whole-month digest is not available to it. Recording a hash of the tail under the name "month
digest" would be evidence that looks right and is not; the entry says `digest: null` and carries a
`chain` linking each revision to the one before, which such a machine *can* prove. `--restore`
recomputes the true month digest once it holds every file, and `local` records how much of this
machine's file a revision settled, so the divergence rule keeps working on a file that starts partway
through the month.

**Rejected:** uploading the state file under one name per month, which a store that cannot overwrite
turns into two files with one name — the very failure being fixed. Refusing `rev-001` on every
binding, which would put a question in front of the one case that is genuinely new: a durable
machine opening a company. Inferring "the store has this month" from anything the CLI can see, which
is nothing — it has no credentials, and that is the premise of the whole tool. **Reverses if** the
CLI is ever given a listing of the store's folder as an input, at which point the refusal becomes a
comparison and `--first-revision` retires.

### 21f · What travels is the head revision, and a pattern that cannot match is a silent fallback

The transport hook works, and the number it was built for is small: revision 011, one file, 12,260
bytes, no byte generated by the model, about 45 seconds, against six minutes for revision 009 by
hand. Getting there found two failures that share one shape — the system kept working, more
expensively or less completely, and said nothing.

**An `if` pattern anchored on the command name never matched.** A session runs the tool by absolute
path, so `Bash(node * journal-sync.mjs --emit*)` did not apply, and a hook whose `if` does not match
simply does not run: the upload fell back to the model reproducing every byte, which is the
behaviour the hook exists to remove, with no error and no difference in the transcript.
`Bash(*journal-sync.mjs --emit*)` matches both spellings. The general rule is in `INSTALL.md` §5b:
match on the part of a command that does not move.

**The state file was the local receipt, and the local receipt is a history.** Eleven revisions made
it 50 KB, past what a hook carries, and it arrived at 60% of itself with every step reporting
success. The fix is not a bigger budget: what has to travel is what resuming needs, which is the
head revision — a few hundred bytes however long the month runs. The history stays on the machine
that has no trouble holding it. `--emit` now also refuses anything over the transport budget rather
than printing it truncated, which is the guard that makes this class of failure loud from now on.

**Verified against the store the next day**: the pattern matches, the state file is 887 bytes, the
oversized refusal fires, and revision 012 went up as one file of 16,453 bytes in about 46 seconds
with no byte generated by the model. One more trap surfaced doing it, and it is the same shape as
the other two: **the hook copies the whole Bash call's stdout**, so a banner printed before the emit
command put 16 extra bytes inside an uploaded revision. `--receipt`'s size check caught it, which is
the second thing that check has now caught that nothing else would have. `INSTALL.md` §5b says to
run the emit line alone.

**Rejected:** giving the state file its own receipt and verification round trip, which is ceremony
for a file that is now small and whose truncation is already caught twice — by the size `--receipt`
prints, and by `--adopt-state`, since half a JSON document does not parse. Also rejected: raising
the emit budget to fit the receipt, which would have kept a file that grows without bound on the
wrong side of a fixed channel. Also rejected: having `--emit` defend against a crowded command line,
which it cannot see — the tool controls its own output and not the call's. **Reverses if** the
transport ever reports its own truncation, at which point the guard can be a check rather than a
refusal.

### 22 · The binding is explicit or declared, and never sniffed

`company-new` forbids a manifest in a home directory; the guard resolves the company by walking up
from the working directory; in a cloud session that directory is the home. Verified both ways — at
the home a store write is permitted, one level below it is refused as unbound — so the rule could not
be kept and worked, and it had already been broken in the field. A rule the mechanism makes
impossible to keep stops protecting the cases where it mattered.

`XENTHAI_COMPANY` beats the walk-up, so the rule becomes keepable rather than conditional, and it
never falls back: set and resolving to nothing, everything is refused. `"binding": "ephemeral"`
covers the case where no other directory exists, and `doctor` then declares it on every run.

**Rejected:** detecting the container (`/.dockerenv`, remote-environment variables, `cwd === homedir`
alone). A sniff is wrong in both directions, and the expensive direction is silently permitting the
ambient-authority pattern on a machine that was durable all along — the failure the rule exists for.
`atHome` is still computed, but only to decide whether a declaration is *required*, never to grant
anything. Also rejected: leaving the doctrine as an absolute and letting people keep violating it,
which is where this started. **Reverses if** the CLI ever learns which environment it is in from
something authoritative rather than inferred.

### 23 · The opportunity scan is monthly, and the daily digest is not a duplicate of it

The scaffold offered the scan semiannually. Its detectors count distinct **months**, so a pattern can
change state at most once a month and any slower cadence is latency bought for nothing. Monthly it
is, with the first two runs reporting no history — the floor is three periods — stated in the row so
that a routine which looks broken twice does not get switched off.

`tools/watch.mjs` already runs the same detectors daily into the digest, and that is a different
question rather than a duplicate: the digest publishes counts and spans with no subjects, because it
sits in a folder shared with the practice, and the scan opens those findings by name in a session
where the process, the people and the client's priorities are available. Both rows stay, and
`ROUTINES.md` now says which is which.

**Rejected:** deleting the scan and leaning on the digest, which would leave nobody interpreting what
it counts; and keeping the semiannual cadence, which the plugin's own "cadence follows the data's
refresh rate" rule does not support. **Reverses if** the monthly scan produces nothing new for two
consecutive quarters — that is the annual-review test in `ROUTINES.md` applied to this routine, and
it should be applied.

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
| Five manifest shapes were changed in one day on a guess, before either was tested against the other | H1, zero trust. A closed system answers a comparison and not an opinion, and the comparison cost one commit |
| The desktop app wrote the cause to `main.log` and it went unread through five rounds of published probes | H5 then H8, in that order. The diagnostic priority puts misconfiguration first and anchors on raw data, and a local log **is** the raw data. Every probe was an inference about a closed system that had already answered in plain text |
| A doctor fixture reimplemented `licenceFor` instead of reading the directory | A test that copies production logic drifts from it silently, and passes while doing so |
| `AskUserQuestion` was counted as an escalation in the figure the client is handed | The report's own rule that every figure carries a definition it can be audited against |
| 87 browser calls left 87 rows saying only that a browser was used | The journal's claim to record WHAT was touched, kept for files and dropped for the one write path the guard cannot see |
| `ROUTINES.md`'s own header contradicted the skill that creates it | One fact, one owner — the rule `test/scaffold.test.mjs` enforces between documents, broken inside one |
| The journal was written to a disk that gets deleted, and every surface reported healthy | `doctor` exists to find at install what would otherwise be found at delivery — and the delivery here was a quarterly report with no evidence behind it |
| The manifest rule was stated as absolute in a place where the mechanism made it impossible | H1, zero trust: a rule nobody tested against the guard that enforces it. It was violated in the first session that met the case |

### 24 · Two tracks, numbered independently, and the operación numbers do not move

Phases ran 0 to 4 in one sequence: presence 0, identity 1, voice 2, Diagnóstico 3, Mapeo integral 4.
Two things were wrong with that before anything was added to it. It asserts a dependency
`process/SKILL.md` denies in as many words — *"the process phases do not depend on `BRAND.md`,
`VOICE.md` or `PROOF.md`"* — and it has no room at either end, which is exactly where a profile
phase and a specification phase belong.

**The evidence that made the cost knowable.** The numbering is prose, not state: `status.mjs`
`OWNERS` maps documents to skills with no phase number in it, and both `process` §2 and `resume`
detect the live phase from which documents exist and which fields are pending. So renumbering is a
documentation change — 76 lines across 17 files, 40 of them the operación track. And the entry above
in *Blocked, and on whom* still reads **"A first-session dry run against a real company — Waiting on:
A client"**: no engagement has been mapped, so no journal anywhere carries a `phase 3` row whose
meaning could shift. The cost of this change will never be lower than it was on the day it was made.

**What was kept, deliberately.** The Diagnóstico stays 3 and the Mapeo integral stays 4. Inserting
the profile at 1 and the evidence sweep at 2 lands them exactly where they were, so a `--why` string
written before this release still means what it said. The specification takes 5, which was free.

**Rejected: renumbering both tracks into one sequence 0 to 7.** It doubles the churn and doubles down
on the dependency the doctrine denies. **Rejected: leaving the numbers alone and adding the new
capabilities unnumbered**, on the precedent of the nine skills that already have no number. That
precedent is real and it does not extend here: `setup`, `baseline` and `company-intake` are reached
when a condition holds, while the profile must precede the inventory and the specification must
follow the shortlist. An unnumbered mandatory step reads as optional, and the two that would have
read as optional are the two the client is most likely to want skipped.

**The cost accepted.** Both tracks now have a phase 1, so a bare number is ambiguous and every
mention has to carry its track. `resume` gained a rule about it under *What makes an answer wrong
here*.

**Reverses if** the tracks stop being independent — if some future capability genuinely requires a
voice document before a process can be mapped, one sequence becomes the honest description again.

### 25 · The playbook's chapter codes sit beside the plugin's own phase numbers, never in place of them

`CONFORMANCE.md` Ruling 4 found the plugin's operación 1-5 count answering a different question from
the playbook's own numbering — Fase 0-7 (one per whole chapter A1-A8) and A2's internal Sub-fase
labels (P, 0, 1, 2, 3) — with no row in either document saying so.

**The evidence.** `A0-marco.md` S6 maps Fase to a whole chapter; A2-mapeo.md S3-7 uses P, 0, 1, 2, 3
for its own five sub-phases; `README.md` and `tools/coverage.mjs` used a third, unrelated count that
crosses chapter boundaries (operación 3, the Diagnóstico, is A2 §7; operación 4, the Mapeo integral,
is A3 §2). Three numbering schemes answering three different questions, one of them silent about
which chapter it actually implements.

**Rejected: retiring the plugin's own 1-5 count** in favour of citing the playbook chapter alone.
Decision 24 kept that count on purpose — it is what `--why` strings already reference, what
`resume` detects from document existence, and what a returning operator remembers session to
session. Losing it to make room for a chapter code would re-litigate a decision made one release
earlier for no evidence gained: the two numbers answer different questions and a reader needs both.
**Rejected: one blanket code per track**, the shape Ruling 4's own first draft proposed
("operación 1 = A2 Mapeo"). It is imprecise in exactly the way the conflict complained about:
operación 3 and operación 4 both fall inside what a blanket "A2" would claim, when they are in fact
A2 §7 and A3 §2 respectively.

**The decision.** Every phase mention in `README.md`, `tools/coverage.mjs`'s `PHASE` table and every
skill's own description carries the playbook's specific chapter and section beside the plugin's own
number, written once per document where it helps a reader — never as a replacement, never as a
blanket per-track code. Comunicación keeps no paired code: no chapter A1-A9 covers that track, which
`README.md` now states as a deliberate scope boundary rather than leaving it to be misread as a gap
in the citation.

**Reverses if** the playbook ever restructures its own chapter numbering — at which point every
citation added here needs a coordinated update, which is the cost this decision accepts in exchange
for a citation precise enough to trust.

### 26 · The plugin adopts the A2 §2 store layout; the comunicación documents move, they do not translate

`CONFORMANCE.md` Ruling 3 found the plugin's 21 flat, English-named scaffold files holding no
relation to A2 §2's numbered, foldered layout (`mapeo-<empresa>/00-ESTADO.md` through
`99-preguntas-abiertas.md`) — a real divergence, not a restatement, confirmed by a verifier run
against the plugin's own `DECISIONS.md`, which carried no entry defending the flat English layout as
an argued choice.

**The evidence.** `packages/method/src/data/store.json` in the Web repository is the playbook's own
machine-readable statement of the layout, one row per document with its path, its signer and its
owning skill. Every plugin tool that resolved a document by name — `tools/status.mjs`'s `OWNERS`,
`tools/coverage.mjs`'s `PHASE` and `BLOCKING`, `tools/scaffold.mjs`'s file list — held its own,
independently hand-typed copy of a subset of that same information, and none of the three agreed
with the playbook's own section numbers.

**The decision.** The plugin's `scaffold/company/` is restructured into two folders mirroring A2 §2:
`mapeo-empresa/` for the operación track (renamed to `mapeo-<nombre del cliente>/` once a company is
bound) and `comunicacion/` for `BRAND.md`, `VOICE.md`, `PROOF.md`, `DESIGN.md`, `SOCIAL.md`,
`PRESENCE.md`, `CUSTOMERS.md`. `lib/store-layout.mjs` reads the vendored copy of `store.json`
(`capabilities/method/method.json`) as the single source every tool resolves a document path and an
owning skill from, so a future rename is one edit in the Web repository followed by one export, not
a hand-edit in four plugin files that can silently drift apart again.

**The comunicación documents move; they do not translate.** A2 §2 is silent on the comunicación
track — it is outside the playbook's method (X9) — so nothing in the playbook argues for translating
`BRAND.md` and its siblings to Spanish names. Moving them under `comunicacion/` is in scope for this
release because it is required to make the two-folder split real; renaming their files to Spanish is
a separate, larger cost (every cross-reference inside `capabilities/social/`, every skill that
writes them, every fixture that copies them) with no argued benefit yet.

**Rejected: renaming the comunicación files to Spanish now**, on the precedent the operación track
just set. The precedent does not extend automatically: the operación rename was argued from the
playbook's own text (A2 §2 names the files in Spanish because A2 §2 IS the operación track); no
playbook chapter names the comunicación files at all, so a Spanish rename there would be invented,
not derived. **Rejected: leaving the comunicación files at the store root**, unfoldered, on the
argument that they need no rename. Ruling 3's own layout puts every document under one of the two
folders; a root-level exception would leave the store partially migrated with no principled
boundary for what stays and what moves.

**Reverses if** the first client engagement opens the comunicación track for real — at which point
translating `BRAND.md` and its siblings to their Spanish A2-style names stops being invented and
starts being informed by what a director actually needs to read.

### 27 · `PROCESS.md` §5 adopts X3 as the scoring instrument; Wanner et al. and the judgement ceiling retire

`CONFORMANCE.md` Ruling 1 found `PROCESS.md` §5's five-criteria Wanner et al. (ICIS 2019) research
score, capped by two separately-scored judgement criteria (error cost, regulatory constraint),
contradicting the playbook's own X3 instrument — eight weighted criteria, a formula normalised to
20–100, three vetoes and four decision bands. The item's verifier run failed, so the owner ruled
directly from the plan's pre-existing resolution on 2026-09-17 rather than reissuing it to the
queue.

**The evidence.** X3 is not a competing rubric invented for this ruling: `03-portafolio/PUNTAJES.md`
and the ficha of `X3-rubrica-priorizacion.md` §4 are the playbook's own scoring artefacts, cited
from `A3-portafolio.md` §2 as the reference instrument, and `packages/method/src/data/x3-scoring.json`
in the Web repository is the machine-readable statement of its eight criteria, weights and formula
— vendored here as `capabilities/method/tables/x3-criteria.md`, `x3-scales.md` and `x3-decisions.md`.

**The decision.** `PROCESS.md` §5, `skills/process-access/SKILL.md` §4 and
`scaffold/company/mapeo-empresa/05-backlog.md` §2 replace the five Wanner criteria and the
two-criterion judgement ceiling with X3's eight criteria (C1–C8, weights summing to 18), the
`Puntaje = (Σ calificación × peso ÷ 90) × 100` formula, and the three vetoes — C3 or C5 at 1 blocks
the start; C4 at 1 or 2 forces resolving the data gap first; no frozen baseline, no start — in place
of the old research-score/ceiling split. `DECISIONS.md` #9 is narrowed, not repealed: see the entry
above.

**Rejected: keeping Wanner et al. plus the judgement ceiling** as a second, plugin-only instrument
running alongside X3. Two scoring rubrics for the same shortlist is a worse failure mode than either
alone — a client sees two numbers for one opportunity and asks which one is real, and there is no
principled way to answer that does not amount to picking X3 and pretending otherwise. **Rejected:
keeping the research/judgement framing but relabelling it "X3"** — the two instruments do not share
criteria (X3 has no "execution time" or "failure rate" criterion, and the plugin's "error cost" and
"regulatory constraint" are absorbed into X3's C5 risk veto and the committee-authorisation step,
not restated as separate columns), so this would have shipped X3's name over the old numbers rather
than the old numbers.

**Reverses if** the playbook itself revises X3 — at which point the vendored tables change under
`packages/method` and this doctrine follows them, the way it follows every other vendored number.

### 28 · Maturity doctrine re-anchors on A9's six-dimension model; the Anthropic ladder becomes a per-person usage instrument

`CONFORMANCE.md` Ruling 11 (and Ruling 5's owner decision on A9 §5 versus `MATURITY.md` §3) found
`MATURITY.md` describing itself as the company's maturity model, using an Anthropic-published 0–4
adoption ladder and a six-month Evaluate/Pilot/Scale shape, while the playbook's own A9 already
defines the company's level as the minimum of six dimensions (Gente, Datos, Gobernanza, Medición,
Liderazgo, Promesa) diagnosed against twenty yes/no statements, inside a twelve-month, four-quarter
route.

**The evidence.** The two constructs measure different axes on different subjects, not one construct
under two names: A9's M0–M4 is a company-level ceiling on what may be promised, set by the *lowest*
of six dimensions and evidenced by the statements in `capabilities/method/tables/a9-statements.md`
against the level descriptions in `a9-levels.md`; the Anthropic ladder describes what one *person*
can do with the tool, with no dimension and no minimum rule. Forcing them into one scale loses the
minimum-of-dimensions finding no company-grain scale can produce, and loses the Anthropic ladder's
own argued evidence — the artefact-per-level rule and the "whose level moved" dependency test —
which the playbook did not have and which this doctrine is not willing to discard.

**The decision.** `MATURITY.md` re-anchors on A9: the company's level is M0–M4 by the minimum of its
six dimensions, linked to `a9-levels.md` and `a9-statements.md` rather than restated by hand. The
Anthropic 0–4 ladder is retitled and demoted to a per-person **usage** ladder feeding A9's Gente
dimension (never called a "maturity level"), and its published six-month Evaluate/Pilot/Scale shape
is reframed as the per-department pace nested inside A9 §5's first two quarters (T1 diagnóstico, T2
despliegue) — the same owner decision that resolved Ruling 5. "Whose level moved" and the
artefact-per-level table (§7) carry over verbatim: the playbook has no rule of its own that would
produce either finding, so nothing here is discarded.

**Rejected: keeping the Anthropic ladder as the company-level model.** It has no dimension structure
and no minimum rule, so it cannot produce A9's central finding — that impeccable data with no
governance is not a level, because the missing dimension is what decides what can be promised. A
model that averages or ignores that finding is theatre dressed as measurement, which is exactly what
A9 §1 exists to refuse. **Rejected: discarding the Anthropic ladder outright** once A9 governs the
company level — its artefact test and dependency finding are argued evidence the playbook itself has
no equivalent for, and CONTRIBUTING.md's own rule is that argued evidence is answered in writing, not
deleted because the parent question was reassigned.

**Reverses if** the playbook adds an artefact-per-person rule of its own to A6 §2, at which point the
per-person usage ladder is redundant with playbook doctrine and is deleted rather than kept as a
second name for the same thing.

