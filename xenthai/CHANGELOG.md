# Changelog

All notable changes to the Xenth AI Plugin are recorded in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the version numbers follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**There is no release gate any more, and this file is a record rather than a permission.** Neither
manifest declares a `version`. A declared version pins the plugin — the CLI hands an existing
install an update only when that string changes — so every fix merged between two bumps was
unreachable by anyone who had already installed, which is exactly how 0.1.0 sat on client machines
while four hundred lines of merged work waited here. Absent from both manifests, the version
resolves to the commit, and every push reaches a client. Three consequences govern this file:

- **A push is a release.** There is nothing merged and unshipped, so there is no `[Unreleased]`
  section; `test/ops.test.mjs` fails if one reappears. Write the entry in the commit that ships the
  work, because there is no later moment when it ships.
- **The headings are dated, and their labels are names, not gates.** `[0.2.0]` names the release
  that turned this into a company-wide engagement; it no longer pins anything and no manifest
  repeats it.
- **`package.json` keeps its own number**, which npm needs and the plugin system never reads. It is
  not the plugin's version and nothing checks the two against each other.

Every journal row carries `plugin: <version>`, and that value is now the commit the plugin was
installed from. It identifies exactly one tree, which is what this claim always needed: a row saying
`0.1.0` never did, because a fresh install copies the clone at HEAD whatever a manifest says, so two
machines could both write `0.1.0` and hold different code. A row written from a working copy says
`dev`, which is honest about being unreleasable rather than borrowing a number.

## [0.4.0] - 2026-09-17

The plugin adopts the playbook's own store layout and phase codes. `CONFORMANCE.md` Ruling 3 found
the divergence: the playbook's A2 §2 lays out `mapeo-<empresa>/00-ESTADO.md … 99-preguntas-
abiertas.md`, numbered and foldered; the plugin held 21 flat English files with no relation to that
shape. `packages/method/src/data/store.json` in the Web repository is now the single source for the
layout, exported into `capabilities/method/method.json`'s `store` dataset, and `lib/store-layout.mjs`
reads it rather than restating it.

### Changed — the store, foldered and renamed

- **`mapeo-empresa/` and `comunicacion/` replace 21 flat files.** The operación track now mirrors
  A2 §2 exactly: `00-ESTADO.md` (new, `resume`'s panel), `00-PERFIL.md` (was `PROFILE.md`),
  `01-empresa.md` (was `INTAKE.md`, now also carrying `PEOPLE.md`'s organigrama and authority
  sections), `01-personas.md` (new, `PEOPLE.md`'s roles and single points of failure),
  `01-oferta/OFERTA.md`, `PRODUCTOS.md`, `SERVICIOS.md` (was `OFFER.md`, `PRODUCTS.md`,
  `SERVICES.md`), `02-inventario.md` (was `SYSTEMS.md`, now also carrying `PEOPLE.md`'s access
  table), `03-procesos/INDICE.md` and `PXX-nombre.md` (was the single `PROCESSES.md`, split: its
  inventory table into `INDICE.md`, its per-process ficha into a template one file per process
  duplicates, its mapa-de-accesos and autorización sections folded into `INDICE.md`),
  `04-evidencia/HALLAZGOS.md` and `fuentes.md` (new — `EVIDENCE.md`'s "no new document" rule is
  retired; A2 §2 gives evidence its own two documents), `04-evidencia/ENTREVISTAS.md` (was
  `INTERVIEW.md`), `05-backlog.md` (new, `PROCESSES.md` §3 dolor priorizado and §6 scoring),
  `06-specs/AXX-nombre.md` and `REGISTRO.md` (was `AUTOMATION-SPEC.md` and `AUTOMATIONS.md`),
  `07-datos/` (new, extracts), `08-linea-base.md` (was `BASELINE.md`), `09-rutinas.md` (was
  `ROUTINES.md`), `98-COBERTURA.md` and `99-preguntas-abiertas.md` (new, A2 §8's rubric and
  question ledger). `comunicacion/` keeps `BRAND.md`, `VOICE.md`, `PROOF.md`, `DESIGN.md`,
  `SOCIAL.md`, `PRESENCE.md`, `CUSTOMERS.md` under their English names for now — moving the folder
  is in scope for this release, translating the files is deferred (`DECISIONS.md` #26).
- **`tools/scaffold.mjs` materialises the two-folder layout**, resolving `mapeo-empresa/` to
  `mapeo-<nombre del cliente>/` once a manifest is readable, and a per-process or per-automation
  document to a real instance name rather than the family template's own placeholder — which it now
  refuses to write verbatim, since a literal `PXX-nombre.md` in the store can never be found again
  by its own pattern check.
- **`tools/status.mjs` and `tools/coverage.mjs` read the store layout from `lib/store-layout.mjs`**
  instead of a hand-typed map, and both now read the manifest inside an explicit `--company <dir>`
  the way `scaffold.mjs` always did — a mismatch there would have one tool write documents the other
  could never find, once the folder name carried the client's own.
- **Every plugin phase mention carries the playbook's chapter and section beside the plugin's own
  operación number** (Ruling 4): operación 1 → A2 §3, operación 2 → A2 §6, operación 3 → A2 §7,
  operación 4 → A3 §2, operación 5 → A7 · X2.5. The plugin's 1-5 count is kept — Decision 24 kept it
  on purpose — and README.md's "Two tracks" section says how the two numberings relate.
- **`tools/coverage.mjs`'s `BLOCKING` regexes are cross-referenced against X4** in a table comment
  rather than a per-entry one — CONTRIBUTING.md's comment rule forbids a comment on an object-literal
  entry, and the earlier draft broke `test/method.test.mjs`'s regex-literal scan by looking like one
  itself.

### Changed — the doctrine adopts the playbook's method (Rulings 1, 5, 11, 12)

- **`PROCESS.md` §5 replaces the Wanner et al. (ICIS 2019) research score and its judgement ceiling
  with X3** (`CONFORMANCE.md` Ruling 1): eight weighted criteria, C1–C8, weights summing to 18,
  linked to the vendored `capabilities/method/tables/x3-criteria.md`, `x3-scales.md` and
  `x3-decisions.md` rather than restated by hand. The `Puntaje = (Σ calificación × peso ÷ 90) × 100`
  formula and its three vetoes — C3 or C5 at 1 blocks the start, C4 at 1 or 2 forces resolving the
  data gap first, no frozen baseline no start — replace the old research-score/expert-judgement
  split, closing with the ruling's own sentence: the score orders candidates, never states a result,
  and no improvement figure is ever derived from it. `skills/process-access/SKILL.md` §4 and
  `scaffold/company/mapeo-empresa/05-backlog.md` §2 carry the same eight criteria and four decision
  bands. `DECISIONS.md` #9 is narrowed, not repealed, and gets a new #27 recording the adoption.
- **`MATURITY.md` re-anchors on A9** (Ruling 11, folding Rulings 2, 5 and 10): the company's level is
  A9's own M0–M4 by the *minimum* of six dimensions, linked to `capabilities/method/tables/
  a9-levels.md` and `a9-statements.md`. The Anthropic-published 0–4 ladder this file used to present
  as the client's level is retitled and demoted to a per-person **usage** ladder feeding A9's Gente
  dimension — never called "maturity" again — and its six-month Evaluate/Pilot/Scale shape is
  reframed as the pace inside A9 §5's first two quarters (T1+T2), not a second programme length.
  "Whose level moved" and the artefact-per-level table carry over unchanged. `DECISIONS.md` #28
  records the adoption.
- **`REPORTING.md` §10b adopts A8 §3's three attribution methods** (Ruling 12) — Método 1
  antes-después, Método 2 grupo de comparación, Método 3 prueba escalonada — in place of treating
  contribution analysis as the only posture available. A magnitude claim is now licensed under
  Método 2 or 3, reported against the named comparison unit; under Método 1, still the shape of most
  engagements here, the result stays a contribution with a range and never a caused magnitude, which
  is the plugin's original refusal, scoped rather than discarded. `skills/report/SKILL.md`'s
  Attribution section follows the same ladder.
- **Every `capabilities/*/doctrine/*.md` file carries an `Implements:` line under its H1** naming the
  playbook chapters and sections it implements, `none (mechanics)` for scheduling doctrine, or
  `fuera del playbook (X9)` for the comunicación track. `test/method.test.mjs` now asserts the line
  exists and every code it names is a real chapter in `method.json`.

### Fixed

- **`capabilities/company/doctrine/EVIDENCE.md` §6 no longer says "no new document."** That rule
  predated A2 §2's own `04-evidencia/HALLAZGOS.md` and `fuentes.md`; keeping it would have had this
  release's own layout contradict this release's own doctrine.

### Added

- **`capabilities/method/tables/field-guide.md` vendors the playbook's field guide** — 17 stages, 110
  steps, from the day before the first visit to the handover — and `skills/setup/SKILL.md` now reads
  its `preparation`, `day-one-setup` and `day-one-framing` rows as the first visit's checklist instead
  of restating seven steps in prose, so the skill and the playbook's G1 page render the same list from
  the one exported table. `INSTALL.md` gains one sentence naming that table as the ordered checklist
  it supplies the platform detail for. `test/method.test.mjs` asserts the table exists, that the skill
  references it, and that every `fieldGuide` step naming a skill executor resolves to a real
  `skills/<ref>/SKILL.md`.

### Changed — the method data, re-exported

- **`capabilities/method/` follows the playbook's condensed annexes.** X4 PR5 now reads "dueño con
  puesto nombrado", with the validator's name and date living only in the A2 §7 validation line
  (`CONFORMANCE.md` Ruling 6, applied on the playbook side); the chapter list gains X9 "Expediente
  completo", the page the playbook renders from the same `store` dataset this plugin lays out, so
  the field guide becomes chapter 29; and every dataset says "persona en el circuito" where it said
  "humano en el circuito", the playbook's brand sweep now blocking the older word. The es-MX
  scaffolds and the two tools that print client-facing labels (`opportunities.mjs`, `report.mjs`)
  follow the same vocabulary. `.gitattributes` pins LF at the repository root so a Windows checkout
  no longer rewrites the vendored files the drift check hashes.

## [0.3.0] - 2026-09-09

The gaps the plugin's own doctrine already named and nothing filled. `MEASUREMENT.md` said durable
records are the strongest evidence available and to use them first, always; no skill ever went and
got them. `ROADMAP.md` reserved the `automate` capability as the highest-priced item in the
catalogue and left the space between a scored shortlist and a handover empty. `status.mjs` counted
pending fields and named who owed them, and stopped one step short of a question anybody could ask.
All three are closed here, and the numbering had to move to make room.

### Changed — two tracks, numbered independently

- **Phase numbers now carry their track.** Comunicación keeps 0, 1 and 2; operación runs 1 to 5. A
  single sequence asserted a dependency `process/SKILL.md` explicitly denies — *"the process phases
  do not depend on `BRAND.md`, `VOICE.md` or `PROOF.md`"* — and had no room to grow at either end.
  **The two existing operación phases keep their numbers**: the Diagnóstico is still 3 and the Mapeo
  integral still 4, so no journal row changes meaning and nothing in a client's history is
  invalidated. What changed is that every mention is now qualified, because both tracks have a phase
  1 and a bare number is ambiguous. Decision 24 carries the reasoning and what would reverse it.

### Added — operación phase 1, the profile

- **`company-profile`** and `capabilities/company/doctrine/PROFILE.md`, writing
  `scaffold/company/PROFILE.md`. Four questions place a company in one of six operating archetypes,
  and the archetype decides what phase 3 goes hunting for. `BRAND.md`'s sector field answers which
  authority can fine them; it never answered what their week looks like, and a veterinary practice
  and a body shop have almost the same inventory while two companies filed under one construction
  code have almost nothing in common. Carries the glossary of the trade — the artefact the rule
  *"name it in the doers' words"* always assumed existed somewhere — and the protocol for a trade
  nobody in the room has worked.

### Added — operación phase 2, the evidence sweep

- **`company-evidence`** and `capabilities/company/doctrine/EVIDENCE.md`. Derives real volumes,
  values, conversion rates and response times from the company's own folders, spreadsheets, mail and
  customer conversations, then contrasts them against what people claimed. **Counting beats asking,
  and asking beats guessing** — phase 3 keeps its dated instances for the things only a person knows.
  It runs *before* phase 3 and never after: interview first and the numbers arrive already anchored
  to the claim. No new document; findings land in `PROCESSES.md` and `SYSTEMS.md`, which already own
  them.

### Added — the coverage audit

- **`coverage`** and **`tools/coverage.mjs`**. `status.mjs` reports that *Rol responsable* is
  pending. This reports that it is **blocking**, that the person who holds it is whoever runs the
  process rather than whoever runs the company, the question written out ready to be read aloud, and
  a verdict on whether the next phase may start. Gaps resolve to one of four actions — ask, request,
  derive, observe — and never to "investigate further"; a gap that fits none of them means the field
  is badly specified. Its label extractor carries the section heading and the grid's column header,
  because `P1` cannot be matched against a rule or read back to a client and
  `1. Inventario :: Rol responsable` can be both.

### Added — operación phase 5, the specification

- **`automate-spec`**, `capabilities/automate/doctrine/SPEC.md`, and
  `scaffold/company/AUTOMATION-SPEC.md`. The buildable description between the shortlist and the
  handover: acceptance criteria written first, exact field names on both sides, what happens when the
  record already exists, seven error branches each ending in a notification a named role receives, a
  test plan whose majority are failures, and the rollout. The autonomy ceiling is set from the
  candidate's error cost and the three data controls **before** anything is designed, not discovered
  afterwards.
- **`capabilities/automate/doctrine/PLATFORMS.md`.** `HANDOVER.md` §1 owned who pays for a platform
  and there was nothing about what a platform is. Specifications stay platform-independent until
  their last section; the choice turns on how it bills and who administers it, and a company that
  already runs one somebody maintains keeps it.
- **Messaging-channel modality is now a field of `SYSTEMS.md`** (§1b), because it is what decides
  whether a channel can be automated at all. Three incompatible products share one name, one
  question separates them, and **automation through unofficial means is refused even when the client
  asks for it**: the number is printed on their vehicles, and losing it costs more than the
  automation saves.

### Added — the size of a process

- `PROCESSES.md` gains times-per-month, minutes-per-run, person-hours-per-month and a monthly cost.
  **The rate comes from the client and is labelled as theirs**, per `HANDOVER.md` §5; with no rate
  the money columns stay pending and size is expressed in person-hours only. No hours saved, no
  return, no payback period — here or anywhere. Size orders the shortlist; it promises nothing.

### Changed — routing and bookkeeping

- `process` routes five phases instead of two, and reads the store to decide which is live.
- `resume`'s table gains the three new phases and the coverage check, and names the track.
- `status.mjs` `OWNERS` registers `PROFILE.md` and `AUTOMATION-SPEC.md`, and credits
  `company-evidence` on `PROCESSES.md` and `SYSTEMS.md`.
- `test/skill-triggers.json` gains eight cases, four of them near-misses against the skills each new
  one is most likely to lose to.

## [0.2.2] - 2026-09-08

Everything found by the first long run in an environment nobody designed for — a Cowork session in
an ephemeral cloud container, with Gmail, Drive and Calendar connectors and a bridge to the
operator's machine, over three days and 206 journal rows. The two architectural findings are the
release: **the journal did not survive that container**, and **the rule about where a manifest may
live could not be kept there at all.** Neither was a bug anything reported; both were things every
surface said were fine.

### Added — the journal outlives the machine

- **`tools/journal-sync.mjs`** puts a month of the journal in the client's own store and says what
  is still owed. The journal is written to `<company root>/journal/execution/<YYYY-MM>.jsonl`, and
  in a container that path is a disk that is reclaimed when the session ends — silently, because a
  deleted journal and a quiet month leave the same empty directory. What that cost was never the
  rows: `opportunities` refuses below three distinct periods and the quarterly report is the first
  cadence that may claim a result, so **in that environment both were unreachable for ever, and both
  refused with a sentence that reads as "this engagement is young"** when the truth was that the
  history was being deleted every night. A refusal for the wrong reason is worse than a failure,
  because it is believed.
  - `--stage` freezes the month into `journal/outbox/<YYYY-MM>.rev-<NNN>.jsonl` and names the one
    file to upload, with its digest and the folder it belongs in. `--receipt` records the id the
    connector returned, **reading the frozen bytes rather than the live file**, so a receipt can
    never claim rows that did not go up. `--check` is the gate. `--restore` rebuilds a fresh
    container's journal from the revisions downloaded into a directory.
  - **A revision is a new file**, which is the rule `MCP.md` already stated for every other document:
    the connector's `update_file` cannot change contents. Each revision is the whole month as it
    stood, and readers take the highest. Split parts were rejected — a missing part truncates a
    history silently, and a missing revision leaves a visible gap in a numbered sequence.
  - **The upload is not done here and cannot be.** A CLI and a hook hold no connector credentials,
    so a session makes it. Everything that can be deterministic is: which rows are owed, what exactly
    to upload, and whether what came back matches what went up.
- **`doctor` grows a seventh check, `sync`.** It FAILS — never warns — when an ephemeral binding's
  month has no revision in the store at all, which is the observed failure exactly; when its newest
  revision is over a day old, so the rows after it are no longer one session's tail; and when a
  closed month is unsynced on any machine, because nothing will ever add to it. It does **not** fail
  on an outstanding row, and that is not leniency: staging writes a journal row and this check's own
  run writes another, so a rule failing on one row would go red the moment after it went green — and
  `company-new` STOPS on a doctor that is not green, which would have made an ephemeral engagement
  impossible to open. The tail is named in the OK line instead, with what is lost if nobody stages
  before the session ends.
- **`report` and `opportunities` name the third cause of a short history.** Two were already
  distinguished — a young engagement, and a surface where the hooks never ran. The third is the one
  this environment produces: the months exist, in the client's own store, and not on this machine.
  Both now say so, with the command that fixes it, instead of telling somebody to wait for data they
  already own.
- **The SessionStart announcement carries the binding's cost**, so the model reads it while it can
  still act, and a SessionEnd line tells the operator what is about to be lost. Both are advisory and
  labelled as such in `CONTROLS.md` §1b: the upload is a session's act, and describing the journal as
  automatically preserved would be a claim this plugin cannot keep.

### Added — a binding rule that can actually be kept

- **`XENTHAI_COMPANY` names a manifest and beats the directory walk.** `company-new` says in bold
  that a manifest never lives in a home directory, and `hooks/guard-company.mjs` finds the company by
  walking **up** from the session's working directory — which in a cloud session **is** the home. So
  no placement satisfied both, and the one that worked was the one the doctrine forbids. Measured
  both ways: manifest at the home, a store write is permitted; manifest one level below, where the
  rule asks for it, the same write is refused as unbound. It had already happened in the field.
  - The variable is explicit authority, not a home-level default: nothing is found there unless
    somebody set it for this session. **It never falls back** — set and resolving to nothing, every
    store write is refused, because an operator who believes they are bound to one company while
    silently bound to another is the one mistake here that is both invisible and permanent.
  - Where even that is impossible, `"binding": "ephemeral"` in the manifest permits the home
    placement and makes `doctor` declare it on every run as not reusable between sessions.
    **Declared, never detected**: a sniff for a container is wrong in both directions, and the
    expensive direction is permitting the ambient-authority pattern in silence on a machine that was
    durable all along. An undeclared manifest at a home directory is now a `doctor` FAIL.
- **`CONTROLS.md` §1b and §1c** carry both, because 15 skills read that file and neither rule
  belongs to one of them.

### Changed — the opportunity scan runs monthly

- The scaffold offered it semiannually. The periods it counts are months, so a pattern can only
  change state once a month, and everything past that is latency bought for nothing. The first two
  monthly runs will report that there is not enough history — the floor is three distinct periods —
  and the row now says so, because a routine that looks broken twice gets switched off.
- **The daily digest and the monthly scan are not duplicates, and `ROUTINES.md` now says why.**
  `tools/watch.mjs` already runs the same detectors every day and publishes only how many findings
  fired and how wide the widest was, with no subjects, because it goes in a folder shared with the
  practice. The scan opens those findings by name, in a session, and decides what each one means —
  which needs the process, the people and the client's priorities. Deleting either leaves the other
  missing half of itself.

### Added

- **`tools/scaffold.mjs`** — writes one company document from its scaffold and **never** writes over
  a file that exists. Until now every document was created by prose ("create it from
  `scaffold/company/X.md`"), and prose is a step a session can complete without noticing it did not.
  `ROUTINES.md` is where that was paid: `company-new` instructs it in bold, `status` already reports
  it as owed, and it was still skipped in a first session and stayed missing for two days — the
  document whose entire purpose is that **a routine nobody wrote down cannot be noticed missing**
  went missing unnoticed. `company-new` now runs the command, which exits 0 or does not. The refusal
  to overwrite is the same rule `company-new` and `company-intake` both state as absolute, enforced
  for the first time rather than asserted: it exits 1 and leaves the bytes alone, which is the
  correct outcome on any company whose store already held work. It writes the local copy only — a
  CLI holds no connector credentials — and the help says so, because a session believing a document
  reached the store when it did not is the failure this class of tool otherwise creates.
- **Browser doctrine in `MCP.md`.** A session that changes a client's settings through a web
  interface is making persistent writes to that client's account, and the guard cannot cover them:
  it refuses a store write with no company bound and a local write outside the engagement folder,
  and a click is neither — nor can it become a third refusal, because nothing in a coordinate
  distinguishes *Guardar* from *Cancelar*. So the control is doctrine plus verification. **Never
  `type` into a field that already holds a value**: positioning with `End` and typing injected text
  mid-string and corrupted three of four Gmail filters in one observed episode, one of them left
  holding a loose token that would have archived mail from any sender containing it. Use `form_input`
  against the element's ref, or delete the object and recreate it. **Then read the state back and
  compare it against what you intended** — that re-read is the only reason the corruption above was
  found at all.

### Fixed

- **A browser call is journaled as something other than "a browser was used".** The tool's own
  `action` (`screenshot`, `left_click`, `type`) is now copied as a reference, alongside the url that
  was already carried. Eighty-seven browser calls in one observed day produced eighty-seven rows
  with a null target, so the three that changed a client's mail filters were indistinguishable from
  the eighty-four screenshots around them. What was typed is still digested and never copied: the
  verb is the tool's, the text is the client's.
- **A clarifying question is no longer counted as an escalation.** `hooks/journal.mjs` recorded every
  `PermissionRequest` as one, which is right for an action waiting on a person and wrong for
  `AskUserQuestion`, which performs nothing — nothing was going to happen, so nothing was handed
  over. `tools/report.mjs` publishes that count to the client as decisions that passed to a person,
  and the inflation was silent, since a larger number reads as more governance rather than less. The
  call itself is still recorded by `PostToolUse`, so the journal loses no row; only the label goes.

### Changed

- **`scaffold/company/ROUTINES.md` no longer opens by contradicting the skill that creates it.** Its
  header said routines are agreed once, at mapping close; `company-new` creates the file during
  setup, because the digest routine is already running by then. The header now says both: the
  document is born at setup with the digest row filled, and the reporting cadences are agreed with
  the client at mapping close and stay `— pendiente —` until they are.
- **`process-access` fills the `ROUTINES.md` that exists** instead of creating one. By the time
  mapping closes the file is there, and a fresh scaffold written over it would destroy the digest
  row and anything else recorded during setup.

## [0.2.1] - 2026-09-05

### Added

- **`zapier-mcp-ops`** — operating a client's Zapier account over MCP without hardcoding anything.
  Every identifier that varies per client (`table_id`, field keys `f1`/`f2`, `selected_api`, the real
  `tool_name`) is discovered at runtime, because a value recalled from another session is a wrong
  answer that looks like a finding. Three failure modes it exists to prevent, each of which costs the
  client rather than the operator: firing `create_record` to learn a schema writes a real empty row
  into their table; `find_record` caps results at roughly three, so a broad search returning little is
  the cap and not an absence; and several apps seed a placeholder contact on first connect that reads
  as real traffic. It also carries the cost model — **each successful call burns 2 tasks** from the
  client's plan while inspection is free — which is what makes "explore with the meta-tools, execute
  deliberately" a rule rather than a preference. An outbound message is recorded twice on purpose: in
  the client's own audit table when no Zap does it, and in the engagement journal, which are different
  records for different readers.
- **Four trigger cases for it**, two targets and two near-misses. One near-miss asserts that "I
  searched and found nothing, so there are no records" routes here to run the protocol rather than
  confirming the premise; the other asserts that a Zapier flow being handed to a client is
  `automate-handover`, since naming the vendor is not what decides the skill.

### Fixed — records that had gone stale

- **The skill table listed twenty skills and was missing `resume`.** It now lists all twenty-two.
- **`README.md` and `INSTALL.md` still described the `version` field as the release gate**, which
  this release cycle removed. Both now say what is true: every push reaches a client, and a working
  copy stamps its journal rows `dev`.

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
  `await import()` at first use, the way `tools/doctor.mjs` already did, and the failure message
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

### Changed — releasing

- **Neither manifest declares a `version`, so every push reaches a client.** A declared version
  pins the plugin: `claude plugin install` on an already-installed plugin is a no-op, and
  `claude plugin update` moves nothing while the string is unchanged. Verified both ways on a real
  install — `update` reported "already at the latest version" against a newer commit, and moved only
  once the number changed. With the field absent from `.claude-plugin/plugin.json` and from the
  catalogue entry, the CLI resolves the version to the commit SHA, the way an unversioned
  marketplace entry already does elsewhere on this machine.
- **`lib/journal.mjs` reads the version from the install directory rather than a manifest.** An
  install lives at `<store>/cache/<marketplace>/<plugin>/<version>`, so that directory's name is the
  version the CLI resolved — the authoritative value, not a copy of it. From a working copy the leaf
  is the repository folder and the row says `dev`.
- **`test/ops.test.mjs` asserts the absence of both version fields**, because the failure it guards
  is silent: a pinned plugin installs, runs, and simply never updates again.
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
  templates, `tools/report.mjs`'s prose, and the readability index whose scale and syllable rules are
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

- **`tools/legible.mjs` refuses text that is not Spanish.** Every part of the index is Spanish-only and
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

- **A digest that runs with nobody present** (`tools/watch.mjs`). The one part of this plugin that can
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

- **Opportunities capability** (`tools/opportunities.mjs`, `skills/opportunities/`). Reads a company's
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
- **A readability floor for the documents an operator has to act on** (`tools/legible.mjs`).
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
- **Source verification in every report.** `tools/report.mjs` prints the SHA-256 of the exact bytes it
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
- **`tools/status.mjs`.** Reports, per document, whether it exists, how many fields are still pending,
  and **which phase owes it**. A field nobody owns stays pending forever; the owner map is checked
  against the skills on disk, so a scaffold no phase fills is reported as a plugin defect. Invoked
  by both routers for phase detection — a document that exists but is entirely unfilled reads as
  the unstarted phase it is, which reading the file list alone cannot tell.
- **`tools/report.mjs` and the `report` skill.** Turns journal rows into an engagement report without
  copying client content out of the store.
- **`tools/doctor.mjs` and the `doctor` skill.** Verifies that this machine and the bound company's
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
- **Journal** (`lib/journal.mjs`, `tools/journal.mjs`). One JSONL row per action in
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
