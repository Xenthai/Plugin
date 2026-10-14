# Architecture

Implements: fuera del playbook (X9)

## Rigor by blast radius

| Codebase | Minimum structure |
|---|---|
| Script, static site, one-off tool | Conventions only: naming, comments, English, no secrets |
| Small app with one external system | One port boundary: the external system behind an interface with one adapter; no package split |
| Anything holding money, auth, tenants or persistence | Full layering: domain, application, adapters, contracts; ports in the core; framework code only at the edge |

Always the architecturally right way after research, regardless of effort. A shortcut is
compounding debt. Recommend one design firmly and name the strongest alternative.

## Layering

1. Framework-free core. The test for core membership: does it import the framework? If not, it
   belongs in core. "It matches an existing placement" is never a defense.
2. Every data-shape type of the backend goes to core, exported or not. UI-local hook results, timing
   constants and DI tokens stay in the app.
3. Ports live in core with a DI token; adapters live in the app. Modules export the token, not the class.
4. One gateway port per capability; the adapter picks the endpoint variant through a discriminated
   union. Never duplicate gateways.
5. A new provider costs one adapter plus one binding line. Port → registry dispatching by kind →
   per-kind adapters. Controllers, SDKs and UI stay untouched.
6. Model production behaviour in a port, never a dormant "intended" use case.
7. Provider schemas and wire types belong to the adapter, never core. Core stays provider-agnostic.
8. Wrap every external system in an anti-corruption layer: never coerce an unverified vendor state
   into a domain enum; leave it raw or null; store the vendor token verbatim; map reason codes to a
   canonical internal enum, never to a third party's numbering.
9. Drive behaviour from a capability map, never a name check. Classify by measured signals, not names.
10. Gate on the provider's authoritative status field, never a convenience boolean or the HTTP code.
    Why: HTTP 200 with a rejected status fails in the dangerous direction.
11. Trust only immutable identifiers from external parties.
12. An integration choice is final only after it is checked against every downstream consumer.
13. Decompose god services into use cases, policies and factories with verbatim moves and
    byte-identical proofs. Extract stateless functions that take repositories as arguments; never add
    constructor dependencies, or auto-mocked test beds will silently mock the moved logic away.
14. Decompose god modules into a thin facade plus submodules; one module registers entities; no
    forward references; exports pruned to a minimal contract.
15. No domain logic on persistence entities. Predicates, label maps and formatters go to core.
16. One source-of-truth seam per helper. Once a helper exists it is never re-spelled.
17. Write paths go through one chokepoint; never a per-flow bump.
18. Persistence primitives are pure write seams with no authorization inside; authz is a policy layer.
19. Fold logic, not call sites: keep the public API, re-implement the internals.
20. The existing implementation is the source of truth over a user story. Match the sibling feature.
21. Domain rules shared by several surfaces live once, in the domain package.
22. One truth per fact. A second column that restates a first is a second truth.
23. Shared diagnostic and infrastructure utilities get provider-agnostic names and parameters;
    the test is swapping one provider for another without touching the file.

## Vocabulary and types

1. Vocabulary is an `as const` object with a derived union type. Every branching or constructing site
   uses the named member, even when the compiler checks the literal. Why: one greppable source of truth.
2. Make illegal states unrepresentable instead of policing them at runtime.
3. One polymorphic entity with a discriminator beats a forked aggregate.
4. Activate dormant entities before inventing new ones.
5. Value objects are the boundary source of truth: strict helpers that throw on the server,
   defensive helpers that degrade on the client.

## Invariants for critical state

Applies to money, balances, quotas, ledgers, audit, and any state a client or regulator relies on.

1. One authoritative system per fact. Derived ledgers are append-only, written only after external
   confirmation, never read as a gate, never synced from outside. Why: a sync-and-heal design
   oscillated in production.
2. UI-only flags never drive backend logic. Every write path takes an explicit id, no default fallback.
3. Store a durable receipt before processing: raw body and its hash, filed once per owner, replayable
   from storage; receipts survive migrations.
4. Cut scope at the door: process and store only entries whose own secret verified; confine replay
   to one tenant.
5. Idempotency by a UNIQUE key plus a deterministic, versioned, structured identity value; never a
   random id, never a hash alone. Anchor it to immutable external references, never user-scoped or
   mutable values.
6. Never assume a third party is idempotent or that its identifier is globally unique. Verify the
   uniqueness scope; dedupe on your side.
7. Persist your own row before any outward money-moving call and use its id as the provider key.
   An ambiguous outcome is an unknown-outcome error; an orphan sweep resolves it with an atomic
   compare-and-swap. An inconclusive lookup is never proof of absence.
8. Claim the dedupe key in the same batch as the state change; order by the event's own timestamp.
9. Lock before the decision the lock protects: lock sorted ids, then count. Re-lock and re-query at
   apply time; never trust a snapshot from a modal.
10. Fail closed when external evidence is missing. Indeterminate never becomes settled or mismatched.
    Never act on inference.
11. Status never contradicts the ledger. A status flip is label-only; money moves as a separate
    reversal or adjustment. Manual transitions are an allowlist that is a strict subset of the state
    machine; no any-to-any edges.
12. Bad historical critical data goes to reconciliation by people, never a programmatic rewrite.
13. Decide whether an operation happened by comparing before and after, never by mirroring the
    state machine. Never report false success; never write a forged audit row.
14. Double-spend and sign guards live in a database CHECK, not an application read.
15. Exact quantities follow the profile knob; the default is integer minor units end to end with a
    decimal-integer string on the wire and a guard that blocks casts. Rounding mode is explicit per
    site, never switched globally.
16. One column carries one meaning. Secondary identifiers are searchable, never stored into a
    correlation axis.

## Authorization

1. Authorization is permission plus scope. Never branch per role; never name a function after a
   role. Effective reach is the minimum of the permission tier and the grant tier. Applies to test
   fixtures: one parameterized factory with role and scope as data.
2. Permissions are flat and app-agnostic, grouped by resource; scope lives on the grant.
3. Fail-closed allowlists, never denylists. A new privileged capability is granted to no one until
   classified.
4. Two planes, never collapsed: coarse section affordance shipped to the client, and row-level
   authority on the server. Function-level access and data-level access are separate checks.
5. The server-computed ability drives navigation and route guards through one shared predicate.
   Never gate on a role name or a memberships scan.
6. A class-level manage floor with method-level read overrides; a handler without an explicit
   read stays at manage.
7. Privilege-floor, escalation and tenancy checks are built on system-wide predicates, never
   tier-invariant ones.
8. Return not-found for both missing and foreign resources. No existence oracle. Duplicate checks run
   after authz; gates run inside the write transaction.
9. Dual control on privileged and money actions: proposer and approver can never be the same seat.
   Dormant capabilities ship granted to no role.
10. Read gates and act gates are distinct.
11. Disclosure of unmasked personal data needs a second factor and an audit row written before disclosure.
12. Tests use real role permissions, never cherry-picked ones. Run a role-by-scope matrix before
    designing a binding gate.
13. The permission engine sits behind a policy-decision port; richer models arrive as additive adapters
    only when a use case exists.

## Tenancy

1. Resolve the principal once (session, person, business, memberships in one batch) and bind the
   tenant once; everything downstream receives it.
2. Every statement is tenant-scoped by construction: all SQL in one directory, a guard test scans it,
   cross-tenant reads are declared global explicitly.
3. Fence by the canonical owner column, never a nullable incidental link. Verify against the write path.
4. Write paths assert resource-in-tenant before persisting.
5. Every new repository method gets an isolation test that fails when the tenant key is dropped.
6. The server is authoritative; client filters only narrow a view.
7. Every grantable module owns a permission and a navigation entry, guard-tested. A module a tenant
   lacks is absent from the app and not-found in the API through one gate; clients read the
   entitlement defensively during deploy skew.
8. Legal duties that arise from how a tenant uses the product are recorded as the tenant's, not as
   product risk.
9. Identity is channel plus handle, one record per person across channels.

## Surfaces

1. Parity: whatever the panel does, the API and the agent surface do, audited alike.
2. Budgets are walls: capped listings, overflow to a router, snapshots byte-identical unless a decision
   says otherwise, bytes reclaimed when needed.
3. One gateway, per-capability toolkits, per-verb namespaces; existing toolkits stay byte-identical.
4. Destructive and AI-originated writes go through preview then confirm, or approvals; never default-allow.
   Approvals pin a sealed digest of the target state and detect staleness.
5. Tool and API responses stay compact; automatic hooks never add data to a response.
6. Rate-limit per principal; throttle per coarse origin with lockout; never compare a key while locked.

## Events, jobs and errors

1. Webhooks: verify the signature, persist for idempotency, acknowledge, never expose business errors.
2. Persist derived state at ingest; never compute cross-partition joins on list reads.
3. Verification verdicts live in a sidecar table; the main table is never written for them.
4. Critical state never depends on webhook delivery: pull-based reconciliation and detectors, each with
   a detector-dark alarm. Add a poller whenever the provider does not retry.
5. Async workers are bulkheaded into their own process and pool, separate from ingress.
6. Every pause code has a lift policy: retry non-structural errors with backoff, surface a code to the
   operator, advance the item's refresh time on per-item failure. Why: two jobs were dead with no signal.
7. When the runtime rebuilds errors, carry the code inside the message, never in the class.
8. Real-time fan-out publishes from write paths without blocking them; polling only as fallback;
   events carry ids, consumers read the store.
9. Coded error contract: a stable code, flat primitive params, message derived from the code, one
   factory that also emits the log line. Codes are append-only and never renamed. Per-site variance
   goes into params and templates, never new codes. Refusals map to stable HTTP statuses.
10. Audit every write with actor kind and the person when proven; declare personless actors explicitly.

## Secrets and credentials

1. Seal tokens per row; derive keys with a key id per row so rotation does not forget erasures.
2. A key value is never displayed; copy works masked through an audited reveal.
3. Sessions are keyed HMAC hashes so rotation ends all sessions; the edge holds no secrets.
4. One billing and one credential surface per capability; new capabilities are a port with one adapter
   and zero new provider secrets.
5. Server-driven OAuth code flow: nonce state bound to flow and business; no token in the browser.
6. Outbound files through signed, short-lived, read-only URLs.
7. Exposure-off settings declared in config, not only in a dashboard; admin paths behind a host door;
   frame denial as headers.
8. Erasure writes suppression records so pollers cannot re-insert; purge objects before rows.
9. Self-host documents you must relay; keep your own write-once archive when the retention duty is yours.

## Before you finish

- Structure matches the blast radius; nothing lighter on money, auth, tenants or persistence.
- Core imports no framework; providers sit behind ports; vocabulary is named.
- Critical state: receipt first, deterministic idempotency, lock before decision, fail closed.
- Authz is permission plus scope with no per-role branch; tenancy bound once and tested per method.
- Destructive writes go through preview and confirm; errors are coded; secrets sealed and never shown.
