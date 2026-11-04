---
name: pacing
description: "Project this month's ad spend against a budget or last month's spend, per ad account, with accounts off pace by more than 10 percent flagged"
---

# /pacing

Project the month's ad spend for every connected ad account.

## Steps

1. `analytics_ads` `{period: "month", level: "campaign"}` (read): spend to date this month, one block per ad account
2. `analytics_ads` `{from: <first day of last month, YYYY-MM-DD>, to: <last day of last month, YYYY-MM-DD>, level: "campaign"}` (read): last month's spend, because the ads read carries no previous span

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Projected spend is spend to date divided by days elapsed, times days in the month; compare it with the budget the user gives, or with last month's spend and say which you used.
- Flag an account projected more than 10 percent above or below its reference.

## Output

A table: ad account | currency | reference | spend to date | projected | percent of reference | flag.

## Hand-offs

Offer /ads-review for proposals on the flagged accounts.
