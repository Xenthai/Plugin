---
name: social-voice
description: Run onboarding phase 2 for a company that has BRAND.md but no VOICE.md — deriving its voice from material it has already published, turning that into word-level rules a writer who is not the brand owner can actually follow, and filling PROOF.md with what may be claimed publicly. Use when VOICE.md is missing, when copy keeps coming out generic, when asked to calibrate or fix a company's tone, or when a claim needs a verification row before it can be published. Requires BRAND.md — if it does not exist, use social-identity first.
---

# Phase 2 — voice and proof

One session. Deliverables: `VOICE.md`, a filled `PROOF.md`, and the first batch of pieces whose
copy is actually the company's.

## Voice is captured as rules, not as adjectives

"Bold, authentic, human" constrains nothing. No mechanism connects an adjective to a word choice,
so a writer who is not the brand owner produces whatever they would have produced anyway. Capture
in this order, because this is the order of how reliably each one transfers:

1. **Allow and deny word lists.** Binary and checkable. This is the strongest instrument available.
2. **"We say X, not Y" substitution pairs.** Three to six. Each one encodes a decision the company
   has already made.
3. **Five to eight annotated before/after rewrites.** These fix rhythm and syntax that word lists
   cannot reach.
4. **One line of tone position** — formal/casual, serious/funny, respectful/irreverent,
   flat/enthusiastic. Useful for a human to check output against; weak as an instruction on its own.

**Never exceed eight rewrite examples, and keep them internally consistent.** Few-shot examples do
pull generation toward their style, but too many or mutually inconsistent examples measurably
degrade instruction-following. Dumping a company's whole content archive in makes the output worse,
not better — this is the opposite of the intuition.

## Deriving voice from what they already publish

Collect fifteen to twenty representative samples across every channel the company actually uses.
Annotate each by **structural slot** — how it opens, how it makes a claim, sentence length, how it
closes — rather than describing it in free prose. Convert the recurring patterns straight into the
allow/deny lists and substitution pairs. **The output is `VOICE.md` itself, not an essay about the
voice.**

### The failure mode, and the two questions that catch it

Extraction has no error correction: it encodes existing defects as "the voice" just as faithfully
as it encodes strengths. If the company hedges, pads, and makes unverifiable claims, that becomes
their documented identity.

Run every extracted pattern through both:

1. **Does it pass `PROOF.md`?** A pattern that habitually makes unverifiable claims is a defect.
2. **Could a named competitor say this, unchanged?** If yes, it is not a voice, it is category
   boilerplate.

A pattern that fails either is **a defect to fix, never a trait to preserve.** Say so to the
client, with the sample in front of them, and propose the replacement.

## PROOF.md is a register with expiry, not a list

Every publishable claim gets a row:

| Field | Why it is there |
| --- | --- |
| Claim, verbatim as it will appear | The wording is what gets read, not the intent behind it |
| Type: outcome / client name / credential / comparison / timeline | Different types carry different risk |
| Source, with a locator | "The client said so" is not a source |
| Verification method, and **who confirmed it** | An unnamed confirmation proves nothing |
| Date verified | |
| **Re-verification date** | A claim true in March is not automatically true in December |
| Approved channels and audience | A claim safe in a private deck may not be safe in public |

This shape is how regulated marketing works everywhere it is taken seriously — pharmaceutical
review, advertising self-regulation, financial promotions — and the burden of proof sits with the
publisher, for **every reasonable reading** of the claim, not only the intended one.

**No row, not publishable. Row expired, not publishable until re-verified.** There is no exception
for a claim everyone in the room believes.

## Then produce the first real batch

Hand off to `social-produce`. That batch is the second approval gate, so it is deliberately small:
enough for the client to correct your calibration, not so much that a wrong reading has been
applied thirty times.

## Record the phase

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event phase_end --capability social \
  --why "phase 2 complete: VOICE.md written, N claims registered, M rejected as unverifiable" \
  --target "VOICE.md"
```

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

Append the conversation to `INTERVIEW.md`, including the phrases the client rejected. A rejected
phrase is the most reusable output of a voice session — it is what stops the same wording being
proposed again next quarter.

This skill fills documents by interviewing a person.
`capabilities/company/doctrine/SESSION.md` says how that hour is run — above all, who has to
be in the room for each question and who must not be.

## STOP conditions

- **The company has published nothing.** There is nothing to extract from. Derive voice from the
  interview instead, write it as explicitly provisional, and get it approved before producing a
  single piece — a derived voice nobody signed off on is your invention presented as theirs.
- **Every sample fails the genericness question.** Say it plainly. The company does not have a
  voice yet, and phase 2 becomes a decision the client has to make rather than a pattern you can
  extract. That is a different, longer conversation and it is theirs to have.
- **A claim the client insists on has no verifiable source.** Record it as rejected, with the
  reason, and do not publish it. Repeat the rule once; if they insist, note their decision in the
  register and still do not put it in client-facing text.
