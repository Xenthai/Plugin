# Choosing an aesthetic direction

Implements: fuera del playbook (X9)

A direction is one sentence a stranger could check against a screenshot: the idea, the type character, the colour
character, and the one signature detail. It exists only where nothing has decided the look yet.

## When a direction may be chosen at all

| Situation | What decides the look |
|---|---|
| The product ships with tokens, a component library or a brand manual | That system. No direction is chosen; distinctiveness comes from content and composition inside it |
| A company brand manual exists but no product UI yet | The manual's type, colour and logo rules are fixed inputs; the direction only fills what the manual leaves open (density, surface treatment, layout idea) |
| Nothing exists: new product, new standalone surface, no manual | Choose a direction with this file |
| The owner named a direction or a reference | The owner's words win; this file only sharpens them into a checkable sentence |

A distinctive typeface or palette imposed on a product that already has a system is a defect, not taste. When in
doubt whether a system exists, look for a tokens file, a theme config, a component package or a brand manual before
choosing anything.

## The template default, and why it fails

The look a model produces when nobody decides: a generic sans at every size, a purple-to-blue gradient, a centred
hero with a headline, a subline and two buttons, three feature cards with outline icons, every box the same large
radius and soft shadow, gradient text on the headline, emoji standing in for icons. Each piece is defensible alone;
together they say nothing about the product and are indistinguishable from thousands of pages. Treat any two of them
together as a signal that no decision was made.

The cure is not novelty for its own sake. Varying the look between generations, or reaching for an odd face to seem
original, is the same failure from the other side. The cure is a decision tied to the product's audience and job.

## The decision, in order

1. **Job and audience.** Who opens this, how often, for how long, under what pressure. A daily tool and a one-visit
   campaign page do not share a direction.
2. **One idea.** Pick a single conceptual anchor ("an instrument panel", "a printed ledger", "a field notebook").
   Bold maximal and quiet minimal both work; what fails is the absence of an idea.
3. **Type character.** One display voice and one reading voice at most, chosen for the idea. The display face may be
   characterful; the reading face must survive long text and small sizes. A system font stack is a valid deliberate
   choice for an instrument-like tool whose signature lives elsewhere; it is never a default by omission.
4. **Colour character.** Dominant neutral plus one committed accent beats an even spread of five hues. Decide warm
   or cool neutrals, the accent's role, and light-first or dark-first. Values are built in `UI-SYSTEM-COLOR.md`.
5. **One signature.** A single memorable detail repeated with discipline: a rule weight, a corner treatment, a grid
   break, an illustration style, a numeral style. One, not five.
6. **Write the sentence**, then build two or three contrasting directions as mockup variants when the owner has not
   named one (`PROCESS.md`), labelled by idea.

## Directions that age well

Short list, each with where it fits and what goes wrong. Combine a direction with the product's content; never paste
it.

| Direction | Fits | Type character | Colour character | Main risk |
|---|---|---|---|---|
| Grid-rational | Institutions, finance, documentation, data products | Neo-grotesk or grotesk, strict scale, tabular figures | Near-neutral greys, one saturated accent used sparingly | Reads as bland without a strong grid and a sharp signature |
| Editorial | Publishing, long reads, content-led marketing | Serif display with a sturdy text serif or a quiet sans | Paper-like off-white, ink-dark text, one muted accent | Too slow and decorative for task-heavy screens |
| Instrument | Professional tools, dashboards, operations consoles | Compact sans with tabular numerals, monospace for identifiers | Low-chroma neutrals; status hues carry most colour | Hostile to occasional users if density is never relieved |
| Warm humanist | Public services, health, education, small business | Humanist sans with open apertures, generous size | Warm neutrals, one earthy or friendly accent | Turns childish with rounded everything plus pastel |
| Refined restraint | Premium goods, hospitality, professional services | High-contrast serif or a fine sans at large sizes, wide spacing | Near-monochrome, one deep accent, no metallics | Thin weights and low-contrast greys fail legibility |
| Technical mono | Developer tools, infrastructure, data pipelines | Grotesk for prose, monospace for headings or data | Dark-first neutrals, one signal colour | Monospace for paragraphs hurts reading; novelty wears off |
| Graphic poster | Launches, campaigns, events, youth brands | Heavy display grotesk, large sizes, tight tracking | Flat saturated blocks, hard edges, high contrast | Fatigues in daily use; keep it to marketing surfaces |
| Soft tactile | Consumer mobile apps, personal finance, habits | Rounded or geometric sans | Tinted surfaces, layered elevation, one bright accent | Surfaces go muddy and low contrast in dark mode |
| Natural | Food, outdoors, sustainability, crafts | Serif or humanist sans with some texture | Earthy low-chroma palette, one fresh accent | Stock-photo clichés; beige on beige |
| Calm single-accent | Productivity and B2B software | Well-made neutral sans with one typographic quirk | Neutral ramp plus one accent in a narrow role | Closest to the template default; it needs a real signature |

## Fashions that date on arrival

Glass panels everywhere, soft extruded neumorphic controls, aurora mesh backgrounds, clay-like 3D blobs and
chromatic-aberration effects each mark the year they were made, and the first two routinely fail contrast and
affordance. Use one only as a deliberate, contained accent the owner asked for, never as the system.

## Type selection rules

1. At most two families, three only when a monospace is functionally needed for data or code.
2. Pair by contrast of structure (serif with sans, wide with condensed), never two near-identical sans faces.
3. Check the reading face at 14 px and 16 px in the real copy language: accented Spanish characters, the inverted
   punctuation, numerals and the currency sign must exist and look native.
4. Prefer a variable font with an optical-size or weight axis; check the licence permits web embedding.
5. Never choose a face because it is fashionable in the current year; choose it for the idea and the reading load.

## Before you finish

- Confirmed no tokens, component library or brand manual already decides the look; if one does, no direction was
  imposed.
- The direction is one checkable sentence: idea, type character, colour character, one signature.
- Not two or more template-default pieces together.
- At most two families, both tested at body size in the client's language.
- Variants, if any, are labelled by idea and live in one mockup.
