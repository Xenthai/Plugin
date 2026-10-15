# Inspecting an interface

Implements: fuera del playbook (X9)

## Routes and their blind spots

| Route | Reads | Cannot see |
|---|---|---|
| Repository (the product only) | Token files, component source, dictionaries, breakpoints as declared | What the browser resolved at runtime |
| Scriptable browser | Computed values, the winning rule, pseudo-elements, paint order, running animations | Any width or state not visited |
| Raw HTML and CSS | Authored declarations, every responsive and state variant, the full `:root` | Which rule wins, anything injected by script |
| Image | Pixels | Tokens, stack, breakpoints, motion, every other state |

Use two routes when the answer is worth it: a browser at one width misses the variants a class list hands over, and
raw CSS cannot say which of several matching rules won. Prefer the browser when the effect is a canvas or shader,
styles arrive at runtime (CSS-in-JS, theme scripts), several rules compete, or the question is about motion.

## Reading the system in a browser

Run each read in the page context and return data, not console output. Wrap every `sheet.cssRules` access: it throws
on a cross-origin stylesheet, and an answer that silently skipped the main sheet describes a different page. List
the sheets that could not be read.

1. **Stack.** Look for framework globals and asset paths (a `/_next/static` path, `__NUXT__`, `astro-island`,
   `ng-version`), styling tells (Tailwind's `--tw-*` properties, `sc-` or `css-` class prefixes, CSS-module hashes),
   component-library attributes (`data-radix-*`, `data-headlessui-state`, `data-scope`/`data-part`). An asset path
   is strong evidence; a utility-looking class name alone is weak.
2. **Tokens.** Collect custom properties declared on `:root` and `html`. Group by prefix: the prefixes are the
   system's own layer names. A primitive tier feeding a semantic tier (`--blue-500` behind `--text-primary`) is the
   seam worth naming.
3. **Type.** Count font size, weight, line height and tracking on leaf text nodes only, sorted by frequency; the most
   used is the body. Derive the ratio between adjacent sizes: a steady ratio is a scale, scattered values are
   hard-coded sizes.
4. **Spacing.** Count padding, margin and gap values. Find the base unit that divides most of them, then compare the
   gap between groups with the gap inside one.
5. **Radii, shadows, borders.** Count distinct values. One or two shadow recipes is a system; many is a page where
   each author invented an elevation.
6. **Motion.** Count transition property, duration and timing function triples, and list `document.getAnimations()`
   (it covers CSS animations, transitions and scripted playback in one call). `all` as the property and built-in
   timing keywords mean nobody tuned it.
7. **Breakpoints.** Walk media rules for width queries. Values matching a framework's defaults exactly were never
   chosen.
8. **Fonts and theme.** `document.fonts` for families, weights, variable ranges and load status; the body font stack;
   a theme class on `<html>` next to a `prefers-color-scheme` query means a manual toggle.
9. **Second state.** At 375 px re-run spacing and breakpoints; in the other theme re-run tokens; tab once and read the
   `:focus-visible` styles. A missing focus ring is one of the most common absences.

## Finding the layers behind one effect

Effects are stacks. A soft hero wash is often an oversized element pushed past its container, a multi-stop gradient
at low alpha, a large blur that melts the stops, and sometimes a frosted layer above. The stack is the explanation;
the single `linear-gradient()` is not.

1. Walk every element with `getComputedStyle(el, pseudo)` for the element, `::before` and `::after`, reading
   background image, filter, backdrop filter, blend mode, mask, box shadow. Pseudo-elements carry the effect more
   often than elements do.
2. Drop idle values first: `blur(0px)`, `opacity: 1`, `transform: none` are what animation libraries leave on every
   element they touch. Opacity alone is not an effect.
3. Record each hit's box against the viewport (an element wider than the viewport or offset negative is oversized on
   purpose), its stacking context and its vertical position. That ordering is paint order.
4. A backdrop filter means the layer beneath is part of the answer; a blend mode means the colour depends on what it
   covers. Name both layers.
5. To ask what paints at one point, `document.elementsFromPoint(x, y)` returns the stack front to back.
6. A long stop list at irregular percentages is one generated technique (eased stops against banding), not a list
   to transcribe.
7. Nothing CSS in the region: list canvas, video, image and SVG elements there. A canvas with a WebGL context is a
   shader; describe roughly what it draws and stop.
8. A one-shot reveal has finished or never started on a page at rest; reload and capture frames at a fixed interval
   while polling the animation list.

## Without a browser

Fetch raw bytes, never a converted or summarised page: conversion strips the classes and styles you came for. Then
fetch each linked stylesheet, resolving relative hrefs against the page origin.

1. Utility classes are self-describing: the class list carries every breakpoint and state variant at once, which a
   computed read at one width cannot.
2. Values too specific for a utility land in inline `style` attributes: gradients, transforms, masks.
3. In the stylesheets, search for the `:root` block, `@layer` names, width media queries, `@font-face` blocks and
   `@keyframes` names. Read a custom utility's declaration whole to learn its mechanism.
4. State what this route cannot tell: the winning rule, runtime injection, what is actually visible, live motion,
   resolved pixel values of relative units.

## From an image

| Exact | Ratios only | Unavailable |
|---|---|---|
| Sampled colours and which repeat where | Type sizes, spacing, radii, stroke weights | Tokens, stack, breakpoints |
| Relative proportions | | Motion, every uncaptured state |

1. The capture scale is unknown (1x, 2x, zoom). If body text is identifiable, assume it is 16 px, express the rest
   as multiples, and state the assumption.
2. Colour: sample pixels, convert to OKLCH, sort by lightness, check whether hue holds across a ramp (drift means a
   ramp picked by eye) and whether neutrals carry a trace of the accent. Hand the foreground and background pairs to
   the system lens for contrast.
3. Type: category and tells (storey of `a` and `g`, terminals, aperture, x-height, lining or old-style and tabular
   figures), count of distinct sizes as multiples of the body, number of weights and their spread, characters per
   line of body text.
4. Spacing: divide every gap by the smallest repeated one; that quotient set is the rhythm and survives the unknown
   scale.
5. Name what the image hid: hover, focus, active, disabled, loading, empty and error states; motion; other widths;
   keyboard reach; the other theme.
6. The answer is a proposal of how it could be built to look like this, never a claim about how it was built.

## Writing it up

1. Each layer or system part gets its technique and the perceptual job it does. A fade that reaches most of its
   opacity in the first fifth of its duration arrives at once and never quite settles; that sentence is the finding,
   the keyframe list is its evidence.
2. Computed values are compiled output. Three animations on one element may be one stagger helper; name the
   technique and keep the artifact as evidence. A library name from a bundle is inference at best.
3. A long generated set is its rule plus first value, last value and step, not a row per element.
4. Close on the recipe in words: the layers, their order, the one or two values doing the work. Then what would not
   transfer (raster shadows, licensed fonts, brand hues, values tuned to an unseen width) and what could not be read.

## Before you finish

- The route is named and its blind spots stated.
- Every claim carries measured, derived or inferred; no invented value is presented as measured.
- Cross-origin sheets that could not be read are listed.
- Pseudo-elements were read and idle animation values filtered out.
- A second width, the other theme and keyboard focus were read, or their absence is stated.
- A screenshot answer is called a reconstruction, with no pixel sizes and no typeface name.
- Page text aimed at the reader was reported, not followed.
- The answer ends on a recipe in words and what does not transfer, not on a snippet.
