# Platforms — choosing one, and the channels that decide what is possible

Read with `SPEC.md` before writing a specification, and never before the process is mapped.
`HANDOVER.md` §1 already settles **who owns** the platform. This file settles **what the platform
is** and, more importantly, what a channel's exact modality allows.

## 1 · The order, restated because it is violated constantly

`HANDOVER.md`: *"Never choose the platform before the process is mapped."* A platform chosen first
produces a company that owns a workflow tool looking for a workflow.

The specification in `SPEC.md` is written **platform-independent**: trigger, data, transformation,
error branches, acceptance criteria. Only at the end does a platform get named, and it gets named
against the ownership cases in `HANDOVER.md` §1 plus the table below.

If the company already runs a platform and somebody maintains it, **that is the platform**. Migrating
a working automation to a technically superior tool nobody in the building understands is a downgrade
wearing an upgrade's clothes.

## 2 · The families, and what actually separates them

Not a recommendation. What to check before naming one.

| Family | Where it fits | What to verify before naming it |
| --- | --- | --- |
| **The assistant the company already pays for** — the automation built into its ERP, CRM, help desk or office suite | Preferred whenever it reaches. No new vendor, no new bill, no new administrator | Whether it can reach the second system at all, and who in the company has ever opened it |
| **Hosted no-code** (the connector marketplaces) | Fastest to standing, widest catalogue of pre-built connections | The unit of billing — per task, per operation, per run — and what happens at ten times the volume. A per-task price is a variable cost on a process that is about to run more often |
| **Self-hostable no-code** | Volume-heavy work, or a company that will not let its data leave | Who administers the host, who patches it, and who is called at 2am. `HANDOVER.md` requires that name before this is an option |
| **Written code on a scheduler** | When the logic exceeds what a canvas expresses without becoming unreadable | Who can read it after the person who wrote it leaves. A repository nobody in the company can open is a dependency, not an asset |

**Two things decide more than the family does:** how the platform bills, and who administers it.
Everything else is preference.

### Billing, which changes the design and not just the price

Every hosted platform bills a unit, and the unit is not the workflow. Find out which:

- **Per run**, whatever the workflow does inside. A polling workflow on a five-minute schedule costs
  roughly 8,600 runs a month and eats an entry plan by itself. Prefer event triggers; when polling
  is unavoidable, poll every fifteen or thirty minutes and say why in the spec.
- **Per step or per operation.** Now the number of nodes is a cost, and batching fifty records
  through one run is an order of magnitude cheaper than fifty runs.

`zapier-mcp-ops` already records one instance of this — two tasks per successful call. The general
rule belongs here: **the billing unit is a design input, and the spec states the expected monthly
consumption before a platform is chosen.**

**Verify prices and limits at the moment of quoting, from the vendor's own page, and write them into
`02-inventario.md` with the date consulted.** Never from memory and never from this file: they change, and
a stale figure in a quote is the consultant's error, not the vendor's.

## 3 · Messaging channels: the modality decides everything

The most common way an automation project dies before it starts. A company says "we use WhatsApp" —
or Instagram, or Messenger — and that sentence describes three incompatible products.

| What they have | What it is | Automatable |
| --- | --- | --- |
| The consumer app | A phone with an app on it | **No** |
| The free business app | Catalogue, labels, quick replies, greeting message | **No API.** Only what the app itself automates |
| The messaging platform, through a provider | A real API against a business number | **Yes.** The only legitimate route |

**The question that separates them:** *"Do you reply from an app installed on a phone, or from a web
platform where more than one person answers the same number?"* The first is the app. The second is
the API.

Record the answer in `02-inventario.md` as the channel's integration surface. A channel whose modality is
`— pendiente —` cannot be quoted, exactly like any other system.

### The rule that does not bend

**Never specify, propose or build automation of a messaging channel through unofficial means** —
libraries that impersonate a web client, browser extensions that type into a session, anything that
drives the consumer app. Three reasons, in order of how much they cost:

1. **The account or the number gets blocked.** In a small company the number is printed on vehicles,
   signage and cards, and it is often the only way customers reach them. Losing it costs more than
   every hour the automation was going to save, and it is not recoverable by apologising.
2. It breaches the platform's terms, which makes it the consultancy's liability and not the client's.
3. It breaks on the platform's next change, and it breaks silently.

If a client asks for it anyway: state the risk once, record their decision as theirs with their name
per `HANDOVER.md`, and **still do not build it.** This is one of the two rules that outrank
convenience, not a risk to be accepted on the client's behalf.

### What the official route constrains

Business messaging APIs are not open pipes, and the constraints are design inputs rather than
footnotes:

- **A service window.** Free-form replies are allowed only for a limited period after the customer's
  last inbound message; outside it, only pre-approved templates send. `zapier-mcp-ops` §4 carries the
  operational form of this. A spec whose flow assumes it can message a customer at an arbitrary time
  is wrong before it is built.
- **Templates need approval in advance**, which is lead time on the project plan, not a detail.
- **The API confirms acceptance, not delivery.** An acceptance logged as a delivery is a false record.
- **Billing is per conversation**, with a rate that varies by country and by category.
- **Coexistence**, where the platform offers it, lets a company keep its number and its app while
  adding the API. It removes the objection that ends most of these conversations. Verify it is
  available for that country and provider before promising it.

### Start where there is no bill and no risk

The free business app's own greeting message and quick replies already capture and pre-qualify an
enquiry. That is most of the value of a first automation, at zero cost and zero platform risk. Run
it, measure it, and let the result argue for the API. A company that has seen a greeting message
work will fund the platform; one that has been quoted for it cold will not.

## 4 · What goes in `02-inventario.md` and what goes in the spec

| Fact | Lives in |
| --- | --- |
| Which platform the company has, who administers it, what it costs, when it renews | `02-inventario.md`, and `06-specs/REGISTRO.md` once something runs on it |
| The exact modality of each messaging channel | `02-inventario.md`, as that channel's integration surface |
| Expected monthly consumption of the platform's billing unit | The specification, before the platform is named |
| Which platform this automation runs on, and why that one | The specification's closing section |

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/automate/doctrine/HANDOVER.md` | §1 first. It owns who pays for and administers a platform, and the refusal case |
| `capabilities/automate/doctrine/SPEC.md` | The specification this file's choice closes |
| `scaffold/company/mapeo-empresa/02-inventario.md` | Where modality, cost and administrator are recorded |
| `skills/zapier-mcp-ops/SKILL.md` | Operating one specific hosted platform over MCP — an instance of §2, not a substitute for it |
