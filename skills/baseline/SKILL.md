---
name: baseline
description: Measure a company's "before" while it still exists — per-process cycle time, touch time, throughput and error rate, countable state facts, and coverage. Use BEFORE any process is automated, assisted or changed, because the before is perishable and cannot be reconstructed from memory afterwards; use again at every check-in to re-record the same measures the same way. Also use when a savings figure, an improvement percentage or any before/after claim is wanted, since whether such a claim is publishable at all depends on what was frozen here. The process inventory this measures against comes from process-map into PROCESSES.md, never from here. Reading back what happened in an engagement — actions, review time, approvals, the month's report — is report, not this skill.
---

# Baseline — the company's "before"

You measure. You change nothing in this session. The moment a process is touched, its before is
gone: about 20% of event detail is gone after a year, and self-reported time diverges from logged
time by a median 47%. There is no second chance to take it.

## When to run

| Situation | What to do |
| --- | --- |
| A process is about to be automated, assisted or redesigned | Take the baseline **first**. This is the whole point of the capability |
| A check-in falls due | Re-record the same measures, same definitions, same boundary. Point-in-time, never trended |
| Someone asks for a savings or improvement figure | Check what was frozen. No frozen boundary means no publishable figure — say that before offering one |
| The company has no `PROCESSES.md` yet | Stop. The inventory is `process-map`'s output; there is no denominator and no list of subjects without it |
| The question is what happened this month, or how much the AI did | That is `report`, read back from the journal. Come here only for the *before* a comparison needs |

## Order of work

1. **Freeze the boundary and the definitions in writing.** Exact trigger, exact deliverable, what
   counts as a completion, what counts as rework. Before anything is measured, and before anything
   is touched. Boundary drift — an after that quietly measures a narrower slice — is the failure
   that manufactures fake wins, and it is only detectable against a boundary written down first.
2. **Harvest durable timestamps before asking anyone anything.** CFDI-stamped invoices, ERP or
   system action logs, email and document metadata. These survive years and are not subject to
   recall error. Effort is the only thing they cannot give you.
3. **Walk three to five dated, concrete instances** with the person who does the work, using the
   four questions below. Never one estimate, never "how long does it usually take".
4. **Count the state facts**, each with its verification. A count without its verification does
   not get written down.
5. **Compute coverage** as processes with assisted execution ÷ processes identified, and record
   both numbers.
6. **Write `BASELINE.md`** in the company's store from the scaffold, in es-MX.
7. **Journal each measurement** as it is taken, not in one batch at the end.

**Interview the person who does the work, not their manager.** Decision-making in Mexican
companies concentrates in one person, and management is routinely unaware of the real exceptions —
the workarounds, the re-keying, the phone call that unblocks the process every time.

## What to capture, per layer

| Layer | Capture | Refuse to record |
| --- | --- | --- |
| 1 · Operation | Cycle time, touch time, throughput, error and rework rate — **only** on processes actually being touched | A single metric on its own; a throughput figure with no paired quality metric |
| 2 · State | The countable facts, each with a date, an independent second source, or evidence of use | Mere existence of a document; a self-report the consultant could have checked directly |
| 3 · Coverage | Assisted processes and identified processes, both numbers, dated | The ratio alone |

Cycle time alone hides the gain that matters: `WIP = throughput × cycle time` (Little's Law), so a
person who now supervises three instances instead of being blocked on one shows flat cycle time and
triple throughput. Expect **touch time and cycle time to move in opposite directions** on a good
automation, and tell the client that before it happens.

## The four elicitation questions, verbatim

Ask these, per instance, in this order:

1. How long were you personally engaged?
2. Could you do anything else meanwhile, or did you have to stay on it?
3. How many times did you leave the task to go find something?
4. How many of these could you have open at once?

Recall of recurring-task duration is dominated by **over**estimation — 22% of results in a review
of 32 studies were high by more than 100%, and a separate study found a median 45% overestimate.
Forecasting a future project skews the other way, low, so never treat the two as the same error.
The recall error runs in the direction that flatters the consultant, which is exactly why a single
estimate is refused.

## Record every measurement in the journal

The figure itself lives in `BASELINE.md`. The journal records **what was measured, how many
instances, over which window, and from which source class** — never the client's numbers.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event baseline --capability baseline \
  --why "boundary and metric definitions frozen before any change to <process>" \
  --target "BASELINE.md#<process>" --detail "layer1 boundary+definitions frozen"
```

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event baseline --capability baseline \
  --actor "person:<who measured>" \
  --why "touch time captured for <process> from dated instances walked with the operator" \
  --target "BASELINE.md#<process>" \
  --detail "layer1 metric=touch_time n=4 window=<YYYY-MM> source=walked-instances"
```

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event baseline --capability baseline \
  --why "state fact counted with independent verification" --target "BASELINE.md#estado" \
  --detail "layer2 fact=named_owner counted=7 of=11 verification=owner+peer-separately"
```

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event baseline --capability baseline \
  --why "coverage recorded at baseline" --target "BASELINE.md#cobertura" \
  --detail "layer3 assisted=0 identified=11"
```

Use `source=client-reported` in `--detail` whenever the figure is the client's own estimate, and
`--event blocked` when a baseline could not be taken at all:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event blocked --capability baseline \
  --why "no written boundary for <process>; baseline not taken" --target "<process>"
```

## Non-negotiable in what you write

- Every number in `BASELINE.md` is **"medido y evidenciado, autorreportado"**. Never
  *certificado*, never *verificado* — those words require an accreditation nobody here holds.
- Every throughput or savings figure carries a **paired quality metric** — error, rework or
  rejection — measured on the same instances. Without it, "items processed" inflates by splitting
  units or auto-closing what was never finished.
- Attribution is a **plausible, evidenced contribution** with alternative explanations named and
  answered. Never a magnitude claim, never an implied counterfactual, never "we caused N%".
- No social claim beyond dated, screenshotted public state: follower count, posting cadence,
  visible engagement. Reach, impressions and revenue need platform-side access and are otherwise
  unavailable, not estimated.

Append the conversation to `INTERVIEW.md`: who reported each duration and volume, verbatim, with
the date. A self-reported figure is only defensible later if its source is recoverable, and
recurring-task durations skew high when recalled — the attribution is what makes that correctable.

## STOP conditions

- **The process boundary is not written down yet.** Write it first — exact trigger, exact
  deliverable, definition of completion and of rework — and get it confirmed. Measuring against an
  unwritten boundary produces a number that cannot be compared to anything later.
- **The client offers a single estimate and nothing else**, and no instances can be walked. Record
  it as **client-reported** and say plainly, in the document and to the client, that it cannot
  support a before/after claim. Do not average it, dress it up, or let it become the before.
- **No process inventory exists.** The denominator for coverage and the list of state-fact subjects
  are `PROCESSES.md`, written by `process-map` in the phase 3 session. Route there rather than
  inventing an inventory here — an inventory invented while measuring is a denominator chosen to
  suit the numerator.
- **The intervention has already happened.** Say so. Harvest durable timestamps for the period
  before it and label everything effort-related as an unverified client estimate. Never present a
  reconstructed before as a measured one.

## Reference

| File | Read it when |
| --- | --- |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | Before the first baseline of an engagement; whenever a client questions a metric, an attribution claim, or why there is no single maturity score; before publishing any outcome figure |
| `scaffold/company/BASELINE.md` | Writing or updating the company's own `BASELINE.md` — it is the es-MX structure the director reads |
