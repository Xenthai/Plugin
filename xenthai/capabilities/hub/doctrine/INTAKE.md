# Hub intake doctrine

Implements: fuera del playbook (X9)

How the content of a hub is gathered from the people who know it, and turned into the
`content.json` the build engine reads. Read it before writing a questionnaire and before converting
answers into content.

The questionnaire and every answer are es-MX, client-facing: the structure is
`capabilities/hub/templates/CUESTIONARIO.md`, the generic questions per hub are
`capabilities/hub/templates/PREGUNTAS.md`. This file is English.

---

## 1. Adapting the question bank

- Replace generic terms with the company's own: its areas, product names, systems.
- Remove what does not apply to the trade; add the sector pack's mandatory questions (`SECTORS.md`).
- **Never ask what is already known.** If the company store, an existing hub or the code already
  says it, write that in the hub's intro paragraph ("the code already shows X; what is missing is how
  it is done in practice"). `03-procesos/`, `01-oferta/` and `comunicacion/` are known sources.
- One idea per question. Ask for steps in order, role names (not people's names unless needed),
  where something lives, and what to do when it fails. No yes/no questions.
- Never ask for customer data, credentials or internal figures. If something needs them, the answer
  is "se comparte en persona con el responsable".

## 2. Rules for whoever fills it

- Answer under each question, in short sentences, as you would explain it to someone joining tomorrow.
- **Unknown:** `[por confirmar]` and the name of who knows. Nothing is completed with assumptions.
- **A document already exists:** paste its link instead of copying it.
- **Does not apply:** write "No aplica", so it does not read as forgotten.
- **A page is missing or extra:** say so in a comment; the pages are a proposal.
- **Examples:** describe the case without real customer data.

## 3. What is never written in the questionnaire or the hub

- Personal or customer data: names, tax ids, documents, statements, real amounts.
- Credentials, passwords, keys, tokens, account numbers.
- Internal or investor financial figures; unannounced roadmap.
- Infrastructure or security detail (hosts, cloud accounts, configurations).

If the organisation has stricter rules, those win.

## 4. Ready to build

A hub moves to build when:

- [ ] it has an owner;
- [ ] every question has an answer, "No aplica", or `[por confirmar]` with who knows;
- [ ] existing documents are linked;
- [ ] the owner read the answers of their hub.

There is no need to wait for every hub: each is built as soon as it is complete.

## 5. If it is gathered by interview

- 45 minutes per area, with **whoever does the work**, not only whoever leads it — management is
  routinely unaware of the real exceptions.
- Ask to be shown the process in the real tool; write down screen and button names.
- Ask about the last time something went wrong: that is where the exceptions the manual needs live.
- Close with "¿qué le preguntan siempre a usted?": those are the hub's FAQ.
- Transcribe into the same questionnaire, not into separate notes.

## 6. From answers to `content.json`

- One page per questionnaire page that has answers; the introduction first.
- Each answered question becomes a section whose title is the question and whose body is the answer
  rewritten in short sentences, in the block that fits (`SCHEMA.md`): steps → `flow`; who/what/when →
  `table`; rules → `checks`; risks → `checks` with `tone: bad`; links to documents → `paths` or `cards`.
- What arrived as `[por confirmar]` or empty becomes an `aside` with `tone: caution` and title
  `[Por confirmar]`.
- Then a **gap report**: Hub · Page · What is missing · Who knows.

## Before you finish

- No question asks for something a known source already answers.
- No answer was completed by assumption; every gap is a visible `[por confirmar]`.
- Nothing from §3 is in the questionnaire, the answers or the content.
- The owner read the answers before the hub moves to build.
