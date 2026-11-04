---
name: campaign-report
description: "Report every Meta and TikTok ad campaign this month, one block per ad account in its own currency"
---

# /campaign-report

Report the ad campaigns of every connected ad account for the period.

## Steps

1. `analytics_ads` `{level: "campaign", period: "month"}` (read): spend, impressions, clicks, CTR, CPC and CPM per campaign, one block per ad account
2. `tiktok_ads_list_campaigns` `{}` (read): TikTok's own status and budget for each campaign and ad group, as TikTok answers now

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Open each block with the account's id and currency, and name the freshness of its collection.

## Output

One block per ad account in its own currency: a table of campaigns with status, spend, clicks, CTR, CPC and CPM, then its best and worst campaign.

## Hand-offs

Offer /ads-review for proposals on the campaigns that underperform and /pacing for the month's projection.
