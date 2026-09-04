import { existsSync } from "node:fs";
import { mkdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readCompany } from "../lib/company.mjs";

/**
 * The render engine's one dependency, and the only file whose absence is worth acting on. Checking
 * for the package's own manifest rather than its directory is deliberate: an interrupted install
 * leaves the directory behind empty, and a directory that exists but holds nothing is the shape of
 * failure most likely to be mistaken for success.
 */
const ENGINE_PROBE = join("node_modules", "playwright-core", "package.json");

/**
 * A lock keyed by the plugin root, kept in the system temp directory rather than inside the plugin,
 * so a half-finished install never leaves a stray file in the tree the operator reads. Four
 * sessions opening at once must not run four `npm install` calls against one directory — npm is not
 * safe to run concurrently on the same prefix, and the failure mode is a half-written package the
 * next session reports as present.
 */
const lockPath = (root) => join(tmpdir(), `xenthai-engine-${createHash("sha256").update(root).digest("hex").slice(0, 16)}.lock`);

/**
 * Stale after two minutes. The install itself takes about two seconds, so anything still holding
 * the lock after that long is a process that died without releasing it, and waiting on a dead
 * process is worse than racing a live one.
 */
const STALE_MS = 120_000;

/**
 * Installs the render engine's dependency when the plugin's own copy is missing it.
 *
 * This exists because the assumption written into `package.json` — that Claude Code installs a
 * plugin's dependencies when it copies the plugin into its cache — is false. It does not, in any
 * version tested. `node_modules` is gitignored, correctly, so the marketplace clone carries no
 * dependency either, and `capabilities/social/engine/render.mjs` imports `playwright-core` at its
 * top level. The result on a fresh install is that every render fails on an import error, with a
 * stack trace that names a module rather than the missing step, on the first client machine where
 * anybody tries to produce a piece. `tools/doctor.mjs` already detects it and says what to run; the
 * gap was that nothing ever ran it.
 *
 * SessionStart is the right place and the only cheap one: it fires once per session, its 60s budget
 * is an order of magnitude more than the install needs, and the operator sees the status message
 * this hook already declares. The check is a single `existsSync` on every session after the first,
 * so the steady-state cost is one stat call.
 *
 * Returns a line for the session when something happened or should have and did not, and null when
 * the engine was already in place — the session is told about work, not about its absence.
 */
const ensureEngine = (root) => {
  if (!root || !existsSync(join(root, "package.json"))) return null;
  if (existsSync(join(root, ENGINE_PROBE))) return null;

  const lock = lockPath(root);
  try {
    const age = Date.now() - statSync(lock).mtimeMs;
    if (age < STALE_MS) return "The render engine is being installed by another session that started at the same time; if a render fails in the next minute, retry it.";
    rmSync(lock, { recursive: true, force: true });
  } catch {
    /* No lock, which is the ordinary case. */
  }

  /**
   * `mkdir` is the acquisition, because it is the only filesystem operation that both tests and
   * takes in one step. A read followed by a write loses the race it was written to prevent.
   */
  try {
    mkdirSync(lock);
  } catch {
    return "The render engine is being installed by another session; if a render fails in the next minute, retry it.";
  }

  try {
    /**
     * `--ignore-scripts` is not an optimisation. playwright-core declares no lifecycle script, but
     * the flag is what guarantees that installing it can never execute code from the registry on a
     * client's machine, and that guarantee is the reason this is allowed to run unattended at all.
     *
     * On Windows npm is `npm.cmd`, a batch wrapper, and Node has refused to spawn `.cmd` and `.bat`
     * files without a shell since the fix for CVE-2024-27980 — `execFileSync` throws EINVAL before
     * npm is ever reached. A shell is therefore required there and nowhere else. It is safe here
     * only because every element of this command is a literal: nothing derived from a company's
     * files, a manifest, or the conversation reaches the command line. `cwd` carries the one value
     * that varies, and an option is not parsed by the shell.
     */
    const onWindows = process.platform === "win32";
    execFileSync(onWindows ? "npm.cmd" : "npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
      cwd: root,
      timeout: 45_000,
      stdio: "ignore",
      windowsHide: true,
      shell: onWindows,
    });
  } catch (err) {
    return (
      "The render engine's dependency could not be installed, so social-produce will fail until it is: " +
      `run "npm install --ignore-scripts" in ${root}. (${String(err && err.message).slice(0, 120)})`
    );
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }

  return existsSync(join(root, ENGINE_PROBE))
    ? "The render engine's dependency was missing on this install and has been installed."
    : `The render engine's dependency is still missing after an install that reported success; run tools/doctor.mjs. Expected ${ENGINE_PROBE} under ${root}.`;
};

/**
 * Announces, at session start, the two facts every skill depends on: which company the session is
 * bound to, and where the plugin lives on disk.
 *
 * The company name is announced twice on purpose, because the two surfaces catch different
 * mistakes. `additionalContext` tells the session itself which company it is bound to, so the
 * first reply can state it. `sessionTitle` puts that name in the tab, the session list and the
 * resume picker, where it stays visible after the announcement has scrolled away — an operator
 * holding four client engagements open at once reads the binding off the list instead of
 * reconstructing it. Writing one company's material into another company's store is the worst
 * thing this plugin can do, and it happens by looking at the wrong window.
 *
 * No title is set when nothing is bound. A generic title is worse than the one the session would
 * have named itself, and the absence of a client name is itself the signal that nothing is bound.
 *
 * The plugin root is announced because `${CLAUDE_PLUGIN_ROOT}` is documented for hook commands but
 * not for shell commands a skill runs later, so the resolved path is handed over here instead of
 * assumed there.
 */
const main = () => {
  const company = readCompany();
  const root = process.env.CLAUDE_PLUGIN_ROOT ?? null;

  /**
   * Announced once here rather than repeated in twenty skills, for the same reason the plugin root
   * is: the model reads every loaded instruction, so a rule stated per-skill is paid for on every
   * invocation and drifts between wordings. It also has to reach the twelve skills that no shared
   * doctrine file happens to be wired into.
   *
   * The two halves pull in opposite directions and both matter. The operator is a person having a
   * conversation and gets answered in the language they wrote in. The company's documents are
   * deliverables read by that company's own people, so their language is decided by the manifest's
   * `locale` and never by whatever language the current message happened to be in.
   */
  const lines = [
    "Xenth AI Plugin ready.",
    "Reply to the operator in the language they wrote to you in. The company's own documents keep the language its .company.json declares, whatever language this conversation is in.",
  ];
  lines.push(
    company.ok
      ? `Bound company: ${company.company.name} (${company.company.id}). State it in your first reply. ` +
          "Store writes are journaled; local writes outside this directory are blocked."
      : `No company is bound (${company.reason}). Store writes are refused until a .company.json exists in this directory tree. Local work is unaffected.`
  );
  if (root) lines.push(`Plugin root: ${root} — use this path for tools/journal.mjs and the render engine.`);

  /**
   * Last, because it is the only line that reports an action this hook took rather than a fact it
   * read, and a reader who stops early should stop having read the binding.
   */
  const engine = ensureEngine(root);
  if (engine) lines.push(engine);

  const out = { hookEventName: "SessionStart", additionalContext: lines.join(" ") };
  if (company.ok) out.sessionTitle = `${company.company.name} — Xenth AI`;

  process.stdout.write(JSON.stringify({ hookSpecificOutput: out }));
};

/**
 * A bootstrap failure must not block the session, but it must not vanish either: the binding
 * announcement is a control, and an operator who never sees it has lost the control without being
 * told. Same posture as the journal hook — complain on stderr, exit 0.
 */
try {
  main();
} catch (err) {
  process.stderr.write(
    `Xenth AI — the session could not be announced, so no company binding was stated: ${String(err && err.message).slice(0, 200)}\n`
  );
}
process.exit(0);
