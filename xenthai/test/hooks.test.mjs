import { spawnSync } from "node:child_process";
import { MAX_ROW_BYTES, PLUGIN_VERSION, record as recordDirect } from "../lib/journal.mjs";
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
/**
 * Whatever the journal itself reports as the version, rather than a literal or a manifest read. A
 * literal made every release fail this suite; a manifest read broke once no manifest declares one.
 * Asserting against the same value the code under test derives keeps this about the row's shape.
 */
const VERSION = PLUGIN_VERSION;

const SANDBOX = join(HERE, "sandbox", "hooks");
const CO_A = join(SANDBOX, "company-a");
const CO_B = join(SANDBOX, "company-b");
/**
 * The operator's own store, and a store whose kind this build does not know. Both are here rather
 * than in a suite of their own because the property under test is the guard's behaviour on the SAME
 * calls: a personal store is bound and writable exactly like a client's, and an unrecognised kind
 * is not bound at all — which is only meaningful next to the two that are.
 */
const PERSONAL = join(SANDBOX, "own-store");
const FUTURE_KIND = join(SANDBOX, "future-kind");
const UNKNOWN_STORE = join(SANDBOX, "unknown-store");
const DATA = join(SANDBOX, "plugin-data");

const ROOT_A = "1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const ROOT_B = "1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ";
const ROOT_P = "1PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP";

const setup = () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  for (const [dir, id, name, root, kind, storeKind] of [
    [CO_A, "co-a-0001", "Company A", ROOT_A, undefined, "drive"],
    [CO_B, "co-b-0002", "Company B", ROOT_B, "client", "drive"],
    [PERSONAL, "own-0001", "Mi vida", ROOT_P, "personal", "drive"],
    [FUTURE_KIND, "odd-0001", "Odd Store", ROOT_P, "household", "drive"],
    [UNKNOWN_STORE, "box-0001", "Box Store", ROOT_P, undefined, "dropbox"],
  ]) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, ".company.json"),
      JSON.stringify(
        { schema_version: 1, id, name, ...(kind ? { kind } : {}), timezone: "America/Mexico_City", store: { kind: storeKind, root } },
        null,
        2
      )
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
  spawnSync(process.execPath, [join(ROOT, "tools", "journal.mjs"), ...args], {
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
  return [r.code === 2 && /not bound to a store/.test(r.err), `exit ${r.code}`];
});

check("guard ALLOWS a store write to the bound company's root", () => {
  const r = pre("mcp__abc__create_file", { title: "x", parentId: ROOT_A }, CO_A);
  return [r.code === 0 && r.err.trim() === "", `exit ${r.code}`];
});

/**
 * The defect this kind was added for. Before it, the operator's own store could not be declared, so
 * every write to it was refused for want of a client — the right veto reached for the wrong reason.
 * A personal store is a bound store and writes exactly like a client's; nothing about the veto
 * changed, only what a manifest is able to say.
 */
check("guard ALLOWS a store write to the operator's OWN store", () => {
  const r = pre("mcp__abc__create_file", { title: "x", parentId: ROOT_P }, PERSONAL);
  return [r.code === 0 && r.err.trim() === "", `exit ${r.code} ${r.err.trim()}`];
});

/**
 * Fails closed, for the reason `future-schema` does. A kind written by a build with rules this one
 * does not have must not be read as a client's store: that files somebody's own material in a
 * client's audit trail, and the mistake is invisible once written.
 */
check("guard treats a manifest with an unrecognised kind as UNBOUND rather than as a client", () => {
  const r = pre("mcp__abc__create_file", { title: "x", parentId: ROOT_P }, FUTURE_KIND);
  return [r.code === 2 && /not bound to a store/.test(r.err) && /unknown-kind/.test(r.err), `exit ${r.code} ${r.err.trim()}`];
});

check("guard says whose material it is when a personal store shares outward", () => {
  const r = pre("mcp__abc__share_file", { fileId: "1FILE", emailAddress: "someone@outside.com", role: "reader" }, PERSONAL);
  return [r.code === 0 && /sharing your own material in Mi vida/.test(r.err), `exit ${r.code}; notice: ${r.err.trim()}`];
});

check("journal stamps the store kind, so a client's trail cannot be read as personal work", () => {
  post("Write", { file_path: join(PERSONAL, "nota.md"), content: "x" }, PERSONAL);
  const own = rows(PERSONAL).at(-1);
  post("Write", { file_path: join(CO_A, "nota.md"), content: "x" }, CO_A);
  const client = rows(CO_A).at(-1);
  return [
    own?.store_kind === "personal" && own?.schema === 3 && client?.store_kind === "client",
    `personal=${own?.store_kind} schema=${own?.schema} client=${client?.store_kind}`,
  ];
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
  return [r.code === 2 && /outside the bound store's directory/.test(r.err), `exit ${r.code}`];
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
    row.schema === 3 &&
      row.plugin === VERSION &&
      row.event === "ai_action" &&
      row.company === "co-a-0001" &&
      row.store_kind === "client" &&
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

/**
 * The documented way to run the plugin's own CLIs goes through `${CLAUDE_PLUGIN_ROOT}`, so the path
 * extractor saw nothing and a month of `report.mjs` runs left rows nobody could grep. The variable
 * token is now a path, kept with its variable name so it does not read as a file at the filesystem
 * root. The action is the shell's vocabulary and nothing else: the emitted file name is a value.
 */
check("a plugin CLI run through the plugin-root variable leaves a legible action and path, never the value", () => {
  post("Bash", { command: `cd /r && node "\${CLAUDE_PLUGIN_ROOT}/tools/journal-sync.mjs" --emit 2026-09.rev-001.jsonl` }, CO_A);
  const row = rows(CO_A).at(-1);
  const text = JSON.stringify(row);
  return [
    row.target?.action === "node journal-sync.mjs --emit" &&
      (row.target?.paths ?? []).includes("${CLAUDE_PLUGIN_ROOT}/tools/journal-sync.mjs") &&
      (row.target?.paths ?? []).includes("/r") &&
      !text.includes("rev-001"),
    `action=${row.target?.action} paths=${JSON.stringify(row.target?.paths)} leaked=${text.includes("rev-001")}`,
  ];
});

check("a report run from the repository names the script and the flag, and the journal path stays a path", () => {
  post("Bash", { command: `cd ${CO_A} && node tools/report.mjs --journal ${join(CO_A, "journal")}` }, CO_A);
  const row = rows(CO_A).at(-1);
  return [
    row.target?.action === "node report.mjs --journal" && (row.target?.paths ?? []).some((p) => p.endsWith("journal")),
    `action=${row.target?.action} paths=${JSON.stringify(row.target?.paths)}`,
  ];
});

/**
 * `push` is an argument, not a flag, so it is not in the action: the rule is program, script and
 * option NAME, with no position where a value can stand. A looser rule that kept "the first word
 * after the program" would carry `push` today and a person's name tomorrow.
 */
check("an argument is never part of the action, only a program and a flag are", () => {
  post("Bash", { command: "git push -u origin ana-ruiz" }, CO_A);
  const row = rows(CO_A).at(-1);
  return [row.target?.action === "git -u" && !JSON.stringify(row).includes("ana-ruiz"), `action=${row.target?.action}`];
});

/**
 * The reason the command line is digested at all. `--why` and `--detail` are exactly where an
 * operator types a sentence, and the flag name is what the row keeps of them.
 */
check("a command with a secret-looking argument keeps the flag name and none of the values", () => {
  post("Bash", { command: `node tools/journal.mjs --why "SECRETO-123" --detail "x@y.com"` }, CO_A);
  const row = rows(CO_A).at(-1);
  const text = JSON.stringify(row);
  return [
    row.target?.action === "node journal.mjs --why" && !text.includes("SECRETO-123") && !text.includes("x@y.com"),
    `action=${row.target?.action} leaked=${text.includes("SECRETO-123") || text.includes("x@y.com")}`,
  ];
});

check("a plain listing and an env-prefixed script keep program and flag, skipping the assignment", () => {
  post("Bash", { command: "ls -la /tmp" }, CO_A);
  const ls = rows(CO_A).at(-1);
  post("Bash", { command: "FOO=bar node x.mjs" }, CO_A);
  const env = rows(CO_A).at(-1);
  return [
    ls.target?.action === "ls -la" && env.target?.action === "node x.mjs" && !JSON.stringify(env).includes("FOO=bar"),
    `ls action=${ls.target?.action}; env action=${env.target?.action}`,
  ];
});

/**
 * A heredoc is how a shell writes a document, and its lines would otherwise be split as commands —
 * the first word of a client's paragraph becoming a "program" in the row. Everything after `<<` is
 * dropped from the action, and a `;` inside a quoted value must not open a segment either.
 */
check("a heredoc body and a quoted value never become a program in the action", () => {
  post("Bash", { command: `cat > ${join(CO_A, "nota.md")} <<'EOF'\nCONFIDENCIAL primera línea\nEOF` }, CO_A);
  const heredoc = rows(CO_A).at(-1);
  post("Bash", { command: `node tools/journal.mjs --why "hola; CLAVE-SECRETA x"` }, CO_A);
  const quoted = rows(CO_A).at(-1);
  const text = JSON.stringify([heredoc, quoted]);
  return [
    heredoc.target?.action === "cat" && quoted.target?.action === "node journal.mjs --why" && !text.includes("CONFIDENCIAL") && !text.includes("CLAVE-SECRETA"),
    `heredoc action=${heredoc.target?.action}; quoted action=${quoted.target?.action}; leaked=${text.includes("CONFIDENCIAL") || text.includes("CLAVE-SECRETA")}`,
  ];
});

check("journal skips read-only tools", () => {
  const before = rows(CO_A).length;
  post("Read", { file_path: "x" }, CO_A);
  post("mcp__abc__search_files", { query: "x" }, CO_A);
  return [rows(CO_A).length === before, `rows unchanged at ${before}`];
});

/**
 * The second store provider. The Microsoft 365 connector reaches OneDrive through `sharepoint_*`
 * methods, and the plugin's two vetoes and its journal must treat them exactly as Drive's: an
 * unbound write refused, a read not recorded, a write recorded with its Graph target — an item id
 * is unique only within a drive, so the pair is what identifies the target.
 */
check("guard BLOCKS a OneDrive store write when no company is bound, through the Microsoft 365 connector's names", () => {
  const r = pre("mcp__claude_ai_Microsoft_365__sharepoint_upload_file", { driveId: "b!DRIVE", itemId: "01ITEM", name: "x.md" }, SANDBOX);
  const del = pre("mcp__claude_ai_Microsoft_365__sharepoint_delete_item", { driveId: "b!DRIVE", itemId: "01ITEM" }, SANDBOX);
  return [r.code === 2 && del.code === 2 && /not bound to a store/.test(r.err), `upload ${r.code}, delete ${del.code}`];
});

check("guard ALLOWS the same OneDrive write once a company is bound, and the journal records its Graph target", () => {
  const r = pre("mcp__claude_ai_Microsoft_365__sharepoint_upload_file", { driveId: "b!DRIVE", itemId: "01ITEM", name: "x.md" }, CO_A);
  post("mcp__claude_ai_Microsoft_365__sharepoint_upload_file", { driveId: "b!DRIVE", itemId: "01ITEM", name: "x.md", content: "hola" }, CO_A);
  const row = rows(CO_A).at(-1);
  return [
    r.code === 0 && row?.target?.driveId === "b!DRIVE" && row?.target?.itemId === "01ITEM" && row?.bytes === 4,
    `exit ${r.code}; target=${JSON.stringify(row?.target)} bytes=${row?.bytes}`,
  ];
});

check("journal skips the Microsoft 365 connector's read-only methods", () => {
  const before = rows(CO_A).length;
  post("mcp__claude_ai_Microsoft_365__sharepoint_search", { query: "x" }, CO_A);
  post("mcp__claude_ai_Microsoft_365__read_resource", { uri: "file:///b!DRIVE/root" }, CO_A);
  return [rows(CO_A).length === before, `rows unchanged at ${before}`];
});

check("guard treats a manifest with an unrecognised store.kind as UNBOUND rather than as Drive", () => {
  const r = pre("mcp__abc__create_file", { title: "x", parentId: ROOT_P }, UNKNOWN_STORE);
  return [r.code === 2 && /unknown-store-kind/.test(r.err), `exit ${r.code} ${r.err.trim().split("\n").find((l) => /Reason/.test(l))}`];
});

check("journal records a failure as result=error", () => {
  post("Write", { file_path: join(CO_A, "c.md") }, CO_A, "PostToolUseFailure");
  const row = rows(CO_A).at(-1);
  return [row.result === "error" && row.event === "error", `result=${row?.result}`];
});

/**
 * The hooks match every tool on every event, so an unbound session is somebody else's project. The
 * published marketplace policy fails a hook that observes tool I/O on sessions unrelated to the
 * plugin's purpose, and recording a stranger's repository would be exactly that.
 *
 * The distinction is what matters here, so both halves are asserted together: ambient hook
 * recording stops, and a deliberate CLI call by the operator still lands in the plugin's own data
 * directory. The "a gap cannot be told apart from an action that never happened" invariant applies
 * inside an engagement, which is where it was always aimed.
 */
/**
 * With no company bound AND no data directory in the environment, an entry must still be recorded —
 * a gap cannot be told apart from an action that never happened — but never into the working
 * directory. Falling back to `cwd` meant running `doctor` from anywhere created a `journal/`
 * tree there: the ambient-authority pattern `company-new` refuses for manifests, committed by the
 * journal instead, and it scattered unbound rows across whatever folder the operator stood in.
 */
check("an unbound entry with no data directory lands in one stable place, never in the cwd", () => {
  const bare = join(SANDBOX, "bare-cwd");
  mkdirSync(bare, { recursive: true });
  const env = { ...process.env };
  delete env.CLAUDE_PLUGIN_DATA;
  const home = join(SANDBOX, "fake-home");
  env.CLAUDE_CONFIG_DIR = home;
  const r = spawnSync(process.execPath, [join(ROOT, "tools", "journal.mjs"), "--event", "health", "--why", "no company, no data dir"], {
    encoding: "utf8",
    cwd: bare,
    env,
  });
  const littered = existsSync(join(bare, "journal"));
  const landed = existsSync(join(home, "xenthai", "journal", "execution"));
  return [r.status === 0 && !littered && landed, `exit ${r.status}; littered=${littered} landed=${landed}`];
});

check("an unbound session is NOT journaled by the hook, but the CLI still records", () => {
  const before = rows(DATA).length;
  const hook = post("Write", { file_path: "/tmp/somebody-elses-project.md" }, SANDBOX);
  const afterHook = rows(DATA).length;

  const res = cli(["--event", "health", "--why", "operator ran the cli with no company bound"], SANDBOX);
  const afterCli = rows(DATA);

  return [
    hook.code === 0 &&
      afterHook === before &&
      res.status === 0 &&
      afterCli.length === before + 1 &&
      afterCli.at(-1).company === null,
    `hook exit ${hook.code} wrote ${afterHook - before}; cli exit ${res.status} wrote ${afterCli.length - afterHook}`,
  ];
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

/**
 * A permission prompt is the moment a decision stopped being the session's and became a person's.
 * Recording it is what makes the approval queue in the controls doctrine real: a refusal nobody can
 * enumerate afterwards is an obstacle, not governance.
 */
check("a permission request is recorded as a pending escalation naming the tool", () => {
  const before = rows(CO_A).length;
  const r = run(
    "hooks/journal.mjs",
    { hook_event_name: "PermissionRequest", tool_name: "Bash", tool_input: { command: "rm -rf /tmp/x" } },
    CO_A
  );
  const row = rows(CO_A).at(-1);
  return [
    r.code === 0 &&
      rows(CO_A).length === before + 1 &&
      row.event === "escalation" &&
      row.result === "pending" &&
      /Bash/.test(row.why ?? ""),
    `exit ${r.code}; event=${row?.event} result=${row?.result} why="${(row?.why ?? "").slice(0, 54)}"`,
  ];
});

/**
 * The command line stays a digest; what the row gains is the shell's own vocabulary — program and
 * flag — so a reader sees WHICH command needed a person without seeing what it was given. The
 * argument here is a path, so it is in `paths` by the older rule; the line as typed must not be.
 */
check("the permission request records a reference and the action, never the command line itself", () => {
  const row = rows(CO_A).at(-1);
  const serialised = JSON.stringify(row);
  return [
    /^sha256:/.test(row.target?.command ?? "") && row.target?.action === "rm -rf" && !serialised.includes("rm -rf /tmp/x"),
    `command=${row.target?.command} action=${row.target?.action} line-leaked=${serialised.includes("rm -rf /tmp/x")}`,
  ];
});

/**
 * `report` pairs an escalation with its outcome by session, tool and digest, so the two hooks must
 * reduce one `tool_input` to one digest. The pairing was designed on that invariant and nothing
 * else enforced it; a change to `reference` that stamped the hook name or the time into the digest
 * would silently leave every escalation unpaired.
 */
check("the escalation row and the later outcome row for one input carry the same digest, and both carry the action", () => {
  const input = { command: `node "\${CLAUDE_PLUGIN_ROOT}/tools/journal.mjs" --event approval --why "PERSONA-SECRETA"` };
  run("hooks/journal.mjs", { hook_event_name: "PermissionRequest", tool_name: "Bash", tool_input: input }, CO_A);
  const escalation = rows(CO_A).at(-1);
  post("Bash", input, CO_A);
  const outcome = rows(CO_A).at(-1);
  const text = JSON.stringify([escalation, outcome]);
  return [
    escalation.event === "escalation" &&
      outcome.event === "ai_action" &&
      escalation.digest === outcome.digest &&
      escalation.target?.action === "node journal.mjs --event" &&
      outcome.target?.action === "node journal.mjs --event" &&
      !text.includes("PERSONA-SECRETA"),
    `digests ${escalation.digest === outcome.digest ? "equal" : "DIFFER"}; escalation action=${escalation.target?.action}; leaked=${text.includes("PERSONA-SECRETA")}`,
  ];
});

/**
 * `report` publishes the escalation count to the client as decisions that passed to a person. A
 * clarifying question performs nothing, so counting it there inflates that figure silently — a
 * larger number reads as more governance rather than less — and pollutes the one trail the client
 * is asked to trust. Both halves are asserted together, because dropping the row entirely would be
 * the wrong fix: the call itself is still journaled by PostToolUse.
 */
check("a permission prompt for a question-only tool is not an escalation, and the call is still recorded", () => {
  const before = rows(CO_A).length;
  const prompt = run(
    "hooks/journal.mjs",
    { hook_event_name: "PermissionRequest", tool_name: "AskUserQuestion", tool_input: { questions: [{ question: "¿cuál?" }] } },
    CO_A
  );
  const afterPrompt = rows(CO_A).length;
  post("AskUserQuestion", { questions: [{ question: "¿cuál?" }] }, CO_A);
  const row = rows(CO_A).at(-1);
  return [
    prompt.code === 0 && afterPrompt === before && row.event === "ai_action" && row.tool === "AskUserQuestion",
    `prompt wrote ${afterPrompt - before} rows; the call itself is ${row?.event}`,
  ];
});

/**
 * A browser session produces one row per call, and eighty-seven of them in one observed day all
 * read identically with a null target: the trail said a browser was used and nothing about what it
 * did. The verb the tool chose is a reference, so it is copied; what was typed is the client's
 * content and stays digested. Asserting both in one case is the point — the row has to gain the
 * first without gaining the second.
 */
check("a browser call records the action verb and the url, and never the keystrokes", () => {
  const secret = "filtro-de-un-cliente@example.com";
  post("mcp__Claude_Browser__computer", { action: "type", text: secret, url: "https://mail.google.com/settings" }, CO_A);
  const row = rows(CO_A).at(-1);
  return [
    row.target?.action === "type" &&
      row.target?.url === "https://mail.google.com/settings" &&
      !JSON.stringify(row).includes(secret),
    `action=${row.target?.action} url=${row.target?.url} leaked=${JSON.stringify(row).includes(secret)}`,
  ];
});

/**
 * Row size is a correctness property, not a style one: hooks matching an event run in parallel, and
 * O_APPEND is atomic only while a write stays small. A row that grew past the ceiling could
 * interleave with another and corrupt both.
 */
/**
 * Each of these is a place where a fragment of a VALUE stood where a program can: an escaped quote
 * inside a quoted value followed by `;`, a comment, an escaped separator, a quote nobody closed, an
 * escaped space inside an environment value, and a quoted value that happens to end like a script.
 * Every one was found by trying to break the extractor, and every one is asserted as absent.
 */
check("a value fragment never becomes a program or a script in the action, whatever the quoting", () => {
  const cases = [
    [`node x.mjs --why "he said \\"hi; ZQXprog --x\\" ok"`, "node x.mjs --why"],
    ["echo hi # ZQXcomment; ZQXprog --x", "echo"],
    ["echo a\\; ZQXprog --x", "echo --x"],
    ["echo it's a; ZQXprog --x", "echo"],
    ["TOKEN=ZQXsecret\\ b node x.mjs", "node x.mjs"],
    ['node --why "ZQXsecreto.sh" tools/journal.mjs', "node journal.mjs --why"],
    ["node --out ZQXname.mjs", "node --out"],
  ];
  for (const [command, expected] of cases) {
    post("Bash", { command }, CO_A);
    const row = rows(CO_A).at(-1);
    const text = JSON.stringify(row);
    if (row.target?.action !== expected || text.includes("ZQX")) return [false, `${command} -> action=${row.target?.action} leaked=${text.includes("ZQX")}`];
  }
  return [true, `${cases.length} quoting shapes, no value in any row`];
});

check("every row written by the suite stays under the atomic-append ceiling", () => {
  const all = [...rows(CO_A), ...rows(CO_B)];
  const sizes = all.map((r) => Buffer.byteLength(JSON.stringify(r)));
  const max = Math.max(...sizes, 0);
  return [max <= MAX_ROW_BYTES, `${all.length} rows, largest ${max} B, ceiling ${MAX_ROW_BYTES} B`];
});

check("a row carrying a payload is truncated rather than risking the file", () => {
  const before = rows(CO_A).length;
  recordDirect({ event: "ai_action", why: "x".repeat(MAX_ROW_BYTES * 2), tool: "Edit" }, { cwd: CO_A });
  const row = rows(CO_A).at(-1);
  const size = Buffer.byteLength(JSON.stringify(row));
  return [
    rows(CO_A).length === before + 1 && size <= MAX_ROW_BYTES && Number.isInteger(row.truncated),
    `row ${size} B, truncated field = ${row?.truncated}`,
  ];
});

/**
 * `journal-sync` is loaded lazily and only on SessionEnd, inside a try that swallows everything so
 * a session can always end. That is exactly where a broken dynamic import would vanish without a
 * trace, so the warning it produces is asserted end to end: an ephemeral binding with rows the
 * store does not hold must still be told so on the way out.
 */
check("a session ending on an ephemeral binding with unsynced rows is still warned, through the lazily loaded sync module", () => {
  const dir = join(SANDBOX, "ephemeral");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({ schema_version: 1, id: "eph-0001", name: "Efímera", binding: "ephemeral", timezone: "America/Mexico_City", store: { kind: "drive", root: ROOT_A } })
  );
  post("Write", { file_path: join(dir, "nota.md"), content: "x" }, dir);
  const end = run("hooks/journal.mjs", { hook_event_name: "SessionEnd" }, dir);
  const row = rows(dir).at(-1);
  return [
    end.code === 0 && row.event === "session_end" && /never uploaded/.test(end.err) && /journal-sync\.mjs --stage/.test(end.err),
    `exit ${end.code}; last event=${row?.event}; warned=${/never uploaded/.test(end.err)}`,
  ];
});

check("bootstrap emits valid hook JSON naming the bound company and the plugin root", () => {
  const r = run("hooks/bootstrap.mjs", { hook_event_name: "SessionStart" }, CO_A, { CLAUDE_PLUGIN_ROOT: ROOT });
  let ctx = "";
  try {
    ctx = JSON.parse(r.out).hookSpecificOutput.additionalContext;
  } catch {}
  return [r.code === 0 && ctx.includes("Company A") && ctx.includes("Plugin root:"), `exit ${r.code}; ${ctx.slice(0, 80)}`];
});

/**
 * The session title is the only announcement of the binding that survives after the first reply
 * scrolls away, so it is the surface that catches an operator working the wrong window. Asserting
 * its absence when nothing is bound matters just as much: a generic title would displace the one
 * the session names for itself and would read as a binding that does not exist.
 */
check("bootstrap titles the session with the bound company, and titles nothing when none is bound", () => {
  const bound = run("hooks/bootstrap.mjs", { hook_event_name: "SessionStart" }, CO_A, { CLAUDE_PLUGIN_ROOT: ROOT });
  const loose = run("hooks/bootstrap.mjs", { hook_event_name: "SessionStart" }, SANDBOX, { CLAUDE_PLUGIN_ROOT: ROOT });
  const titleOf = (r) => {
    try {
      return JSON.parse(r.out).hookSpecificOutput.sessionTitle;
    } catch {
      return undefined;
    }
  };
  const a = titleOf(bound);
  const b = titleOf(loose);
  return [
    typeof a === "string" && a.includes("Company A") && b === undefined,
    `bound title ${JSON.stringify(a)}; unbound title ${JSON.stringify(b)}`,
  ];
});

/**
 * Announced once by the hook rather than repeated in twenty skills — the same reason the plugin root
 * is. It has to reach every skill, including the ones no shared doctrine file is wired into, and a
 * rule stated per-skill is paid for on every invocation and drifts between wordings.
 *
 * Both halves are asserted because they pull opposite ways: the operator is answered in the language
 * they wrote in, and the company's documents keep the language its manifest declares regardless.
 * Losing the second half would let one English message turn a client's deliverable into English.
 */
check("bootstrap states the language rule, for the operator and for the documents separately", () => {
  const r = run("hooks/bootstrap.mjs", { hook_event_name: "SessionStart" }, CO_A, { CLAUDE_PLUGIN_ROOT: ROOT });
  let ctx = "";
  try {
    ctx = JSON.parse(r.out).hookSpecificOutput.additionalContext;
  } catch {}
  return [
    /language they wrote to you in/.test(ctx) && /documents keep the language its \.company\.json declares/.test(ctx),
    ctx.slice(0, 140),
  ];
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
