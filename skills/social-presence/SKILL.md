---
name: social-presence
description: Audit a company's current public presence before anything is produced for it — every account that exists including the ones nobody remembers, dated observations per platform, contradictions between channels, whether paid advertising is already running, regulatory exposure visible from outside, and a named competitor set observed the same day. Use at the very first social session, before identity or voice, when PRESENCE.md is absent or pending, when a company asks how it is doing on social, or when an agency's benchmark deck needs answering. Produces PRESENCE.md, which is append-only. For positioning use social-identity; for company-wide operational measurement use baseline.
---

# Presence audit — phase 0, and it only happens once

One session. Deliverable: `PRESENCE.md`, in the company's store.

**Read `capabilities/social/doctrine/PRESENCE.md` before capturing anything.** It carries what is
observable per platform, why no benchmark comparison is honest, and the traps that would produce a
false finding.

## Why this runs before identity, and not after

**The "before" is perishable.** After phase 1 the operator has already influenced what there is to
observe — a rewritten bio, a new pinned post, an answered comment. The observation stops being
independent, and no later session can recover what was there.

This is the same rule the measurement doctrine states for the company-wide baseline, applied to the
public surface. An engagement that skips this can never produce a credible before-and-after for
social, and `PROOF.md` stays silent on outcomes forever.

So: **if a company has any public presence at all, this runs first.** If it has none, that is a
two-line finding and the session is over in ten minutes — which is itself the fastest phase 0 there
is.

## The document is append-only

Copy `scaffold/company/PRESENCE.md` into the store and fill it. Then treat it as a ledger:

- **A dated observation is never edited.** When something changes, add a row to §3 and a row to the
  capture history. Correcting September's figure in December destroys the before.
- **Every number carries its instrument and its capture time.** Instagram's own HTML and its own
  rendered page disagreed within a single load; a Facebook view count moved between two consecutive
  loads. Without a timestamp a number is not comparable even against itself.
- **Absolute figures and medians. Never a mean of rates**, and never a rate without its numerator
  and denominator printed beside it.

## What produces the findings a company cannot see from inside

Ranked by how often the client is genuinely unaware:

1. **Accounts nobody remembers.** Search the commercial name, the legal name, every brand, and
   variants with and without accents. An orphaned or impersonating account is found by searching,
   never by asking — from inside, nobody knows it exists. **The strongest single signal is no post
   in six months with comments still accumulating.**
2. **Who legally owns the account.** An account created on an employee's own phone with their own
   email, that the company later started using, may not be the company's — later commercial use
   does not transfer ownership. Record what is observable (creation date, confirmed owner) and
   **flag it as a question for their lawyer, not as a conclusion.**
3. **Contradictions between channels.** Nobody compares the website against the LinkedIn tagline
   field against the Facebook "About" against the Google listing. Profile metadata is filled once
   at setup and never revisited. **This is the finding the audit generates rather than cites** —
   there is no published measurement of cross-channel drift at this company size, so the client's
   own contradictions, enumerated, are the deliverable.
4. **Regulatory exposure already published.** Most of it is visible from outside with no access.
   Read `capabilities/company/doctrine/REGULATORS-MX.md` and screen against it. **The
   thirty-second check that lands hardest: a privacy notice naming INAI, or citing the 2010 data
   protection law. The law changed in March 2025 and the authority is no longer INAI** — that
   single observation dates their last compliance review.
5. **Whether they are already paying for ads.** No need to ask. Meta's ad library is fully public
   in Mexico with no login, and Facebook's page transparency panel independently declares whether
   a page has ads running. The two should agree.
6. **Governance maturity, by proxy.** Policies are internal and unobservable. Response-time
   variance, behaviour under a public complaint, and whether critical comments get deleted are
   observable — and **deleting critical comments is the clearest sign that whoever holds the
   password decides alone.** Record these as indicia, labelled as indicia.

## Never do these three things

- **Never compare against an industry benchmark.** No platform has a native engagement rate; the
  only industry standard defines neither the rate nor a denominator; published vendor figures differ
  by up to 18× and invert which platform performs best. The honest comparisons are the company
  against itself over time, and against a named competitor set observed the same day with the same
  method. The doctrine carries the sources — and when a client arrives with an agency's benchmark
  deck, **score it in front of them against the eleven AAPOR disclosure items** rather than arguing.
- **Never score a missing verification badge as a deficiency.** On LinkedIn, WhatsApp and Instagram
  the badge now depends on a paid subscription or a commercial relationship. Its absence is evidence
  about spending, not identity.
- **Never use a tool that limits until it is paid.** That includes the Google Places API, which
  requires billing enabled. The manual maps interface gives *more* review data than the API's
  five-review cap, so the constraint costs nothing here. Where a paid tool is the only route, say
  the metric is out of scope rather than omitting it silently.

## Declare the scope before it is asked

Fill §10 of the scaffold in the same session. Reach and impressions do not exist without the
account's own authorisation; saves and shares are invisible from outside; paid-media visibility is
complete on Meta and **literally zero on TikTok for Mexico**. An audit that implies uniform
coverage over-promises, and the over-promise surfaces at delivery.

Say plainly that this is a screening instrument and **not legal advice** — it says what needs a
lawyer.

## Record the phase

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event baseline --capability social \
  --why "presence audit captured: N accounts found, M contradictions, K regulatory observations" \
  --target "PRESENCE.md"
```

Append the conversation to `INTERVIEW.md` — who confirmed which account is official, and who did
not recognise one. **A senior person not recognising an account is itself the finding**, and it is
only recoverable if the exchange was written down.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/social/doctrine/PRESENCE.md` | Before capturing anything — observability per platform, benchmark refusal, the interpretive traps |
| `capabilities/company/doctrine/REGULATORS-MX.md` | Screening what is published against what a regulator can act on |
| `capabilities/company/doctrine/STANDARDS.md` | A framework or standard is about to be named in the deliverable |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | A figure from here will later support a before-and-after claim |

## STOP conditions

- **`PRESENCE.md` already exists with dated captures.** Do not re-run phase 0 and do not overwrite
  it. Add a new dated block and a capture-history row, and say which figures moved.
- **A phase after this one has already run.** The independent "before" is gone. Say so plainly,
  capture what is there now, and label it as a later observation rather than a baseline — never
  present a post-intervention capture as the before.
- **An account's ownership is genuinely in doubt** — an agency holds it, or a former employee does.
  Record what is observable and stop. **This needs their lawyer**, and a recovery attempt made from
  a consulting session can prejudice the client's own claim.
- **A regulatory observation looks serious** — a health claim, a financial product without required
  disclosure, data collected with no notice. Record it, flag it for a lawyer, and do not draft the
  corrected version in this session. Fixing it is a different decision with different authority.
- **The client offers logins so the audit can be done "properly from inside".** Decline. The
  external view is the point: it is reproducible, and it is what a customer, a competitor and a
  regulator see. Record which role holds the access instead.
