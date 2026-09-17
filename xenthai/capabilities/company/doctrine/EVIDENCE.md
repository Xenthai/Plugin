# Evidence — harvesting what the company already recorded

Implements: A2 §6

Read before phase 2 of the operación track. It governs deriving quantities from a company's own
files and records, and contrasting them against what people said.

`01-empresa.md` governs **asking for** documents and extracting facts from them one at a time. This file
governs the other thing: **going through them at scale to derive counts, durations and rates that
nobody in the company could have told you.**

## 1 · Why this phase exists

`MEASUREMENT.md` establishes that self-reported time is unreliable and that durable records are the
strongest evidence available — CFDI-stamped invoices, system action logs, document and email
metadata — and says to use those first, always.

Nothing in the plugin went and got them. Phase 3 asks people for three to five dated instances,
which is the correct fallback and is still testimony. A folder of four hundred quotes with file
dates is not testimony: it is a census, and it was sitting there the whole time.

The rule that follows: **counting beats asking, and asking beats guessing.** Phase 2 does the
counting so phase 3 can spend its hour on the things only a person knows — exceptions, decisions,
why it is done that way.

## 2 · Order of the phase, and it is not negotiable

**Phase 2 runs before phase 3, never after.**

The value is the contrast between what the records show and what people say, and the contrast is
only available in that order. Interview first and the numbers arrive already anchored: the
consultant hears "about twenty a month", finds eleven, and reconciles toward the claim without
noticing. Count first and the eleven is a finding that has to be explained.

It is also the cheapest phase to run, because it needs nobody present.

## 3 · What is read, in the order that pays

### The folder tree, before a single file is opened

How a company organises its folders is its process, fossilised. Read it first:

| What to look at | What it tells you |
| --- | --- |
| How jobs, clients or orders are named | The company's natural key — the identifier every later automation will join on |
| Whether the tree splits by year, client, or type | How the business thinks about its own work |
| Files named `final`, `v3`, `ok`, `este` | A process with no version control, and a rework cost that can be counted |
| Empty or abandoned folders | Processes that were attempted and died. Ask why; the answer predicts what will die next |
| The most recent modified date per folder | What is alive and what is archaeology |

### The document that represents one transaction

Every company emits one document per operation — a quote, a purchase order, an invoice, a case
file, a production order, a service sheet, a sales receipt. `00-PERFIL.md` §3 names which one this
archetype emits. Sample **fifteen to thirty**, chosen for spread across periods and sizes rather
than for convenience, and extract to a table: date · counterparty · what was sold · amount · who
produced it · whether a later version exists · whether a closing document is associated.

Four quantities fall out of that table that no interview produces reliably: **real average value**
by type, **conversion rate** as documents with a closing document over the total, **seasonality**,
and **how much a document changes between versions**, which is the measurable cost of rework.

Then read one of them **internally**. Repeated formulas, price lists pasted by hand, blocks copied
between files — each is a candidate, and each is evidence of a process, not of a preference.

### Spreadsheets somebody maintains

Every hand-maintained spreadsheet is a system the company built because it needed one. Record what
it is for, who updates it, how often, and what happens when that person is away. These are the
strongest automation candidates in any company, because **the process is already specified — it is
just being executed by a human.**

### Mail, by pattern rather than by reading

Never read a mailbox through. Query it: the most repeated subjects, threads with the most replies,
**the interval between an inbound message and its reply**, attachments sent again and again, and
messages the owner forwards to themselves, which are their real task list.

The reply-interval distribution is the single most valuable number in this phase for any company
whose sales arrive in writing, and it is almost always worse than the number the owner gives.

### Conversations with customers

Exported message threads, mail chains, service notes. Extract without transcribing: response time
by hour and weekday, questions that repeat across different customers, objections and how they were
answered, the reason a conversation died, and what the customer asked for that took the company time
to produce.

`CONTROLS.md` and the privacy rules in `01-empresa.md` apply in full. These are conversations with third
parties who consented to none of this.

### Records specific to the archetype

`00-PERFIL.md` §3 names where the durable evidence lives for this kind of business. Go there. It is
the part of this phase that most changes by trade, and the part most often skipped.

## 4 · How to work the volume

- **Sample; do not process everything.** Twenty documents read properly say more than three hundred
  counted. Choose for diversity of period, size and type.
- **Count before reading.** Start with file-level statistics — how many, of what type, from when —
  to find out where the volume actually is.
- **Extract to a table and keep it.** Derived rows go to a working file in the company store so the
  arithmetic can be re-checked later without reopening the originals.
- **Work large files where they live.** Do not move a company's archive to read it.
- **Record the denominator with every number.** "Eleven quotes" is not a finding; "eleven quotes in
  March 2026, from a folder holding 41 files of which 30 were older than the window" is.

## 5 · The contrast, which is the deliverable

At the end, compare **every quantity phase 1 produced as a claim** against what the records show.
Three columns: what they said · what the records show · what explains the difference.

The gaps that recur, in rough order of frequency: the real average value is lower than the declared
one; response time is several times worse; the conversion rate is different in both directions; a
condition described as invariable — a deposit percentage, a lead time, an approval — turns out to be
a range; monthly volume is half or double.

**Present the gap as a question, never as a correction.** *"The records show this at 40%, and you
mentioned it is always 50% — how is that decided?"* Almost every one of those questions uncovers an
unwritten business rule, and unwritten business rules are exactly what a phase-5 specification needs
and never has.

`04-evidencia/ENTREVISTAS.md` already establishes that a contradiction between two people is recorded rather than
averaged, because the contradiction is the finding. This is the same rule with a document on one
side.

## 6 · Where the findings land

`04-evidencia/HALLAZGOS.md` owns the derived numbers, the contrast table and the unwritten business
rules this phase produces; `04-evidencia/fuentes.md` owns what was reviewed and what was not, with
who authorised it — the A2 §2 store layout gives evidence its own two documents. Neither duplicates
`03-procesos/` or `02-inventario.md`: a process's own row still carries its frequency and cost,
sourced back to a HALLAZGOS.md entry rather than restating the derivation inline — one fact, one
owner, a citation where a second document would otherwise repeat it. The extracts themselves — the
sample rows, the derived tables — go in `07-datos/`, never a copy of the client's original file.

Provenance for a derived number is the folder, the sample size and the window — `[archivo:
Cotizaciones/2026, n=24, ene–jun]` — never "the files". A number whose sample cannot be reconstructed
is a claim with a decimal point.

## 7 · What this phase must not do

- **It must not rename, move or delete anything.** Read only. Everything written goes to the company
  store, through `Write` and `Edit`.
- **It must not copy content it does not need.** A derived count belongs in the store; the contract
  it was derived from does not. `01-empresa.md`'s rule on data that arrives unasked applies here at
  scale, and at scale it matters more.
- **It must not turn a count into a time.** A folder proves that twenty-four quotes exist. It does
  not prove how long one took to produce. Duration still comes from dated instances in phase 3, and
  a count presented as a duration is the exact fabrication `MEASUREMENT.md` exists to prevent.
- **It must not run after phase 3.** If it did — because the inventory already existed when the
  engagement started — say so, and mark every contrast as retrospective. It is worth less and it is
  not worthless.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/INTAKE.md` | Always. It governs requesting documents, adoption, and what is never copied |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | Before deriving any duration — it draws the line between counting and measuring |
| `capabilities/company/doctrine/PROFILE.md` | §3 names where this archetype's durable evidence lives |
| `capabilities/company/doctrine/CONTROLS.md` | Before touching customer conversations or personal data |
| `scaffold/company/mapeo-empresa/04-evidencia/HALLAZGOS.md` · `scaffold/company/mapeo-empresa/04-evidencia/fuentes.md` | The two documents this phase's own findings land in |
