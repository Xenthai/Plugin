---
name: brand
description: Entry point for a company's brand — who it is, how it sounds, what it may claim, the copy of the pages that sell it and its brand manual. Use when BRAND.md, VOICE.md or PROOF.md is missing or needs revising, when a home, landing, pricing or about page needs copy, or when a brand manual is asked for. Invoke before brand-identity, brand-voice, brand-copy or brand-manual. For posts, plans and publishing use social; for the words inside a product's interface use design.
---

# Brand — router

You establish which brand document is owed and hand off. You write nothing to the store here.

## Step 1 — The binding

Brand work writes to one company's store. Read `.company.json` up the tree and say the bound company's name and id in
your first reply. No manifest, a newer `schema_version` or missing fields: stop and say which, exactly as `social`
does; never infer a company from a folder name.

## Step 2 — What is owed, from the documents

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/status.mjs" --json
```

| What exists in the store | Owed | Hand off to |
| --- | --- | --- |
| The company has public presence and no `PRESENCE.md` | The audit identity is built on | `social-presence` |
| No `BRAND.md`, or every field in it pending | Identity and positioning | `brand-identity` |
| `BRAND.md` and `DESIGN.md`, no `VOICE.md` or `PROOF.md` | Voice and the claims register | `brand-voice` |
| `BRAND.md`, `VOICE.md` and `PROOF.md` exist and a web page needs copy that sells (home, landing, pricing, feature, about) | Page copy | `brand-copy` |
| `BRAND.md` exists and a manual, brand book or printer specification is asked for | The manual | `brand-manual` |

An explicit request from the operator wins, but name the document it skips when the skill it asks for depends on one.

## Step 3 — Record that the phase opened

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability brand --why "<what will be produced>"
```

## Why the order holds

Voice is derived from what the company already published, and judged against who `BRAND.md` says approves a public
claim; without that name, every voice rule is the operator's taste. The manual compiles `BRAND.md` and `DESIGN.md`; run
before them, it invents the brand it claims to document. So identity comes first even when the request is for the
manual, and the skipped document is named rather than quietly produced inside the later skill.

## STOP conditions

- **No company is bound.** Ask which company and where its store lives.
- **The request is a post, a calendar or a handoff.** That is `social`.
- **`brand-copy` is asked for and `PROOF.md` does not exist.** Copy that asserts anything needs the claims register
  first; route to `brand-voice`.
- **The request is a button label, an error message or an empty state.** That is interface copy: `design-ux-copy`.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/social/doctrine/COPY.md` | Any client-facing words are being written |
| `capabilities/brand/doctrine/BRAND-APPLICATIONS.md` | A manual is delivered and applications are on offer |
| `capabilities/company/doctrine/SESSION.md` | An identity or voice session with the client is about to run |
