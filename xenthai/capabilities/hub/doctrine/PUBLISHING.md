# Hub publishing doctrine

Implements: fuera del playbook (X9)

How a hub is published as an artifact, updated in place, and linked to its siblings. Read it before
the first publish of a hub and before touching a sibling's switcher.

---

## First publish

Publish `index.html` as the page and images and interactive pages as support files, keeping their paths:

```
Artifact(
  file_path = "<folder>/index.html",
  icon = "book",
  description = "One sentence: what the hub is and for whom.",
  root = "<folder>",
  files = { "img/arquitectura.png": "img/arquitectura.png", "d/arquitectura.html": "d/arquitectura.html" }
)
```

- The HTML `<title>` is the artifact's name: "Empresa - Hub de X". The icon is one generic word and never changes.
- The artifact is born **private**. Say so on delivery: the team does not see it until its owner
  shares it from the Share menu (usually with the whole organisation, like the other hubs).
- Publishing is outward-facing: the operator confirms the publish of a hub that names the company.

## Updating

- Rebuild with the engine and publish to the **same file path** in this session (it keeps the url).
  Send in `files` only what changed; the rest is kept.
- A hub published in another conversation: pass its `url` and read it first (`action: "read"`) to
  build on the live version.
- A one- or two-sentence change may be an edit of the built `index.html`, but reflect it in
  `content.json` right after or the next build loses it.
- A design change for every hub is made in `capabilities/hub/engine/shell.html` and every hub is
  rebuilt; never patch one hub alone.
- A hub someone built without this engine: read it, rebuild its `content.json` from its HTML, and
  work from there.

## Adding the hub to its siblings' switcher

For each sibling:

1. Read it (`action: "read"`, `url`). The result says where it saved the full HTML.
2. Add the new hub with the switcher tool, which strips the viewer skeleton, changes **only** the two
   switchers (top bar and mobile menu) and verifies nothing else changed:
   ```bash
   node capabilities/hub/engine/switcher.mjs --in <read-html> --out <folder>/sibling.html \
     --name "Hub de X" --url https://claude.ai/artifact/<new-hub-id> [--after "Hub de Y"]
   ```
   Use `--after` to keep the new hub's switcher order.
3. Publish `sibling.html` to the sibling's `url` with a short `label` ("Enlace a Hub de X").

If the sibling has another owner, tell the operator it was changed; if it is shared with the
organisation, everyone sees the change at once.

## Delivery

In the reply: the link, what stayed `[por confirmar]`, who the owner is (or that one is missing), and
the reminder to share. Never repeat the hub's content.

## Before you finish

- The hub was published to the same path or `url` as before, so its link still works.
- Every sibling's switcher now lists the new hub, in the same order.
- The operator was told the hub is private until shared.
