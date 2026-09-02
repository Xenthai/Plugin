# Composition doctrine

> Numeric rules so a social piece is not decided by iteration.
> Derived by measuring 40 pieces across 4 formats, then by building the render engine that
> asserts them. Brand-independent: these are composition rules, not identity.

## Why this file exists

A design system that declares only colour and typography leaves unanswered the question that
actually consumes time: **how much of the canvas must the content fill, and what register does
each thing take?** Without that written down, every piece re-derives it through cycles of measure,
render, look. That cost four full cycles the first time.

Every rule below has a number, and most are asserted by `../engine/render.mjs`. A number can be
verified; an adjective cannot. **A rule that lives only in this file gets violated** — the author
of this doctrine violated its own first rule within hours of writing it, and only the assertion in
code caught it.

---

## 1. Fill

`fill = (content bottom − content top) / height of the body box`

The body box is the space between the lockup and the foot. **Measure only the content inside that
box.** Including the lockup and the foot — which sit outside it — against the body's height yields
values above 100%, which means nothing.

| Threshold | Reading | Action |
| --- | --- | --- |
| ≥ 90% | Full | Check it has not entered a safe zone |
| 75–89% | Correct | None |
| 65–74% | Timid | Raise the headline register |
| < 65% | Defect | Content is missing, or the type is too small |

A piece with artwork fills with the artwork what it does not fill with text. Measuring text alone
reports a false low, so count the artwork as content or exempt the piece.

## 2. Anchoring

**The body block anchors to the top. It is never centred.**

Centring short copy splits the leftover space above and below. Two medium gaps read as a layout
error; one gap above the foot reads as composition. Verified against the approved reference, which
anchors top and uses artwork to occupy the lower half.

If the lower gap exceeds roughly 35% of the canvas and there is no artwork, the problem is not the
anchoring — it is rule 3.

## 3. Short copy takes poster scale

**The register follows the length of the message, not its semantic level.**

A four-word statement at 42px on a 1080px canvas is a defect, not a decision. A brief assertion is
the piece's headline and takes the headline register.

| Message length | Register |
| --- | --- |
| 1–8 words | The format's largest |
| 9–20 words | Reduced headline, 2–4 lines |
| > 20 words | Body register, and consider splitting into two pieces |

## 4. The focal line is the headline

In a log or record piece, the marked line **is** the headline. It takes the headline register, not
an enlarged body register.

Measured counter-example: a focal line at 36px against a 64px headline in the same system. At feed
thumbnail scale the piece had nowhere for the eye to land and read as a grey block.

**Every piece needs exactly one focal point.** Zero is a texture, not a piece. Two compete.

## 5. The row cap drops content, it does not shrink type

When content exceeds the format, remove elements and keep the register. Never the reverse:
reducing type so everything fits produces a piece that is illegible where it is actually seen.

The cap is per format and always keeps the focal element and its neighbours.

## 6. Safe zones have two tiers

Meta publishes **14% top, 35% bottom, 6% sides** for Stories and Reels. That is the figure for the
**ads** unit, which carries a call-to-action button and disclaimer space an organic story does not,
and Meta publishes no organic-only number.

So:

| Tier | On 1080×1920 | Rule |
| --- | --- | --- |
| **Hard** | y 269 → 1248, x 65 → 1015 | Nothing that carries the message: headline, focal line, foot, URL, contact |
| **Soft** | y 250 → 1670 | Only deliberately dimmed texture, which may be covered without loss |

The engine decides which is which by marking: **texture is tagged `data-texture`, and everything
untagged is treated as message-bearing.** Forgetting a tag therefore fails strict, never permissive.

The 250/1670 bound used before this file existed **did not come from Meta.** It was a widely
repeated third-party figure, and content built against it sits 405px inside Meta's own declared
bottom keep-out.

`justify-content: center` with padding does **not** guarantee a safe zone when the content is
taller than the padded box. Measure it. The verification lives in the engine and exits non-zero;
a check that lives in the head of whoever is producing is not a check.

## 7. The artefact proves the claim

If the copy asserts something, the artefact demonstrates it.

Measured case: a piece asserting "auditable months later" whose five timestamps all fell within
the same night. The copy and the image contradicted each other. Fixed by spreading the dates across
five months, which moved the claim from asserted to demonstrated.

This is the most valuable rule here, because it is not about composition but about honesty, and it
is the one a human reviewer catches late.

## 8. A column header titles a real column

Column headers above stacked rows title nothing. Remove them, or make the layout genuinely tabular.

## 9. Legibility at the scale of consumption

A piece is judged at the size it is seen, not the size it is produced. A 1080px image is consumed
at roughly 400px in a feed: **divide every type size by 2.7** to know whether it reads.

| Size on a 1080 canvas | Real size in a feed | Reading |
| --- | --- | --- |
| 64px | 24px | Headline, reads |
| 36px | 13px | Lower bound of legibility |
| 23px | 8.5px | Texture, not text |
| 14px | 5px | Invisible |

Deliberately dimmed text is valid as texture — but then it cannot carry the message.

## 10. Two assertions geometry cannot make

Both are in the engine because neither is visible to a size or position check:

- **The embedded font family.** A silent operating-system font substitution passes every geometric
  assertion while destroying the brand. Assert the family that actually rendered.
- **Brand colour at a known pixel.** Not the computed style — the real pixel from the PNG. A
  computed style proves the CSS asked for a colour, not that the colour reached the screen past an
  occluding element or a stray opacity.

---

## Measurement traps

Each of these produced a phantom defect, and several were hit twice — once while measuring the
pieces, once while building the engine that measures them.

- **Scope.** Measuring content across the whole frame against the gap *between* the lockup and the
  foot gives fill above 100%. Hit twice, hours apart.
- **Element boxes are clamped by their container.** An inline-block inside a padded flex column
  reports the container's width, not the text's. Measure text through `Range.getClientRects()` over
  its text nodes.
- **An element containing inline markup is not a leaf.** A headline written `TU EMPRESA<br>MÁS
  INTELIGENTE` has a child element, so any filter that skips elements with children **skips the
  most important element on the canvas.** Walk text nodes, not elements.
- **Inherited opacity.** Effective opacity accumulates through ancestors; reading the element's own
  value counts dimmed content as visible.
- **Container clipping.** A rect that exceeds its container under `overflow: hidden` is already
  clipped. Look at the crop before fixing anything.
- **Uncached iframes.** A contact sheet can show the previous layout and make a working fix look
  broken.
- **Measuring at the end of a shot.** In video, measuring fill on the last frame reports as correct
  what was half empty for 80% of its duration. Sample at least six points.
- **Flex children shrink.** With default flex behaviour, adding rows can *reduce* total height.
  Set `flex: none` on the children.
- **A blank page weighs 10KB and looks like a file.** A template whose script throws produces a
  screenshot that passes a file-size check. Assert that measurable content exists.
- **Any measurement before `document.fonts.ready` measures the fallback font.** A layout fitted
  in Arial overflows the right edge in a display face 16% wider, and overlaps the foot in a body
  face that is taller. Fit and measure only after the real fonts load, and have the renderer wait
  for a flag the template sets when it is done. Hit once with a measurement span that did not
  inherit the variable font, and again with a self-fitting template that ran synchronously.
- **When the capture and the measurement disagree, capture one piece alone at exact size before
  concluding.** In one case the measurement was right and the visual reading was wrong.
