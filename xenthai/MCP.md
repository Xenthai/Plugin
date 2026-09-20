# MCP connectors this plugin needs

## Why this is a checklist and not a declaration

**A Claude Code plugin cannot declare a dependency on an MCP connector.** There is no field for
it, no install step, and no runtime hook that fires when one is missing. If a skill calls a
Google Drive tool and the connector was never authorized, the call simply fails when it is
invoked — the plugin loads normally and looks healthy right up to the moment it does not work.

Two consequences shape everything below:

1. **A person authorizes connectors once, by hand.** It cannot be scripted, pre-seeded into
   `settings.json`, or bundled with the plugin. This file is that person's list.
2. **The plugin probes instead of assuming.** Every capability attempts a real read before it
   starts work and degrades in the open if the store is unreachable — it says so rather than
   failing halfway through a deliverable. A silent half-finished delivery is worse than a refusal.

**Server ids are per-install UUIDs.** The same connector is `mcp__63889907-…__create_file` on one
machine and a different id on the next, so nothing in this repo hardcodes a server id. The hooks
match on the trailing method name (`__create_file`, `__read_file_content`) because that part is
stable across installs. Do not "fix" that by pinning an id you saw once.

---

## Required

### Google Drive

The company store. Every client's documents, rendered assets and journal live in that company's
own Drive, never in this repo.

| What the plugin does with it | Tool it uses |
| --- | --- |
| Find a company's documents | `search_files` |
| Read a document, **including its comments** | `read_file_content` (`includeComments: true`) |
| Read a raw `.md` or `.json` byte-for-byte | `download_file_content` |
| Write a document, an asset, or a journal revision | `create_file` |
| Rename or move | `update_file` |
| Grant a named person access | `share_file` |
| Inspect who currently has access | `get_file_permissions` |

**Without it:** the storage adapter falls back to the local filesystem. Work still happens and the
journal still records, but nothing reaches the client and the comment-based approval gate does not
exist. The plugin will tell you it is running in local mode rather than pretending otherwise.

**Two limits of this connector that shape the design, verified rather than assumed:**

- **`update_file` cannot change a file's contents** — only its title and parent folder. So a
  revision is a *new file*, never an edit in place. That is why the document lineage is explicit
  and versioned instead of overwritten.
- **`share_file` only shares with a named email address.** There is no "anyone with the link"
  option. A scheduler that fetches media by URL therefore needs that permission set **once, by
  hand, on the assets folder**, and everything placed inside inherits it. If this step is skipped,
  imports run with missing images. It belongs in the onboarding checklist for every company.

**The journal lives here too, and for the same reason.** `<store root>/journal/` holds
`<YYYY-MM>.rev-001.jsonl`, the month as it first stood, then `<YYYY-MM>.rev-<NNN>.delta-after-<R>.jsonl`
for the rows added since the receipt that settled `R` rows — new files every time, because
`update_file` cannot change contents. It also holds `<YYYY-MM>.sync.rev-<NNN>.json`, a few hundred bytes,
which is the revision chain itself: a session on a machine that never held this month downloads the
highest of those and adopts it, instead of downloading the history to find out where the chain
stands. On a machine whose disk does not survive the session that folder is the only copy of the
engagement's evidence: `tools/journal-sync.mjs` stages the bytes and refuses a receipt whose
store-reported `fileSize` differs from them, and the upload is the session's,
since a CLI holds no credentials — either the model creates the file, or a `PostToolUse` hook of type
`mcp_tool` copies `--emit`'s output into `create_file` (`INSTALL.md` §5b), which is the only kind of
hook that can reach a connector: it uses the session's own connection, on events where an MCP client
exists, so never on `SessionEnd`. `capabilities/company/doctrine/CONTROLS.md` §1b carries what may
and may not be claimed about that.

**Also worth knowing:** the connector exposes no revisions tool, so the plugin **cannot pin a
Drive revision** (`keepForever`) before migrating a document. Drive keeps its own revision history
regardless, so the safety net exists — but it is Drive's, reachable through Drive's own interface,
not something this plugin can guarantee programmatically. Migrations therefore write their own
backup file first rather than relying on the store.

---

### Microsoft 365 — when the company's store is OneDrive or SharePoint

The second store provider, declared with `"kind": "onedrive"` in the manifest's `store`. It is
reached through the claude.ai **Microsoft 365** connector, which needs a work or school account and
whose write tools are **off by default** until the tenant's administrator re-consents and turns them
on — so "connected" can be green with every write refused, and `doctor`'s write-and-trash probe is
the only proof.

| What the plugin does with it | Tool it uses |
| --- | --- |
| Find a company's documents | `sharepoint_search`, `sharepoint_folder_search` |
| Read a document or a raw `.md` / `.jsonl` | `read_resource` (by URI) |
| Write a document, an asset, or a journal revision | `sharepoint_upload_file` |
| Rename or move | `sharepoint_rename_item`, `sharepoint_move_item` |
| Copy server-side | `sharepoint_copy_item` |
| Delete (to the recycle bin) | `sharepoint_delete_item` |

The method names above are known and are already in the guard's veto and the journal's skip list.
**Their parameter names, the inline size ceiling and what happens to a duplicate name are not
published**, and nobody at the practice holds a tenant to read them from. So `company-new` reads
the connector's tool schemas in the session that binds the first OneDrive company and records the
create tool's parameter names in `store.tools`; every upload step and the transport hook then use
that vocabulary. Until that probe, treat the 20 KB budget as the ceiling.

**Three limits that differ from Drive, and shape the rules:**

- **`sharepoint_update_file` replaces a file's contents**, and Graph's default on an existing name
  is to replace rather than to add a duplicate. A revision is still a new file — here that is a rule
  the skills keep, not a constraint the connector imposes — and a re-run of a failed upload must
  list the folder first, because the failure would be silent overwriting rather than a duplicate.
- **There is no comments tool and no sharing tool.** The comment-based approval gate in "How to
  verify" step 3 does not exist on this provider, and a public link cannot be inspected from here.
  Until the doctrine names another gate for OneDrive, a company bound to it does not run anything
  that depends on that gate.
- **The store reports a size and no usable hash.** Graph's `quickXorHash` is not surfaced by the
  connector and SHA-256 is not supported; the receipt verifies size, as it does for Drive.

## Optional, per capability

### Google Calendar

Onboarding runs one phase per session, so the phases are real appointments. With Calendar the
plugin can propose and place them; without it, scheduling is a conversation and the phase record
in the journal is unaffected.

### Gmail

Only for sending a finished deliverable to a client. Note that **sending anything on someone's
behalf requires explicit confirmation each time** — it is never automatic, no matter how the
request is phrased. Without it, deliverables are handed over through the store.

### A browser, when a setting has no API

Some settings a client depends on exist only behind a web interface — mail filters and rules,
notification preferences, a scheduler's own configuration. A session reaches those by driving a
browser, and that is legitimate work. What it is **not** is a read.

**Every change made through a browser is a persistent write to the client's own account.** Nothing
in this plugin can stop one: the company guard vetoes a store write with no company bound and a
local write outside the engagement folder, and a browser click is neither. It cannot become a third
veto either, because a guard cannot tell a click on *Guardar* from a click on *Cancelar* — the
coordinates look the same. So the control here is doctrine plus verification, and both halves are
mandatory.

**Never `type` into a field that already has a value.** Position the cursor with `End`, `Home` or a
click, then type, and the text lands somewhere the screenshot did not predict — this is measured,
not theoretical: editing the *De* field of four Gmail filters that way corrupted three of them, and
one was left holding a loose token that would have archived mail from **any** sender containing it.
The failure is silent, because the field afterwards contains text and a screenshot of text reads as
success. Two ways that work:

- `form_input` addressed to the element's **ref**, which replaces the whole value; or
- delete the object and create it again from empty fields.

**After any configuration change, read the state back and compare it against what you intended** —
the saved filter, the saved rule, the saved preference, item by item. Do not treat the click that
appeared to save as evidence that it saved. The one reason the corrupted filters above were caught
is that somebody re-read them afterwards.

**The journal records the verb, never the keystrokes.** A browser call is journaled as an
`ai_action` carrying the tool's own `action` (`screenshot`, `left_click`, `type`) and the url when
there is one; what was typed is digested, never copied, because it is the client's content. So the
trail can answer *what did this session change* and cannot answer *what did it say* — which is the
same split every other row here keeps.

---

## Not needed

**Nothing for rendering.** The render engine is `playwright-core`, a bundled npm dependency
driving the browser already installed on the machine. No MCP server, no browser connector, and no
network call at render time once the fonts are local.

---

## How to authorize

First-party connectors (Drive, Calendar, Gmail) are authorized in the user's own claude.ai
connector settings. Other MCP servers are added with `claude mcp` or `/mcp` in an interactive
session. Neither can be done from inside a plugin or from a non-interactive session.

## How to verify it actually works

Authorization showing as connected is not proof that the plugin can use it. Confirm with a real
round trip, in this order:

1. **Read** — ask for a file that exists in the company's Drive folder. A connected-but-unscoped
   connector fails here.
2. **Write** — create a throwaway file in the company's folder, then trash it. This also exercises
   the company guard, which will refuse the write if the folder id is not in `.company.json`.
3. **Comments** — read a Google Doc that has a comment on it and confirm the comment comes back.
   This is the approval gate; if comments do not arrive, the gate does not exist. On a OneDrive
   store there is no comments tool, so this step cannot pass there — say so, rather than skipping it.
4. **Public link** — confirm the assets folder is shared as "anyone with the link", by opening one
   asset URL in a private window. This one is easy to believe is done when it is not.
