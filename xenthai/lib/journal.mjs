import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { readCompany, kindOf } from "./company.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Version of the plugin that wrote a row. A doctrine rule changes; the pieces produced under the old
 * rule must stay traceable, and `schema` only says how the row is shaped, not who shaped it.
 *
 * Read from the directory the CLI copied this plugin into, not from a manifest, because that
 * directory name IS the version the CLI resolved: an install lives at
 * `<store>/cache/<marketplace>/<plugin>/<version>`. Neither manifest declares a `version` any more,
 * on purpose — a declared version pins the plugin, so users receive an update only when that string
 * changes, and every fix merged between two bumps is unreachable. With it absent the CLI resolves
 * the version to the commit SHA, so every push reaches a client.
 *
 * The gain is not only that updates flow. A row saying `plugin: 0.1.0` never identified a tree,
 * because a fresh install copies the clone at HEAD whatever the manifest says — two machines could
 * both write 0.1.0 and hold different code. A row saying `plugin: 9808112abcd` identifies exactly
 * one commit, which is what the traceability claim always needed.
 *
 * Running from a working copy rather than an install, the leaf is the repository's own folder name
 * and no version exists to report, so it says `dev` — and a `dev` row is honest about being
 * unreleasable rather than borrowing a number it does not have.
 */
export const PLUGIN_VERSION = (() => {
  const leaf = basename(join(HERE, ".."));
  if (/^\d+\.\d+\.\d+/.test(leaf) || /^[0-9a-f]{7,40}$/i.test(leaf)) return leaf;
  return "dev";
})();

/**
 * Ceiling for one journal row. Chosen below the POSIX atomic-write threshold so a row written by
 * one hook cannot interleave with a row written by another running in parallel on the same event.
 */
export const MAX_ROW_BYTES = 3072;

/**
 * Shape version stamped on every row, so a later change never leaves old rows indistinguishable.
 *
 * 2 adds `store_kind`. A schema-1 row carries no kind at all, which is precisely why the number had
 * to move rather than the field being slipped in as nullable: a row without the field is a row
 * written before the distinction existed, and a reader must be able to tell that from a row whose
 * store had no kind. Every schema-1 row in a client's store was written under a build that could
 * only bind to a client, so it can be read as `client` — and that inference is safe only because
 * the version says which rows it applies to.
 *
 * 3 adds `target.action` on a Bash row: the program, script basename and first flag of each command
 * segment, built from the shell's own vocabulary and never from an argument's value (see
 * `commandAction`). Before it, every run of the plugin's own CLIs left a row with a digest and no
 * legible word — the documented invocation goes through `${CLAUDE_PLUGIN_ROOT}`, which the path
 * extractor did not read, so a month of `report.mjs` runs matched nothing. A schema-2 Bash row
 * without `action` is read as "action unknown", not as a command that had no program: the field was
 * not being derived yet, and a reader must not conclude the command was empty. The version, again,
 * is what says which rows that reading applies to.
 */
export const ROW_SCHEMA = 3;

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
 *
 * `action` is here for the browser. A session driving a browser produces one row per call with a
 * null target — eighty-seven of them in one observed day — so the trail said a browser was used and
 * nothing about what it did, and the three calls that changed a client's mail filters were
 * indistinguishable from the eighty-four screenshots around them. `action` is a verb the tool
 * itself chose (`screenshot`, `left_click`, `type`), never text a person or a page supplied, so
 * copying it stays inside the rule this list exists to keep. What was typed is NOT copied: that is
 * the client's content, and the row's digest already proves it.
 *
 * `driveId`, `itemId` and `uri` are the Microsoft Graph vocabulary for what Drive calls `fileId`
 * and `parentId`: an item id is unique only within its drive, so a OneDrive target is the pair.
 */
const REFERENCE_FIELDS = ["file_path", "path", "notebook_path", "fileId", "parentId", "folderId", "driveId", "itemId", "uri", "url", "title", "role", "action"];

/**
 * Fields that name a target but can carry a secret or a person, so they are digested. A shell
 * command is the important case: it is the one write path the company guard cannot see, so the
 * paths inside it are extracted separately for auditability.
 */
const DIGESTED_FIELDS = ["command", "emailAddress"];

const SHELL_VAR = String.raw`(?:\$\{[A-Za-z_][A-Za-z0-9_]*\}|\$[A-Za-z_][A-Za-z0-9_]*)`;
const LOOKS_LIKE_PATH = new RegExp(String.raw`^(?:[A-Za-z]:)?[\\/]|^\.{1,2}[\\/]|^~[\\/]|^${SHELL_VAR}[\\/]`);
const QUOTED = /"((?:[^"\\]|\\.)+)"|'([^']+)'/g;
const BARE_TOKEN = new RegExp(
  String.raw`(?:^|[\s=>|])((?:[A-Za-z]:)?[\\/][^\s"'<>|;&)]+|\.{1,2}[\\/][^\s"'<>|;&)]+|~[\\/][^\s"'<>|;&)]+|${SHELL_VAR}[\\/][^\s"'<>|;&)]+)`,
  "g"
);

/**
 * Best-effort extraction of filesystem paths from a shell command: absolute (POSIX or Windows),
 * dot-relative, home-relative, or rooted at a shell variable. Not a shell parser — it misses paths
 * built any other way. It exists so a Bash write leaves a legible trace rather than only a digest,
 * which is the agreed compromise for the one write path the guard does not cover.
 *
 * Quoted segments are taken whole before bare tokens are scanned: Windows paths contain spaces, so
 * a whitespace-delimited token keeps only "C:\Archivos" of "C:\Archivos de proyecto\...", and the
 * quotes are the only boundary a shell reliably gives for such a path.
 *
 * A variable-rooted token is kept verbatim, variable name included, rather than cut to the part
 * after it. `${CLAUDE_PLUGIN_ROOT}/tools/journal-sync.mjs` is how every skill documents the
 * plugin's own CLIs, and it names a root the reader can resolve; cut to `/tools/journal-sync.mjs`
 * it would read as an absolute path at the filesystem root, which is a reference to a file that
 * does not exist. The name is the shell's, not the client's, so keeping it copies no content.
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
  const kept = [];
  let bytes = 0;
  for (const path of found) {
    bytes += Buffer.byteLength(path);
    if (kept.length === MAX_PATHS || bytes > MAX_PATH_BYTES) break;
    kept.push(path);
  }
  return kept;
};

/**
 * Ceilings on the path references one row may carry. Twelve paths of three hundred bytes each is
 * more than the atomic-append limit, and a row over that limit is replaced by a truncation marker
 * that loses every reference and the action with them — so a command that names many long paths
 * keeps the first ones legible rather than none.
 */
const MAX_PATHS = 12;
const MAX_PATH_BYTES = 1500;

const SCRIPT_NAME = /^[A-Za-z0-9._+-]+\.(?:mjs|cjs|js|sh|py|ps1)$/i;
const PROGRAM_NAME = /^[A-Za-z0-9._+-]+$/;
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const LONG_FLAG = /^--[A-Za-z][A-Za-z0-9-]*/;
const SHORT_FLAG = /^-[A-Za-z]{1,3}$/;
const ACTION_SEGMENTS = 4;
const ACTION_CHARS = 120;

const PLACEHOLDER = /^\0(\d+)\0$/;
const ESCAPED = /\\[\s\S]/g;
const COMMENT = /(?:^|\s)#[^\n]*/g;
const UNBALANCED = /["'][\s\S]*$/;

const lastPathPart = (token) => token.replace(/^["']|["']$/g, "").split(/[\\/]/).pop() ?? "";

const isFlag = (token) => token.startsWith("-") && token.length > 1;

/**
 * The legible part of one command segment: program, script, flag. Values never enter it — a flag
 * with `=` keeps its name only, and a short option keeps its letters only when it is nothing but
 * letters, because `-pSECRET` has the shape of `-la` and the row must not gamble on which it is.
 */
const segmentAction = (tokens, quoted) => {
  const words = tokens.filter((t) => !ASSIGNMENT.test(t));
  if (!words.length) return null;
  const program = lastPathPart(words[0].replace(PLACEHOLDER, (_, i) => quoted[Number(i)]));
  if (program === "cd" || !PROGRAM_NAME.test(program)) return null;
  const parts = [program];
  const scriptToken = words.slice(1).find((t, i, rest) => {
    if (i > 0 && isFlag(rest[i - 1])) return false;
    const m = PLACEHOLDER.exec(t);
    const inner = m ? quoted[Number(m[1])].slice(1, -1) : t;
    if (m && !LOOKS_LIKE_PATH.test(inner)) return false;
    return SCRIPT_NAME.test(lastPathPart(inner));
  });
  const script = scriptToken ? lastPathPart(PLACEHOLDER.test(scriptToken) ? quoted[Number(PLACEHOLDER.exec(scriptToken)[1])].slice(1, -1) : scriptToken) : null;
  if (script && script !== program) parts.push(script);
  const flag = words.slice(1).find(isFlag);
  if (flag) {
    const long = LONG_FLAG.exec(flag);
    parts.push(long ? long[0].slice(0, 32) : SHORT_FLAG.test(flag) ? flag : flag.slice(0, 2));
  }
  return parts.join(" ");
};

/**
 * What a Bash command DID, in the shell's own words and never the operator's or the client's: the
 * program, the script it ran and the first flag, per segment. This is Decision 20 applied to the
 * shell. The browser's `action` is a verb the tool chose, so copying it names the act without
 * copying the text; a command line has no such field, and the whole line is digested because it
 * can carry a secret or a person. The vocabulary is derived here instead, from the positions where
 * only a program, a script or an option can stand.
 *
 * Quoted strings are replaced by placeholders before anything is split, so a `;` or a newline
 * inside a value can never start a segment whose "program" is a fragment of that value, and a
 * quoted token resolves back only where a program is expected, or where a script is and the quoted
 * text is a path — a quoted value that merely ends in `.sh` is a value. Escaped characters, a
 * comment, and everything from an unbalanced quote onward are removed for the same reason: each is
 * a place where a value's fragment would otherwise stand where a program can. A heredoc and
 * everything after it are dropped: its body is a document, and a document's lines are not commands.
 * The token after a flag is that flag's value and is never read as the script. A subcommand
 * (`git push`) is not recorded, because a bare word after the program is where a value stands too.
 */
export const commandAction = (command) => {
  if (typeof command !== "string") return null;
  const quoted = [];
  const flat = command
    .replace(/\\\r?\n/g, " ")
    .replace(QUOTED, (m) => `\0${quoted.push(m) - 1}\0`)
    .replace(ESCAPED, "\u0001")
    .replace(UNBALANCED, "")
    .replace(COMMENT, " ")
    .replace(/<<[\s\S]*$/, "");
  const actions = [];
  for (const segment of flat.split(/&&|\|\|?|;|\r?\n/)) {
    const action = segmentAction(segment.trim().split(/\s+/).filter(Boolean), quoted);
    if (action) actions.push(action);
    if (actions.length === ACTION_SEGMENTS) break;
  }
  return actions.length ? actions.join("; ").slice(0, ACTION_CHARS) : null;
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
 * Where an unbound entry goes when the plugin's data directory is not in the environment.
 *
 * Never the working directory. Falling back to `cwd` meant that running `doctor` from anywhere —
 * a home directory, a client's Desktop, someone else's repository — created a `journal/execution/`
 * tree there, which is the ambient-authority pattern `company-new` refuses for manifests, committed
 * by the journal instead. It also scatters an engagement's unbound rows across whatever folders the
 * operator happened to be standing in, so no later session can find them.
 */
const fallbackBase = () =>
  process.env.CLAUDE_PLUGIN_DATA ?? join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"), "xenthai");

/**
 * Resolves where an entry belongs and in which zone it is stamped: the bound company's tree and
 * its declared time zone when there is one, otherwise one stable per-user directory and the
 * default. Never drops an entry for lack of a company — a gap in the journal cannot be told apart
 * from an action that never happened.
 */
const location = (cwd) => {
  const ctx = readCompany(cwd ?? process.cwd());
  const zone = (ctx.ok && ctx.company.timezone) || DEFAULT_ZONE;
  const base = ctx.ok ? join(ctx.root, "journal", "execution") : join(fallbackBase(), "journal", "execution");
  return {
    file: join(base, `${localTime(new Date(), zone).slice(0, 7)}.jsonl`),
    company: ctx.ok ? ctx.company.id : null,
    storeKind: ctx.ok ? kindOf(ctx.company) : null,
    zone,
  };
};

/**
 * Appends one row. The shape is fixed and versioned on purpose: a journal whose columns drift
 * cannot be compared across months, and that drift is what makes a before/after claim
 * indefensible.
 *
 * There is no hash chain, and the reason is a threat model rather than a cost. A chain is computed
 * by whoever writes the journal, so it detects nothing that party wants hidden; it would only prove
 * the file had not been reordered by someone with no write access, who is not the threat. It also
 * needs a lock across concurrent hook processes to be correct at all, since hooks matching one
 * event run in parallel.
 *
 * What makes a digest mean something is where it comes to rest. `tools/report.mjs` prints the SHA-256
 * of the exact bytes it read, and that report is written into the CLIENT's store, whose revision
 * history is kept by the storage provider and cannot be rewritten by this practice. From the moment
 * the client holds a report, that month's journal is pinned against a dated document nobody here
 * controls — which is the property a chain was reached for, obtained without one.
 */
export const record = (entry, event = {}) => {
  const now = new Date();
  const { file, company, storeKind, zone } = location(event.cwd);
  mkdirSync(dirname(file), { recursive: true });
  const row = {
    schema: ROW_SCHEMA,
    plugin: PLUGIN_VERSION,
    ts: now.toISOString(),
    ts_local: localTime(now, zone),
    session: event.session_id ?? null,
    turn: event.prompt_id ?? null,
    company,
    /**
     * Whose store this row belongs to: `client`, `personal`, or null when nothing was bound. An
     * audit of a client's journal must never have to take the plugin's word that every row in it
     * was client work, and before this field the only way to check was to go read the manifest.
     */
    store_kind: storeKind,
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
  /**
   * Hooks matching one event run in PARALLEL, so two of them can append to this file at the same
   * instant. `appendFileSync` opens with O_APPEND, under which a single write is atomic while it
   * stays small — so the size of a row is a correctness property, not a style preference. A row
   * that grew past the limit could interleave with another and corrupt both.
   *
   * Rows carry references and a digest, never content, so this ceiling is generous by construction.
   * A row that exceeds it means something copied a payload in, which is the real defect; the row is
   * truncated to a marker rather than risking the file, and the truncation itself is recorded.
   */
  let line = JSON.stringify(row);
  if (Buffer.byteLength(line) > MAX_ROW_BYTES) {
    line = JSON.stringify({
      ...row,
      target: null,
      detail: null,
      why: "row exceeded the atomic-append limit and was truncated; a payload was copied into it",
      truncated: Buffer.byteLength(line),
    });
  }
  appendFileSync(file, line + "\n", "utf8");
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
  const action = refs.action ? null : commandAction(input.command);
  if (action) refs.action = action;
  const body = input.content ?? input.textContent ?? input.new_string ?? null;
  return {
    target: Object.keys(refs).length ? refs : null,
    digest: `sha256:${digest(input)}`,
    bytes: typeof body === "string" ? Buffer.byteLength(body, "utf8") : null,
  };
};
