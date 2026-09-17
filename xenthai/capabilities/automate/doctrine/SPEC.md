# Spec — the buildable description, between the shortlist and the handover

Read before phase 5 of the operación track. `05-backlog.md` §2 decides **what** to automate.
`06-specs/REGISTRO.md` records **who answers for it** once it runs. Between the two there was nothing, and
this is that nothing: the description complete enough that somebody who was not in the room can
build it and know when they are finished.

## 1 · What a specification is for

Three readers, and it fails if it fails any of them.

| Reader | What they need from it |
| --- | --- |
| Whoever builds it | Every field, rule and branch, without asking a second round of questions |
| Whoever pays for it | A scope with an edge, so "done" is a fact rather than an opinion |
| Whoever operates it in six months | Why it does what it does, when the person who built it is gone |

The failure mode is not vagueness. It is **a specification that describes the happy path completely
and the other paths not at all**, which reads as finished and is roughly a fifth of the work.
`03-procesos/PXX-nombre.md` already carries the number that governs this: exception handling is roughly 80% of
the real build effort and gets budgeted as 20%.

## 2 · What must exist before writing one

A specification written on missing inputs produces a build that fails in production, and the failure
is attributed to the automation rather than to the gap.

| Required | Where it comes from | Without it |
| --- | --- | --- |
| The process, with its exceptions | `03-procesos/` §1–3, phase 3 | You are specifying the happy path only |
| Integration surface of every system touched | `02-inventario.md` §1 | The design may be impossible and nobody knows yet |
| Who authorises what, and above which threshold | `03-procesos/INDICE.md` §2–3, phase 4 | The automation will do something nobody agreed it could |
| The candidate's score and error cost | `05-backlog.md` §2 | You may be specifying an unattended run of something that must not be unattended |
| The client's explicit approval of this candidate | Recorded with their name and the date | You are building what was never chosen |
| A measured before | `08-linea-base.md` | Nothing later can be compared, and the comparison is the product |

A `— pendiente —` in any of the first four is a **blocking** gap. Write the question, route it, and
do not fill it with a plausible assumption: an assumption in a specification is indistinguishable
from a captured fact by the time it reaches a builder.

## 3 · The autonomy ceiling is set here, not later

`06-specs/REGISTRO.md` §1b defines the rungs and the evidence each promotion needs. The spec's job is to
name **which rung this is built for** and to design for that rung rather than for the one the client
would prefer.

Two facts from phase 4 set the ceiling, and neither is negotiable in this phase:

- **Error cost.** `05-backlog.md` §2 scores 1 where a wrong run moves money, files with a regulator,
  or reaches a client. A candidate scoring 1 or 2 on error cost is specified with a human approval
  in the path, whatever its research score. A high research score with a low error-cost score is an
  assisted step, not an unattended automation.
- **The three data controls.** `CONTROLS.md` §4b: where a control cannot be satisfied, no process
  touching personal or client data goes past rung 1. That is a prohibited action, not a risk the
  client may accept on their own behalf.

**Everything that leaves toward a customer is drafted automatically and sent by a person**, for the
first period of live running at minimum. Removing that approval buys a little of someone's
attention back and risks one wrong message reaching one customer, and only the second cost lands on
the client's reputation rather than on the consultancy's. Do not put a figure on either side of
that trade: state the risk, leave the arithmetic unwritten.

## 4 · The parts, and why each one is there

### Acceptance criteria, written first

Write them before the flow, and write them so a person can check each one by looking. *"When an
enquiry arrives through the form, within two minutes a row exists in the register with its six
fields filled and the owner has been notified."* If a criterion cannot be verified by observation,
it is an intention.

They double as the phase-5 exit condition: the specification is finished when its criteria are
written and agreed, not when its diagram is pretty.

### Trigger

Event or schedule. If schedule, state the interval **and its monthly consumption of the platform's
billing unit** — `PLATFORMS.md` §2 explains why that is a design input. State also what happens when
the trigger fires twice for the same thing, which `06-specs/REGISTRO.md` already asks and which is answered
here rather than there.

### Data

The part most often left thin, and the part that decides whether the build works.

- **Source**: system, exact field names, formats, which are optional.
- **Destination**: system, exact field names, and **what happens when the record already exists** —
  update, skip, duplicate, or raise. There is no default; choose and say so.
- **Transformations**: the business rules from the captured process, including the unwritten ones
  phase 2 surfaced. Every rule cites where it came from.
- **The unique identifier**, which is what makes a second run harmless. `00-PERFIL.md` §3 names the
  company's natural key. An automation with no identifier duplicates, and duplication in a
  customer-facing system is discovered by the customer.

### Error branches

One row per failure mode. `06-specs/REGISTRO.md`'s seven are the floor: bad input, system down, wrong
output that looks right, ran twice, expired credential, volume up, the process changed and nobody
said. For each: what the automation does, what a person sees, who acts.

**Every branch terminates in a notification a named role receives.** A workflow that fails silently
is worse than no workflow, because the work stops and everyone believes it is happening.

### Human in the path

What requires approval, which role gives it, and **the evidence that would allow removing it** — a
count of clean runs, a period without a wrong outward message. Written now, it becomes a promotion
criterion later instead of an argument.

### Test plan

Minimum five cases, and at least three of them failures: normal, missing field, duplicate, upstream
system unavailable, and a value that breaks the format — an accent, a comma inside a field, an
empty string where a number belongs.

A test plan of only happy paths is how a build passes and then fails in week two.

### Credentials

Which service, which role custodies it, what scope it needs. **Never a value, never a fragment.**
Prefer read-only where the flow allows it, and prefer a service account over a person's login —
`03-procesos/INDICE.md` §2 already records where a second factor lives, and a second factor on somebody's
personal phone means no automation authenticates without that person.

### Rollout and operation

Shadow mode where the flow runs and writes nothing, then a pilot with one user, then live, with a
named validator at each cut. Plus: who owns the workflow, how anyone would notice it stopped, its
monthly running cost, and **the manual procedure to fall back to**. That last one is what makes it
switch-off-able, which is `06-specs/REGISTRO.md`'s whole test of a good handover.

## 5 · Platform independence

Sections above name no platform. `PLATFORMS.md` governs the choice, it happens at the end, and it is
recorded as one closing section: which platform, why that one, what it bills, who administers it.

The reason is practical rather than architectural. A specification written against one canvas cannot
be re-quoted against another without being rewritten, and re-quoting is exactly what happens when the
first platform turns out to bill per operation on a process that runs four hundred times a month.

## 6 · What a specification must never contain

- **A peso figure the client did not supply.** `HANDOVER.md` §5 governs. Rate comes from them and is
  labelled as theirs.
- **Hours saved, or any counterfactual.** Not here, not in the report, not in the quote.
- **A credential, or part of one.**
- **A field name nobody verified.** Guessing a schema produces a build that fails on first contact
  with the real system; `zapier-mcp-ops` carries the same rule for live operation.
- **An assumption presented as a captured rule.** `— pendiente —` is available and is the product.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/automate/doctrine/HANDOVER.md` | Before and after. It owns platform ownership, the rungs, and what may never be claimed |
| `capabilities/automate/doctrine/PLATFORMS.md` | At the end, to name the platform — and early, for the messaging-channel modality |
| `capabilities/process/doctrine/PROCESS.md` | §5 for the score and the exception-effort number the scope stands on |
| `capabilities/company/doctrine/CONTROLS.md` | §4b, before specifying anything that touches personal or client data |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | The before this automation will be compared against |
| `scaffold/company/mapeo-empresa/06-specs/AXX-nombre.md` | The skeleton to copy, one per specified automation |
