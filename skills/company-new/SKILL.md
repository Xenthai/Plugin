---
name: company-new
description: Start a new company engagement — write the .company.json that binds a session to exactly one company, create its folder in the company's own store, and verify the install can reach it. Use at the first session with a company that has no folder and no manifest, when a new client is starting, or when an engagement moves to a different store. Creates the binding and fills no document — to verify a manifest that already exists use doctor, to start gathering documents use company-intake.
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

## What to ask, and what never to guess

Ask for these five in one message. Nothing here can be inferred from a folder name.

| Field | Why it cannot be guessed |
| --- | --- |
| `name` | The commercial name **as it is really written** — accents, casing, `S.A. de C.V.` or not. It goes into client-facing copy from the first piece |
| `id` | A slug, unique across every company you serve, and **permanent**. It keys the journal. Reusing or renaming one silently merges or orphans an engagement's history |
| `store.kind` and `store.root` | Which store, and the folder **id** — never a name and never a link. A name does not prove identity; the id is what the guard compares against |
| `locale` and `timezone` | Decides the language of every document and the dates in every schedule. `es-MX` and `America/Mexico_City` are the defaults, and stating them beats assuming them |
| `regulator` | Empty is a valid answer, but it must be an answer. It is what the claim rules key off later — a health or financial claim has a different legal floor, and finding that out at review is too late |

Leave `legal_name`, `sector` and the `approval` names as `— pendiente —` if nobody present knows
them. They belong to intake, which asks for the constancia fiscal that settles them.

**Never invent an `id` from the company's name without saying so**, and never reuse an existing
one. Check first:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/doctor.mjs" --json
```

## Where the engagement folder lives on this machine

One directory per company, and the manifest at its top. The working directory is what binds the
session, so nesting one engagement inside another makes the outer one unreachable — `readCompany`
walks up and stops at the first manifest it finds.

Never place a manifest in a home directory or a shared parent. A home-level default is the
ambient-authority pattern that makes an operator act on the wrong target in every tool that has
one, and it is the specific failure this file exists to prevent.

## Then verify, and only then hand off

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/doctor.mjs"
node "${CLAUDE_PLUGIN_ROOT}/bin/status.mjs"
```

`doctor` proves the install can reach the store; `status` reports that every document is absent,
which is the correct state for a company that starts today and the fastest way to show the operator
what the engagement will cover.

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event phase_start --capability company \
  --why "engagement opened: manifest written, store root created, doctor green" \
  --target ".company.json"
```

Close by handing off to `company-intake` — the file request is the next thing that happens, and it
needs nobody present, so it should be sent the same day.

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
