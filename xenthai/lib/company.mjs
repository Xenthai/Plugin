import { readFileSync, existsSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";

/**
 * Filename of the per-engagement manifest. It lives in the working directory tree, never in the
 * user's home: a home-level default is the ambient-authority pattern that makes operators act on
 * the wrong target in every multi-context CLI.
 */
export const MANIFEST = ".company.json";

/**
 * An explicit binding, which beats the walk-up.
 *
 * The walk-up alone made one rule impossible to keep. `company-new` says, correctly, that a
 * manifest never lives in a home directory — and in a cloud session the working directory IS the
 * container's home, so the only placement the guard could resolve was the one the doctrine forbids.
 * Measured both ways: with the manifest at the home directory a store write is permitted, and with
 * it one level below, where the doctrine asks for it, the same write is refused as unbound. A rule
 * the mechanism makes impossible to keep is a rule that gets ignored, and then it stops protecting
 * the durable machines where it was right.
 *
 * This is not a home-level default and does not become one: nothing is found here unless somebody
 * set the variable for this session, which is explicit authority rather than ambient. It names a
 * manifest file or the directory holding one.
 *
 * It never falls back. A variable that is set and resolves to nothing is an operator who believes
 * they are bound to a company, and silently binding them to whatever the cwd walks up to is how
 * one client's material lands in another's store — the one mistake in this system that is both
 * invisible and permanent.
 */
export const MANIFEST_ENV = "XENTHAI_COMPANY";

/**
 * Value of the manifest's optional `binding` field for a session whose disk does not survive it —
 * a cloud container, a throwaway VM. Declared rather than detected: a sniff for a container gets it
 * wrong in both directions, and the expensive direction is permitting the ambient-authority pattern
 * in silence on a machine that was durable all along.
 */
export const EPHEMERAL = "ephemeral";

/** Manifest shape this build understands. A higher number refuses rather than guesses. */
export const SCHEMA = 1;

/**
 * What the bound store IS. The kind never widens or narrows the veto — a store write is permitted
 * when a session is bound and refused when it is not, exactly as before. It exists because the
 * guard's words were wrong for half the stores it protects, and because the journal's traceability
 * claim needs the distinction.
 *
 * The plugin was written for client engagements and its only vocabulary was "company", so the
 * operator's OWN store — their finances, their documents, their life — could not be declared at
 * all. Two things followed, both observed on a real session. The guard refused every store write
 * for lack of a `.company.json`, which is the right behaviour reached for the wrong reason: the
 * store was legitimate and there was simply no client to bind to. And the only way through was to
 * write a manifest calling that store a company, which puts rows in the journal claiming client
 * actions for work no client commissioned. A traceability claim that cannot tell the operator's own
 * material from a client's is the one defect this plugin cannot afford, so the manifest says which.
 *
 * `client` is the default because it is the expensive direction to get wrong: a store whose kind
 * somebody forgot to declare is then treated, journaled and read as a client's.
 */
export const KINDS = new Set(["client", "personal"]);
export const DEFAULT_KIND = "client";

const REQUIRED = ["schema_version", "id", "name", "store"];

/**
 * The manifest named by the environment: `null` when the variable is not set, `{ ok: true, path }`
 * when it resolves, and `{ ok: false, value }` when it is set and resolves to nothing. The third
 * case is the one that matters — `readCompany` turns it into a refusal rather than walking up, for
 * the reason in MANIFEST_ENV.
 */
const declaredManifest = () => {
  const raw = process.env[MANIFEST_ENV];
  if (typeof raw !== "string" || !raw.trim()) return null;
  const value = resolve(raw.trim());
  let asDirectory = null;
  try {
    asDirectory = statSync(value).isDirectory();
  } catch {
    return { ok: false, value };
  }
  const path = asDirectory ? join(value, MANIFEST) : value;
  return existsSync(path) ? { ok: true, path } : { ok: false, value };
};

/**
 * Walks up from `from` looking for the manifest, the way git finds its root. Returns the absolute
 * path or null. Never falls back to a global location.
 */
export const findManifest = (from = process.cwd()) => {
  const declared = declaredManifest();
  if (declared) return declared.ok ? declared.path : null;
  let dir = resolve(from);
  for (;;) {
    const candidate = join(dir, MANIFEST);
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
};

/**
 * Reads and validates the manifest.
 *
 * Returns `{ ok: true, company, root }` when the session is bound to exactly one company, and
 * `{ ok: false, reason }` when it is not. An unbound session is a normal state — the plugin is
 * usable outside an engagement — so callers must treat `ok: false` as "no company context",
 * never as an error.
 */
export const readCompany = (from = process.cwd()) => {
  const declared = declaredManifest();
  if (declared && !declared.ok) {
    return { ok: false, reason: "declared-manifest-missing", path: declared.value };
  }
  const path = findManifest(from);
  if (!path) return { ok: false, reason: "no-manifest" };

  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    return { ok: false, reason: "unreadable-manifest", path, detail: err.message };
  }

  const missing = REQUIRED.filter((k) => data[k] === undefined);
  if (missing.length) return { ok: false, reason: "incomplete-manifest", path, missing };
  if (data.schema_version > SCHEMA) {
    return { ok: false, reason: "future-schema", path, found: data.schema_version };
  }
  /**
   * Refuses rather than defaults, for the same reason `future-schema` refuses. A kind this build
   * does not know is a manifest written against rules this build does not have, and quietly
   * reading it as a client's store is how somebody's own material ends up filed as an engagement.
   */
  const kind = kindOf(data);
  if (!KINDS.has(kind)) {
    return { ok: false, reason: "unknown-kind", path, found: kind, known: [...KINDS] };
  }

  return { ok: true, company: data, path, root: dirname(path), kind, binding: bindingOf(data, path, Boolean(declared)) };
};

/**
 * How this session came to be bound, and whether that binding survives the session.
 *
 * `atHome` is an exact comparison against the user's home directory rather than a guess about
 * containers, and it is the only thing that triggers the declaration requirement `doctor` enforces:
 * a manifest anywhere else is the ordinary case and needs no ceremony. `ephemeral` is what the
 * manifest itself says, because the machine cannot be asked reliably and a wrong answer here is
 * paid for in a client's lost audit trail.
 */
const bindingOf = (data, path, viaEnv) => {
  const root = dirname(path);
  let home = null;
  try {
    home = resolve(homedir());
  } catch {
    /* no home is a valid state on some runners; then nothing is "at home" */
  }
  return {
    via: viaEnv ? "env" : "tree",
    ephemeral: data.binding === EPHEMERAL,
    declared: typeof data.binding === "string" ? data.binding : null,
    atHome: home !== null && resolve(root) === home,
  };
};

/**
 * The declared kind, or the default. Never inferred from the name, the id or the folder: a client
 * whose brand is the word "personal" would be misread by any such guess, and the cost of that
 * misreading is a client's material filed as somebody's private business.
 */
export const kindOf = (company) => (typeof company?.kind === "string" ? company.kind.trim() : DEFAULT_KIND);

/** True when the bound store is the operator's own rather than a client's. */
export const isPersonal = (company) => kindOf(company) === "personal";

/**
 * How to name the bound store to a person. A client is named and nothing more; the operator's own
 * store says what it is, because "Vida personal is bound" reads like a client called that.
 */
export const storeLabel = (company) => {
  const name = typeof company?.name === "string" && company.name.trim() ? company.name : "(unnamed)";
  return isPersonal(company) ? `${name} — your own store, not a client` : name;
};

/**
 * Folder ids the bound company may be written to. Ids only — a folder NAME never proves identity,
 * and two companies can name a folder the same thing.
 */
export const allowedFolders = (company) => {
  const store = company?.store ?? {};
  return [store.root, ...(store.folders ?? [])].filter((x) => typeof x === "string" && x.length);
};

/**
 * True when `target` resolves inside `root`. Catches a local write that escapes the engagement
 * directory into a sibling company's tree.
 */
export const isInside = (root, target) => {
  const r = resolve(root);
  const p = resolve(target);
  return p === r || p.startsWith(r + sep);
};
