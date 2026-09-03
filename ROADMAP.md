# Roadmap

> Ideas, not commitments. Each one says what it is, why it earns a place, and what it waits on.
> Ordered by horizon, and within a horizon by how much it de-risks the rest. Version 0.1.0 is the
> baseline everything below is measured against.

## Principles that shape every item

- **Nothing is removed.** A capability a company does not use today is one it can use tomorrow.
  Claude decides what applies to each company; the plugin ships everything.
- **Least restriction.** Block only what is genuinely sensitive and irreversible. Everything else
  is journaled and announced. No allowlists to maintain.
- **Vanilla.** Code only where prose cannot do the job: hooks (determinism) and rendering (an exact
  answer exists). Everything else is a skill Claude reads.
- **The plan is the approval.** A routine executes work that was approved when it was planned; it
  does not wait for a person at run time.
- **Nothing publishable that is not verifiable.** No feature may make it easier to publish a claim
  that has no row in `PROOF.md`.

## Deliberately not on the roadmap

- A publishing API. Delivery is a package a person publishes; this removes the most fragile
  surface (OAuth, app review, expiring tokens).
- Any dependency on a paid platform, free tier included. Vendor exporters exist only for a tool a
  company already pays for.
- A composite "company improvement" score. Indefensible with n=1 and no control group; even CMMI
  cannot show rigorous level-to-performance evidence.
- Claims about reach, impressions or revenue for social. Without platform-side analytics, only
  visible public state can be measured.
- **`argument-hint` in skill frontmatter.** Sixty-seven of Anthropic's first-party skills declare
  it, and it is still wrong here for two independent reasons: it is not among the Agent Skills
  spec's six portable fields, and no skill in this plugin reads `$ARGUMENTS`. A hint advertises an
  interface — the operator types `/xenthai:report 2026-08`, the skill ignores it and asks for the
  month anyway. That is worse than no hint. Revisit only if a skill actually consumes arguments.
- **Moving the hook declarations out of `plugin.json` into `hooks/hooks.json`.** The inline form is
  the working one: the caveman plugin installed on this machine declares its hooks inline, has no
  `hooks/hooks.json`, and its `SessionStart` hook fires. The observation that no plugin in
  `knowledge-work-plugins` declares hooks inline was a bad inference — those plugins declare no
  hooks at all. Moving them risks silently killing the enforcement spine to satisfy a convention
  that does not exist.
- **`duration_ms` in the journal row.** `PostToolUse` and `PostToolUseFailure` hook inputs carry
  it, and it is genuinely unmatched-proof in a way the manual `review_start`/`review_end` pair is
  not. But it measures *tool execution time*, which is neither the human review time a client is
  paying for nor the cycle time a process improves on — so it supports no client-facing claim, and
  adding it costs a `ROW_SCHEMA` bump. It would earn its place as a diagnostic for a store whose
  connector calls are degrading, which is `doctor`'s subject, not the report's.

---

## Shipped

Recorded here rather than deleted, because a roadmap that lists finished work as pending sends the
next builder to rebuild it. Every item below is in `CHANGELOG.md` and on disk; none of it is on a
client machine until the `version` field moves.

| Shipped | Where it lives |
| --- | --- |
| **`process` capability** — phases 3 and 4, breadth before depth, Wanner suitability scoring with the two judgement criteria labelled as judgement | `skills/process*`, `capabilities/process/doctrine/PROCESS.md`, `scaffold/company/PROCESSES.md` |
| **`baseline` capability** — three layers, company-wide rather than per-channel, with the never-a-single-self-reported-duration rule | `skills/baseline`, `capabilities/baseline/doctrine/MEASUREMENT.md`, `scaffold/company/BASELINE.md` |
| **`report` capability** — journal rows to an engagement report, contribution framing, never "certified" | `skills/report`, `bin/report.mjs` |
| **`company` capability** — documents before questions, and what is sold on what terms | `skills/company-intake`, `skills/company-offer`, `capabilities/company/doctrine/INTAKE.md` |
| **`doctor` skill** — the MCP checklist as an executable round trip | `skills/doctor`, `bin/doctor.mjs` |
| **`status` CLI** — pending fields per document and the phase that owes each | `bin/status.mjs`, called by both routers |
| **Plugin version on every journal row** | `lib/journal.mjs` `PLUGIN_VERSION` |
| **CI on GitHub Actions** — `npm ci --ignore-scripts`, the suites, `plugin validate`, no browser download | `.github/workflows/test.yml` |
| **Install runbook** for a client machine | `INSTALL.md` |
| **OFL licence texts copied into the delivery package** | `skills/social-handoff` step 3 |
| **`company-new` skill** — the engagement bootstrap: the manifest, the store folder, the health check, the handoff to intake | `skills/company-new` |
| **`social-presence` skill** — the perishable before, captured at the first session and append-only | `skills/social-presence`, `capabilities/social/doctrine/PRESENCE.md`, `scaffold/company/PRESENCE.md` |
| **`automate-handover` skill** — acceptance and liability rather than results, with the three-rung autonomy ladder | `skills/automate-handover`, `capabilities/automate/doctrine/HANDOVER.md` |
| **`opportunities` skill** — what recurred across periods, read from the journal, as questions rather than recommendations | `skills/opportunities`, `bin/opportunities.mjs`, `capabilities/process/doctrine/PROCESS.md` §8 |
| **Readability floor for operator-facing documents** — Szigriszt-Pazos on the INFLESZ scale, gated across every client-facing scaffold | `bin/legible.mjs`, `capabilities/automate/doctrine/HANDOVER.md` §5b |
| **Session doctrine** — who has to be in the room for each question, and who must not be | `capabilities/company/doctrine/SESSION.md`, reached from all eight interviewing skills |
| **Controls doctrine and the maturity model** — what the plugin refuses versus merely records, and whose level actually moved | `capabilities/company/doctrine/CONTROLS.md`, `MATURITY.md` |
| **Source verification in every report** — the digest of the bytes a report was computed from, anchored by the client's own store | `bin/report.mjs`, `capabilities/report/doctrine/REPORTING.md` §10d |
| **`watch` digest** — engagement health as counts and dates, computed with no model, no session and no network, safe to share with the practice | `bin/watch.mjs`, `INSTALL.md` §6b |
| **`feedback` skill** — the second improvement loop: what to fix in the PLUGIN, from evidence, carrying nothing about any company | `skills/feedback` |
| **Adoption of pre-existing documents** — a store that is not empty when the plugin arrives | `capabilities/company/doctrine/INTAKE.md`, `skills/company-new`, `skills/company-intake` |

---

## Horizon 1 — what stands between this and a first real client

The MVP passes its own tests. These are the gaps a real engagement would hit on day one.

| Item | Why | Waits on |
| --- | --- | --- |
| **Skill-trigger evaluation inside the gate** — the 56 cases in `test/skill-triggers.json` run on every change, not on request | Nineteen skills now, up from six. A `description` is the only trigger surface and the measured failure mode is **under**-triggering: a skill that never fires is indistinguishable from a skill that does not exist. `test/skill-eval.mjs` exists and runs nowhere | Claude CLI and API access in CI, or a local pre-release step |
| **Verify `${CLAUDE_PLUGIN_ROOT}` inside a skill's shell** on a real install | Every semantic journal entry from a skill depends on it, and the documentation does not say it resolves there. The bootstrap hook announces the path as a fallback, but the assumption is untested | A second machine |
| **A first-session dry run against a real company** — every phase, in order, with the journal read back afterwards | The suites prove each part in isolation. Nothing has yet proven the parts compose, and the journal has never been read by `report` on rows a full engagement produced | `company-new` |

---

## Horizon 1b — reporting mechanics, decided against installing anything

A survey of the open skills ecosystem for reporting turned up nothing usable: everything above
20,000 installs is standup or status reporting bound to a specific SaaS product, and the
consulting-and-measurement entries sit between 11 and 111 installs with no provenance worth
standing behind. One is named `quantify-impact`, which is precisely what
`capabilities/report/doctrine/REPORTING.md` refuses to do.

**The ecosystem has no measurement doctrine.** That matches the two earlier findings — no
multi-tenant brand configuration, and no deterministic template-to-PNG renderer — and it carries
the same warning rather than the same comfort: there is no prior art to check this doctrine
against.

What is missing is mechanics, not doctrine, and the engine to build it on already exists.

| Item | Why | Waits on |
| --- | --- | --- |
| **A `chart` archetype in `capabilities/social/engine/template.html`** | The quarterly and semiannual reports carry before-and-after figures and currently have no visual at all. A chart is one more archetype in a renderer that already asserts exact dimensions, safe zones, embedded fonts and exact pixel colour — adding a charting library would instead add a dependency the vanilla rule argues against, duplicate a tested pipeline, and produce output that bypasses those assertions | — |
| **PDF output from `render.mjs`** | **Verified on 2 September 2026: `page.pdf()` works on the pinned `playwright-core` 1.58.2 through the msedge channel already driven — 23,718 bytes, `%PDF-` header, zero new dependencies.** Serves two roadmap items at once, since the LinkedIn document export in Horizon 4 is the same format | — |
| **Report templates per cadence** | Five cadences with fixed sections, generated from the journal and the company's documents so a report cannot silently omit its paired quality metric or its scope statement | The two above |

---

## Horizon 2 — the capabilities that are the business

Social is the calling card. These are what is sold.

| Item | Why | Waits on |
| --- | --- | --- |
| **`automate` capability** — the actual "IA + Flujo" build: one process from the inventory implemented with per-tool permissions, human approval on decisions, and a journal entry for every action including `review_start`/`review_end` so touch time is measurable after the fact | This is `Un proceso conectado`, the highest-priced item in the catalogue. The journal's event vocabulary already carries the events it needs; nothing writes them yet | A first mapped company |
| **`ROUTINES.md` per company** — the pre-approved planned tasks and their cadence: produce against the approved plan, generate the monthly report, sweep `PROOF.md` for expired claims, re-measure baseline state facts, run the opportunity scan | Makes "the plan is the approval" concrete and inspectable. A routine that is not written down is a surprise, and these are the tasks that need no gate precisely because they were approved once, in writing | `report`, `baseline` |
| **`PROOF.md` expiry sweep** as a routine | A claim true in March is republished in December unless something checks. Nothing checks today, and this is the failure that produced the safe-zone error: a rule in doctrine with nothing verifying it in code | — |
| **Regulator claim linting at produce time** — phrase patterns per regulator (PROFECO for comparative and general claims, COFEPRIS for health with disease-reduction claims prohibited outright, CNBV/CONDUSEF for financial) flagged before rendering | Knowing which claims are illegal must happen before drafting, not at review. A sentence the plugin wrote can cost a client a fine | `BRAND.md` records the regulator |
| **`LEARNINGS.md` per company** with a hard size cap and a promotion ladder: an entry earns its place only if it would change a future decision; when the file is full, entries are promoted into doctrine or deleted | It is loaded into context, so unbounded growth is a permanent token tax. The cap is what forces the distinction between a note and a rule | — |

---

## Horizon 3 — compounding

Where the plugin gets better with every client, which is the property that justifies building it.

| Item                                                                                                                                                                                                                                                                                                                                                                              | Why                                                                                                                                                                                                                           | Waits on                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| **`opportunities` capability** (from `IDEAS.md`) — read a company's journal and surface automation candidates: the same action on the same kind of target repeated; lookups clustered around one process; escalations that always resolve the same way; review time concentrated in one step. Score each with the five published criteria and hand it to `process` as a candidate | Turns the journal from a compliance artefact into the next engagement. The client's own log names the next process worth automating. The semantic events exist from day one for exactly this                                  | Journal volume; `process` for scoring |
| **Cross-company write detection** from the journal — a scan that compares every store write's `parentId` against the bound company's root and alerts                                                                                                                                                                                                                              | The guard no longer blocks writes to an unknown folder by design (no allowlists). The journal carries the `parentId`; nothing reads it back yet. This is the residual risk made visible on a schedule instead of on discovery | —                                     |
| **Cross-company pattern library** (anonymized) — which archetypes and pillars clear the approval gate fastest, from journal approval events only                                                                                                                                                                                                                                  | This is data the plugin genuinely has, unlike reach or engagement. It must never be dressed as performance data                                                                                                               | Several companies' journals           |
| **Schema migration tooling** — `schema_version` on every document, auto-migrate after writing a backup, refuse rather than guess when the shape does not match a known version, three-way merge for hand-edited documents with conflict markers rather than silent overwrite                                                                                                      | The documents are the state and clients will be live when the shape changes. This is what kills growing products                                                                                                              | The first schema change               |

## Horizon 4 — breadth

More surfaces for the same company documents.

| Item                                                                                                                                                                                                                                                                      | Why                                                                                                                                                   | Waits on                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Carousel** — a sequence data model with orientation fixed at set level, up to 20 slides in-app; and **LinkedIn document export** as PDF (100MB, 300 pages, flattened)                                                                                                   | The highest-reach format on Instagram and LinkedIn. `formats.json` knows the limits; nothing produces the sequence                                    | Template archetypes stable     |
| **Video lane** — wire the HyperFrames skills and `motion-doctrine` already installed; recompose per aspect (9:16, 1:1, 16:9) rather than scale; measure fill mid-shot at six points, not at the last frame                                                                | A video is hours, not minutes, and its own phase. The doctrine for it exists; the wiring does not                                                     | —                              |
| **Vendor exporters** — Metricool first (the schema actually used in México: native video, ten-image carousels, per-network metadata), Publer second (the cleanest shape) — emitted only for a company that already pays for the tool, UTF-8 with BOM, chunked at ~50 rows | Zero manual re-entry is the promise of the handoff. Buffer silently drops rows past its plan limit and never gets a file                              | Public-URL step in the runbook |
| **Alt text on every asset**                                                                                                                                                                                                                                               | Accessibility, and a required column in the import schemas                                                                                            | —                              |
| **Text-only posts** for LinkedIn and X with the per-platform truncation point enforced (~210 desktop / ~140 mobile on LinkedIn, 280 on X) and the hashtag rule per platform (2 recommended on X; more than 60 on YouTube voids all of them)                               | Often the highest-performing format on LinkedIn and nearly free to produce                                                                            | —                              |
| **Two headline variants per piece** for the client to choose between at the review gate                                                                                                                                                                                   | A choice is easier to approve than a single option, and it teaches the voice faster. This is not A/B testing — there are no analytics to test against | —                              |
| **Client-facing monthly page** generated from the journal, in the company's language                                                                                                                                                                                      | The bitácora as a deliverable the client reads, not only an audit file the consultant keeps                                                           | `report`                       |
| **`web` capability** — a company's one-page site from the same documents                                                                                                                                                                                                  | `BRAND.md`, `PROOF.md` and `SOCIAL.md` already hold what a one-page site says. The author's own site is built this way                                | Social docs mature             |
| **Bilingual output** per company                                                                                                                                                                                                                                          | `locale` is already in the manifest and unused                                                                                                        | —                              |

## Small, cheap, and worth doing whenever a hand is free

- Make the SessionStart hook write one health line to the journal: Node version, browser channel found, whether the store answered a read. Remote diagnosis from a client's journal without a call.
- Journal merge across two machines for the same company: monthly JSONL files already merge by append; add de-duplication by `ts` + `session`.
- Narrate the one-time Chromium install on macOS and Linux from the render step, since the bootstrap hook deliberately no longer downloads anything.
- A `--dry-run` on the render engine that reports fill and safe-zone results without writing PNGs, for fast iteration on a plan.
- `CHANGELOG.md` keyed to `version` bumps, because the version field is the release gate and a client only sees what it names.
