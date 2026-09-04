---
name: resume
description: Answer where a company's engagement actually stands and what the next step is, then hand off to whichever phase owes it. Use when someone asks what to do next, where the work was left, whether a phase is finished, how far along the mapping is, or to pick the work back up after time away — and use it whenever the person asking is the client's own staff rather than the operator, because they will not know a skill's name and should not have to. Answers from the documents and the journal, never from memory. For the very first visit to a machine with no company bound yet, use setup.
---

# Resume — where this engagement actually stands

The one entry point a client's own people can remember. Everything else in this plugin assumes you
know which phase you want; this one works out which phase is live and sends the work there.

**It decides nothing and produces no document.** It reads state, reports it, and hands off. A skill
that both diagnoses and acts hides which of the two was wrong when the answer is wrong.

## Answer in the language you were asked in

The session's start-up announcement carries the rule, and it matters more here than anywhere else:
this is the skill the client's staff reach, and they ask in whatever language they work in. Report
back in that same language.

The company's **documents** keep the language its `.company.json` declares, whatever language this
conversation happens to be in. Reporting in English never turns a deliverable into English.

## Read state before saying anything

Three reads, in this order, because each one can make the next unnecessary:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/status.mjs" --pending
```

Per document: whether it exists, how many fields are still pending, whether what was written is in
the right language, and **which skill owes each absent one**. That last column is the answer to
"which phase are we in" — not a guess from the conversation.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/report.mjs" --journal <store-root> --month <YYYY-MM> --json
```

When was anything last actually done, and by whom. A document that exists says a phase ran; the
journal says *when*, which is what tells you whether this is a resumption or a restart.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
```

Only if a read failed or a connector looks wrong. A resumption that begins by re-authorising things
that already work wastes the session.

## Then say four things, in this order

1. **Which company is bound**, by name. The operator may have several folders open, and this is the
   cheapest place to catch the wrong one.
2. **What exists and what is pending**, as counts rather than a list. A person who asked "where are
   we" wants a position, not an inventory.
3. **The single next step**, named as one thing with one owner. Not a menu — the next step.
4. **What is blocked, and on whom.** If something waits on the client, say what and who.

Then hand off. `capabilities/company/doctrine/SESSION.md` governs how the next session is run if it
involves asking a person anything.

## Which phase owes what

| What `status` shows | The phase that is live | Hand off to |
| --- | --- | --- |
| No documents at all | Nothing has started | `company-intake` — the file request, which needs nobody present |
| Documents exist, no `INTAKE.md` | Prior work was adopted, intake never ran | `company-intake`, and read `INTAKE.md` doctrine first: those documents are adopted, not captured |
| `PRESENCE.md` absent | The perishable before was never captured | `social-presence`, before anything is produced |
| `BRAND.md` absent | Phase 1 | `social-identity` |
| `BRAND.md` filled, `VOICE.md` absent | Phase 2 | `social-voice` |
| `VOICE.md` filled, `SOCIAL.md` absent | The editorial plan | `social-plan` |
| `PROCESSES.md` absent | Phase 3 | `process-map` |
| `PROCESSES.md` exists, its pain and access sections pending | Phase 4 | `process-access` |
| `BASELINE.md` absent while a process is about to change | The before, and it is perishable | `baseline`, now rather than after |
| Everything filled, months of journal | The engagement is running | `report` for the cadence that is due, `opportunities` for what to improve next |

Read the table against `status`, not against what anyone remembers about the last session.

## What makes an answer wrong here

- **Reporting a phase from the conversation instead of the documents.** The documents are the state.
  A previous session's summary is a claim about the state.
- **Naming more than one next step.** A client who asks where they are and receives three options
  has been handed the decision they came to have made for them.
- **Treating an adopted document as a finished phase.** A filled `BRAND.md` inherited from earlier
  work means phase 1 produced a file, not that its facts have an owner. Say which it is.
- **Skipping the language check.** `status` reports whether each document is in the company's own
  language. A document filled in the wrong one looks finished and is a delivery defect.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## STOP conditions

- **No company is bound.** This is not a resumption. If the machine is new, use `setup`; if a folder
  was simply not opened, say which folder to open rather than creating anything.
- **`status` reports a document in the wrong language.** Say so before reporting progress. It is a
  delivery defect and it outranks the position report.
- **The journal has no rows at all.** Do not read that as no work. The hooks that write it run in
  Claude Code and Cowork and are inactive in chat on the web and in the Desktop Chat tab, so the
  work may have happened where nothing records it. Say which of the two you think it is.
- **Two engagements are nested.** `readCompany` stops at the first manifest up the tree, so a folder
  inside another engagement reports the wrong company. Name both and stop.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/SESSION.md` | The next step involves asking a person anything |
| `capabilities/company/doctrine/INTAKE.md` | Documents exist that this engagement did not produce |
| `capabilities/report/doctrine/REPORTING.md` | A cadence is due |
| `node tools/status.mjs --help` | Before quoting any column from this file |
