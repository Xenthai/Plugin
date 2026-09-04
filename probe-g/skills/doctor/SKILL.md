---
name: doctor
description: Verify that this machine and the bound company's connectors can actually do the work. Use after installing or updating the plugin, before the first session with a new company, when a store read or write fails, when a connector shows as connected but a call failed anyway, when a render fails for a reason that is not composition (no browser, a substituted font, a blank canvas), or whenever an install looks healthy and something still does not work. For producing pieces use social-produce.
---

# Doctor — can this install do the work it is about to promise?

An install can pass every visible sign of health and fail at the first delivery. Four ways it does,
each found today at that delivery instead of in two minutes:

- the connector is authorized but not scoped to the company's folder, so the first read fails
- a write goes through but a trash does not, or the guard refuses because no company is bound
- the review Doc returns no comments, so the approval gate the whole pipeline rests on does not exist
- the assets folder was never shared by link, so a scheduler imports with every image missing

Half of the checks are mechanical and a script runs them. The other half need credentials, which
only you have, in a session.

**This is not Claude Code's built-in `/doctor`.** That one rightsizes skills and CLAUDE.md files —
a different job on a different subject. If the operator's actual question is whether an instruction
file has grown too large or a skill is over-specified, say so and send them to the built-in command
in an interactive terminal; this skill cannot answer it. What this one checks is whether this
machine and this company's connectors can do the work.

An asset that failed a layout assertion is also not a health problem. That is a composition defect
— read `capabilities/social/doctrine/LAYOUT.md` instead of running anything here.

## Step 1 — the local checks, by the machine

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/doctor.mjs"
```

Run it with `--help` for the options and exit codes; do not read its source. `--json` returns the
same result as data.

One line per check — `node`, `company`, `browser`, `fonts`, `engine`, `journal` — each `OK`, `FAIL`
or `SKIP` with its reason. It exits 0 only when every line is OK. **A `SKIP` exits 1 too**: a doctor
that could not verify something does not report clean. It launches and closes the browser it finds
and never downloads one.

Every run appends one `health` row to the journal: the status codes of the run, never a path or an
error text. That row is how a client's setup is diagnosed later from its own journal, without a
call — so run it even when everything works.

| Line | What a FAIL means | What to do |
| --- | --- | --- |
| `node` | Node older than 20 | Install a current Node; nothing here runs on less |
| `company` | A `.company.json` exists up the tree and is unreadable, incomplete, or written by a newer plugin (`schema_version` above what this build understands) | Name the exact defect to the operator. Never edit it into shape on a guess; a newer schema means update the plugin, not downgrade the manifest |
| `browser` | None of Edge, Chrome, Edge Beta, Chrome Beta launched | The render engine cannot run. Say so and do not render another way — that output has not been asserted. The machine needs Microsoft Edge or Google Chrome |
| `fonts` | A face `template.html` declares is missing, or a bundled face lacks its `OFL-*.txt` | The install copied incompletely — the bracketed font filenames are the usual casualty. Reinstall the plugin; never substitute a font, the render asserts the family |
| `engine` | `template.html` or `formats.json` missing, or `formats.json` does not parse | Reinstall; the render engine refuses to start without them |
| `journal` | The journal directory rejects an append | Nothing is auditable until it is fixed: permissions on the company directory, or on the plugin data directory when no company is bound |

## Step 2 — the four connector round trips, by you

A hook and a CLI run with no credentials, so nothing in code can prove the store works.
"Connected" in the connector settings is not proof either: an authorized connector with the wrong
scope looks identical until the first call. Only a real round trip in a session proves it.

Take `store.root` from `.company.json`. It is the one id you always have. Then, in this order,
stopping at the first failure:

**1. Read.** Read the root folder's metadata by its id and confirm the name that comes back is this
company's. An id proves reachability, not identity, and two companies can name a folder the same.
Then read one file inside it by id — `BRAND.md` if it exists, as a raw download. If the store is
empty, the probe in step 2 is that file: read it back before trashing it.

**2. Write and trash.** Create one small text file in the root — a name like
`prueba-doctor-<fecha>.txt`, one line in es-MX saying it is a test file and may be deleted — read it
back by the id you were given, then trash it. Through the connector only, never through the shell.
The company guard refuses this write when no company is bound; it does **not** refuse a write to a
folder that is not the company's — that is journaled, not blocked — which is why the name check in
step 1 comes first.

**3. Comments.** Read a Google Doc that carries a comment with `includeComments: true` and confirm
the comment text arrives. Use the company's latest review Doc if one exists. If none does, create a
probe Doc, ask the operator to leave any one comment on it — the connector cannot write a comment —
then read it back and compare their words with what came back. Trash a probe Doc afterwards. **This
is the approval gate.** If the comment does not arrive, the gate does not exist, and nothing that
depends on it may run.

**4. Public link.** Read the permissions on the folder the company's assets go into. A share to
"anyone with the link" shows as a permission of type `anyone`; its absence means the step was never
done, and the connector cannot do it — a person sets it once, by hand, in Drive. Presence is a hint,
not proof: the only proof is opening one asset URL in a private window and seeing the image. **You
cannot do that step. Say so**, ask the operator to do it and tell you what they saw, and record their
answer under their name. If `.company.json` carries `store.assets_public`, set it to what was
observed — with `Edit`, never through the shell.

## Step 3 — report and record

Report one table, every row filled, and say plainly which rows a person performed:

| Check | Result | Evidence | Next step |
| --- | --- | --- | --- |
| local — the six lines | | the doctor's summary line | |
| read | | folder name matched; file id read | |
| write + trash | | probe id created, read back, trashed | |
| comments | | the comment text that came back | |
| public link | | who opened it, in a private window, and what they saw | |

Then record the connector half, which the script cannot know about:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event health --capability doctor \
  --why "connector round trip on the bound company's store" \
  --detail "read:ok write:ok trash:ok comments:ok"
```

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event health --capability doctor \
  --actor "person:<name>" --why "opened one asset URL in a private window" \
  --detail "public-link:ok"
```

Add `--result error` when a step failed, with its code as `fail`. An observation a person made
carries their name, exactly like an approval. Never put the probe's content, a file's contents or a
comment's text in `--detail`; the codes are enough.

## STOP conditions

- **No company is bound.** Run step 1 and report it; say the four round trips need a bound company;
  ask which company and where its store lives. Do not create `.company.json` unasked, and do not
  guess a company from the directory name.
- **The connector is not authorized**, or a call returns an authorization error. Point to `MCP.md`
  § How to authorize and stop after one attempt. Retrying changes nothing but the journal's error
  count — the state changes only when a person authorizes, in their own settings.
- **The comment did not arrive.** The approval gate does not exist. Nothing that rests on it — the
  plan gate in social-plan, the first-batch gate in social-produce — may proceed until it does.
- **The doctor exits 2.** The tool itself failed. Report its stderr verbatim; do not work around it.
- **The browser line FAILS.** The render engine cannot run. Do not render another way.

## What this skill never does

- Writes to the store beyond the two probes, both trashed before it ends.
- Writes company material through the shell. The probes go through the connector; `Write` and
  `Edit` for anything local — the guard sees those two, a redirect it does not.
- Fixes a `.company.json` by guessing, or edits `formats.json`, `template.html` or a font.
- Claims a step it could not perform. The private window is the operator's; say so every time.

## Reference material

| File | Read it when |
| --- | --- |
| `node "${CLAUDE_PLUGIN_ROOT}/bin/doctor.mjs" --help` | You need the options, exit codes or check names — run it, never read the source |
| `MCP.md` (plugin root) | A connector call failed, authorization is in doubt, or you need which tool does what |
| `capabilities/social/doctrine/LAYOUT.md` | A render failed an assertion — composition, not health |
| `scaffold/company/.company.json.template` | No company is bound and the operator asks how to bind one |
| `README.md` § Requirements | The browser line failed and you need what the machine must have |
