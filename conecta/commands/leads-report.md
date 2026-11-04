---
name: leads-report
description: "Report the lead pipeline this month by status, with the first-touch sources that brought the qualified ones"
---

# /leads-report

Report the lead pipeline and where its people came from.

## Steps

1. `whatsapp_list_leads` `{status: "new", since: <first day of this month, ISO 8601 with offset>, detail: "summary"}` (read)
2. `whatsapp_list_leads` `{status: "contacted", since: <first day of this month, ISO 8601 with offset>, detail: "summary"}` (read)
3. `whatsapp_list_leads` `{status: "qualified", since: <first day of this month, ISO 8601 with offset>, detail: "summary"}` (read)
4. `whatsapp_list_leads` `{status: "closed", since: <first day of this month, ISO 8601 with offset>, detail: "summary"}` (read)
5. `whatsapp_list_leads` `{status: "discarded", since: <first day of this month, ISO 8601 with offset>, detail: "summary"}` (read)
6. `analytics_sources` `{period: "month"}` (read): first-touch sources and how many of their people qualified

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Count leads by status as the lead records say, and name no person.

## Output

A table of leads by status, then the sources ranked by qualified people with their share.

## Hand-offs

Offer /sources for the module map and /ads-review when a paid source brings few qualified people.
