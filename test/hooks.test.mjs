import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
/**
 * Each suite owns a disjoint subtree under test/sandbox. This one used the parent, so its setup
 * deleted a sibling suite's sandbox mid-run — surfacing on Windows as EBUSY on rmdir and killing
 * both suites. A shared scratch directory between suites is a race, not a convenience.
 */
const SANDBOX = join(HERE, "sandbox", "hooks");
const CO_A = join(SANDBOX, "company-a");
const CO_B = join(SANDBOX, "company-b");
const DATA = join(SANDBOX, "plugin-data");

const ROOT_A = "1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const ROOT_B = "1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ";

const setup = () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  for (const [dir, id, name, root] of [
    [CO_A, "co-a-0001", "Company A", ROOT_A],
    [CO_B, "co-b-0002", "Company B", ROOT_B],
  ]) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, ".company.json"),
      JSON.stringify({ schema_version: 1, id, name, timezone: "America/Mexico_City", store: { kind: "drive", root } }, null, 2)
    );
  }
};

const run = (script, event, cwd, extraEnv = {}) => {
  const res = spawnSync(process.execPath, [join(ROOT, script)], {
    input: JSON.stringify({ cwd, session_id: "s-test", prompt_id: "p-test-1234", ...event }),
    encoding: "utf8",
    cwd,
    env: { ...process.env, CLAUDE_PLUGIN_DATA: DATA, ...extraEnv },
  });
  return { code: res.status, out: res.stdout ?? "", err: res.stderr ?? "" };
};

const cli = (args, cwd) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "journal.mjs"), ...args], {
    encoding: "utf8",
    cwd,
    env: { ...process.env, CLAUDE_PLUGIN_DATA: DATA },
  });

const rows = (dir) => {
  const base = join(dir, "journal", "execution");
  if (!existsSync(base)) return [];
  const month = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" })
    .format(new Date())
    .slice(0, 7);
  const file = join(base, `${month}.jsonl`);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
};

const pre = (tool, input, cwd) => run("hooks/guard-company.mjs", { hook_event_name: "PreToolUse", tool_name: tool, tool_input: input }, cwd);
const post = (tool, input, cwd, hook = "PostToolUse") => run("hooks/journal.mjs", { hook_event_name: hook, tool_name: tool, tool_input: input, tool_result: "ok" }, cwd);

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("guard lets a read-only tool through", () => {
  const r = pre("Read", { file_path: "/etc/hosts" }, CO_A);
  return [r.code === 0, `exit ${r.code}`];
});

check("guard BLOCKS a store write when no company is bound", () => {
  const r = pre("mcp__abc__create_file", { title: "x", parentId: ROOT_A }, SANDBOX);
  return [r.code === 2 && /not bound to a company/.test(r.err), `exit ${r.code}`];
});

check("guard ALLOWS a store write to the bound company's root", () => {
  const r = pre("mcp__abc__create_file", { title: "x", parentId: ROOT_A }, CO_A);
  return [r.code === 0 && r.err.trim() === "", `exit ${r.code}`];
});

check("guard does NOT block a store write to an unknown folder (no allowlist by design)", () => {
  const r = pre("mcp__abc__create_file", { title: "x", parentId: ROOT_B }, CO_A);
  return [r.code === 0, `exit ${r.code} — the journal, not the guard, carries this`];
});

check("guard lets file-targeted operations (rename, trash) pass", () => {
  const a = pre("mcp__abc__update_file", { fileId: "1FILE", title: "renamed" }, CO_A);
  const b = pre("mcp__abc__trash_file", { fileId: "1FILE" }, CO_A);
  return [a.code === 0 && b.code === 0, `update ${a.code}, trash ${b.code}`];
});

check("guard ANNOUNCES a share without blocking it, and journals it", () => {
  const before = rows(CO_A).length;
  const r = pre("mcp__abc__share_file", { fileId: "1FILE", emailAddress: "someone@outside.com", role: "reader" }, CO_A);
  const last = rows(CO_A).at(-1);
  return [
    r.code === 0 && /sharing Company A/.test(r.err) && rows(CO_A).length === before + 1 && /outside\.com/.test(last?.detail ?? ""),
    `exit ${r.code}; stderr notice: ${/sharing/.test(r.err)}; journaled domain: ${last?.detail}`,
  ];
});

check("guard BLOCKS a local write into another company's directory", () => {
  const r = pre("Write", { file_path: join(CO_B, "leak.md") }, CO_A);
  return [r.code === 2 && /outside the company directory/.test(r.err), `exit ${r.code}`];
});

check("guard allows a local write inside the bound directory", () => {
  const r = pre("Write", { file_path: join(CO_A, "ok.md") }, CO_A);
  return [r.code === 0, `exit ${r.code}`];
});

check("journal records a write as a reference, never the content, with a schema stamp", () => {
  const secret = "SECRETO QUE NO DEBE APARECER";
  post("Write", { file_path: join(CO_A, "brand.md"), content: secret }, CO_A);
  const all = rows(CO_A);
  const row = all.at(-1);
  const text = JSON.stringify(all);
  return [
    row.schema === 1 &&
      row.plugin === "0.1.0" &&
      row.event === "ai_action" &&
      row.company === "co-a-0001" &&
      row.target?.file_path?.endsWith("brand.md") &&
      row.bytes === Buffer.byteLength(secret) &&
      /^sha256:[0-9a-f]{16}$/.test(row.digest) &&
      !text.includes("SECRETO"),
    `schema=${row?.schema} plugin=${row?.plugin} leaks=${text.includes("SECRETO")} bytes=${row?.bytes}`,
  ];
});

check("journal extracts the paths a Bash command touches, and digests the command itself", () => {
  post("Bash", { command: `echo hola > "${join(CO_B, "leak.md")}" && cp ./a.txt ~/b.txt` }, CO_A);
  const row = rows(CO_A).at(-1);
  const paths = row.target?.paths ?? [];
  return [
    /^sha256:/.test(row.target?.command ?? "") && paths.some((p) => p.endsWith("leak.md")) && paths.includes("./a.txt") && paths.includes("~/b.txt"),
    `command=${row.target?.command} paths=${JSON.stringify(paths)}`,
  ];
});

check("journal skips read-only tools", () => {
  const before = rows(CO_A).length;
  post("Read", { file_path: "x" }, CO_A);
  post("mcp__abc__search_files", { query: "x" }, CO_A);
  return [rows(CO_A).length === before, `rows unchanged at ${before}`];
});

check("journal records a failure as result=error", () => {
  post("Write", { file_path: join(CO_A, "c.md") }, CO_A, "PostToolUseFailure");
  const row = rows(CO_A).at(-1);
  return [row.result === "error" && row.event === "error", `result=${row?.result}`];
});

check("journal writes to plugin data when no company is bound", () => {
  post("Write", { file_path: "/tmp/x" }, SANDBOX);
  const r = rows(DATA);
  return [r.length >= 1 && r.at(-1).company === null, `rows=${r.length}`];
});

check("journal survives concurrent hook processes without losing rows", () => {
  const before = rows(CO_A).length;
  const procs = Array.from({ length: 12 }, (_, i) =>
    spawnSync(process.execPath, [join(ROOT, "hooks", "journal.mjs")], {
      input: JSON.stringify({ cwd: CO_A, hook_event_name: "PostToolUse", tool_name: "Edit", tool_input: { file_path: join(CO_A, `p${i}.md`) } }),
      encoding: "utf8",
      cwd: CO_A,
      env: { ...process.env, CLAUDE_PLUGIN_DATA: DATA },
    })
  );
  const ok = procs.every((p) => p.status === 0);
  const after = rows(CO_A).length;
  return [ok && after === before + 12, `exits ok=${ok}; rows ${before} -> ${after}`];
});

check("bootstrap emits valid hook JSON naming the bound company and the plugin root", () => {
  const r = run("hooks/bootstrap.mjs", { hook_event_name: "SessionStart" }, CO_A, { CLAUDE_PLUGIN_ROOT: ROOT });
  let ctx = "";
  try {
    ctx = JSON.parse(r.out).hookSpecificOutput.additionalContext;
  } catch {}
  return [r.code === 0 && ctx.includes("Company A") && ctx.includes("Plugin root:"), `exit ${r.code}; ${ctx.slice(0, 80)}`];
});

check("cli --help exits 0 so callers can discover it without reading the source", () => {
  const r = cli(["--help"], CO_A);
  return [r.status === 0 && /--event/.test(r.stdout), `exit ${r.status}`];
});

check("cli with no event exits 1; unknown event exits 1", () => {
  const a = cli([], CO_A);
  const b = cli(["--event", "made_up"], CO_A);
  return [a.status === 1 && b.status === 1 && /unknown event/.test(b.stderr), `exits ${a.status}, ${b.status}`];
});

check("cli records a named approval into the bound company", () => {
  const r = cli(["--event", "approval", "--actor", "person:Ana Ruiz", "--why", "approved the plan", "--session", "s-9", "--json"], CO_A);
  const row = rows(CO_A).at(-1);
  return [r.status === 0 && row.event === "approval" && row.actor === "person:Ana Ruiz" && row.session === "s-9", `exit ${r.status} actor=${row?.actor}`];
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
