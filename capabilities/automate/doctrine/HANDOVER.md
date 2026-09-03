# Automation handover doctrine — acceptance, not performance

Read this before writing the report that closes an automation build, and before choosing the
platform it runs on.

A handover report is **not** a report of what was achieved. It is **acceptance and liability**, and
it is written the day the automation goes live — not at the next reporting cadence, because between
going live and the next report the client owns something they cannot describe.

**The test of a good handover: the client can switch the automation off, alone, without calling
Xenth AI.** A client who cannot switch it off does not own it, whatever the contract says.

---

## 1. The platform question, answered once

The plugin depends on nothing that charges. **A client may bring a platform that does** — and that
is a different thing, worth stating plainly so nobody confuses the two rules.

| Case | Rule |
| --- | --- |
| The automation runs through the assistant the client already has | Nothing new to license. Preferred by default, and it is the case where Xenth AI's own constraint and the client's interest coincide |
| The client asks for a workflow platform, self-hosted | Their infrastructure, their data, their cost. **Record who administers the host** — an automation on a server nobody owns is an orphan |
| The client asks for a workflow platform, vendor-hosted | Their subscription, their cost, **and their data leaves their own systems.** That is a fact for `SYSTEMS.md`, and it is a privacy-notice fact under the 2025 data-protection law when personal data passes through it |
| Xenth AI would have to buy a subscription for the automation to work | **Refuse the design.** Rebuild it on what the client already has, or say the automation is not available. A dependency the practice pays for is a dependency the client inherits at renewal |

**Never choose the platform before the process is mapped.** The suitability score in
`PROCESSES.md` decides whether a process should be automated at all; the platform is a later and
smaller decision. Choosing the platform first is how a company ends up with a workflow tool looking
for a workflow.

**Record the licence cost as an ongoing dependency with a renewal date.** The most common way an
automation dies is a card expiring on a subscription nobody remembered was load-bearing.

---

## 1b. Autonomy is earned in three steps, never granted at once

An automation does not go from nothing to unattended. It climbs, and **each rung has an exit
criterion that must be met before the next one** — otherwise "we'll watch it for a while" becomes
permanent and nobody ever decides.

| Rung | What it means | Exit criterion to climb |
| --- | --- | --- |
| **1 · Visible** | It runs and shows what it *would* do. It changes nothing. A person does the work as before and compares | Its output matched what the person did, on **at least ten real instances**, and every mismatch was explained rather than waved off |
| **2 · Assisted** | It does the work and a person reviews every output before it leaves | A stated period with **no wrong output reaching anyone outside the company**, and the reviewer can say what they are checking for without reading this document |
| **3 · Unattended** | It runs on its own; a person reviews a sample and every escalation | Only after rung 2. And it still has a named reviewer, a sample rate, and a cadence — see §4 |

**The order is the safeguard, not the ceremony.** At rung 1 a wrong output costs nothing and teaches
everything: the ten comparisons are where the process's real exceptions surface, and those
exceptions are the ones nobody mentioned when describing the process from memory.

### Agreement is not accuracy, and this caps the whole ladder

Rung 1's criterion is that the automation's output **matched what the person did**. That is the right
criterion and it has a hard ceiling that must be said out loud:

**Matching the person is not the same as being right.** If the person is wrong some fraction of the
time, agreement includes agreeing with their errors. A published customer case reports an agent
that "agrees with the compliance team about 98% of the time" — with no sample size, no class
balance, and no precision-or-recall split. On a review task where most items pass, an automation
that approves everything scores high.

Three consequences, and none of them is optional:

- **A graduated automation's ceiling is the current human standard.** The ladder cannot detect a
  systematically wrong policy, because the policy is the thing it is being compared against.
- **Say "agreement", never "accuracy".** In a report, in a handover document, and to the client. The
  two words describe different measurements and only one of them was taken.
- **Where a wrong answer has a cost outside the company** — a price, a legal claim, a regulated
  statement — **the comparison set has to be right answers, not the person's answers.** That means
  someone with authority adjudicates a sample, and that adjudication is a separate line item in the
  engagement, not a favour.

An automation matching a person perfectly on a process nobody ever audited has proven exactly one
thing: it learned the process. Whether the process is correct is a different question, and it is
usually the more valuable one — **which is why the mapping engagement, not the automation, is where
that answer comes from.**

### Three rules that keep the ladder honest

- **Record which rung each automation is on, and the date it climbed.** An automation with no rung
  is at rung 1 by default, whatever anyone intended.
- **A rung is not a promotion for good behaviour, it is a decision with evidence.** "It has been
  fine" is not an exit criterion. Ten matched instances is.
- **Rungs go down as well as up.** A wrong output that reaches a customer sends it back to rung 2,
  and that is a normal event to be recorded rather than argued about.

### Before building anything, three questions

If any of them cannot be answered, the automation is not ready to be built — and the missing answer
is itself the finding.

| Question | Why it gates the build |
| --- | --- |
| **Can the goal be stated in one sentence?** | A goal that needs a paragraph is two goals, and it will be automated badly as one |
| **Can you say what good looks like, and how anyone would know it got it right?** | This is the check in §3. **If nobody can state it, there is no check, and rung 3 is unreachable forever** |
| **Can each step be described without hand-waving?** | A hand-waved step is where a person is silently applying judgement — automate around it, not through it |

And one prior test, before those three: **is the task autonomous, recurring, and reviewable?** If it
needs live judgement, happens once, or cannot be reviewed clearly, it is not an automation candidate
at all — it is a task a person does with assistance, which is a different and often better answer.

**Reviewable is the criterion people skip.** A task whose output nobody can check is not automatable
at any rung, however repetitive it is.

## 2. What the report must answer, in the client's own words

Twelve items. Anything missing is a gap the client discovers at the worst moment.

| # | Item | Why it is in an acceptance document rather than a performance one |
| --- | --- | --- |
| 1 | **What it does**, in the process's own terms, with its process id from `PROCESSES.md` | The client must recognise their own process in the description, not ours |
| 2 | **What triggers it**, and what happens if the trigger fires twice | Duplicate runs are the most common defect and the easiest to design against |
| 3 | **What it does NOT do** — the exceptions it escalates rather than handles | The scope boundary is the single most useful line in the document |
| 4 | **What happens when it is wrong** | See §3. This is the section the whole report exists for |
| 5 | **Who gets escalated to**, by role, and how fast | A role, never a person — people leave, and an escalation path pointing at someone who left is worse than none |
| 6 | **The human decision points that remain, and why they remain** | A decision left to a person was left there on purpose. Say the purpose, or the next operator removes it |
| 7 | **The permission scope** — what it can touch, and what it deliberately cannot | This is what makes the report's authority sentence checkable later |
| 8 | **How to turn it off** — one instruction, no dependency on Xenth AI | See the test at the top |
| 9 | **The platform, its cost, who pays it, who administers it, and its renewal date** | §1 |
| 10 | **What it writes to the journal** | See §4. An automation that records nothing cannot be measured, defended, or improved |
| 11 | **The before measurement it will be judged against** | Taken from `BASELINE.md` **before** the automation ran. If it was not taken, say so — that is the finding, and it means this automation will never have a credible after |
| 12 | **What we could not automate and why** | The honest half. It is also the next engagement |

---

## 3. What happens when it is wrong

This section is not a risk disclaimer. It is the operating instruction for the day it matters.

For each failure mode: **what the automation does, what the client sees, and who acts.**

| Failure mode | Must be answered |
| --- | --- |
| Bad input | Does it stop, or does it proceed with a guess? **It must stop.** A guess propagates silently and is found weeks later |
| A system it depends on is down | Does it retry, queue, or fail loudly? How would anyone know? |
| It produces a wrong output that looks right | **The hardest case, and the one to design for first.** What check would catch it, and who runs that check? |
| It runs twice | Is the operation idempotent? If not, what is the cleanup? |
| Its credential expires or is revoked | Who is told, and how? |
| Volume rises past what it was built for | What is the ceiling, and what happens at the ceiling? |
| The process itself changes | What tells anyone the automation is now wrong? A process changed without the automation being told is the quiet failure that erodes trust in everything else |

**A wrong output that reaches a customer is the failure that matters.** Design the check for that
case before designing the happy path, and put the check in the report so the client knows it exists
and who owns it.

### Stopping instead of rerouting is a choice, and this is the reasoning

A useful distinction exists between two postures. A **workflow** is obedient: it follows the path
and breaks when the path fails. An **agent** reroutes: the usual item is out of stock, so it finds a
substitute, adjusts the quantity, checks the calendar, and rebuilds the order. The common test for
whether something is really an agent is exactly that — when the first path breaks, does it keep
following the script or find a better one?

**This doctrine deliberately chooses the workflow posture for a client's commercial output.** On bad
input it stops. It does not substitute, infer, or proceed with a guess.

The reasoning, stated so nobody later mistakes it for an oversight:

- **A reroute is a decision made without authority.** Substituting a product, adjusting a quantity or
  changing a price is a commercial decision, and the client's own authorisation chain — recorded in
  `PROCESSES.md` — says who may make it. An automation that reroutes has quietly appointed itself.
- **A break is visible; a clever recovery is not.** A stopped automation produces an escalation
  somebody sees within the hour. A rerouted one produces a plausible wrong result that surfaces
  weeks later, through a customer.
- **The exception is where the money is.** The exceptions a process throws are the finding the
  mapping engagement is paid to surface. An automation that silently absorbs them destroys the
  evidence.

Where rerouting genuinely is the right answer — internal research, drafting, exploration, anything
whose output a person reads before it matters — say so per automation in `AUTOMATIONS.md` and record
who decided. **The posture is chosen per automation, not once for the plugin.** What is never
acceptable is rerouting by accident because nobody decided.

---

## 4. Wire the measurement before going live, or the after does not exist

An automation that writes nothing to the journal cannot be measured after the fact, and the claim
about it later will be a story rather than a figure.

| Event | Written when | What it makes measurable |
| --- | --- | --- |
| `ai_action` | Every action the automation takes | Volume, and what it touched — as a reference, never content |
| `review_start` / `review_end` | A person opens and closes a review of its output | **Touch time**, which is the only honest substitute for the hours-saved question |
| `escalation` | It hands a case to a person | The pairing that makes a volume figure honest: the system ran **and** a person still had to decide |
| `error` | It fails | The quality metric that stops a throughput count from inflating |
| `blocked` | It refused to act | Evidence the permission scope is real and not decorative |

**The pairing is the point.** A count of runs with no escalation count and no error count is an
output metric dressed as an outcome, and a director will discount it correctly.

---

## 5. What the handover report may never claim

- **Hours saved.** A counterfactual. There is no version of the period in which the work was not
  done. The honest substitute is touch time before against touch time now, on the same process,
  with the paired quality metric — plus **concurrency**, which the duration question misses
  entirely: how many instances one person can hold open at once, before and now.
- **A peso amount**, unless the client supplies the rate and it is labelled as theirs.
- **"Fully automated"** where a person still decides anything. Say which decisions remain.
- **"Certified", "verified", "audited"** — no accreditation exists for any of this. See
  `capabilities/company/doctrine/STANDARDS.md`.
- **A reliability figure on day one.** It has no history. Say what will be measured and from when.

---

## 5b. The document is read by the operator, not by the person who signed it

Every rule above is about what the handover document must contain. This one is about whether the
person who needs it can read it, and it is the rule most likely to be skipped because the document
looks finished without it.

Two different people touch a handover:

- **The director signs it.** They read the scope, the liability and the cost. They read it once,
  calmly, at a desk, and they are used to reading contracts.
- **The operator uses it.** They read the failure section, on the floor, at the moment the thing
  has already gone wrong, under time pressure, possibly on a phone. They read it exactly when
  reading is hardest.

The plugin's other client-facing documents are written for the director — *usted*, conclusion
first, tables underneath. A handover document written that way puts the failure instructions in
the register of a contract, and a control the operator cannot execute is not a control. Worse, the
gap is invisible from the practice's side: the director signs, everyone agrees the document is
good, and the first time anyone finds out otherwise is the first failure.

There is a second reason not to trust the signature as evidence. Management is routinely unaware of
the real exceptions in a process — the same finding that forces the baseline measure to come from
the person who does the work, not from the person who describes it. A director's judgement that a
document is clear is a judgement about a document describing work they do not perform.

### The screen, and why there are two numbers

`node bin/legible.mjs <file>` reports Szigriszt-Pazos perspicuity on the INFLESZ scale — the
Spanish-validated adaptation of Flesch, not a translated English formula, because Spanish carries
about two syllables per word against English's one and a half, so an English index reports every
Spanish text as harder than it reads.

| Number | Value | What it is |
| --- | --- | --- |
| Floor | 55 | Below the scale's own *normal* band. A handover document under this is a defect, not a style preference |
| Target | 65 | The scale's *bastante fácil*. What the failure-recovery section specifically should clear, because that is the part read under pressure |

Two numbers rather than one because the document is not uniform. The scope and cost sections can sit
in the normal band; the section that says what to do when the automation is wrong should be easier
than the rest of the document, and it is usually written harder, because it is written last and by
whoever built the thing.

**Words per sentence is the term you control.** Syllables per word barely moves in Spanish — the
vocabulary of a business process is what it is. So a score below the floor is almost always a
sentence-length problem, and the fix is to cut sentences in half rather than to hunt for shorter
words.

### The score is a screen, not the test

A readability index is an output metric, and it fails in exactly the way this doctrine warns about
everywhere else: it measures a property of the text, not whether anybody can act on it. A page of
short sentences made entirely of jargon — *"Valide el payload. Escale al owner. Registre el
incidente en la bitácora."* — scores well and is unusable. The index catches long sentences. It
cannot catch a document that names things by their internal system names rather than by what the
operator calls them.

So the number is a gate on the way to the real test, which is this:

> Hand the document to the operator who will actually use it. Ask them to perform the failure step
> from it. Time it. **Say nothing** — no hints, no clarifying, no "well, what it means is". Note
> every place they stopped, re-read, or guessed.

That is a usability test with one participant, which sounds weak and is not: a document that one
real operator cannot follow unaided will not be followed by the next one either, and the places
they stopped are the exact edits to make. Record who performed it and what they got stuck on, in
`AUTOMATIONS.md` alongside the acceptance, because that record is the evidence that the handover
was a handover rather than a delivery.

If the operator cannot perform the failure step from the document, the automation is not accepted.
Not "accepted with a note" — the failure path *is* the deliverable, and an automation whose failure
path only its builder can execute has been handed to nobody.

## 6. Sign the acceptance

Record it as a journal `approval` row naming the person and the date, and state in the report what
the signature means: **the client agrees the automation does what the document says, and knows how
to turn it off.** Not that it will never fail.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event approval --actor "person:<name>" \
  --capability automate --why "automation handover accepted for process <id>" \
  --target "AUTOMATIONS.md"
```

Then add the automation to `ROUTINES.md` if it runs on a schedule, and add its check to the monthly
report's quality section. **An automation nobody reviews is an automation nobody will notice
breaking.**

## 7. Cross-references

| File | Read it when |
| --- | --- |
| `capabilities/process/doctrine/PROCESS.md` | Before choosing what to automate — the suitability score decides, not enthusiasm |
| `capabilities/report/doctrine/REPORTING.md` | The automation's results are going into a cadence report |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | The before measurement is being taken, or was not taken |
| `capabilities/company/doctrine/REGULATORS-MX.md` | The automation produces anything a customer reads, or handles personal data |
