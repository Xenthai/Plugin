---
name: ads-review
description: "Review ad efficiency this month and end with numbered proposals; a TikTok change the user approves runs through its preview and one confirmation"
---

# /ads-review

Review the ad accounts read-only and end with numbered proposals the user can approve one by one.

## Steps

1. `analytics_ads` `{level: "campaign", period: "month"}` (read): spend and efficiency per campaign, one block per ad account
2. `analytics_ads` `{level: "adset", period: "month"}` (read): the same per ad set or TikTok ad group
3. `tiktok_ads_list_campaigns` `{}` (read): TikTok's status and budget now, for the ids a proposal names
4. `analytics_sources` `{period: "month"}` (read): which sources brought people who qualified

## After the user approves

1. `tiktok_ads_preview_status` `{level: "campaign", id: <campaign id from tiktok_ads_list_campaigns>, status: "pause"}` (read, preview of `tiktok.ads_status`): one change at a time; level "adgroup" for an ad group, and account when several TikTok ad accounts are connected
2. `conecta_confirm` `{operation: "tiktok.ads_status", confirmation_token, user_confirmation}` (destructive): then read the campaign again and report its new status
3. `tiktok_ads_preview_budget` `{level: "campaign", id: <campaign or ad group id from tiktok_ads_list_campaigns>, budget: <new budget, a decimal with at most two places>}` (read, preview of `tiktok.ads_budget`): a budget change, one at a time
4. `conecta_confirm` `{operation: "tiktok.ads_budget", confirmation_token, user_confirmation}` (destructive): then read the campaign again and report its new budget

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- End with numbered proposals, each with the account, the campaign, the change and the numbers behind it; propose changes to Meta campaigns in words only.

## Output

Findings per ad account, then numbered proposals: account, campaign or ad group, the change, the expected effect.

## Hand-offs

Offer /pacing for the month's projection and /campaign-report for the full table.
