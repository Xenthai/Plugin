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
