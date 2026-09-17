---
name: coverage
description: Audit how complete an engagement's documents are, turn every gap into a question already written out and addressed to a named role, and say whether the next phase can start. Use when asked what is missing, whether there is enough to continue, what information is still needed, to prepare the questions for an upcoming session, or at the close of any session that filled a document. Reports a verdict rather than a count. For where the engagement stands overall use resume; for whether this machine and its connectors work use doctor.
---

# Coverage — what is missing, who has it, and whether to proceed

`status.mjs` counts pending fields and names which skill owes each one. This turns that into three
things it cannot produce: **a question written out word for word**, **an agenda grouped by the person
who can answer it**, and **a verdict on whether the next phase may start.**

Run it at the close of any session that filled a document, before any phase change, and whenever
anyone asks what is missing.

## 1 · Bind, then read the state from the documents

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
node "${CLAUDE_PLUGIN_ROOT}/tools/coverage.mjs" --json
```

`coverage.mjs` extends what `status.mjs` computes: per document, which fields are pending, which of
them are **blocking**, and which role the plugin expects to hold each answer. `--help` lists the
options; trust it over this file.

**The documents are the state.** A previous session's summary is a claim about the state.

## 2 · Grade honestly, and grade down when unsure

A pending marker is not the only gap. A filled field can still be weak. Grade each captured fact:

| Level | What earns it |
| --- | --- |
| **Captured** | A document, a system record, or two people who agree |
| **Reported** | One person said it, uncontradicted |
| **Inferred** | Deduced from something adjacent, nobody said it |
| **Absent** | `— pendiente —` |

Two errors to avoid, and they run in the same direction. Grading something **captured** because one
person was confident — confidence is not corroboration. And grading something **reported** when
nobody actually said it in those words — that is inferred.

**When torn between two levels, take the lower.** An engagement that believes itself more complete
than it is fails later and more expensively than one that names its holes.

## 3 · Turn every gap into one of four actions

Never "investigate further". Every gap resolves to exactly one of these, and if it resolves to none
the field is badly specified and gets rewritten:

| Action | What it must contain |
| --- | --- |
| **Ask** | The question **written out, word for word**, ready to be read aloud in es-MX. Not "ask about costs" — *"¿cuánto le pagas por hora a quien arma las cotizaciones?"* |
| **Request** | The named file, folder or system. Not "the quotes" — *"la carpeta de cotizaciones de 2026, o veinte archivos representativos"* |
| **Derive** | Where to look and the arithmetic, routed to `company-evidence` |
| **Observe** | Who to sit with, doing what, for how long |

`SESSION.md` §1 governs who a question goes to. Use it: a question about how the work runs goes to
whoever runs it, and asking a director instead produces the designed answer rather than the real one.

## 4 · Group by person, not by document

Nobody wants the same question in three meetings. Reorder the whole set by who answers it:

```markdown
### Para <rol> · ~<minutos>
1. <pregunta literal>
2. <pregunta literal>
**Pedirle además:** <documentos o accesos>
```

Blocking questions first, then general to specific. **Roles, not names** — `03-procesos/INDICE.md` §2's rule
holds here: people leave, and a name makes the row personal data.

## 5 · Give the verdict, and never advance in silence

Three possible answers, and one of them has to be said out loud:

- **Ready.** Every blocking field for the phases behind is at Reported or better.
- **Proceed with reservations** — naming what stays weak and **what it costs concretely**. *"Sin el
  costo por hora, el tamaño del proceso queda ordinal y no monetario, así que la lista corta se
  ordena por dolor y viabilidad pero no por tamaño."*
- **Not ready** — naming the blocking fields and what closes each.

The client decides. What is not allowed is a phase starting while the gap goes unmentioned.

## 6 · Report it in three parts

1. **Where it stands** — per phase, and the verdict.
2. **The three gaps that block most**, and which role closes each.
3. **What is needed before the next session** — documents, accesses and people, as a list the
   operator can forward to the client unedited.

Then one next step, named as one thing with one owner. `resume`'s rule holds: a client handed three
options has been handed the decision they came to have made for them.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event health --capability company \
  --why "coverage audit, verdict <ready|reservations|not-ready>" --target "COVERAGE.md"
```

Never put a question's text, a field's content or any client detail in `--why` or `--detail`.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## 7 · When the client says there is nothing more to tell

It happens in every engagement and is usually wrong. Four checks before accepting it:

- Has anyone who **does** the work been asked, or only whoever runs the company?
- Can the size of the most painful process be stated at all?
- Do two people describe the same process the same way? If not it is not mapped — there are two
  processes, or one that is misunderstood.
- Has a single declared figure been tested against a document?

If one fails, say so and name the cheapest way to close it. It is often fifteen minutes with the
right person.

## 8 · When it is genuinely enough

Sufficiency is not exhaustiveness. Declare it — out loud, so the client hears it — when the last
stretch of interviewing changed no priority, new answers confirm what is documented, and the blocking
fields are covered. **Collecting past that point bills the client for no additional decision.**

## STOP conditions

- **No company is bound.** There is nothing to audit. Route to `setup` or name the folder to open.
- **A document is in the wrong language.** Say it before reporting anything else. It looks finished
  and it is a delivery defect.
- **A gap cannot be turned into one of the four actions.** The field is badly specified. Say so and
  rewrite it rather than filing an unanswerable question.
- **Everything is filled and nothing was ever contrasted against a document.** Report it as a
  reservation, not as ready. A store of confident single-source claims reads exactly like a
  corroborated one.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/SESSION.md` | §1 decides who each question goes to |
| `capabilities/company/doctrine/EVIDENCE.md` | When a gap resolves to Derive rather than Ask |
| `skills/resume/SKILL.md` | The overall position. This skill answers what is missing, that one answers where we are |
| `tools/coverage.mjs --help` | The options. Trust it over this file |
