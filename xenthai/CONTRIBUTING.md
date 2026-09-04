# Contributing

Read this whole file before writing anything. Every rule here was paid for once already.

## What this plugin is

Applied-AI consulting made executable. It maps a company, produces its communication from that
company's own documents, records every action with actor and timestamp, and later automates the
company's processes with a person keeping every decision. It is **company-agnostic**: nothing about
any client lives in this repository. A company's documents, assets and journal live in that
company's own store, bound to a session by a `.company.json` in the working directory.

Read next, in this order: `README.md`, `ROADMAP.md`, `MCP.md`, `capabilities/social/doctrine/LAYOUT.md`,
`capabilities/social/doctrine/COPY.md`, then every file under `skills/` as the style reference.

## The seven principles, and what each forbids

1. **Nothing is removed.** Every capability ships to every company; Claude decides per company what
   applies. Never gate a feature behind a company type.
2. **Least restriction.** Block only what is genuinely sensitive *and* irreversible. Everything else
   is journaled and announced. **No allowlists** of folders, emails, or anything else that a person
   would have to maintain — a guard that interrupts often becomes one the operator clicks through.
3. **Vanilla.** Code exists in exactly two places: **hooks**, because an instruction is followed 99%
   of the time and a hook runs 100%, and a journal with gaps is worse than none; and **where an exact
   answer exists** — rendering at exact pixels, aggregating a journal, parsing a CSV. Everything that
   is judgement is a skill in prose that Claude reads. If you are about to write JavaScript for
   something Claude could decide by reading a document, stop and write the document.
4. **The plan is the approval.** A routine executes work that was approved when it was planned. It
   never waits for a person at run time, and it never publishes something no plan approved.
5. **Nothing publishable that is not verifiable.** No outcome figure, client name, credential,
   timeline or comparison enters client-facing text without a row in that company's `PROOF.md`
   naming its source, who confirmed it, and its re-verification date. Expired row, not publishable.
6. **The artefact proves the claim.** If copy asserts something, the image or document demonstrates
   it. "Auditable months later" beside timestamps from one night is a contradiction a reader finds.
7. **Never a single self-reported number.** People overestimate the duration of their own recurring
   tasks — a systematic review of 32 studies found 22% of estimates high by more than 100%, and
   self-reported time diverges from logged time by a median 47%. Ask for three to five dated,
   concrete instances instead. A savings claim built on the client's own estimate is fabrication in
   the flattering direction.

## Language

- **Code, comments, journal fields, plugin documentation: English.**
- **Anything a client reads: es-MX.** The scaffolds in `scaffold/company/`, the review documents,
  the report a director opens. Default to *usted* with directors.
- Identifiers are English. `empresa`, `bitacora`, `fase` in code are defects; `company`, `journal`,
  `phase` are correct. The word *bitácora* appears only in client-facing text.

## Comments

A comment is a `/** */` JSDoc block on a **module-scope declaration** or a **class method**, or it
does not exist. Never a standalone `//`, never a trailing comment, never a non-JSDoc `/* */`, never
a comment inside a function body, never on an object-literal entry. **Derivability test:** cover
the comment and read only the declaration; if the comment taught you nothing new, delete it. Only
*why* survives — rationale, invariant, constraint, the trap the code avoids. Comments are read far
more often by models than by people, so every non-informative one is a permanent tax.

## JavaScript

- ESM only, `.mjs`, Node 20+. `require()` in an `.mjs` file throws at runtime.
- **No new npm dependencies** without a stated reason in the PR. Claude Code installs a plugin's
  dependencies with `--ignore-scripts` and a 60-second timeout: anything that needs a lifecycle
  script installs cleanly here and fails only on a client's machine. That is why this depends on
  `playwright-core` and never on `playwright`.
- Never write client material through the shell. `Write` and `Edit` pass through the company guard;
  a shell redirect does not.
- `${CLAUDE_PLUGIN_ROOT}` is guaranteed inside hooks. It is **not documented** for a skill's shell,
  so a skill notes the fallback: the plugin root the bootstrap hook announces at session start.

## Skills

- One directory per skill, one level deep: `skills/<name>/SKILL.md`. Verified: 65 of 65 skills in
  a large plugin and Anthropic's own follow this. Nesting is unattested.
- Frontmatter is `name` and `description` and nothing else. Decorative metadata is never read.
- **The description states WHEN to invoke, never HOW the skill works.** A description that
  summarises the workflow becomes a shortcut the model takes instead of reading the body — a
  measured regression where a required review step was skipped. Be slightly assertive about when:
  the observed failure mode is under-triggering, not collision.
- **Negative routing**: name the sibling skill and the exact condition that sends the reader there.
- Body between roughly 2 and 12 KB. Explicit **STOP conditions**. A **reference table** naming each
  long file and the condition for opening it — bodies cost nothing until invoked, reference files
  cost nothing until read.
- Encode non-obvious failure modes the model would not already know, never generic knowledge it
  already has. "Use good typography" is a defect; "divide every size by 2.7 to know if it reads in
  a feed" is a rule.

## Journal

Tool calls are journaled by hooks automatically. Semantic events go through
`node tools/journal.mjs --event <name> --why "<reason>" [--actor person:<name>]`. Run `--help` for
the vocabulary; **never add an event outside `lib/journal.mjs`'s `EVENTS`**, and never put client
content or a secret in `--why` or `--detail`. Rows carry `schema` and `plugin` versions.

The journal records **references, not content**: what was touched, a digest, why. It is the
company's own audit trail and, later, the raw material for measuring what the plugin did.

## Store

Company documents are **markdown, always** — a Google Doc only exists in Drive and would break the
storage adapter's agnosticism. Google Docs are **derived** artefacts generated for review, because
comments are the approval mechanism and only a Doc returns them. The connector cannot rewrite a
file's contents, so a revision is a new file, which leaves the lineage visible. It also cannot make
a file public: "anyone with the link" on the assets folder is a one-time manual step per company.

## Tests

Every deliverable ships a test at `test/<name>.test.mjs`. **Never edit `package.json`** — the
runner discovers `test/*.test.mjs` by glob, so a new suite is a new file and nothing else. Several
agents editing one script raced on that file, and a script naming a file that did not exist yet
broke every other suite with it. `npm test` must stay green. **Prove failures, not passes**: the valuable test is the one
that shows an assertion catching a violation. Run everything you claim; a report that says "tests
pass" without having run them is a report that lied.

## File ownership in a parallel wave

Touch only the files your brief assigns. Another agent owns the rest of the tree at the same time,
and two edits to one file are a merge nobody reviews. If you must change a file you do not own,
write the exact change you need into your final report instead of making it.

## The research these rules rest on

Verified during design, September 2026, and recorded so nobody relitigates them from memory:

- Meta publishes **14% top / 35% bottom / 6% sides** as the Stories and Reels safe zone. The widely
  repeated 250px figure is third-party. `formats.json` carries a hard and a soft tier.
- Instagram carousels: **20 slides in-app, 10 via API**; one orientation for the whole set.
- LinkedIn's carousel is a **PDF document post**: 100 MB, 300 pages. Single image is 1.91:1.
- No scheduling tool accepts `.ics` as input. Later has no bulk scheduling; Hootsuite cannot attach
  media in bulk; Buffer **silently drops** rows past the plan limit. Metricool has the most capable
  schema and is what agencies in México use. CSV must be **UTF-8 with BOM**.
- Brand archetypes have no evidence and their one peer-reviewed retest contradicts their premise.
  Personas with invented names fail the "and therefore we write what?" test. Voice is captured as
  allow/deny lists, "we say X not Y" pairs, and **five to eight** annotated rewrites — more examples
  measurably degrade instruction-following.
- Company-level "maturity" scores are theatre; even CMMI's evidence is called "not rigorous" by its
  own institute. Use **countable state facts** verified with a date, a second source, or evidence of
  use. Attribution is by **contribution analysis**, never a quantified counterfactual.
- Cycle time alone hides the gain: **Little's Law**, `WIP = throughput × cycle time`. Measure cycle
  time, **touch time** and throughput. Knowledge-work flow efficiency is typically 5–15%.
- A plugin **cannot declare a connector dependency**; skills probe and degrade. Plugin dependencies
  install with `--ignore-scripts`. `version` in `plugin.json` is the release gate.
- Decision-making in Mexican companies concentrates in one person (power distance 81/100); only
  ~21% have a board. **Interview the person who does the work, not their manager** — management is
  routinely unaware of the real exceptions. CFDI 4.0 is mandatory since July 2023. Expect SAP B1,
  CONTPAQi, or Excel and WhatsApp. Regulator by sector: PROFECO, COFEPRIS (disease-reduction claims
  prohibited outright), CNBV/CONDUSEF.
