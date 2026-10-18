# Hub maintenance checklist

Implements: fuera del playbook (X9)

What a periodic review of published hubs checks, beyond what `capabilities/hub/engine/audit.mjs`
reports on its own. Read it during an audit, after the automatic pass.

---

## Per hub

- [ ] Has an owner named in the footer.
- [ ] Has a version and a date; the date is under 6 months old or there is a reason it does not change.
- [ ] Every menu page exists and every page is in the menu.
- [ ] No internal link to a page that does not exist.
- [ ] No `target="_blank"` to the artifact's own files.
- [ ] Every referenced image and interactive page is published (compare with `action: "list"`, `scope: "files"`).
- [ ] Every `[por confirmar]` is under 30 days old or has an owner resolving it.
- [ ] No sensitive data: customers, tax ids, credentials, hosts, accounts, internal figures.
- [ ] If it cites a commit: the cited paths did not change since (`git log <commit>.. -- <paths>`), or it is marked to redo with `hub-atlas`.
- [ ] If it links source documents (manuals, policies, the company store's documents): they did not change after the hub's date, or the impact was reviewed.
- [ ] Looks right on desktop, phone and dark mode (`check.mjs`, if rebuilt).
- [ ] Is shared with whoever must see it. A private hub the others link to opens for nobody else.

## Across hubs

- [ ] Every hub has the same switcher: same names, same order, same urls.
- [ ] Each hub marks only itself as current.
- [ ] The Personas hub (if it exists) links to all the others.
- [ ] Common resources (design system, templates) point at the same urls everywhere.
- [ ] No hub duplicates another's content: if two explain the same thing, one links to the other.

## Signs a hub needs rebuilding, not patching

- More than a third of its pages have pending items.
- The core process changed (new system, new area, new product).
- The code changed in the paths of more than half of its diagrams.
- The owner changed and the new one does not recognise it as theirs.

## The report

1. **State in one sentence:** how many hubs, how many current, what is most urgent.
2. **Table per hub:** Hub · Owner · Last version · Pending · Problems · Proposed action.
3. **Across hubs:** switchers, names and order.
4. **Proposed changes**, one per line, with what changes and who approves it.

The report is es-MX for the company. A sensitive-looking hit from `audit.mjs` is a lead: a public
contact address is fine, a customer's RFC is not.

## Before you finish

- Nothing was changed without approval; the audit only proposes.
- Every proposed change names who approves it.
- A hub belonging to someone else is only changed with its owner told.
