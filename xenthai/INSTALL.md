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
claude plugin marketplace add Xenthai/Plugin
```

```bash
claude plugin install xenthai@xenthai
```

In the desktop app the first line is the same thing done in a dialog: **Plugins → Agregar → Agregar
marketplace**, then `Xenthai/Plugin` — owner and repository, not a full URL.

Two things about those two lines, and each has broken an install:

- **The repository is both the catalogue and the plugin.** Its `marketplace.json` sits at the root
  and points at `./xenthai`, a directory in the same repository. A catalogue that points at a
  *different* repository works from a terminal, which clones it, and **fails in the desktop app**,
  which syncs over HTTP and cannot reach a second repository — reporting only that the sync failed.
- **The part after `@` is the marketplace name**, which `marketplace.json` sets to `xenthai`. The
  plugin before it is also `xenthai`, so the line reads as a repetition and is not one.
- **The client's app adds the marketplace; the terminal never does.** `claude plugin marketplace add`
  writes `{"source": "github", "repo": "Xenthai/Plugin"}` into `settings.json`; the app's dialog writes
  `{"source": "git", "url": "https://github.com/Xenthai/Plugin.git"}`. Same repository, different kind,
  and whichever comes second is refused. `claude plugin install` is safe from either side.
- **Read the log before retrying that dialog.** `Error al sincronizar el marketplace` is also what it
  says when the marketplace is **already there**, so a retry that looks like a failure is often the
  first attempt having succeeded. `%APPDATA%\Claude\Logs\main.log` carries `Marketplace added` and
  `Marketplace already present, skipping add` as separate lines.
- **Cowork keeps its own store**, at `~/.claude/cowork_plugins/`, reached by adding `--cowork` to any
  plugin command. Installing normally leaves it empty, and a Cowork session mounts that store when it
  starts — so an already-open session will not see a fresh install.

**The repository has to be reachable from the client's machine.** While it is private, this command
fails there even though it works on a machine with your credentials — and the failure looks like a
typo rather than a permission. Either make it public, or install from a local path instead:

```bash
claude plugin marketplace add <path to a checkout on this machine>
```

Point it at the checkout's root — the catalogue is there, and `./xenthai` resolves from it exactly
as it does on GitHub. The install line afterwards is unchanged.

The local path costs the auto-update: a plugin installed that way updates when that checkout does,
not when `main` does. Say which of the two an engagement is on — the journal stamps a working copy's
rows `dev`, which is how a report tells them apart afterwards.

Updates otherwise arrive automatically, once per session, and **every push reaches the client**:
neither manifest declares a `version`, so the CLI resolves it to the commit SHA. A declared version
would pin the install and never move it again.

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

## 5. The engagement folder — inside the synced Drive folder

One folder per company, and **it goes inside the company's Drive folder as synced by Google Drive for
Desktop** (step 6b installs it; do that first if it is not there):

```bash
mkdir "G:\Mi unidad\Acme\engagement"
```

Placing it there rather than anywhere on disk is deliberate, and it settles three things at once:

- **The journal becomes durable.** It is written to `<engagement folder>/journal/execution/`, so
  outside a synced folder it exists on exactly one machine. That machine dying takes the whole audit
  trail with it, and with it the ability to report on the engagement at all.
- **The client gets their own copy**, which the reports already assume they have: every report tells
  them to check its SHA-256 against their own copy of the journal. Without this they have none, and
  the verification block is an instruction nobody can follow.
- **No routine needs an absolute path.** The scheduled task's working folder is this folder, so the
  journal is `.` and the digest is `../digest` — see 6b.

If Drive for Desktop is set to **stream** rather than mirror, files are not kept on local disk. Set
that company's folder to be available offline, or the routine reads nothing when the network is down.

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

### 5b. When there is no synced folder at all — a session in the cloud

A session running in a cloud container has no Drive for Desktop, no G: drive, and a disk that is
destroyed when the session ends. Everything above still applies except the one thing it was there to
buy — **the journal is not durable, and nothing about the session looks any different.** Two
consequences, and they compound: the binding, and the evidence.

**The binding.** The session's working directory is the container's home, and the company is found by
walking up from it, so the only placement that works is the one a manifest must never have. Keep the
rule by pointing the environment at the manifest instead:

```bash
export XENTHAI_COMPANY="$HOME/acme/.company.json"
```

That beats the directory walk, so nothing sits at the home at all. It never falls back: set and
pointing at nothing, every store write is refused rather than silently bound to whatever the walk
finds. Only where even that is impossible, add `"binding": "ephemeral"` to the manifest — `doctor`
then passes it and says on every run that it is not reusable between sessions. Undeclared, `doctor`
fails and names this section.

**The evidence.** The journal has to reach the company's store before the session ends, and only a
session can put it there — a CLI holds no connector credentials, and nothing runs on `SessionEnd`
with a connector attached. So the session does it:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal-sync.mjs" --stage
```

It names one file per month in the ordinary case — the whole month the first time, then only the
rows since the last receipt (`<YYYY-MM>.rev-<NNN>.delta-after-<R>.jsonl`). Put each file into the
company's `journal/` folder keeping the name exactly, read its metadata back, and record the id and
the size the store reports with `--receipt --month <YYYY-MM> --file-id <id>:<size>`. The receipt is
refused when the size differs from the staged bytes: the upload channel has been measured
truncating a file while reporting success, and the size is how that is caught.

**Then upload the state file `--receipt` names**, `<YYYY-MM>.sync.rev-<NNN>.json`, into the same
folder, and compare its size against what the store reports exactly as for a revision — `--receipt`
prints the byte count for that. It carries the head revision alone, a few hundred bytes whatever the
month's history looks like, and it is the only thing that makes the next container able to continue:
the revision chain lives in `journal/sync/` on a disk that does not survive, so a session that
starts without it reads "no revisions", proposes `rev-001`, and uploads a name the folder already
holds — two different files with one name, and a month nobody can rebuild. Skipping it is not
untidiness, it is the corruption.

**The next session starts by adopting that file, not by restoring.** List the company's `journal/`
folder, download the month's highest `sync.rev-<NNN>.json`, and:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal-sync.mjs" --adopt-state <the downloaded file>
```

The chain resumes and the next `--stage` names the right delta, with no row of history downloaded.
`--restore --from <dir>` is the other command and it answers a different question: it brings the
month's rows *back* to this machine, which needs every revision file — for a live month that is
tens of files and hundreds of KB arriving as base64 through the model, so run it when the rows
themselves are needed (a report, an opportunity scan), never merely to learn where the chain stands.
Until one of the two has run, `--stage` refuses a first revision on this binding and says so;
`--first-revision` overrides it and is only honest when you listed the folder and it held nothing.
`doctor` fails while anything is owed, and `report` and `opportunities` say when the history they
need is in the store rather than on this machine.

**The transport hook — the same upload with no byte generated by the model.** Creating a file
through the connector means the session reproduces every byte inside the tool call: about two
minutes and 13,000 tokens per 20 KB. A `PostToolUse` hook of type `mcp_tool` does the same call
with the bytes copied from a Bash command's output instead, in about a second.

**Where it goes: the directory the session started in, never the company folder.** Claude Code reads
hooks from the user's `~/.claude/settings.json` and from `.claude/settings.json` (or
`settings.local.json`) in the **session's own starting directory**. A settings file inside a company
folder that is not that directory is never read — it was written in one session and the next started
without it, and nothing reported anything. Put it at `<the directory the session started in>/.claude/settings.local.json`.
If that directory is not the bound company's, write the file *before* binding: the company guard
blocks a local write outside the bound company's directory.

It cannot live in the plugin's own `plugin.json` either: `server`, the folder id and the tool name
differ per host and per store, and a `mcp_tool` hook resolves nothing at run time — its `input`
accepts only `${path}` substitutions from the event's own JSON, never a file, an environment
variable or a plugin option. So it is a per-machine, per-company setting:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "mcp_tool",
            "if": "Bash(*journal-sync.mjs --emit*)",
            "server": "Google_Drive",
            "tool": "create_file",
            "timeout": 60,
            "input": {
              "parentId": "<id of the company's journal/ folder>",
              "title": "${tool_input.description}",
              "contentMimeType": "text/plain",
              "disableConversionToGoogleType": true,
              "textContent": "${tool_response.stdout}\n"
            }
          }
        ]
      }
    ]
  }
}
```

Four facts make it exact, all measured on real sessions. **The `if` pattern must not begin with the
command name**: a session invokes the tool by absolute path (`node "/root/.claude/plugins/.../tools/journal-sync.mjs" --emit …`),
which `Bash(node * journal-sync.mjs --emit*)` does not match — and an `if` that does not match fails
by doing nothing at all, so the upload silently falls back to costing tokens. `Bash(*journal-sync.mjs --emit*)`
matches both spellings. **`server`** is the connector's name as the hooks see it, which arrives as
`mcp_server.name` in any hook input for a connector call (`Google_Drive` on one host, a UUID on
another) — read it there, never guess it. **The `title`** is the Bash call's `description`, so the
session runs the emit command with the file's exact name as the description. And **a Bash call's
stdout reaches the hook without its final newline**, which is why `--emit` prints the file without it
and the hook's `"\n"` puts it back; the size check in `--receipt` is what proves the result either
way. That same output is capped, which is why `--emit` refuses to print anything over the transport
budget rather than letting a truncated file look delivered.

The hook's call does not pass through the company guard — it is not a tool the model invoked — so
the `if` filter and the fixed folder id are its constraint. On a OneDrive store the `server`, `tool`
and `input` keys are the ones `company-new` recorded in `store.tools`.

Measured with the hook working, on the personal store: revision 011, one file, 12,260 bytes, **zero
bytes generated by the model, about 45 seconds** — against six minutes for revision 009 through the
connector by hand.

**On an ephemeral binding it is written once per session, and that is the honest cost.** A settings
change is picked up during the session — verified: the file was written mid-session and the next
Bash call fired the hook, no restart — so writing it works. What does not survive is the file: the
container is reclaimed, `$HOME` comes back as `/root` with an empty `~/.claude/settings.json`, and
only the plugin is synced back. So on such a machine the choice is one `Write` at the start of the
session, before the first upload, or paying the tokens for every byte that session uploads. Write it
where the session actually started (`.claude/settings.local.json` under the session's own working
directory), and note that the company guard blocks a local write outside the bound company's
directory — so either that directory *is* the company's, as it is in a cloud session bound at the
home, or the file has to be written before the binding exists.

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

## 6b. The digest folder, and the one routine that needs nobody in the room

Everything else in this plugin needs a person in the session, because it needs judgement. The digest
does not: what it computes is arithmetic over a local file, so the answer cannot be wrong and nothing
about it has to be reviewed.

It still runs **inside a scheduled Claude session**, so it needs the app open and the machine awake.
Be precise about that rather than calling it automatic: the *computation* needs no model, and the
*schedule* does. What that buys is one place to see every routine, its run history and its skipped
runs — and no administrator command on a client's machine, which their own IT may not allow.

### Why it needs Drive for Desktop

The digest has to reach the practice, and a connector write is a per-call permission and a network
round trip for something that should be a file write. So instead the company folder is **synced to
disk** with Google Drive for Desktop — free, official, no subscription — and the digest is written
as a plain local file that Drive syncs.

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

### Create the scheduled task

In the Desktop app's **Code** tab: **Rutinas** in the sidebar (or under **Más**), then **Nueva
rutina**, and choose **Local** — not Cloud. A cloud routine runs on Anthropic's infrastructure and
**cannot read local files**, and the journal on this machine is the whole input.

| Field | Value |
| --- | --- |
| Nombre | `xenthai-digest` |
| Descripción | Escribe el digest de estado. No envía datos de la empresa |
| Carpeta | The engagement folder — the one holding `.company.json`, inside the synced Drive folder |
| Programación | **Diaria**, at an hour the machine is normally on and awake |
| Modelo | The cheapest available. The task runs one command and stops; nothing here needs judgement |
| Worktree | Off. This folder is not a repository |

Instructions, verbatim — replace only the company path:

```
El anuncio de inicio de esta sesión trae la línea "Plugin root: <ruta>". Toma esa ruta y corre
exactamente este comando, nada más:

node "<Plugin root>/tools/watch.mjs" --journal . --out ../digest/estado.md

Después confirma en una línea si el archivo se escribió y cuál fue el veredicto. No abras ningún
otro archivo, no leas la bitácora, no interpretes el resultado y no escribas nada más. Si el comando
falla, reporta el error tal cual y detente. Si el anuncio de inicio no trae esa línea, no adivines
la ruta: repórtalo y detente.
```

**Do not write the plugin's path into the prompt.** A plugin is cached at
`cache/<marketplace>/<plugin>/<version>/`, so **its absolute path changes on every update** — a
hardcoded path makes the routine fail the day the plugin is upgraded, and the only symptom is a
digest that stopped advancing. The session's own start-up announcement carries the resolved path, and
that announcement fires in a scheduled session exactly as it does in a manual one.

**And no company path either.** The task's working folder is the engagement folder, the journal is
directly under it, and `digest` is its sibling — so `.` and `../digest` are the whole of it. The only
value the prompt carries is the plugin root, read at run time from the announcement. Nothing in this
routine can be made stale by a plugin update, a machine change or a folder move.

### Then run it once, or it is not finished

**Click Ejecutar ahora and answer every permission prompt with "permitir siempre".**

This is not a nicety. A scheduled task whose permission mode does not already allow a tool it needs
**stalls waiting for a person** — it does not fail and it does not retry. The session sits open in
the sidebar and the routine has silently stopped, with no error anywhere. Running it once and
approving is what makes every future run pass without a person.

To avoid the prompt entirely, an allow rule in `~/.claude/settings.json` also applies to scheduled
task sessions.

Then open `digest/estado.md`. If it is there with today's date, this step is done.

The task overwrites one file rather than appending one per day, so the folder never grows and the
practice always reads the current state. History is not lost — it is in the journal, which is where
history belongs.

### The one thing this mechanism cannot tell you

A Desktop task runs only while the app is open and the machine is awake. So when the digest's date
stops advancing, it means one of three things — the machine was off, the app was closed, or the task
stalled — and **the practice cannot tell which from the file alone.**

The task's own detail page distinguishes them: its history lists every skipped run with the reason.
But that page is on this machine. So a stale digest is a reason to ask, not a conclusion, and the
first question is always "¿estuvo prendida la máquina?" before anything about the engagement.

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
| "This session is not bound to a store" | No `.company.json` up the directory tree. You are in the wrong folder — or the store is your own and its manifest needs `"kind": "personal"` |
| Store writes refused, local work fine    | Drive not authorized. Step 3                                                              |
| Render fails naming a font               | The font did not load. Never accept the fallback — the brand is the typeface              |
| Import produces posts with no images     | Step 6 was skipped                                                                        |
| The plugin never updates                 | The marketplace was added over SSH without a key, or the release version was never bumped |

Run `/xenthai:doctor` first for any of these. It is faster than guessing and it writes a `health`
row to the journal, so a client's journal alone supports diagnosing their machine remotely.
