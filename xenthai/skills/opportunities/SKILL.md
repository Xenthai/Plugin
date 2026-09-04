---
name: opportunities
description: Find what to improve next from a company's own execution journal instead of from another interview — which documents get reworked every period, which escalation keeps coming back, which step has been failing for months without anyone reporting it. Use at a quarterly or semiannual review, when the client asks what to do next or where else AI would help, when an engagement is up for renewal and needs a next phase, or when a process was mapped months ago and the estimates in it were never re-measured. Requires several periods of journal history. For the first mapping of a company that has none, use process-map; for scoring and pricing a shortlist in a session with the client, use process-access.
---

# Opportunities — what the journal already knows

After a few months an engagement holds something no interview can produce: a record of what was
actually worked on, how often, and what kept going wrong. This skill reads it.

**The tool counts. You interpret.** Repetition is a fact. What a repetition *means* — automate it,
split the document, write the missing policy, fix the broken step — is a judgement that needs the
process, the people and the client's priorities.

## Run it

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/opportunities.mjs" --journal <store-root>
```

`--help` lists the options; trust it over this file. `--json` gives the findings as data. `--min`
sets how many distinct periods a pattern must span, and the default of 3 is the floor — lowering it
below 3 produces findings a busy fortnight can manufacture.

The tool refuses to report anything when the journal covers fewer periods than the threshold. That
refusal is correct. Say "there is not enough history yet" and stop; do not lower `--min` to produce
a finding, which is the same move as picking the denominator that makes a number look good.

## What each pattern can and cannot mean

| The tool found | What it might mean | What it does not mean |
| --- | --- | --- |
| A document worked every period | An automation candidate | That it should be automated — that needs the test below |
| The same escalation reason returning | A decision with no written criterion, now delegable | That the escalation was wrong. It may be the control working |
| The same tool failing on the same target | A broken step nobody reported | An improvement opportunity. It is a defect, and it has been costing every period |
| The guard blocking the same thing | A gap in the product, **or** someone attempting what they should not | One or the other. Find out which before writing either down |
| A document consuming review every period | Its structure is fighting the task | That reviewing it is waste. Review may be exactly right |

## Before any finding becomes a recommendation

Apply the test in order. A finding that fails any step is not a proposal:

1. **Autonomous, recurring and reviewable.** Recurring is what the tool proved. Autonomous and
   reviewable it cannot see. **Reviewable is the one people skip** — if nobody can say what good
   looks like, there is no check, and unattended operation is unreachable forever.
2. **Name the process it belongs to.** Open `PROCESSES.md`. If the work maps to a process already
   in the inventory, the finding is *evidence about that process*. If it maps to nothing there, the
   finding is that a process runs which nobody wrote down — record it in §7 and treat it as
   inventory work, not automation work.
3. **Check who owns it and who authorises it.** §4 and §5 of `PROCESSES.md`. A candidate whose
   owner is unknown is not a candidate; it is a question for the next session.

## The best thing this replaces is an estimate

`PROCESSES.md` §6 scores automation viability, and two of its research-backed criteria — execution
time and failure rate — are normally filled from what somebody remembers. Those estimates run high
by a median of 47% in the flattering direction.

The journal measures both. Where a finding covers a process in §6, **replace the estimate with the
measured value and say in the cell that it came from the journal, with the periods it covers.** That
single substitution is worth more than every other output of this skill: it turns two columns of a
scoring table from opinion into evidence, and it is the argument for the engagement continuing.

Leave the judgement criteria — cost of error, regulatory constraint — exactly as they are. The
journal cannot see either, and §6 keeps them separate for that reason.

## What this is blind to

**The journal holds only what passed through the plugin.** Every finding is therefore biased toward
work the practice already touches, and the tool prints that warning with its output.

The process nobody has opened is invisible here, and it is frequently the one worth the most. So
this never replaces `process-map`; it prioritises among what is already known, and the client's own
answer to "what hurts today" still outranks it.

## Where the findings go

Findings live in `PROCESSES.md` — the shortlist has one owner and this does not create a second.
Add them as rows with their provenance visible, so a reader can tell a journal-measured value from
an interviewed one. Then record that the analysis ran:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event lookup --capability process \
  --why "journal reviewed for recurring patterns over <N> periods" --target "PROCESSES.md"
```

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## STOP conditions

- **Fewer periods than the threshold.** Report that, and nothing else. A pattern over two periods is
  a coincidence with a chart.
- **Nothing recurred above the threshold.** That is a finding, not a failure of the analysis. Say
  the recorded work shows no repetition strong enough to support a proposal, and do not invent one.
- **The journal does not exist at all.** Do not read that as a company with nothing to improve. The
  hooks that write it run in Claude Cowork and Claude Code and are inactive in chat on the web and
  in the Desktop Chat tab, so the file may never have been created. Say which of the two it is.
- **No `PROCESSES.md`.** Findings have nowhere to land and nothing to be checked against. Run
  `process-map` first; a list of file paths is not a list of processes.
- **The client asks which one saves the most.** That is a counterfactual and it does not exist. Give
  them the periods, the occurrences and the measured time, and let them choose.

## Reference material

| File | Open it when |
| --- | --- |
| `capabilities/process/doctrine/PROCESS.md` | Always — the viability criteria and what may be scored |
| `capabilities/company/doctrine/SESSION.md` | The findings will be taken into a session with the client |
| `capabilities/report/doctrine/REPORTING.md` | A finding will appear in a cadence report |
| `<store>/PROCESSES.md` | Always, before writing anything — findings land there or nowhere |
| `node tools/opportunities.mjs --help` | Before quoting any option from this file |
