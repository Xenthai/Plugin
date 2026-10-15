# Motion vocabulary

Implements: fuera del playbook (X9)

Turns a loose description of movement ("the bouncy thing when the menu opens") into the exact term, so a brief, a
comment or a prompt names one effect. Read for what the person saw or felt, not for keywords.

## How to answer

1. Lead with the term and a one-line meaning. Expand only when asked.
2. When two terms compete, give the best first, then at most two alternates, each with the difference that decides.
3. When nothing here fits, name the closest term and say it is an approximation, or describe the effect by combining
   terms ("a stagger of scale-in entrances").
4. Never coin a term. A name that does not exist sends the next reader looking for it.
5. Naming is not approving: whether the effect should ship is `UI-MOTION-CRAFT.md`'s question.

## Appearing and leaving

- **Fade**: opacity alone changes.
- **Slide**: arrives from or leaves toward an edge.
- **Scale-in**: grows to full size as it appears, usually with a fade.
- **Pop**: a scale-in that overshoots and settles.
- **Reveal**: content uncovered progressively by a clip or mask.
- **Enter, exit**: the motion played when an element is added to or removed from the page.
- **Materialise**: opacity, a small offset and a blur clearing together, so the element seems to come into focus.

## Timing and sequence

- **Duration**, **delay**: how long it runs; how long before it starts.
- **Keyframes**: fixed waypoints of an animation; the browser fills between them.
- **Tween, interpolation**: generating every in-between frame from a start and an end.
- **Stagger**: the same motion on several elements, each starting a little after the previous.
- **Orchestration**: several motions timed to read as one.
- **Fill mode**: whether the first or last frame's styles hold before the start or after the end.
- **Steps**: motion in discrete jumps instead of continuously, as in a countdown.

## Easing

- **Easing**: how speed changes across the motion.
- **Ease-out**: fast start, gentle stop; arriving things.
- **Ease-in**: gentle start, fast end; reads as sluggish in interfaces.
- **Ease-in-out**: gentle at both ends; something already visible moving between two places.
- **Linear**: constant speed; progress and loops.
- **Cubic bezier**: a custom curve defined by two control points.
- **Asymmetric curve**: accelerates and decelerates at different rates.

## Springs and physics

- **Spring**: motion driven by simulated physics instead of a fixed duration.
- **Stiffness**, **damping**, **mass**: pull toward the target; how fast oscillation dies; how heavy it feels.
- **Damping ratio**: 1 settles without overshoot; below 1 overshoots.
- **Bounce**: the overshoot and settle of an underdamped spring.
- **Perceived duration**: when a spring looks finished, though it keeps settling below visibility.
- **Velocity**: speed and direction at an instant; carried into the next motion when interrupted.
- **Momentum**: motion that continues after release because it carries velocity.
- **Velocity handoff**: a settle that starts at the speed the finger had at release.
- **Momentum projection**: aiming a throw at where it would come to rest, not where it was released.
- **Interruptible animation**: one that can be redirected mid-flight from where it is.
- **Additive animation**: a new motion layered onto a running one so velocity never resets.

## Transforms and space

- **Translate**, **scale**, **rotate**, **skew**: move, resize, spin, shear.
- **3D flip, tilt**: rotation around the horizontal or vertical axis with depth.
- **Perspective**: how strong depth looks; smaller values exaggerate it.
- **Transform origin**: the anchor a scale or rotation grows or spins from.
- **Origin-aware**: a panel that grows out of the control that opened it.
- **Direction-aware**: forward navigation moves one way, back moves the other.

## Between states

- **Crossfade**: one element fades out as another fades in on the same spot.
- **Morph**: one shape becomes another.
- **Shared element transition**: one element travels and reshapes from one layout into another.
- **Layout animation**: an element whose size or position changed glides there instead of jumping.
- **View transition**: the browser animates between two states of a page or two pages.
- **Collapse, accordion**: a section opens and closes its height.
- **Continuity transition**: any change that keeps the viewer oriented by visibly connecting before and after.

## Scroll

- **Scroll reveal**: elements animate as they enter the viewport.
- **Scroll-driven animation**: progress tied directly to scroll position.
- **Parallax**: layers move at different speeds while scrolling.
- **Scroll-jacking**: script overriding the native scroll speed or target.

## Touch and pointer

- **Press feedback**: a slight scale-down while pressed.
- **Hover effect**: a change while a pointer rests on the element.
- **Hold to confirm**: a fill that completes only while the press is held.
- **Drag**, **drag to reorder**, **swipe to dismiss**: move by grabbing; rearrange while others make room; throw off.
- **Rubber-banding**: rising resistance past an edge, then a return.
- **Detent**: a resting height a sheet snaps to.
- **Hysteresis**: movement required before a gesture commits to a direction.
- **Shake**: a quick side-to-side jitter meaning "rejected".
- **Ripple**: a circle spreading from the touch point.

## Ambient and decorative

- **Loop**, **alternate**: repeats; repeats forward then backward.
- **Pulse**: a repeating scale or opacity throb used to draw attention.
- **Float**, **idle motion**: slow drift or movement while nothing happens.
- **Marquee**: content scrolling in a continuous loop.
- **Line drawing**: a path that appears to draw itself.
- **Number ticker**, **text morph**, **typewriter**: digits rolling to a value; characters changing in place;
  characters appearing one by one.
- **Skeleton, shimmer**: placeholder shapes, sometimes with a moving sheen, while content loads.

## Performance

- **Frame rate**: frames drawn per second; 60 is the floor for smooth, 120 on newer displays.
- **Jank**, **dropped frame**: visible stutter; a frame that missed its deadline.
- **Compositing**: the GPU moving or fading a layer without new layout or paint.
- **Layout thrashing**: forcing layout repeatedly inside one frame.
- **Layer promotion**: giving an element its own compositor layer ahead of time.

## Principles

- **Frequency of use**: the more often seen, the shorter and quieter.
- **Spatial consistency**: an element keeps its identity and place across states.
- **Anticipation**, **follow-through**: a small wind-up before a move; parts settling after it stops.
- **Squash and stretch**: deformation that conveys weight and speed.
- **Perceived performance**: motion that makes waiting feel shorter without changing it.
- **Reduced motion**: honouring the user's request for less movement.

## Before you finish

- The answer leads with one term from this file and its meaning.
- Competing terms are contrasted by the difference that decides between them.
- An approximation is labelled as one; no term was invented.
