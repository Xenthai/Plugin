---
name: social-identity
description: Run onboarding phase 1 for a company that has no identity documents yet — capturing its legal and trade name, sector and regulator, who is authorised to approve public claims, who actually decides, and what it sells to whom. Use when a company's store is empty, when BRAND.md does not exist, or when the operator asks to start or restart a company's onboarding. Produces BRAND.md plus two or three draft pieces the client can look at in the same session. Requires a bound company and is normally reached through the social router rather than directly; for a company that already has BRAND.md, use social-voice instead.
---

# Phase 1 — identity and positioning

> Shell commands below use `${CLAUDE_PLUGIN_ROOT}`. It is guaranteed inside hooks, not inside a
> skill's shell — if it is unset, use the plugin root announced at session start.

One session. Two deliverables: `BRAND.md`, and **two or three draft pieces the client can see
before they leave**.

That second deliverable is not a nicety. A director who spends an hour answering questions and
leaves with a filled-in document has no reason to come back for session two. Draft pieces are the
reason. They will be wrong in voice — voice is phase 2 — and that is fine: say so, and let them
react to something concrete instead of to an abstraction.

## What must be captured, and why each one earns its place

Ask about these. Nothing else is required in phase 1, and a longer instrument measurably reduces
both starts and completions, with late answers arriving faster, shorter and less reliable.

| Fact | What it unblocks | What breaks without it |
| --- | --- | --- |
| Legal entity, and **how the trade name is actually written** | Correct name on every asset and contract | Assets ship under a name the company does not use |
| Sector, and **its regulator** | Knowing which claims are illegal before writing them | A drafted claim exposes the client to a fine |
| Who signs off on public claims | A real approval path | Work approved informally, then killed by the owner |
| **Who actually decides**, not the org chart | Whose priorities the engagement serves | Sessions run with the wrong person; recommendations die unheard |
| What it sells, to whom, and why they buy | Copy that is theirs and not generic | Output indistinguishable from any competitor's |
| Who owns the social accounts, and who has access | The ability to publish anything at all | Work produced that nobody can post |

### Mexican context that changes how you ask

- Decision-making concentrates in one person, usually the owner or Director General. **Interview
  that person.** An org chart will point you at someone who cannot approve anything.
- Most companies here, including large ones, are family-owned, and formal governance is often
  absent regardless of size. Do not assume a board or a marketing department exists — ask.
- Default to **usted** with directors until invited otherwise. Record which register the company
  itself uses in its own material; that is a voice decision, not etiquette.
- The regulator depends on the sector: general and comparative claims fall under PROFECO; health,
  food and pharmaceutical claims under COFEPRIS, which prohibits disease-reduction claims outright;
  financial services add CNBV and CONDUSEF. Record which applies. This is the single fact most
  likely to prevent real harm.

### Use the value-proposition question as a lens, not a form

Ask what the buyer is trying to get done, what goes wrong for them today, and what they would
call a good outcome. Then write the answers as prose in `BRAND.md`. **Do not fill in a canvas and
hand it over** — a filled canvas produces a diagram nobody references again, and the interview is
where the value was.

**Do not use brand archetypes.** The framework has no evidence behind it, and the one peer-reviewed
retest found most brands express several archetypes at once, contradicting its own premise. **Do
not build a persona with an invented name.** Customer bases are heterogeneous within a brand and
overlap across competitors; the test any persona field must pass is "and therefore we write or
publish what?", and most fields fail it.

## What to write

Create `BRAND.md` in the company's store, from `scaffold/company/BRAND.md`. Fill only what was
actually said. **Leave a field marked `— pendiente —` rather than inferring it**, and list every
pending field at the end of the session: an inferred fact reads identically to a captured one six
months later, and that is how invented facts enter a client's brand.

Create `DESIGN.md` from `scaffold/company/DESIGN.md` as well. Fill the fenced `css` block with
the company's colours and families if they are known; leave the plugin's neutral palette in place if
they are not, and mark it pending. The logo goes in as inline SVG when the company has one, as a PNG
path when it does not — the phase does not stop for a vector.

Create `PROOF.md` from its scaffold at the same time, even if it starts nearly empty. Every claim
the client made about themselves that you might later publish goes in as a row with its source and
a re-verification date. A claim with no row is not publishable, so an empty `PROOF.md` is an honest
statement that nothing is publishable yet.

## Then produce the draft pieces

Hand off to `social-produce` with `--min-fill` at the default and the composition doctrine loaded,
and say plainly that voice is not yet calibrated. Two or three pieces is right; a dozen invites
line-by-line critique of copy that is deliberately provisional.

## Record the phase

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event phase_end --capability social \
  --why "phase 1 complete: BRAND.md and PROOF.md created, N fields pending" \
  --target "BRAND.md"
```

Create and change company files with `Write` and `Edit` only. The company guard covers those two;
it cannot see a shell redirect, and the journal would show the violation after the fact rather
than stop it.

Append the conversation to `INTERVIEW.md`: who said each thing, and on what date. Positioning
stated in a session is client-reported until a document or a customer confirms it, and six months
on an inferred claim reads exactly like a captured one.

## STOP conditions

- **The person in the room cannot approve public claims.** Capture what you can, record who must
  approve, and say the phase is incomplete until that person confirms. Do not treat a deputy's
  agreement as approval in a culture where the owner's override is absolute.
- **The sector's regulator is unknown.** Say so and stop before drafting any claim. Writing first
  and checking later is how a fine happens.
- **The client wants pieces published this session.** Nothing produced in phase 1 is publishable:
  voice is uncalibrated and `PROOF.md` is empty. Offer the drafts as drafts.
