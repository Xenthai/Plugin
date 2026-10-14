# Structure and naming

Implements: fuera del playbook (X9)

Detect the repo's convention first (PROFILE.md). These rules apply when the repo has none, and
judge the repo's own when asked.

## Repository layout

1. A codebase with more than one deployable is a monorepo: `apps/*` for deployables, `packages/*`
   for shared code, `mcps/*` for agent servers when present. Root holds the toolchain only.
2. Dependency direction is apps → packages. A shared package never imports an app.
3. With full layering: `domain` (types, ports, invariants), `application` (use cases, policies),
   `contracts` (wire shapes shared by an API and its clients), `ui` (primitives), each with its own
   config and boundary tag. Within a core, provider folders depend on domain folders, never reversed.
4. No `shared/` folder inside a shared package. New code goes at the package's top level under its
   domain. `shared/` exists only for genuinely transversal utilities.
5. Legacy stays untouched; a new version lives in a new folder or repo.
6. Scripts in `scripts/`; throwaway scripts in a gitignored `.dev/`; quality tooling in
   `scripts/quality/`; agent hooks beside existing hooks. Never invent a directory; match siblings.
7. Docs: the repo's system, else `docs/plans/{active,done}/YYYY.MM.DD-<slug>/`. Provider docs in
   `docs/providers/<provider>/` as one living reference plus a knowledge-gaps registry.
8. Captured evidence (real payloads, findings) lives in-repo beside the adapter it proves.

## Files

1. One kind of artifact per file: constants, schema with its inferred type co-located, pure types,
   one helper per file, a barrel. Never over-split a schema from its inferred type; never merge
   unrelated artifacts to save a file.
2. Kebab-case names with a role suffix: `.service`, `.controller`, `.module`, `.dto`, `.entity`,
   `.guard`, `.port`, `.adapter`, `.use-case`, `.vo`, `.schema`, `.types`, `.constants`, `.util`,
   `.harness`, `.test`/`.spec`, `.e2e.test`.
3. Drop redundant prefixes inside a dedicated folder (`errors/codes.ts`, not `errors/error-codes.ts`).
4. Split by concern, never by position or number.
5. Never two modules whose names differ only by case; case-insensitive filesystems resolve wrongly.
6. URL segments and page slugs are English. Localized copy lives only in dictionaries.
7. Generated artifacts come from a generator plus a drift test; edit the generator, never the output.
8. One prefix per credential or identifier type, so a value's kind is readable at a glance.
9. Stable `data-*` hooks on controls for tests and live checks.

## Imports and exports

1. Barrels are a module's public surface. A barrel never re-exports something that re-enters it;
   a barrel never exports the framework module its consumers compose.
2. No re-export shims or aliases for moved symbols. One name, one home, one import path; rewrite
   every consumer, however many.
3. Shared packages use relative imports internally; consumers that transpile them cannot resolve
   aliases. Apps may alias.
4. A workspace package declares `exports` for every subpath it serves; a new subpath updates the
   build entry, `exports` and legacy type resolution together.
5. Before removing an export, grep its consumers. When widening a shared union, update every
   exhaustive map and switch across packages and typecheck each.
6. Injected dependencies are value imports, never type-only imports.

## Placement of tests, docs and data

1. Tests follow the repo: beside the code in `__tests__/`, or in `<pkg>/test/` with `fixtures/`,
   `__snapshots__/` and `test-e2e/`. Shared harnesses are `*.harness.ts`.
2. A test reads only its own package's files and its declared dependencies'. A guard of another
   package's file lives in that package's suite.
3. Spec files are capped (around 1000 lines); split into a harness plus concern files with exact
   test-count parity.
4. Fixtures are synthetic. No personal data in fixtures, captures, or vendor sandboxes.
5. Migrations are sequential, timestamp- or number-prefixed, immutable once applied; seeds are
   idempotent inserts.
6. i18n: one dictionary per locale per namespace, split per section; typed literals; both locales
   edited together; guard tests for orphan keys and for every id resolving in both locales.
7. UI packages never read an app's message tree; they take text as props.
8. Hooks that need a per-app singleton receive it by injection.

## Environment and naming of resources

1. Resource names: `<org>-<env>-<purpose>` with full environment words (`production`, not `prod`),
   applied to new resources only; never rename live ones for cosmetics.
2. `APP_ENV` says which environment; `NODE_ENV=production` on every deployed environment.
3. Env files per environment plus `.env.example` as the source of truth; test env generated from it.
4. Env vars only for real per-environment operational levers; judgment thresholds are constants.
5. Full, unambiguous names everywhere; names match their env var.

## Before you finish

- New code sits under its domain at the package top level; no new `shared/` folder.
- Every file holds one kind of artifact and carries a role suffix; slugs are English.
- No shim left behind; every consumer rewritten; exports declared.
- Tests, docs, scripts and migrations placed where the repo's siblings are.
