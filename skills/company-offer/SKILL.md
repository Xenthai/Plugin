---
name: company-offer
description: Capture what a company sells and on what terms — its product catalogue with stock and lead times, its service catalogue with deliverables and capacity, and the payment, warranty, cancellation and CFDI terms that apply to both, including the discount limit and who authorises going past it. Use when OFFER.md, PRODUCTS.md or SERVICES.md are still pending, when a quoting or invoicing process is about to be mapped or automated, when the operator asks what the company charges, or when a price or term needs to appear in public copy. A social-content-only engagement does not need this; for positioning and voice use social-identity, and for how the quote actually gets produced use process-map.
---

# Company offer — what is sold, and on what terms

One session. Deliverables: `OFFER.md`, plus `PRODUCTS.md` and `SERVICES.md` for whichever the
company actually sells.

This session exists separately from positioning because **a social-only engagement does not need
it.** Prices, stock and payment terms are what a quoting or invoicing automation reads; content
needs almost none of it. Running it on a client who only wants posts spends their attention for
nothing.

## Start from documents, not questions

Before asking anything, check `INTAKE.md` for a price list, a catalogue, a recent real quote, a
contract or published conditions, and an inventory report. A price list is not an opinion, and a
real quote shows the fields the company actually fills — including the ones nobody mentions when
describing the process from memory.

Ask only for what no document holds.

## What each file owns, and why they are three

| File | Owns | Why separate |
| --- | --- | --- |
| `OFFER.md` | Terms, how a price is built, the discount limit, what is never sold | These apply to everything the company sells; stating them once is what keeps them from drifting |
| `PRODUCTS.md` | Catalogue with SKU, stock, supplier, lead time | **A product runs out.** Stock and lead time decide whether a quote can be promised |
| `SERVICES.md` | Catalogue with deliverable, duration, who executes, capacity | **A service saturates.** Capacity, not stock, is the constraint |

Fill `OFFER.md` §1 first — the table saying whether the company sells products, services or both.
An empty catalogue is not a gap when that table says the company does not sell it; **that table
left pending is the gap.**

## The five fields that decide whether an automation is possible

Everything else can be filled in later. These five change the answer to "can this be automated,
and for how much":

1. **Where stock is checked, and who updates it.** If stock lives in a sheet someone updates by
   hand on Tuesdays, an automated quote can promise what is not there. That is a finding for
   `PROCESSES.md`, not a detail.
2. **Who can execute each service, and how many at once.** If one person is the only one who can
   deliver a service the company sells weekly, that is a **commercial** single point of failure,
   not only an operational one — cross-reference it in `PEOPLE.md`.
3. **The discount limit and who authorises past it.** Without it, a quoting automation either
   escalates everything or exceeds its authority.
4. **The currency, and what happens when the exchange rate moves.** The most forgotten variable
   and often the largest one when a supplier invoices in another currency.
5. **What is never sold.** It is what lets an automation escalate instead of quoting something the
   company does not do.

## Every price is a public claim

A price, a lead time and a warranty are claims like any other. Anything from these files that will
appear in public needs a row in `PROOF.md` with its source and its re-verification date.

**Every price carries a validity date.** A price with no date gets republished a year later, and
that is the most common false public claim with no bad intent behind it.

## Record the phase

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event phase_end --capability company \
  --why "offer captured: N products, M services, terms and discount limit recorded" \
  --target "OFFER.md"
```

Append what each person said to `INTERVIEW.md` — prices and terms stated from memory are
client-reported until a document confirms them, and that distinction is only recoverable if the
conversation was written down.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/INTAKE.md` | Before asking for anything — check what a document already answers |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | A price or a duration is stated from memory and might become a claim |
| `capabilities/social/doctrine/COPY.md` | A price or term is about to appear in public copy |

## STOP conditions

- **`OFFER.md` §1 is still pending.** Nothing else in these files means anything until it says
  whether the company sells products, services or both.
- **Prices exist only in someone's head.** Record them as client-reported, say so in
  `INTERVIEW.md`, and do not let them into public copy until a document or an authorised person
  confirms them.
- **A price is quoted per client with no rule behind it.** That is the finding: there is no price
  list, there is a negotiation. Say it, and treat the quoting process as the thing to map rather
  than the catalogue.
- **The client offers credentials to a system so you can "check the prices yourself".** Decline.
  Record the role that custodies them and ask for an export instead.
