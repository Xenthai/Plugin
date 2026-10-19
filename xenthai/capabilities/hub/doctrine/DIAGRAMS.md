# Engineering hub diagram menu

Implements: fuera del playbook (X9)

Which 8–12 diagrams an engineering hub carries. Read it after mapping the repository, to choose.
The Archify type is given in parentheses; without Archify, the Mermaid equivalent.

---

Cover **system** (overview, frontend, backend, code organisation), **data** (model, states),
**business flows** (2–4 of the processes that matter or risk most) and **delivery** (CI/CD). Never one
diagram per module: group, and leave the detail to the cards.

## System

| Diagram | When | Shows | Type |
|---|---|---|---|
| Overview | Always | 8–12 components, one main route highlighted, external dependencies, trust boundaries | `architecture` (flowchart) |
| Frontend(s) | Web or mobile apps exist | From user to API: guard, page, module, state, API client; what they share | `architecture` |
| Backend | An own API exists | A request's pipeline (middleware, guards, controllers, services, data access) and grouped modules | `architecture` |
| Code organisation | Monorepo or large repo | Where each thing goes: apps, libraries by domain and layer, tooling | `tree` |
| Deployment | The repo describes infrastructure | Services per environment, no accounts or hosts | `architecture` with `engineering_profile` |

## Data

| Diagram | When | Shows | Type |
|---|---|---|---|
| Data model | A database exists | 8–12 core tables with columns, keys and domains | `erd` |
| States | Entities with a status (order, operation, ticket, subscription) | Stored and computed states, who fires each transition | `lifecycle` (stateDiagram) |
| Data lineage | ETL, reports or derived accounting | Where each datum comes from and goes | `dataflow` |

## Business flows (choose 2–4)

| Diagram | When | Type |
|---|---|---|
| The revenue flow (purchase, application, signup) | Always | `sequence` |
| Authentication and session | Own login, OTP, SSO or tokens | `sequence` |
| Payments, collections or reconciliation | Money moves | `dataflow` or `sequence` |
| Customer onboarding or verification | KYC, onboarding or third-party integrations | `sequence` |
| A critical external integration | A provider holds the business up | `sequence` |
| Scheduled processes | Crons, queues or jobs | `workflow` or `waterfall` |

## Delivery

| Diagram | When | Type |
|---|---|---|
| CI/CD | CI workflows exist | `workflow` with lanes: developer, quality, CI, deploy |
| Incident or release history | A changelog or postmortems exist | `timeline` |

## Choosing between candidates

1. What newcomers ask most.
2. Where an error costs money, customers or compliance.
3. What only one person understands today.
4. What the documentation describes differently from the code (findings will be there).

## Before you finish

- Between 8 and 12 diagrams, covering system, data, flows and delivery.
- No diagram duplicates a module another already covers.
