---
name: process-map
description: Run the phase 3 inventory session — the Diagnóstico — that lists every process a company actually runs, who owns each one and which systems it touches, into the company's PROCESSES.md. Use when a company has no PROCESSES.md yet, when the client asks what their processes even are, or when an inventory needs extending with processes nobody wrote down. One session, breadth before depth. Pain, account ownership, authorisation and the scored shortlist are phase 4 — use process-access, and only after this inventory exists.
---

# Phase 3 — Diagnóstico: the process inventory

**Read `capabilities/process/doctrine/PROCESS.md` first.** It carries the SIPOC boundary prompt, the
field list, and why this is a table and never a diagram. Do not re-derive any of that here.

Deliverable: `PROCESSES.md` in the company store, in es-MX, from
`scaffold/company/PROCESSES.md`. One session.

## Breadth before depth — the rule that decides the session

**A page that names every process beats a page that fully documents three and silently omits nine.**
An omitted process is invisible; a pending cell is a visible question. So:

| Session portion | What you are doing | Minimum per process |
| --- | --- | --- |
| First third | Name **every** process, primary and support | Name in the doers' words · owner **role** · trigger · systems with integration surface |
| Remaining two thirds | Depth on the ones the client already calls painful | Steps, decisions, exceptions, frequency and volume |
| Everything else | Left as `— pendiente —` | Never inferred to look complete |

Depth on a process nobody complains about is the cheapest thing to skip, because phase 4 will
re-order the whole list by pain anyway.

## Use Porter's split as a checklist, not a taxonomy

Split the inventory into **primary** and **support** activities. Its value is that it catches the
processes clients forget, and clients forget the same ones every time — the support side.

| Group | Prompt to walk through | Commonly forgotten |
| --- | --- | --- |
| **Primary** | Bringing supply in · operating/producing · getting the output out · marketing and selling · serving after the sale | Rarely forgotten; the client leads with these |
| **Support** | Procurement · technology and systems · people (hiring, payroll, onboarding) · administration (billing, collections, accounting, legal) | **Almost always forgotten**, and it is where the repetitive, automatable work lives |

Never make the client learn the vocabulary. Ask their questions in their words and file the answer
into the group yourself.

## Elicitation rules

**Interview the person who does the work.** Ask for them explicitly: *"¿quién abre el sistema y lo
hace?"* Management describes the process as designed; the doer describes it as run, exceptions
included. If a manager answers on the doer's behalf, write the answer down and mark the row's source
as management — a captured claim and a second-hand one must not read alike later.

**Ask for three to five dated, concrete instances. Never accept a habitual average.** Wrong question:
*"¿cuánto tiempo te toma normalmente?"* Right questions, in this order:

1. *"¿Cuándo fue la última vez que corrió este proceso?"*
2. *"¿Y la vez anterior?"* — repeat until three to five dated runs exist
3. *"¿Qué pasó en cada una de esas veces?"*

People overestimate the duration of their own recurring tasks: 22% of estimates in a 32-study review
were high by more than 100%, and self-reported time diverges from logged time by a median 47%. "Como
dos horas, más o menos" is not data, and a savings figure built on it is fabrication in the
flattering direction. If only an average is available, record it **as an estimate by that person**,
in that cell, in those words.

**Get exceptions with the negative question.** *"¿Cuáles son las excepciones?"* returns nothing;
people do not hold a list. *"¿Cuándo fue la última vez que esto salió mal, y qué hiciste?"* returns
the real ones. Then ask how often that happens — with dated instances, same rule.

**Test standardisation while both doers are reachable.** Ask two people who run the same process,
separately, for their step list. Different lists mean it is not standardised, and standardising is a
prior piece of work with its own price. Record the divergence in the row; do not average the two
lists into one that nobody runs.

## Writing the deliverable

Copy `scaffold/company/PROCESSES.md` into the company store as `PROCESSES.md` and fill it. Use
`Write` and `Edit` — never a shell redirect, which the company guard cannot see.

Keep every uncaptured cell as `— pendiente —`. That placeholder is the product: it is what stops an
inferred fact from reading identically to a captured one six months from now.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability process \
  --why "phase 3 inventory captured" --target "PROCESSES.md"
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_end --capability process \
  --why "phase 3 diagnostico complete" --target "PROCESSES.md"
```

Never put a process name or any client content in `--why` or `--detail`.

Close the session by telling the client two things: which processes are captured and which are
pending, and that phase 4 (`process-access`) is where pain, access and the automation shortlist come
from. Do not start phase 4 in the same session.

Append the conversation to `INTERVIEW.md`, marking who described each process. **Whoever does the
work and whoever runs the company describe the same process differently, and the difference is the
finding** — record both attributions rather than reconciling them into one account.

## STOP conditions

- **Only management is available and the doer is not.** Do not cancel and do not pretend. Capture
  everything management can give, then **mark the inventory provisional on its face** — in the
  document header, not only in conversation — and state the reason in it: management is routinely
  unaware of the real exceptions, so the exception and step columns are the ones most likely wrong.
  Name what a doer session would add and offer it as its own line item.
- **The client cannot name an owner role for a process.** Leave it pending. An invented owner is the
  first thing a director corrects, and it costs the whole document its credibility.
- **A "process" turns out to be one person's habit with no second practitioner.** Record it, and say
  plainly it is not a process yet. Automating it standardises one person's improvisation.
- **The client wants the inventory drawn as a diagram.** Offer the optional Descriptive BPMN picture
  **after** capture, for the report only. Never elicit into a drawing — the doctrine's §2 has the
  reasons if they push.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/SESSION.md` | Before any session that fills a document by asking a person |
| `capabilities/process/doctrine/PROCESS.md` | Before the session, always. Field list, SIPOC prompt, table-not-diagram reasoning, Mexican specifics |
| `scaffold/company/PROCESSES.md` | At the start of writing — it is the skeleton to copy |
| `skills/process-access/SKILL.md` | Only to tell the client what comes next. Never run it in this session |
