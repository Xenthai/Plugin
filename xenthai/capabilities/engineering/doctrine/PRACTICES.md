# Engineering practices

Implements: fuera del playbook (X9)

## Types

1. Strict mode everywhere. No `any` without a documented exception that names the reason.
2. Lint rules that must hold are errors; warnings never fail CI, so they enforce nothing.
   Type-aware rules for floating and misused promises are on.
3. Shared packages: no enums, namespaces, decorators or parameter properties; `as const` objects
   with derived unions and a type guard; `export type` for every type re-export.
4. Immutability by default: new instances from aggregates, `map`/`filter`/`reduce`, state updates
   by callback.
5. Named constants or accessors for every vocabulary value; a compiler-checked literal is not the bar.
6. Unreachable defensive branches are deleted, not hidden behind coverage pragmas.

## Validation at boundaries

1. Schema first. Schemas live in the core; request wrappers are bare derivations of them; zero inline
   schemas in apps; one validation stack per repo.
2. Request schemas are strict objects. Unknown keys are stripped at proxies and refused at parsers
   where ambiguity costs money.
3. Wire dates use an explicit string codec, never coerced; wire money uses a decimal-integer codec.
4. Client mappers coerce wire values defensively; a generic fetch only casts.
5. Environment is validated at boot and fails closed: unknown values rejected, default is production,
   secret loading fails outside development.

## Errors and logging

1. One structured line per event: English, module tag, condition, key=value pairs. No banners, no
   multi-line clusters. 4xx is warn, 5xx is error.
2. Error messages carry codes, never values. Never log request URLs, auth headers, keys or tokens.
3. Personal data stays out of logs through a field-name denylist; the secrets redactor and the
   personal-data redactor are separate; endpoints that return unmasked data skip body logging.
4. No `console` in application code; a structured logger only.
5. Masking happens at presentation, scope-driven and fail-closed; internal paths use unmasked data.
   Never unmask into an append-only log.
6. A fail-fast change makes dead catch blocks reachable; audit what each newly reachable branch does.

## Secrets

1. Never commit, paste, quote or log a secret, credential, connector URL or key. Delete mock secret
   files before any manual deploy.
2. Secret scanning runs in pre-commit; never bypass hooks.
3. Passwords go in client options, never in connection URLs.
4. No source maps and no version or preview URLs in production.
5. Redact captures with substring patterns, never anchored ones; grep for token shapes before committing.

## SQL and database

1. No `SELECT *` in production SQL. Parameterized always.
2. Cast the parameter, not the column, to keep indexes; cast the always-valid side. Resolve column
   names from metadata, never strings. Wrap returning updates and deletes in a CTE where the driver
   needs it.
3. Keys: composite tenant keys and composite foreign keys; partial unique indexes for "one live per
   X"; closed CHECK enums rebuilt by migration; stable content-hash ids for idempotent imports;
   set-null on removable parents.
4. Undefined where-values throw; a silently dropped filter widens scope.
5. Statement timeouts scoped per query; batched primary-key joins instead of N+1.
6. The ORM entity stays aligned with the database; drift is a latent fault.
7. Migrations are atomic cuts: migrate, switch code, drop old, with a reconciliation abort guard and
   a tested down path where the tool has one. Rollback is a backup plus the cut. Applied migrations
   are immutable and applied only through the tool.
8. Before a first customer exists, schema changes are clean replacements; name the emptied tables.
9. Trigger bodies and bulk parameters follow the engine's documented limits; a guard test enforces
   each limit once discovered.

## Testing

1. Each level proves one thing: mocked unit = shape; real database = raw SQL, cross-aggregate reads,
   concurrency; HTTP-level = validation and pipes; app-boot = module moves; browser = visual and
   client rendering. Pick the level that proves the claim.
2. Every raw-SQL primitive on critical state has a real-database test beside its mocked spec.
   Concurrency claims need a real concurrency test.
3. New tests fail on the old source; the count is recorded with a control case.
4. One adapter contract suite runs against every adapter.
5. Snapshots are ratchets: listings, instructions, icons, contrast, budgets, audit attribution.
6. A run fails when the runtime printed an uncaught exception, whatever the tests said.
7. Suites pass with no cloud login and no network, as CI has.
8. Mutating end-to-end specs own their fixture rows; order dependence is proven in both orders.
9. Assert full sentences, not prefixes, for copy and tool text.
10. Coverage floors live in one source-of-truth file: a global floor, higher on money and authz,
    full on bootstrap. The parser is validated against real reports.
11. Mutation-check branches; literal expected values in contract tests; schema-derived structural
    assertions over per-field ones.
12. Pure logic (animation math, formatting, parsing) is extracted and unit-tested; layout is verified
    with computed styles and bounding boxes.
13. Test isolation is fail-closed: the database name and host are checked; a row-leak guard runs per
    file; suites leave the database as found.
14. Budgets are tests: page JavaScript, request counts, transfer size, debt rows. Raised only by
    measurement plus a recorded decision.
15. Label every test real or simulated; never call a partial integration complete.

## Dependencies and versions

1. Zero new dependencies when the scope is set; one abstraction per capability.
2. Official SDK first, verified against the live system, adopted piece by piece, rejected on drift.
3. Versions are verified against the registry and the lockfile, never trusted from training data.
   Version source of truth is the package manager's catalog; nothing hand-pinned.
4. Minimum-release-age rules and their exclusion lists are load-bearing; read them before a bump.
5. Audit at high severity is a gate. A full install over a filtered add; confirm the lockfile moved.
6. Prefer a native vendor capability over a fallback. Use the stack's chosen tool; never propose the
   displaced one.

## API

1. Path versioning that can host two versions side by side; never header-only.
2. OpenAPI generated from schemas and freshness-checked in CI.
3. Static segments are never placed beside a path parameter; read-only diagnostics use GET.
4. Webhook acknowledgements are fast, deduplicated and never leak business errors.

## Performance

1. Measure first: server timing with per-trip counts, before and after in a real browser.
2. Batch and parallelize loaders before infrastructure experiments. Read the docs before inventing probes.
3. No render-blocking third parties: self-host fonts, defer tag managers until interaction.
4. Cache hits are not freshness; a fresh run is forced when proof is needed.

## UI, accessibility and i18n

1. Every user-visible string goes through dictionaries in every locale; no hardcoded copy, including
   component defaults.
2. No page scrolls sideways from 320 to 1440 px; tap targets at least 44 px at 320; contrast at
   least 4.5:1 in both themes; busy states keep their label.
3. Design-system primitives, never raw elements; a missing primitive is asked for, not improvised.
4. Toasts for ephemeral feedback, never alert boxes. Never duplicate what the layout already renders.
5. No fake charts or placeholder data; a deferred graph is an empty slot or a dash.
6. View modals reconstructible from ids may be URL-backed; action modals never are.
7. Destructive or money actions: type-to-confirm plus a second factor; a shortcut opens the form,
   never submits it.
8. Brand assets are SVG with a title; the wrapper owns the accessible name.
9. Style once at the parent, never repeated inside a loop. Memoize component references passed to
   providers.
10. Reading order beats a pinned action; the primary action dominates; fewest taps; glanceable.

## Comments and hygiene

1. A comment is a JSDoc block on a declaration or class method that says what the declaration does
   not, in English, or it does not exist. No line comments, no trailing comments, no comments on
   interface members or object-literal entries, none in dictionaries, none in thin wrappers.
   Comments are read by models far more than by people, so a non-informative one is a permanent tax.
2. No review tokens, audit letters or ticket ids in code, test titles or assertion messages. Cite a
   decision id where a reference is needed.
3. Temporary diagnostic code carries a unique grep marker on every line and a cleanup step in the
   definition of done. The reusable utility itself carries no marker.
4. Fix on touch; never propose a sweep. Budget for legacy violations early.
5. A linter that cries wolf is worse than none: exclude what it cannot analyse and give it to a tool that can.
6. Merge a log cluster into one line; merge a decorator with its constants; keep a schema with its type.

## Before you finish

- No `any`, no `SELECT *`, no secret, no `console`, no line comment in any touched file.
- Boundary input validated by a schema in the core; errors coded; logs one line each.
- The test level proves the claim; new tests failed on the old source; budgets untouched or decided.
- Versions verified; no new dependency outside scope; the repo's tool used, not the displaced one.
- Strings in dictionaries; layout and tap targets within limits; assets SVG.
