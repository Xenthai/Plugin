# Method data

`method.json` and `tables/*.md` are the quantifiable XenthAI methodology — phases, principles,
archetypes, the X3 scoring rubric, the X4 coverage rubric, the X5 risk matrix, the X7 glossary, the
A9 maturity model and the A2 store layout — vendored from the Web repository's `packages/method`.

## Generated, never edited by hand

Both `method.json` and every file under `tables/` are produced by:

```bash
pnpm --filter method export --to <plugin>/xenthai/capabilities/method --plugin <plugin>/xenthai
```

run from the Web repository root. A hand edit here is overwritten by the next export and carries no
authority: the playbook is normative for method (rubrics, levels, phases, store layout), and this
directory is its copy, not a second source.

## Source commit

`method.json`'s `source` field names the Web repository and the exact commit whose data this copy
carries:

```json
"source": { "repo": "Xenthai/Web", "commit": "<40-hex sha>", "committedAt": "<ISO 8601>" }
```

`test/method.test.mjs`'s drift check compares this copy against a fresh export when `METHOD_SOURCE`
points at one, so a stale vendor copy is caught rather than silently trusted.

## The rule

Every number cited in doctrine or in a skill — a weight, a threshold, a band, a level — comes from
this file or from `tables/`, never from a value re-typed by hand. A doctrine file that needs X3's
weights links to `tables/x3-criteria.md`; it does not restate the numbers.
