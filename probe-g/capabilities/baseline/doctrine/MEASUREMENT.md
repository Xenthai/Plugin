# Measurement doctrine — the company's "before"

Without a before captured while it still existed, the consultancy can never publish an outcome
figure. Not "publishes a weaker one" — cannot publish one at all, because none was ever measured.
Everything in this file exists to make one later claim defensible, and to keep every other claim
out of client-facing text.

## Three layers, and never a composite index

Report three layers separately. Never sum them into a score, a level, a percentage of readiness,
or a "maturity index".

CMMI is the strongest case anyone could make for a maturity level: decades old, professionally
appraised, an institute behind it, published appraisal methods. Its own institute's work describes
the level-to-performance evidence as **not rigorous**. A 2023 systematic review of digital maturity
models is titled, in effect, **much ado about nothing**. A bespoke composite invented by one
consultant, applied to one company, with no comparison group and no appraisal method, is weaker
than CMMI on every axis that already made CMMI weak.

A composite also deletes its own construction. The weights *are* the argument; a single number
hides them, and hidden weights cannot be argued with by a director who disagrees.

| Layer | Measures | Can support | Can never support |
| --- | --- | --- | --- |
| 1 · Operation | Per-process performance, only on processes actually touched | "This process, on these dated instances, moved from X to Y" | A company-level performance statement |
| 2 · State | Countable facts about systems and processes | "These facts were true on this date, verified this way" | Any claim that the company performs better |
| 3 · Coverage | Processes with assisted execution ÷ processes identified | "This much of the identified work is now assisted" | Any claim about the value of that work |

Layer 2 is the one that gets misread. A state fact is **not** a performance claim: "seven of
eleven processes have a named accountable owner" says nothing about whether they run well.

## Layer 1 — Operation

Only on the processes actually touched. Measuring a process nobody will change spends the client's
attention and buys no claim.

| Measure | Operational definition | Captured from | The trap |
| --- | --- | --- | --- |
| Cycle time | Wall clock from the exact trigger to the finished output, waiting included | System timestamps where they exist; dated instances walked live where they do not | Reported as an average with no volume and no window |
| Touch time | Human minutes actually engaged inside that span | The four elicitation questions, per instance | Confused with cycle time by the person answering |
| Throughput | Instances completed per person per period | Counted from a system, with the period named | Counting starts, not completions |
| Error and rework rate | Instances needing correction or a redo ÷ instances completed, same window | The same instances, not a different sample | Silently dropped when it moves the wrong way — see Guardrails |

### Why three and not one

`WIP = throughput × cycle time` — **Little's Law** (John D. C. Little, 1961). A proven theorem
about queues, not a heuristic, and the reason cycle time and throughput are not interchangeable.

Cycle time alone hides the case that matters most here. A person who was blocked on one instance
at a time now supervises three: cycle time per instance is flat, or worse, while throughput
triples. Measured on cycle time alone, the engagement reports no change.

Touch time is the third because it is the only one of the three that is human cost. **Flow
efficiency** — value-add time ÷ lead time — is a defined metric popularised for knowledge work,
and typical knowledge-work values run **5–15%**: most elapsed time is waiting, not working. So an
automation that removes waiting moves cycle time and barely moves touch time, and an automation
that removes work moves touch time and may barely move cycle time.

**Touch time and cycle time moving in opposite directions is the signature of a good automation,
not a contradiction.** Say so before it happens, or the client reads the flat cycle time as a
failure. One person now holds three instances open: more elapsed time per instance, far fewer
engaged minutes per instance.

## Layer 2 — State facts, each with the verification that defeats document theatre

Document theatre is paperwork manufactured to pass the check. Every row below is countable, and
every row has a verification that a manufactured document fails.

| State fact | Counted over | Verification |
| --- | --- | --- |
| Systems with a documented access map | Systems inventoried | Require a version date **older than the audit**. A map dated the week of the audit is the audit's own output |
| Systems retaining an action log, and for how long | Systems inventoried | Check the log's **own start date**, not the retention policy's claim |
| Processes with a named accountable owner | Processes inventoried | Ask the owner **and an independent peer, separately**. Disagreement invalidates the count for that process |
| Processes with a written exception path | Processes inventoried | Verify against a **real past exception**. A document with no history of use is weak evidence |
| Duplicate data-entry points (the same fact retyped across systems) | Systems inventoried | **Trace one real transaction end to end.** Nearly ungameable: an API exists or it does not |
| Single-person points of failure | Processes inventoried | Require evidence the named backup has **actually executed the task once** — designation is not evidence |
| Systems with no API or export | Systems inventoried | The consultant verifies **directly**, independent of self-report |
| Tribal-knowledge processes | The **full** process inventory, not a sample | The complement of "has any written procedure". Never sampled: the unwritten ones are exactly the ones nobody volunteers |

The pattern behind all eight: **require a date, an independent second source, or evidence of use.
Never mere existence.** Any new state fact added later must come with a verification of one of
those three shapes or it does not get counted.

## Layer 3 — Coverage

Processes with assisted execution ÷ total processes identified. Report the numerator and the
denominator, never the ratio alone.

This is a claim about **the work delivered**, not about the company's performance, which makes it
the cleanest of the three: the consultancy controls the numerator and the process inventory fixes
the denominator. It is also the layer with the least persuasive value, and that ordering is
correct — the cleanest number is rarely the impressive one.

## Elicitation — never a single self-reported duration

Ask for **three to five dated, concrete instances**, walked live with the person who does the
work. Never "how long does this usually take", which returns a number nobody measured.

Four questions, per instance:

1. How long were you personally engaged?
2. Could you do anything else meanwhile, or did you have to stay on it?
3. How many times did you leave the task to go find something?
4. How many of these could you have open at once?

Question 1 separates touch time from cycle time. Question 2 tests whether the person was occupied
or merely waiting — the difference between the two is where flow efficiency lives. Question 3
counts interruptions the person will not otherwise mention because they are normal to them.
Question 4 is the Little's Law question: it is what tells you whether a throughput gain is
available at all.

**The direction of the error matters more than its size.** A systematic review of 32 studies and
182 tasks found recall of recurring-task duration dominated by **overestimation**, with 22% of
results high by more than 100%; a separate study found a median **45% overestimate**. Forecasting
a *future* project skews the other way — low — so never conflate the two: a client's estimate of a
task they already do runs high, and their estimate of a project they have not started runs low.

The recall error runs in the direction that flatters the consultant. An inflated before makes any
after look like a win. That is what makes it dangerous rather than merely noisy.

## Comparability — freeze the boundary before touching anything

Before any intervention, write down, for each process to be measured:

- The **process boundary**: the exact trigger and the exact deliverable. "From the moment the
  client's PO arrives by email to the moment the stamped invoice is sent", not "invoicing".
- The **operational definition** of each metric, including what counts as a completion and what
  counts as rework.

The classic failure is **boundary drift**: the "after" quietly measures a narrower slice — the
step that was automated, not the process — and manufactures a win. It is rarely dishonest and
almost always fatal to the claim, because the boundary was never written down to be compared
against.

Rules that follow:

- Use **per-unit** metrics, logged with the **volume** and the **date** of the window. A total
  drops when volume drops.
- Never compare a peak-season after to an off-season before **unlabelled**. Label the season on
  both sides; if only one side is peak, say so on the number itself.
- Minimum defensible record for any before/after: **written boundary, written metric definition,
  three to five dated instances, a volume figure for the same window, and who measured it and how**
  — that last recorded as a caveat attached to the number, not filed elsewhere.

Anything short of that minimum is an illustration. It can be shown to the client; it cannot be
published.

## Perishability — what can and cannot be reconstructed

An operational before **cannot** be reconstructed from memory. About **20% of event detail is gone
after a year**, and self-reported time use diverges from logged time by a median **47%**. This is
why the baseline runs before the intervention and not when someone asks for results.

Durable system timestamps **are** recoverable, often years later:

| Recoverable | Gives you |
| --- | --- |
| CFDI-stamped invoices | Dated, sequenced, tamper-evident completions — the strongest artefact in a Mexican company |
| ERP or system action logs | Cycle time between states, throughput per period |
| Email and document metadata | Trigger and delivery timestamps for processes that live in a mailbox |

Use those first, always. Effort — touch time — is the one thing timestamps cannot give you, and it
is exactly the number a client will happily invent. **Never backfill an effort figure from memory
without labelling it an unverified client estimate**, in the document, on the number.

## Attribution — contribution, never a counterfactual

One company, no control group, no random assignment. **No magnitude claim is defensible.** Never
"we caused 23% of the improvement", and never a figure with an implied counterfactual — "would
have taken 40 hours without us" — because nobody measured a without-us.

What the evaluation literature does permit:

| Method | What it needs | What it licenses |
| --- | --- | --- |
| Theory of change | A written mechanism: this intervention, this step, this measure moves | The mechanism itself, stated as a claim about design |
| **Contribution analysis** (Mayne) | No baseline control group. Alternative explanations **named and addressed** | "A plausible, evidenced contribution" — never a quantified counterfactual |
| Process tracing | Same family, much heavier evidentiary work | A single flagship case. Reserve it; do not run it per client |
| Interrupted time series | Commonly cited guidance wants **eight or more** observations per side | With three to six, illustrative only — never proof |

Contribution analysis is the working default because it is the only one of the four that survives a
single company with no comparison group. Its price is that alternative explanations must be
written down and answered — seasonality, a new hire, a price change, the Hawthorne effect of being
measured at all. An unnamed alternative explanation is the one a sceptical reader supplies.

## Cadence

| What | When | Shape |
| --- | --- | --- |
| Layer 2 state facts | At baseline and at each check-in | **Point-in-time, not trended.** Two dated snapshots, never a line chart |
| Layer 3 coverage | At each check-in | Numerator and denominator, dated |
| Layer 1 process metrics | Monthly, with **three or more observations each side**; more when the process is seasonal | Per-unit, with volume and window |

State facts are not trended because a count that moves from 4 to 7 invites a slope, and a slope
invites extrapolation, which is a performance claim these facts cannot carry.

## Guardrails

**Never publish a throughput or savings figure without a paired quality metric — error, rework, or
rejection rate — measured on the same instances.** Goodhart's Law and Campbell's Law are the
governing citations: a measure that becomes a target stops measuring what it measured. The
concrete risk here is not abstract. "Items processed" inflates by splitting units into smaller
ones, or by auto-closing instances that were never really completed. Both look like a win in
Layer 1 and both show up immediately in a rework rate measured on the same instances.

Report every number in the shape an assurance engagement uses (**ISAE 3000**):

| Metric | Fixed definition | Source | Measurement date | Named measurer |
| --- | --- | --- | --- | --- |

**Never the words "certified" or "verified"** without an accreditation behind them. The honest
framing, in every client-facing document, is **"measured and evidenced, self-reported"**.

## Consultant accountability — the other half

The client's baseline measures the client. These measure the consultancy, and they are the harder
half to publish honestly.

Output metrics — hours logged, pieces published, workflows shipped — prove **activity, not value**.
That is documented productivity theatre: it rises when nothing improves, and it rises fastest when
the work is being padded.

The honest set:

| Metric | Why it is honest |
| --- | --- |
| The client's own baseline-versus-current process metric | It is the client's number, on the client's boundary, not a count of consultancy output |
| Automation runs **paired with** human-escalated exceptions | **Paired is the point.** Runs alone reward a system that hides its failures; the pair proves the boundary is respected rather than that the system became invisible |
| Zero unauthorized actions against the documented permission scope | Turns the governance promise into a **falsifiable** claim — the journal either shows an out-of-scope action or it does not |

An escalation count of zero is not a triumph; it is a signal to check whether exceptions are being
absorbed silently.

## Social, when there is no analytics access

Common case: the consultancy manages publishing but has no platform-side analytics. The only
honest baseline is **publicly visible account state, screenshotted and dated**:

| Captured | Not captured |
| --- | --- |
| Follower count, on a date | Reach |
| Posting cadence over a stated window | Impressions |
| Visible engagement on visible posts | Revenue or attributed pipeline |

It supports claims about **visible public-state change** and nothing else. Reach, impressions and
revenue need platform-side access; without it, they are unavailable, not estimated.

Any number the client supplies from their own dashboard is labelled **client-reported**, never
independently measured — including when it is almost certainly correct. The label costs nothing
and is the difference between a caveat and a misrepresentation.
