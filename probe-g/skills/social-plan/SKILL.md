---
name: social-plan
description: Build the editorial plan for a company that has BRAND.md, VOICE.md and PROOF.md — what gets said, on which platform, in what order, over a month, a week, or as a single piece. Use when asked for a content plan or calendar, when a new period needs planning, when the client wants to change cadence, or when a plan needs revising after the client commented on it. This is the first approval gate, so it ends by publishing the plan for review rather than by producing anything. For producing the pieces, use social-produce.
---

# Editorial plan — approval gate 1

You decide what will be said and when. You produce nothing. The plan is published for the client
to comment on, and their comments are the approval.

## Rhythm is the client's parameter, not an architecture

Ask, or read it from `SOCIAL.md` if it is recorded:

| Mode | When it fits | What you plan |
| --- | --- | --- |
| Monthly batch | The default. One research pass, one plan, one approval | 20 to 40 pieces for the period |
| Weekly batch | The client's sector is reactive or news-driven | 5 to 10 pieces, four approvals a month |
| Single piece | Something happened and it needs saying today | One piece, and say plainly that it sits outside the plan |

The monthly batch is what makes production fast: the expensive part — research, judgement,
composition decisions — happens once per period rather than once per piece.

## What the content is actually for

A business buying decision involves six to eleven people, each researching independently before
anyone contacts a vendor. **Social content reaches a silent researcher on that committee, not the
person who signs.** Its job is credibility education, not closing. Plan accordingly: a piece that
demonstrates judgement outperforms a piece that asks for a meeting, because the reader is not yet
in a position to take one.

The general data behind that is not Mexico-specific — no Mexican study on committee size or
channel share surfaced. **Record it in the plan as a working assumption, not as a local fact.**

## Choosing topics

Start from **category entry points**: the specific situations that put this company's category
into a buyer's head. Those decide topics. A topic that maps to no entry point is a topic nobody is
looking for.

Score candidates and show the scores in the plan, so a rejected topic can be argued with:

| Factor | Weight |
| --- | --- |
| Impact on the actual buyer | 40% |
| Fit with what this company can credibly say | 30% |
| Whether anyone is searching for it | 20% |
| What it costs to produce | 10% |

That weighting comes from a published content-strategy framework whose own source is a single
vendor study its author flags as directional. **Treat it as a defensible starting point, not as
measured truth**, and say so if a client asks where the numbers come from.

## Hard constraints on the calendar

- **No single content pillar exceeds 40% of a week.** A month of one theme reads as a company
  with one thought.
- **No platform stays silent more than three days** once it is in the plan. Better to plan fewer
  platforms than to plan a silence.
- **Hold 20 to 30% of slots deliberately open.** A plan with no slack cannot absorb anything that
  actually happens, and the client will publish over it anyway.
- **Every piece names the `PROOF.md` row it depends on**, or states that it makes no claim. A piece
  whose claim has no row cannot be produced, and finding that out at production time wastes the
  slot.

## Publish for approval, then stop

Write `content/<YYYY-MM>/plan.md` in the company's store. Then generate a Google Doc from it for
review, because **comments are the approval mechanism** and only a Doc returns them.

Tell the client explicitly: comment on the Doc, and the plan will be revised from the comments.
Then **stop**. Do not produce pieces against an unapproved plan.

When revising after comments: read the Doc with comments included, revise `plan.md` — the markdown
is the source and carries the lineage — and generate a **new** review Doc. The store cannot rewrite
a file's contents, so a revision is a new document, which leaves the version history visible.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event delivery --capability social \
  --why "plan published for approval" --target "content/<YYYY-MM>/plan.md"
```

Record the approval when it arrives, naming who gave it:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event approval --actor "person:<name>" \
  --capability social --why "approved the plan for <period>" --target "content/<YYYY-MM>/plan.md"
```

## Reference material

Load these only when the condition applies. They are long on purpose and cost nothing until read.

| File | Read it when |
| --- | --- |
| `capabilities/social/doctrine/COPY.md` | Choosing topics, or writing any client-facing words into the plan |
| `capabilities/social/doctrine/PRESENCE.md` | The plan's baseline is being set, or a competitor is about to be named — it carries why no industry benchmark comparison is honest |
| `capabilities/report/doctrine/REPORTING.md` | Deciding what the plan will be measured against, and on what cadence |
| `capabilities/company/doctrine/REGULATORS-MX.md` | A pillar or a topic would put a price, a claim or a health statement in public |

## STOP conditions

- **`PROOF.md` is empty and the plan needs claims.** Plan only pieces that make no claim, and say
  which topics are blocked on verification.
- **The client asks to skip approval.** Explain once that the gate exists because a wrong
  judgement propagates to every piece in the period, then respect their decision and record it in
  the journal as their call, naming them.
- **No category entry points are known.** The plan would be a guess dressed as a strategy. Go back
  and ask what makes someone start looking for what this company sells.
