# Motion craft

Implements: fuera del playbook (X9)

`MOTION.md` holds the rulings the practice has already made: weighting, frequency gate, tokens, the enter and exit
recipe, gestures, reduced-motion policy. It wins every conflict with this file. Authority runs: the product's own
motion tokens, then `MOTION.md`, then this file, which supplies the reasoning and the values those rulings leave open.

## Lenses and weighting

A motion is judged through three lenses. The product type decides which one leads; record it once in the design-line
spec and never re-argue it per page.

| Lens | Asks | Duration stance | Overshoot |
|---|---|---|---|
| Restraint | Should this move at all? | Fastest that still reads; the `slow` token is the ceiling | Never |
| Polish | Is it quiet enough to ship? | Smooth over snappy; a large surface may take up to 400 ms | None |
| Expression | What could this become? | What the effect needs, never on something the user waits on | Allowed |

| Product type | Primary | Secondary | Selective |
|---|---|---|---|
| Productivity tool, dashboard, back office | Restraint | Polish | Expression, empty states only |
| Consumer mobile app | Polish | Restraint | Expression, rare delight moments |
| E-commerce | Polish | Restraint | Expression, product showcase |
| Marketing or landing page | Polish | Expression | Restraint, forms and navigation |
| Portfolio or creative site | Polish | Expression | Restraint, repeated interactions |
| Kids or education | Polish | Expression | Restraint, repeated game actions |

A duration ceiling belongs to the lens that set it; never apply the restraint ceiling to a landing page hero.

## Decision order

Run the steps in order. An early step may end the work with no code, and that is a result, not a dodge.

1. **Frequency.** Apply the gate in `MOTION.md`. Keyboard-initiated: stop here.
2. **Purpose.** Name exactly one: feedback, orientation (where it came from or went), a state change made legible,
   a bridge for content that would otherwise teleport, explanation (marketing or onboarding only), delight (rare tier
   only). No name, no motion. Numbers and charts the user reads or acts on never move for decoration.
3. **Tool.** The cheapest that does the job:

| Need | Tool |
|---|---|
| A state you toggle with a class or attribute: hover, press, open | CSS transition |
| Enter on mount with no script | Transition from `@starting-style`; fallback, an attribute set after first paint |
| A fixed sequence that must stay smooth while the page is busy | CSS keyframes |
| Script control without a dependency | Web Animations API |
| Route change, or one element carried between two layouts | View Transitions API, with a no-op fallback |
| Springs, exit on unmount, layout animation, gesture-driven values | The motion library the product already ships |

   A dialog, menu or toast comes from the product's component library with its focus handling; never hand-roll one
   to animate it. Never add a dependency for a fade.

4. **Properties.** The allowed set is in `MOTION.md`. On top of it:
   - Never scale from 0. A surface enters from 0.96 with opacity 0, and nothing starts below 0.9. A glyph swapped
     inside a slot that persists is the one exception (`UI-POLISH.md`).
   - A move "by its own size" uses percent of the element (a sheet parked at 100 %); fixed pixels only for the small
     nudge of the enter recipe.
   - Write `transform` on the element that moves. A custom property set on a parent and read by children
     recalculates style for every descendant on every frame.
   - `clip-path: inset()` serves reveals, hold-to-confirm fills and a tab highlight whose text and background must
     change colour in the same frame (clip a styled duplicate instead of timing two colour transitions).

5. **Curve and duration, or a spring.**

| Motion | Curve |
|---|---|
| Enter, exit, overlay | The product's strong ease-out (`MOTION.md` ease out quint) |
| Already on screen, moving A to B: indicator slide, reorder | A strong ease-in-out; cubic-bezier(.77, 0, .175, 1) when no token exists |
| Colour, background, hover | Built-in ease-out |
| Progress, spinner, marquee, hold-to-confirm fill | Linear |
| Any interface motion | Never ease-in: it barely moves in the first frames, exactly when the eye is on it |

   Built-in `ease` and `ease-out` are too soft for deliberate movement. A missing curve is taken from a published
   easing library and recorded as a token; never invent bezier digits. Duration grows with distance and area, not
   with importance: a 16 px glyph settles faster than a full-height sheet.

   Use a spring when the user can grab or reverse the element mid-flight, when a value follows the pointer, or when
   a retarget must keep velocity. Configure it with two numbers: perceived duration and bounce (or damping ratio).
   Default bounce 0, damping ratio 1. Bounce 0.1 to 0.2 (ratio near 0.8) only when the release carried momentum, a
   flick or a throw, or at the delight tier; never on a menu, dialog, toggle or settings panel. A decorative value
   that tracks the mouse goes through a spring rather than being set raw, and only on marketing surfaces.

6. **Interruption.**
   - Anything a user can fire twice in a second (toast stack, toggle, accordion) uses a transition or a spring.
     Keyframes restart from their first frame; transitions retarget from where they are.
   - A retarget starts from the value on screen now, never from the logical start or end state.
   - Input is never blocked while something animates.
   - Deliberate and response phases are asymmetric: a hold-to-confirm fills linearly over 1.5 to 2 s while the user
     decides, and snaps back on the `fast` token on release.

7. **Exit.** The rules in `MOTION.md` apply. Also: leave along the path of entry (a toast out of its own edge, a sheet
   back to its edge). A subtle exit is a small fixed offset toward where it goes; a full exit only when the user
   dismissed it by gesture or where it lands matters (a card returning to its list). Remove instantly when the motion
   carries no information.

8. **Reduced motion and pointer gating** ship in the same change (`UI-MOTION-RUNTIME.md`). Hover motion sits behind
   `(hover: hover) and (pointer: fine)`, because a tap fires hover on touch screens.

## Stagger

1. Only the semantic groups of a once-per-visit entrance (heading, supporting text, actions); never the rows of a data
   list (`MOTION.md`).
2. 40 to 60 ms between groups, at most four groups, so the last one starts within 200 ms.
3. Every control is clickable from the first frame; a stagger never gates input.
4. A delayed keyframe uses `animation-fill-mode: backwards`, or the element flashes at full opacity before its delay.

## Origin and tooltips

1. Use the origin the component library computes and exposes as a custom property. Hand-rolled: the panel corner
   nearest its trigger (top-left for a menu opening down and right).
2. Tooltips in a group: the first waits and animates; while one is open, its neighbours open at once with no motion.

## Crossfades that double-expose

When two states visibly overlap and curve or duration tuning has failed, blur the transitional state by at most 2 px
for the length of the crossfade. The eye then reads one object changing rather than two swapping. `MOTION.md` caps
blur everywhere else.

## Feel check

Code cannot settle feel. Before claiming done: replay at 10 % speed in the browser's animation panel, step frame by
frame, confirm every animated property lands on the same frame, spam the trigger and reverse it mid-flight, run
gestures on a real touch device, and look once more after a break. Proof is a recording or demo (`MOTION.md`).

## Before you finish

- The lens weighting is recorded; each motion passed frequency and named one purpose.
- The tool is the cheapest that works; no dependency added for a fade.
- No scale from 0, no ease-in, no invented curve, no bounce on utility surfaces.
- Spamming and reversing every trigger blends; nothing queues, jumps or blocks input.
- Reduced motion and hover gating shipped with the motion.
- The feel check ran and the proof is a recording.
