# Xenth AI

Applied-AI consulting, executable.

This repository is a Claude Code **marketplace** whose catalogue sits at the root and whose one
plugin lives in [`xenthai/`](xenthai/). That shape is deliberate and is explained at the bottom.

## Install

Two commands, in this order. The first adds the catalogue; the second installs from it.

```bash
claude plugin marketplace add Xenthai/Plugin
```

```bash
claude plugin install xenthai@xenthai
```

In the desktop app: **Plugins → Agregar → Agregar marketplace**, and type `Xenthai/Plugin` — owner
and repository, not a full URL. Then add the plugin from the catalogue that appears.

Both halves of the install line really are `xenthai`: the plugin and the catalogue share a name, so
the line looks like a typo and is not one. The separator is `@`, never `/` — `xenthai/xenthai` is
read as a single plugin name and the error that follows sounds like the marketplace is missing.

Then authorize the connectors. **A plugin cannot declare or install a connector**, so that is the
one step a person has to do by hand — [xenthai/MCP.md](xenthai/MCP.md) lists what to authorize and
how to verify it. The full first-visit runbook is [xenthai/INSTALL.md](xenthai/INSTALL.md), or run
`/xenthai:setup`, which reads the steps back before doing anything.

## What the plugin does

[xenthai/README.md](xenthai/README.md) — the skills, the render engine, the journal, the company
guard, and the two rules that outrank convenience.

## Why the plugin is in a subdirectory

The desktop app syncs a marketplace over HTTP. It reads any file inside the repository it synced,
and it cannot clone a second one. So a plugin declared by URL — the form that works from a terminal,
which does clone — never resolves in the app, and the dialog says only that the sync failed.

That was measured rather than guessed: one catalogue carrying two entries, a URL source and a
relative-path source. The relative one appeared in the app; the URL one did not.

Hence one repository, catalogue at its root, plugin at `./xenthai` beneath it. `test/ops.test.mjs`
asserts the shape, because it looks arbitrary and reverting it costs a day.

## License

[Functional Source License 1.1, Apache 2.0 future](xenthai/LICENSE) — free to use, install and
modify; competing commercial use is not permitted; converts to Apache 2.0 two years after release.
