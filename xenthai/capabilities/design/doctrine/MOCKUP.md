# The mockup contract

Implements: fuera del playbook (X9)

## One file

1. One self-contained HTML file: inline CSS, inline script, no build step, no local assets. Fonts through Google
   Fonts links; images as inline SVG or `data:` URIs.
2. The product's real tokens are copied in, never approximated: colours in the same colour space the product uses
   (oklch stays oklch), radii, shadows, font families and weights, spacing scale, shell geometry (sidebar width,
   rail width, header height, tab bar, gutters). A mockup in invented tokens approves a design nobody can build.
3. Inline script is syntax-checked with `node --check` after every edit. File is LF-only. Size budget: under 600 KB.
4. Published as a private artifact. Every round republishes to the same URL; never a new link for a new version.

## Frames

| Axis | Values | Rule |
|---|---|---|
| Breakpoint | 375, 1024, 1280 | One labelled frame each, at that exact width; the 1024 frame shows the rail, the 1280 the full sidebar |
| Theme | Light and dark | A toggle on the page; every frame works in both, no dark-only token |
| Data | Empty state, volume 8, volume 30 | Toggles, so the owner sees the surface when sparse, normal and dense |

1. Frames share one component set; a breakpoint frame is a container width, not a copy of the markup.
2. Interactive states the owner will ask about are reachable: popover open, undo window running, selected row,
   decided list, error toast.
3. A frame the owner did not ask for is cut. Three frames per variant is the default.

## Data

1. Seed data is the product's own mock-mode data. Never lorem ipsum, never round numbers invented for neatness.
2. Anything mock-only (a person's name, a time, a count) is declared in a Data paragraph of the Notas section.
3. A placeholder for something that does not exist yet is an empty slot with a label, never a fake chart or number.
4. Images the product would show (post media) are a labelled slot: "Image 1080 x 1350", not a stock photo.

## Copy

1. Every user-visible string is traced to the product's i18n dictionaries before the owner sees it. A sentence that
   states a fact (what a button does, what is saved, who is notified) is checked against the code.
2. A string that does not exist yet is wrapped in `data-new-copy` so it can be highlighted and counted.
3. A «Copy nuevo» table lists each new string with its proposed dictionary key, both locales' values, and where it
   appears. The key follows the dictionary's existing naming.
4. Client-facing copy is in the client's language; everything else in the file (labels of the mockup itself,
   comments, Notas) is English.

## Notas section

The last section of the page, always present:

| Part | Content |
|---|---|
| Rules | The decisions the frames embody, one line each, each one checkable against the build |
| Motion | One paragraph: what moves, how long, which token, what the reduced-motion policy removes |
| Data | Provenance: which seed rows are real mock data, which text is mock-only |
| Version | vN, date, and the comments of the round it answers, by the owner's own words |

## Before you finish

- Tokens, geometry and fonts match the product, in both themes.
- Three breakpoint frames, light and dark, empty and two volumes work.
- `node --check` passes on the inline script; LF; size under budget.
- Every new string is `data-new-copy` and in the «Copy nuevo» table; every old string traces to a dictionary key.
- Notas carries rules, motion and data provenance.
- Republished to the same URL, and re-read whole before publishing (`PROOF.md`).
