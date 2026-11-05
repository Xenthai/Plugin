---
name: pacing
description: "Check this month's ad spend pace against the previous span, per ad account, with accounts off pace by more than 10 percent flagged"
---

# /pacing

Check the month's ad spend pace for every connected ad account.

## Steps

1. `analytics_review` `{period: "month"}` (read): the flags Conecta computed, pacing among them: spend against the previous span's, above 110 percent or below 90 percent
2. `analytics_ads` `{period: "month", level: "campaign"}` (read): spend to date and the previous span's spend, one block per ad account

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Take the pacing verdicts from analytics_review as computed; never recompute them.
- When the user gives a monthly budget, also project spend to date divided by days elapsed, times days in the month, against it, and say that projection is yours.

## Output

A table: ad account | currency | previous span | spend to date | percent of previous | flag.

## Hand-offs

Offer /ads-review for proposals on the flagged accounts.
