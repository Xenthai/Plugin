---
name: brand-manual
description: Build or revise a company's brand manual from its store and its code — a Design canvas, a Slides deck and a versioned PDF — with brand applications on request. Use for a brand manual, brand book or "manual de marca", when a printer or agency needs specifications, or after a brand decision. Requires BRAND.md; if it is missing use social-identity first, and for voice alone use social-voice.
---

# Brand manual

One manual, three outputs, one source of content:

| Output | Type | Name | What it is for |
| --- | --- | --- | --- |
| **Manual** | Design | `🧩 <Empresa>: Canvas: Manual de marca` | The editable manual. One artboard per page, letter landscape (1056 × 816). The client fixes a word without asking us |
| **Presentation** | Slides | `📊 <Empresa>: Slides: Manual de marca` | The same manual told in 20–28 slides at 1920 × 1080. Downloads as .pptx or PDF |
| **PDF** | file | `<Empresa> - PDF - Manual de marca v<N> (borrador).pdf` | Rendered from the same page HTML as the canvas. Goes to the store and to the chat |

Both artifacts install the company's **Design System** artifact (`🧩 <Empresa>: Canvas: Sistema de diseño`). If
the company has none, build it first (step 4): it keeps the next deck, proposal or post on brand
without reopening the manual.

Applications and the public web page are **not** default output. Offer them at the end and build
only what the operator picks, from `capabilities/social/doctrine/BRAND-APPLICATIONS.md`. For voice alone use social-voice; for first-time
identity capture use social-identity.

## Naming — every artifact and file

Artifact titles follow `capabilities/naming/doctrine/naming.md`; the emoji comes from the Tipo.

| Output | Title |
| --- | --- |
| Manual (Design) | `🧩 <Empresa>: Canvas: Manual de marca` |
| Presentation (Slides) | `📊 <Empresa>: Slides: Manual de marca` |
| Design System | `🧩 <Empresa>: Canvas: Sistema de diseño` |

The Design System has no Tipo in the table; Canvas is a stopgap until the operator decides.
The title goes in the `title` param, in `canvas.json` / `deck.json`, in a Web page's `<title>`, or in a Doc's
`container.create.name`. An artifact under another name is renamed in the publish that edits it.

**Files** cannot carry `:` (Windows, Drive), and an exported artifact never carries the emoji:
`<Empresa> - <FORMATO> - [<Grupo> - ]<Nombre>[ v<N>][ (borrador)].<ext>`, no emoji.
 Example: `Xenth AI - PDF - Manual de marca v1.1 (borrador).pdf`; images carry their size.

Files a site serves keep web slugs, and store documents keep their canonical names (`DESIGN.md`,
`DECISIONES-MARCA.md`).

## 0. Bind the company

The guard refuses store reads and writes until a `.company.json` exists in the working tree. On
`no-manifest`, find the store's `.company.json` in Drive, decode it into the working directory and
continue. Company documents keep the language it declares.

## 1. Gather — sources outrank memory

Read, in this order of authority. When two disagree, the higher one wins and the lower one gets
corrected in step 8.

1. **The company's code**, if it has a site repo: its brand package (tokens, fonts, logo SVGs,
   diagram components), its i18n strings and its lint or sweep rules. What is shipped is what the
   public sees.
2. **Store documents**: `DESIGN.md`, `BRAND.md`, `DECISIONES-MARCA.md`, `PLAYBOOK.md`, `PROOF.md`,
   `PRICING.md`, `SERVICES.md`, `METHOD.md`, `GOVERNANCE.md`, `EXAMPLES.md`, any social or video
   docs (`VIDEOS.md`, `CINEMATICS*.md`) and the `social/`, `videos/`, `identity/` folders.
3. **Existing artifacts** of the company (`Artifact list`): Design System, earlier manuals, kits.
4. What the operator tells you.

Never redraw a signature graphic (a diagram, a pattern, a lockup): take its geometry from the
component that renders it in production and export it to SVG. Logos come from the files, cleaned
to plain paths, never typed in a font.

Record every discrepancy (a token that differs, a name spelled two ways, a ratio that does not
match, two docs giving different safe zones or footers). Each one becomes a decision in step 2 or
an open item in the report. When two store docs disagree and nobody can answer, the more recent
and more specific one wins; log it as a decision "por jerarquía de fuentes" marked "confirmar".

## 2. Decide — ask before building

Use AskUserQuestion until there is no real ambiguity left, one question per decision, the
recommended option first:

- Display face and how it is set (width axis, weight, case).
- Palette source when the code and DESIGN.md disagree.
- **How the name is written in prose** versus how the logotype reads. If the repo enforces the
  other spelling, say so in the question.
- Scope: strategy and voice · stationery and documents · social and presentations · digital
  channels.
- Who drafts mission, vision and values (us as a proposal, or the client).
- Sub-brands: logo, descriptor only, or nothing.
- Positive or negative per medium (screen, print, documents).
- Register per channel (tú / usted).
- Whether principles or values merge with an existing playbook.
- For stationery: the name and title that sign (short name or legal name), and whether the
  address prints (city only on card and signature, full address only on letterhead, or none).
- Credentials or partner badges in sales and social material: in or out.

Write each answer to `DECISIONES-MARCA.md` (number, date, who decided, decision, status) before
building.

## 3. Write the content

Write the manual as text first, in the company's language and voice. Typical chapters:

1. Portada · contenido
2. Estrategia: tesis, propósito, misión, visión, principios, personalidad, propuesta de valor,
   lo que se puede afirmar (each public figure needs a row in `PROOF.md`)
3. Voz: registro por canal, vocabulario (sí / no), ejemplos antes y después
4. Logotipo: versiones, construcción, área de respeto, mínimos, positivo y negativo, usos
   incorrectos (shown, not described)
5. Color: tokens with HEX, RGB, CMYK and Pantone approximations, measured WCAG contrast, the
   paper theme
6. Tipografía: three families, three jobs, Office fallbacks
7. Diagrama o gráfico de marca, iconografía, imagen
8. Aplicaciones: papelería, documentos, redes (with platform safe zones), presentaciones,
   canales digitales
9. Cierre: pendientes, contacto, versión, estado (borrador / aprobado)

Rules that bite:

- Run the company's brand sweep over every string: banned words (for Xenth AI: "humano",
  "transformación digital", "potenciar", "sinergia", "caso de uso", tool names such as Claude or
  n8n in sales material, emoji), the name spelling, client names without written permission,
  outcome metrics without proof.
- Compute contrast; never estimate it. A colour that fails 4.5:1 for body text on its ground is
  documented as decorative only.
- Mark proposals as proposals. Mission, vision and merged principles drafted by us carry
  "Propuesta" until the client approves them.
- A decision made later in the session (a name, an address) is pushed into every page that shows
  it, the "pendientes" page included, in all three outputs.

## 4. Design System artifact (once per company)

`Artifact quickstart` with `intent: "other"`, then create from the **Design System** type, named
`<Empresa>: Design System`. Put under `project/`:

- `tokens.json`, `design-system.json`, `README.md` (voice, color, type, form, mark, icons, image,
  written as rules, not as description)
- `fonts/` with the variable font files and their OFL licences (the plugin ships Archivo, Hanken
  Grotesk and JetBrains Mono in `${CLAUDE_PLUGIN_ROOT}/capabilities/social/engine/fonts`)
- `assets/` logos (positive and negative), the diagram SVG
- `components/<Name>/preview.html` cards (`<!-- @dsCard height=… -->`) for cover, lockups,
  swatches, type, diagram
- `impreso.md`, `diagrama.md` for medium-specific rules

Publish with `root` set to the project folder. Reuse this artifact from then on; never make a
second one for the same company.

## 5. Build the Design canvas (the editable manual)

Create from the **Design** type with `title: "🧩 <Empresa>: Canvas: Manual de marca"` and
`auto_open: "after_first_write"`. Install the design system with `files` copy entries:
`"project/ds/<slug>/tokens.json"` and `"project/ds/<slug>/fonts/<file>"` →
`{"artifact": "<design system url>", "path": "project/…"}`, plus the `designSystems` record in
`canvas.json`.

- `Main.dc.html` is the cover; then `P02-Contenido.dc.html`, `P03-…`, named after the page so the
  client finds it.
- Each file is a full document with `<script src="./support.js">`, `<x-dc>`, a `<helmet>` holding
  the shared `@font-face` (from `ds/<slug>/fonts/`) and `:root` tokens, one `.page` of 1056 × 816,
  and the `data-dc-script` block.
- Same HTML and CSS as the PDF pages (step 7), so an edit in the canvas and a fix in the PDF are
  the same fix.
- Inline SVG for logos and diagrams; on misuse examples set `style="fill:…"` inline, or the class
  rule overrides the attribute and the "wrong" version shows the right one.

## 6. Build the Slides deck (the presentation)

Create from the **Slides** type with `title: "📊 <Empresa>: Slides: Manual de marca"` and follow the
SKILL.md it returns. Constraints learned:

- Canvas 1920 × 1080; no text under 24 px.
- Inline CSS only, from the type's subset. `font-stretch` is not supported: load the expanded cut
  from a Google Fonts href with the width axis (`Archivo:wdth,wght@116,600..700`) and name it in
  `font-family`.
- Install the design system: `project/ds/<slug>/tokens.json` copy entry plus the `designSystems`
  record in `deck.json`.
- Generate slides from a script (one function per layout: cover, divider, two-column, table,
  swatches, logo grid, diagram, closing) so the deck regenerates after a content change.
- 20–28 slides. A table that does not fit at 24 px is split, never shrunk.

## 7. Render the PDF

Same page HTML as step 5, concatenated into one document, rendered with Playwright,
`printBackground: true`, page 11 × 8.5 in. Before writing the PDF the render script must:

1. Wait for `document.fonts.ready` and assert each family with `document.fonts.check("700 20px
   Archivo")` and so on. Fail on any font not `loaded`: a fallback face is a different brand.
2. Report elements that cross the footer or the right margin, and any clipped scroll box. Zero
   issues, or fix and rerun.
3. Screenshot every page and **look at the screenshots** before delivering: empty-looking pages,
   wrong misuse examples and overwritten footers do not show up in any automated check.

Name it per the naming section; bump `v<N>` on every delivered revision; drop "(borrador)" only
when the client approves.

## 8. Write back to the store

- New `DESIGN.md`, `BRAND.md`, `DECISIONES-MARCA.md` (and `PLAYBOOK.md` if principles changed)
  aligned with what the manual says.
- Drive here can only rename and create: `update_file` changes title and parent, never content,
  and a parent change fails on permissions. To revise a document, rename the old one
  `<NAME> (<fecha> v<N>, obsoleto).md`, then create the new one under the canonical name
  (`text/markdown`, `disableConversionToGoogleType: true`). Never trash a document with content.
- Upload the PDF next to them.
- Check cross-references (§ numbers) after renumbering.
- Append the session to the journal with `${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs`.

## 9. Report

In the operator's language, under their formatting rules:

- Each output by its name, with what it is for. Artifacts are private until shared.
- What changed in the store, file by file.
- Open decisions from the discrepancy list, each with a recommended answer.
- One next action that takes under two minutes.

## STOP conditions

- **`BRAND.md` does not exist.** Run `social-identity`; a manual without it is invention.
- **A figure has no `PROOF.md` row.** It does not enter the manual, however often the site repeats it.
- **Two sources contradict each other and the approver has not decided.** Show both values and mark the chapter pending.
- **The client asks to send the manual to suppliers before approval.** Offer the draft as a draft.

## Reference files

| File | Open when |
| --- | --- |
| `capabilities/naming/doctrine/naming.md` | Naming any artifact or Doc |
| `capabilities/social/doctrine/BRAND-APPLICATIONS.md` | The manual is delivered and applications or the public page are on offer |
| `capabilities/social/doctrine/LAYOUT.md` | Composing any page or board |
| `capabilities/company/doctrine/REGULATORS-MX.md` | The regulator is unclear or an example makes a claim |
