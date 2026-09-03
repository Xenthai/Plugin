# Process doctrine

How a company's work is captured so it can later be automated with a person keeping every
decision. This is the consultancy's product: the *Diagnóstico* (phase 3) and the *Mapeo integral*
(phase 4). Read it before capturing a process, and again before scoring one for automation.

Client-facing output is es-MX. This file, and every field name in it, is English.

---

## 1. The boundary comes first, and SIPOC settles it

A process argument is almost never about the steps. It is about where the process starts and
stops — "well, it depends whether you count the moment the client emails or the moment we open the
ticket". Until that is settled, two people describe two different processes and both are right.

Use SIPOC's five boxes as a **data-collection prompt**, asked in this order:

| Box | The question that settles it |
| --- | --- |
| **S**upplier | Who or what hands you the thing that starts this? Another team, a client, a system, a clock? |
| **I**nput | What exactly arrives, and in what format? |
| **P**rocess | What happens between arrival and hand-off? Steps, not narrative. |
| **O**utput | What leaves, and in what format? |
| **C**ustomer | Who receives it, and what do they do with it next? |

**Never draw the SIPOC.** It is an elicitation frame, not a deliverable. Drawing it spends the most
expensive minutes of the session — the ones with the doer in the room — producing a picture that
nobody opens again. Ask the five questions, write the answers into the row, move on.

The supplier and customer boxes are what make automation scoping possible later: an automation
inherits its trigger from the supplier and its acceptance test from the customer. A process
captured without those two has no way to know when it ran correctly.

---

## 1b. Breadth before depth — the rule that sizes the engagement

**A page that names every process beats a page that fully documents three and silently omits nine.**
An omitted process is invisible; a pending cell is a visible question that the client can answer
later. This is the decision that turns a mapping engagement into one session or six, so it is made
before the first interview, not discovered during it.

Spend the first third of the available time naming **every** process — primary and support — with
only four fields each: the name in the doers' words, the owner's **role**, the trigger, and the
systems it touches. Spend the rest on depth for the ones the client already calls painful. Leave
everything else `— pendiente —` rather than inferred, because a scoring pass re-orders the whole
list by pain anyway and depth spent on a process nobody complains about is the cheapest thing to
have skipped.

The failure this prevents is specific: a client reads a document listing three fully-detailed
processes, concludes their company has three processes, and the automation is scoped to a fraction
of the work.

## 2. One structured table per process. Never a diagram

This is a hard rule, and it is the one most often argued with. The reasons:

**Value stream mapping does not transfer.** VSM was built for physical production flow — takt time,
work in process between stations, kanban pull, inventory buffers. Back-office work has no station
and no physical inventory; its "WIP" is an email sitting in somebody's inbox and its "takt" is
whenever the person gets to it. Forcing the analogy produces metrics nobody can measure and a
diagram nobody can act on. Cycle time, touch time and throughput are the flow numbers that *do*
apply here, and they are captured as fields — not drawn.

**Full BPMN is overkill.** Only its **Descriptive** subclass has standing: roughly ten elements a
non-specialist can read. Even that is **optional, drawn AFTER capture, for the client deliverable
only** — a picture in the report that a director can follow in ten seconds. It is never the
elicitation format, because drawing symbols during a conversation costs time and gains no accuracy
over a table: the same facts, slower, in a form that cannot be diffed.

**A table makes an unanswered question visible.** An empty cell is a hole. A diagram hides the same
hole inside a box that looks finished — the reader assumes the box was captured because it was
drawn. Six months later nobody can tell which shapes were told to us and which were inferred.

So: **one structured table per process — every field its own column, split into thematic blocks so
that no single block becomes too wide to read — with `— pendiente —` in anything not captured.** A
twenty-column table is as unreadable as a diagram is unauditable; the blocks are how both are
avoided. `scaffold/company/PROCESSES.md` is the shape.

---

## 3. Capture fields

Every process row carries all of these. A missing field is written as pending, never inferred.

| Field | What it holds | Why it is separate |
| --- | --- | --- |
| Name | What the doers call it, in their words | Renaming it to something tidier breaks every later conversation |
| Owner **role** | The role accountable, never a person's name | People leave; the row must survive them, and a name makes the row PII |
| Trigger | What makes a run start — event, clock, request | An automation's entry point is exactly this |
| Supplier + input, with **format** | Structured (form, table, database row) or unstructured (email prose, WhatsApp voice note, photo of a receipt) | Format decides feasibility more than any other single field |
| Output + customer | What leaves and who consumes it | The acceptance test comes from here |
| Frequency + volume | Runs per day/week/month and how many items per run | Drives value; see §6 on where these numbers may come from |
| Steps, numbered, as **verb phrases** | "Download the statement", not "statement download" | A verb phrase forces an actor and an object; a noun phrase hides both |
| Actor role per step | Who performs each numbered step | Where the hand-offs are is where the waiting is |
| Systems touched, with **integration surface** | API · export/import file · screen-only | This is a pricing field, not a design field — see below |
| Decision points, with **criteria** | The branch, and the rule the human actually applies | A decision with no written criterion cannot be delegated to anything |
| Exceptions seen **here**, with frequency and today's handling | The real ones, from this company | See §5: this is where the budget goes |
| Approval required, and by whom | Role, and whether it gates or follows the action | Distinguishes a checkpoint from a notification |
| Manual · digital · hybrid | How the run happens today | Hybrid is the common answer and the one that hides re-typing between systems |

**Integration surface is a price, not a detail.** An API means a supported contract. An export means
a file and a schedule, and something breaks silently when a column moves. **Screen-only means a UI
robot**: the most brittle option, the one that fails on a layout change nobody announced, and the
one with a permanent maintenance line. Recording "screen-only" changes the quote. Recording
"system: SAP B1" without the surface does not.

---

## 4. Governance fields are columns, not an appendix

These are the differentiator of the product. A competitor can list a client's processes. Almost
nobody hands the client the boundary the automation will operate inside, written down before the
automation exists. Governance captured after the build is a justification; captured here, it is a
specification.

| Governance field | What must be in the cell |
| --- | --- |
| **Approval requirement** | The role that approves **and the basis** — regulation, internal policy, or custom. "Custom" is a legitimate answer and a valuable one: it is the approval that can be redesigned |
| **Permission scope** | Per system, the explicit **read / write / execute** boundary. Not "access to CONTPAQi" — "read invoices, no write, no cancel" |
| **Audit trail** | Two parts: what is logged **today**, and what **must be** logged. The gap between them is a deliverable |
| **Prohibited actions** | An explicit list of what the AI may **never** do unattended. Written as actions, not principles: "never cancel a CFDI", "never send to an address not already in the client record", "never change a bank account number" |
| **Escalation path** | Who is woken, through which channel, and **the human response time** that path actually delivers. An escalation path with no response time is a promise with no number |
| **Reversibility** | Can the action be undone, and how long is the window? An irreversible action with a short window is where the guard belongs; everything else can be journaled and announced |
| **Regulatory tag** | Which regulator this process touches: SAT, PROFECO, COFEPRIS, CNBV/CONDUSEF, or none |

**Prohibited actions are the cell clients answer best.** People are vague about what a system should
do and precise about what it must never do. Ask the negative question first and the permission scope
usually falls out of the answer.

---

## 5. Automation suitability scoring

Score 1 to 5 where **5 favours automation**. Two groups, and the report must keep them apart.

### Researched criteria — Wanner et al., ICIS 2019

Five criteria for process selection, from published research on RPA process selection:

| Criterion | 5 (favours automation) | 1 (resists it) |
| --- | --- | --- |
| **Execution time** | Long manual run per item | Seconds; the run is not the cost |
| **Stability** | Steps unchanged for a year or more | Changes monthly; the automation would be rework |
| **Complexity** | Few steps, one or two systems, few branches | Many systems, deep branching, judgement mid-flow |
| **Data type** | Structured input — form, table, database row | Unstructured — email prose, voice notes, photos |
| **Failure rate** | Runs deviate rarely today | Deviates often; see the exception warning below |

Report the mean of these five as the **research score**, and say it is a research-grounded score.

### Expert-judgement criteria — scored, and labelled as judgement

| Criterion | 5 | 1 |
| --- | --- | --- |
| **Error cost** | A wrong run is cheap and visible | A wrong run moves money, files with a regulator, or reaches a client |
| **Regulatory constraint** | No regulator involved | The action is regulated and the approval is legally required |

These two **did not appear as scored criteria in the literature relied on here**. They are our own
judgement, and the report says so in that many words. They are scored on the same scale and shown in
their **own two columns**.

**Never publish a single blended total.** Averaging seven numbers and presenting the result as
research-based launders judgement into evidence — exactly the fabrication this plugin exists to
avoid. The two judgement criteria act as a **cap**: a research score of 4.6 with error cost 1 is not
a candidate for unattended automation, it is a candidate for an assisted step with a human approval.

---

## 6. Anti-patterns, and the correction for each

**Interviewing the manager instead of the doer.** Management is routinely unaware of the real
exceptions — not from dishonesty, but because exceptions are handled below them and never escalate.
The manager describes the process as designed; the doer describes the process as run. Automate the
designed version and it breaks in week one. **Interview the person who does the work.** If only
management is available, the capture is provisional and says so on its face.

**Automating a process that is not standardised.** An unstandardised process breaks on the first
real variation, and the client experiences that as the automation failing. Test for it: ask **two
doers separately** for their step list. If the lists differ, it is not standardised — and
standardising it is a prior piece of work with its own price, not a detail inside the build.

**Budgeting exception handling at 20% when it is roughly 80%.** The happy path is the demo; the
exceptions are the build. This is **pricing information**, not engineering trivia — a quote built on
the happy path is a quote that loses money and a relationship. Every exception captured in the row
with its frequency is a line the quote can stand on. A process whose exceptions were never captured
cannot be quoted; it can only be guessed at.

**Guessing when the client cannot answer.** The four questions clients most often cannot answer:
does this system have an API; who holds the credentials; what is the real volume; what happens when
it fails today. An invented answer to any of them reads identically to a captured one six months
later. The correction is commercial, not technical: **quote a short paid discovery as its own line
item**, name what it will establish, and leave the cell pending until it does.

**Accepting a habitual average for frequency, volume or duration.** People overestimate the duration
of their own recurring tasks: a systematic review of 32 studies found 22% of estimates high by more
than 100%, and self-reported time diverges from logged time by a median 47%. **Ask for three to five
dated, concrete instances** — the last time it ran, and the time before that. "About two hours,
usually" is not data. A savings claim built on it is fabrication in the flattering direction.

---

## 7. Mexican specifics

**CFDI 4.0 has been mandatory since July 2023.** Any billing, payroll or expense process therefore
crosses SAT. Tag it, and treat CFDI cancellation as an irreversible action with a legal window —
never an unattended one.

**Expect SAP Business One, CONTPAQi, or Excel plus WhatsApp. Ask; never assume.** The stack decides
the integration surface, and WhatsApp in the flow means unstructured input arriving on a personal
device — which is both a data-type score of 1 and a permission-scope conversation.

**Only about 21% of companies have a board**, and decision-making concentrates in one person
(power distance 81/100). Governance is therefore often informal regardless of company size. This is
not a gap to be corrected in the report; it is the reality the escalation path and the approval
column must describe. Write down the one person who actually decides, by **role**, and get the
prohibited-actions list from them directly — no committee will produce it.

---

## 8. After a few periods, the journal beats the interview

§5 scores automation suitability, and two of its research-backed criteria — execution time and
failure rate — are normally filled with what somebody remembers. That is the weakest evidence in the
whole document: self-estimates of one's own recurring work run high by a median of 47%, always in
the flattering direction, and the estimate and the improvement computed against it come from the
same place, so the inflation is invisible.

Once an engagement has a few periods of journal, both of those criteria can be **measured instead**.
`bin/opportunities.mjs` reports what recurred and over how many distinct periods, with the rows
behind each pattern. Where a finding covers a process already scored in §5, replace the estimate with
the measured value and say in the cell that it came from the journal, naming the periods it covers.

That substitution is the single most valuable thing the journal buys. It turns two columns of a
scoring table from opinion into evidence, and it is the strongest available argument for an
engagement continuing — not because the numbers flatter anyone, but because they are checkable.

The judgement criteria stay untouched. Cost of error and regulatory constraint are invisible to a
journal, and §5 keeps them separate from the research criteria precisely so that a measurement
cannot quietly acquire their authority.

### Three properties this measurement has to keep

**The floor counts distinct periods, not occurrences.** Three edits to one file in one afternoon is
one event; three edits across three months is a pattern. An occurrence count lets a single busy
fortnight manufacture a finding, and a detector that fires on noise trains its reader to skip the
section.

**Nothing is scored or ranked on one axis.** A composite improvement score is indefensible with one
client and no control group, which is why `ROADMAP.md` rules one out. Ranking journal findings would
smuggle the same thing back in through a side door, so they come out ordered by how many periods
each spans — a count, not a judgement.

**A finding is a question, never a recommendation.** Recurrence is the only part the journal proves.
Whether the work is autonomous and whether it is reviewable it cannot see, and reviewable is the one
people skip: if nobody can say what good looks like, there is no check, and unattended operation is
unreachable however often the task repeats.

### What it is blind to, and why that is not a small caveat

The journal holds only what passed through the plugin. Every finding is therefore biased toward work
the practice already touches, and the process nobody has opened is invisible — frequently the one
worth the most.

So this never replaces the mapping session. It prioritises among what is already known, and the
client's own answer to *what hurts today* still outranks it. A list of recurring file paths presented
as a survey of the company is a category error, and the tool prints that warning with its own output
so the list cannot travel without it.

## Cross-references

| File | Read it when |
| --- | --- |
| `scaffold/company/PROCESSES.md` | Starting phase 3 — copy it into the company store as the inventory's skeleton |
| `skills/process-map/SKILL.md` | Running phase 3, the inventory session |
| `skills/process-access/SKILL.md` | Running phase 4, the pain, access and shortlist session |
