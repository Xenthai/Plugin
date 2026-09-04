# Copy doctrine

> How words get written for a company that is not yours, so the result is recognisably theirs and
> nothing published is unverifiable. Company-independent: a company's own rules live in its
> `VOICE.md`, and where the two disagree, `VOICE.md` wins.

## The two questions that decide every piece

Ask both, on every piece, before it is composed. They are cheap and they catch the two failures
that matter.

1. **Does every claim have a live row in the company's `PROOF.md`?**
   No row, or an expired one, and the claim comes out. Not softened, not hedged — out. Hedging an
   unverifiable claim keeps the liability and loses the force.

2. **Could a named competitor publish this unchanged?**
   If yes, it is category boilerplate. This question is the single most useful instrument here,
   because generic output is the default failure and it is invisible from the inside.

## Voice is rules, not adjectives

"Bold, authentic, human" constrains nothing — no mechanism connects an adjective to a word choice.
A company's `VOICE.md` carries, in descending order of how reliably each transfers to a writer who
is not the brand owner:

1. **Allow and deny word lists.** Binary and checkable. The strongest instrument available.
2. **"We say X, not Y" substitution pairs.** Each encodes a decision the company already made.
3. **Five to eight annotated before/after rewrites.** These fix rhythm and syntax that word lists
   cannot reach.
4. **One line of tone position** — formal/casual, serious/funny, respectful/irreverent,
   flat/enthusiastic. For a human to check output against; weak as an instruction alone.

**Never more than eight rewrite examples, and never inconsistent ones.** Few-shot examples do pull
generation toward their style, but too many or mutually inconsistent examples measurably degrade
instruction-following. Dumping the company's whole archive in makes output worse, not better.

## Write for the first line

Every platform truncates, and where is in `../engine/formats.json`: Instagram at roughly 125
characters, LinkedIn at roughly 210 on desktop and 140 on mobile. **On Instagram a line break
forces truncation at the end of that line regardless of length.**

The reader decides whether to expand based on what survives the cut. Everything load-bearing goes
before it.

## What the content is for

A business buying decision involves six to eleven people, each researching independently before
anyone contacts a vendor. **Social content reaches a silent researcher on that committee, not the
person who signs.** Its job is credibility education, not closing.

Consequence: a piece that demonstrates judgement outperforms a piece that asks for a meeting,
because the reader is not yet in a position to take one. A hard call to action on every piece
signals a company that has not understood who is reading.

The general figure is not Mexico-specific — no Mexican study on committee size or channel share
surfaced. **Record it as a working assumption, never as a local fact.**

## Never

- **Never invent an outcome metric.** No savings percentage, no time saved, no ROI, unless a
  `PROOF.md` row carries its measurement and its measurer. This is the easiest way to do a client
  real damage, and the resulting number is always flattering, which is what makes it tempting.
- **Never name a client without recorded permission.** A video or image travels further than a page
  and is harder to retract.
- **Never present a client-supplied number as independently measured.** Label it as reported by the
  client. The distinction is the whole difference between evidence and repetition.
- **Never open with a negation.** Defining a company by what it is not gives the reader the
  competitor's frame. As a subordinate clause it can work; as an opening it concedes the argument.
- **Never use a persona with an invented name to justify a choice.** Customer bases are
  heterogeneous within a brand and overlap across competitors. The test a persona field must pass
  is "and therefore we write or publish what?", and most fail it.
- **Never use brand archetypes.** No evidence supports them, and the one peer-reviewed retest found
  most brands express several at once — contradicting the framework's own premise.

## Hashtags are per platform, not global

From `../engine/formats.json`, and the differences are large enough that one rule for all is wrong:

| Platform | Rule |
| --- | --- |
| Instagram | 30 maximum, officially |
| X | Its own guidance recommends **no more than 2**; there is no technical cap |
| YouTube | More than 60 causes **every** hashtag to be ignored; only the top 3 are surfaced |
| TikTok | A cap of 5 is reported from around August 2025 but is **unconfirmed** — verify on a live account before relying on it |
| Facebook | No official cap found; a limit of 5 is reported and unverified |

## Language

Client-facing text is **es-MX**. Default to **usted** with directors until the company's own
material shows otherwise — and record which register the company itself uses, because that is a
voice decision, not etiquette.

Avoid unnecessary anglicisms where a normal Spanish word exists. "Correo", not "email".

Everything that is not client-facing — this plugin's code, its documentation, its journal fields —
is in English.

## Regulated claims

Which regulator applies depends on the company's sector, and it is recorded in its `BRAND.md`:

- **PROFECO** governs general and comparative claims
- **COFEPRIS** governs health, food and pharmaceutical claims, and **prohibits disease-reduction
  claims outright**
- Financial services add **CNBV** and **CONDUSEF**

Knowing which claims are illegal happens **before** drafting, not at review. Writing first and
checking later is how a client gets fined for a sentence you wrote.
