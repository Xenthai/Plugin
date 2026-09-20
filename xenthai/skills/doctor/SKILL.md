---
name: doctor
description: Verify that this machine and the bound company's connectors can actually do the work. Use after installing or updating the plugin, before the first session with a new company, when a store read or write fails, when a connector shows as connected but a call failed anyway, when a render fails for a reason that is not composition (no browser, a substituted font, a blank canvas), or whenever an install looks healthy and something still does not work. For producing pieces use social-produce.
---

# Doctor — can this install do the work it is about to promise?

An install can pass every visible sign of health and fail at the first delivery. Four ways, each
found at that delivery instead of in two minutes:

- the connector is authorized but not scoped to the company's folder, so the first read fails
- a write goes through but a trash does not, or the guard refuses because no company is bound
- the review Doc returns no comments, so the approval gate the pipeline rests on does not exist
- the assets folder was never shared by link, so a scheduler imports every image missing

Half the checks are mechanical and a script runs them; the other half need credentials only you
have, in a session. **This is not Claude Code's built-in `/doctor`**, which rightsizes skills and
CLAUDE.md files; for that, send the operator to the built-in command.

## Step 1 — the local checks, by the machine

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/doctor.mjs"
```

Run it with `--help` for the options and exit codes; never read its source. `--json` returns the
same as data.

One line per check — `node`, `company`, `browser`, `fonts`, `engine`, `sync`, `transport`, `journal` —
each `OK`, `FAIL` or `SKIP` with its reason. It exits 0 only when every line is OK. **A `SKIP` exits
1 too**: a doctor that could not verify something does not report clean.

Every run appends one `health` row to the journal: the run's status codes, never a path or an
error text. It is how a client's setup is diagnosed later from its own journal, so run it even when
everything works.

| Line | What a FAIL means | What to do |
| --- | --- | --- |
| `node` | Node older than 20 | Install a current Node; nothing here runs on less |
| `company` | A `.company.json` exists up the tree and is unreadable, incomplete, or written by a newer plugin (`schema_version` above what this build understands) | Name the exact defect to the operator. Never edit it into shape on a guess; a newer schema means update the plugin, not downgrade the manifest |
| `browser` | None of Edge, Chrome, Edge Beta, Chrome Beta launched | The render engine cannot run. Say so and do not render another way — that output has not been asserted. The machine needs Microsoft Edge or Google Chrome |
| `fonts` | A face `template.html` declares is missing, or a bundled face lacks its `OFL-*.txt` | The install copied incompletely — the bracketed font filenames are the usual casualty. Reinstall the plugin; never substitute a font, the render asserts the family |
| `engine` | `template.html` or `formats.json` missing, or `formats.json` does not parse | Reinstall; the render refuses to start without them |
| `sync` | Rows exist on this machine and not in the company's store — a closed month, or any row at all on an ephemeral binding | Run `tools/journal-sync.mjs --stage` and do the upload, step 5 below. On an ephemeral binding this is not housekeeping: that disk is destroyed when the session ends, and `report` and `opportunities` are built on those rows |
| `transport` | On an ephemeral binding no transport hook is installed, or on any binding one is installed that cannot fire — the reason names the defect | A hook that cannot fire falls back to the model reproducing every byte, silently. Write or rewrite the settings file per `INSTALL.md` §5b, at the directory the session started in — before binding when that directory is not the company's, since the guard blocks a local write outside it. On `absent-ephemeral` do it now, before the first upload. Whether `parentId` is this company's `journal/` folder is yours to confirm in step 5 |
| `journal` | The journal directory rejects an append | Nothing is auditable until it is fixed: permissions on the company directory, or on the plugin data directory when unbound |

## Step 2 — the four connector round trips, by you

A hook and a CLI run with no credentials, so nothing in code can prove the store works, and
"connected" in the connector settings is not proof either: the wrong scope looks identical until the
first call. Take `store.root` from `.company.json` and go in this order, stopping at the first
failure:

**1. Read.** Read the root folder's metadata by its id and confirm the name that comes back is this
company's. An id proves reachability, not identity, and two companies can name a folder the same.
Then read one file inside it by id — `BRAND.md` if it exists, as a raw download. If the store is
empty, the probe in step 2 is that file: read it back before trashing it.

Then list the root and the `journal/` folder by id, before writing anything, and look for two files
sharing one name. Drive allows it, an interrupted create-and-trash leaves exactly that, and in
`journal/` two files with one revision name is a month nobody can rebuild. **Never trash one on a
guess**: name both in the step 3 table with size and date, and let the operator decide. The count
goes into the connector health row as `duplicates:<n>`, zero included.

**2. Write and trash.** Create one small text file in the root — a name like
`prueba-doctor-<fecha>.txt`, one line in es-MX saying it is a test file and may be deleted — read it
back by the id you were given, then trash it and read its metadata back once more to confirm the
trash landed. Through the connector only, never through the shell.
The company guard refuses this write when no company is bound; it does **not** refuse a write to a
folder that is not the company's — that is journaled, not blocked — which is why the name check in
step 1 comes first.

**3. Comments.** Read a Google Doc that carries a comment with `includeComments: true` and confirm
the comment text arrives. Use the company's latest review Doc if one exists; if none does, create a
probe Doc, ask the operator to leave any one comment on it — the connector cannot write one — read
it back and compare their words with what came back. Trash a probe Doc afterwards. **This
is the approval gate.** If the comment does not arrive, the gate does not exist, and nothing that
depends on it may run.

**4. Public link.** Read the permissions on the folder the company's assets go into. A share to
"anyone with the link" shows as a permission of type `anyone`; its absence means the step was never
done, and the connector cannot do it — a person sets it once, by hand, in Drive. Presence is a hint,
not proof: the only proof is opening one asset URL in a private window and seeing the image. **You
cannot do that step. Say so**, ask the operator what they saw, and record their answer under their
name. If `.company.json` carries `store.assets_public`, set it to what was observed — with `Edit`,
never through the shell.

**5. The journal's own upload, when `sync` is not OK.** A round trip like the others, with the
engagement's evidence in it.

**First, if this machine holds no receipt for the month** — an ephemeral binding always starts that
way — read the `journal/` listing from step 1. A `<YYYY-MM>.sync.rev-<NNN>.json` there means the
month already has a chain: download the highest and run `--adopt-state <file>`, which resumes it
from that file alone. Without it the tool cannot tell a month nobody has uploaded from one whose
receipt died with the last container, and it refuses to stage rather than write a `rev-001` the
folder may already hold. **Never** pass `--first-revision` to get past that refusal unless the
listing held nothing for this month. Never download the revision files to recover the chain: that
is 600 KB of history through the model to learn a number the state file states.

Then `node "${CLAUDE_PLUGIN_ROOT}/tools/journal-sync.mjs" --stage` freezes what is owed and names
the file(s) — the whole month the first time, afterwards only the rows since the last receipt. For
each file, in the order printed:

- **If the transport hook is installed** (`INSTALL.md` §5b): first confirm what the doctor could
  not — its `parentId` is the `journal/` folder id from the step 1 listing, and its `server` is the
  `mcp_server.name` any connector call's hook input shows. Then run the `emit` line `--stage`
  printed, with the file's exact name as the Bash call's description, and **alone** — the hook copies
  the whole call's output, so an `echo` or a second command after `&&` lands in the uploaded file.
  It creates the file; you generate no bytes.
- **Otherwise** create it in the company's `journal/` folder through the connector with **exactly**
  that name, `text/plain`, conversion disabled.

Then read the file's metadata back — `search_files` on its title inside the journal folder, or
`get_file_metadata` by id — and record `--receipt --month <YYYY-MM> --file-id <id>:<fileSize>`,
one pair per file, comma separated. The receipt is written from the frozen bytes and refuses a size
that differs from them, so it can claim neither rows that never went up nor a truncated file.

**Last, upload the state file `--receipt` names** (`<YYYY-MM>.sync.rev-<NNN>.json`, same
folder, `--emit` prints it). It is what the next session on another machine adopts, and skipping it
is what makes the next container start over at `rev-001`. It needs no receipt of its own: its name
carries the revision it records.

## Step 3 — report and record

Report one table, every row filled, and say plainly which rows a person performed:

| Check | Result | Evidence | Next step |
| --- | --- | --- | --- |
| local — the eight lines | | the doctor's summary line | |
| read | | folder name matched; file id read | |
| listing | | two files sharing one name, each with size and date — or "none" | |
| journal uploaded | | revision name, digest, store id — or "nothing owed" | |
| write + trash | | probe id created, read back, trashed | |
| comments | | the comment text that came back | |
| public link | | who opened it, in a private window, and what they saw | |

Then record the connector half, which the script cannot know about:

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event health --capability doctor \
  --why "connector round trip on the bound company's store" \
  --detail "read:ok duplicates:0 write:ok trash:ok comments:ok"
```

The private-window observation is a second row with `--actor "person:<name>"`, `--why "opened one
asset URL in a private window"` and `--detail "public-link:ok"`: an observation a person made
carries their name, exactly like an approval. Add `--result error` when a step failed, with its code
as `fail`. Never put the probe's content, a file's contents or a comment's text in `--detail`.

## STOP conditions

- **No company is bound.** Run step 1 and report it; the round trips need a bound company, so ask
  which. Never create `.company.json` unasked or guess a company from the directory name.
- **The connector is not authorized**, or a call returns an authorization error. Point to `MCP.md`
  § How to authorize and stop after one attempt: only a person authorizing changes the state, and
  retrying only raises the journal's error count.
- **The comment did not arrive.** The approval gate does not exist. Nothing that rests on it — the
  plan gate in social-plan, the first-batch gate in social-produce — may proceed until it does.
- **The doctor exits 2.** The tool itself failed. Report its stderr verbatim; do not work around it.
- **The browser line FAILS.** The render engine cannot run. Do not render another way.

## What this skill never does

- Writes to the store beyond the two probes, both trashed before it ends.
- Writes company material through the shell: the probes go through the connector, anything local
  through `Write` and `Edit` — the guard sees those two, a redirect it does not.
- Fixes a `.company.json` by guessing, or edits `formats.json`, `template.html` or a font.
- Trashes a duplicate on a guess, or claims a step it could not perform. The private window is the
  operator's; say so every time.

## Reference material

| File | Read it when |
| --- | --- |
| `MCP.md` (plugin root) | A connector call failed, authorization is in doubt, or you need which tool does what |
| `capabilities/social/doctrine/LAYOUT.md` | A render failed an assertion — composition, not health |
| `scaffold/company/.company.json.template` | No company is bound and the operator asks how to bind one |
