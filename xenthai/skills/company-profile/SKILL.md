---
name: company-profile
description: Run operación phase 1 — decide what kind of business this actually is before mapping it, by placing it in an operating archetype, capturing the trade's vocabulary and naming which processes phase 3 should hunt for. Use when a company is bound and 00-PERFIL.md does not exist, when nobody on the team has worked this trade before, when the client's sector label says nothing useful about how their day runs, or when a mapping session is about to start with no idea what to look for. Not the sector field on BRAND.md, which social-identity captures for the regulator. For requesting the company's own documents use company-intake; for deriving quantities from them use company-evidence.
---

# Operación phase 1 — profile and archetype

**Read `capabilities/company/doctrine/PROFILE.md` first.** It carries the four questions, the six
archetypes, what each one changes downstream, and the rule for a trade nobody understands. Do not
re-derive any of it here.

Deliverable: `00-PERFIL.md` in the company store, in es-MX, from `scaffold/company/mapeo-empresa/00-PERFIL.md`. One
session, forty-five to sixty minutes.

## 1 · Bind the company, and name it aloud

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
```

**Say the company's name in your first reply**, before any question. If none is bound, stop and ask
for one — never write a profile into the plugin's own tree.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability company \
  --why "operacion phase 1 profile — archetype and glossary" --target "00-PERFIL.md"
```

## 2 · Read the trade before the room, when the trade is unfamiliar

If nobody on the engagement has worked this kind of business, spend the half hour first. Value
chain, the unit the trade measures itself in, the software it actually runs in this country, its
regulator, its standard metrics, its season.

Record what was read and what was learned in `00-PERFIL.md`. **Mark every line of it as a hypothesis
about the trade, never as a fact about this company**, and confirm each one in the room. Arriving
with a printed list of "your processes" and reading it out replaces a diagnosis with a template, and
the client can tell.

Skip this step when the trade is familiar. Do not skip it to save forty minutes on a trade that is
not.

## 3 · The four questions, in conversation

Ask them one at a time, in their words, and let the answers run. They are in the doctrine; what
matters here is how they are handled.

**Question 4 — what stops them selling twice as much tomorrow — is the one that decides what is
worth automating and the one the owner answers worst.** Write down what they say and mark it as
their claim. Do not argue with it. Phase 2 will test it against records, and an owner told in
conversation that their diagnosis of their own company is wrong stops volunteering things.

## 4 · Build the glossary as you go

Ask once, early: *"¿qué palabras usan aquí que alguien de fuera no entendería?"*

Then, every time a term goes past that is not fully understood, **stop and ask.** This is the rule
that costs the most to break and the least to keep. A term half-understood now is a mis-scoped
automation in phase 5.

Record the term, what it means here, and — when it differs — what the same word means outside.

## 5 · Assign the archetype, and say it back

Choose from the six, declare a mixture, or write a new one with the doctrine's columns. Justify it
in two lines.

Then validate aloud: *"entonces esto se parece más a un negocio de X que de Y, ¿es correcto?"* That
sentence corrects more wrong assumptions than any question in the session. If there is a mixture,
establish **which line carries the higher margin** — not the higher revenue — because that is the
one phase 3 maps first.

## 6 · Write the adapted plan

The part that makes the profile worth a session rather than a form. From the doctrine's §3 table,
write into `00-PERFIL.md`:

- Which support activities this archetype forgets, so phase 3 goes looking for them by name.
- Where this archetype's durable evidence lives, which is phase 2's shopping list.
- The first quantity worth having.
- The trade's unit of measure, which becomes the natural key of every later automation.
- Which regulator to verify, handed to `social-identity` rather than answered here.
- Which sensitive data categories this trade touches, per `CONTROLS.md`.

## 7 · Close on scope, not on findings

Before ending, get agreed and written: how many sessions this looks like, **who besides the owner
has to be in the room and for which phase** — insist on whoever does the work, because phase 3 fails
without them — what may be reviewed and what may not, and which documents the client should have
ready. `company-intake` owns the request; this session names what to request.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event delivery --capability company \
  --why "operacion phase 1 profile captured" --target "00-PERFIL.md"
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_end --capability company \
  --why "operacion phase 1 complete, archetype assigned" --target "00-PERFIL.md"
```

Never put the archetype, the trade, a process name or any client content in `--why` or `--detail`.

Then run `coverage` and tell the client what is missing before the next session.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## STOP conditions

- **No company is bound.** Ask for the binding. Never write a profile into the plugin tree.
- **The client wants to skip straight to the process inventory.** Explain once: an inventory run
  without knowing the archetype misses the support activities this kind of business forgets, and
  those are where the repetitive work lives. Then respect the decision and journal it as theirs,
  naming them.
- **The four questions produce four confident answers and none of them agree with each other.** That
  is the finding. Record all four verbatim, assign the archetype provisionally, mark it provisional
  on the document's face, and let phase 2 settle it.
- **The company has two lines so different they are two businesses.** Say so. Two partial maps are
  worth more than one that blends them, and the blended one is the failure mode.
- **The trade is regulated in a way nobody in the room can describe.** Record it as pending, route to
  `REGULATORS-MX.md`, and do not guess. A wrong regulator is worse than an absent one.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/PROFILE.md` | Before the session, always. The four questions, the six archetypes, the glossary rule |
| `capabilities/company/doctrine/SESSION.md` | Before any session that fills a document by asking a person |
| `capabilities/company/doctrine/REGULATORS-MX.md` | When the trade's regulator has to be named |
| `scaffold/company/mapeo-empresa/00-PERFIL.md` | At the start of writing — it is the skeleton to copy |
| `skills/company-evidence/SKILL.md` | Only to say what comes next. Never run it in this session |
