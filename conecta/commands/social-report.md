---
name: social-report
description: "Report the connected social accounts' organic performance this month: figures per channel, the best posts, the Instagram audience and Conecta-published posts"
---

# /social-report

Report how the connected social accounts did over the period.

## Steps

1. `analytics_overview` `{channel: "all", period: "month"}` (read): reach and engagement per channel with their change
2. `analytics_posts` `{channel: "all", limit: 20}` (read): newest first; keep the posts dated in the month, paging with cursor until one predates it
3. `analytics_audience` `{channel: "all"}` (read): stored audience breakdowns, where Meta reported them
4. `publishing_post_stats` `{targetId: <account entry of a post Conecta published>, period: "month"}` (read): only for a post Conecta published; the entry ids come from publishing_get_post

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Report each channel on its own and say which accounts reported nothing.

## Output

One block per channel with its figures and change, the three best among the month's posts with the metric that ranks them, and the audience in one line.

## Hand-offs

Offer /performance-review for the whole business and /inbox-review when comments or messages wait.
