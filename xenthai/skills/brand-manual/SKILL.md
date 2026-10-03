---
name: brand-manual
description: Compile a company's complete brand manual — strategy and voice, visual identity, and applied specifications for stationery, documents, social, vehicles, uniforms, signage and sub-brands — as a reviewable PDF and, when the company keeps one, inside its design system. Use when asked for brand guidelines, a manual de marca, manual de identidad, brand book or brand standards, when a printer, sign shop or agency needs specifications, or when the company's look is applied inconsistently across channels. Requires BRAND.md and DESIGN.md; if BRAND.md is missing use social-identity first, and if voice is uncalibrated, social-voice. For individual social pieces use social-produce.
---

# Brand manual

The manual is a **derived artefact**. It compiles what the company's store already holds — `BRAND.md`, `VOICE.md`, `DESIGN.md`, `PROOF.md`, `PRESENCE.md` — and adds the applied specifications a printer, sign shop or agency needs. It is never where a fact is born. A fact the manual needs and the store lacks is captured into the store first, with its source, and only then compiled. A manual that invents a mission, a figure or a Pantone reads as authoritative to every supplier who receives it, and those suppliers will paint it on a truck.

Client-facing text is es-MX unless the company's `.company.json` declares another language.

## Before writing a word

1. **Read the store.** `BRAND.md` (identity, authority, regulator, thesis, vocabulary, the nevers), `VOICE.md`, `DESIGN.md`, `PROOF.md`, `PRESENCE.md`. Note every `— pendiente —`.
2. **Read what the company already publishes**: its live site, its design system if it has one, its logo files. Measure the assets instead of trusting their names:
   - the real ink of each logo PNG (the most frequent colours among opaque pixels);
   - whether each "vector" SVG is really paths, or a PNG wrapped in an `<image>`, or an autotrace (wobbly corners at high zoom). Most SMB logo SVGs are one of the last two;
   - which colour and family values the site actually renders, not what a brand kit says.
3. **List the contradictions.** Two oranges (site versus logo file), two blues, three type families in play, a typed web wordmark that is not the logo, documentation that names a font the site no longer loads. Each contradiction is a decision for the person `BRAND.md` §2 names as able to approve public claims — not for you, and not for whoever is in the session.

## Questions — two rounds, four at most each

Round 1: the deliverable (PDF, design system, both); which application families are in scope (stationery and documents, social and ads, vehicles/uniforms/signage, strategy and voice); and one question per contradiction from step 3, recommending what the live site already uses.

Round 2: mission, vision and values — supplied, or drafted for approval; sub-brands to include; which vehicles, uniforms and protective equipment exist; the tagline. **Before asking for a tagline, read the site** — most companies already have one, and asking for it again tells the client you did not look.

Answers that settle a contradiction go into `DESIGN.md` or `BRAND.md` immediately, with who decided and when, through `Write`/`Edit`. The manual then reads them from there.

## What the manual contains

| Chapter | Built from | Rule |
| --- | --- | --- |
| Purpose, mission, vision | `BRAND.md` §3 | If drafted by you, every page carries "propuesta para revisión" until the approver signs. |
| Values and personality | `BRAND.md`, `VOICE.md` §4 | Four or five values tied to how the company operates. "Is / but is not" table. **No archetypes, no named personas** (see `social-identity`). |
| Value proposition, key messages | `BRAND.md` §3, `PROOF.md` | **Every figure needs a live `PROOF.md` row.** A site figure is client-reported: row it with the URL and date, or leave it out. |
| Voice and tone by channel | `VOICE.md` | Register per channel (*tú* on web and social, *usted* on quotations, contracts, tenders and corporate procurement is the common Mexican split), "we say X not Y", allow/deny lists. |
| Brand architecture | `BRAND.md` | Monolithic or endorsed. Divisions are descriptors, never a logo. Partner marks smaller and separated. |
| Logo | `DESIGN.md` §3 | Versions (primary, reversed, one-ink, symbol), clear space as a multiple of a measurable element of the mark, minimum size in px **and** mm, eight misuse examples actually drawn. |
| Colour | `DESIGN.md` §1 | HEX, RGB, CMYK and nearest Pantone, the last two marked approximate with "pedir prueba física". Proportion (e.g. 60·30·10). Contrast pairs **computed**, not estimated. |
| Typography | `DESIGN.md` §1–2 | Roles, weights, Office fallbacks. A logotype face lives only inside the logo. |
| Photography, iconography | `PRESENCE.md`, site | What a real photo of this company looks like; what is never shown. |
| Applications | the rest of this skill | One page per family, each with a mock-up and its measurements. |

## Rules a generalist gets wrong

- **Contrast.** Compute WCAG luminance for every text pair before writing a rule. Saturated oranges (#ff5500 and neighbours) give about 3.2:1 on white: headline-only (24 px+, or 19 px bold). Small text on an orange fill goes in the dark brand colour, not white. If the live site breaks this, record it as a finding; do not silently re-tint the brand.
- **Do not invent an off-palette shade** to rescue small coloured text. Use the text grey.
- **Safety colour outranks brand colour.** High-visibility vest fluorescent and its certified reflective tape are never replaced by the brand orange; the logo goes on a tape-free zone. Safety signage keeps NOM-026-STPS colours and pictograms; brand never mixes into it. Vehicle reflective tape and transit legends keep their colour and place.
- **Photo rules from `BRAND.md` §5 apply to every mock-up.** A worker without PPE in a sample photo is a rule the manual teaches by breaking.
- **Social safe zones**: Meta publishes 14% top / 35% bottom / 6% sides for Stories and Reels. The widely repeated 250 px figure is third-party; do not print it in a manual.
- **Pantone, CMYK, norm numbers, vinyl codes**: never stated as exact. Approximate, and say who validates.
- **The regulator in `BRAND.md` §1** governs claims in the voice chapter's examples too.

## A real vector logo, when the files have none

When the wordmark is set in a typeface the company has (often its "brand font" sits in the store unused), rebuild the vector instead of tracing it. This is a case where an exact answer exists:

1. Render the word in Chromium in that face at the size whose cap height matches the PNG; compare per-glyph column runs against the PNG to get scale and x-offset.
2. Shape with HarfBuzz (kerning included) and emit paths through fontTools `SVGPathPen` inside a `TransformPen(s, 0, 0, -s, x0 + pen_x·s, baseline)`.
3. Find the baseline by minimising the mean alpha difference against the original over a small vertical search. Accept below 0.01 mean difference; otherwise stop and report.
4. Rebuild non-glyph marks (triangles, dots, swooshes) from edge coverage per row of the PNG's alpha channel, as exact `path` data.
5. Export colour variants as SVG (`currentColor` variant included, Illustrator ids stripped) and as PNG at the original pixel size with a transparent background; crop a symbol viewBox.

No matching typeface: use the PNG, and record the missing vector as pending in `DESIGN.md`. Never redraw a mark from memory.

## Building the PDF

- One HTML document, `@page{size:11in 8.5in;margin:0}`, one `section.page` per sheet, footer with version and page number; cover with a company photo under a brand-colour veil, contents, chapter separators, back cover with contact data.
- Social examples come from the render engine (`social-produce`), not from hand-made mock-ups, so the manual shows pieces that already passed the safe-zone and font assertions.
- Fonts: the company's own files stay in its store and load by absolute `file://` URL; OFL faces may come from the plugin. Give every SVG `<text>` a fallback stack, or it renders serif when a face fails. Then assert the face that actually rendered (`document.fonts.check`, or `--expect-font` on the engine) and **fail the build rather than ship a substituted font**.
- Render with the plugin's Chromium (`playwright-core`), `page.pdf({width:'11in', height:'8.5in', printBackground:true})`.
- **Review every page as an image** before delivering: screenshot each `section.page`, tile six per contact sheet, and look. The usual defects are text overrunning a coloured stripe, a block pushed past the footer, a half-empty page (raise the type, don't add filler), an SVG label clipped at its viewBox.
- Downscale large photos (around 1600 px, webp at about 72) when the PDF passes 8 MB.
- A revision is a new file with a new version number; the previous PDF stays.

## Inside a design system

When the company keeps a Design System artifact, follow that type's own SKILL.md. Additions: new guideline sections as `.md` under `project/guidelines/` (count the existing sections against the type's cap first), one card per application family with the type's card marker, the PDF uploaded as an asset and recorded in the index, the index re-read right before it is written and only its asset records, groups and `lastChange` changed.

## Approval and the journal

The manual is publishable only when the person `BRAND.md` §2 names approves it. Until then it is a draft, and says so on its cover.

```sh
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability social \
  --why "brand manual v1.0 delivered for review, N pending decisions" --target "<pdf path>"
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event approval --capability social \
  --why "brand manual v1.0 approved" --actor person:<approver> --target "<pdf path>"
```

`${CLAUDE_PLUGIN_ROOT}` is not guaranteed in a skill's shell: fall back to the plugin root the bootstrap hook announces at session start.

Close the session with a numbered list of pending decisions: drafted texts awaiting approval, contradictions kept, print values to validate, findings on the live site, anything you could not verify.

## STOP conditions

- **`BRAND.md` does not exist.** Run `social-identity`; a manual without it is invention.
- **The regulator is unknown.** No claim-bearing example is written until it is.
- **A figure has no `PROOF.md` row.** It does not enter the manual, however often the site repeats it.
- **A contradiction has no decision from the approver.** Show both values and mark the chapter pending; do not pick one on the client's behalf.
- **The client asks to send the manual to suppliers before approval.** Offer the draft as a draft.

## Reference files

| File | Open when |
| --- | --- |
| `scaffold/company/comunicacion/DESIGN.md` | Tokens, fonts or logo are missing from the store |
| `capabilities/social/doctrine/LAYOUT.md` | Composing any page or mock-up |
| `capabilities/social/doctrine/COPY.md` | Writing the voice chapter's examples |
| `capabilities/company/doctrine/SESSION.md` | Running the question rounds with the client |
| `capabilities/company/doctrine/REGULATORS-MX.md` | The sector's regulator is unclear, or an example makes a claim |
| `skills/social-produce/SKILL.md` | Rendering the social examples |
