---
name: sources
description: "Show which Conecta modules and tools this connection reaches and which accounts are connected"
---

# /sources

Show what this connection can read and do, and which accounts stand behind it.

## Steps

1. `conecta_find_tools` `{}` (read): the module index of this connection
2. `connections_list_accounts` `{}` (read): the connected channel and ad accounts with their status; if this connection is not served it, say so and continue

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Name only what this connection is served; a module it does not reach is not listed.

## Output

One line per module with what it covers, then the connected accounts with their status.

## Hand-offs

Offer /setup for a first look at the business and /performance-review for the month's figures.
