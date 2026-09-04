---
name: process-access
description: Run the phase 4 session — the Mapeo integral — that ranks a company's process pain, records who owns each system and account and what access they can grant, establishes who authorises an automation and what it must never do, and produces a scored automation shortlist. Use when PROCESSES.md exists but its pain, access and authorisation sections are pending, or when the client asks what to automate first or what it would cost. One session. Requires the phase 3 inventory — if PROCESSES.md does not exist yet, use process-map instead.
---

# Phase 4 — Mapeo integral: pain, access, authority, shortlist

**Read `capabilities/process/doctrine/PROCESS.md` first**, then the company's existing
`PROCESSES.md`. This session extends that document; it never rewrites the inventory.

Four outputs, in this order. The order matters: the shortlist is worthless if the authority to act
on it was never established.

## 1. Rank the pain — and keep it apart from the score

Rank from dated instances, not from feeling: **how often it hurts × what it costs when it does.**

| Ask | Not |
| --- | --- |
| *"¿Cuándo fue la última vez que este proceso le costó algo? ¿Y la anterior?"* | *"¿Cuál le duele más?"* |
| *"¿Qué pasó — se retrasó un pago, se perdió un cliente, hubo que rehacerlo?"* | *"¿Es importante?"* |

**The most painful process is frequently the least automatable**, and this is the single most useful
thing you will say in the session. Pain concentrates where judgement, unstructured input and
exceptions concentrate — precisely what scores 1 on data type and complexity. A consultancy that
ranks by pain and quotes by pain sells the hardest build first and fails publicly. Publish both
orders side by side and explain the divergence; that explanation is the product.

## 2. Map access — records of who holds what, never the what

Per system named in the inventory:

| Field | The question |
| --- | --- |
| Account owner (**role**) | Who owns the account — not who uses it |
| Who can grant access | Often a different role, and often an external accountant or vendor |
| Licence or seat reality | Is there a spare seat, or does a new user cost money? This is a real blocker in a quote |
| Permission scope available | Can this system express **read-only**, or is it all-or-nothing? All-or-nothing changes the governance answer entirely |
| Service account possible | Or does automation have to run as a human's user? |
| MFA location | If the second factor lives on the owner's personal phone, no unattended automation can authenticate. Ask; it is common and it is decisive |
| Integration surface | API · export/import · screen-only. If unknown, see STOP conditions — never guess |

**Never ask for a credential, and never write one into the store.** Record the **role** that holds
it. A password in a client's markdown file is a liability created by us, and the journal records
references, never content — keep the document to the same standard.

## 3. Establish who authorises, and what is prohibited

Decision-making in Mexican companies concentrates in one person (power distance 81/100) and only
about 21% of companies have a board, so governance is usually informal regardless of size. Do not
look for a committee.

Establish, by **role**:

- Who says yes to an automation running unattended
- Whether that person is in this session — and if not, whether the answer you were given is theirs
  or a guess about theirs
- The **escalation path**: who is contacted when the automation stops, through which channel, and
  the **human response time that path actually delivers**. "El dueño, por WhatsApp" is a real answer;
  "inmediato" is not — ask what happened the last time something broke at 9pm
- The **prohibited actions list**: what the AI may never do unattended, written as actions and not
  principles. Ask the negative question first; clients are vague about what a system should do and
  precise about what it must never do. Get this list from the person who authorises, directly

Then ask the same person these three, in these words. They are the AI-specific data controls almost
no client has been asked about directly, and each is a yes/no with evidence behind it:

1. **¿Pueden mantener datos sensibles fuera del entrenamiento y del uso de un modelo, con certeza de
   que no se filtra ninguno?** No "¿tienen política?" — que lo demuestren sobre un conjunto de datos
   con nombre.
2. **¿Saben qué propiedad intelectual de terceros viene dentro de los modelos que usan, y que la
   suya no sale?** Las dos direcciones. La mayoría no ha pensado en ninguna.
3. **¿Alguien puede rastrear cómo un sistema de IA interactuó con sus datos internos?** Cuáles,
   cuándo, por cuenta de quién, y si se puede reconstruir después.

A "no" is a **scope finding**, not a reason to stop, and each answer changes what may be built —
`capabilities/company/doctrine/CONTROLS.md` **§4b** carries what each one makes true, and the
provenance of the three, which is a vendor-sponsored paper and is discounted accordingly.

Every governance cell in the doctrine's §4 gets filled here or marked pending: approval requirement
with its basis, permission scope, audit trail today versus required, prohibited actions, escalation
with response time, reversibility, regulatory tag.

**Regulatory tag now, not later.** Any billing, payroll or expense process crosses SAT — CFDI 4.0
has been mandatory since July 2023. CFDI cancellation is irreversible inside a legal window and
belongs on the prohibited list by default.

## 4. Score the shortlist

Score each candidate with the **five researched criteria** — execution time, stability, complexity,
data type, failure rate (Wanner et al., ICIS 2019) — on 1 to 5 where 5 favours automation. Report
their mean as the research score.

Score **error cost** and **regulatory constraint** on the same scale, in their own two columns,
labelled in the document as **expert judgement, not research**. They **cap** the candidate; they
never blend into the research score. A research score of 4.6 with error cost 1 is an assisted step
with a human approval, not an unattended automation.

**Never publish a single blended total.** Averaging seven numbers and presenting the result as
research-based launders judgement into evidence.

Then price honestly: **exception handling is roughly 80% of the real build effort and gets budgeted
as 20%.** The exception rows captured in phase 3 are what the quote stands on. A candidate whose
exceptions were never captured cannot be quoted — say so and offer the capture as its own line item.

## Writing the deliverable

Extend `PROCESSES.md` in the company store with `Edit` — never a shell redirect, which the company
guard cannot see. Leave every unanswered cell as `— pendiente —`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability process \
  --why "phase 4 access map and scored shortlist captured" --target "PROCESSES.md"
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_end --capability process \
  --why "phase 4 mapeo integral complete" --target "PROCESSES.md"
```

Record the authorisation separately when it is given, naming the person:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event approval --actor "person:<name>" \
  --capability process --why "authorised the automation shortlist" --target "PROCESSES.md"
```

Never put a process name, a system name tied to a client, or any credential in `--why` or `--detail`.

Append the conversation to `INTERVIEW.md`: who ranked the pain, who stated each authorisation, and
the date. Never the credential itself — record the role that holds it.

## Then close the mapping — two things, in this order

Phase 4 is the last mapping phase, so this session owes the client two closing acts. Neither is
optional, and the order matters.

### 1. The record of the before, signed

Produce the mapping-completion report from `BASELINE.md`, `PRESENCE.md` and `PROCESSES.md`. It
contains **no achievement**, because nothing has happened yet — every measure with its definition
verbatim, its source, its measurement date and who measured it; what is documented versus
client-reported; what could not be measured and why; and the scope statement saying what a later
report will and will not be able to claim.

Then **ask the client to sign it** — not as approval of Xenth AI's work, but as **agreement on the
starting numbers.** Without that signature the before gets relitigated at exactly the moment the
after looks good, and the practice ends up arguing about a figure it recorded honestly a year
earlier.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event approval --actor "person:<name>" \
  --capability baseline --why "starting numbers agreed at end of mapping" --target "BASELINE.md"
```

### 2. Propose the reporting routine

Create `ROUTINES.md` from the scaffold and propose the cadences. **Read
`capabilities/report/doctrine/REPORTING.md` first** — it says what each cadence may and may not
claim, and why the quarterly is the first that can report a result at all.

Propose, do not impose. A routine agreed here in writing **is** its approval, so it runs afterwards
with no further gate — which is exactly why the agreement has to be explicit and recorded with a
named person.

Two things to say while proposing, because they are what make the routine trusted:

- **Each cadence answers a question the others cannot.** Five reports saying the same thing at
  different intervals trains a client to stop reading all of them. If a cadence does not answer
  something distinct for this company, do not activate it.
- **Name what no report will ever contain** — hours saved, reach, revenue, a causal magnitude —
  now, while proposing, rather than when someone asks for a number that does not exist.

Fill `ROUTINES.md` §4: **a report with no named recipient does not get read, and "management" is not
a recipient.**

## STOP conditions

- **Sign-off authority is unknown.** Stop before the shortlist is presented as actionable. A ranked
  list nobody can approve is a document that ages into a grievance. Capture the pain and access map,
  mark the authority pending, and name what you need: the role that decides, and confirmation from
  them, not about them.
- **Whether a system has an API is unknown.** **Never guess, in either direction.** "It probably has
  an API" prices a build that cannot happen; "screen-only" prices a UI robot that was never needed.
  Propose a **short paid discovery as its own line item**, state exactly what it will establish, and
  leave the cell pending until it does. The same applies to the other three questions clients cannot
  answer: who holds the credentials, what the real volume is, what happens today when it fails.
- **A candidate's process is not standardised** — two doers gave different step lists in phase 3. It
  is not a shortlist candidate. Standardising it is prior work with its own price.
- **The client asks for a quote in this session.** The quote follows from this document; it is not
  this document. Give ranges tied to named unknowns, and never a single number over a pending cell.
- **A credential is offered to you.** Decline it, and record only the role that holds it.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/SCHEDULING.md` | A routine is about to be proposed or created — where it runs, and the stall that silences it |
| `capabilities/company/doctrine/SESSION.md` | Before any session that fills a document by asking a person |
| `capabilities/process/doctrine/PROCESS.md` | Before the session, always. §4 governance fields and §5 scoring provenance are the two you will use most |
| `capabilities/company/doctrine/MATURITY.md` | Closing the mapping — the six-month phase framework and what each phase owes |
| The company's `PROCESSES.md` | Before asking anything — phase 3 already captured the systems and exceptions this session builds on |
| `skills/process-map/SKILL.md` | Only if `PROCESSES.md` turns out to be missing. Then stop and run phase 3 in its own session |
