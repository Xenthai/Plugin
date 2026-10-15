# Layout

Implements: fuera del playbook (X9)

Position and space say what belongs together and what matters before a word is read. This file owns the spacing
scale, grouping, alignment, grids, responsive behaviour and density. The order of sections and steps and what is
disclosed progressively belong to `design-ux-flow`; target size, reflow and text-spacing requirements belong to
`design-ux-accessibility`; a layout here must survive both.

## Spacing scale

1. One scale for the product, on a 4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96. The product's own scale, if it has
   one, replaces this list entirely.
2. Every gap, padding and margin is a scale step. A value between steps (13 px, 18 px) is either a missing step the
   owner should approve or a mistake.
3. Spacing tokens are named by step (`--space-4`) at the primitive tier and, where the product benefits, by role at
   the semantic tier (`--space-inset-card`, `--space-stack-section`).
4. Spacing next to text is in `rem` so it grows with the user's font size; hairlines and borders stay in `px`.

## Grouping by proximity

1. Space groups first; a background shape second, when a group must act as one unit (a selectable row, a card);
   a separator line last, for dense data where space is too expensive (tables, long settings lists).
2. The gap between groups is at least twice the gap within a group: 8 inside, 16 or more between; 16 inside, 32 or
   more between. Uniform spacing everywhere plus lines to compensate is the failure.
3. A label sits closer to its own field than to the previous field. A heading sits closer to the content it
   introduces than to the content above it.
4. Never a line and a large gap for the same boundary; one of them already did the job. Separators are hairline and
   low contrast.
5. Group by how the data really is; never invent a grouping for flat data (`PATTERNS.md`).

## Alignment and shared edges

1. Few alignment edges, everything on them. An icon 2 px off the text edge, or one card padded unlike its neighbour,
   reads as noise even when nobody can name it.
2. One indentation step per level of subordination, repeated at every depth.
3. Text aligns to the start edge; numbers in tables to the end edge; a column's header aligns like its values.
4. Use logical properties (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `text-align: start`)
   for anything that depends on reading direction; physical sides only for physical geometry.
5. Controls look distinct from content: a background, a border, an underline, or a fixed control zone. A control
   styled like the text beside it is invisible; a static badge shaped like the buttons beside it collects dead taps.

## Hierarchy by importance

1. The most important content in a view takes the most prominent position (top, leading edge) and the most space.
   The number the user came for is not buried under rows of metadata.
2. Within a row, the identifying content leads; metadata and actions trail.
3. Prominence comes from position, size and space before colour. One primary action per view; how colour marks it is
   in `UI-SYSTEM-COLOR.md`.
4. Secondary actions beyond two or three go behind a menu.

## Grids and widths

1. Content width is set from the content: long text from the measure (`UI-SYSTEM-TYPE.md`), forms around 480 to
   640 px, dashboards and tables as wide as their columns need.
2. A page has a maximum content width and consistent side margins; backgrounds and media may bleed to the viewport
   edge, text and controls stay inside the margins and inside `env(safe-area-inset-*)`.
3. Column grids (4 columns on phones, 8 on tablets, 12 on desktops is a common start) serve alignment; a component
   may span any number of columns but its edges land on column edges.
4. Use CSS grid for two-dimensional layouts and flex for one-dimensional runs; use `gap`, not margins on children.
5. Full-width buttons in content are inset by the layout margin with a visible radius; edge-to-edge is for
   deliberate platform chrome that accounts for safe areas.

## Responsive behaviour

1. The owner's recorded breakpoints win, always, and are never re-argued (precedence in `skills/design/SKILL.md`).
   Mockup frames use the widths in `MOCKUP.md`.
2. With no recorded breakpoints, break where the content stops fitting: a sidebar squeezing text below its measure,
   a card grid falling below a usable column width. Device presets are not a reason. Width classes of about 600,
   840, 1200 and 1600 px are useful reference points for where layouts commonly change, not targets.
3. Collapse late. Keep the expanded structure as long as it genuinely fits; collapsing early throws away space.
4. Components adapt to their container with container queries; the page shell adapts to the viewport with media
   queries.
5. Navigation shifts by class: a bottom bar or menu on phones, a rail at medium widths, a full sidebar on wide ones;
   the same destinations in the same order in all three.
6. Test the narrowest and widest supported widths first, then the widths between, then 200 % zoom.
7. Never a horizontal page scroll; wide tables scroll inside their own container with the first column pinned when
   it identifies the row.

## Content growth and clipping

1. No fixed width or height on anything that holds text. Buttons size from their label padding; text containers
   use `min-height` and `max-width`.
2. Translation grows strings unevenly; short labels grow most. Spanish runs noticeably longer than English. Test with
   the longest real locale and with pseudo-localised strings, not a percentage budget.
3. Plan every text slot for the empty, short, typical and longest realistic value; long values wrap or truncate per
   `UI-SYSTEM-TYPE.md`.
4. A critical action is never where resizing, scrolling or the on-screen keyboard can clip it. In a scrolling modal
   the content scrolls and the action row does not.
5. Async content reserves its space (fixed aspect ratio for media, skeleton matching the final size) so nothing
   jumps when it arrives.

## Density

1. Choose density by use: comfortable for occasional and public users, compact for daily professional tools with
   repeated scanning. A product may offer both as a setting, implemented by swapping semantic spacing tokens.
2. Compact reduces padding and gaps, never target size or the space that keeps adjacent targets distinct (minimums in
   `design-ux-accessibility`).
3. Starting clearance between adjacent controls with no density system: about 8 to 12 px between bordered or filled
   controls, more around borderless icon and text buttons, whose only boundary is the space.
4. An established, usable density in the product is kept; do not inflate it to match these starting points.

## Before you finish

- Every spacing value is a step of the product's scale.
- Between-group gaps are at least twice the within-group gap; no line duplicates a gap.
- Edges are shared; direction-dependent spacing uses logical properties.
- The most important content holds the most prominent position; one primary action per view.
- Recorded breakpoints were used, or breaks sit where content stops fitting; components use container queries.
- No fixed sizes on text; longest-locale and empty states checked; no critical action can be clipped.
- Density matches the use and never shrinks targets.
