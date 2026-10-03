# Naming doctrine — one structure for every name the plugin puts on something

Implements: none (mechanics)

A routine, a Cowork chat, a Claude Code session and an artifact are all found by name, and a name
found by guessing which of several formats applies is a name nobody finds. There is one structure and
no other.

```
Emoji Empresa: Tipo: [Subtipo:] Nombre
```

1. **Empresa** is always first: `Xenth AI` for the studio's own work, otherwise the client's name.
   Nothing here supplies a default for work that belongs to no company; `formatName` refuses an empty
   Empresa until that is decided.
2. **Tipo** comes from the table below, and the **Emoji** is the Type's, never chosen separately.
3. **Subtipo** is optional and at most one. In routines, chats and sessions it is the area (`Gmail`,
   `Zapier`, `Higgsfield`); in an artifact it is the kind of piece (`Plantilla`).
4. **Nombre** is the concrete topic, short, in the company's language.
5. The separator is `: ` and no segment contains it, so a name reads back unambiguously. One emoji,
   first, followed by a space. The old ` - ` separator no longer exists in names.

Gmail is not a Type. A scheduled Gmail job is a `Rutina`, a Gmail audit or build is `Infra`, and
`Gmail` is the Subtipo either way.

## The table

`lib/naming.mjs` exports this table as `TYPES`, and `test/naming.test.mjs` fails if the two differ.
The code is the source; edit it there first.

| Tipo | Emoji | Covers |
| --- | --- | --- |
| Rutina | ⏱️ | Scheduled automations |
| Infra | 🖥️ | Infrastructure, development, testing, technical tasks, handoffs and internal documentation |
| Proyectos | 📚 | Work per client or project |
| Costos | 💰 | Costs, finance, analysis, viability ideas |
| Contenido | 🎨 | Higgsfield, images and video, content branding |
| Canvas | 🧩 | Design artifacts |
| Slides | 📊 | Presentations |
| Docs | 📄 | Documents |
| Web | 🌐 | Pages and sites |
| Sheets | 📈 | Spreadsheets |

All ten emojis are confirmed.

## Valid

- `⏱️ Xenth AI: Rutina: Gmail: Organizar correo`
- `🖥️ Xenth AI: Infra: Zapier: WhatsApp Skill`
- `📚 Capital X: Proyectos: Inicio`
- `💰 Xenth AI: Costos: Automatización: Comparativa de plataformas`
- `🎨 Xenth AI: Contenido: Higgsfield: Cinematic Promo`
- `🧩 Xenth AI: Canvas: Manual de marca`
- `📊 Xenth AI: Slides: Presentación comercial`
- `📄 Xenth AI: Docs: Plantilla: Propuesta comercial`
- `🌐 Xenth AI: Web: Manual de marca`

## Invalid

- `Rutina: Gmail - Organizar correo` — the retired structure: no emoji, no Empresa, ` - `.
- `Xenth AI: Canvas: Manual de marca` — no emoji.
- `⏱️ Xenth AI: Automatización: Gmail` — a Tipo outside the table.
- `🎨 Xenth AI: Rutina: Gmail` — an emoji that is not the Type's.
- `⏱️ Xenth AI: Rutina: Gmail: Fase 2: Organizar correo` — more than one Subtipo.

## Where this applies

- **Session title.** `hooks/bootstrap.mjs` sets `formatName({ company, type: "Proyectos", name: "Sesión" })`
  when a company is bound, and no title when none is.
- **Routines and scheduled tasks**, and the **Google Docs** generated for client review, take a name
  from this structure.
- **Artifacts** (Canvas, Slides, Docs, Web) take it as their title.
- **Files and exports.** `:` is not allowed in a file name on Windows or in Drive, and an exported
  artifact never carries the emoji, which belongs to the title inside the app. `fileName(title, ext)`
  derives it: `🧩 Xenth AI: Canvas: Manual de marca` exports as `Xenth AI - Canvas - Manual de marca.pdf`.
  A file a skill produces itself keeps the convention that skill states.

## What the plugin cannot do

Existing chats and routines keep their names; the plugin cannot rename them, so that is done by hand
in the app. If Cowork or Claude Code impose their own title format, this rule stops being enforceable
where they set the title.
