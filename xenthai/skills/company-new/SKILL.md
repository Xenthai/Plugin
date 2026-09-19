---
name: company-new
description: Start a new company engagement — write the .company.json that binds a session to exactly one company, create its folder in the company's own store, and verify the install can reach it. Use at the first session with a company that has no manifest yet — including one whose store already holds documents from earlier work — when a new client is starting, or when an engagement moves to a different store. Creates the binding and fills no document — to verify a manifest that already exists use doctor, to start gathering documents use company-intake.
---

# New company — the binding, before anything else

One session, and a short one. Deliverables: a filled `.company.json`, the company's folder in its
own store, and a green `doctor`. **No company document is written here** — that is intake's work,
and mixing the two hides a failed binding behind a busy session.

Everything downstream assumes exactly one company is bound. Getting this wrong is the one mistake
in the whole system that is both invisible and permanent: a duplicated `id` merges two clients'
journals, and a wrong `store.root` writes one client's material into another's Drive. Neither
announces itself.

## The order is forced by the guard, not by preference

The company guard vetoes a **store** write when no company is bound, and permits a **local** write
when none is. So the manifest is written first, on purpose:

1. **Write `.company.json` locally** with `store.root` as `null`. Permitted — nothing is bound yet.
2. The session is now bound. Store writes are unlocked.
3. **Create the company's root folder** in its store.
4. **Edit `.company.json`** to hold the real folder id.
5. **Run `doctor`.** It fails while `store.root` is null, which is what makes step 4 impossible to
   forget.

Do not try to create the folder first. It will be vetoed, and the veto is correct — a store write
with no bound company is how material lands in the wrong client's Drive.

If the operator already created the folder in the store's own interface, skip steps 2–3 and write
the id straight into the manifest. That is not a worse path; it is one fewer thing to get wrong.

## Before you finish: list what is already in the folder

A store is not always empty when this plugin arrives. Previous work, a pilot, or an operator who
started filling documents by hand leaves files there, and they are usually the most useful material
available.

So after step 4, **list the folder's contents with each file's last modification date** — a read, so
nothing is blocked — and report what is there. Then two rules, and the first is absolute:

- **Never create a scaffold on top of a file that already exists.** That destroys the only copy of
  work somebody did, and no later session can tell it happened.
- **An inherited document is adopted, not captured.** It has no name in `04-evidencia/ENTREVISTAS.md`, no
  `PROOF.md` row and no measurer — so nothing in it may be published, reported or automated against
  until its provenance is re-established. `capabilities/company/doctrine/INTAKE.md` carries why, and
  the one case where keeping an unverified figure is still right.

Record the boundary between what this install can account for and what it inherited:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event migration --capability company \
  --why "adopted <N> pre-existing documents from work predating this install" --target "<store root>"
```

Then hand off to `company-intake`, telling it what is already there. Intake's job is to request what
is missing, and a request listing files the client can see in their own folder reads as not having
looked.

## What to ask, and what never to guess

Ask for these five in one message. Nothing here can be inferred from a folder name.

| Field | Why it cannot be guessed |
| --- | --- |
| `name` | The commercial name **as it is really written** — accents, casing, `S.A. de C.V.` or not. It goes into client-facing copy from the first piece |
| `id` | A slug, unique across every company you serve, and **permanent**. It keys the journal. Reusing or renaming one silently merges or orphans an engagement's history |
| `store.kind` and `store.root` | The provider — `drive` or `onedrive` — and the folder **id**, never a name and never a link. A name does not prove identity; the id is what the guard compares against |
| `store.tools` | OneDrive only: the create tool's name and parameter names, read from the connector's own schemas in this session, never guessed. `MCP.md` says why |
| `locale` and `timezone` | Decides the language of every document and the dates in every schedule. `es-MX` and `America/Mexico_City` are the defaults, and stating them beats assuming them |
| `regulator` | Empty is a valid answer, but it must be an answer. It is what the claim rules key off later — a health or financial claim has a different legal floor, and finding that out at review is too late |

Leave `legal_name`, `sector` and the `approval` names as `— pendiente —` if nobody present knows
them. They belong to intake, which asks for the constancia fiscal that settles them.

**Never invent an `id` from the company's name without saying so**, and never reuse an existing
one. Check first:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs" --json
```

## Where the engagement folder lives on this machine

One directory per company, and the manifest at its top. The working directory is what binds the
session, so nesting one engagement inside another makes the outer one unreachable — `readCompany`
walks up and stops at the first manifest it finds.

Never place a manifest in a home directory or a shared parent. A home-level default is the
ambient-authority pattern that makes an operator act on the wrong target in every tool that has
one, and it is the specific failure this file exists to prevent.

**Where the working directory IS the home** — a cloud container — keep the rule one of two ways, in
this order: set `XENTHAI_COMPANY` to a manifest in its own folder, which beats the directory walk;
or, only when there is no other directory, declare `"binding": "ephemeral"` and say out loud that
the disk does not survive the session. `doctor` fails on an undeclared manifest at a home directory.
`capabilities/company/doctrine/CONTROLS.md` §1c carries why both exist.

## Then verify, and only then hand off

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
node "${CLAUDE_PLUGIN_ROOT}/tools/status.mjs"
```

`doctor` proves the install can reach the store; `status` reports which documents exist and which
phase owes each absent one, which is the fastest way to show the operator what the engagement will
cover. For a company starting today every document is absent, and that is the correct state. For a
company whose store already held work, the documents `status` finds are the adopted ones — say so
when you report it, or the operator reads inherited material as material this engagement produced.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event phase_start --capability company \
  --why "engagement opened: manifest written, store root created, doctor green" \
  --target ".company.json"
```

## Close by reading the remaining setup out loud, in order

The binding is one step of a setup with seven, and the ones that get forgotten are the ones nothing
fails without — until months later, when a report is empty or an import produces posts with missing
images. So do not end this session with "listo": end it by reading this back, marked.

| # | Step | What it unblocks | Who |
| --- | --- | --- | --- |
| 1 | Drive authorized in the client's own connector settings | Everything. Without it the skills load and look healthy until the first call | The client, in a browser |
| 2 | This binding — manifest, store root, `doctor` green | Every store write | Done, here |
| 3 | Documents already in the store adopted, not overwritten | The client's prior work survives | Done, here |
| 4 | Assets folder shared **anyone with the link** | Scheduler imports. Skipping it is the most common silent failure | A person, in Drive's own interface |
| 5 | `digest` folder created and shared with the practice as **Lector** | Continuous monitoring, and it is the only part that runs with nobody present | A person, in Drive's own interface |
| 6 | The digest routine created **and run once**, approving its prompts | The digest actually appearing. A routine nobody ran once stalls on its first permission prompt and stops in silence | Desktop → Rutinas → Nueva rutina → Local |
| 7 | `09-rutinas.md` created, with the digest routine already active | Absence detection. **A routine nobody wrote down cannot be noticed missing** | Done, here — see below |
| 8 | `journal` folder in the store, and the binding declared | The journal outliving the machine. On an ephemeral binding it is the difference between an engagement with evidence and one without | Done, here |

`INSTALL.md` §6b carries the exact commands for 5 and 6. Gmail is **not** on this list: the plugin
uses it only to send a finished deliverable, sending always needs per-message confirmation, and
nothing here depends on it. Connect it or not; it changes nothing about setup.

### Create `09-rutinas.md` here, not at mapping close

The digest routine is scheduled during setup, so if `09-rutinas.md` does not exist yet, **the one
routine that is already running is recorded nowhere and its absence cannot be detected** — the exact
failure `capabilities/report/doctrine/REPORTING.md` §2b is about, committed by the document that
exists to prevent it.

Instructing it in prose was not enough: it was skipped in a first session and nobody noticed for two
days. So run the command, which either exits 0 or does not:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/scaffold.mjs" --document mapeo-empresa/09-rutinas.md
```

It refuses to overwrite (exit 1) — on a company whose store already held a `09-rutinas.md`, that
refusal is the correct outcome and the existing file is read, not replaced. Then copy the result
into the store through the connector: the CLI has no credentials and writes only the local copy.

The digest row ships already filled and active. Every reporting cadence stays `— pendiente —`:
those are agreed at mapping close, with the client, and a cadence not activated there gets no report.

### If the binding is ephemeral, close the loop before the session ends

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal-sync.mjs" --stage
```

Put the file(s) it names into the company's `journal/` folder keeping the names — through the
transport hook's `emit` line (`INSTALL.md` §5b; writing that hook is part of opening a company),
otherwise through the connector — then read each file's metadata back and record `--receipt
--month <YYYY-MM> --file-id <id>:<fileSize>`. A size that differs from what was staged is refused.
`capabilities/company/doctrine/CONTROLS.md` §1b carries why the upload stays an advisory control.

Then hand off to `company-intake` — the file request needs nobody present, so it should be sent the
same day.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

## Reference material

| File | Read it when |
| --- | --- |
| `scaffold/company/.company.json.template` | Writing the manifest — it carries every field and why each exists |
| `INSTALL.md` | The machine itself is new: connectors to authorize, the browser check, the sharing step |
| `MCP.md` | A store call fails or a connector behaves oddly |
| `capabilities/company/doctrine/INTAKE.md` | Immediately after, to send the file request in the same session |

## STOP conditions

- **A `.company.json` already exists up the directory tree.** You are inside another engagement.
  Say which company is bound and where its manifest is; do not create a second one below it.
- **The proposed `id` is already in use by another company you serve.** Refuse it and ask for
  another. This is the failure with no recovery: once two engagements share an id, their journals
  cannot be told apart afterwards.
- **Nobody present knows the folder id.** Stop rather than accept a folder name or a link. Ask for
  the id, or create the folder yourself once the manifest is written.
- **The client offers a login so you can "set up the Drive yourself".** Decline. Record which role
  holds the access and ask them to create the folder and send the id.
- **`doctor` is not green.** Do not start intake on a binding that cannot reach the store. A
  failed connector discovered now costs minutes; discovered at the first delivery it costs the
  client's confidence.
