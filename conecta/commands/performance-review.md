---
name: performance-review
description: "Review how the business did this month across inbox, ads, sources, links, posts and topics, with three findings worth acting on"
---

# /performance-review

Review how the business did over the period, compared with the previous span.

## Steps

1. `analytics_overview` `{period: "month", channel: "all"}` (read): one tile per metric and channel, each with its change against the previous span
2. `analytics_ads` `{period: "month", level: "campaign"}` (read): one block per ad account in its own currency; ad figures carry no change against the previous span
3. `analytics_sources` `{period: "month"}` (read): first-touch sources and how many qualified
4. `links_list` `{period: "month"}` (read): clicks and WhatsApp chats per tracked link
5. `analytics_posts` `{limit: 5}` (read): the five newest posts with their lifetime metrics
6. `analytics_topics` `{period: "month"}` (read): where this connection serves it; skip it and say so otherwise

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Write one section per area: inbox and leads, social, ads, sources and links, topics.

## Output

One section per area with its headline numbers and change, then three findings that deserve action, each with the numbers behind it.

## Hand-offs

Offer /ads-review when ad efficiency fell, /social-report for the posts and /leads-report for the pipeline.
