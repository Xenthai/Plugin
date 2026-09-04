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
| Write a document, an asset, or a journal file | `create_file` |
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

**Also worth knowing:** the connector exposes no revisions tool, so the plugin **cannot pin a
Drive revision** (`keepForever`) before migrating a document. Drive keeps its own revision history
regardless, so the safety net exists — but it is Drive's, reachable through Drive's own interface,
not something this plugin can guarantee programmatically. Migrations therefore write their own
backup file first rather than relying on the store.

---

## Optional, per capability

### Google Calendar

Onboarding runs one phase per session, so the phases are real appointments. With Calendar the
plugin can propose and place them; without it, scheduling is a conversation and the phase record
in the journal is unaffected.

### Gmail

Only for sending a finished deliverable to a client. Note that **sending anything on someone's
behalf requires explicit confirmation each time** — it is never automatic, no matter how the
request is phrased. Without it, deliverables are handed over through the store.

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
   This is the approval gate; if comments do not arrive, the gate does not exist.
4. **Public link** — confirm the assets folder is shared as "anyone with the link", by opening one
   asset URL in a private window. This one is easy to believe is done when it is not.
