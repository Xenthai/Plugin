---
name: setup
description: Run the whole first-visit setup for a client in order, and report at the end which steps are done and which are still owed — the connector, the binding, the adoption of any documents already in their store, both Drive shares, the digest routine, and the handoff to intake. Use at the very first session with a new client, when arriving at a client's machine to install, when asked what to do to get a client started, and when a setup was interrupted and nobody remembers how far it got. Delegates the binding to company-new and the file request to company-intake rather than repeating them.
---

# Setup — the first visit, in the order that works

**Seven steps. Four are yours, three are the skills'.** The ones that get forgotten are the ones
nothing fails without until months later, when a report comes back empty or an import produces posts
with every image missing.

This skill does not do the work of `company-new` or `company-intake`. It sequences them, and it makes
sure the steps around them happen.

## Your first reply is the whole list, before you run anything

**Print the seven steps first.** Not a summary, not "empecemos" — the list, with who does each one
and what it needs, so the operator can read the entire visit before it starts and can see what they
have to ask the client for.

This is the point of the skill. An operator standing at a client's desk needs the list in front of
them, not discovered one step at a time; and the four steps that need a person are the ones worth
knowing about before you are half-way in. Render the table from **The seven steps** below, then the
line about what cannot be automated, then say what you need first.

In the operator's own language. The session's start-up announcement carries that rule.

Only then run the diagnostics. The order matters: a checklist read first is a plan, and a checklist
read after two commands exited 1 is a correction.

## Then read the machine's state — setup, or rescue?

If a `.company.json` already exists up the tree, this is not a first visit — say which company is
bound, and report which of the seven are already done. **A setup that starts over destroys work.**

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/doctor.mjs"
node "${CLAUDE_PLUGIN_ROOT}/bin/status.mjs"
```

**At a fresh client both of these exit 1, and that is the correct result.** Read them before
reporting anything, because the first minute of a setup is where an operator decides whether the
tool works:

| What you will see | What it means |
| --- | --- |
| `SKIP company  no company bound: no .company.json in …` | Right. The company does not exist yet — that is step 2 |
| `doctor … 5 ok, 0 failed, 1 skipped`, exit 1 | Right. A doctor that could not verify something never reports clean, and one skip is what a fresh machine has |
| `status: no company bound (no-manifest)`, exit 1 | Right. There is nothing to have pending yet |
| **Any `FAIL` line** | Wrong, and it stops the setup. `browser`, `fonts` and `engine` failing mean the install is incomplete — reinstall before step 1 |

So the first thing to say is **not** "hay dos errores". It is which of the seven steps this machine
is at, and what you need from whom. Reporting a correct skip as a failure teaches the operator to
ignore this tool's output, and everything else here depends on them not doing that.

## The seven steps

| # | Step | Who does it | What it unblocks |
| --- | --- | --- | --- |
| 1 | **Google Drive authorized** in the client's own connector settings | The client, in a browser | Everything. Without it the skills load and look healthy until the first call fails |
| 2 | **The binding** — manifest, store root, `doctor` green | `company-new` | Every store write |
| 3 | **Documents already in the store adopted**, never overwritten | `company-new` | The client's prior work surviving |
| 4 | **Assets folder shared "anyone with the link"** | A person, in Drive's own interface | Scheduler imports. The most common silent failure |
| 5 | **`digest` folder created, shared with the practice as Lector** | A person, in Drive's own interface | Continuous monitoring |
| 6 | **The digest routine created, and run once with its prompts approved** | Desktop → Rutinas → Nueva rutina → **Local** | The digest existing at all |
| 7 | **`ROUTINES.md` created with the digest already active** | `company-new` | Absence detection |

Then step 8, which is not setup but happens the same day: **hand off to `company-intake`.** The file
request needs nobody present, so it goes out immediately.

## What cannot be automated, and why saying so is the job

Four of these need a person, and none of them is a gap in the plugin:

- **Step 1** is an OAuth consent in a browser. A plugin cannot declare, request or install a
  connector — there is no field for it and no hook that fires when one is missing.
- **Steps 4 and 5** set link and folder permissions. The Drive connector's share can only add a
  named email; "anyone with the link" is not in the API surface the plugin can reach.
- **Step 6** creates a Desktop scheduled task and runs it once to approve its prompts. A routine
  created and never run stalls on its first prompt and stops with no error anywhere.

Tell the operator this plainly at the start. An operator who expects the plugin to do step 4 skips it
and finds out from a client's failed import.

**Gmail is not on the list.** The plugin uses it only to send a finished deliverable, sending always
needs per-message confirmation, and nothing in setup depends on it. Connecting it changes nothing.

## Steps 4 and 5 — the two shares, and the difference between them

They are opposite in kind and mixing them up is the one mistake here with real consequences.

| Folder | Shared with | Why |
| --- | --- | --- |
| assets | **Anyone with the link** | A scheduler fetches media by URL and cannot read a private file |
| `digest` | **The practice's account, as Lector** | Monitoring. Nothing else |

**Never share the company's root folder with the practice.** Standing access to a client's material
has no upside and two costs: it would make the practice a processor of the client's personal data,
and one compromised account would then be every client at once. The digest exists precisely so that
access is unnecessary — it carries counts, dates and verdicts and no company data at all.

## Step 6 — the routine, and the mechanism that is not obvious

The digest is the only routine that needs nobody in the room. It is a **Desktop scheduled task** —
choose **Local**, never Cloud: a cloud routine runs on Anthropic's infrastructure and cannot read
local files, and the journal on this machine is the entire input.

`INSTALL.md` §6b has the fields and the verbatim prompt. Two things about it are not optional:

- **Run it once and approve every prompt with "permitir siempre".** A task whose permission mode
  does not already allow what it needs **stalls waiting for a person** — it does not fail and does
  not retry, so the routine stops with no error anywhere. Then open the file and confirm the date.
- **Only the digest gets scheduled today.** Every other routine waits for its cadence to be agreed
  with the client at mapping close — `SCHEDULING.md` §4 holds each one's configuration, ready to
  create in minutes when that happens. Provisioning six routines now trains the client to ignore all
  of them, which is the exact outcome `ROUTINES.md` refuses.

## Close by reporting the state, not by declaring success

Read the seven back, each marked done or owed with who owes it. Then:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event phase_start --capability company \
  --why "setup: <N> of 7 steps done; owed: <list>" --target ".company.json"
```

An honest "five of seven, and here are the two you owe" is worth more than "listo" — the two that are
owed are the ones that fail silently, and the row is what lets a later session find out where this
stopped.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## STOP conditions

- **Drive is not authorized yet.** Stop at step 1. Steps 2 onward will appear to work and fail at the
  first store call. Say what the client has to do, in their own connector settings.
- **A `.company.json` already exists up the tree.** This is a rescue, not a setup. Report which steps
  are done and never re-run `company-new`.
- **The store folder already holds documents.** Point `store.root` at that folder and let
  `company-new` adopt them. Creating a second folder splits the engagement in two, and nothing later
  can tell which half is real.
- **Nobody present knows the Drive folder id.** Stop rather than accept a name or a link. The guard
  compares ids, and a name does not prove identity.
- **The operator asks you to do step 4 or 5.** You cannot; the connector has no such call. Say so and
  let them do it in Drive while you wait, rather than marking it done.

## Reference material

| File | Read it when |
| --- | --- |
| `INSTALL.md` | Always — it is the machine-level runbook this skill sequences |
| `capabilities/company/doctrine/SCHEDULING.md` | Step 6, and every later routine |
| `capabilities/company/doctrine/INTAKE.md` | The store already holds documents |
| `capabilities/company/doctrine/SESSION.md` | Anything in this visit will be asked of a person |
| `MCP.md` | A connector behaves oddly or a store call fails |
