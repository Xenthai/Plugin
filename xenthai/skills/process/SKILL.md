---
name: process
description: Entry point for the operación track — capturing how a company actually works and what of it can be automated. Routes to the profile, the evidence sweep, the Diagnóstico, the Mapeo integral or the specification, whichever the company's documents say is live. Use when asked to map or document processes, to write down how something is done today, to find what to automate first, to price or scope an automation, or when the client asks who must approve an automation or what an AI must never be allowed to do. For communication work — editorial plans, posts, brand or voice documents — use the social router instead. For measuring a before, use baseline; for what is still missing, use coverage.
---

# Process — the router for the operación track

You route. You do not capture anything here. Read the phase's doctrine before handing off.

**The operación track is numbered on its own.** The comunicación track keeps phases 0, 1 and 2 and
is reached through the `social` router. The two do not depend on each other, and a phase number is
meaningless in this plugin without the track that qualifies it.

## 1. Bind the company, and name it aloud

Nothing about a client lives in this repository. Confirm the binding before anything else:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
```

The `company` check either names the bound company or says plainly that none is bound.

**Say the company's name in your first reply**, before any question. The whole capability writes
into that company's store, and a session that captured a client's processes into the wrong tree is
not recoverable by apology. If no company is bound, stop and ask for one — do not capture into the
plugin's own directory.

## 2. Detect the phase from what exists, not from what the client says

The client will say "we want to automate things". That sentence fits both phases. Look at the store —
one command reports which documents exist and how many fields in each are still pending, which is
the distinction the table below turns on:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/status.mjs" --json
```


| What is in the company store | Phase | Route to |
| --- | --- | --- |
| No `PROFILE.md` | **1 — Perfil** | `company-profile` |
| `PROFILE.md` exists, no `PROCESSES.md`, and the company's folders or mail are reachable | **2 — Evidencia** | `company-evidence` |
| No `PROCESSES.md`, and nothing is reachable to sweep | **3 — Diagnóstico** | `process-map`, and say that phase 2 was skipped for lack of material |
| `PROFILE.md` exists, no `PROCESSES.md` | **3 — Diagnóstico** | `process-map` |
| `PROCESSES.md` exists, but its pain-point and access sections are still `— pendiente —` | **4 — Mapeo integral** | `process-access` |
| `PROCESSES.md` complete, a candidate approved by name and date | **5 — Especificación** | `automate-spec` |
| `PROCESSES.md` complete, nothing approved | Neither | Ask what changed: a new process to add, a revision after something broke, or a shortlist to re-score. Do not re-run a phase to look busy |

**Each phase is one session.** Compressing two into one produces an inventory nobody had time to
check and an access map built on it.

**Phase 2 runs before phase 3, never after.** The value is the contrast between what the records
show and what people say, and interviewing first anchors the numbers before they can be tested.
`EVIDENCE.md` §2 carries why.

Before routing, and again at the close of any session, run `coverage`: it says which blocking fields
are still missing and whether the next phase may start at all.

**The process phases do not depend on `BRAND.md`, `VOICE.md` or `PROOF.md`.** A process inventory
needs no voice. If the identity documents are missing, note it once and continue — never gate this
capability behind them. What `PROOF.md` does gate is a published *claim* about savings, which is a
later concern, not this one.

## 3. Record the phase, then hand off

Before handing off to the phase skill:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability process \
  --why "operacion phase 3 diagnostico — process inventory" --target "PROCESSES.md"
```

Use `--why "operacion phase 4 mapeo integral — pain, access and automation shortlist"` for phase 4,
and the matching string for phases 1, 2 and 5. The
journal is the company's own audit trail: the row is what later proves when the capture happened
and against which plugin version, so record it before the work, not after.

Never put client content in `--why` or `--detail`. The name of a process is client content.

## 4. What this capability is not

| The client wants | Route to | Why not here |
| --- | --- | --- |
| An editorial plan, posts, a carousel, a brand or voice document | the `social` router | Different capability, different documents, different approval gate |
| A measured "before" so a later improvement can be defended | `baseline` — and if it is not installed here, say so plainly | Cycle time, touch time and throughput are measurements, not captures. Guessing them here would poison every later comparison |
| A quote for building the automation | `automate-spec`, and only after phase 4 | The exception rows and the integration surfaces are the quote. Without them there is nothing to price |

## 5. STOP conditions

- **No company bound.** Ask for the binding. Never write a client's processes into the plugin tree.
- **The client wants to skip the capture phases and go straight to automation.** Explain once: an automation
  scoped without a captured process inherits every exception nobody wrote down, and exception
  handling is roughly 80% of the real build effort. Then respect their decision and journal it as
  their call, naming them.
- **Only management is available for phase 3.** That is `process-map`'s STOP condition, and it does
  not block the session — it makes the inventory provisional. Route anyway and let that skill mark
  it.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/process/doctrine/PROCESS.md` | Before phase 3 or phase 4, always. Carries the SIPOC boundary prompt, the capture and governance fields, the scoring criteria and their provenance, and the Mexican specifics |
| `capabilities/company/doctrine/PROFILE.md` | Routing to phase 1 — the archetype decides what phase 3 hunts for |
| `capabilities/company/doctrine/EVIDENCE.md` | Routing to phase 2 |
| `capabilities/automate/doctrine/SPEC.md` | Routing to phase 5 |
| `skills/company-profile/SKILL.md` | Routing to phase 1 |
| `skills/company-evidence/SKILL.md` | Routing to phase 2 |
| `skills/process-map/SKILL.md` | Routing to phase 3 |
| `skills/process-access/SKILL.md` | Routing to phase 4 |
| `skills/automate-spec/SKILL.md` | Routing to phase 5 |
| `skills/coverage/SKILL.md` | Before every route, and at the close of every session |
| `scaffold/company/PROCESSES.md` | Phase 3 needs the inventory skeleton to copy into the store |
