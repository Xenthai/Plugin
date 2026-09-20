import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { storeKindOf, DEFAULT_STORE_KIND } from "./company.mjs";

/**
 * The part of the emit command that does not move. A session runs the tool by absolute path, so a
 * hook's `if` is recognised by this substring and never by how the command line begins.
 */
export const EMIT_MARK = "journal-sync.mjs --emit";

/**
 * The one shape of `if` that matches the emit command however a session spells it: a wildcard
 * before the mark, because a session runs the tool by absolute path (DECISIONS.md #21f recorded
 * `Bash(node …` as never matching, and any other anchor fails the same way), and a wildcard after
 * it, because the file name follows. A hook that cannot fire is a control that is decoration.
 */
export const IF_PREFIX = "Bash(*";
export const IF_SUFFIX = "*)";

/** The Drive connector's create tool; a manifest's `store.tools.create` overrides it per provider. */
export const DEFAULT_CREATE_TOOL = "create_file";

const gitRoot = (from) => {
  let dir = from;
  for (;;) {
    if (existsSync(join(dir, ".git"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
};

/**
 * Where a session's hooks are read from, in the order they are looked at: the two files in the
 * session's own starting directory, the same two at the repository root when the session started
 * below it, and the user's settings. A settings file anywhere else — inside a company folder that
 * is not the starting directory — is never read by Claude Code, so it is never read here either:
 * reporting a hook as present from a file the session will not load is the exact silence this
 * module exists to remove.
 */
export const settingsFiles = (cwd = process.cwd()) => {
  const here = resolve(cwd);
  const files = [join(here, ".claude", "settings.local.json"), join(here, ".claude", "settings.json")];
  const git = gitRoot(here);
  if (git && git !== here) files.push(join(git, ".claude", "settings.local.json"), join(git, ".claude", "settings.json"));
  files.push(join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"), "settings.json"));
  return files;
};

const isTransportHook = (hook) =>
  hook && typeof hook === "object" && hook.type === "mcp_tool" && typeof hook.if === "string" && hook.if.includes(EMIT_MARK);

/**
 * A hook that mentions the emit command but is not shaped like a hook — `if` as an array, the
 * `PostToolUse` list written as an object — is one Claude Code will not run, and reading it as
 * absent would tell the operator to write a file that already exists.
 */
const mentionsEmit = (value) => {
  try {
    return JSON.stringify(value ?? null).includes(EMIT_MARK);
  } catch {
    return false;
  }
};

const hooksIn = (settings) => {
  const list = settings?.hooks?.PostToolUse;
  if (list !== undefined && !Array.isArray(list)) return { hooks: [], malformed: mentionsEmit(list) ? ["hooks.PostToolUse is not an array"] : [] };
  const hooks = [];
  const malformed = [];
  for (const group of list ?? []) {
    for (const hook of Array.isArray(group?.hooks) ? group.hooks : []) {
      if (isTransportHook(hook)) hooks.push({ hook, matcher: group?.matcher });
      else if (mentionsEmit(hook)) malformed.push("a hook names the emit command but its \"if\" is not a string");
    }
  }
  return { hooks, malformed };
};

/**
 * True when a group's matcher reaches the Bash tool. Claude Code reads it as a regular expression
 * over the tool name; absent or empty applies to every tool. A group scoped to `Edit` holds a hook
 * that will never see the emit command, however correct the hook itself is.
 */
const matchesBash = (matcher) => {
  if (matcher === undefined || matcher === null || matcher === "" || matcher === "*") return true;
  if (typeof matcher !== "string") return false;
  try {
    return new RegExp(matcher).test("Bash");
  } catch {
    return false;
  }
};

/**
 * What a CLI can prove about one transport hook, as tokens. Each is a way the hook was measured
 * failing while looking installed: a pattern that never matches, a file created from nothing or
 * without the newline the channel strips, a title that is not the file's name, a target that is
 * the store root when the journal lives one folder below it, and a create tool that is not this
 * provider's. Whether `parentId` IS this company's journal folder, and whether `server` is the
 * connector's real name, need credentials and are left to the session.
 *
 * The parameter names are Drive's, and only Drive's are known here. On any other provider the
 * manifest's `store.tools` carries the create tool's name, read from the connector's own schema by
 * `company-new`, and its parameter names are not fixed anywhere this module can read — so there the
 * check keeps what does not depend on a name: the pattern, the tool, and that SOME input value
 * carries the emitted bytes with the newline restored. Applying Drive's names to a OneDrive hook
 * would fail a correct one, which is the same silence this module exists to remove, pointed the
 * other way.
 */
export const defectsOf = (hook, company, matcher) => {
  const defects = [];
  const input = hook.input && typeof hook.input === "object" ? hook.input : {};
  const at = hook.if.indexOf(EMIT_MARK);
  if (hook.if.slice(0, at) !== IF_PREFIX) defects.push("pattern-anchored");
  if (!hook.if.slice(at + EMIT_MARK.length).endsWith(IF_SUFFIX)) defects.push("pattern-truncated");
  if (!matchesBash(matcher)) defects.push("matcher-not-bash");
  const drive = storeKindOf(company) === DEFAULT_STORE_KIND;
  const declared = company?.store?.tools?.create;
  const values = Object.values(input).filter((v) => typeof v === "string");
  const text = drive ? (typeof input.textContent === "string" ? input.textContent : "") : values.find((v) => v.includes("${tool_response.stdout}")) ?? "";
  if (!text.includes("${tool_response.stdout}")) defects.push("no-stdout");
  if (!text.endsWith("\n")) defects.push("no-newline");
  if (drive) {
    if (input.title !== "${tool_input.description}") defects.push("title-not-description");
    const parent = input.parentId;
    if (typeof parent !== "string" || !parent.trim()) defects.push("no-parent");
    else if (parent === company?.store?.root) defects.push("parent-is-root");
  }
  if (!drive && typeof declared !== "string") defects.push("tools-undeclared");
  else if (hook.tool !== (declared ?? DEFAULT_CREATE_TOOL)) defects.push("wrong-tool");
  return defects;
};

/**
 * Every transport hook the session will load, each with the file it came from and its defects,
 * plus the settings files that exist and do not parse, and the ones that parse but hold a hook
 * shaped so that Claude Code will not run it. An absent file is the ordinary state and is not
 * reported; each of the other two is, because a hook written into such a file is one the session
 * will never run.
 */
export const findTransportHooks = (cwd, company) => {
  const found = [];
  const unreadable = [];
  const malformed = [];
  for (const path of settingsFiles(cwd)) {
    if (!existsSync(path)) continue;
    let settings;
    try {
      settings = JSON.parse(readFileSync(path, "utf8"));
    } catch (err) {
      unreadable.push({ path, detail: String(err && err.message).split("\n")[0] });
      continue;
    }
    const read = hooksIn(settings);
    for (const { hook, matcher } of read.hooks) found.push({ path, hook, defects: defectsOf(hook, company, matcher) });
    for (const detail of read.malformed) malformed.push({ path, detail });
  }
  return { found, unreadable, malformed };
};
