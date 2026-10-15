---
name: design-ui-direction
description: Use when a new product, page or standalone surface has no design system, tokens or brand manual yet and needs its visual direction chosen — typography, colour character, overall look, "make it not look generic" — or when the owner asks for contrasting visual variants. If the product already has tokens or a component library use design-ui-system to work inside them; for spacing and grids use design-ui-layout; to copy how an existing interface looks use design-ui-inspect; for brand identity or a brand manual use brand-manual.
---

# UI direction — one committed idea where nothing has decided the look

This skill chooses the visual direction of a surface that has no system behind it: no tokens, no component library,
no brand manual. It replaces the look a model produces when nobody decides (a generic sans, a purple gradient, a
centred hero over three icon cards) with one idea tied to the product's audience and job, written as a sentence the
owner can check against a screenshot. Where a system already exists, the system wins and this skill steps aside:
distinctiveness then comes from content and composition, never from a new typeface or palette. The output feeds a
mockup (`capabilities/design/doctrine/MOCKUP.md`) and, once approved, the token work in `design-ui-system`.

## Procedure

1. **Check for a system first.** Search the repository for a tokens file, theme config, component package or design
   spec, and the company store for a brand manual. If one decides the look, stop choosing: route to
   `design-ui-system` and state which file decided it. A brand manual with no product UI fixes type, colour and logo;
   only what it leaves open (density, surface treatment, layout idea) is chosen here.
2. **Read the job.** Who opens the surface, how often, for how long, under what pressure, in which language. A daily
   operations tool and a campaign page never share a direction.
3. **Pick one idea** from the job, using the curated directions and their risks in
   `capabilities/design/doctrine/UI-DIRECTION.md` as a starting map, not a menu to paste.
4. **Decide type character**: one display voice, one reading voice, a monospace only for data or code. Test the
   reading face at body size with real Spanish copy, accents, inverted punctuation, numerals and currency.
5. **Decide colour character**: warm or cool neutrals, one committed accent and its role, light-first or dark-first.
   Values are computed later per `capabilities/design/doctrine/UI-SYSTEM-COLOR.md`, never picked by eye here.
6. **Name one signature detail** and where it repeats.
7. **Write the direction sentence**: idea, type character, colour character, signature.
8. **When the owner named no direction**, build two or three contrasting directions as variants in one mockup,
   labelled by idea, and let the owner pick on pixels (`capabilities/design/doctrine/PROCESS.md`). A named
   direction gets one mockup.
9. **Hand off**: the chosen sentence goes into the mockup's Notas rules and becomes the brief for
   `design-ui-system` (tokens) and `design-ui-layout` (grid and density).

## Always-on rules

1. An existing system always outranks a direction, including a distinctive typeface or palette this skill would
   otherwise prefer. Imposing a new look on a product with a system is a defect.
2. The owner's named direction or reference wins over the catalogue; sharpen it, do not replace it.
3. Two or more template-default pieces together (generic sans everywhere, purple-blue gradient, centred hero with
   two buttons, three icon feature cards, uniform large radius with soft shadow, gradient headline text, emoji as
   icons) mean no decision was made. Redo step 3.
4. Novelty is not the goal. Never vary the look between iterations for its own sake and never pick a face because it
   is fashionable this year.
5. At most two families, plus a monospace only for a functional need.
6. Dated fashions (glass panels everywhere, neumorphic controls, aurora mesh backgrounds, clay blobs) are at most a
   contained accent the owner asked for, never the system.
7. Every direction must still pass the measured contrast rules in `capabilities/design/doctrine/UI-SYSTEM-COLOR.md`;
   a direction that only works at failing contrast is rejected.
8. Copy in the mockup comes from or is proposed for the i18n dictionaries; the direction never invents product
   claims to fill a hero.

## STOP conditions

- **A tokens file, component library or brand manual exists.** Do not choose a direction; use `design-ui-system`
  inside that system and report which file decided.
- **The audience or job of the surface is unknown.** Research is not invented here; route to `design-ux-research`.
- **The owner's reference conflicts with the brand manual.** Ask once, through AskUserQuestion, with both readings.
- **The chosen faces lack glyphs or a web licence** for the client's language or use. Pick another before showing
  anything.
- **The request is a brand identity or brand manual**, not a product surface. Use `brand-manual`.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UI-DIRECTION.md` | Deciding whether a direction may be chosen, comparing the curated directions, choosing type character |
| `capabilities/design/doctrine/UI-SYSTEM-COLOR.md` | Turning the colour character into ramps, or checking a direction's contrast is achievable |
| `capabilities/design/doctrine/UI-SYSTEM-TYPE.md` | Checking the chosen faces against the type roles, weights and measure they must support |
| `capabilities/design/doctrine/PROCESS.md` | Deciding between one mockup and several variants, and labelling variants by idea |
| `capabilities/design/doctrine/MOCKUP.md` | Writing the variants into the mockup file and recording the direction in Notas |
