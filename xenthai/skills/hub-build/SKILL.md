---
name: hub-build
description: Builds, checks and publishes a company's internal hub (Hub de Producto, de Operaciones, de Ingeniería, de IA, de Personas, Comercial, de Riesgo…) as a multi-page artifact with the company's shared hub design. Use whenever someone asks to build, redo, migrate or update a hub, portal, wiki, manual or internal area guide, "otro hub con el mismo diseño", or to turn a filled questionnaire, documentation or diagrams into a navigable guide for the team, even without the word "hub" — and when a new hub must be added to the existing hubs' switcher. Run after hub-intake has produced content.json; if no content exists yet, hub-intake comes first, and for an engineering hub's diagrams hub-atlas does.
---

# Hub build

A hub is an area's internal guide: several pages with one design, walked from a sidebar and linked to
the company's other hubs by a switcher in the top bar. The **design** is a fixed template, the
**brand** is `brand.json`, the **content** is `content.json`, and an engine joins them — so every hub of
a company looks the same and changing one never breaks the others.

The binding is `hub`'s Step 1. Each hub lives in the store at `hubs/<slug>/`: `brand.json` (shared,
at `hubs/brand.json`), `content.json`, the built `index.html`, `img/` and `d/`. The engine writes
`index.html` the way the render engine writes a PNG; the JSON inputs are written by hand.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## Before starting: what you need

Gather this before writing. What cannot reasonably be derived is asked; never filled by assumption.

| Input | Where it comes from | If missing |
| --- | --- | --- |
| Brand: colours, fonts, light/dark logos, banner textures | `comunicacion/BRAND.md` and `DESIGN.md`; an existing hub | Ask for the design system; last resort the name as wordmark and neutral colours, said out loud |
| Hub name, owner, audience, confidentiality | The operator; `hub-intake`'s questionnaire | Ask. Without an owner the footer reads `[por confirmar]` |
| Each page's content | `content.json` from `hub-intake`; `hub-atlas` for engineering | Mark what is missing `[por confirmar]` |
| Sibling hubs and their urls | The operator's artifact list; existing hubs | Ask; without them there is no switcher |
| The company's rules on sensitive information | The organisation's instructions; an IA hub | The defaults of `capabilities/hub/doctrine/WRITING.md` |

If the company already has published hubs, **read one first**: its design, tone and switcher win over
the template. Copy its tokens into `brand.json` (`light`/`dark`) and its textures into `banner_images`.

## Flow

1. **Brand → `brand.json`.** Start from `capabilities/hub/engine/examples/brand.example.json`. Fields
   and derivation in `capabilities/hub/doctrine/SCHEMA.md`.
2. **Structure → `content.json`.** Groups and pages before prose (usually 6–14 pages); the
   introduction first. Schema in `SCHEMA.md`, worked example in `capabilities/hub/engine/examples/content.example.json`.
3. **Writing.** `capabilities/hub/doctrine/WRITING.md`: titles as questions, short sentences,
   `[por confirmar]` instead of inventing, nothing confidential. Every page closes with something actionable.
4. **Images and diagrams** are support files (`img/…png`) in `figure` blocks; an interactive version
   (an Archify HTML) goes in `d/…html` and is linked with `interactive`. Never in iframes, never with
   `target="_blank"` (`capabilities/hub/doctrine/PITFALLS.md`).
5. **Build:**
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/capabilities/hub/engine/build.mjs" --brand hubs/brand.json --content hubs/<slug>/content.json --out hubs/<slug>/index.html
   ```
   Read every WARNING — contrast, links to pages or files that do not exist, images without alt
   text, a hub without owner. Fix and rebuild. A refusal (exit 1) wrote nothing.
6. **Check it as the viewer will show it:**
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/capabilities/hub/engine/check.mjs" hubs/<slug> --out <screenshots-folder>
   ```
   It wraps the page in the viewer's skeleton, walks every page on desktop, phone and dark, and fails
   on errors, overflow, broken images or links to missing files. **Look at the screenshots** before
   publishing. Exit 2 with no browser: take at least one screenshot with what is available, and say so.
7. **Publish** per `capabilities/hub/doctrine/PUBLISHING.md`: `index.html` as the page, `img/` and
   `d/` in `files`. Confirm with the operator before the first publish.
8. **Connect the siblings.** Add the new hub to every existing hub's switcher with
   `capabilities/hub/engine/switcher.mjs`, changing only that (`PUBLISHING.md`).
9. **Deliver.** The link, what is missing (`[por confirmar]`, owner, whom to share with), and that the
   artifact is born private: the team sees nothing until it is shared.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability hub --why "hub <slug> built and published"
```

## Later changes

- A small text change: edit `content.json`, rebuild, publish to the **same path** (keeps the url).
- A design change for every hub: change `capabilities/hub/engine/shell.html` and rebuild every hub;
  never patch a loose one.
- A hub made without this engine: read it, rebuild its `content.json` from its HTML, work from there.

## STOP conditions

- **No content and no sources.** Route to `hub-intake`; a hub built from nothing is a hub of
  `[por confirmar]`.
- **`build.mjs` refuses** (duplicate or malformed page id, unknown block, a doctype). Fix the content;
  never edit the built HTML to get past it.
- **`check.mjs` reports problems.** Fix them before publishing; a hub that overflows on a phone or
  shows every page at once is not shipped.
- **A sibling hub belongs to someone else** and the operator has not said to change it. Write the
  exact switcher change instead and tell them.
- **A page needs a figure with no source**, or the hub would carry customer data or a credential.
  Leave it `[por confirmar]` or out.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/hub/doctrine/SCHEMA.md` | Writing `brand.json` or `content.json` — always |
| `capabilities/hub/doctrine/WRITING.md` | Drafting or rewriting any page |
| `capabilities/hub/doctrine/PITFALLS.md` | Before every publish |
| `capabilities/hub/doctrine/PUBLISHING.md` | Publishing, updating, or linking siblings |
| `capabilities/hub/engine/build.mjs --help` | The engine's flags and exit codes |
