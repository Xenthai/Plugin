---
name: report
description: Report what actually happened in a company's engagement, read back from that company's own execution journal — actions by actor, human review time, who approved what, and what the evidence cannot support. Use at the end of a month, before a client review or renewal, when the client asks how much of this the AI did or what it saved them, when an approval needs an audit trail, and before any figure about the engagement is quoted anywhere. For whether the install and its connectors work, use doctor.
---

# Report — the journal read back

The tool counts. You interpret. Those are different jobs and the line between them is the whole
point of this skill: every figure in the report is arithmetic over the journal, and every sentence
about what those figures *mean* is a judgement you have to be able to defend out loud.

## Read the cadence doctrine first

`capabilities/report/doctrine/REPORTING.md` says which cadence answers which question, **what each
one may and may not claim**, and why the quarterly is the first that can report a result at all.

The rule that decides everything else: **cadence follows the data's refresh rate, not the
calendar.** Five reports saying the same thing at different intervals trains a client to stop
reading all of them. A biweekly report carries no outcome claim, because two weeks is too few
instances for a median to mean anything; a quarterly one may, because that is the shortest window
in which most mapped processes accumulate enough.

The company's agreed cadences are in its `ROUTINES.md`. A cadence not activated there does not get
a report.

**Start from the template, never from a blank page.** `capabilities/report/templates/` holds one
per cadence — `quincenal`, `mensual`, `trimestral`, `semestral`, `anual`, and `cierre-de-mapeo`.
Each carries the mandatory sections, so a report cannot lose its paired quality metric or its scope
statement by accident, and `test/report.test.mjs` refuses a template that lost one.

For a chart, render it through the engine rather than describing a number in prose:

```bash
node "${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/render.mjs" \
  --template "${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/template.html" \
  --pieces <pieces.json> --piece <id> --target square --out <dir> --pdf
```

The `chart` archetype **prints every value as text beside its bar** — a bar read by length is a
value the reader estimates, and an estimate is not a measurement. It also refuses to render without
`piece.basis`, which carries the definition, the measurement dates and who measured. `--pdf` writes
a vector copy beside the PNG.

## Where the journal exists, and where it does not

**The hooks that write the journal run in Claude Cowork and Claude Code. They are inactive in chat
on the web and in the Desktop Chat tab** — the surfaces where a plugin's skills still work but its
hooks are greyed out.

So a report can be asked for in a place where nothing was ever recorded, and the failure is silent:
no rows, no error, and a report that reads as a clean month.

Two things follow, and neither is optional:

- **Check whether the journal exists before writing a single figure.** An absent journal and a quiet
  month produce the same empty table and mean opposite things. `tools/report.mjs` refuses and says
  which it thinks it is; believe it over any assumption that the hooks ran.
- **When the journal is absent, say so in the report and name the reason.** "No activity recorded in
  this period, because this engagement's sessions ran on a surface where the recording hooks do not
  execute" is honest. An empty section with no explanation is the one reading of this a client would
  be right to hold against the practice.

## When to run it

| Trigger | What the client is really asking |
| --- | --- |
| A cadence in `ROUTINES.md` comes due | Whatever that cadence's question is. Do not answer a different one |
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

`--help` lists the current options; trust it over this file. `--json` gives the same figures for
your own arithmetic. Pass `--root` whenever you know the bound root folder id — without it the
unauthorized-action check does not run, and the report will say so rather than read as clean.

## What the tool will not do for you

| The tool gives you | You have to supply |
| --- | --- |
| Counts by actor and by event | Which of those counts anyone should care about |
| Human review touch time, and the starts that never closed | Whether that touch time is the real review effort |
| Named approvers, and a defect line for unnamed ones | Whether an approval actually approved the thing |
| The unauthorized-action sentence, matched to the check that ran | Nothing. Do not strengthen that sentence |
| Every figure with its definition, file, period and measurer | The mechanism, the alternatives, the contribution |

## A count of AI actions is an output metric

It proves that the system ran. It does not prove that anything got better. A month with 400
`ai_action` rows is equally consistent with a process that improved and one that got worse and
generated more rework — the count cannot tell those apart, so quoting it alone is not a weak claim,
it is a claim about nothing.

The tool renders runs and escalations as **one value in one cell** so the run count cannot be
lifted out of the table on its own. Keep that discipline in prose: any sentence with the run count
in it carries the escalation count too.

## Attribution

Contribution analysis, in four written steps — mechanism, alternative explanations, an evidenced
contribution rather than a cause, and what would change your mind. Never a quantified counterfactual
("saved 40 hours", "3× faster"): nobody ran the month twice. Never a baseline built from what the
client remembers, which is high by a median of 47% in the flattering direction — ask for three to
five dated instances instead.

`REPORTING.md` **§10b** carries the four steps in full and the evidence behind both refusals. Read it
before writing the first attribution sentence, and **§10c** before reading any figure: touch time is
not cycle time, unmatched review starts make it a floor, and an unnamed approval is not an approval.

## The three metrics that actually hold up

| Metric | Where it comes from | What it proves | How it fails |
| --- | --- | --- | --- |
| The client's own process measure, before and now | `BASELINE.md` in the company store | Improvement, in the client's own unit | Missing baseline, or a unit redefined between the two readings |
| Automation runs paired with human escalations | This tool, one cell | The system ran *and* a person still holds the decisions | Escalations at zero — nothing was ever handed back, which is a finding, not a success |
| The unauthorized-action sentence | This tool, generated from the check that ran | That nothing recorded went outside the bound folder | Presenting it as proof of absence; the journal holds only what passed through the plugin |

Those three, together. The first without the second is a number with no accountability behind it;
the second without the first is activity dressed as improvement; the third without either is
compliance theatre.

The defects section the tool emits goes **into the client's report**, not into a private note.
Publishing clean numbers while privately knowing the evidence has holes is the one failure this
instrument exists to prevent.

## Who reads it, and where the baseline comes from

Decision-making in Mexican companies concentrates heavily in one person — power distance 81/100,
and only about 21% of companies have a board. Write for that one director: *usted*, the conclusion
first, the tables underneath it.

But the **baseline number does not come from that director**. Management is routinely unaware of
the real exceptions in a process. Get the before-and-after measure from the person who does the
work, and record whose it is.

## Publishing it

The markdown is the source and carries the lineage. Write it into the company store
(`reports/<YYYY-MM>/report.md`), then generate a Google Doc from it, because **comments are how the
client answers** and only a Doc returns them. The store cannot rewrite a file's contents, so a
revised report is a new file — which is what leaves the version history visible.

Language of the report body: es-MX, *usted*. Never the words *certificado* or *verificado* — this
is measurement, not certification. Use **medido y evidenciado**. The tool never emits those two
words; do not reintroduce them in the sentences you add.

Any figure or client name the client might republish needs a live row in `PROOF.md` naming its
source, who confirmed it, and its re-verification date. An expired row is not publishable.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability report \
  --why "monthly report published for review" --target "reports/<YYYY-MM>/report.md"
```

## STOP conditions

- **No `BASELINE.md` exists.** Say explicitly, in the report: this describes **activity**, not
  **improvement**. The distinction matters because an activity count is fully compatible with the
  process having got worse, so without a before-measure any improvement claim is the client's own
  estimate wearing a measurement's clothes — and that estimate is reliably wrong in the direction
  that flatters everyone. Then say what to measure from now on, in the client's own unit, and who
  will read it. Do not proceed to write an improvement claim anyway.
- **The client asks for hours or pesos saved.** Explain once that the figure would be invented,
  offer the three metrics above, and record their decision if they insist.
- **The journal has no file for the period.** Report nothing. Do not reconstruct events from this
  session's transcript or from memory: an operational record cannot be rebuilt after the fact, and a
  reconstruction presented as a journal is fabricated evidence. Say the period is unmeasured and why.
- **You do not know the bound root folder id.** Run without `--root` and leave the tool's sentence
  as it is. Never hand-write the clean version of a check that did not run.
- **A figure you want to publish has no `PROOF.md` row.** It does not go in.

## Reference material

| File | Open it when |
| --- | --- |
| `capabilities/company/doctrine/SCHEDULING.md` | A routine is about to be proposed or created — where it runs, and the stall that silences it |
| `<store>/BASELINE.md` | Always, before writing anything about improvement |
| `capabilities/company/doctrine/MATURITY.md` | The quarterly re-measure of level, and the annual question of whose level actually moved |
| `<store>/PROOF.md` | The report will carry a figure or name the client might republish |
| `<store>/journal/execution/<YYYY-MM>.jsonl` | A figure looks wrong and you need the rows behind it |
| `lib/journal.mjs` | You need the exact row shape, or the `EVENTS` vocabulary |
| `node tools/report.mjs --help` | Before quoting any option from this file |
