# Motion

Implements: fuera del playbook (X9)

Reference: the `design-motion-principles` skill (Emil Kowalski, Jakub Krehel, Jhey Tompkins). Load it for the
per-designer reasoning; this file holds the decisions the practice has already made.

## Weighting by product type

| Product | Primary | Secondary | Selective |
|---|---|---|---|
| Productivity tool used all day | Kowalski | Krehel | Tompkins, only for empty states |
| Any other type | Whatever the skill's context-to-perspective table says for that type | | |

1. Map the product type once with the skill's table, confirm with the owner, record it in the design-line spec.
   Never re-argue it per page.
2. Do not apply one designer's duration caps outside the type they were written for.

## Frequency gate

The more often an action repeats, the less it moves. Apply it to every candidate before choosing a duration.

| Frequency | Treatment |
|---|---|
| Dozens per session (hover on dense rows, row re-sort, list refetch) | Colour change only, or nothing |
| Keyboard-initiated change | Nothing, ever |
| A few per session (open a popover, decide an item) | Short, one property pair |
| Once per visit (page entry, a revealed section) | May carry opacity, offset and blur |

## Tokens

| Token | Value | Use |
|---|---|---|
| duration instant | 100 ms | Press feedback |
| duration fast | 150 ms | Hover, colour, popover, row fade, exit |
| duration base | 200 ms | Dialog enter, collapse |
| duration slow | 240 ms | Sheet enter, card arrival |
| ease out quint | cubic-bezier(.23, 1, .32, 1) | Enters, overlays, collapse |
| ease sheet | cubic-bezier(.32, .72, 0, 1) | Bottom and side sheets |
| ease out (built in) | | Hover and colour |
| ease linear | | Continuous width only |

1. Measure first: list every literal duration and easing the code uses, with a count, then map each to a token.
   A token that replaces nothing is not added.
2. No UI transition exceeds `slow`. A longer one is a documented exception, usually non-interactive decoration.
3. Properties: `transform`, `opacity`, `filter`; `grid-template-rows` for collapse. Never layout properties, never
   `transition-all`.
4. A transition for anything a second click can reverse (press, hover, collapse). A keyframe only where the library
   owns the unmount (overlays driven by open and closed state).

## Enter and exit

| Rule | Detail |
|---|---|
| Enter recipe | Opacity, 8 px offset and blur of at most 4 px, on `ease out quint` |
| Blur | Never above 8 px, never on a surface larger than a card |
| Exit | Shorter than enter, at most 75 %, and smaller in movement |
| Popovers, menus, tooltips | Enter-only; a test fails an exit animation on them |
| Origin | Popovers scale from the trigger, sheets from their edge, modals from the centre; never override a library's computed origin |
| Per item | Never one entry animation per item of a list; a row delivered by a socket or refetch never animates |
| Skeleton to content | Fade only when the skeleton showed at least 200 ms; paint no skeleton in the first 150 ms of a load |

## Gestures

1. A swipe follows the finger with `transform` only.
2. It commits past a distance threshold or a velocity threshold; read both, a short fast flick is a commit.
3. Release takes under 200 ms on `ease out quint`.
4. Stamps ("approve", "discard") scale their opacity by the distance travelled, not by time.
5. Buttons remain the full path; under reduced motion drag-follow is disabled and the buttons stay.
6. A removed row fades at `fast` with no height animation, so the list does not jump during rapid triage.

## Reduced motion

| Layer | Policy |
|---|---|
| Keyframe enters and exits | One unlayered reduced-motion block resets the animation library's enter and exit CSS variables (translate, scale, rotate, blur) to neutral. Keyframes keep the fade and lose the movement |
| Transform transitions | A per-recipe guard that turns the transition off |
| Skeleton pulse | Guarded off |
| Collapse | Drops the size transition, keeps the inner fade |
| Never | The blanket rule forcing every animation and transition to 0.01 ms with `!important` |

The blanket rule removes the opacity fades that reduced motion should keep, makes `transitionend` and
`animationend` fire at once and can leave state half-applied, and overrides every recipe's own decision. Reduced
motion means less movement, not no feedback.

Verify with the browser's rendering emulation of `prefers-reduced-motion: reduce` on three pages: movement gone,
fades kept.

## Process

1. Audit before create: the audit table of `PROCESS.md` exists before any motion is added.
2. Motion lives in named recipes in one module; a page imports a recipe, never writes a literal.
3. The mockup carries a motion paragraph (`MOCKUP.md`); the owner approves it with the layout.
4. Motion proof is a standalone demo or a recording, never a description.

## Before you finish

- The weighting is recorded; each motion passed the frequency gate.
- Only tokens appear; no literal durations; no layout property animated.
- Exits are shorter than enters; popovers enter-only; nothing animates on keyboard.
- The reduced-motion block resets library variables and no blanket rule exists.
- Reduced motion was emulated and checked on three pages.
