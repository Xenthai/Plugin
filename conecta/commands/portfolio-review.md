---
name: portfolio-review
description: "Review every business an organization connection reaches, one row per business, with flags for the ones that need attention"
---

# /portfolio-review

Run one review across every business this organization connection reaches.

This command runs on an organization connection: `conecta_list_businesses` and the `business` argument exist there and are not served on a business connection.

## Steps

1. `conecta_list_businesses` `{}` (read): the businesses this connection reaches, each with its id
2. `analytics_overview` `{business: <business id>, period: "month"}` (read): one call per business; keep each business's numbers in its own row

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- A business that cannot be read goes under Not read with the reason; the review continues.

## Output

A table: business | headline figure | change | flag, then two sentences per flagged business and a Not read list.

## Hand-offs

Offer the business's own commands, /ads-review or /inbox-review, on a business connection.
