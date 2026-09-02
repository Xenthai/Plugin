---
name: process
description: Entry point for capturing how a company actually works and what of it can be automated — onboarding phases 3 and 4, the Diagnóstico and the Mapeo integral. Use when asked to map or document processes, to write down how something is done today, to find what should be automated first, to price an automation, or when a company is ready to move past its identity and communication documents. Also use when the client asks who would have to approve an automation, or what an AI must never be allowed to do. For communication work — editorial plans, posts, carousels, brand or voice documents — use the social router instead. For measuring a before so a later gain can be defended, use baseline; if that skill is not installed here, say so rather than improvising a measurement.
---

# Process — the router for phases 3 and 4

> Shell commands below use `${CLAUDE_PLUGIN_ROOT}`. It is guaranteed inside hooks, not inside a
> skill's shell — if it is unset, use the plugin root announced at session start.

You route. You do not capture processes here: phase 3 is `process-map`, phase 4 is
`process-access`. Read the doctrine before either.

## 1. Bind the company, and name it aloud

Nothing about a client lives in this repository. Confirm the binding before anything else:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/doctor.mjs"
```

The `company` check either names the bound company or says plainly that none is bound.

**Say the company's name in your first reply**, before any question. The whole capability writes
into that company's store, and a session that captured a client's processes into the wrong tree is
not recoverable by apology. If no company is bound, stop and ask for one — do not capture into the
plugin's own directory.

## 2. Detect the phase from what exists, not from what the client says

The client will say "we want to automate things". That sentence fits both phases. Look at the store:

| What is in the company store | Phase | Route to |
| --- | --- | --- |
| No `PROCESSES.md` | **3 — Diagnóstico** | `process-map` |
| `PROCESSES.md` exists, but its pain-point and access sections are still `— pendiente —` | **4 — Mapeo integral** | `process-access` |
| `PROCESSES.md` complete in both | Neither | Ask what changed: a new process to add, a revision after something broke, or a shortlist to re-score. Do not re-run a phase to look busy |

Phase 3 and phase 4 are **one session each**. Two sessions is the product; compressing both into one
produces an inventory nobody had time to check and an access map built on it.

**The process phases do not depend on `BRAND.md`, `VOICE.md` or `PROOF.md`.** A process inventory
needs no voice. If the identity documents are missing, note it once and continue — never gate this
capability behind them. What `PROOF.md` does gate is a published *claim* about savings, which is a
later concern, not this one.

## 3. Record the phase, then hand off

Before handing off to the phase skill:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event phase_start --capability process \
  --why "phase 3 diagnostico — process inventory" --target "PROCESSES.md"
```

Use `--why "phase 4 mapeo integral — pain, access and automation shortlist"` for phase 4. The
journal is the company's own audit trail: the row is what later proves when the capture happened
and against which plugin version, so record it before the work, not after.

Never put client content in `--why` or `--detail`. The name of a process is client content.

## 4. What this capability is not

| The client wants | Route to | Why not here |
| --- | --- | --- |
| An editorial plan, posts, a carousel, a brand or voice document | the `social` router | Different capability, different documents, different approval gate |
| A measured "before" so a later improvement can be defended | `baseline` — and if it is not installed here, say so plainly | Cycle time, touch time and throughput are measurements, not captures. Guessing them here would poison every later comparison |
| A quote for building the automation | Stays here, but only after phase 4 | The exception rows and the integration surfaces are the quote. Without them there is nothing to price |

## 5. STOP conditions

- **No company bound.** Ask for the binding. Never write a client's processes into the plugin tree.
- **The client wants to skip phase 3 and go straight to automation.** Explain once: an automation
  scoped without a captured process inherits every exception nobody wrote down, and exception
  handling is roughly 80% of the real build effort. Then respect their decision and journal it as
  their call, naming them.
- **Only management is available for phase 3.** That is `process-map`'s STOP condition, and it does
  not block the session — it makes the inventory provisional. Route anyway and let that skill mark
  it.

## Reference table

| File | Read it when |
| --- | --- |
| `capabilities/process/doctrine/PROCESS.md` | Before phase 3 or phase 4, always. Carries the SIPOC boundary prompt, the capture and governance fields, the scoring criteria and their provenance, and the Mexican specifics |
| `skills/process-map/SKILL.md` | Routing to phase 3 |
| `skills/process-access/SKILL.md` | Routing to phase 4 |
| `scaffold/company/PROCESSES.md` | Phase 3 needs the inventory skeleton to copy into the store |
