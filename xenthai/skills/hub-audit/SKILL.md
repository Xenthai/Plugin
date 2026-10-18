---
name: hub-audit
description: Reviews a company's published internal hubs and proposes their maintenance — switchers out of line, owners and review dates, "[por confirmar]" items still open, broken links and files, diagrams stale against the repository's current commit, source documents that changed, possibly sensitive data and hubs not shared. Use when asked to review the hubs, whether they are current, for monthly documentation maintenance or what is stale, before presenting the hubs to someone, after a large product or code change, or as a scheduled routine. Proposes only; changes go through hub-build or hub-atlas after approval.
---

# Hub audit

Hubs age silently: the code changes, a process changes, a new hub arrives and the others never link
it. This skill finds what fell behind and proposes the changes; **it applies none without approval**.

The binding is `hub`'s Step 1.

## 1. Inventory

- List the hubs: the ones the operator names, or search their artifact list (titles "… - Hub de …").
- Read each (`action: "read"`). Note from each read: owner, whether the operator can write to it, with
  whom it is shared, and the path of the saved HTML.

## 2. Automatic pass

```bash
node "${CLAUDE_PLUGIN_ROOT}/capabilities/hub/engine/audit.mjs" <hub1.html> <hub2.html> ... --json audit.json
```

Per hub: pages and menu, the switcher, the footer (owner, version, date), `[por confirmar]` per page,
broken internal links, `target="_blank"` to own files, support files referenced, commits cited and
sensitive-looking patterns. Across hubs: whether every switcher agrees and every hub has one url.
Sensitive hits are leads: read each by hand.

## 3. Against the sources

Walk `capabilities/hub/doctrine/AUDIT.md`. The common ones:

- **Code:** a hub that cites a commit (the engineering hub) is compared with the current commit. If
  `git log` shows the cited paths changed, that diagram is stale and is redone with `hub-atlas`.
- **Source documents:** if the hub links documents (manuals, policies, the company store's
  `03-procesos/`, `01-oferta/`, `comunicacion/`), check whether they changed after the hub's date.
- **Pending items:** each `[por confirmar]` older than 30 days is a reminder for the owner.
- **Support files:** compare the referenced ones with the published list (`action: "list"`, `scope: "files"`).
- **Sharing:** a private hub the others link to opens for nobody else.

## 4. The report

Write `hubs/AUDITORIA-<yyyy-mm-dd>.md` in the store, es-MX, with the four parts of `AUDIT.md` §"The
report": state in one sentence, a table per hub, across hubs, and proposed changes each with who
approves it. Short enough: it may go in the reply instead.

Company files change through `Write` and `Edit` only. `capabilities/company/doctrine/CONTROLS.md` carries why, and what the guard refuses versus merely records.

```bash
node "${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event review_end --capability hub --why "hub audit: <n> hubs reviewed"
```

## 5. Applying (only with approval)

- Switcher changes: `capabilities/hub/engine/switcher.mjs` and a publish with the hub's `url`.
- Content changes: through `hub-build` (edit `content.json`, rebuild, check, publish to the same url).
- Stale diagrams: through `hub-atlas`.
- Other people's hubs: tell their owner or ask first; if shared with the organisation, the change is
  visible at once.

Record each approval by name: `tools/journal.mjs --event approval --actor person:<name> --why "<what>"`.

## As a routine

If the operator asks, schedule this review (monthly, say) with the available routine tool. The plan
is the approval: the routine produces the report and changes nothing. Applying stays a separate,
approved step.

## STOP conditions

- **No hub can be read** (no access, or no artifact found). Ask for the links; an audit of nothing
  reports nothing.
- **A sensitive hit is real** (a customer's tax id, a credential). Report it to the operator at once,
  before the rest of the report, and propose its removal as the first change.
- **The fix is a rebuild, not a patch** (`AUDIT.md`, "Signs a hub needs rebuilding"). Propose the
  rebuild through `hub-intake` and `hub-build`; do not patch.
- **The operator asks for the changes to be applied in the routine itself.** Refuse that part: a
  routine never publishes what no plan approved.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/hub/doctrine/AUDIT.md` | Always, after the automatic pass |
| `capabilities/hub/doctrine/PUBLISHING.md` | Applying an approved switcher or content change |
| `capabilities/hub/doctrine/PITFALLS.md` | Explaining why a link or file problem matters |
