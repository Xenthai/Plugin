---
name: hub-intake
description: Gathers the content of one or several internal hubs of a company. Use when a questionnaire has to be prepared for an area ("las preguntas para el hub de X", "un documento para que el equipo llene", "levantar información de un área", interviews to document a team), or when someone hands over filled answers, interview minutes or manuals to turn into a hub. Run after hub has decided which hubs to make; when the content is ready, hub-build builds it. For the engineering hub's diagrams use hub-atlas; for the process inventory use process-map.
---

# Hub intake

Between deciding which hubs to make (`hub`) and building them (`hub-build`) is the work of getting
the knowledge out of people. Two modes. Read `capabilities/hub/doctrine/INTAKE.md` before either — it
carries how questions are adapted, the rules for whoever fills them, what is never written, and
what "ready to build" means.

The binding is `hub`'s Step 1. Files live in the store under `hubs/<slug>/`.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## Mode 1 — A questionnaire to fill

**Input:** the hubs to gather, who coordinates, the company and its sector. If `hubs/MAPA.md`
exists, its proposed pages are the starting point.

1. For each hub, take its block from `capabilities/hub/templates/PREGUNTAS.md` and adapt it per
   `INTAKE.md` §1: the company's own terms, the sector pack's mandatory questions, nothing already
   answered by the store, an existing hub or the code.
2. Assemble the document with the structure of `capabilities/hub/templates/CUESTIONARIO.md`:
   - **Para qué sirve**, with a tracking table: Hub · Para quién · Qué resuelve · Responsable ·
     Fecha objetivo · Estado (Sin empezar / En proceso / En revisión / Listo). The table's order is the build order.
   - **Cómo llenarlo**: answer rules and the list of what is never written.
   - **One block per hub**: the general-data table (empty Respuesta column) and pages with numbered questions.
   - **Entrega y siguientes pasos**: the ready-to-build checklist and the build steps.
3. Write it to `hubs/CUESTIONARIO.md` (one hub: `hubs/<slug>/CUESTIONARIO.md`), es-MX. For people to
   fill and comment on, derive an editable Doc from it; the markdown stays the source, and filled
   answers come back into a new markdown revision so the lineage is visible.
4. On delivery: it must be shared with the coordinator, and leave exactly one confirmation question
   (hub order or owner).

## Mode 2 — From answers to a hub

**Input:** the filled questionnaire, interview minutes, manuals, links.

1. Read everything and write, per hub, `hubs/<slug>/content.json` with the schema of
   `capabilities/hub/doctrine/SCHEMA.md`, following `INTAKE.md` §6: one page per answered
   questionnaire page, the introduction first, each answered question a section in the block that fits,
   each gap an `aside` `[Por confirmar]`.
2. Check against `INTAKE.md` §3 and §4: nothing confidential, nothing invented, the owner read it.
3. Deliver `content.json` and a **gap report**: Hub · Página · Qué falta · Quién lo sabe. If the hub
   is ready, continue with `hub-build`.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability hub --why "hub intake: questionnaire or content for <hub slug>"
```

## Question quality

One idea per question. Ask for steps in order, role names, where something lives and what to do when
it fails. No yes/no questions. Never ask for customer data, credentials or internal figures. Interview
whoever does the work, not only whoever leads it.

## STOP conditions

- **No hub was decided.** Route to `hub`; a questionnaire for an unnamed hub asks everything and
  gets nothing back.
- **A hub has no owner.** Its block is drafted, but it is not converted to `content.json`: "the owner
  read the answers" cannot be true.
- **An answer contains customer data, a credential or an internal figure.** Do not carry it into
  `content.json`; replace it with "se comparte en persona con el responsable" and tell the coordinator.
- **The request is the company's process inventory.** That is `process-map`; its `03-procesos/` is then a source here.
- **The hub is Ingeniería.** Only "lo que el código no dice" is asked here; the rest is `hub-atlas`.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/hub/doctrine/INTAKE.md` | Always, before either mode |
| `capabilities/hub/templates/PREGUNTAS.md` | Writing a questionnaire (Mode 1) |
| `capabilities/hub/templates/CUESTIONARIO.md` | Assembling the questionnaire document (Mode 1) |
| `capabilities/hub/doctrine/SCHEMA.md` | Writing `content.json` (Mode 2) |
| `capabilities/hub/doctrine/SECTORS.md` | Adding the sector's mandatory questions |
