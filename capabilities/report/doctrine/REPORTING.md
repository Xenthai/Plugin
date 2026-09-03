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

## 2c. How a routine must be executed, and what it costs when it is not

A cadence is also a technical design, and the wrong design costs the client money on every run.
Five facts, each with a consequence:

**1. A recurring routine is a fresh session, never a turn in a standing one.** A loop fires as a
full turn inside the session it was created in, **carrying that whole conversation with it every
time.** A daily or weekly cadence is always past the cache window, so every run pays for the entire
accumulated history. Start each routine in its own session.

**2. Chained work belongs in separate sessions.** Published measurement: three tasks in one session
sent **1.9× the tokens** of the same three with a clear between them, because turn 40 also re-reads
the 39 turns before it. A routine that maps, then measures, then reports is three sessions or three
subagents — not three phases of one context.

**3. Session length is the top cost driver. Model size is only third.** The published ranking is:
long sessions, then too much in the context, then an oversized model or effort level, then a broken
prompt cache. **This inverts the usual instinct**, which reaches for a cheaper model first and
leaves the session running all day.

**4. Model and effort persist between sessions, and a routine inherits them.** A high-effort choice
made yesterday by a person silently multiplies today's unattended run. Pin the model in the
routine's own definition; do not let it inherit whatever the last human session left behind.

**5. The dangerous output size is the middle.** Output past roughly 30,000 characters is written to
a file with only a preview kept — that case is safe. **The expensive case is everything under it**:
a runner that prints four hundred passing lines stays under the threshold and those lines are then
re-sent on every remaining turn. This plugin's own test suites and render engine emit exactly that
shape. Use quiet flags, or hand the noisy job to a subagent whose output is discarded.

And one for anything running headless on an API key rather than a subscription: **the prompt cache
expires in five minutes there, not an hour**, unless the long-cache flag is set. A scheduled
routine spaced further apart than that pays a full prefill every single run.

### The spend ceiling the platform does not give you

The only preventive cost control described in the platform's own guidance is a hard spend cap, and
two things about it matter here:

- **It is an enterprise-tier control**, so it may not exist on the plan a client bought.
- **A group cap is per member, not pooled.** A cap of X set on a group of ten authorises ten times
  X. Read that twice before quoting a client a ceiling.

And the guidance's own sequencing advice is to wait for **a month of real usage** before setting a
cap — which means the documented posture for month one of an engagement is *no ceiling, watch the
dashboard*. That is precisely the month in which a surprise bill happens.

**So the ceiling has to be ours.** Every routine run records its own turn and token counts in the
journal, and a run that exceeds its expected envelope is an `error` row and a line in the next
biweekly report — not a discovery made when the invoice arrives. A dashboard is retrospective by
construction; the journal is the only instrument in this plugin that can refuse.

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

## 10b. Attribution is contribution analysis, and never a counterfactual

Every cadence eventually reaches the same sentence: *did this work cause the change?* There are only
two honest ways to answer it and only one of them is available here.

The unavailable one is a counterfactual — what the month would have looked like without the work.
Establishing that needs the month run twice, once with and once without, which is what a randomised
trial buys and what a consulting engagement cannot. So every figure of the form "saved 40 hours",
"3× faster", "would have taken two weeks" is arithmetic performed on a month that did not happen.
It is not a weak estimate. It is a number about an imaginary object, and a director who asks one
follow-up question finds that out.

The available one is **contribution analysis** — Mayne's method, designed precisely for programmes
where a controlled comparison is impossible. Four steps, in order, and the report is not finished
until all four are written down:

1. **State the mechanism.** How, concretely, would this work have changed the outcome? *"Pieces are
   drafted from documents the company already had, so review starts from a draft instead of a blank
   page."* A mechanism is falsifiable. A benefit is not — "improved efficiency" cannot be wrong,
   which is exactly what makes it worthless as a claim.
2. **Name the alternative explanations, before the client does.** Seasonality. A person who joined
   or left. A price change. A campaign nobody logged. The client simply trying harder because
   someone was watching — the Hawthorne reading, and it is always available. Naming them is what
   makes the remaining claim credible: an analysis that lists no alternatives reads as advocacy, and
   a director in this market will read it that way whether or not the numbers are good.
3. **Claim a plausible, evidenced contribution — not a cause.** *"Consistent with a contribution to
   X, evidenced by the journal rows in the table above and by the client's own process measure."*
   That is the strongest honest sentence available, and its strength comes from the two things it
   declines to say.
4. **Say what would change your mind.** Name the observation that would falsify the claim. If no
   observation would, what has been written is a belief, and it should be labelled as one or cut.

### Why the client's memory cannot supply the "before"

The tempting shortcut is to ask. It does not work, and the failure is measured rather than
suspected: across a systematic review of 32 studies, 22% of people's estimates of their own
recurring tasks were high by more than 100%, and self-reported time diverges from logged time by a
median of 47% — reliably in the flattering direction. A baseline built from recall therefore inflates
every improvement computed against it, and the inflation is invisible because both numbers came from
the same place.

So when a "before" is needed and no measurement exists, ask for **three to five dated, concrete
instances** — this invoice, that ticket, this approval, with dates — never an average and never a
typical case. Specific episodes are recalled far better than rates, and the client can check them.

## 10c. Reading the figures without fooling yourself

The journal produces numbers that look more informative than they are. Five traps, each of which has
a specific wrong sentence attached to it:

- **Touch time is not cycle time.** The journal measures the minutes a person spent inside a review,
  not how long the work sat waiting. By Little's Law, `WIP = throughput × cycle time`, so a
  touch-time figure constrains nothing about throughput on its own. Report cycle time and throughput
  when they exist, and say plainly that they do not when they don't.
- **A flow-efficiency figure far outside 5–15% is a data defect, not an achievement.** That band is
  what knowledge work typically shows. Numbers implying 60% mean the events are wrong — most often
  `review_start` rows that were never closed, or work that happened with no row at all.
- **Unmatched review starts make touch time a floor.** The tool reports them separately for exactly
  that reason. The figure is "at least N minutes", never "N minutes".
- **An unnamed approval is not an approval.** If the tool reports any, the word *approval* does not
  appear in the prose about them. Name the defect and name the fix: whoever records the event passes
  `--actor person:<name>`.
- **The defects section belongs in the client's report**, not in a private note. Publishing clean
  numbers while privately knowing the evidence has holes is the single failure this instrument
  exists to prevent, and doing it once destroys the value of every clean report that follows.

## 10d. What a client can check for themselves, and what nobody can

In a regulated sector — a client under CNBV, COFEPRIS or a customer of theirs running an audit —
someone eventually asks whether the record behind a report could have been altered. The answer has
to be given before it is asked, and it has to be the true one.

Work the question properly, by asking what each party actually controls:

| Who | What they control | What a per-row hash chain would prove against them |
| --- | --- | --- |
| The client | Their own store. They can delete the journal outright | Nothing. They can delete the chain too |
| This practice | The local file, before it is uploaded | Nothing. Whoever computes a chain can recompute it |
| Anyone else | No write access at all | Nothing beyond what the store already gives |

A hash chain over the rows therefore proves nothing against anyone who matters. It would detect
reordering by a party with no write access, and that party does not exist. Building one would be
tamper-evidence theatre: a mechanism that looks like assurance, is understood by the client as
assurance, and delivers none. That is worse than having nothing, because it earns trust it cannot
support — the same failure as a benchmark with no denominator or an ISO number on a deliverable.

### What does work, and why

The property actually wanted is an anchor outside the practice's reach. There is one already, and it
costs nothing to use: **the report is written into the client's own store, whose revision history is
kept by the storage provider.** This practice can delete a file there; it cannot rewrite a past
revision or forge its timestamp.

So `bin/report.mjs` prints, in the report body, the SHA-256 of the exact bytes it read, with the file
size and row count, and the command to check it — for Windows and for Unix, because a command the
reader cannot run is decoration. From the moment the client holds that report, that month's journal
is pinned: any later edit to it produces a digest that disagrees with a dated document held by the
client, not by us.

### The limit, stated in the block itself

**The digest pins the file forward, not backward.** It proves nothing about the journal before the
first report was delivered, and it proves nothing about activity that never passed through the
plugin at all. The rendered block says both, in the client's language, next to the digest.

Say it out loud in the meeting too. A client who hears the limit from the practice, unprompted,
reads every other figure in the report differently — and that is the only durable version of the
trust a hash chain was reaching for.

## 11. Cross-references

| File | Read it when |
| --- | --- |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | Before any before-and-after figure — what may be measured and what may be claimed from it |
| `capabilities/social/doctrine/PRESENCE.md` | A social figure or a competitor comparison is going into a report |
| `capabilities/company/doctrine/STANDARDS.md` | A standard, framework or credential is about to be named |
| `capabilities/process/doctrine/PROCESS.md` | A process measure or an automation score is being reported |
