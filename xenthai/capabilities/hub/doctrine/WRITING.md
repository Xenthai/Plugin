# Hub writing doctrine

Implements: fuera del playbook (X9)

How a hub's pages are structured and written. Read it before drafting content. The text it governs
is es-MX; this file is English.

---

A hub is read by someone who has to solve something today. Write for that person, not for whoever
already knows.

## Structure

- **Introduction** first, always: what the hub resolves (one sentence), 2–4 key figures if they exist
  and are not confidential, a confidentiality notice, cards to the other pages, and who the owner is.
- **Menu groups** by what the reader wants to do, never by the org chart: Empezar · Procesos ·
  Reglas · Herramientas · Referencia. Two to five groups, two to five pages each. Usually 6–14 pages.
- **Every page answers a question** (`banner.h1`): "¿Cómo se aprueba una solicitud?", not "Aprobaciones".
- **So does every section** (`h2`): "¿Qué se revisa?", "¿Quién decide?", "¿Dónde está?". Search and
  skimming both depend on it.
- **Close with something actionable:** where it is in the system (`paths`), whom to ask, what to do if it fails.
- A **Hallazgos** or **Pendientes** page at the end when gathering left open questions: table Tema · Pendiente · Dónde.

## Style

- Short sentences (under 25 words), active voice, everyday words.
- Business terms said as they are, explained the first time.
- The company's language and tone. If `comunicacion/VOICE.md` exists (`brand-voice`), it governs; if
  the company has rules (*tú* with customers, impersonal internally), follow them. Default *usted*.
- No emoji. No "en este documento…". No filler adjectives ("robusto", "integral").
- Numbers with units and local format. Absolute dates, never "el mes pasado".

## What is never invented

- A fact not in the sources is `[por confirmar]`, with who knows it when known. Never complete
  figures, names, deadlines, quotes or regulatory obligations.
- What could not be verified is marked as such in an `aside`, `tone: caution`, title `[Por confirmar]`.
- A figure in a `stats` block traces to a row in the company's `PROOF.md`, exactly like any other
  verifiable claim the plugin publishes — even when the hub is internal.

## What never enters a hub

Even internal and private:

- Personal or customer data: names, tax ids, documents, statements, real transaction amounts.
- Credentials, passwords, keys, tokens, account numbers.
- Hosts, internal URLs, cloud account ids, bucket names, production ports.
- Internal or investor financial figures, unannounced roadmap.

Stricter company rules win. A hub that describes risks or architecture says "Solo uso interno" in
its introduction.

## Material for outside

If a page will be used with customers, partners or funders (a Comercial hub, say), its content comes
only from what the company already published. Nothing internal from another hub is reused there.

## Before you finish

- Every page and section title is a question.
- Every page ends with something actionable.
- Every gap is a visible `[por confirmar]`; no figure lacks its source.
- Nothing from "What never enters a hub" is present.
