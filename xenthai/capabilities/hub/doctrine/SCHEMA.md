# Hub content schema

Implements: fuera del playbook (X9)

The two inputs of `capabilities/hub/engine/build.mjs`: `brand.json` (how every hub of the company
looks) and `content.json` (one hub's pages). Read it before writing either. Worked, fictitious
examples: `capabilities/hub/engine/examples/`.

Field names are English; every value a reader sees is es-MX unless the company's hubs are in English.

---

## `brand.json`

```json
{
  "name": "Nombre de la empresa",
  "lang": "es",
  "colors": { "brand": "#0c1d66", "accent": "#fc7500", "accent_ink": "#0d0d0d" },
  "fonts": { "body": "Montserrat", "display": "Montserrat", "google": "family=Montserrat:wght@300;400;500;600;700;800" },
  "logo_light": "logo.svg",
  "logo_dark": "logo-blanco.svg",
  "banner_images": ["textura-1.webp", "textura-2.webp"],
  "light": {},
  "dark": {}
}
```

- `colors.brand`: the main colour — banner, table headers, active menu item. White on it must reach 4.5:1.
- `colors.accent`: sparse accent — the bar under the title, stat icons, the current hub underline.
  `accent_ink` is text on the accent; omitted, the engine picks black or white by contrast.
- `fonts.google`: the Google Fonts `family=` parameter (the only font host an artifact allows). `null`
  or `""` loads none.
- `logo_light` / `logo_dark`: SVG or PNG beside `brand.json`. One alone serves both themes; none
  shows the name as a wordmark.
- `banner_images`: optional banner textures, indexed by `banner.bg`. Use compressed WebP: each is embedded.
- `light` / `dark`: override any derived token (`bg`, `bg-nav`, `bg-inset`, `fg`, `fg-strong`, `muted`,
  `rule`, `link`, `link-fg`, `icon-bg`, `icon-fg`, `ok`, `warn-bd`, `warn-bg`, `bad-fg`, `note-bg`).
  This is how a new hub matches one already published.

**Where it comes from.** If the company store has `comunicacion/BRAND.md` and `DESIGN.md` (`brand`),
the colours, fonts and logos come from there and nowhere else. If the company already has hubs,
read one and copy its tokens. Only as a last resort: the name as wordmark and neutral colours, said
out loud.

## `content.json`

```json
{
  "hub": { "name": "Hub de Operaciones", "lang": "es", "owner": "Nombre", "version": "1", "date": "Octubre 2026", "internal": true, "footer_right": "Commit abc123" },
  "hubs": [
    { "name": "Hub de Producto", "url": "https://claude.ai/artifact/…" },
    { "name": "Hub de Operaciones", "current": true }
  ],
  "resources": [ { "label": "Sistema de diseño", "url": "https://…", "icon": "palette" } ],
  "i18n": { "search": "Buscar en la guía" },
  "groups": [ { "title": "Empezar", "icon": "home", "pages": [ { "…": "page" } ] } ]
}
```

- `hub.owner` is printed in the footer; missing, it reads `[por confirmar]` and the engine warns.
  `hub.footer` (HTML) replaces the whole footer.
- `hubs`: the switcher, in order. The order is **the same in every hub of the company**; exactly one
  carries `"current": true`. Fewer than two hubs shows no switcher.
- `resources`: links at the foot of the sidebar (design system, templates, repository, manual).
- `i18n`: overrides interface strings (`I18N` in `build.mjs`; Spanish and English exist).

### Page

```json
{
  "id": "aprobar-solicitud",
  "title": "Aprobar una solicitud",
  "icon": "check-shield",
  "banner": { "crumb": "Procesos", "crumb_icon": "route", "h1": "¿Cómo se aprueba una solicitud?", "lede": "Una o dos frases.", "icon": "check-shield", "bg": 0 },
  "sections": [ { "title": "¿Qué se revisa?", "icon": "check", "blocks": [] } ]
}
```

- `id`: lowercase, digits, hyphens. It is the page's `#anchor` and **never changes once published** —
  changing it breaks every link to it.
- `title`: short menu text. `banner.h1`: the question the page answers.
- `banner.bg`: index into `banner_images`; alternate textures between pages.
- `icon`: an id from `capabilities/hub/engine/icons.svg` without the `i-` prefix.

### Blocks

Every text field accepts three inline forms: `` `code` ``, `**bold**`, `[label](url)`. Everything else
is escaped. Links: `#id` to another page of the hub; `https://…` opens a new tab; a relative path
(`d/x.html`) opens in the viewer's own frame.

| type | Fields | For |
|---|---|---|
| `lede` | `text` | A section's first, larger sentence |
| `p` | `text` | Paragraph |
| `src` | `text` | Small note (source, owner) |
| `checks` | `items[]`, `tone`: `good`\|`bad` | A list of facts, or of risks |
| `aside` | `tone`: `info`\|`caution`, `title`, `text`, `icon` | Notice. `caution` for confidentiality and `[por confirmar]` |
| `cards` | `items[]`: `title`, `text`, `page` or `url`, `icon`, `tone` | Navigation to pages or resources |
| `stats` | `items[]`: `value`, `label`, `icon` | 2–4 key figures, never confidential, each with a source |
| `flow` | `items[]`: `title`, `text`, `icon` | Ordered steps (3–6); the last carries the accent |
| `table` | `columns[]`, `rows[][]`, `term_first` | Comparable data; first column bold by default |
| `figure` | `src`, `alt`, `caption`, `interactive`, `tall`, `icon` | Enlargeable diagram or screenshot; `tall` for very tall images |
| `paths` | `items[]`: `path`, `text` | Where something lives: code paths, folders, systems |
| `faq` | `items[]`: `q`, `a` | Collapsible questions |
| `chips` | `items[]` | Short tags (tools, terms) |
| `html` | `html` | Last resort; the engine warns. Review it by hand |

An unknown `type` refuses the build rather than dropping the content.

### Icons

home, building, check-shield, lock, layers, palette, message, terminal, route, puzzle, file, slides,
layout, component, globe, clock, percent, zap, device, user-plus, upload, badge-check, money, eye,
paper-off, trend, users, key, chart, map, server, check, x, info, alert, copy, arrow-right,
arrow-left, external, chevron, search, sun, moon, monitor, menu, pen, sparkle, target, help, share,
type, image, hash, present, book, code, database, git, tree, states, zoom, briefcase, scale, headset, cart.

To add one, add a stroke-only `<symbol id="i-name" viewBox="0 0 24 24">` to `icons.svg`.

## Before you finish

- Every page id is final; none of a published hub was renamed.
- Exactly one hub in `hubs` is current, and the order matches the other hubs.
- Every `stats` value has a source; none is a confidential figure.
