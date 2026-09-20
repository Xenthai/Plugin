import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const HOOK = join(ROOT, "hooks", "bootstrap.mjs");
const SANDBOX = join(HERE, "sandbox", "bootstrap");
const PLUGIN = join(SANDBOX, "plugin");
const COMPANY = join(SANDBOX, "company");
const EPHEMERAL = join(SANDBOX, "ephemeral");
const CONFIG = join(SANDBOX, "config");
const DATA = join(SANDBOX, "plugin-data");

const STORE_ROOT = "1BOOTROOTXXXXXXXXXXXXXXXXXXXXXXXX";

/** The bound is 30 s in the hook; the hook's own JSON has to arrive well inside the 60 s SessionStart budget. */
const RETURN_WITHIN_MS = 38_000;

const manifest = (id, name, binding) =>
  JSON.stringify(
    { schema_version: 1, id, name, locale: "es-MX", timezone: "America/Mexico_City", ...(binding ? { binding } : {}), store: { kind: "drive", root: STORE_ROOT } },
    null,
    2
  );

/** Same derivation as the hook's, so the suite can prove the lock was released rather than guess. */
const lockPath = (root) => join(tmpdir(), `xenthai-engine-${createHash("sha256").update(root).digest("hex").slice(0, 16)}.lock`);

const setup = () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  for (const dir of [PLUGIN, COMPANY, EPHEMERAL, CONFIG, DATA]) mkdirSync(dir, { recursive: true });
  copyFileSync(join(ROOT, "package.json"), join(PLUGIN, "package.json"));
  writeFileSync(join(COMPANY, ".company.json"), manifest("co-boot-0001", "Boot Co", null));
  writeFileSync(join(EPHEMERAL, ".company.json"), manifest("co-boot-0002", "Cloud Co", "ephemeral"));
  rmSync(lockPath(PLUGIN), { recursive: true, force: true });
};

/**
 * A fake `npm` first on PATH, as a Node script behind the two wrappers the hook can spawn: `npm`
 * for a POSIX shell and `npm.cmd` for the Windows shell the hook is forced to use there. `exec`
 * makes the script the process itself, so what the hook's kill signal reaches is the thing that
 * would otherwise keep running.
 */
const fakeNpm = (label, body) => {
  const bin = join(SANDBOX, `bin-${label}`);
  mkdirSync(bin, { recursive: true });
  const script = join(bin, "npm.mjs");
  writeFileSync(script, body, "utf8");
  writeFileSync(join(bin, "npm"), `#!/bin/sh\nexec "${process.execPath}" "${script}" "$@"\n`, "utf8");
  writeFileSync(join(bin, "npm.cmd"), `@"${process.execPath}" "${script}" %*\r\n`, "utf8");
  chmodSync(join(bin, "npm"), 0o755);
  return bin;
};

const pathKey = Object.keys(process.env).find((k) => /^path$/i.test(k)) ?? "PATH";

const run = ({ cwd, pluginRoot, bin = null, timeout = 45_000 }) => {
  const env = { ...process.env, CLAUDE_PLUGIN_ROOT: pluginRoot, CLAUDE_PLUGIN_DATA: DATA, CLAUDE_CONFIG_DIR: CONFIG };
  if (bin) env[pathKey] = `${bin}${process.platform === "win32" ? ";" : ":"}${process.env[pathKey] ?? ""}`;
  const started = Date.now();
  const res = spawnSync(process.execPath, [HOOK], {
    cwd,
    env,
    encoding: "utf8",
    input: JSON.stringify({ hook_event_name: "SessionStart", cwd, session_id: "s-boot" }),
    timeout,
  });
  let context = null;
  let title;
  try {
    const out = JSON.parse(res.stdout).hookSpecificOutput;
    context = out.additionalContext;
    title = out.sessionTitle;
  } catch {}
  return { code: res.status, signal: res.signal, elapsed: Date.now() - started, out: res.stdout ?? "", err: res.stderr ?? "", context, title };
};

const installRows = (dir) => {
  const month = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" }).format(new Date()).slice(0, 7);
  const file = join(dir, "journal", "execution", `${month}.jsonl`);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((r) => r.capability === "bootstrap");
};

const transportHook = (overrides = {}) => ({
  hooks: {
    PostToolUse: [
      {
        matcher: "Bash",
        hooks: [
          {
            type: "mcp_tool",
            if: "Bash(*journal-sync.mjs --emit*)",
            server: "Google_Drive",
            tool: "create_file",
            timeout: 60,
            input: {
              parentId: "1JOURNALFOLDERXXXXXXXXXXXXXXXXXX",
              title: "${tool_input.description}",
              contentMimeType: "text/plain",
              disableConversionToGoogleType: true,
              textContent: "${tool_response.stdout}\n",
            },
            ...overrides,
          },
        ],
      },
    ],
  },
});

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

/**
 * The defect measured in the field: npm 10 swallows the first SIGTERM, so the 45 s timeout expired
 * and the hook ran on for 6 m 48 s until Claude Code killed it at the SessionStart budget — and
 * because the JSON is written last, the session started with no binding stated at all. A fake npm
 * that never returns is that registry. What is asserted is not that the install failed but that the
 * announcement still arrived, inside the budget, with the lock released for the next session.
 */
check("an npm that never returns is killed at the bound and the full announcement still arrives, lock released", () => {
  const bin = fakeNpm("sleep", "setTimeout(() => {}, 120_000);\n");
  const r = run({ cwd: COMPANY, pluginRoot: PLUGIN, bin });
  const row = installRows(COMPANY).at(-1);
  return [
    r.code === 0 &&
      r.signal === null &&
      r.elapsed < RETURN_WITHIN_MS &&
      typeof r.context === "string" &&
      /Bound company: Boot Co \(co-boot-0001\)/.test(r.context) &&
      /Plugin root: /.test(r.context) &&
      r.title === "Boot Co — Xenth AI" &&
      /could not be installed/.test(r.context) &&
      /\(timeout:/.test(r.context) &&
      !existsSync(lockPath(PLUGIN)) &&
      row?.event === "health" &&
      row.result === "error" &&
      row.detail === "engine:install-failed(timeout)",
    `exit ${r.code} signal ${r.signal} in ${r.elapsed} ms; bound=${/Bound company/.test(r.context ?? "")}; lock gone=${!existsSync(lockPath(PLUGIN))}; row=${row?.detail}`,
  ];
});

/**
 * With stderr ignored, a proxy refusing the registry and a misspelt hostname both read as "npm
 * exited 1" and the operator had nothing to act on. The line npm printed is what they need; the
 * row carries the class of failure only, because it travels to the client's store.
 */
check("an npm that fails names its cause from stderr in the message, and the row says install-failed(npm-error)", () => {
  const bin = fakeNpm("fail", 'process.stderr.write("\\nnpm ERR! network ECONNREFUSED\\nnpm ERR! more\\n");\nprocess.exit(1);\n');
  const before = installRows(COMPANY).length;
  const r = run({ cwd: COMPANY, pluginRoot: PLUGIN, bin });
  const rows = installRows(COMPANY);
  const row = rows.at(-1);
  return [
    r.code === 0 &&
      /Bound company: Boot Co/.test(r.context ?? "") &&
      /npm ERR! network ECONNREFUSED/.test(r.context ?? "") &&
      !/npm ERR! more/.test(r.context ?? "") &&
      rows.length === before + 1 &&
      row.event === "health" &&
      row.actor === "system" &&
      row.company === "co-boot-0001" &&
      row.result === "error" &&
      row.detail === "engine:install-failed(npm-error)" &&
      !/[\\/]/.test(row.detail),
    `exit ${r.code}; cause quoted=${/ECONNREFUSED/.test(r.context ?? "")}; rows +${rows.length - before}; row=${row?.detail}`,
  ];
});

check("an npm that installs is announced as installed, and the row says engine:installed with result ok", () => {
  const bin = fakeNpm(
    "ok",
    'import { mkdirSync, writeFileSync } from "node:fs";\nmkdirSync("node_modules/playwright-core", { recursive: true });\nwriteFileSync("node_modules/playwright-core/package.json", JSON.stringify({ name: "playwright-core" }));\n'
  );
  const r = run({ cwd: COMPANY, pluginRoot: PLUGIN, bin });
  const row = installRows(COMPANY).at(-1);
  return [
    r.code === 0 &&
      /Bound company: Boot Co/.test(r.context ?? "") &&
      /has been installed/.test(r.context ?? "") &&
      existsSync(join(PLUGIN, "node_modules", "playwright-core", "package.json")) &&
      row?.result === "ok" &&
      row.detail === "engine:installed",
    `exit ${r.code}; installed=${/has been installed/.test(r.context ?? "")}; row=${row?.detail} (${row?.result})`,
  ];
});

check("once the engine is present nothing is installed and no install row is written", () => {
  const before = installRows(COMPANY).length;
  const bin = fakeNpm("never", 'process.stderr.write("npm should not have run\\n");\nprocess.exit(1);\n');
  const r = run({ cwd: COMPANY, pluginRoot: PLUGIN, bin });
  return [
    r.code === 0 && !/dependency/.test(r.context ?? "") && installRows(COMPANY).length === before,
    `exit ${r.code}; install mentioned=${/dependency/.test(r.context ?? "")}; rows +${installRows(COMPANY).length - before}`,
  ];
});

/**
 * The EPHEMERAL BINDING line is where a session reads, before its first upload, whether the
 * transport hook exists — the one place the fact is useful. The hook is looked for in the files the
 * session actually loads, so a valid one in the starting directory's settings.local.json reads as
 * present and its absence names where to write it.
 */
check("the ephemeral line says the transport hook is absent, then present once it is written where the session loads it", () => {
  const absent = run({ cwd: EPHEMERAL, pluginRoot: ROOT });
  mkdirSync(join(EPHEMERAL, ".claude"), { recursive: true });
  writeFileSync(join(EPHEMERAL, ".claude", "settings.local.json"), JSON.stringify(transportHook(), null, 2));
  const present = run({ cwd: EPHEMERAL, pluginRoot: ROOT });
  const a = absent.context ?? "";
  const p = present.context ?? "";
  return [
    /EPHEMERAL BINDING/.test(a) &&
      /transport hook, which is absent/.test(a) &&
      /INSTALL\.md §5b/.test(a) &&
      /EPHEMERAL BINDING/.test(p) &&
      /transport hook, which is present\./.test(p) &&
      !/which is absent/.test(p),
    `absent said absent=${/which is absent/.test(a)}; present said present=${/which is present\./.test(p)}`,
  ];
});

check("a hook that cannot fire reads as present but unable to fire, naming the defect", () => {
  writeFileSync(join(EPHEMERAL, ".claude", "settings.local.json"), JSON.stringify(transportHook({ if: "Bash(node * journal-sync.mjs --emit*)" }), null, 2));
  const r = run({ cwd: EPHEMERAL, pluginRoot: ROOT });
  const ctx = r.context ?? "";
  return [/present but unable to fire \(pattern-anchored\)/.test(ctx), ctx.slice(ctx.indexOf("transport hook"), ctx.indexOf("transport hook") + 90)];
});

setup();
let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  let detail = "";
  try {
    [ok, detail] = fn();
  } catch (err) {
    detail = `threw: ${err.message}`;
  }
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ->  ${detail}` : ""}`);
}
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed`);
if (!failed) rmSync(SANDBOX, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
