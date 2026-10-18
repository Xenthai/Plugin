# Hub catalogue

Implements: fuera del playbook (X9)

What a company's internal knowledge hubs can be, and the signal that each one is needed. Read it when
deciding which hubs a company should have; `SECTORS.md` then adds what its trade asks for and
`SCORING.md` orders the result.

Hub names, page titles and everything a client reads are es-MX. This file is English.

---

A hub exists for **a concrete audience with repeated questions**. No audience, or no question that
repeats, means it is a page inside another hub, not a hub. Group rather than multiply: four complete
hubs beat ten half-filled ones. A small company usually starts with 3–5, a mid-sized one with 5–8.

Each entry: audience · what it resolves · signals it is needed · typical pages (each written as a
question in the hub) · sensitivity. The pages are a starting point; adapt them to the trade.

## Producto
- **Audience:** the whole company; above all sales, operations and newcomers.
- **Resolves:** what is sold, how it works end to end, costs and product rules, glossary.
- **Signals:** people explain the product differently; repeated questions to a single person.
- **Pages:** what we offer · how one order/operation runs end to end · what the customer sees · what it costs and how it is charged · its rules · glossary · FAQ.
- **Sensitivity:** internal; its public parts may feed Comercial.

## Operaciones
- **Audience:** whoever runs the core process (operations, back office, warehouse, treasury, collections).
- **Resolves:** how each step is done in practice, who decides, what to do when it fails.
- **Signals:** processes living in a few heads; repeated errors; an internal panel with no manual.
- **Pages:** who does what · one page per core step · exceptions and escalation · frequent errors · glossary and contacts.
- **Sensitivity:** internal; sometimes restricted to the area.
- **In this plugin:** when `03-procesos/` exists (`process-map`), it is the source; the hub explains, it does not re-inventory.

## Riesgo y cumplimiento
- **Audience:** leadership, risk, legal, operations, anyone handling customer data.
- **Resolves:** rules that cannot be broken, regulatory obligations, risk policy, information handling, incidents.
- **Signals:** regulated or supervised; handles personal data or third parties' money; audits.
- **Pages:** regulatory frame · know-your-customer and prevention · risk or credit policy · personal data and confidentiality · contracts and guarantees · incidents and escalation.
- **Sensitivity:** restricted by section. Every regulatory statement needs a source and an owner.

## Comercial
- **Audience:** sales, partnerships, prospect handling.
- **Resolves:** how to explain the offer, ideal customer, sales process, objections, onboarding, approved material.
- **Signals:** each seller tells a different story; old material in circulation; long sales cycle.
- **Pages:** what we offer · ideal customer · sales process · customer onboarding · objections and questions · prices and terms (what may be said) · approved material.
- **Sensitivity:** internal; anything said outside comes only from published sources. When `01-oferta/` exists (`company-offer`), it is the source.

## Personas (onboarding and culture)
- **Audience:** the whole company, above all newcomers.
- **Resolves:** first day, tools and access, policies, whom to ask, the map of the other hubs.
- **Signals:** frequent hiring; word-of-mouth onboarding; repeated policy questions.
- **Pages:** welcome · first day and first week · tools · policies · whom to ask · basic security.
- **Sensitivity:** whole company, no personal data.

## Ingeniería
- **Audience:** the technical team and whoever joins it.
- **Resolves:** architecture, code organisation, data model, critical flows, how a change reaches production, team rules.
- **Signals:** own software; long ramp-up for newcomers; knowledge in few people.
- **Pages:** how we work · overview · frontend · backend · code organisation · data model · key entity states · critical flows · CI/CD · findings.
- **Sensitivity:** internal; no hosts, accounts or secrets. Built with `hub-atlas`.

## IA
- **Audience:** the whole company.
- **Resolves:** how AI is used, what is never shared, templates and brand, how to ask.
- **Signals:** daily use of assistants; doubts about what may be pasted; uneven results.
- **Pages:** introduction · what to use · what never to share · official artifacts and templates · brand rules · tone · how to ask · workflow.
- **Sensitivity:** whole company.

## Finanzas y contabilidad
- **Audience:** finance, leadership, operations that generate movements.
- **Resolves:** close, reconciliations, invoicing, supplier payments, expense policy.
- **Signals:** slow close; manual reconciliations; doubts about how something is booked.
- **Pages:** close calendar · how each movement is booked · reconciliations · invoicing · expenses and refunds · reports.
- **Sensitivity:** restricted; never internal figures in the hub.

## Atención a clientes
- **Audience:** support, customer success, customer-facing operations.
- **Resolves:** how to answer, response times, escalation, approved answers.
- **Signals:** ticket volume; inconsistent answers; repeated complaints.
- **Pages:** channels and hours · frequent cases and their answer · escalation · tone with customers · tools · metrics that are watched.
- **Sensitivity:** internal; no real customer data.

## Legal
- **Audience:** leadership, sales, operations.
- **Resolves:** standard contracts, who signs, intellectual property, ongoing litigation (existence only, never detail).
- **Pages:** standard contracts · who signs what · contract review · suppliers and partners · intellectual property.
- **Sensitivity:** restricted.

## Datos y reportes
- **Audience:** whoever consults or produces metrics.
- **Resolves:** metric definitions, sources of truth, official dashboards, how to ask for an analysis.
- **Signals:** two people give two numbers for the same thing.
- **Pages:** metric dictionary · data sources · official dashboards · how to ask for an analysis · data quality.
- **Sensitivity:** internal; definitions yes, figures no.

## Seguridad de la información
- **Audience:** the whole company.
- **Resolves:** passwords, devices, access, what to do in an incident.
- **Pages:** basic rules · access and offboarding · suspicious email · incidents.
- **Sensitivity:** whole company, no infrastructure detail.

## Marketing y marca
- **Audience:** marketing, sales, whoever produces material.
- **Resolves:** brand, tone, templates, calendar, approvals.
- **Pages:** brand and tone · templates · channels · material approval · calendar.
- **Sensitivity:** internal; in small companies often merged into IA or Comercial. When `comunicacion/` exists (`brand`), it is the source.

## Before you finish

- Every proposed hub names its audience and at least one repeated question.
- Nothing that is only a page was promoted to a hub.
- Every hub that has a plugin document as its source names it.
