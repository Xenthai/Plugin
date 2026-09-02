---
name: social-handoff
description: Package finished assets and copy so a person can publish them without asking a single question — the schedule, the files, and an honest note about anything that still needs doing by hand. Use when a batch has been approved and needs delivering, when the client asks for the files or the calendar, when they want an import file for a scheduling tool they already pay for, or when a previous handoff was incomplete. Emits a canonical schedule that works with no paid tool, plus a vendor import file only when that vendor is already in use. For producing the assets themselves, use social-produce first.
---

# Handoff — the delivery package

> Shell commands below use `${CLAUDE_PLUGIN_ROOT}`. It is guaranteed inside hooks, not inside a
> skill's shell — if it is unset, use the plugin root announced at session start.

The package is the entire integration surface. There is no publishing API in this pipeline by
design, so whatever is in this folder is what the person publishing has to work with. If they have
to ask a question, the handoff failed.

## What the folder contains

```
content/<YYYY-MM>/delivery/
  README.txt          what goes where, and what needs a human — read this first
  schedule.csv        the canonical schedule, one row per piece
  assets/             filenames that match schedule.csv exactly, prefixed by piece id
  import/             vendor-shaped files, only for a vendor the client already uses
  reminders.ics       optional, due dates only — never an import target
```

`schedule.csv` columns: `piece_id, date, time, timezone, platform, post_type, caption,
asset_filenames, alt_text, first_comment, link_url`.

Asset filenames are **prefixed with the piece id** so a person can eyeball-match a file to a row
without opening anything.

Copy the bundled fonts' licence texts — `capabilities/social/engine/fonts/OFL-*.txt` — into
`assets/licenses/`. The typefaces are SIL OFL 1.1, which permits redistribution with software on the
condition that the licence text travels with it. The plugin holds the text; a delivery that leaves it
behind is the one place the condition gets broken.

## Two things that break a handoff silently

**Write every CSV as UTF-8 with a byte-order mark.** Plain UTF-8 is not sufficient for
spreadsheet-edited workflows and Spanish accents arrive corrupted. This is the single most common
way a technically-correct delivery becomes unusable.

**Chunk vendor import files at about 50 rows.** Beyond that, imports become unreliable.

## Vendor import files — only when it is already paid for

No scheduling tool is a dependency of this pipeline. A person publishing natively in an app uploads
the file from their own device and needs no URL at all, which is why the canonical package works
with nothing bought.

Generate a vendor file **only** if the client already uses that vendor. What each one can carry:

| Vendor | Carries |
| --- | --- |
| Metricool | The most capable schema: native video, 10-image carousels, Reel, Story, per-network metadata |
| Publer | The cleanest shape: 12 fixed columns, a post-subtype column, comma-separated URLs for a carousel |
| Buffer | Text and **one** image. No video, no carousel, no Reels. **It silently discards rows beyond the plan's limit** — chunk to the limit or pieces vanish with no error |

Do not build for Later, Hootsuite, Sprout Social or Meta Business Suite. Later has no bulk
scheduling at all — its "bulk upload" moves media into a library with no copy, date or platform.
Hootsuite's own help states you cannot attach images or video to bulk posts, so every piece needs
manual attachment anyway. Sprout takes a single image and no video. Business Suite has no bulk
post import. Emitting a file for any of them promises something the tool cannot do.

### The public-URL trap

Metricool, Buffer and Sprout fetch media by URL — **they cannot read a local file.** If the client
uses one of them, the assets must be publicly reachable before the CSV is generated, and those URLs
baked into it.

The company's own store can serve this, but the sharing setting is a **one-time manual step on the
assets folder** and everything inside inherits it. If that step has not been done, say so in
`README.txt` explicitly. Do not emit a CSV full of URLs that will 404 on import — the person will
discover it one failed row at a time.

## `README.txt` states what is not done

This file is where the handoff earns trust. It names, plainly:

- Which import file goes into which tool
- Which rows need something attached by hand, and why
- Anything that could not be produced, and what would unblock it
- Whether the assets folder is publicly reachable, and if not, what to do about it

**Degrade in the open.** A package that looks complete and is not is worse than one that says what
is missing — the first is discovered at publish time by someone who cannot fix it.

## The .ics file is a courtesy, not a mechanism

**Zero of the scheduling tools accept iCalendar as a bulk-scheduling input.** It also has no field
for platform or post type. Emit it only as due-date reminders alongside the real package, and say
that is what it is.

## Record the delivery

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event delivery --capability social \
  --why "handoff for <period>: N pieces, M platforms, K rows needing manual attachment" \
  --target "content/<YYYY-MM>/delivery"
```

Create and change company files with `Write` and `Edit` only. The company guard covers those two;
it cannot see a shell redirect, and the journal would show the violation after the fact rather
than stop it.

## STOP conditions

- **An asset named in `schedule.csv` does not exist.** Fix the mismatch before delivering. A
  missing file is found by the person publishing, at the worst moment.
- **The client uses a URL-fetching vendor and the assets are not public.** Deliver the canonical
  package, skip that vendor's file, and say in `README.txt` what has to happen first.
- **A piece has no approval.** It does not go in the package. List it separately as awaiting
  approval.
