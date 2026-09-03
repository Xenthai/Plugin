---
name: automate-handover
description: Write the acceptance document that closes an automation build — what it does, what it does when it is wrong, who gets escalated to, what it deliberately does not do, who pays for and administers the platform, what it records so it can be measured later, and how the client turns it off without calling anyone. Use the day an automation goes live, when a client asks what happens if an automation fails, before accepting an automation built on a platform the client pays for, or when AUTOMATIONS.md is absent or its fields are pending. This is acceptance and liability, not results — for a cadence report on how an automation performed use report, and to decide whether a process should be automated at all use process-access.
---

# Automation handover — the client has to be able to switch it off

One session, on the day the automation goes live. Deliverable: a filled block in `AUTOMATIONS.md`.

**Read `capabilities/automate/doctrine/HANDOVER.md` first.** It carries the twelve items the report
must answer, the failure modes to design against, and the platform rules.

Not a report of results. **Acceptance and liability.** Between going live and the next cadence
report, the client owns something they cannot describe unless this exists.

## Before anything: which rung, and can it be built at all

**Autonomy is earned in three rungs — visible, assisted, unattended — and each has an exit criterion
that must be met before the next.** The doctrine carries them. Record the rung and the date it
climbed in `AUTOMATIONS.md`; **an automation with no rung recorded is at rung 1**, whatever anyone
intended.

Rung 1 is where the value is on day one: it runs, shows what it *would* do, changes nothing, and a
person compares. Ten matched real instances is the exit criterion, and those ten comparisons are
where the process's real exceptions surface — the ones nobody mentioned when describing the process
from memory.

Then three questions that gate the build. If any cannot be answered, **the missing answer is the
finding** and the automation is not ready:

1. Can the goal be stated in **one sentence**? A goal needing a paragraph is two goals.
2. Can anyone say **what good looks like**, and how they would know it got it right? If nobody can
   state it, there is no check, and rung 3 is unreachable forever.
3. Can each step be described **without hand-waving**? A hand-waved step is a person silently
   applying judgement — automate around it, not through it.

And one prior test: **is the task autonomous, recurring and reviewable?** If it needs live
judgement, happens once, or cannot be reviewed clearly, it is not an automation candidate — it is a
task a person does with assistance, which is often the better answer. **Reviewable is the one people
skip.**

## Decide the failure posture, and write down who decided

On a failure, does it **stop** or **reroute**? For a client's commercial output the default is
**stop** — rerouting substitutes a product, adjusts a quantity or changes a price, and those are
commercial decisions whose authority `PROCESSES.md` assigns to a person.

Rerouting is right where a person reads the output before it matters. Record the posture per
automation with the name of whoever chose it. **What is never acceptable is rerouting by accident
because nobody decided.**

## The test

**Can the client switch it off, alone, without calling Xenth AI?**

If not, the handover is incomplete regardless of how well the automation works. A client who cannot
switch it off does not own it, whatever the contract says. Write the off instruction first and check
it with the person who would have to use it.

## Take the before measurement, or say you did not

This is the one thing that cannot be recovered later. Before the automation runs on real work:

- **Touch time** on the process, from walked instances, with its definition written down
- **Concurrency** — how many instances one person can hold open at once
- **The paired quality metric** — rework, rejection or error rate on the same instances

If it was not taken, **write that in the document.** It is the finding: this automation will never
have a credible after, and a later report will have to say so. Discovering that at the quarterly
report is much worse than recording it now.

## Platform: the rule that is easy to get backwards

The plugin depends on nothing that charges. **A client may bring a platform that does**, and that is
fine — their subscription, their cost, their data.

What is not fine: an automation that only works because **Xenth AI** pays for something. Rebuild it
on what the client already has, or say the automation is not available. A dependency the practice
pays for is one the client inherits at renewal without knowing it.

Record the licence cost with its **renewal date**. The most common way an automation dies is a card
expiring on a subscription nobody remembered was load-bearing.

And never choose the platform before the process is mapped — the suitability score in `PROCESSES.md`
decides whether to automate at all, and the platform is a later, smaller decision.

## Design the wrong-but-plausible output first

Every failure mode in the doctrine's table gets an answer, but one deserves the session's attention:
**an output that is wrong and looks right.**

Bad input is easy — it stops. A system being down is easy — it fails loudly. A wrong output that
looks correct reaches a customer, and it is found weeks later by the customer.

So: name the check that would catch it, name the **role** that runs it, and name how often. Put all
three in the document, and add that check to the monthly report's quality section. **An automation
nobody reviews is one nobody will notice breaking.**

## Wire the journal before going live

An automation that records nothing cannot be measured, defended or improved, and the claim about it
later will be a story rather than a figure. Confirm it writes `ai_action`, `review_start` /
`review_end`, `escalation`, `error` and `blocked` — the doctrine's table says what each one makes
measurable.

**The pairing is the point.** A count of runs with no escalation count and no error count is an
output metric dressed as an outcome, and a director will discount it correctly.

## Record the acceptance

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event approval --actor "person:<name>" \
  --capability automate --why "automation handover accepted for process <id>" \
  --target "AUTOMATIONS.md"
```

State in the document what the signature means: the client agrees the automation does what the
document says, and knows how to turn it off. **Not that it will never fail.**

Then add it to `ROUTINES.md` if it runs on a schedule, and append the conversation to
`INTERVIEW.md` — who accepted it and who was told how to switch it off.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/automate/doctrine/HANDOVER.md` | Before writing anything — the twelve items, the failure modes, the platform rules |
| `capabilities/company/doctrine/MATURITY.md` | A workflow is climbing from Level 2 to Level 3, which is what scheduling it unattended means |
| `capabilities/process/doctrine/PROCESS.md` | The suitability score is being questioned, or the process changed |
| `capabilities/report/doctrine/REPORTING.md` | The automation's results are going into a cadence report |
| `capabilities/company/doctrine/REGULATORS-MX.md` | It produces anything a customer reads, or handles personal data |

## STOP conditions

- **The before measurement was never taken.** Do not invent it and do not accept the client's recall
  as the before — recalled durations for recurring tasks skew high, so a recalled before makes the
  after look better than it is. Record the absence and say the after will not be claimable.
- **The client cannot state how to switch it off** after being told. The handover is not done. Fix
  the instruction, not the document.
- **The automation only works because Xenth AI pays for a platform.** Stop. Rebuild it on what the
  client has, or say it is not available.
- **A person still decides something and the document says "fully automated".** Correct the
  document. Overstating autonomy is how liability lands in the wrong place.
- **Nobody owns the check for a wrong-but-plausible output.** That is not an automation ready to
  hand over — it is one waiting to be found by a customer.
- **The client asks for a reliability figure on day one.** It has no history. Say what will be
  measured and from when, and put the first figure in the monthly report.
