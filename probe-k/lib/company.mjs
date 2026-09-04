import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";

/**
 * Filename of the per-engagement manifest. It lives in the working directory tree, never in the
 * user's home: a home-level default is the ambient-authority pattern that makes operators act on
 * the wrong target in every multi-context CLI.
 */
export const MANIFEST = ".company.json";

/** Manifest shape this build understands. A higher number refuses rather than guesses. */
export const SCHEMA = 1;

const REQUIRED = ["schema_version", "id", "name", "store"];

/**
 * Walks up from `from` looking for the manifest, the way git finds its root. Returns the absolute
 * path or null. Never falls back to a global location.
 */
export const findManifest = (from = process.cwd()) => {
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

  return { ok: true, company: data, path, root: dirname(path) };
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
