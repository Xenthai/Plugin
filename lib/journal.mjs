import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany } from "./company.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Version of the plugin that wrote a row. A doctrine rule changes; the pieces produced under the old
 * rule must stay traceable, and `schema` only says how the row is shaped, not who shaped it.
 */
export const PLUGIN_VERSION = (() => {
  try {
    return JSON.parse(readFileSync(join(HERE, "..", ".claude-plugin", "plugin.json"), "utf8")).version ?? "unknown";
  } catch {
    return "unknown";
  }
})();

/** Shape version stamped on every row, so a later change never leaves old rows indistinguishable. */
export const ROW_SCHEMA = 1;

const DEFAULT_ZONE = "America/Mexico_City";

/**
 * The journal's event vocabulary, fixed so entries stay comparable across months.
 *
 * Only the first three are written by hooks; the rest are semantic and are recorded by whatever
 * step knows the meaning. They exist from day one on purpose: touch time, concurrency and
 * repetition can only be derived from events captured while they happened, and an operational
 * "before" cannot be reconstructed after the fact.
 */
export const EVENTS = {
  AI_ACTION: "ai_action",
  ERROR: "error",
  SESSION_END: "session_end",
  REVIEW_START: "review_start",
  REVIEW_END: "review_end",
  APPROVAL: "approval",
  ESCALATION: "escalation",
  LOOKUP: "lookup",
  BLOCKED: "blocked",
  DELIVERY: "delivery",
  PHASE_START: "phase_start",
  PHASE_END: "phase_end",
  BASELINE: "baseline",
  MIGRATION: "migration",
  HEALTH: "health",
  GUARD_ERROR: "guard_error",
};

const KNOWN_EVENTS = new Set(Object.values(EVENTS));

/**
 * Fields whose VALUES are references (a path, a store id) rather than content. Only these are
 * copied from a tool's input; everything else is reduced to a digest, so the journal stays
 * complete enough to be evidence without becoming a second copy of the client's data.
 */
const REFERENCE_FIELDS = ["file_path", "path", "notebook_path", "fileId", "parentId", "folderId", "url", "title", "role"];

/**
 * Fields that name a target but can carry a secret or a person, so they are digested. A shell
 * command is the important case: it is the one write path the company guard cannot see, so the
 * paths inside it are extracted separately for auditability.
 */
const DIGESTED_FIELDS = ["command", "emailAddress"];

const LOOKS_LIKE_PATH = /^(?:[A-Za-z]:)?[\\/]|^\.{1,2}[\\/]|^~[\\/]/;
const QUOTED = /"([^"]+)"|'([^']+)'/g;
const BARE_TOKEN = /(?:^|[\s=>|])((?:[A-Za-z]:)?[\\/][^\s"'<>|;&)]+|\.{1,2}[\\/][^\s"'<>|;&)]+|~[\\/][^\s"'<>|;&)]+)/g;

/**
 * Best-effort extraction of filesystem paths from a shell command: absolute (POSIX or Windows),
 * dot-relative, or home-relative. Not a shell parser — it misses paths built from variables. It
 * exists so a Bash write leaves a legible trace rather than only a digest, which is the agreed
 * compromise for the one write path the guard does not cover.
 *
 * Quoted segments are taken whole before bare tokens are scanned: Windows paths contain spaces, so
 * a whitespace-delimited token keeps only "C:\Archivos" of "C:\Archivos de proyecto\...", and the
 * quotes are the only boundary a shell reliably gives for such a path.
 */
export const pathsInCommand = (command) => {
  if (typeof command !== "string") return [];
  const found = new Set();
  let unquoted = command;
  for (const m of command.matchAll(QUOTED)) {
    const inner = m[1] ?? m[2];
    if (LOOKS_LIKE_PATH.test(inner)) found.add(inner.slice(0, 300));
    unquoted = unquoted.replace(m[0], " ");
  }
  for (const m of unquoted.matchAll(BARE_TOKEN)) found.add(m[1].slice(0, 300));
  return [...found].slice(0, 12);
};

const digest = (value) =>
  createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value) ?? "").digest("hex").slice(0, 16);

const localTime = (date, zone) => {
  const fmt = (z) => new Intl.DateTimeFormat("sv-SE", { timeZone: z, dateStyle: "short", timeStyle: "medium" }).format(date);
  try {
    return fmt(zone);
  } catch {
    return fmt(DEFAULT_ZONE);
  }
};

/**
 * Resolves where an entry belongs and in which zone it is stamped: the bound company's tree and
 * its declared time zone when there is one, otherwise the plugin's own data directory and the
 * default. Never drops an entry for lack of a company — a gap in the journal cannot be told apart
 * from an action that never happened.
 */
const location = (cwd) => {
  const ctx = readCompany(cwd ?? process.cwd());
  const zone = (ctx.ok && ctx.company.timezone) || DEFAULT_ZONE;
  const base = ctx.ok
    ? join(ctx.root, "journal", "execution")
    : join(process.env.CLAUDE_PLUGIN_DATA ?? process.cwd(), "journal", "execution");
  return { file: join(base, `${localTime(new Date(), zone).slice(0, 7)}.jsonl`), company: ctx.ok ? ctx.company.id : null, zone };
};

/**
 * Appends one row. The shape is fixed and versioned on purpose: a journal whose columns drift
 * cannot be compared across months, and that drift is what makes a before/after claim
 * indefensible.
 *
 * There is no hash chain. One would only detect local reordering, not tampering by whoever owns
 * the file, and it needs a lock across concurrent hook processes to be correct at all. The
 * durable anchor is the store's own revision history once the journal is uploaded there.
 */
export const record = (entry, event = {}) => {
  const now = new Date();
  const { file, company, zone } = location(event.cwd);
  mkdirSync(dirname(file), { recursive: true });
  const row = {
    schema: ROW_SCHEMA,
    plugin: PLUGIN_VERSION,
    ts: now.toISOString(),
    ts_local: localTime(now, zone),
    session: event.session_id ?? null,
    turn: event.prompt_id ?? null,
    company,
    actor: entry.actor ?? "ai",
    event: KNOWN_EVENTS.has(entry.event) ? entry.event : `unknown:${entry.event}`,
    tool: entry.tool ?? null,
    capability: entry.capability ?? null,
    target: entry.target ?? null,
    why: entry.why ?? null,
    result: entry.result ?? "ok",
    approval: entry.approval ?? null,
    bytes: entry.bytes ?? null,
    digest: entry.digest ?? null,
    detail: entry.detail ?? null,
  };
  appendFileSync(file, JSON.stringify(row) + "\n", "utf8");
  return file;
};

/**
 * Reduces a tool input to references plus a digest: the journal records WHAT was touched and
 * proves the payload with a digest, while the payload stays in the store that already holds it.
 */
export const reference = (input) => {
  if (!input || typeof input !== "object") return { target: null, digest: null, bytes: null };
  const refs = {};
  for (const f of REFERENCE_FIELDS) if (typeof input[f] === "string" && input[f]) refs[f] = input[f].slice(0, 300);
  for (const f of DIGESTED_FIELDS) if (typeof input[f] === "string" && input[f]) refs[f] = `sha256:${digest(input[f])}`;
  const paths = pathsInCommand(input.command);
  if (paths.length) refs.paths = paths;
  const body = input.content ?? input.textContent ?? input.new_string ?? null;
  return {
    target: Object.keys(refs).length ? refs : null,
    digest: `sha256:${digest(input)}`,
    bytes: typeof body === "string" ? Buffer.byteLength(body, "utf8") : null,
  };
};
