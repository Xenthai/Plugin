---
name: hub
description: Entry point for a company's internal knowledge hubs — the area guides (Producto, Operaciones, Riesgo y cumplimiento, Comercial, Personas, Ingeniería, IA, Finanzas…) published as linked artifacts with one shared design. Use when someone asks which hubs or internal guides a company should have, which ones it is missing, how to organise its internal knowledge or onboarding by area, or at the start of hub work for a new company, even without the word "hub". Decides the hubs and their order, then hands off — to hub-intake to gather content, hub-build to build or update one, hub-atlas when the hub is Ingeniería and there is a repository, hub-audit to review published hubs. For a process inventory use process-map; for brand documents use brand.
---

# Hub — router and discovery

You decide **which hubs** a company needs and **in what order**, with a reason for each, and you
hand the next step to the skill that owns it. You build no hub here and gather no content.

## Step 1 — The binding

Hub work belongs to one company. Read `.company.json` up the tree and say the bound company's name
and id in your first reply. No manifest, a newer `schema_version` or missing fields: stop and say
which, exactly as `social` does; never infer a company from a folder name. Hub files live in that
company's store under `hubs/`: `hubs/MAPA.md` for the map, `hubs/<slug>/` for each hub.

## Step 2 — Route what is already decided

| The request | Hand off to |
| --- | --- |
| A questionnaire for an area, or answers, minutes or manuals to turn into a hub | `hub-intake` |
| Build, rebuild, migrate or update a hub, or add one to the siblings' switcher | `hub-build` |
| Diagrams or an engineering hub from a repository | `hub-atlas` |
| Review published hubs, monthly maintenance, "are the hubs current?" | `hub-audit` |
| Which hubs to make, which are missing, a new company | stay here, Step 3 |

If `hubs/MAPA.md` exists and the request is for a hub it already lists, hand off without redoing the map.

## Step 3 — The company profile

Build a short profile before proposing anything. Take what exists first: `00-PERFIL.md`
(`company-profile`), `01-empresa.md`, `01-oferta/`, `03-procesos/`, `comunicacion/`, hubs already
published, the company's site. Ask only what would change the recommendation.

| Datum | Why it matters |
| --- | --- |
| What it sells, to whom, how it charges | Defines the core processes |
| Sector and country | Activates the sector pack and the regulatory topics to confirm |
| Regulated? Which legal form? | A Riesgo y cumplimiento hub becomes high priority |
| Size and growth (people, hires coming) | Many joins raise Personas |
| Areas and who leads each | No owner, no hub; write down whom to find |
| Own software? Repositories? | Enables Ingeniería, through `hub-atlas` |
| Daily AI use? | An IA hub orders rules, brand and how to ask |
| Existing hubs, manuals, wikis, documents | Never duplicated; migrated or linked |
| Tools (CRM, ERP, internal panel, chat) | Process pages are written over them |
| The organisation's confidentiality rules | Decide which hubs are company-wide and which restricted |

Without access to the site or documents, say so and work with what the person tells you.

## Step 4 — Candidates and priority

1. Read `capabilities/hub/doctrine/CATALOG.md`, then the company's pack in
   `capabilities/hub/doctrine/SECTORS.md`. Start from the catalogue, remove what does not apply, add
   what the sector asks for.
2. Score each candidate with `capabilities/hub/doctrine/SCORING.md` and order by score. Adjust by
   hand only with an explicit reason.

## Step 5 — The map

Write `hubs/MAPA.md` in the store, es-MX, *usted*, with:

1. **Recommendation in one sentence:** how many hubs, which first and why.
2. **Hub map** (table): Hub · Para quién · Qué resuelve · Prioridad · Responsable a buscar ·
   Sensibilidad (toda la empresa / restringido) · Fuentes que ya existen.
3. **Waves:** 1 (now), 2 (next), 3 (when sources exist). One line per hub with its reason.
4. **Per hub:** 4–8 proposed pages, each as a question.
5. **Hubs discarded or merged** and why.
6. **Open questions** blocking the decision.

Existing hubs go in the map as "existentes", with what is missing or extra in them. If the operator
wants it for review, a Doc is a derived copy of `MAPA.md`, never its source.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability hub --why "hub map for the company"
```

## Always-on rules

- **Nothing regulatory is asserted.** "In this sector there are usually anti-money-laundering and
  data-protection obligations; confirm with [role]" — never a law, deadline, amount or authority as
  fact without a source the company gave.
- **Public and internal never mix.** A hub used with customers takes only what the company published.
- **Every hub needs an owner.** Without one it stays in wave 2 until there is one.
- **The next step is concrete:** offer `hub-intake` for wave 1's questionnaire, and `hub-atlas` if
  there is an engineering hub.

## STOP conditions

- **No company is bound.** Ask which company and where its store lives.
- **The request is the process inventory itself** (what processes exist, who owns them). That is
  `process-map`; an Operaciones hub explains processes, it does not inventory them.
- **The request is the brand or its manual.** That is `brand`.
- **No hub has an owner.** Deliver the map with every hub blocked and the owners to find as the open
  question; do not hand off to `hub-intake`.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/hub/doctrine/CATALOG.md` | Proposing candidate hubs |
| `capabilities/hub/doctrine/SECTORS.md` | The company's sector is known |
| `capabilities/hub/doctrine/SCORING.md` | Ordering candidates into waves |
| `capabilities/social/doctrine/COPY.md` | Writing the map's client-facing prose |
