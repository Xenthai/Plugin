# Brand applications — what to build after the manual, and the public page

Implements: none (mechanics)

Read by `brand-manual` once the manual is delivered. None of this is default output: offer it, build only what the operator picks.

## 1. Applications — offer, build on request

After the manual, offer these with AskUserQuestion (multiSelect, sales impact first). All install
the Design System, are named per `capabilities/naming/doctrine/naming.md` and pass the brand sweep.

| Application | Type and name | Notes |
| --- | --- | --- |
| Proposal template | Docs · `📄 <Empresa>: Docs: Plantilla: Propuesta comercial` | Formal register. Sections: problema, alcance y qué no incluye, permisos y puntos de control, criterio de éxito, etapas y pagos (drawn as a diagram with the payment gates), garantías, siguientes pasos y aceptación. Prices only from `PRICING.md`; unknowns as bracketed placeholders |
| Sales deck | Slides · `📊 <Empresa>: Slides: Presentación comercial` | 10–12 slides: problema, qué hacemos, un ejemplo de punta a punta (`EXAMPLES.md`), bitácora, método, gobierno, precios publicados, garantías, quién está detrás, cómo empezar, cierre. Engineering figures only from `PROOF.md`, flagged in speaker notes to confirm their date |
| Stationery | Canvas · `🧩 <Empresa>: Canvas: Papelería` | Boards at true print size: card 96 × 56 mm (90 × 50 + 3 mm bleed) front and back, letterhead 816 × 1056, email signature preview. Also export print PDFs; Chromium rounds mm to px, so fix the page box with pypdf `scale_to(96/25.4*72, 56/25.4*72)` and verify the mediabox. Signature as a pasteable HTML table in Arial 12 px with the isotype as a hosted PNG (email clients drop SVG) |
| Social kit | Canvas · `🧩 <Empresa>: Canvas: Kit de redes` | LinkedIn company cover 1128 × 191 and profile cover 1584 × 396 (keep the bottom-left clear for the avatar), a data post, a quote post and a carousel at 1080 × 1350 ending in a call to action. Read the existing social and video docs first; reuse the avatars; signal colour on at most two elements; footer per DESIGN.md. Export PNGs at exact size |
| Brand checker | Web · `🌐 <Empresa>: Web: Verificador de marca` | One page: paste text, pick the channel (tú or usted), get marks for name spelling, banned words, tool names, emoji, register, figures and client names, with safe auto-fixes. Use Unicode-aware boundaries (`(?<!\p{L})…(?!\p{L})` with the `u` flag) or accented words slip through. Test it on a sample with known violations before publishing |


## 2. Only if asked: the public page and the repo

- Work on a branch. Changes reach `main` through a PR, never a direct push.
- Publish only approved content (name, logo files to download, colors, type, diagram, how to
  write about the company). Drafts such as unapproved principles stay out.
- Strings through the site's i18n, routes through its route table, its own components reused.
- A brand-spelling change touches i18n, schema/meta, package descriptions, playbook sources,
  method data, the sweep rule **and the tests that assert the old spelling**. Regenerate derived
  content (playbook docs, method export) and keep word budgets.
- Run lint, check, test and build before committing. If pnpm cannot run on the mounted checkout
  (EPERM on Windows mounts), rsync to a scratch copy with `.git` and without `node_modules`, run
  there, and copy back only what changed.
- Push, PR and merge when the operator asks: the Linux VM has no GitHub credentials, so run `git`
  and `gh` through the Windows PowerShell tool in the repo folder, where the operator's `gh` is
  logged in. Create the PR with `--body-file` (written UTF-8 without BOM), wait for checks, merge
  with `--merge`, then fetch the live URLs to confirm the deploy. A second site (for example the
  playbook) may not deploy on merge; say so.

