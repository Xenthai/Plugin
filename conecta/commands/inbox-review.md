---
name: inbox-review
description: "Review what waits in the inbox now: unread chats, requests awaiting a person, new leads and who each chat is assigned to"
---

# /inbox-review

Review the live state of the inbox and what waits on the team.

## Steps

1. `analytics_overview` `{period: "month"}` (read): the conversations unanswered now and the follow-ups due today, which do not depend on the period
2. `whatsapp_list_conversations` `{needs_reply: true, limit: 20}` (read): newest activity first; sort them by how long each has waited
3. `pending_list` `{status: "pending"}` (read)
4. `workspace_digest` `{}` (read): counts of approvals, new leads, agent requests and pending meeting tasks
5. `whatsapp_get_assignment` `{handle: <handle of a chat that waits>}` (read): for the chats that waited longest after sorting

## Rules

- Call a listed tool directly and run any other through `conecta_run_read` with the arguments the step gives.
- The user types each command as `/conecta:<name>`; a bare name here means that command.
- Read with `period: "month"` unless the user names a period, and say the period used.
- Change nothing in the business from the steps above; where a command has an After the user approves section, its steps run only for a change the user approved in so many words, one `conecta_confirm` for each.
- Keep each figure in its account's own currency, add nothing across channels or currencies, and never read "not reported" as zero.
- A connection check and the Instagram link are person-only acts that no command runs; the user asks for one separately.
- Name how long each chat has waited and whether its reply window is still open.

## Output

The counts first, then the chats that wait longest with their wait, window and assignee, then the requests awaiting a person.

## Hand-offs

Offer /leads-report for the pipeline and /performance-review for the month's figures.
