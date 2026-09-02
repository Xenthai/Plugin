# Reporting doctrine — the cadences, and what each one may claim

Read this before proposing a reporting routine to a company, and before writing any report at any
cadence.

---

## 1. The framing decision, made once

A report whose stated purpose is to demonstrate the consultant's value is **advocacy**, and a
director of a mid-to-large company has read hundreds of them. It gets discounted on sight.

**Every report this plugin produces is built so the client can decide — including decide to stop.**
That is not modesty. It is the only version that gets believed, and being believed is what renews an
engagement.

Three things make a report credible, and none of them costs anything:

1. **Name what did not work.** A report with no negatives reads as marketing. The section that
   names a failure is the section that makes the rest believable.
2. **Name the alternative explanations and answer them.** Not "we improved your quoting by 3x" but
   "quotes went from 12 to 36 a week, and here are the three other things that changed in your
   company in that period, and why we think they do not account for it."
3. **State what cannot be claimed, first.** Reach, revenue, causation. Saying it before the client
   asks is what makes everything else land.

---

## 2. Cadence follows the data's refresh rate, not the calendar

The failure mode of a five-cadence routine is **five reports saying the same thing at different
intervals**, which trains the client to stop reading all of them. So each cadence must answer a
question the others cannot, and **a report that cannot answer a distinct question should not exist
at that cadence.**

| Cadence | The question it answers | Source | What it must NOT contain |
| --- | --- | --- | --- |
| Biweekly | Is anything broken that nobody told me about? | The journal alone | **Any outcome claim.** Two weeks is too few instances |
| Monthly | Is the work landing? | Journal, deliveries, first quality signal | A baseline comparison |
| Quarterly | Did the number we measured before actually change? | A re-measure of `BASELINE.md` | **Attribution.** It states what moved, never why |
| Semiannual | Was it us? | Contribution analysis | A magnitude claim or an implied counterfactual |
| Annual | Was this worth it, and what should we stop doing? | Everything above, plus the claim ledger | Nothing. It is the only one that may recommend not renewing |

**Why the quarterly is the first that may claim a result:** a quarter is the shortest window in which
most mapped processes accumulate enough instances for a median to be stable. Before that, a number
is noise presented as an achievement — and one noisy figure that later reverses costs more
credibility than three quiet months.

---

## 2b. A cadence is a promise about execution, not only about content

**A scheduled routine on a desktop runs only while that machine is on and the application is open.**
So a routine can stop running with no error and no notice — nothing fails, the report simply does
not arrive.

That is worse than having no routine at all, because the client stops checking and nobody notices
the silence. **Design the detection of absence, not the execution.** Execution rarely fails; silent
absence always goes unnoticed.

Two mechanisms that work, and both cost nothing:

- **Number every report in sequence.** A biweekly #14 arriving after #12 makes the missing #13
  visible. A report with no sequence number leaves no visible hole.
- **Tell the recipient which day to expect it.** A fixed day, agreed in writing, turns absence into
  something a person notices without being told.

Record per routine, in the company's `ROUTINES.md`, where it runs and what happens when that
machine is off. **Never promise a cadence that depends on a laptop being open** unless that
dependency is written down and the client accepted it with the condition said out loud.

## 3. Biweekly — the absence of surprises

One page. Generated from the journal with **zero client time**. Its real job is not information; it
is that a client who hears nothing assumes nothing is happening.

| Section | Content |
| --- | --- |
| What ran | Counts by capability, from `ai_action` and `delivery` |
| What was escalated | Every `escalation` with what it was escalated to — a **role**, never a person's private detail |
| What was blocked | Every `blocked` row, and whether it resolved |
| Errors | Every `error` and `guard_error`, with what was done |
| Waiting on the client | Approvals pending, and pending fields per document from `bin/status.mjs` |
| Nothing to report | **Say so explicitly.** A quiet fortnight stated plainly is information; a skipped report is not |

**Never** a follower count, a rate, an improvement, or a comparison. If the fortnight produced no
escalations and no errors, the report is four lines and that is correct.

---

## 4. Monthly — is the work landing

Two pages.

| Section | Content |
| --- | --- |
| Delivered against the approved plan | What was planned, what shipped, what slipped and why |
| The paired quality metric | **Mandatory.** Rework, rejection or escalation rate on the same items. A delivery count with no quality figure inflates by splitting units |
| Review effort | Touch time from `review_start`/`review_end`, **and the review starts that never closed** — an unclosed review is either an abandoned review or a broken instrument, and both matter |
| The authority sentence | Whether anything was recorded acting outside the documented permission scope. Generated from the check that ran. **Never strengthen this sentence beyond what the check covers** |
| Expiring claims | Rows in `PROOF.md` whose re-verification date falls in the next 60 days. A claim true in March gets republished in December unless something checks |
| What did not work | At least one item, or an explicit statement that nothing failed this month |

---

## 5. Quarterly — did the number change

Four to six pages. This is a **re-measure**, not a summary: the same frozen definitions, the same
processes, the same instrument.

| Section | Content |
| --- | --- |
| Per process, before and now | Each with its **paired quality metric**, its definition verbatim, its measurement dates and who measured |
| Throughput separately from duration | A person can report the same duration and produce three times the output. Measuring only cycle time hides that entirely — capture instances completed per period, and how many a person can hold open at once |
| The maturity layer | Written procedures that now exist, single points of failure closed, duplicate-entry points removed. **Absence is a measurement**, and its reduction is the most defensible number in the whole report |
| Presence, if social is in scope | A new dated capture appended to `PRESENCE.md`, compared only against the company's own earlier captures and its named competitor set |
| What did not move | Explicitly. A process that did not improve is the honest half of the report and the input to the next quarter |
| What we still cannot measure | And what it would take |

**No attribution in this report.** It states what changed. Whether the change was Xenth AI's is the
semiannual report's job, and separating them is what keeps the quarterly figures usable even when
the attribution is contested.

---

## 6. Semiannual — was it us

Eight to twelve pages, presented in person. **This is the report that earns a renewal**, and it earns
it by being the hardest on its own claims.

Its spine is **contribution analysis**, which is the only attribution posture the evaluation
literature permits for one operator, one company, and no control group.

| Section | Content |
| --- | --- |
| The theory of change, stated | The mechanism in plain sentences: we mapped X, which let Y stop doing Z, which is why the number moved. If the mechanism cannot be stated, there is no claim to make |
| The evidence for it | Which measured changes are consistent with that mechanism, and which are not |
| **Alternative explanations, named** | Hiring, seasonality, a system the client bought, a lost or won customer, market conditions, a person who left. **Each one named and answered with evidence, not dismissed** |
| The contribution claim | A plausible, evidenced contribution. **Never a magnitude, never "we caused N%", never an implied counterfactual** |
| **What we recommended and the client did not do** | And what it appears to have cost. This is not blame — it is the honest ledger, and it is the section that makes a director trust everything else |
| The opportunity scan | The client's own journal names the next process worth automating: the same action repeated on the same kind of target, lookups clustered around one process, escalations that always resolve the same way, review time concentrated in one step |
| What we got wrong | At least one item |

### The question that has no honest answer

**"How many hours did this save us?"** is a counterfactual, and it does not exist — there is no
version of the last six months in which the work was not done.

There is an honest substitute, and it is stronger because it is a measurement:

- **Touch time before**, from walked instances at baseline, against **touch time now**, from
  `review_start`/`review_end` on the same process, with the paired quality metric.
- **Plus concurrency**, which the duration question misses entirely: how many instances one person
  can hold open at once, before and now.

Give the client both figures and the definitions. Never convert them into a peso amount unless the
client supplies the rate themselves, and then label it as theirs.

---

## 7. Annual — was this worth it

A document plus a session. It is the only report that may recommend **not renewing**, or renewing
smaller, and including that option in writing is the single most credible thing a consultant can do.

| Section | Content |
| --- | --- |
| The whole engagement | The first mapping's before, against now, on the same definitions |
| **The claim ledger** | **Every figure claimed during the year, and whether it held.** Did the first quarter's claim survive the fourth? Nothing else in this practice's output is as persuasive as a claim that survived twelve months of its own scrutiny — or as honest as one that did not |
| Cost against change | What the engagement cost, against what measurably changed. Not a return figure — the two numbers side by side, and the client does the division |
| **What to stop doing** | Routines nobody reads, content pillars that never landed, processes that were automated and should not have been. A recommendation to remove something is evidence that the rest was recommended on merit |
| Version provenance | Which plugin version produced which work, so the rules the work was produced under are recoverable |
| The renewal recommendation | Including the smaller option and the none option, with the reasoning for each |

---

## 8. The mapping-completion report is not a performance report

It is the **record of the before**, and its job is to freeze the starting point so everything after
is measurable. It contains no achievement, because nothing has happened yet.

| Section | Content |
| --- | --- |
| Every measure, frozen | Its definition verbatim, its source, its measurement date, and who measured it |
| Documented versus client-reported | Marked per figure. Self-reported and logged time diverge substantially, and recalled durations for recurring tasks skew **high** |
| What could not be measured | And why, and what access would be needed |
| The maturity layer | Written procedures that do not exist, single points of failure, tribal-knowledge count. **"Does not exist" is a measurement**, and it is usually the strongest argument for the work |
| The presence capture | Its date and its instrument, if social is in scope |
| **The scope statement** | What a later report **will and will not** be able to claim, stated now rather than when a client asks for a number that does not exist |

### Get the client to sign the before

Not as approval of Xenth AI's work — as **agreement on the starting numbers.**

Without that signature the before gets relitigated at exactly the moment the after looks good, and
the practice ends up arguing about a figure it recorded honestly a year earlier. With it, every later
report rests on a number the client already agreed to.

Record the signature as a journal `approval` row naming the person and the date.

---

## 9. The automation handover report is different in kind

It is not a performance report. It is **acceptance and liability**, and it is written the day an
automation goes live, not at the next cadence.

Its content is defined in `capabilities/automate/doctrine/HANDOVER.md`, and the short version is
that it must answer, in the client's own terms: what it does, **what happens when it is wrong**, who
gets escalated to, what it deliberately does not do, who pays for the platform, and **how to turn it
off without calling Xenth AI.**

A client who cannot switch it off alone does not own it.

---

## 10. Rules that apply to every report at every cadence

- **Every figure carries five things**: a named metric, a definition fixed in writing, its source,
  its measurement date, and who measured it. A figure missing any of them does not go in.
- **Never "certified" or "verified".** No accreditation exists for any of this work — see
  `capabilities/company/doctrine/STANDARDS.md`. "Measured and evidenced, self-reported" is the
  accurate phrase.
- **Never a counterfactual.** Not hours saved, not revenue caused, not "would have been".
- **Never an unpaired throughput figure.** Every output count travels with a quality metric measured
  on the same instances.
- **Never reach, impressions or revenue** without platform-side access. They are unavailable, not
  estimable — see `capabilities/social/doctrine/PRESENCE.md`.
- **Never a client's content in the journal or the report body.** The journal records references;
  the report cites them. Client material stays in the client's own store.
- **Break the series and restate it** when a definition or an instrument changes. A spliced series is
  worse than a gap, because a gap is visible.
- **When a figure is disputed, the report loses.** Record the dispute, name what would settle it, and
  do not defend the number past the evidence.

## 11. Cross-references

| File | Read it when |
| --- | --- |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | Before any before-and-after figure — what may be measured and what may be claimed from it |
| `capabilities/social/doctrine/PRESENCE.md` | A social figure or a competitor comparison is going into a report |
| `capabilities/company/doctrine/STANDARDS.md` | A standard, framework or credential is about to be named |
| `capabilities/process/doctrine/PROCESS.md` | A process measure or an automation score is being reported |
