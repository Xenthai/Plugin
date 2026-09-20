import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Delta revisions, end to end: the first revision of a month is the whole month, every later one is
 * only the rows since the last receipt, and `--restore` chains them back into one byte-identical
 * month.
 *
 * The property under test is the one that made whole-month revisions unaffordable: a sync used to
 * re-upload the entire month, re-split into parts whose names all changed, so thirty new rows cost
 * twenty-seven files and most of an hour. With deltas a sync uploads what is new and nothing else —
 * and every guarantee the whole-month shape gave has to survive: a receipt that cannot claim rows
 * the store does not hold, a gap or a mismatched base refused by name, a file that arrived damaged
 * told apart from a short one, and the old spelling still restorable, because the months already in
 * the store were written in it.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TOOL = join(ROOT, "tools", "journal-sync.mjs");
const HOOK = join(ROOT, "hooks", "journal.mjs");
const SANDBOX = join(HERE, "sandbox", "journaldelta");

const MONTH = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" })
  .format(new Date())
  .slice(0, 7);

const sha = (b) => `sha256:${createHash("sha256").update(b).digest("hex")}`;

const run = (...args) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf8", cwd: SANDBOX });
  return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
};

const runRaw = (...args) => spawnSync(process.execPath, [TOOL, ...args], { cwd: SANDBOX });

const company = (name) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({
      schema_version: 1,
      id: `${name}-1`,
      name: `Prueba ${name}`,
      binding: "ephemeral",
      store: { kind: "drive", root: "1STOREROOTXXXXXXXXXXXXXXXXXXXXXX" },
    })
  );
  return dir;
};

/** Rows written the way they are really written — through the hook — so the shape is never a fixture. */
const act = (dir, n = 1) => {
  for (let i = 0; i < n; i++) {
    spawnSync(process.execPath, [HOOK], {
      input: JSON.stringify({ cwd: dir, hook_event_name: "PostToolUse", tool_name: "Edit", tool_input: { file_path: join(dir, `doc-${i}.md`) } }),
      encoding: "utf8",
      cwd: dir,
    });
  }
};

const monthFile = (dir) => join(dir, "journal", "execution", `${MONTH}.jsonl`);
const outbox = (dir) => join(dir, "journal", "outbox");
const receipt = (dir) => {
  const path = join(dir, "journal", "sync", `${MONTH}.json`);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
};

/**
 * These sandboxes declare an ephemeral binding, so a month with no receipt has to say it has never
 * been uploaded before rev-001 may be staged. Every helper here passes that, and one case below
 * asserts the refusal itself.
 */
const stage = (dir, ...extra) => {
  const r = run("--company", dir, "--stage", "--json", "--first-revision", ...extra);
  return { ...r, first: r.code === 0 ? JSON.parse(r.out).staged.find((s) => s.month === MONTH) : null };
};

const stagedNames = (staged) => (staged.parts ? staged.parts.map((p) => p.name) : [staged.name]);

/** Settles the staged revision as if the store held exactly what was staged, copying the files into `store` on the way. */
const settle = (dir, staged, store, idPrefix = "id") => {
  const names = stagedNames(staged);
  const ids = names.map((name, i) => {
    if (store) cpSync(join(outbox(dir), name), join(store, name));
    return `${idPrefix}-${staged.rev}-${i + 1}:${statSync(join(outbox(dir), name)).size}`;
  });
  return run("--company", dir, "--receipt", "--month", MONTH, "--file-id", ids.join(","));
};

const freshStore = (name) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  return dir;
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("the second revision is one delta file holding only the rows since the receipt", () => {
  const dir = company("delta-shape");
  act(dir, 3);
  const first = stage(dir).first;
  settle(dir, first, null);
  act(dir, 2);
  const second = stage(dir).first;
  const names = stagedNames(second);
  const bytes = readFileSync(join(outbox(dir), names[0]));
  const whole = readFileSync(monthFile(dir));
  return [
    second.kind === "delta" &&
      second.after === first.rows &&
      names.length === 1 &&
      names[0] === `${MONTH}.rev-002.delta-after-${first.rows}.jsonl` &&
      second.upload_rows === 3 &&
      whole.subarray(whole.length - bytes.length).equals(bytes),
    `kind=${second.kind} after=${second.after} of ${first.rows}; files=${names.join(",")}; uploaded ${second.upload_rows} row(s)`,
  ];
});

check("after a delta round trip nothing is owed, and the receipt carries the whole month's digest", () => {
  const dir = company("delta-roundtrip");
  act(dir, 2);
  settle(dir, stage(dir).first, null);
  act(dir, 4);
  const written = settle(dir, stage(dir).first, null);
  const gate = run("--company", dir, "--check");
  const last = receipt(dir).revisions.at(-1);
  const local = readFileSync(monthFile(dir));
  return [
    written.code === 0 && gate.code === 0 && last.kind === "delta" && last.rows === local.toString().split("\n").filter(Boolean).length && last.digest === sha(local) && receipt(dir).schema === 3,
    `receipt exit ${written.code}; check exit ${gate.code}; last=${last?.kind} rows=${last?.rows} schema=${receipt(dir)?.schema}`,
  ];
});

/**
 * A delta only means something relative to the base it names, and the base is whatever the receipt
 * last settled. A staged delta whose base is not that row count is a delta cut from a history the
 * receipt does not know, so it is refused rather than concatenated onto the wrong prefix.
 */
check("a delta whose base is not the settled row count is refused at receipt time", () => {
  const dir = company("delta-base");
  act(dir, 2);
  const first = stage(dir).first;
  settle(dir, first, null);
  act(dir, 1);
  const second = stage(dir).first;
  const wrong = `${MONTH}.rev-002.delta-after-${first.rows - 1}.jsonl`;
  renameSync(join(outbox(dir), second.name), join(outbox(dir), wrong));
  const r = run("--company", dir, "--receipt", "--month", MONTH, "--file-id", `x:${statSync(join(outbox(dir), wrong)).size}`);
  return [r.code === 2 && /last receipt settled/.test(r.err) && receipt(dir).revisions.length === 1, `exit ${r.code}; revisions=${receipt(dir).revisions.length}`];
});

check("a whole month plus two deltas restores byte-identical, from the store's files alone", () => {
  const source = company("chain-source");
  const store = freshStore("chain-store");
  act(source, 3);
  settle(source, stage(source).first, store);
  act(source, 2);
  settle(source, stage(source).first, store);
  act(source, 5);
  settle(source, stage(source).first, store);
  const fresh = company("chain-fresh");
  const restored = run("--company", fresh, "--restore", "--from", store);
  const gate = run("--company", fresh, "--check");
  const same = existsSync(monthFile(fresh)) && readFileSync(monthFile(fresh)).equals(readFileSync(monthFile(source)));
  const entry = receipt(fresh)?.revisions.at(-1);
  return [
    restored.code === 0 && same && gate.code === 0 && entry?.rev === 3 && entry?.restored === true && readdirSync(store).length === 3,
    `restore exit ${restored.code}; byte-identical=${same}; check exit ${gate.code}; rev=${entry?.rev}; store files=${readdirSync(store).length}`,
  ];
});

check("a restored month continues with a delta after the restored row count", () => {
  const source = company("continue-source");
  const store = freshStore("continue-store");
  act(source, 2);
  settle(source, stage(source).first, store);
  act(source, 2);
  settle(source, stage(source).first, store);
  const fresh = company("continue-fresh");
  run("--company", fresh, "--restore", "--from", store);
  const rows = readFileSync(monthFile(fresh)).toString().split("\n").filter(Boolean).length;
  act(fresh, 1);
  const next = stage(fresh).first;
  return [next?.rev === 3 && next?.kind === "delta" && next?.after === rows, `rev=${next?.rev} kind=${next?.kind} after=${next?.after} of ${rows}`];
});

/**
 * The three ways a store's folder can hold a history this tool cannot vouch for, each refused by
 * name rather than concatenated into a month that still parses.
 */
check("a missing revision between the base and the newest delta is refused, naming it", () => {
  const source = company("gap-source");
  const store = freshStore("gap-store");
  act(source, 2);
  settle(source, stage(source).first, store);
  act(source, 1);
  settle(source, stage(source).first, store);
  act(source, 1);
  settle(source, stage(source).first, store);
  for (const n of readdirSync(store)) if (/rev-002/.test(n)) rmSync(join(store, n));
  const fresh = company("gap-fresh");
  const r = run("--company", fresh, "--restore", "--from", store);
  return [r.code === 1 && /REFUSED/.test(r.out) && /revision 2 is missing/.test(r.out) && !existsSync(monthFile(fresh)), `exit ${r.code}; ${r.out.split("\n").find((l) => /REFUSED/.test(l))}`];
});

check("a delta whose named base disagrees with the rows before it is refused", () => {
  const source = company("base-source");
  const store = freshStore("base-store");
  act(source, 2);
  settle(source, stage(source).first, store);
  act(source, 1);
  settle(source, stage(source).first, store);
  const delta = readdirSync(store).find((n) => /delta-after-(\d+)/.test(n));
  const after = Number(/delta-after-(\d+)/.exec(delta)[1]);
  renameSync(join(store, delta), join(store, delta.replace(`delta-after-${after}`, `delta-after-${after + 1}`)));
  const fresh = company("base-fresh");
  const r = run("--company", fresh, "--restore", "--from", store);
  return [r.code === 1 && /follows \d+ rows but the revisions before it hold \d+/.test(r.out) && !existsSync(monthFile(fresh)), `exit ${r.code}`];
});

check("a delta that arrived truncated mid-row is refused as not whole rows", () => {
  const source = company("cut-source");
  const store = freshStore("cut-store");
  act(source, 2);
  settle(source, stage(source).first, store);
  act(source, 2);
  settle(source, stage(source).first, store);
  const delta = readdirSync(store).find((n) => /delta-after/.test(n));
  const bytes = readFileSync(join(store, delta));
  writeFileSync(join(store, delta), bytes.subarray(0, Math.floor(bytes.length * 0.22)));
  const fresh = company("cut-fresh");
  const r = run("--company", fresh, "--restore", "--from", store);
  return [r.code === 1 && /not whole rows/.test(r.out) && !existsSync(monthFile(fresh)), `exit ${r.code}`];
});

/**
 * The months already in the store were written before deltas existed: whole-month revisions, some
 * in parts, settled by schema-1 receipts. They are not re-uploaded and they restore as they always
 * did, and the first delta after them names the row count their last revision settled.
 */
check("a folder of whole-month revisions in the old scheme still restores, taking the highest", () => {
  const dir = company("old-scheme");
  act(dir, 3);
  const store = freshStore("old-store");
  const rows = readFileSync(monthFile(dir));
  writeFileSync(join(store, `${MONTH}.rev-001.jsonl`), rows.subarray(0, rows.indexOf(0x0a) + 1));
  writeFileSync(join(store, `${MONTH}.rev-002.jsonl`), rows);
  const fresh = company("old-fresh");
  const r = run("--company", fresh, "--restore", "--from", store);
  const entry = receipt(fresh)?.revisions.at(-1);
  return [r.code === 0 && readFileSync(monthFile(fresh)).equals(rows) && entry?.rev === 2 && entry?.kind === "full", `exit ${r.code}; rev=${entry?.rev} kind=${entry?.kind}`];
});

check("a whole-month revision above earlier deltas becomes the new base, and deltas after it chain from it", () => {
  const dir = company("rebase");
  act(dir, 4);
  const store = freshStore("rebase-store");
  const rows = readFileSync(monthFile(dir));
  const ends = [];
  for (let i = 0; i < rows.length; i++) if (rows[i] === 0x0a) ends.push(i + 1);
  writeFileSync(join(store, `${MONTH}.rev-001.jsonl`), rows.subarray(0, ends[0]));
  writeFileSync(join(store, `${MONTH}.rev-002.delta-after-1.jsonl`), rows.subarray(ends[0], ends[1]));
  writeFileSync(join(store, `${MONTH}.rev-003.jsonl`), rows.subarray(0, ends[2]));
  writeFileSync(join(store, `${MONTH}.rev-004.delta-after-3.jsonl`), rows.subarray(ends[2]));
  const fresh = company("rebase-fresh");
  const r = run("--company", fresh, "--restore", "--from", store);
  return [r.code === 0 && readFileSync(monthFile(fresh)).equals(rows) && /from 2 file\(s\)/.test(r.out), `exit ${r.code}; ${r.out.trim().split("\n")[0]}`];
});

check("a delta over the budget is split into parts that carry the base and the total in their names", () => {
  const dir = company("delta-parts");
  act(dir, 1);
  settle(dir, stage(dir).first, null);
  act(dir, 12);
  const second = stage(dir, "--shard-bytes", "1024").first;
  const names = stagedNames(second);
  return [
    names.length > 1 && names.every((n) => new RegExp(`^${MONTH}\\.rev-002\\.delta-after-${second.after}\\.part-\\d{2}-of-${String(names.length).padStart(2, "0")}\\.jsonl$`).test(n)),
    names.join(" "),
  ];
});

/**
 * What the transport hook copies. Claude Code strips trailing whitespace from a Bash call's stdout
 * before a hook sees it, so the bytes are printed without their final newline and the hook appends
 * one; either way the file the connector receives is the staged file exactly.
 */
check("--emit prints a staged file's bytes minus the final newline, and nothing else", () => {
  const dir = company("emit");
  act(dir, 2);
  const first = stage(dir).first;
  const staged = readFileSync(join(outbox(dir), first.name));
  const r = runRaw("--company", dir, "--emit", first.name);
  const printed = r.stdout;
  return [
    r.status === 0 && Buffer.concat([printed, Buffer.from("\n")]).equals(staged) && r.stderr.length === 0,
    `exit ${r.status}; ${printed.length}+1 of ${staged.length} bytes; stderr ${r.stderr.length} bytes`,
  ];
});

check("--emit refuses a name that is not a staged revision file, including a path", () => {
  const dir = company("emit-refuse");
  act(dir, 1);
  stage(dir);
  const other = run("--company", dir, "--emit", "../.company.json");
  const missing = run("--company", dir, "--emit", `${MONTH}.rev-009.jsonl`);
  return [other.code === 2 && missing.code === 2 && /not staged/.test(missing.err), `exits ${other.code}, ${missing.code}`];
});

rmSync(SANDBOX, { recursive: true, force: true });
mkdirSync(SANDBOX, { recursive: true });

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
