# Type system

Implements: fuera del playbook (X9)

Type is a system of a few roles, each a fixed set of size, line-height, weight and tracking. Choosing the family
belongs to `UI-DIRECTION.md` and only where no system exists; this file sets how type renders once a family is known.
Contrast of text against its background is measured per `UI-SYSTEM-COLOR.md`.

## Families and faces

1. Two families at most, a third only for a functional monospace. Hierarchy comes from size and weight inside them,
   not from more families.
2. Load every weight and style the design uses. A missing face is synthesised by the browser and looks wrong; turn
   synthesis off (`font-synthesis-weight`, `font-synthesis-style`) only after confirming every needed face loads
   across the fallback stack.
3. Web files are WOFF2. Declare a fallback stack whose metrics are close (`size-adjust`, `ascent-override` on the
   fallback `@font-face`) so the swap does not shift layout.
4. Weights below 400 are for display sizes only (about 28 px and up); below 18 px stay at 400 or heavier.
5. A family with `Text` and `Display` cuts uses each at its size. A variable font with an optical-size axis gets
   `font-optical-sizing: auto` so small text gains sturdier strokes and wider spacing automatically.

## Properties before raw tags

Use the CSS property when one exists: `font-weight: 650`, `font-optical-sizing`, `font-variant-numeric`,
`font-variant-caps`, `font-variant-position`. They keep working on a static fallback; `font-variation-settings` and
`font-feature-settings` silently do nothing there. Raw tags are reserved for custom axes (`GRAD`) and numbered
features (`ss01`, `cv11`) with no property, and their meaning is checked in the font's own documentation.

## The scale

1. A small set of named roles, each a bundle: size, line-height, weight, tracking. Name by use (`text-title`,
   `text-body`, `text-caption`), so a role is one decision, not three.
2. Starting point for a product interface with no scale yet: display about 36 px, title 24, heading 18, body 16,
   small UI 14, caption 13. A ratio between steps of roughly 1.2 to 1.333 keeps steps distinct; marketing pages may
   run a larger ratio at the top end only.
3. Sizes are in `rem` so a user's larger default font size scales the whole interface; spacing near text scales with
   it (`UI-LAYOUT.md`).
4. Fluid display sizes use `clamp(min, preferred, max)` with a `rem` component in the preferred value, so zoom still
   enlarges them; body text stays fixed per breakpoint.
5. Heading levels map to descending roles. A child heading never renders larger or heavier than its parent; deep
   levels may share a size if weight or spacing separates them. Pick the heading element from document structure,
   then style it; never pick an element for its default size.
6. Emphasis inside a role is one weight step up, not a size change.

## Line-height and tracking by size

| Text | Line-height (unitless) | Tracking |
|---|---|---|
| Display, 32 px and up | 1.05 to 1.15 | Slightly negative, about -0.01em to -0.025em, more negative as size grows |
| Titles and headings | 1.2 to 1.3 | 0 to slightly negative |
| Body and long text | 1.45 to 1.65 | 0 |
| Small UI and captions, 12 to 14 px | 1.35 to 1.5 | 0 to slightly positive |
| Uppercase labels | 1.2 to 1.4 | Positive, about 0.04em to 0.08em |

1. Line-height is unitless so it scales with size. Any text that can wrap to three or more lines gets at least 1.4,
   including card descriptions in tight rows.
2. Tracking is never one value for all sizes. A variable font with optical sizing already adjusts; do not add
   tracking on top without checking.
3. Scripts and languages with tall diacritics need the upper end of the line-height range; Spanish capitals with
   accents clip under very tight display leading, so test with real accented headlines.

## Measure

Long-form text is capped between 45 and 75 characters per line, 60 to 70 as the target; set it with `max-width` in
`ch` or `rem` and recheck when the body size changes. UI strings (labels, table cells) are not long-form and are not
capped this way. Justified text is for print-like editorial layouts only; interfaces align to the start edge.

## Numerals

1. Any number that changes in place (timers, counters, prices, totals, live metrics) and every numeric table column
   uses `font-variant-numeric: tabular-nums`, so digits stop shifting the layout.
2. Prose numbers may stay proportional; old-style figures suit editorial body text only.
3. Identifiers where 0 and O can be confused use `slashed-zero` when the font supports it, or a monospace.
4. Numbers in tables align to the trailing edge; currency and units are formatted by locale, never concatenated by
   hand (copy and locale formatting belong to `design-ux-copy`).

## Inputs on phones

Text inputs render at 16 px or larger on mobile viewports; below that, iOS Safari zooms the page on focus. Either
size the input to 16 px below the first breakpoint and to the design size above, or keep 16 px and scale the visual
down, with a wrapper drawing the field so its box does not shrink. Never fix it with `maximum-scale=1`, which blocks
user zoom.

## Wrapping and truncation

1. Headings: `text-wrap: balance`. Short descriptions: `text-wrap: pretty`. Neither on long-form text.
2. Any container that can receive a URL, an e-mail, an ID or a long compound word gets `overflow-wrap: anywhere` or
   `break-word`.
3. Labels, badges and button text that look broken across lines get `white-space: nowrap`, and the container must
   still allow the label to grow (`UI-LAYOUT.md`).
4. Truncation: one line with `text-overflow: ellipsis` plus `overflow: hidden` and `nowrap`; several lines with
   `line-clamp`. Truncated content that matters stays reachable in full: a tooltip, a detail view or an expand
   control. Never truncate a value the user must compare or act on (an amount, a name in a decision).
5. Copy is stored in natural case and transformed with `text-transform`; casing is never typed into dictionaries.
6. Rendered text uses real punctuation: typographic quotes, en dash for ranges, the single ellipsis character, a
   non-breaking space between a number and its unit.

## Rendering details

1. Underlines on links take position and thickness from the font (`text-underline-position: from-font`,
   `text-decoration-thickness: from-font`) with `text-decoration-skip-ink: auto`.
2. Font smoothing, if the product sets it, is set once at the root, never per component.
3. `lang` is set on the document and on any passage in another language, so hyphenation and quotes follow it.
4. Text stays selectable; `user-select: none` only on drag or gesture surfaces where selection interferes.
5. `text-box: trim-both cap alphabetic` may tighten optical centring in buttons and badges as progressive
   enhancement; layouts must still look right without it.

## Before you finish

- Two families at most (plus a functional monospace); every used weight is loaded; fallback metrics are matched.
- Every size comes from a named role; headings descend; sizes are in `rem`.
- Line-height and tracking vary by size per the table; wrapped text has at least 1.4.
- Long text is capped at 45 to 75 characters.
- Changing numbers and numeric columns use tabular figures.
- Phone inputs are 16 px or larger, without blocking zoom.
- Long strings wrap or truncate with the full value reachable; tested with real accented Spanish copy.
