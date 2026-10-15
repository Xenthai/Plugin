# Motion at runtime: performance and reduced motion

Implements: fuera del playbook (X9)

The only file in the design doctrine that rules on animation performance and on how reduced motion is implemented.
The reduced-motion policy itself (what stays, what goes, the banned blanket rule) is in `MOTION.md`; this file is how
that policy is built and proven.

## Rendering cost

A frame runs layout, then paint, then composite. A property that only needs compositing (transform, opacity, and
filter in most engines) can animate on the compositor without the main thread. `MOTION.md` fixes the allowed
properties; the rules below keep them cheap.

1. `transition-property` names exactly what changes. A utility class that means "transform" in a CSS framework may
   cover `transform`, `translate`, `scale` and `rotate` together; anything beyond that gets an explicit list.
2. Predetermined motion runs as CSS transitions, keyframes or the Web Animations API, which keep running while the
   main thread loads, parses or paints. Script driven by `requestAnimationFrame` drops frames at exactly those
   moments; reserve it for values a gesture produces.
3. Some motion libraries drive shorthand values (`x`, `y`, `scale`) from the main thread each frame and only hand a
   full `transform` string to the compositor. Check the behaviour for the version in the product's manifest before
   choosing; a motion that must survive a busy page uses the compositor path.
4. Never read layout (`getBoundingClientRect`, `offsetHeight`) inside a per-frame loop after writing styles; each read
   forces a synchronous layout. Measure once at gesture start, then write only transforms.
5. `will-change` only for transform, opacity or filter, only on an element about to move, only once a first-frame
   stutter has been seen, and removed when the motion ends. Never `all`, never on a long list: each promoted layer
   costs memory.
6. Blur and `backdrop-filter` cost paint in proportion to radius times area, and one engine family is markedly slower
   at it. `MOTION.md` caps both; a larger surface than a card never animates blur.
7. `clip-path` composites only in some engines; keep clipped reveals to small areas.
8. Collapse animates `grid-template-rows` from `0fr` to `1fr` (`MOTION.md`), never a measured pixel height and never
   `height: auto` through script.
9. A custom property animated with `@property` and a declared type interpolates; an undeclared one jumps between
   values. Declare it with `inherits: false` so children do not recalculate.

## Measuring

1. The browser's performance panel with the CPU throttled four times: every animation frame under 16.7 ms, or
   8.3 ms on a 120 Hz target.
2. The rendering panel's paint flashing and layer borders: an element that flashes green on every frame is
   repainting, not compositing.
3. A dropped frame found on a fast laptop is a certain failure on a mid-range phone; a clean run on a fast laptop
   proves nothing until it repeats throttled.

## Reduced motion, built

1. CSS: one guard per recipe inside `@media (prefers-reduced-motion: reduce)`, plus the library-variable reset block
   `MOTION.md` describes. Purely decorative motion (parallax, ambient loops, mouse-follow) is written inside
   `(prefers-reduced-motion: no-preference)` instead, so its default is off.
2. Script: read `matchMedia('(prefers-reduced-motion: reduce)')` and subscribe to its change event, or use the motion
   library's hook for it. A preference changed while the page is open takes effect without a reload.
3. Under the preference, a spring becomes an opacity fade on the `fast` token, a gesture settle jumps to its target
   and fades, a shared-element or view transition becomes a crossfade, and overshoot disappears.
4. Movement to remove: translation across distance, scale of large surfaces, zoom, rotation, parallax, scroll-linked
   movement, automatic scrolling, overshoot. Kept: opacity and colour changes that carry meaning.
5. Autoplaying video and looping illustrations stop on their first frame and offer a play control.

## Safe by default

These hold with or without the preference, because vestibular reactions happen to people who never set it.

1. No full-viewport background that moves, no whole-view zoom, no scroll-jacking, no parallax layers moving at very
   different speeds.
2. No slow oscillating loop on functional UI; idle motion there is decoration charging attention on every second.
3. Motion that starts on its own, runs longer than five seconds and sits beside other content gets a pause or stop
   control (WCAG 2.2, criterion 2.2.2, level A).
4. Nothing flashes more than three times in any second (criterion 2.3.1, level A).
5. Motion triggered by interaction can be switched off unless it is essential (criterion 2.3.3, level AAA); the
   reduced-motion guard is how a product meets it.
6. Motion is never the only signal. Every animated state change also lands as a static colour, icon or text change
   that is visible when the animation does not run.
7. Large dark-to-light jumps are a brightness flash; a theme switch changes instantly and without a transition
   smear (`UI-POLISH.md`).

## Proving it

1. Emulate `prefers-reduced-motion: reduce` in the rendering panel on the pages `MOTION.md` names: movement gone,
   fades kept.
2. Toggle the preference with the page open and confirm the script path follows.
3. Record one throttled performance trace of the heaviest motion in scope and keep its frame times in the PR body.

## Before you finish

- Only compositor-friendly properties animate; transition lists are explicit; no `will-change: all`.
- No layout reads inside a frame loop; predetermined motion runs off the main thread.
- A throttled trace shows frames inside budget.
- Every recipe has its reduced-motion guard; decorative motion defaults off; the script path listens for changes.
- Auto-moving content over five seconds has a pause control; nothing flashes above three per second.
- Every animated state change has a static cue.
