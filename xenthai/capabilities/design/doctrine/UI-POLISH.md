# Interface polish

Implements: fuera del playbook (X9)

The static finish that makes an interface read as deliberate: radii, alignment, surfaces, materials, icons and the
feedback of a press. The product's tokens and component library win over every value here; `PATTERNS.md` holds the
rhythm the owner already approved. Hit and touch target sizes belong to the `design-ux-accessibility` skill, contrast
measurement to `design-ui-system`, and every moving part to `design-ui-motion`.

## Concentric radius

1. A rounded box inside a rounded box takes the parent's radius minus the inset between them (`PATTERNS.md`). The
   same radius on both is the most common reason a card "looks off".
2. When the subtraction reaches 2 px or less, the inner box is square-cornered or takes the smallest radius token.
3. Past about 24 px of inset, or with unequal insets, the two are separate surfaces: choose each radius on its own.
4. A pill (radius half its height) inside a pill stays a pill.

## Optical alignment

1. Centre what the eye sees, not the box. When a centred result looks wrong, it is wrong.
2. A button with a leading or trailing icon takes about 2 px less padding on the icon side.
3. A play triangle sits about one twelfth of its width right of geometric centre.
4. An asymmetric glyph (star, arrow, caret) is fixed in its SVG viewBox first; a nudge in the component is the
   fallback.
5. Text in a pill or badge centres on its cap height, not its line box (trim the leading where the engine supports
   it).

## Surfaces

1. **Shadow for elevation, border for structure.** A border that exists only to lift a card becomes a layered
   transparent shadow: a 1 px ring, a tight contact shadow, a wide ambient one, at low alpha so they adapt to any
   background. Dividers, table cells, separators in dense UI and selected or focus states stay borders.
2. A form field keeps a border: it is a boundary the user must find, and its contrast is measured in
   `design-ui-system`.
3. The levels, their shadow colour and the dark-theme rule (lighter surface, not shadow) are the elevation scale in
   `capabilities/design/doctrine/UI-SYSTEM-TOKENS.md`. A one-off shadow is a missing token; in dark themes add a
   1 px light ring at low alpha where a lighter step alone does not separate.
4. Images get a 1 px outline inset by 1 px: pure black at 10 % alpha on light, pure white at 10 % on dark. Unlike a
   shadow, this ring is never tinted: a palette neutral picks up the surface under it and reads as dirt on the
   image edge. Outline, not border, so layout never shifts.
5. A hover that lifts changes the shadow, on the `fast` token, for pointer devices only.

## Materials and depth

1. Floating chrome (toolbar, sticky header, sheet) can be a translucent layer: a semi-opaque background with
   `backdrop-filter` blur, content scrolling beneath.
2. Never a translucent surface on top of another translucent surface; legibility collapses.
3. A larger surface reads as thicker material: stronger blur and a deeper shadow than a small chip.
4. A modal task dims what is behind it with a scrim; a parallel, non-blocking panel separates by material and offset
   with no scrim, so the flow underneath stays live.
5. Where content slides under floating chrome, a short fade or blur mask at the edge replaces a hairline divider,
   and only where the overlap happens.
6. Text on a material is checked against the worst background that can pass under it, not the average.
7. Without `backdrop-filter` support, or under `prefers-reduced-transparency: reduce`, the layer is opaque. Under
   `prefers-contrast: more`, it is solid with a defined border.

## Icons

1. One icon library per surface; libraries with different stroke conventions never share a toolbar.
2. Stroke matches the adjacent text weight on a 24 px grid: 1.5 px beside regular text, 2 px beside medium and
   semibold, 2.5 px beside bold. A library without stroke variants keeps its native stroke and uses size or colour.
3. Size relative to the text, about 1 to 1.25 em inline, at the set's native grid sizes (16, 20, 24) so strokes stay
   on the pixel grid. Check every icon at its smallest render size; it must stay recognisable.
4. One SVG drawn in `currentColor`; hover, selected and disabled come from CSS colour and opacity, never from extra
   assets or fills baked into the SVG.
5. Outline is the resting state, fill is the active state: a state pair, never interchangeable.
6. Under right-to-left layouts mirror only direction-bearing icons (back, forward, send, text alignment); never logos,
   checkmarks, clocks or media transport.

## Contextual icons

1. An icon names what the control does here, as a verb, and the same action wears the same icon everywhere.
2. Every icon-only button carries a tooltip with that verb (`design` skill) and an accessible name
   (`design-ux-accessibility`).
3. A glyph that changes with state (copy to done, play to pause) swaps in place: the outgoing glyph shrinks to 0.25
   with opacity 0 and a 4 px blur while the incoming grows from there to 1, on a spring with no bounce settling in
   about 300 ms, or the `fast` token without a library. The slot persists, so the 0.9 floor for entering
   surfaces does not apply; a shallow 0.8 shrink double-exposes the two glyphs.
4. Without a motion library, keep both glyphs in the DOM, one absolutely positioned over the other, and transition
   both; neither unmounts, so both directions animate.
5. A state-driven glyph does not animate on first render, only on later changes. A deliberate page entrance keeps its
   enter.
6. Reduced motion keeps the fade and drops scale and blur (`MOTION.md`).

## Press and state feedback

1. Every pressable defines hover (pointer devices only), pressed, focus-visible, disabled and, when it starts work,
   loading. A missing state is a defect, not a style choice.
2. Pressed lands on pointer-down. Scale so the edges move 1 to 2 px: 0.97 for controls up to about 48 px tall, 0.98
   to 0.99 for cards. In on the `instant` token, back on `fast`. Disabled controls never scale.
3. A control where scale would distract (a text link, a dense toolbar row) opts out with a static variant and shows
   pressed by colour.
4. With a custom pressed state, the platform tap highlight is removed so the two do not double up.
5. Sound or haptics, when the product has them, fire on the same frame as the visual and only on commits, success and
   errors.

## Theme switch

Flipping the theme changes colour, background, border and shadow on nearly every element at once; every transition on
them fires together and the switch smears. Around the flip, insert a style that disables transitions, force a style
flush, and remove it after the next frame. Many theme libraries expose this as an option. This is not the blanket
reduced-motion rule `MOTION.md` forbids: it lives for one frame and only on a theme change.

## The invisible details

1. Drag handles, buttons and icon controls are not text-selectable; reading text always is.
2. Content that loads late reserves its space, so nothing below it jumps.
3. The cursor matches the affordance: pointer on what activates, grab on what drags, default on what does neither.
4. Scrollbars reserve their gutter where content length changes, so the page does not shift sideways.
5. Pressable elements set `touch-action: manipulation` so a tap is not delayed by double-tap zoom.

## Reporting

Group by the principle broken, order by severity, one row per root cause listing every location:
`Severity | Location | Before | After | Why`. High breaks an interaction or hides a state; medium is a visible
inconsistency; low is isolated finish. Anything not checked in a browser is reported as not verified.

## Before you finish

- Nested radii are concentric or deliberately independent.
- Icons with text and asymmetric glyphs are optically centred.
- Shadows lift, borders structure; dark theme elevates by surface; images carry the neutral outline.
- No translucent layer on another; reduced transparency and high contrast give opaque fallbacks.
- One icon library, stroke matched to text, `currentColor`, outline at rest and fill when active.
- Every pressable has all its states; pressed lands on pointer-down; theme switches without a smear.
