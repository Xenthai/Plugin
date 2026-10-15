# Gestures and physics

Implements: fuera del playbook (X9)

`MOTION.md` rules the swipe-to-decide case: transform only, commit on distance or velocity, a short release on
ease out quint, stamps scaled by distance, buttons kept as the full path, removed rows that fade. This file holds the
mechanics behind every gesture and the surfaces `MOTION.md` does not cover: sheets with detents, carousels, draggable
cards, anything thrown.

## Which settle

| The gesture ends on | Settle with | Why |
|---|---|---|
| One of two outcomes: commit or return (a row swipe) | The `MOTION.md` release: a duration on ease out quint, started from the current position | Distance to either outcome is short and bounded |
| Several snap points, or a free throw | A spring whose initial velocity is the release velocity | Distances vary; a fixed duration changes speed at release and shows a seam |

## Tracking

1. Feedback lands on pointer-down; the commit lands on pointer-up. Waiting for `click` to show a pressed state reads
   as lag.
2. Pointer Events with `setPointerCapture` at drag start, so tracking survives the pointer leaving the element.
3. Keep the grab offset: the element moves with the point the user took hold of, never recentred under the finger.
4. Follow 1:1 by writing `transform` on the element once per animation frame, with no transition active during the
   drag.
5. Lock the axis after about 10 px of travel by comparing horizontal and vertical movement; cancel the losing
   recogniser. Declare the axis the browser keeps with `touch-action` (`pan-y` on a horizontally swipeable row).
6. Once a drag owns the element, ignore further pointers; a second finger never retargets it.
7. Dragging back past the start cancels without committing.
8. Recognise every plausible gesture from the first move and drop the losers once intent is clear. Recognisers that
   only report a finished swipe throw away the continuous tracking feedback needs. Pay a double-tap delay only where
   double-tap exists.

## Velocity

1. Compute it from the samples of the last 100 ms (time and position), not the whole drag and not the last event
   alone, which is noise.
2. Decide commit or return by the sign of the release velocity, not the position: a user who dragged far and then
   flicked back meant to cancel.
3. A flick commits on its own. Start the velocity threshold near 0.1 px/ms and tune it on a device; never require the
   distance threshold alone.

## Momentum projection

Choose the snap point nearest to where the throw would come to rest, not nearest to the release point. With release
velocity `v` in px/ms and a per-millisecond decay rate `r`, the throw travels `v * r / (1 - r)` further. Use
`r = 0.998` for a scroll-like glide and `0.99` for a heavier, shorter one. A release at 1 px/ms with `r = 0.998`
projects about 500 px.

1. Clamp the projection to the valid range.
2. A paged surface (carousel, onboarding deck) moves one page per flick whatever the projection says.
3. A free surface (a sheet with three detents) may skip a detent when the projection lands past it.

## Velocity handoff

1. The settle spring starts at the release velocity, so dragging and animating join without a seam.
2. Check the unit the library expects. Some take absolute velocity per second; some take velocity normalised by the
   remaining distance, `v / (target - current)`. A wrong unit shows as a lurch or a stall at release.
3. Two-dimensional motion runs one spring per axis; a single spring on the diagonal desynchronises when the axes
   carry different velocities.

## Interruption

1. Grabbing an element mid-settle stops the animation at the value on screen (read the computed transform) and
   resumes tracking from there. Nothing jumps; a sheet that is closing follows the finger that caught it.
2. A reversal keeps the current velocity: retarget the running spring, never cancel it and start a new tween from
   rest. The cut shows as a wall.
3. Input stays live during every settle.

## Boundaries

Past an edge, resistance grows with distance instead of stopping hard. With overshoot `o`, the container's size `d`
along the axis and a constant `c` near 0.55, show `(o * d * c) / (d + c * |o|)` of displacement. The result never
exceeds `d`, and the first pixels track almost 1:1. On release, return with a bounce 0 spring. A hard wall reads as
frozen; rising resistance reads as "there is nothing more here".

## Gesture feedback beyond the visual

Sound or haptics on a gesture fire on the causal event (the snap into a detent, the commit), in the same frame as the
visual, and only for commits, snaps, success and errors. Feedback on every pixel trains people to ignore all of it.

## Reduced motion and alternatives

1. Every gesture has a non-gesture path: a button, a menu item, a key. `MOTION.md` keeps the buttons and disables
   drag-follow under reduced motion.
2. Settles under reduced motion jump to the target and keep the fade (`UI-MOTION-RUNTIME.md`).

## Verify on a device

On a physical touch screen: a slow drag, a short fast flick, a long drag reversed at the end, a grab mid-settle, a
second finger mid-drag, a drag past each edge, and a vertical scroll that starts over a horizontal swiper. Desktop
emulation of touch does not reproduce velocity or latency.

## Before you finish

- Settle type chosen from the table; springs carry the release velocity in the unit the library expects.
- Pointer captured, grab offset kept, axis locked, extra pointers ignored.
- Commit decided by velocity sign and threshold, not distance alone; projection picks the snap point.
- Mid-settle grab and reversal blend with no jump.
- Edges rubber-band; every gesture has a button path.
- The device checklist ran on real hardware.
