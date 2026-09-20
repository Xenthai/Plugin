---
name: report
description: Report what actually happened in a company's engagement, read back from that company's own execution journal — actions by actor, human review time, who approved what, and what the evidence cannot support. Use at the end of a month, before a client review or renewal, when the client asks how much of this the AI did or what it saved them, when an approval needs an audit trail, and before any figure about the engagement is quoted anywhere. For whether the install and its connectors work, use doctor.
---

# Report — the journal read back

The tool counts. You interpret. The line between them is the whole point of this skill: every
figure in the report is arithmetic over the journal, and every sentence about what those figures
*mean* is a judgement you must be able to defend out loud.

## Read the cadence doctrine first

`capabilities/report/doctrine/REPORTING.md` says which cadence answers which question, **what each
one may and may not claim**, and why the quarterly is the first that can report a result at all.

The rule that decides everything else: **cadence follows the data's refresh rate, not the
calendar.** Five reports saying the same thing trains a client to stop reading all of them. A
biweekly carries no outcome claim — two weeks is too few instances for a median; a quarterly may,
being the shortest window in which most mapped processes accumulate enough.

The agreed cadences are in the company's `09-rutinas.md`; one not activated there gets no report.

**Start from the template, never from a blank page.** `capabilities/report/templates/` holds one
per cadence — `quincenal`, `mensual`, `trimestral`, `semestral`, `anual`, and `cierre-de-mapeo`.
Each carries the mandatory sections, and `test/report.test.mjs` refuses a template that lost one.

For a chart, render it through the engine rather than describing a number:

```bash
node "${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/render.mjs" \
  --template "${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/template.html" \
  --pieces <pieces.json> --piece <id> --target square --out <dir> --pdf
```

The `chart` archetype **prints every value as text beside its bar** — a bar read by length is an
estimate, not a measurement — and refuses to render without `piece.basis` (definition, measurement
dates, who measured). `--pdf` writes a vector copy beside the PNG.

## Where the journal exists, and where it does not

**The hooks that write the journal run in Claude Cowork and Claude Code. They are inactive in chat
on the web and in the Desktop Chat tab** — where a plugin's skills still work but its hooks are
greyed out.

So a report can be asked for in a place where nothing was ever recorded, and the failure is silent:
no rows, no error, and a report that reads as a clean month. None of this is optional:

- **Check whether the journal exists before writing a single figure.** An absent journal and a quiet
  month produce the same empty table and mean opposite things. `tools/report.mjs` refuses and says
  which it thinks it is; believe it over any assumption that the hooks ran.
- **A third case: the month is in the client's store and not on this machine** — the ordinary state
  in a container whose disk does not survive a session. The tool names it when it finds a receipt for
  a month it cannot see; restore before reporting (`tools/journal-sync.mjs --restore --from <dir>`),
  because a report over the fraction on this disk understates the engagement and carries a digest
  that proves nothing.
- **When the journal is absent, say so in the report and name the reason.** "No activity recorded in
  this period, because this engagement's sessions ran on a surface where the recording hooks do not
  execute" is honest. An empty section with no explanation is the one reading a client would be
  right to hold against the practice.

## When to run it

| Trigger | What the client is really asking |
| --- | --- |
| A cadence in `09-rutinas.md` comes due | That cadence's question, not a different one |
| End of a month | "Did we get what we paid for?" |
| Before a review or renewal | "Is this worth continuing?" |
| "How much of this did the AI do?" | An output number — give it, but never alone |
| "How many hours did this save us?" | A counterfactual. It does not exist. See below |
| An approval is disputed | "Who signed off on this, and when?" |
| A figure is about to appear in a deck | Whether it survives being checked |

## Running the tool

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/report.mjs" --journal <store-root> --month <YYYY-MM> \
  --root <bound-folder-id> --out reports/<YYYY-MM>/report.md
```

`--help` lists the current options; trust it over this file. `--json` gives the figures for your
own arithmetic. Pass `--root` whenever you know the bound root folder id; without it the
unauthorized-action check does not run and the report says so.

## What the tool will not do for you

| The tool gives you | You have to supply |
| --- | --- |
| Counts by actor and by event | Which of those counts anyone should care about |
| Human review touch time, and the starts that never closed | Whether that touch time is the real review effort |
| Named approvers, and a defect line for unnamed ones | Whether an approval actually approved the thing |
| Deliveries with result `ok`; the journal's own staging rows on their own line | Whether the client actually received the artefact |
| Escalations whose tool later ran, and the ones with no recorded outcome | Nothing about who decided — "it then ran" is not an approval |
| The unauthorized-action sentence, matched to the check that ran | Nothing. Do not strengthen that sentence |
| Every figure with its definition, file, period and measurer | The mechanism, the alternatives, the contribution |

## A count of AI actions is an output metric

It proves that the system ran. It does not prove that anything got better. A month with 400
`ai_action` rows is equally consistent with a process that improved and one that got worse and
generated more rework; quoting it alone is not a weak claim, it is a claim about nothing.

The tool renders runs and escalations as **one value in one cell** so the run count cannot be
lifted out of the table on its own. Keep that discipline in prose: any sentence with the run count
in it carries the escalation count too.

An escalation's outcome is inferred, never recorded: a permission prompt hands a hook no decision,
and a denied one fires no hook, so the tool pairs a pending escalation with the first later run of
the same tool and digest in the same session. That means the tool ran afterwards — not who allowed
it. An unpaired one is a denial, an ended session or a call that never ran; the journal cannot tell
which. Neither figure is an approval; only an `approval` row with a named person is.

## Attribution

A8 §3's ladder. Método 1 (antes-después, no comparison group — most engagements here):
contribution analysis is the whole claim, in four written steps — mechanism, alternative
explanations, an evidenced contribution rather than a cause, and what would change your mind.
Métodos 2 and 3 (grupo de comparación, prueba escalonada) license a magnitude against the named
comparison unit. Never a quantified counterfactual under Método 1 ("saved 40 hours"): nobody ran
the month twice. Never a baseline from what the client remembers — high by a median of 47% in the
flattering direction; ask for three to five dated instances instead.

`REPORTING.md` **§10b** carries the three methods and the four contribution steps in full. Read it
before writing the first attribution sentence, and **§10c** before reading any figure: touch time is
not cycle time, unmatched review starts make it a floor, and an unnamed approval is not an approval.

## The three metrics that actually hold up

| Metric | Where it comes from | What it proves | How it fails |
| --- | --- | --- | --- |
| The client's own process measure, before and now | `08-linea-base.md` in the company store | Improvement, in the client's own unit | Missing baseline, or a unit redefined between the two readings |
| Automation runs paired with human escalations | This tool, one cell | The system ran *and* a person still holds the decisions | Escalations at zero — nothing was ever handed back, which is a finding, not a success |
| The unauthorized-action sentence | This tool, generated from the check that ran | That nothing recorded went outside the bound folder | Presenting it as proof of absence; the journal holds only what passed through the plugin |

Those three, together: the first alone is a number with no accountability behind it; the second
alone is activity dressed as improvement; the third alone is compliance theatre.

The defects section the tool emits goes **into the client's report**, not a private note:
publishing clean numbers while privately knowing the evidence has holes is the one failure this
instrument exists to prevent.

## Who reads it, and where the baseline comes from

Decision-making in Mexican companies concentrates in one person — power distance 81/100, about 21%
of companies have a board. Write for that one director: *usted*, the conclusion first, the tables
underneath. But the **baseline number does not come from that director**: management is routinely
unaware of a process's real exceptions. Get the before-and-after measure from the person who does
the work, and record whose it is.

## Publishing it

The markdown is the source and carries the lineage. Write it into the company store
(`reports/<YYYY-MM>/report.md`), then generate a Google Doc from it, because **comments are how the
client answers** and only a Doc returns them. A revised report is a new file, which keeps the
version history visible.

Language of the report body: es-MX, *usted*. Never *certificado* or *verificado* — this is
measurement, not certification; use **medido y evidenciado**. The tool never emits those two
words; do not reintroduce them.

Any figure or client name the client might republish needs a live row in `PROOF.md` naming its
source, who confirmed it, and its re-verification date. An expired row is not publishable.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability report \
  --why "monthly report published for review" --target "reports/<YYYY-MM>/report.md"
```

## STOP conditions

- **No `08-linea-base.md` exists.** Say explicitly, in the report: this describes **activity**, not
  **improvement** — an activity count is fully compatible with the process having got worse, so
  without a before-measure any improvement claim is the client's own estimate wearing a
  measurement's clothes, reliably wrong in the flattering direction. Say what to measure from now
  on, in the client's own unit, and who will read it. Do not write an improvement claim anyway.
- **The client asks for hours or pesos saved.** Explain once that the figure would be invented,
  offer the three metrics above, and record their decision.
- **The journal has no file for the period.** Report nothing. Do not reconstruct events from this
  session's transcript or from memory: an operational record cannot be rebuilt after the fact, and a
  reconstruction presented as a journal is fabricated evidence. Say the period is unmeasured and why.
- **You do not know the bound root folder id.** Run without `--root` and leave the tool's sentence
  as it is. Never hand-write the clean version of a check that did not run.
- **The bound store is personal** (`.company.json` says `"kind": "personal"`, or the header reads
  *Tipo de store: personal*). No client report comes out of it: there is no client behind those
  rows, so Entregas and Aprobaciones describe gates that never existed there. Its report is for the
  operator alone — what running the plugin cost, what escalated and what then ran, whether the
  journal is synced. A file mixing client and personal rows is a defect the tool lists; find out
  why before reporting from it.
- **A figure you want to publish has no `PROOF.md` row.** It does not go in.

## Reference material

| File | Open it when |
| --- | --- |
| `capabilities/company/doctrine/SCHEDULING.md` | A routine is about to be proposed or created — where it runs, and the stall that silences it |
| `<store>/08-linea-base.md` | Always, before writing anything about improvement |
| `capabilities/company/doctrine/MATURITY.md` | The quarterly re-measure of level, and the annual question of whose level moved |
| `<store>/PROOF.md` | The report will carry a figure or name the client might republish |
| `<store>/journal/execution/<YYYY-MM>.jsonl` | A figure looks wrong and you need the rows behind it |
| `lib/journal.mjs` | You need the exact row shape, or the `EVENTS` vocabulary |
