---
name: brand-copy
description: Use when writing, rewriting or reviewing persuasive copy for a company's web page — home, landing, pricing, feature or about — or its headlines, value proposition or page calls to action, once the company has VOICE.md and PROOF.md; if either is missing use brand first, for words inside a product interface use design-ux-copy, for posts and campaigns use social.
---

# Brand copy — a page that argues with the company's voice and only its proven claims

This skill writes the copy of a company's web pages so a stranger understands in seconds what the company does, for
whom and what to do next, and so every persuasive statement on the page is one the company can prove. It works for a
bound company only: the voice comes from that company's `VOICE.md`, every claim from a live row in its `PROOF.md`, the
reader from its `CUSTOMERS.md`. The output is an annotated markdown file in the company store, reviewed by the client
before anything is published. It does not write interface microcopy (`design-ux-copy`) or social pieces (`social`).

## Preconditions

1. **Binding.** Read `.company.json` up the tree and say the bound company's name and id in the first reply. No
   manifest, an unrecognised kind or schema: stop, as `brand` does.
2. **Documents.** In the store's `comunicacion/` folder, `VOICE.md` and `PROOF.md` exist and are not all pending;
   `BRAND.md` names who approves a public claim and which regulator applies. Read `CUSTOMERS.md` and the offer
   documents too.
3. **Page.** Which page, its job, where its visitors come from. Unknown: ask once, in one batched question.

## Procedure

1. **Open the phase.**

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability brand --why "page copy: <page>"
   ```

2. **Write the page brief**: job, readers by role, primary and secondary action, the `PROOF.md` rows available, the
   customer's own phrases (`capabilities/brand/doctrine/PAGE-COPY.md`).
3. **Inventory claims before drafting.** List every claim the page would want to make. Each one gets its live row, or
   is rewritten as mechanism, or is cut. Expired rows count as missing. A regulated claim is checked against the
   regulator `BRAND.md` names now, not at review.
4. **Draft the sections** in the default order (hero, problem, how it works, proof, objections, close), adapted to the
   page type, in es-MX and the company's voice.
5. **Generate headline and CTA alternatives** from different angles; recommend one of each with the reason.
6. **Run both questions of `capabilities/social/doctrine/COPY.md`** on every section: a live row for every claim, and
   could a named competitor publish it unchanged. A section that fails is rewritten, not softened.
7. **Check against `VOICE.md`**: deny-list words, substitution pairs, register. A sentence that fits the voice rules
   but not the rewrite examples' rhythm is rewritten.
8. **Write the file** to the store as `comunicacion/paginas/<page-slug>-v<N>.md`, slug in English, a new file for each
   revision, through `Write` or `Edit` only.
9. **Hand off for review.** A review document derived from the markdown, where comments are the approval; then record
   it:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability brand --why "page copy for review" --target "comunicacion/paginas/<page-slug>-v<N>.md"
   ```

## Always-on rules

1. No claim without a live `PROOF.md` row. Outcomes, numbers, client names, logos, testimonials, credentials,
   prices, guarantees, deadlines and comparisons are all claims.
2. Without a row, be specific about the mechanism, never vague about a result and never inventive about one.
3. Clarity beats cleverness; the customer's words beat the company's.
4. One page, one job, one primary action sized to the reader's stage.
5. Every benefit names the feature behind it and the change it makes for the reader.
6. The visual beside a claim demonstrates it; no stock imagery as evidence.
7. No headline or CTA opens with a negation; no urgency that is not real and registered.
8. Client-facing copy is es-MX, *usted* unless `VOICE.md` records otherwise.
9. The output is annotated: every section's job, rule and rows; alternatives; meta; a claims table; open questions.
10. Nothing is published from this skill. Publication follows the client's approval on the review document.

## Conflicts resolved

1. **Specificity versus proof.** Generic copywriting advice says use concrete numbers; the claims register forbids
   unproven ones. Resolution: concreteness moves from the result to the mechanism until a row exists.
2. **Social proof formulas.** "N teams use it" and logo strips are standard; here each needs a row and recorded
   permission, and a missing one removes the section rather than leaving a placeholder.
3. **Negative-hook headlines** ("Never X again", "Stop X") are common templates; the company doctrine forbids opening
   with a negation, so those angles are rewritten in the affirmative.
4. **Hard CTAs everywhere.** Business buyers research silently in committees; the page offers a low-commitment path
   beside the primary action instead of demanding a meeting on every screen.

## STOP conditions

- **No company is bound.** Ask which company and where its store lives; write nothing.
- **`VOICE.md` or `PROOF.md` is missing or all pending.** Stop and route to `brand`, naming the missing document.
- **The client insists on a claim with no row.** Leave it out, say why once, and record their insistence in the
  register as `brand-voice` does.
- **A regulated claim and no regulator in `BRAND.md`.** Stop that section until the sector is recorded.
- **The request is interface text** (a button inside the product, an error). Route to `design-ux-copy`.
- **The request is a post, campaign or calendar.** Route to `social`.

## Reference files

| File | Open when |
|---|---|
| `capabilities/brand/doctrine/PAGE-COPY.md` | Writing the brief, structuring sections, tying benefits to rows, writing headlines and CTAs, assembling the output file |
| `capabilities/social/doctrine/COPY.md` | Before any sentence: the two questions, the never list, language and regulated claims |
| `skills/brand-voice/SKILL.md` | A claim needs a new row, or the client insists on an unverifiable one |
| `skills/social-plan/SKILL.md` | Checking what the committee-buyer assumption says and how it is recorded |
