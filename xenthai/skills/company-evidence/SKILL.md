---
name: company-evidence
description: Run operación phase 2 — derive real volumes, values, response times and conversion rates from the company's own files, folders, spreadsheets, mail and customer conversations, then contrast them against what people claimed. Use when the folders or the mailbox are reachable and the inventory session has not happened yet, when a client's figures need testing against their own records, when nobody can say how many of something there are per month, or when asked to go through a folder of quotes, orders or invoices. Desk work with no client present. For requesting documents use company-intake; for measuring durations use baseline.
---

# Operación phase 2 — evidence

**Read `capabilities/company/doctrine/EVIDENCE.md` first.** It carries what is read and in which
order, how to work the volume, and the contrast that is the deliverable. Do not re-derive it here.

Findings land in `04-evidencia/HALLAZGOS.md` and `04-evidencia/fuentes.md`; extracts go to
`07-datos/`. A process's own row in `03-procesos/` still carries its cost, cited back to a
HALLAZGOS.md entry rather than repeating the derivation — one fact, one owner.

## 1 · Bind, and fix the scope in writing before opening anything

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
```

Name the company aloud. Then write into `04-evidencia/fuentes.md`, and confirm with whoever authorised it:

- **Which folders and mailboxes are in scope**, named one by one.
- **What is out** — by default payroll detail, personnel files, bank statements, anything marked
  personal.
- **Who authorised it**, with a name and a date.

`01-empresa.md`'s rule on data that arrives unasked applies here at scale, and at scale it matters more:
record only what the mapping needs and **say what you left out.**

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability company \
  --why "operacion phase 2 evidence — derive counts from durable records" --target "04-evidencia/HALLAZGOS.md"
```

## 2 · Read the tree before opening a file

The folder structure is the process, fossilised. Naming convention, how it splits, files named
`final` and `v3`, abandoned folders, most recent modification per folder. The doctrine's §3 table
says what each one tells you.

The naming convention is the highest-value thing in this step: it is the company's **natural key**,
and every later automation joins on it.

## 3 · Sample the transaction document

`00-PERFIL.md` §3 names which document this archetype emits. Sample fifteen to thirty, chosen for
spread across periods and sizes, and extract to a table. From it derive real average value,
conversion rate, seasonality, and how much a document changes between versions.

Then read one internally, looking for repeated formulas, hand-pasted price lists and blocks copied
between files. Each is a candidate and each is evidence of a process.

## 4 · The rest of the sources

Spreadsheets somebody maintains by hand · mail queried by pattern rather than read · customer
conversations mined for response time, repeated questions and reasons a deal died · the records
`00-PERFIL.md` §3 names as this archetype's durable evidence.

**The reply-interval distribution is the single most valuable number here** for any company whose
sales arrive in writing, and it is almost always worse than the figure the owner gave.

## 5 · Record every number with its denominator

`[archivo: Cotizaciones/2026, n=24, ene–jun]`. A number whose sample cannot be reconstructed is a
claim with a decimal point. Derived tables go into `04-evidencia/HALLAZGOS.md`, and the sample rows
behind them into `07-datos/`, so the arithmetic can be re-checked without reopening the originals.

**A count is not a duration.** A folder proves twenty-four quotes exist; it does not prove how long
one took. Duration still comes from dated instances in phase 3.

## 6 · The contrast, which is the deliverable

Three columns: what they said · what the records show · what explains the difference.

**Write the gaps as questions for the next session, never as corrections.** *"Los registros muestran
40% y usted mencionó que siempre es 50%, ¿cómo se decide eso?"* Almost every one of those uncovers an
unwritten business rule, which is exactly what a phase-5 specification needs and never has.

Route the questions to `coverage` so they arrive grouped by person rather than as a list.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability company \
  --why "operacion phase 2 evidence derived, N contrasts recorded" --target "04-evidencia/HALLAZGOS.md"
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_end --capability company \
  --why "operacion phase 2 complete" --target "04-evidencia/HALLAZGOS.md"
```

Never put a folder name, a client name, a process name or any figure from the company in `--why` or
`--detail`.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## STOP conditions

- **Nothing is reachable — no folders, no mail, no exports.** Say so plainly and route to
  `company-intake` to request a sample by hand. Twenty documents sent over email still beat an
  interview. Do not fabricate the phase.
- **The inventory already exists** because the engagement started mid-way. Run anyway, and mark every
  contrast **retrospective**: the interview was already anchored, so a matching number proves less
  than it appears to. Worth less, not worthless.
- **A folder holds something nobody agreed to share** — payroll, personnel files, a customer database
  outside scope. Close it, record that it was seen and not read, and tell the client.
- **The records contradict the archetype assigned in phase 1.** Do not quietly re-map. Say so, change
  the archetype with the date of the change, and flag which phase-1 assumptions now need re-checking.
- **The sample is too small to say anything.** Report the sample size and say what it does not
  support. A rate derived from four documents is an anecdote with arithmetic.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/EVIDENCE.md` | Before the session, always |
| `capabilities/company/doctrine/INTAKE.md` | Adoption, provenance, and what is never copied |
| `capabilities/company/doctrine/CONTROLS.md` | Before touching customer conversations or personal data |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | The line between counting and measuring |
| `capabilities/company/doctrine/PROFILE.md` | §3 names where this archetype's evidence lives |
| `skills/process-map/SKILL.md` | Only to say what comes next. Never run it in this session |
