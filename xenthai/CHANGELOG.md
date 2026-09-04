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

Nothing merged and unshipped.

## [0.2.0] - 2026-09-04

Everything 0.1.0 did not cover. 0.1.0 was social only; this turns the plugin into a company-wide
engagement — intake, the process inventory and its scoring, the baseline, the reporting, the
routines and the first-visit setup — and adds the installation fixes without which none of it
reached a client machine at all.

### Fixed — installation

- **The render engine no longer breaks when its dependency is absent.** `package.json` claimed the
  CLI installs a plugin's dependencies when it copies the plugin into its cache. It does not, in any
  version tested. `node_modules` is gitignored, correctly, so no marketplace clone carries
  `playwright-core` either, and `capabilities/social/engine/render.mjs` imported it at its top level
  — which made the whole module unloadable on every fresh install, `--help` included, on a module
  resolution error that named a package rather than the missing step. The driver is now resolved with
  `await import()` at first use, the way `bin/doctor.mjs` already did, and the failure message
  separates the two absences that were previously conflated: a missing driver is this plugin's own
  install and takes two seconds of npm, a missing browser is the machine's and on macOS and Linux is
  a download.
- **`hooks/bootstrap.mjs` installs that dependency at SessionStart** when the plugin's copy lacks
  it, which is what its `statusMessage` has always promised and what its 60s timeout was always
  sized for. One `existsSync` on every session after the first. Locked in the system temp directory
  and keyed by plugin root, because npm is not safe to run concurrently against one prefix and four
  sessions can open at once. Fails open, like the journal hook.
- **`scripts/install.ps1` installs into either plugin store, or both,** retrying the steps that fail
  for reasons that are not this plugin's. Cowork and Claude Code keep separate stores — Cowork's
  under `~/.claude/cowork_plugins`, reached with the undocumented `--cowork` — and installing into
  one leaves the other empty with no hint that a second store exists. On a machine with Defender
  real-time protection enabled, `marketplace add` and `install` fail intermittently with `EPERM` on
  a rename or `EBUSY` on a remove, because the scanner holds a handle on the files the CLI has just
  written at the moment the CLI moves them into place; observed failing five times and succeeding on
  the sixth with nothing changed between attempts. The script is UTF-8 with a byte-order mark,
  without which Windows PowerShell reads it as ANSI and its non-ASCII characters desynchronise the
  parser.
- **`claude plugin details` is not proof of installation**, and treating it as proof reported a
  failed install as complete. It resolves a plugin from the marketplace catalogue whether or not it
  is installed, so it will list all 21 skills for a plugin that was never installed. The installer
  verifies against `claude plugin list`, which reads the store's own record — the only thing that
  decides whether a session loads anything.

### Changed — manifests

- **`license` names the license instead of pointing at the file.** `plugin.json` carried npm's
  `SEE LICENSE IN LICENSE`, which is not a license identifier; it now carries `FSL-1.1-ALv2`, the
  abbreviation the LICENSE file declares for itself. `package.json` takes the npm form, which is
  what npm accepts for a license outside the SPDX list. The two were exactly reversed.
- **Both manifests declare their `$schema`**, so an editor validates them before the CLI does.
- **The marketplace entry carries the metadata the manifest carries** — displayName, author,
  homepage, repository, license and keywords — so the catalogue and the installed plugin describe
  themselves the same way instead of the catalogue describing less.
- **`test/hooks.test.mjs` reads the shipped version from the manifest** instead of asserting a
  literal `0.1.0`, which made every version bump fail this repository's own test suite and put the
  release gate behind a test edit.

### Added

- **The language a document is written in is now a control** (`CONTROLS.md` §4c), enforced in two
  places because it has two halves. `doctor` refuses a manifest whose `locale` this toolchain cannot
  honour: every client-facing part is Spanish by construction — the scaffolds, the six report
  templates, `bin/report.mjs`'s prose, and the readability index whose scale and syllable rules are
  Spanish-only — so a manifest declaring `en-US` would have produced Spanish documents while claiming
  otherwise. `locale` had until then been declared in every manifest and **read by nothing**, which is
  worse than not having the field: it looked like a control and was decoration.
- **`status` audits the language of what actually landed in the store**, which is the half the
  manifest cannot speak for: the scaffolds ship in es-MX and a session fills them, so a document
  could carry Spanish headings and English content and look finished. A document in the wrong
  language exits 1, the same severity as a missing one, because both look like progress. It abstains
  below twenty-five words of prose rather than flagging every fresh scaffold.
- **The audit covers the deliverables the scaffold list cannot name.** A report and a month's plan
  live in dated subfolders, and they are what a director reads and what goes to review, so
  `reports/` and `content/` are scanned rather than listed. `journal/`, `digest/` and `feedback/` are
  never audited, and those exclusions are asserted: the journal carries English event names by
  design, the digest is written for the practice, and feedback is about the plugin and must stay
  English so one client's experience improves every other install.
- **The copy inside rendered assets is audited through `pieces.json`.** A PNG's words are pixels and
  cannot be checked, but the render is deterministic from that file, so measuring the source measures
  the published result exactly — the last point at which a client's public copy is still checkable.
  Every string in a piece counts as copy except a short token list, deliberately the inverse of a
  copy-field list, so a new archetype's text is measured by default rather than invisible until
  somebody remembers it.
- **Document adoption** (`INTAKE.md`, `company-new`, `company-intake`). A store is not always empty
  when the plugin arrives, and nothing handled that — `company-new` created the root folder assuming
  it was new, and `company-intake` requested files without reading the store it was about to write
  into. Overwriting is loud and recoverable; **treating an inherited document as captured is silent**
  and corrupts everything downstream, because three of this plugin's rules key off provenance and an
  inherited document satisfies none: no name in `INTERVIEW.md`, no `PROOF.md` row, no measurer. So an
  adopted document is a third state — neither pending nor captured — and nothing in it is published
  or reported until somebody re-establishes where each fact came from. The exception is a baseline: a
  before cannot be reconstructed once the work has changed, so an adopted measurement is kept,
  labelled, and paired with a fresh one.

### Changed

- **The marketplace is added from one surface only, and the runbooks say which.** The desktop app
  refused to add this catalogue for a day, reporting only that the sync failed. Its own log carried
  the cause: the app sends `https://github.com/Xenthai/Plugin`, `claude plugin marketplace add` had
  already written `{source: github, repo: Xenthai/Plugin}` into `settings.json` under the same name,
  and a source whose kind disagrees with what is declared is refused. Both spell the same repository;
  neither side normalises to the other; the error reads as a URL problem, so the operator retypes the
  URL, which cannot help. `DECISIONS.md` §17 carries it, and §16's stated mechanism is corrected there
  — the run that produced it carried this mismatch too, so only one of two causes was ever varied.
- **The bundled fonts were renamed off their upstream `Archivo[wdth,wght].ttf` form.** A bracket has
  to be percent-encoded in a URL and quoted in a shell, the axes it documents are already inside the
  file, and the cost is paid by whichever consumer forgets. `doctor` derives each licence filename
  from its font's, so that derivation moved with them — and its fixture, which had reimplemented the
  same derivation instead of reading the directory, now lists what is on disk.
- **The repository is now the marketplace, and the plugin moved to `./xenthai` inside it.** This is
  the shape `fru-dev3/AI-Ready-Life` uses and the only one observed working in the desktop app: a
  relative source resolves there. The stronger claim first made here — that a URL source *fails* —
  does not hold, because the run behind it also carried the settings mismatch above, which alone
  explains that failure. One of two causes was varied. The install line for a client is unchanged
  after `marketplace add Xenthai/Plugin` replaces `Xenthai/Marketplace`; a working-copy install now
  points at the checkout's root, and the `xenthai-dev` catalogue is gone because one catalogue serves
  both. `DECISIONS.md` §16 carries what is established and what is not.
- **Language detection is validated externally**, not on this repository's own files. Both signals
  are named families in the literature (Cole et al. 1997: "short words … diacritics and special
  characters"), and the standard character-n-gram method was deliberately not adopted because it
  needs a trained profile per language and solves a harder problem — Vatanen et al. (LREC 2010) test
  281 languages on 5-to-21-character samples for 72.5% average recall, while this task is binary
  with a strong prior. Against floors of 150 function words and 40 accents per thousand: Mexican
  consumer-protection law scores 396, a Wikipedia article 394 and 134, a Mexican company's own
  buttons and taglines 219 and 188, and an English business report 1. This repository turned out to
  be the harder sample in both directions, so the floors were calibrated conservatively by accident.
- **Two signals combined with OR, because each catches what the other misses.** A 26-word Spanish
  extract with zero accents passes on function words; telegraphic marketing copy below the
  function-word floor passes on accents. Requiring both would reinstate the bug that found this — a
  real es-MX chart piece reported as foreign, which is the worse failure of the two, because a check
  that flags correct work teaches its reader to stop looking.

### Fixed

- **`bin/legible.mjs` refuses text that is not Spanish.** Every part of the index is Spanish-only and
  none of it failed loudly on English: this plugin's own `INSTALL.md` scored 87 and *muy fácil*
  several times before the guard existed, because a Spanish formula on English still lands inside its
  plausible range and still prints a band. A wrong answer that looks right is the worst class, and
  this was the tool built to catch that class failing to catch its own.
- **The language floor is separate from the readability floor**, at twenty-five words against a
  hundred. They fail differently at small samples — readability is a mean over sentences, language is
  the frequency of a language's commonest words — and sharing the readability floor meant every short
  deliverable, a one-page biweekly report included, escaped the check entirely.

### Added — the routines and the setup

- **`setup` skill** — the whole first visit, in the order that works, closing by reporting which of
  seven steps are done and which are owed rather than by declaring success. It sequences
  `company-new` and `company-intake` rather than repeating them, and it exists because the sequence
  has a step that must precede the binding: Drive's OAuth. The four steps a person must do are named
  as such, with why none of them is a gap in the plugin — a plugin cannot declare or install a
  connector, and "anyone with the link" is not in the API surface the Drive connector reaches.
- **No routine carries an absolute path any more, and the engagement folder moved inside the synced
  Drive folder.** A plugin is cached at `cache/<marketplace>/<plugin>/<version>/`, so its absolute
  path changes on every release — a routine prompt with the plugin path written into it works until
  the next update and then fails, with a stale digest as the only symptom, which sends the operator
  looking at the machine and the schedule when the cause was a release. The prompt now reads the
  path from the session's own start-up announcement and refuses rather than guessing when that line
  is absent. Approving a task's command has the same shape, so a release can require approving again.
- **The journal is now durable and the client has their own copy.** It is written to
  `<engagement folder>/journal/execution/`, and that folder was documented as living anywhere on
  disk — so it existed on exactly one machine, and that machine dying took the whole audit trail and
  the ability to report with it. Worse, every report already instructs the client to check its
  SHA-256 **against their own copy of the journal**, and they had none: the verification block was an
  instruction nobody could follow. Putting the engagement folder inside the synced company folder
  fixes both with no code, and drops every path from the digest routine — the working folder is the
  engagement folder, so the journal is `.` and the digest is `../digest`. Asserted against that exact
  layout.
- **Every routine runs as a Claude Desktop scheduled task** — the Programado section — and the
  scheduling doctrine now says so as a decision rather than leaving the mechanism per-routine. An
  operating-system task is technically better for the deterministic ones, since it costs nothing,
  needs no app open and cannot stall on a permission prompt. It was deliberately not chosen: one
  interface shows every routine with its run history and its skipped runs, pause and run-now live
  there too, and registering an OS task needs elevated PowerShell that a client's own IT may refuse
  — a setup step that sometimes cannot be performed is worse than a slightly weaker one that always
  can. What it costs is stated once so nobody rediscovers it: a stopped routine is ambiguous from
  outside the machine, because the machine may have been off, the app closed, or the task stalled.
  The claim that the digest runs "with no Claude, no connector and no network" was true of the OS
  task and is now false, so it is gone from every document — the *computation* needs no model, the
  *schedule* does, and that distinction is the honest version.
- **Scheduling doctrine** (`capabilities/company/doctrine/SCHEDULING.md`), written after checking the
  published behaviour of all three mechanisms rather than assuming. Cloud routines are disqualified
  here for three independent reasons, any one of them sufficient: they have no access to local files
  and the journal is the entire input; they belong to an individual account and consume its
  allowance; and the form is repository-centric while a company's material is in Drive. `/loop` and
  `CronCreate` are disqualified by being session-scoped and expiring after seven days. So the rule
  is one question — does this routine need a model? No means an operating-system task, yes means a
  Desktop scheduled task, which is the only mechanism that both persists and reads local files.
  Carries each remaining routine's ready-to-use configuration, and the case where a scheduled task
  is the wrong answer even though it would work: a cadence report carries claims, so what gets
  scheduled is a reminder, not the report.
- **The silent failure in Desktop scheduled tasks, documented.** A task whose permission mode does
  not pre-approve a tool it needs **stalls waiting for a person** — it does not fail and does not
  retry, so the routine has stopped with no error anywhere. Creating the task is therefore not
  finishing it: run it once, answer every prompt with always-allow, and confirm the output appeared.
  Two further properties go into every routine prompt rather than being discovered: a missed run can
  arrive many hours late with exactly one catch-up, so each prompt states its own window; and each
  run starts with no memory of any conversation, so each prompt is self-contained.

### Added — earlier in this cycle

- **A digest that runs with nobody present** (`bin/watch.mjs`). The one part of this plugin that can
  honestly be called automatic, because it needs no model: plain arithmetic over a local JSONL file,
  no session, no connector, no network, no API cost. It answers the question no other tool here can —
  **how long has it been quiet** — measured against each client's own median gap between active days
  rather than a fixed threshold, since a client recording twice a week and one recording daily have
  different silences. Ten signals across silence, capability and risk, each carrying the question it
  raises and a verdict of OK, WATCH, ACT or UNKNOWN. No composite score, and a worst-of verdict
  instead: averaging a silence signal against a governance defect would hide whichever one mattered.
  It exits 0 whatever it finds, because a scheduled task that fails on a finding gets disabled after
  the second alert. **Counts, dates and verdicts only** — never a file name, a target, a reason or a
  person's name — which is what lets it sit in a folder shared with the practice without the practice
  becoming a processor of the client's personal data. `INSTALL.md` §6b carries the Drive-for-Desktop
  path, the Viewer share on the digest folder alone, and the scheduled task.
- **`feedback` skill** — the second improvement loop, and the one nothing covered. `opportunities`
  improves the client's company; this improves the instrument, for every client. Signal comes from
  the record before the operator is asked: what recurred, what never filled, what never fired, what
  the digest has been saying. Findings are classed defect, gap, friction or excess, each with a
  different bar to change, and **excess is the class this practice will under-report** because nobody
  complains about a feature they ignore. The report carries nothing about any company by design — if
  a finding cannot be stated without naming the client, it is a company finding and does not travel.

### Added — earlier in this cycle

- **Opportunities capability** (`bin/opportunities.mjs`, `skills/opportunities/`). Reads a company's
  own journal and reports what recurred — the document reworked every period, the escalation reason
  that keeps returning, the step that has been failing for months without anyone reporting it. The
  floor counts **distinct periods, not occurrences**, because three edits in one afternoon is one
  event and three across three months is a pattern; below the threshold it refuses rather than
  reporting a shorter list. Nothing is scored or ranked on one axis, since a composite improvement
  score is indefensible at n=1 and ranking would smuggle one back in. Every finding carries the
  **question it raises, never a recommendation**: recurrence is the only part a journal proves, and
  whether the work is autonomous and reviewable it cannot see. `PROCESS.md` §8 carries what this
  replaces — the execution-time and failure-rate criteria in the suitability score, normally filled
  from recall that runs high by a median of 47%, become measured values with the periods they cover.
- **A readability floor for the documents an operator has to act on** (`bin/legible.mjs`).
  Szigriszt-Pazos perspicuity on the INFLESZ scale — Spanish-validated, not a translated Flesch —
  over a document's prose, with markdown tables, fenced blocks and frontmatter excluded. Floor 55,
  target 65 for the failure-recovery section, and the score is stated as a screen rather than the
  test: the test is an operator performing the failure step from the document, unaided and timed.
  `HANDOVER.md` §5b carries why there are two numbers; `AUTOMATIONS.md` grows the rows that record
  who ran the operator test and where they stopped. All eighteen client-facing scaffolds clear the
  floor, and the suite now gates every one of them.
- **Session doctrine** (`capabilities/company/doctrine/SESSION.md`), reachable from all eight skills
  that fill a document by interviewing a person. Leads with the rule that silently corrupts
  everything downstream in this market: with a director in the room an operator gives the
  director's estimate in their own voice, and no later step can detect it.
- **Source verification in every report.** `bin/report.mjs` prints the SHA-256 of the exact bytes it
  read, with the row count and the check command for Windows as well as Unix. Not a hash chain —
  whoever computes one can recompute it, so it proves nothing against the parties who matter. The
  anchor is that the report comes to rest in the client's store, whose revision history this
  practice cannot rewrite. The block states its own limit: it pins the file forward, not backward.
- **The client's name in the session title**, set by the `SessionStart` hook when a company is bound
  and deliberately not set when none is. Writing one company's material into another company's store
  is the worst thing this plugin can do, and it happens by looking at the wrong window.

### Changed

- **Skill descriptions cut from a 689-character mean to 522**, recovering 2,844 characters resident
  in every turn of every session. What came out was the enumeration of trigger phrasings and the
  restatement of workflow; every routing clause and prerequisite invariant stayed.
- **The frontmatter assertion** now enforces the Agent Skills spec's six fields rather than exactly
  `name` and `description`. `allowed-tools` is spec-legal and is declared by fifteen first-party
  skills, so the old rule asserted something false.
- **Manifests aligned**: one name (`xenthai`) across `plugin.json` and `marketplace.json`, the
  redundant `skills` field and a dead `$schema` removed, `displayName` and `homepage` added.
- **The ambient journal hook is gated on a bound company**, so it cannot observe tool I/O in an
  unrelated project — the condition the published marketplace policy fails a hook for.
- **Four stale ground truths corrected in the trigger dataset.** They expected `none` for
  capabilities that now exist, including one query that is verbatim the `opportunities` case. An
  evaluation that penalises the correct answer is worse than one with a coverage gap.

### Fixed

- **A missing journal no longer reads as a quiet month.** The hooks that write it are inactive in
  chat on the web and in the Desktop Chat tab, so a report asked for there found no rows, no error,
  and reported a clean period. Both the tool and the skill now name which of the two it is.
- **The `report` skill body** exceeded the 12 KB ceiling the suite enforces; attribution and
  figure-reading moved to `REPORTING.md` §10b/§10c rather than the ceiling moving.
- **The bootstrap hook stopped swallowing its own failures.** The binding announcement is a control,
  and an operator who never sees it has lost the control without being told.

### Added — earlier in this cycle

- **Process capability** (`capabilities/process/`, three skills). `process` routes phases 3 and 4;
  `process-map` runs the inventory breadth-first; `process-access` ranks pain, records who holds
  which access as a reference rather than a credential, and scores the automation shortlist.
  `doctrine/PROCESS.md` carries SIPOC boundary-setting, the capture and governance fields, the
  Wanner et al. (ICIS 2019) suitability criteria, and the two expert-judgement criteria labelled as
  judgement rather than research so a score cannot launder an opinion into evidence.
- **Baseline capability** (`capabilities/baseline/`, one skill). Company-wide, not per-channel:
  `baseline` captures a dated before-and-after across process, systems, people and maturity
  layers. `doctrine/MEASUREMENT.md` carries Little's Law as the reason throughput is measured
  separately from cycle time — a person can report the same duration and produce three times the
  output — the direction of recall bias, the paired quality metric every throughput figure
  requires, and Contribution Analysis as the only defensible attribution at n=1.
- **A `chart` archetype in the render engine**, so a before-and-after figure is composed by the
  same pipeline that already asserts exact dimensions, safe zones, embedded fonts and exact pixel
  colour — rather than by a charting library, which would add a dependency, duplicate a tested
  pipeline, and produce output bypassing those assertions. It **prints every value as text beside
  its bar**, because a bar read by length is a value the reader estimates and an estimate is not a
  measurement; it scales bars against the largest value present rather than a truncated axis; and
  it **refuses to render without `piece.basis`**, which carries the definition, the measurement
  dates and who measured. Covered by the template suite: 36 assets across 9 archetypes and 4
  targets.
- **PDF output from the render engine** (`--pdf`). Chromium prints natively, so no dependency was
  added; the page box is the target size at 96dpi so one CSS pixel is one PDF point and the
  composition matches the PNG rather than reflowing onto paper. The PNG is still produced and still
  carries every assertion — the PDF is an extra artefact, never a substitute for the verified one.
- **Six cadence templates** (`capabilities/report/templates/`, es-MX) — one per cadence plus the
  mapping-close record. Each declares the single question it answers, carries its mandatory
  sections, and names what it will never contain. `test/report.test.mjs` refuses a template that
  lost its question line, and asserts the doctrine structurally: the biweekly forbids an outcome
  claim, the quarterly withholds attribution and hands it to the semiannual, the semiannual
  requires alternative explanations answered with evidence, the annual carries the claim ledger and
  the option of not renewing, and the mapping-close contains no achievement.
- **Reporting cadences** (`capabilities/report/doctrine/REPORTING.md`) — five cadences, each
  answering a question the others cannot, because the failure mode of a multi-cadence routine is
  five reports saying the same thing at different intervals, which trains a client to stop reading
  all of them. **Cadence follows the data's refresh rate, not the calendar:** a biweekly report
  carries no outcome claim at all, because two weeks is too few instances for a median to be
  stable, while the quarterly is the first that may report a result. The semiannual is the
  contribution-analysis report and carries the section almost nobody writes — what was
  recommended and not done, and what it cost. The annual carries the **claim ledger**: every
  figure claimed during the year and whether it held.
- **`ROUTINES.md`** — the per-company register of planned tasks and their cadence, agreed once at
  the end of mapping. A routine written down **is** its approval, which is what lets it run
  afterwards with no gate; it also records what each routine costs the client, and the annual rule
  that a routine nobody reads gets removed.
- **The mapping-completion report**, proposed by `process-access` as the last act of phase 4. It
  contains no achievement, because nothing has happened yet — every measure with its definition
  verbatim, its source, its date and its measurer, plus what is documented versus client-reported
  and the scope statement saying what a later report will and will not be able to claim. **The
  client signs it as agreement on the starting numbers**, so the before cannot be relitigated at
  the moment the after looks good.
- **`automate-handover` skill and `capabilities/automate/doctrine/HANDOVER.md`** — the acceptance
  document that closes an automation build, written the day it goes live rather than at the next
  cadence. Its test is that **the client can switch the automation off, alone, without calling
  Xenth AI** — a client who cannot switch it off does not own it. It answers what happens when the
  automation is wrong (designing for the wrong-but-plausible output first, since bad input merely
  stops and a downed system merely fails loudly), who pays for and administers the platform with
  its renewal date, and which journal events it writes so touch time is measurable after the fact.
  It also settles a rule that is easy to get backwards: the plugin depends on nothing that charges,
  but a client may bring a platform that does — what is refused is an automation that only works
  because Xenth AI pays for something, since that is a dependency the client inherits at renewal
  without knowing it.
- **`AUTOMATIONS.md`** — the register and handover record, one replicated block per automation.
- **Presence capability** — `social-presence` runs as **phase 0**, before identity and before voice,
  because the "before" is perishable: after phase 1 the operator has already influenced what there
  is to observe. It produces `PRESENCE.md`, which is **append-only** — a dated observation is never
  edited, only added to. A thin version of this already existed as section 6 of `SOCIAL.md`, owed by
  the *planning* phase, which meant the independent baseline was captured two sessions late and
  inside a document that gets rewritten. That section is now a pointer plus the frozen definition
  the plan will be measured against.
- **`capabilities/social/doctrine/PRESENCE.md`** — what is observable per platform with no account,
  verified in a logged-out browser against real companies rather than from documentation, and the
  reason no industry benchmark comparison is honest. The decisive fact is an access constraint, not
  an opinion: reach and impressions are retrievable only for accounts that authorised the requesting
  app, so a large-sample benchmark must use followers as its denominator and a reach-based one can
  only cover the vendor's own customers. Published vendor figures for the same platform and year
  differ by up to 18 times, differ by half again in the direction their own formulas cannot explain
  when denominators match, and **invert which platform performs best** — which no denominator
  artifact can do, so they are measurements of different quantities wearing one name. Carries the
  sampling rule (a structured sample plus a random sample at one tenth its size, whose only purpose
  is to prove the structured one was representative), a review-cadence floor with a signed
  government memorandum behind it, and the only source in the corpus that may be copied verbatim
  into a client deliverable.
- **`capabilities/company/doctrine/REGULATORS-MX.md`** — every article a Mexican regulator can act
  on, verified against the official texts with their reform dates: PROFECO's Art. 32 and the
  revenue-linked ceiling that makes exposure scale with company size, its own list of the ten most
  frequent violations, IMPI's comparative-advertising safe harbour and the April 2026 paragraph
  extending sanctions to conduct carried out using artificial intelligence, COFEPRIS's permit regime
  which expressly covers digital platforms, the credit-cost disclosure that fails in
  character-limited formats, and the 2025 data-protection law that replaced INAI — so a privacy
  notice naming INAI dates a client's last compliance review in one thirty-second check.
- **`capabilities/company/doctrine/STANDARDS.md`** — what may be claimed and what may be copied.
  There is no certification anywhere for brand, reputation or communications work, and the personal
  credentials that do exist accredit a person, never a work product. The trap is reproduction: ISO's
  terms, tightened on 29 May 2026, require a separate licence to put standards text into reports,
  presentations or products offered to third parties, prohibit AI use of that text outright, and
  cover one named person per licence — so a purchased standard is the one document class that must
  not go into a company's shared store.
- **`company-new` skill** — the first step of an engagement, which until now was a manual copy of a
  JSON template. It asks the five fields nothing can infer, writes the manifest, creates the
  company's root folder in its store, and verifies the install can reach it. The order is forced by
  the guard rather than chosen: a local write with no company bound is permitted and a store write
  is vetoed, so the manifest must exist before the folder can be created. Getting this step wrong is
  the one mistake in the system that is both invisible and permanent — a duplicated `id` merges two
  clients' journals, a wrong `store.root` writes one client's material into another's store.
- **Company capability** (`capabilities/company/`, two skills). `company-intake` asks for the files
  a company already maintains and maps from those instead of interviewing for every fact;
  `doctrine/INTAKE.md` carries the document-to-fact table and the three facts confirmed with a
  person even when a document states them. `company-offer` captures what is sold and on what terms.
- **Nine more scaffolds** (es-MX): `INTAKE.md`, `INTERVIEW.md`, `PEOPLE.md`, `SYSTEMS.md`,
  `OFFER.md`, `PRODUCTS.md`, `SERVICES.md`, `CUSTOMERS.md`, `PROCESSES.md`, `BASELINE.md`. Every
  scaffold declares a schema version, so a later change is a migration rather than a guess.
- **`bin/status.mjs`.** Reports, per document, whether it exists, how many fields are still pending,
  and **which phase owes it**. A field nobody owns stays pending forever; the owner map is checked
  against the skills on disk, so a scaffold no phase fills is reported as a plugin defect. Invoked
  by both routers for phase detection — a document that exists but is entirely unfilled reads as
  the unstarted phase it is, which reading the file list alone cannot tell.
- **`bin/report.mjs` and the `report` skill.** Turns journal rows into an engagement report without
  copying client content out of the store.
- **`bin/doctor.mjs` and the `doctor` skill.** Verifies that this machine and the bound company's
  connectors can do the work before a session promises it.
- **Four more test suites.** `skills.test.mjs` holds every skill to the invariants that decide
  whether it loads and fires at all — depth 1, exactly `name` and `description`, name equal to its
  directory, a body between 2 and 12 KB, a trigger clause, a sibling named for routing, a STOP
  section. `process.test.mjs`, `baseline.test.mjs` and `status.test.mjs` cover the new capabilities.
  Each suite proves its assertions bite with negative fixtures.

### Changed

- **`test/run.mjs` discovers suites by glob** instead of an enumerated list in `package.json`. The
  list was a single file four parallel writers had to edit, and a suite added without editing it
  ran nowhere.
- **Every skill that interviews now appends to `INTERVIEW.md`**, naming who said what and when. A
  figure stated from memory is only defensible later if its source is recoverable.
- **The `social` router declares STOP conditions.** It had prohibitions but no instruction for the
  ambiguous case, and it is the skill most likely to be invoked cold.

### Fixed

- **`scaffold/company/PROCESSES.md` declared its state without declaring its schema**, so it was
  the one document a later migration could not place.
- **`scaffold/company/BASELINE.md` used the word *verificados*** to describe how facts were
  established. The word asserts an accreditation nobody in this practice holds — the exact claim
  the measurement doctrine refuses.
- **`capabilities/process/doctrine/PROCESS.md` omitted the breadth-before-depth rule** that decides
  whether a mapping engagement is one session or six. It lived only in `process-map`, where a
  builder reading the doctrine would not find it.
- **Two test suites shared a sandbox directory**, so one suite's cleanup deleted another's fixtures
  mid-run. Each suite now owns a named subdirectory.
- **The render engine could report a passing asset for content that never reached the page.** A
  value-taking option immediately before `--pieces` consumed it, the template fell back to its demo
  placeholder, and because the placeholder is deliberately well composed it cleared every
  geometric assertion — a green report on a placeholder. Found while adding `--pdf`, which was the
  option that consumed it, because only `json` and `help` were registered as boolean flags. Both
  halves are fixed: flags are now declared in one set, and the template marks the document when no
  piece data arrived so the engine exits rather than measuring a placeholder.
- **`doctor` did not validate `store.root` at all.** `readCompany` checks that `store` exists, not
  what is in it, so an install where the operator copied the template and left
  `ID-DE-LA-CARPETA-RAIZ` in place reported healthy and failed at the first delivery — the exact
  class of failure `doctor` exists to find two minutes after install. It now fails on an unset root,
  on the template's placeholder, and on a URL or path where an id belongs.
- **`ROADMAP.md` listed ten finished items as pending** — `process`, `baseline`, `report`, `doctor`,
  CI, the install runbook, the plugin version on journal rows, and the OFL texts in the delivery
  package among them — and duplicated four items across two horizons. A roadmap that lists finished
  work sends the next builder to rebuild it, which is the same failure as a journal with gaps.
  Shipped work now has its own section, and Horizon 1 states what actually stands between this and a
  first real client.

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
