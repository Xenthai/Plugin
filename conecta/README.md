# Conecta plugin

Conecta's MCP server gives an AI client one company's WhatsApp, Facebook and Instagram inboxes, contacts and leads, recorded meetings, scheduled posts, channel analytics and the requests waiting for a decision. This plugin connects the server to Claude Code and adds the `conecta` skill, which teaches an AI how to use that server from the first question, ten commands that run common reviews, and two read-only agents. It is released under FSL-1.1-ALv2; see `LICENSE`.

## Install

Add the Xenth AI marketplace and install the plugin in Claude Code:

```
claude plugin marketplace add Xenthai/Plugin
claude plugin install conecta@xenthai
```

Then sign in when Claude Code asks. The plugin adds the MCP server (`https://conecta.xenth.ai/mcp`) and the skill in one step, so use it instead of `claude mcp add`; with both, Claude Code holds two Conecta servers.

## Commands

Claude Code lists each command as `/conecta:<name>`. Every command reads with `period: month` unless you name another period and changes nothing in the business; `/ads-review` is the one command that can act, and only for a TikTok change you approve, one at a time.

- `/setup`: what the connection reaches, which accounts are connected and what waits on a person.
- `/performance-review`: inbox, ads, sources, links, posts and topics, with three findings worth acting on.
- `/campaign-report`: every Meta and TikTok ad campaign, one block per ad account in its own currency.
- `/social-report`: organic figures per channel, the best posts and the Instagram audience.
- `/inbox-review`: unread chats, requests awaiting a person, new leads and assignments.
- `/ads-review`: ad efficiency, ending in numbered proposals.
- `/pacing`: the month's projected ad spend against a budget or last month's spend.
- `/leads-report`: the lead pipeline by status and the sources that brought the qualified leads.
- `/sources`: the modules and tools the connection reaches and its connected accounts.
- `/portfolio-review`: one row per business, on an organization connection only.

## Agents

- `conecta-analyst`: diagnoses one business's numbers, from the channel down to the post, the campaign and the metric.
- `conecta-portfolio`: runs one review across every business an organization connection reaches.

Both are read-only: they never confirm or change anything and hand every change back to the main conversation.

## Served to every connection

The server serves the same skill to every connection through the MCP Skills extension (`io.modelcontextprotocol/skills`): `skills/list` returns it with a digest and a size for each file, and `skills/get` or `resources/read` of `skill://conecta/SKILL.md` returns its text. A host that imports skills from an MCP server needs nothing from this folder. The commands and agents ship only with the plugin.

## Local plugin marketplace

A person with the Conecta repository can add this folder as a local plugin marketplace in Claude Code. Use the path to `packages/mcp/skill` on that machine:

```
/plugin marketplace add <path to packages/mcp/skill>
/plugin install conecta@conecta-skills
```

`skills/conecta`, `commands` and `agents` are generated from the server's own catalogue by `pnpm --filter @conecta/mcp build:skill`; do not edit them by hand. `pnpm --filter @conecta/mcp publish:plugin` mirrors this folder into a clone of `Xenthai/Plugin`.

## What the skill covers

- `SKILL.md`: what the server is, how its modules map to tool names, the find, run and confirm loop, how to answer and worked jobs.
- `references/catalogue.md`: every tool, with its effect, the permission it needs and when to use it.
- `references/workflows.md`: the jobs the server is most often asked to do, step by step.
- `references/vocabulary.md`: each module's id, tool prefixes, scope and untrusted sources, and the channel values the tools accept.
- `references/refusals.md`: each confirmable operation with the preview tool to run again and the permission `conecta_confirm` checks again, then the tools each permission gates.
