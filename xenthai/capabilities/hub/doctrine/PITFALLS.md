# Hub pitfalls

Implements: fuera del playbook (X9)

Failures that each happened on a real hub, and why. The engine and the check catch most of them;
read this before publishing so the ones they cannot catch are not repeated.

---

## The viewer wraps the page

On publish, the artifact viewer prepends its own skeleton (`<!doctype>`, a `<head>` with charset and
viewport, and the rule `[hidden]{display:none!important}`) and places the file inside its `<body>`.

- **Never write `<!doctype>`, `<html>`, `<head>` or `<body>` in `index.html`.** It starts with
  `<title>`. `build.mjs` refuses otherwise.
- **Test with the skeleton.** Without the `[hidden]` rule, hidden pages (`article.page[hidden]`, which
  are `display:flex`) all render stacked and the search box shows as an empty bar. `check.mjs`
  adds the skeleton; a hand test must add it too.
- **Broken accents in a local test** (`TÃ©cnico`) are the missing charset of the skeleton, not a hub defect.
- Any own element with `display` and a `hidden` attribute also needs `[hidden]{display:none}` in its
  CSS to work outside the viewer (the template does it for `.lightbox` and `.results`).

## Own files and new tabs

- **`target="_blank"` to one of the artifact's own files (`d/x.html`, `img/x.png`) fails** with
  `ERR_BLOCKED_BY_RESPONSE`: the file opens outside the viewer and the host blocks it. Open it in the
  same frame and give a way back. `https://` links to other sites or other artifacts do take `target="_blank"`.
- An interactive page published as a support file (`d/x.html`) must be a complete document (with its
  own `<!doctype>`), because the viewer does not wrap it. Opened in the same frame, it needs a fixed
  "← Volver al índice" button with `history.back()`.
- Enlarged images open in the template's image viewer (`data-full`), never in another tab.

## Diagrams and heavy viewers

- Never depend on an interactive viewer (zoom, drag) as the only way to see a diagram: in some
  environments scroll or drag does not respond. Always publish an **image** (PNG at 2x) inside the
  hub and leave the interactive one as an option. `capture.mjs` produces it.
- Some viewers only drag the canvas after zooming in with "+": say so on the page.
- Diagram images are usually light; the template places them on white in dark mode too.
- Very tall images (sequences, data models) carry `tall: true`: clipped with a fade, complete when enlarged.

## Weight and files

- 16 MB per page: banner textures and logos are embedded; content images go as support files.
- On an update, support files not sent are kept; send only the ones that changed.

## Sibling hubs

- The switcher is identical in every hub (same order, same urls). A hub added without updating the
  others leaves the company with disagreeing switchers. `audit.mjs` reports it.
- Other people's hubs may have co-authors: read the published version right before editing and change
  only the switcher (`switcher.mjs` refuses any other change).

## Testing

- A background local server can die on a time limit; restart it if a test fails with "connection refused".
- Never kill processes with `pkill -f` using a pattern that also appears in your own command: it
  kills your own shell.

## Before you finish

- `index.html` starts with `<title>` and carries no skeleton.
- No own file opens with `target="_blank"`.
- Every diagram has a PNG in the hub; the interactive version is optional.
