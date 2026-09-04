---
name: social
description: Mandatory entry point for any social or content work on behalf of a company — posts, images, carousels, video or text for Instagram, LinkedIn, Facebook, TikTok, X or WhatsApp; a new company's brand, voice or proof documents; an editorial plan; or packaging finished assets for someone to publish. Also use when asked which onboarding phase a company is in, or when social work should resume. Invoke before any social-identity, social-voice, social-plan, social-produce or social-handoff — those assume a bound company and a known phase, and this establishes both. For process mapping and automation scoping, this is the wrong skill.
---

# Social — router

You are the entry point, not the worker. Your job is to establish two facts and then hand off.
Doing the phase work yourself skips the gates that keep a client's published claims true.

## Step 1 — Name the bound company out loud, before anything else

Read `.company.json` from the working directory tree.

**State the bound company's name and id in your first reply, every session.** This is not a
formality. The session's whole authority comes from that manifest, and an operator who cannot see
which company they are bound to is the failure mode this exists to prevent — a repeated
confirmation dialog is ignored within a week, whereas a name printed in every reply is caught by
someone half-watching the screen.

**STOP if any of these is true.** Do not proceed, do not offer to create the manifest yourself
without being asked, and do not guess a company from the directory name:

| Condition | What to say |
| --- | --- |
| No `.company.json` anywhere up the tree | This session is not bound to a company. Ask which company, and where its store lives, before any work. |
| `schema_version` higher than the plugin understands | The manifest was written by a newer version of this plugin. Refuse and say so — migrating down is guesswork. |
| Required fields missing | Name exactly which fields, and stop. |

## Step 2 — Determine the phase from the documents, never from memory

Read what exists in the company's store. The documents **are** the state; there is no separate
progress file, because a skill is one-shot and cannot be resumed, so state that lives anywhere
else is lost the moment a session is interrupted.

One command answers this in full, and answers it better than reading each document — it counts the
pending fields, so a document that exists but is entirely unfilled shows as the unstarted phase it
actually is:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/status.mjs" --json
```

| What exists in the store | Phase | Hand off to |
| --- | --- | --- |
| No `PRESENCE.md`, and the company has any public presence at all | **0 — presence audit** | `social-presence` |
| Nothing, or only a folder, and `PRESENCE.md` is done or the company has no public presence | 1 — identity | `social-identity` |
| `BRAND.md` and `DESIGN.md` exist but no `VOICE.md` | 2 — voice and proof | `social-voice` |
| `BRAND.md` + `VOICE.md` + `PROOF.md`, no plan for the target period | 3 — plan | `social-plan` |
| A plan exists and is approved, no assets produced for it | 4 — produce | `social-produce` |
| Assets exist for an approved plan, not yet packaged | 5 — handoff | `social-handoff` |

When two readings are possible, say which you chose and why in one line, then proceed. When the
operator names a phase explicitly, that wins — but say so if it skips a phase whose output the
named phase depends on.

## Step 3 — Record that the phase opened

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability social --why "<phase and what it will produce>"
```

Run `--help` on that script if you need the option list. Do not read its source; it is longer than
its interface and costs context for nothing.

## What you never do

- **Never write to the company's store in this skill.** Routing is read-only. A write here means
  the phase skill's gates were bypassed.
- **Never invent a fact about the company.** If a document does not say it, it is not known. The
  documents are the specification.
- **Never skip a gate because the operator is in a hurry.** The two approval gates — the plan, and
  the first batch — exist because a wrong judgement propagates to every piece produced after it.

## STOP conditions

Routing wrong is worse than not routing. In each of these, say what you found and ask:

- **No company is bound.** Nothing here works without one, and guessing from the folder name is how
  work lands in the wrong company's store. Ask which company, and bind it.
- **The documents point at two different phases** — `BRAND.md` complete but `VOICE.md` untouched
  while `SOCIAL.md` already holds a plan. Someone worked out of order, or two people worked in
  parallel. Name both readings and let the operator pick; do not average them.
- **A document exists but every field in it is still pending.** That is not a completed phase. Read
  it as absent and say so, rather than routing past it.
- **The operator asks for a piece and no phase has run.** Producing from nothing invents the brand.
  Say which phase is missing and what it costs to skip it — then route there, not to production.
- **The request is not social at all** — a process to map, a baseline to measure, prices to
  capture. Hand it to `process`, `baseline` or `company-offer` instead of stretching this router.

## Reference material

Load these only when the condition applies. They are long on purpose and cost nothing until read.

| File | Read it when |
| --- | --- |
| `capabilities/social/doctrine/LAYOUT.md` | Anything visual is being composed or reviewed |
| `capabilities/social/doctrine/COPY.md` | Any client-facing words are being written |
| `capabilities/social/engine/formats.json` | A platform limit, size or safe zone is in question |
| `MCP.md` (repo root) | The store is unreachable, or a connector's behaviour is in doubt |

## The two hard rules that outrank convenience

1. **Nothing publishable that is not verifiable.** No outcome figure, client name, credential,
   timeline or comparison enters client-facing text without a row in that company's `PROOF.md`
   naming its source and its re-verification date. A claim whose row has expired is not publishable
   until it is re-verified.
2. **The artefact proves the claim.** If the copy asserts something, the image or document must
   demonstrate it. Copy that says "months of history" beside timestamps from a single night is a
   contradiction a reader will find, and it is the kind of error a reviewer catches late.
