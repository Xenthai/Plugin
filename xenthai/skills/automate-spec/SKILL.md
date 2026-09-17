---
name: automate-spec
description: Run operación phase 5 — write the buildable specification for one approved automation, platform-independent, with acceptance criteria, data mapping, error branches, the human approval in the path, a test plan and rollout. Use when a candidate from the scored shortlist has been approved and somebody has to build it, when asked how a specific automation would actually work, when a build needs scoping or quoting, or when deciding which automation platform to use. Requires the shortlist and the access map from phase 4. For acceptance and liability once it runs, use automate-handover.
---

# Operación phase 5 — the specification

**Read `capabilities/automate/doctrine/SPEC.md` first**, and `PLATFORMS.md` before naming any
platform. They carry the required inputs, the autonomy ceiling, what each part is for, and the
prohibitions. Do not re-derive them here.

Deliverable: one `mapeo-empresa/06-specs/AXX-nombre.md` per approved automation, in es-MX, from
`scaffold/company/mapeo-empresa/06-specs/AXX-nombre.md`. One session per specification.

## 1 · Bind, then verify the inputs before writing a line

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
node "${CLAUDE_PLUGIN_ROOT}/tools/coverage.mjs" --pending
```

Name the company aloud. Then check the six required inputs from `SPEC.md` §2. **A `— pendiente —` in
the process, the integration surface, the authorisation rules or the score is blocking.** Write the
question, route it to `coverage`, and stop. An assumption written into a specification is
indistinguishable from a captured fact by the time a builder reads it.

**Specify only a candidate the client approved by name and on a date.** Specifying an unapproved one
produces work nobody chose.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability automate \
  --why "operacion phase 5 spec — one approved candidate" --target "06-specs/<AXX>-<nombre>.md"
```

## 2 · Set the ceiling before designing anything

Read the candidate's **error cost** from `05-backlog.md` §2 and the **three data controls** from
phase 4. They cap the autonomy rung, and the cap is not a preference:

- Error cost 1 or 2 → a human approval stays in the path, whatever the research score says.
- A data control that cannot be satisfied → nothing touching personal or client data goes past rung
  1. `CONTROLS.md` §4b calls that a prohibited action, not a risk the client may accept.

Write the target rung at the top of the specification. Designing first and discovering the ceiling
afterwards produces a design that has to be thrown away.

## 3 · Write the acceptance criteria first

Before the flow, before the data, before anything. Each one verifiable by looking:

> *"Cuando entra una solicitud por el formulario, en menos de dos minutos existe un renglón en el
> registro con sus seis campos llenos y el responsable recibió el aviso."*

A criterion nobody can check by observation is an intention. These are also the phase's exit
condition: the specification is done when they are written and agreed.

## 4 · Fill the rest, platform-independent

Trigger · data · error branches · human in the path · test plan · credentials · rollout and
operation. `SPEC.md` §4 says what each must contain. Three that get written thin and should not:

**Data.** Exact field names on both sides, and **what happens when the record already exists** —
update, skip, duplicate or raise. There is no default. Plus the unique identifier that makes a second
run harmless; `00-PERFIL.md` §3 names the company's natural key.

**Error branches.** `06-specs/REGISTRO.md`'s seven failure modes are the floor, and **every branch ends in
a notification a named role receives.** A workflow that fails silently is worse than none, because
the work stops while everyone believes it is running.

**Test plan.** Five cases minimum, three of them failures. A plan of only happy paths is how a build
passes and then fails in week two.

Name no platform in any of these sections.

## 5 · Choose the platform last

Now, and only now, read `PLATFORMS.md` and close with one section: which platform, why that one,
what it bills, who administers it, and the expected monthly consumption of its billing unit.

Two things decide it more than the family does — **how it bills and who administers it.** If the
company already runs a platform somebody maintains, that is the platform; migrating a working setup
to a technically better tool nobody in the building understands is a downgrade.

**Verify prices and limits from the vendor's own page at the moment of quoting** and record them in
`02-inventario.md` with the date consulted. Never from memory.

## 6 · Close

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability automate \
  --why "operacion phase 5 spec written, rung <n>, N acceptance criteria" --target "06-specs/<AXX>-<nombre>.md"
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_end --capability automate \
  --why "operacion phase 5 complete for one candidate" --target "06-specs/<AXX>-<nombre>.md"
```

Never put the automation's name, a system name tied to the client, a field name or a credential in
`--why` or `--detail`.

Tell the client two things: that this specification is the scope — anything outside it is a change —
and that `automate-handover` is where acceptance and liability are settled once it runs.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## STOP conditions

- **No company is bound**, or no `03-procesos/` with a scored shortlist. Route to `process`.
- **The candidate was not approved by a named person on a date.** Get the approval and journal it
  with `--actor`. Do not specify on the strength of enthusiasm in a meeting.
- **A system in the flow has integration surface `— pendiente —`.** It cannot be specified and it
  cannot be quoted. `02-inventario.md` already says a pending surface is the difference between a six-week
  project and one that cannot be done. Quote the verification separately.
- **A system is screen-only.** Do not force it. In order of preference: a scheduled export, a
  structured mail bridge, manual entry into something that does integrate, or redesign the process to
  not depend on it. Record which was chosen and why.
- **The client asks to automate a messaging channel through an unofficial route.** State the risk
  once, record their decision as theirs, and **still do not specify it.** `PLATFORMS.md` §3 carries
  why: the number is printed on their vehicles and losing it costs more than the automation saves.
- **The client asks what it will save in pesos or in hours.** Not here and not anywhere.
  `HANDOVER.md` §5 governs. Give the before from `08-linea-base.md` and let them do the division.
- **The exceptions were never captured.** The candidate cannot be quoted. `PROCESS.md` §5 carries the
  number: exception handling is roughly 80% of the build and gets budgeted as 20%.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/automate/doctrine/SPEC.md` | Before writing, always |
| `capabilities/automate/doctrine/PLATFORMS.md` | At §5 for the platform, and early for messaging-channel modality |
| `capabilities/automate/doctrine/HANDOVER.md` | §1 for ownership, §5 for what may never be claimed |
| `capabilities/company/doctrine/CONTROLS.md` | §4b, before specifying anything touching personal or client data |
| `scaffold/company/mapeo-empresa/06-specs/AXX-nombre.md` | The skeleton to copy, one per automation |
| `skills/automate-handover/SKILL.md` | Only to say what comes next. Never run it in this session |
