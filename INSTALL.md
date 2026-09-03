# Installing for a client

Written for the operator setting up a client's machine. It takes about fifteen minutes, and one
step in the middle cannot be automated by anyone.

## What you are setting up

The plugin lives on the client's machine and updates itself from the public repository. The
client's own documents, assets and journal live in **their** Google Drive, never in the repository
and never on your machine. A `.company.json` in one folder binds a session to exactly one company.

## 1. Claude Code

Install it if it is not there: https://claude.com/claude-code

## 2. The plugin

```bash
claude plugin marketplace add xenthai/xenthai-plugin
```

```bash
claude plugin install xenthai@xenthai
```

The part after `@` is the **marketplace** name, which `marketplace.json` sets to `xenthai` — not
the repository slug. Updates then arrive automatically, once per session, and only for a version
that was deliberately released: the `version` field in `plugin.json` is the release gate.

## 3. Authorize Google Drive — the step nobody can automate

**A plugin cannot declare, request or install a connector.** There is no field for it and no hook
that fires when one is missing. If Drive is not authorized, the skills load and look healthy right
up to the moment they fail.

The client authorizes it in their own claude.ai connector settings. It cannot be scripted, and it
cannot be done from a non-interactive session. See [MCP.md](MCP.md) for exactly which tools are
used and what breaks without them.

## 4. A browser for rendering

| Platform | What to do                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------ |
| Windows  | Nothing. Edge ships with Windows 10 (1809) and later, and the engine drives it                   |
| macOS    | `npx playwright install chromium` once. macOS ships only Safari, which cannot be driven this way |
| Linux    | `npx playwright install chromium` once                                                           |

## 5. The engagement folder

One folder per company, anywhere on disk:

```bash
mkdir "Acme"
```

Then open a session in that folder and invoke `company-new`. It asks for the five fields nothing can
infer, writes the manifest, creates the company's root folder in its store, and runs `doctor` — in
that order, because the guard permits a local write with no company bound and vetoes a store write,
so the manifest has to exist before the folder can be created.

Doing it by hand still works — copy `scaffold/company/.company.json.template` into the folder as
`.company.json` and fill it in — but `doctor` now fails while `store.root` still holds the
template's placeholder, which is the mistake the manual path actually produces.

Two fields decide whether the session works at all:

- **`store.root`** is the Drive folder **ID**, never a name. Names collide; two companies can name
  a folder the same thing. Take it from the folder's URL: `drive.google.com/drive/folders/<ID>`.
- **`timezone`** stamps every journal row. It defaults to `America/Mexico_City`.

Never commit a filled `.company.json` anywhere public.

**If the company's Drive folder already has documents in it**, from earlier work or from someone
filling them by hand, point `store.root` at that same folder. Do not make a new one. `company-new`
lists what is there and adopts it, and it never writes over a file that exists.

Those documents are **adopted, not captured**: nobody here knows who wrote what is in them. They
stay, they get marked, and nothing in them is published or reported until somebody re-establishes
where each fact came from. That is one question to one person, and it is the difference between
inheriting useful material and inheriting a claim you cannot defend.

## 6. Share the assets folder publicly — by hand, once

Inside the company's Drive folder, create the folder that will hold rendered assets and set it to
**"Anyone with the link"**.

This one is manual because the Drive connector's `share_file` only shares with a named email
address — there is no "anyone with the link" option in the API surface the plugin can reach.
Everything placed inside the folder inherits the permission, so it is once per company, not once
per asset.

**Skipping this is the most common silent failure.** Scheduling tools fetch media by URL and
cannot read a local file, so an import runs and produces posts with missing images, discovered one
failed row at a time.

## 6b. The digest folder, and the one thing that runs with nobody present

Everything else in this plugin needs a session, because it needs judgement. The digest does not: it
is arithmetic over a local file, so it runs on a schedule with no Claude, no connector and no
network. That is the only part you can honestly call automatic.

### Why it needs Drive for Desktop

The digest has to reach the practice, and a connector write needs a session. So instead the company
folder is **synced to disk** with Google Drive for Desktop — free, official, no subscription. Then
writing the digest is a plain file write and Drive syncs it.

Install it and let the company folder sync. Note the local path it gets, for example
`G:\Mi unidad\Acme` or `C:\Users\<user>\Mi unidad\Acme`.

### Create the folder and share it once, by hand

Inside the company's Drive folder, create `digest`. Share **that folder only** with the practice's
account as **Viewer**:

```
digest@xenth.ai   →   Lector
```

Two properties make this safe to leave in place. The digest carries **counts, dates and verdicts
only** — never a file name, a target, a reason, or any person's name — so nothing about the company
or its people travels. And the client can revoke it in Drive at any moment without breaking
anything else in the engagement.

Do not share the company's root folder. There is no reason for the practice to hold standing access
to the client's material, and every reason not to: it would make the practice a processor of the
client's personal data, and one compromised account would then be every client at once.

### Register the scheduled task

One command, once, in **PowerShell as Administrator**. Replace the two paths:

```powershell
$plugin = "$env:USERPROFILE\.claude\plugins\cache\xenthai\xenthai"
$store  = "G:\Mi unidad\Acme"
$action = New-ScheduledTaskAction -Execute "node" -Argument "`"$plugin\bin\watch.mjs`" --journal `"$store`" --out `"$store\digest\estado.md`""
$trigger = New-ScheduledTaskTrigger -Daily -At 7am
Register-ScheduledTask -TaskName "XenthAI digest" -Action $action -Trigger $trigger -Description "Escribe el digest de estado del compromiso. No envia datos de la empresa."
```

Then run it once by hand to prove it works before trusting the schedule:

```powershell
Start-ScheduledTask -TaskName "XenthAI digest"
```

Open `digest\estado.md`. If it is there, the automatic half is done and it stays done.

The task overwrites one file rather than appending a new one per day, so the folder never grows and
the practice always reads the current state. History is not lost — it is in the journal, which is
where history belongs.

### What the verdict means when the practice reads it

| Verdict | What it means |
| --- | --- |
| `OK` | Every signal fired and found nothing |
| `WATCH` | A finding for the next session |
| `ACT` | Pick up the phone |
| `UNKNOWN` | Not enough history yet for that signal to mean anything |

The digest exits successfully whatever it finds, on purpose: a scheduled task that fails on a
finding is a task somebody disables after the second alert.

## 7. Verify before you trust it

```bash
claude
```

Then, in the session:

```
/xenthai:doctor
```

It runs the local checks itself — Node version, the manifest, a launchable browser, the fonts and
their licences, the template, journal write access — and then walks you through the four connector
round-trips no code can do without credentials: read a file, create and trash a probe file, read a
Doc **with its comments** (that is the approval gate; if comments do not arrive, the gate does not
exist), and open one asset URL in a private window to confirm step 6 actually took.

A green doctor is the only evidence the install works. "Connected" in a settings panel is not.

## 8. The first session

```bash
cd "Acme"
```

```bash
claude
```

Ask for what you need in plain language — "empecemos el onboarding de Acme". The router binds the
session and hands off to the right phase.

## What you will see, every session

The first reply names the bound company. **Read it every time.** It is not a formality: a session
acts on whatever `.company.json` it found, and the failure this prevents is producing Acme's
content inside another client's Drive. A confirmation dialog gets clicked through within a week; a
name in every reply is caught by someone half-watching the screen.

Two things are vetoed outright, and nothing else: a store write when no company is bound, and a
local write outside the bound company's folder. Everything else that is sensitive but reversible —
sharing a file, trashing one — is announced and written to the journal instead of blocked.

## When something is wrong

| Symptom                                  | Cause                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| "This session is not bound to a company" | No `.company.json` up the directory tree. You are in the wrong folder                     |
| Store writes refused, local work fine    | Drive not authorized. Step 3                                                              |
| Render fails naming a font               | The font did not load. Never accept the fallback — the brand is the typeface              |
| Import produces posts with no images     | Step 6 was skipped                                                                        |
| The plugin never updates                 | The marketplace was added over SSH without a key, or the release version was never bumped |

Run `/xenthai:doctor` first for any of these. It is faster than guessing and it writes a `health`
row to the journal, so a client's journal alone supports diagnosing their machine remotely.
