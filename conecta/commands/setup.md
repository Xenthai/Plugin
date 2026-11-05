---
name: setup
description: "Check what this Conecta connection reaches, which accounts are connected and what waits on a person, then offer a first report"
---

# /setup

Orient yourself in the business this connection is bound to before any report.

## Steps

1. `business_get_context` `{}` (read): the business's name, profile and catalogue
2. `connections_list_accounts` `{}` (read): the connected channel and ad accounts with their status; if this connection is not served it, say so and continue
3. `connections_available` `{}` (read): what this business could still connect and which modules wait on an operator; if this connection is not served it, skip it
4. `pending_list` `{status: "pending"}` (read): what waits on a person today

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- State which channels and ad accounts are connected and which need a person to reconnect them.

## Output

Four short blocks: the business, the connected accounts with their status, what it could still connect, and what waits on a person.

## Hand-offs

Offer one first report: /performance-review for the whole business, or /inbox-review when requests wait.
