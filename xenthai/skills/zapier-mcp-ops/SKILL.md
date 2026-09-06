---
name: zapier-mcp-ops
description: 'Operate any Zapier MCP account safely and client-agnostically — discover which apps, actions and tables are connected, read and write without guessing schemas, send messages, and keep an audit trail when no Zap writes one. Use this whenever the user asks to "check my Zapier tables", "send a message via Zapier/WhatsApp", "connect X to Zapier", "what do I have connected", or any task touching an app through Zapier MCP, even when they name no table, field or app — this skill assumes those differ per client and discovers them live. Never conclude something "does not exist" because a search came back empty; follow the protocol before reporting absence.'
---

# Zapier MCP Ops

Client-agnostic procedure for operating any Zapier account over MCP. **Never hardcode a
`table_id`, a field key (`f1`, `f2`), a `selected_api`, or an app name recalled from
another session** — Zapier's own docs discourage this: keys are discovered at runtime. The
only thing reused across clients is the *procedure* below.

---

## 1. MCP architecture — what to expect before starting

### 1.1 Two server modes, different behavior

| Mode | How to recognize it | Implication |
| --- | --- | --- |
| **Agentic / dynamic discovery** (default) | `discover_zapier_actions` and `enable_zapier_action` exist | The agent discovers and enables actions itself, mid-conversation |
| **Managed / manual configuration** | Each action is a fixed dedicated tool, configured at mcp.zapier.com | The agent CANNOT enable anything new; fixed toolset, possibly pre-filled fields |

If `discover_zapier_actions` is absent, you are in managed mode: do not try to enable
actions, point the user to mcp.zapier.com instead.

### 1.2 The meta-tools, always present regardless of connected apps

**Actions:** `inspect_zapier_actions` (enabled actions + params) · `discover_zapier_actions`
(searches 9,000+ apps) · `enable_zapier_action` · `disable_zapier_action` ·
`auto_provision_mcp` (pre-enables from the account's existing connections)

**Execution:** `execute_zapier_read_action` · `execute_zapier_write_action`

**Rest:** `get_configuration_url` · `list_zapier_skills` · `get_zapier_skill` ·
`create_zapier_skill` · `update_zapier_skill` · `delete_zapier_skill` · `send_feedback`

Some accounts also expose `write_code_action`, which generates a custom code action when no
built-in action fits. Reach for it **only** after exhausting `discover_zapier_actions`.

### 1.3 Real cost: every call burns tasks

**Each successful tool call consumes 2 tasks** from the client's Zapier plan, at the same
rate as their Zaps. Consequences that change how you work:

- **Failed calls are free — test calls are not.**
- Batch work bills per operation: "add 5 rows" = 5 calls = 10 tasks.
- When the allowance runs out, **all tool calls stop** until the next billing period.
- Asking what tools exist (`inspect_zapier_actions`, discovery) does **not** count.

So: **explore with the free meta-tools, and execute deliberately.** Poking at `execute_*`
to see what happens spends the client's plan.

---

## 2. Discover what is connected

```
Zapier:inspect_zapier_actions()                       # no filters → all enabled apps (free)
Zapier:inspect_zapier_actions(selected_api="<id>")    # → that app's actions + real tool_name
```

If the app is missing:
```
Zapier:discover_zapier_actions(app="<name>")
Zapier:enable_zapier_action(selected_api=..., app_display_name=...)
```

**Never say "I don't have access to X" without running `discover_zapier_actions` first.**

Watch for similarly named products with different `selected_api` values — Google Sheets
(`GoogleSheetsV2CLIAPI`) and Zapier Tables (`TableCLIAPI`) are different products. If the
user says "my tables", check both before ruling either out.

---

## 3. Zapier Tables — the full pattern

### 3.1 List tables without knowing their names

The `table_id` enum **only resolves with the full `tool_name`**, not the short key. Passing
`tool_name="find_record"` returns `[]` even when tables exist:

```
Zapier:inspect_zapier_actions(action="find_record", selected_api="TableCLIAPI")
# → the real tool_name

Zapier:inspect_zapier_actions(
  enum_property="table_id",
  selected_api="TableCLIAPI",
  tool_name="zapier_tables_find_records"
)
# → dynamic_enum_values: [{value: "<id>", label: "[Table] <Name>"}]
```

If `dynamic_enum_next_cursor` comes back, repeat with `enum_cursor` until you get `[]`.

`find_table` also works, but needs the **exact name in the language it was created in** — a
table may be named "Clients" while everything else about the client is in Spanish. If one
language misses, try the other before concluding it does not exist.

### 3.2 Read the schema WITHOUT writing a junk record

**Never fire `create_record` just to see what fields it wants** — that creates a real, empty
row in the client's table and burns 2 tasks. Inspect for free instead:

```
Zapier:inspect_zapier_actions(
  params={"table_id": "<id>"},
  tool_name="zapier_tables_create_record"
)
```

Returns `dynamic_properties_schema` with every field (`new__data__f1`…), its type, and — for
selects — its valid `choices`.

### 3.3 Reading records — the result cap

`find_record` is a **search**, not a "fetch all": it returns few results (~3) no matter how
broad the filter. Before claiming "there are only N records" or "there is no data", **narrow
with 2+ filters** (`filter_count: "2"`, `field_data_key_2`, `operator_2`, `lookup_value_2`)
and compare. A broad query returning little may be the cap hiding rows, not an absence.

Operators: `exact`, `different`, `contains`, `icontains`, `in`, `isnull`, `startswith`.
`operator: "isnull"` with `lookup_value: "false"` returns records where the field has a value.

### 3.4 Sample data that looks real

Several apps insert a **placeholder** record the first time a trigger connects (WhatsApp/Meta:
phone `1234567890`, generic English text, date `2009-02-13`). Filter those out explicitly
before drawing conclusions about a channel's real traffic, and never mistake one for a
contact.

### 3.5 Writing

```
Zapier:execute_zapier_write_action(
  action="create_record",     # or update_record / delete_record
  selected_api="TableCLIAPI",
  params={"table_id": "<id>", "dynamic_properties": {"new__data__fN": ...}}
)
```

For `select` fields, a value outside `choices` is usually **accepted** and added as a new
option. Handy, but tell the user you are creating one.

---

## 4. Sending messages (WhatsApp Business or any connected channel)

1. **Confirm recipient and text with the user before sending.** If they gave no text, ask —
   never invent content for a real contact.
2. **Threading (`context_message_id` or equivalent) is used only when the user supplies it,
   or when you ask and they confirm.** Do not decide this on your own.
3. **24-hour window:** WhatsApp Business freeform messages send only within 24h of the
   contact's last inbound message. Outside it, an approved template is required
   (`send_template_message`).
4. The API confirms **acceptance, not delivery**. Real delivery needs the message-status
   trigger.
5. If no Zap logs outbound messages into the audit table — check, it is commonly missing —
   **write the record yourself right after sending**: outbound direction, an author value
   that makes clear an AI sent it rather than a label that hides it, the text, the real
   `message_id` the send API returned, and a timestamp.
6. Record it in the engagement journal too, which is a different record for a different
   reader: `node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs"`. The client's table is their
   operational log; the journal is what a report is built from.
7. If the user chains several test messages at a real contact who actually asked for
   something, **say so** — that is an operational problem, not a technical detail.

---

## 5. Replicating a setup across clients

Keep the split clean: **this skill stays generic and never learns a client's IDs.** Anything
client-specific belongs in a native Zapier skill in that client's own account (§5.2).

### 5.1 Sharing mechanisms

- **Tool bundles:** a shareable link carrying a server's *tool list*. Whoever opens it gets
  their own copy wired to **their** accounts, billed to **their** plan, with no access to
  your credentials or data. The right mechanism for standardizing a base toolkit.
- **Server access** (Team/Enterprise): shared access to *your* server using *your*
  connections. For an internal team — **not** for separate clients.

### 5.2 Client-specific skills live in Zapier, not here

`create_zapier_skill` stores Markdown **in the client's Zapier account**, loadable from any
MCP client. That is where a client's resolved IDs, table schemas and workflows belong: they
travel with the client and survive a change of AI vendor.

**Before creating one, resolve everything you can:**

1. `inspect_zapier_actions` for every app involved — exact action keys, `selected_api`, real
   `tool_name`, parameter schemas.
2. The client's fixed values — table IDs, field keys mapped to human labels, valid `select`
   choices, channel IDs, default recipients.
3. **Ask about anything ambiguous** — who receives what, which table is authoritative, the
   default status. Do not guess.
4. Reuse results already in the conversation; each execution costs tasks (§1.3).

**Required structure for `skillDefinition`:**

```
# <Title> — one-line description

## Validated fixed values
All static IDs, table IDs, field-key→label mappings, and enum choices confirmed
at creation time.

## Actions
ZapierAction[app:action](param: "locked_value", dynamic_param)
— quoted values are locked and forwarded at execution; bare names are filled at runtime.

## Runtime instructions
Numbered execution steps.

## Constraints
What the agent must NOT do.
```

**Lock every parameter you can at creation time** — each avoided runtime call is 2 tasks
saved. `list_zapier_skills` before creating, to avoid duplicating one that exists: names are
case-insensitive, and `update_zapier_skill` is the right call when one already covers it.

---

## 6. When things break

| Symptom | Usual cause |
| --- | --- |
| Tools missing in the client | Cached tool list — restart/refresh the client |
| A call fails with an auth error | Expired app connection → `manage_zapier_connections` to re-auth |
| Everything fails at once | Possibly the plan's task allowance is exhausted |
| A dynamic enum returns `[]` | Almost always an incomplete `tool_name` (§3.1), not missing data |

AI Actions and NLA (Natural Language Actions) are **retired** — never recommend them.

---

## 7. Checklist for a new client

1. `inspect_zapier_actions()` → what apps exist (free)
2. Agentic or managed mode (§1.1) — decides whether you may enable actions
3. Missing app → `discover_zapier_actions` → `enable_zapier_action`
4. Tables → resolve `table_id` via the enum with the full `tool_name` (§3.1)
5. Before writing → inspect the real schema (§3.2)
6. Before saying "no data" → 2+ filters, and rule out placeholders (§3.3, §3.4)
7. Messages → confirm recipient, text and threading; log the outbound both places (§4)
8. Recurring workflow → store it in **their** Zapier account (§5.2), not here

## STOP conditions

- **The action would reach a real person and the user has not confirmed the exact text and
  recipient.** A message is not reversible and the contact is the client's, not yours.
- **No company is bound and the work is a client's.** The journal has nowhere to land, so
  the audit trail this skill promises does not exist.
- **A write whose schema you did not inspect.** Guessing a field key writes junk into a
  client's operational data, and `create_record` is not a probe.
- **A search came back empty.** That is not absence until §3.1 and §3.3 have both been run.
  Reporting "you have no X" on a capped search is a wrong answer that looks like a finding.
- **The client is on the third rung of the autonomy ladder without having earned it.** An
  agent sending messages unattended is the top rung, and `HANDOVER.md` says what has to be
  true first.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/automate/doctrine/HANDOVER.md` | Anything here would run unattended, or the client asks for it to |
| `capabilities/company/doctrine/CONTROLS.md` | Deciding whether an action is announced, journaled or refused |
| `node tools/journal.mjs --help` | Before recording an outbound message or an approval |
