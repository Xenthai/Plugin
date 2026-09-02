---
name: social-produce
description: Write the copy and render the assets for pieces in an approved plan — static images, carousels, text-only posts, or the draft pieces phase 1 needs. Use when a plan has been approved and pieces need making, when a specific piece needs producing or re-rendering, when an asset failed a check and needs fixing, or when a rendered piece looks wrong. Runs the render engine, which refuses to emit an asset that breaches a platform's safe zone or renders in a substituted font. For deciding what to say and when, use social-plan first; for packaging finished assets for someone to publish, use social-handoff.
---

# Produce — copy and render

> Shell commands below use `${CLAUDE_PLUGIN_ROOT}`. It is guaranteed inside hooks, not inside a
> skill's shell — if it is unset, use the plugin root announced at session start.

Two things happen here, in this order: the words, then the render. The render engine will refuse
work that breaches a platform limit, and **a refusal is a correct outcome** — an asset with its
call to action under Instagram's interface is worse than no asset.

## Before writing a word

Load, in this order:

1. The company's `VOICE.md` — the allow/deny lists and substitution pairs are binding, not advisory
2. The company's `PROOF.md` — for every claim any piece makes
3. `capabilities/social/doctrine/COPY.md` — the register rules
4. `capabilities/social/doctrine/LAYOUT.md` — before any composition decision
5. `capabilities/social/engine/formats.json` — for the character limits and truncation points of the target platform

## Writing the copy

Two questions kill a piece before it is rendered. Ask both, on every piece:

1. **Does every claim have a live `PROOF.md` row?** No row, or an expired one, and the claim comes
   out. Not softened — out.
2. **Could a named competitor publish this unchanged?** If yes, it is category boilerplate. Rewrite
   it or drop the piece. This question is cheap and it is the one that catches generic output.

Then: write for the first line. Every platform truncates, and the position is in `capabilities/social/engine/formats.json` —
Instagram at roughly 125 characters, LinkedIn at roughly 210 on desktop. A line break forces
truncation early on Instagram regardless of length. The reader decides whether to expand based on
what survives the cut.

## Composition

The doctrine file carries the numbers. The four that decide most pieces:

- Content fills **at least 75%** of the body box. Below 65% the type is too timid or content is missing.
- The body block **anchors to the top**. Centring short copy splits the leftover space and reads as a mistake.
- **Short copy takes poster scale.** The register follows the length of the message, not its semantic level. A four-word statement is the headline.
- **Every piece has exactly one focal point.** Zero focal points is a texture, not a piece. Two compete.

And the rule that is not about composition at all: **the artefact proves the claim.** If the copy
says something, the image demonstrates it.

## Rendering

```bash
node "${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/render.mjs" --help
```

Read that help rather than the engine's source. There is no per-company template to write: the
plugin ships one, `capabilities/social/engine/template.html`, with every archetype in it, and the
company arrives as three plain files you write into `content/<YYYY-MM>/`:

| File | Comes from | Contents |
| --- | --- | --- |
| `tokens.css` | The fenced `css` block in the company's `DESIGN.md`, copied verbatim | Colours, families, the display face's width axis |
| `brand.json` | `BRAND.md` and `DESIGN.md` | `name`, `logo` (`svg` inline preferred, `png` path accepted), `foot` lines |
| `pieces.json` | The approved plan | One entry per piece, keyed by id, naming its `archetype` and its content |

Archetypes available — all of them, for every company; choose per piece: `hero`, `record`,
`statement`, `list`, `question`, `quote`, `announcement`, `contrast`. A `quote` needs a live
`PROOF.md` row for the person quoted. Rows may be marked `hot` (the focal line) or `dim` (texture
the safe zone may cover).

Then:

```bash
node "${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/render.mjs"   --template "${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/template.html"   --pieces content/<YYYY-MM>/pieces.json --tokens content/<YYYY-MM>/tokens.css --brand content/<YYYY-MM>/brand.json   --piece <id,id,...> --out content/<YYYY-MM>/pieces   --expect-font "<every family declared in DESIGN.md, comma-separated>" --expect-color "<--signal hex>@.foot"
```

`--expect-font` and `--expect-color` are not optional in practice: they catch what geometry cannot.
Point `--expect-color` at a selector, not a coordinate, so a layout change does not stale it.

**Those two assertions catch what geometry cannot.** A silent operating-system font substitution
passes every size and position check while destroying the brand; a colour token that stopped
resolving leaves the layout intact and the palette wrong.

### When the engine fails an asset

Read the failure and fix the cause. Do not lower the threshold to make it pass.

| Failure | Usual cause |
| --- | --- |
| Message-bearing element inside the hard safe zone | Content extends into the platform's interface area. Reduce rows or raise the block — do not shrink the type. |
| Beyond the soft bound | Something is off-canvas entirely. |
| Fill below the floor | Copy too short for the register, or content was dropped. Raise the headline register. |
| Container overflow | Too much content for the format. **Drop rows, keep the register** — shrinking type to fit produces a piece nobody can read at feed scale. |
| Headline font substituted | The font did not load. Fix the font, never accept the fallback. |
| Pixel colour wrong | A token stopped resolving, or something is drawn over the sample point. |
| No measurable content | The template's script threw. The page is blank; check the browser console. |

Remember the scale it will be seen at: **divide every type size by 2.7** to know whether it reads
in a feed. A 23px label on a 1080px canvas is 8.5px in front of a real reader — that is texture,
and texture cannot carry the message.

## The first batch is approval gate 2

The first batch produced for a company, and the first batch of any new period, goes to the client
before the rest is produced. Publish it as an artifact so they see the rendered pieces rather than
filenames, and so their comments come back attached to what they are commenting on.

Then **stop** until they respond. Producing thirty pieces on an uncalibrated reading is the
expensive mistake this gate exists to prevent.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event delivery --capability social \
  --why "first batch of <period> for review" --target "content/<YYYY-MM>/pieces"
```

Create and change company files with `Write` and `Edit` only. The company guard covers those two;
it cannot see a shell redirect, and the journal would show the violation after the fact rather
than stop it.

## STOP conditions

- **A piece needs a claim with no row.** Produce the rest, list what is blocked, and say what
  verification would unblock it.
- **The template renders nothing.** Do not screenshot around it. A blank canvas that weighs 10KB
  looks like a real file and will reach the client.
- **No system browser and no network.** The engine cannot run. Say so; do not substitute a
  different rendering path whose output has not been asserted.
- **The client asks for a claim you rejected in phase 2.** The answer has not changed. Record that
  they asked.
