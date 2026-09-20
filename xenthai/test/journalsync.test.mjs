import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * `tools/journal-sync.mjs` — the journal reaching the client's store, and what still owes it.
 *
 * The failure behind this suite is not a crash. A cloud container's disk is destroyed when the
 * session ends, the journal is written to it, and nothing anywhere said so: three days of an
 * engagement disappeared, and the two tools built on the journal went on refusing with a sentence
 * that reads as "this engagement is young".
 *
 * So the cases here are about evidence, not plumbing. A receipt must never claim rows that were not
 * uploaded; a restore must never delete rows the store does not have; a month rewritten rather than
 * appended to must be loud. Each one is a way of ending up with a client's audit trail that is
 * wrong rather than absent, which is worse.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TOOL = join(ROOT, "tools", "journal-sync.mjs");
const HOOK = join(ROOT, "hooks", "journal.mjs");
const SANDBOX = join(HERE, "sandbox", "journalsync");

const MONTH = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" })
  .format(new Date())
  .slice(0, 7);

const run = (...args) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf8", cwd: SANDBOX });
  return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
};

const company = (name, { binding = null } = {}) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({
      schema_version: 1,
      id: `${name}-1`,
      name: `Prueba ${name}`,
      locale: "es-MX",
      timezone: "America/Mexico_City",
      ...(binding ? { binding } : {}),
      store: { kind: "drive", root: "1STOREROOTXXXXXXXXXXXXXXXXXXXXXX" },
    })
  );
  return dir;
};

/** Rows written the way they are really written — through the hook — so the shape is never a fixture. */
const act = (dir, n = 1) => {
  for (let i = 0; i < n; i++) {
    spawnSync(process.execPath, [HOOK], {
      input: JSON.stringify({
        cwd: dir,
        hook_event_name: "PostToolUse",
        tool_name: "Edit",
        tool_input: { file_path: join(dir, `doc-${i}.md`) },
      }),
      encoding: "utf8",
      cwd: dir,
    });
  }
};

const monthFile = (dir) => join(dir, "journal", "execution", `${MONTH}.jsonl`);
const rowCount = (dir) => (existsSync(monthFile(dir)) ? readFileSync(monthFile(dir), "utf8").split("\n").filter(Boolean).length : 0);
const receipt = (dir) => {
  const path = join(dir, "journal", "sync", `${MONTH}.json`);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
};

/** The staged files of one month, in upload order, with the size each holds on disk. */
const stagedFiles = (dir, staged) => {
  const names = staged.parts ? staged.parts.map((p) => p.name) : [staged.name];
  return names.map((name) => ({ name, size: statSync(join(dir, "journal", "outbox", name)).size }));
};

/**
 * One full round trip, as the doctor skill walks it: stage, "upload", receipt. The receipt carries
 * the size the store reports per file; here the store is imagined to hold exactly what was staged,
 * unless `sizeOf` says otherwise.
 */
const syncOnce = (dir, fileId = "1STOREFILEID", sizeOf = (size) => size) => {
  const staged = run("--company", dir, "--stage", "--json");
  const first = JSON.parse(staged.out).staged.find((s) => s.month === MONTH);
  const ids = first ? stagedFiles(dir, first).map((f, i) => `${i ? `${fileId}-${i + 1}` : fileId}:${sizeOf(f.size)}`).join(",") : fileId;
  const written = run("--company", dir, "--receipt", "--month", MONTH, "--file-id", ids);
  return { staged, written, first };
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("--help exits 0 and says the upload is not done here", () => {
  const r = run("--help");
  return [r.code === 0 && /no connector credentials/i.test(r.out), `exit ${r.code}`];
});

check("rows written by the hook are reported as owed to the store", () => {
  const dir = company("owed");
  act(dir, 3);
  const status = run("--company", dir);
  const gate = run("--company", dir, "--check");
  return [
    status.code === 0 && /owed\s+3/.test(status.out) && gate.code === 1 && /only on this machine/.test(gate.out),
    `status: ${status.out.trim().split("\n").at(-1)}; check exit ${gate.code}`,
  ];
});

/**
 * The one ordering that makes the whole thing converge. A delivery row written AFTER the freeze
 * would not be inside the bytes it describes, so every sync would leave the month one row short and
 * `--check` would report work owed for ever — on an ephemeral binding that means `doctor` is
 * permanently red, which is how a check stops being read.
 */
check("after a full round trip nothing is owed, because the staging row is inside the staged bytes", () => {
  const dir = company("roundtrip");
  act(dir, 2);
  syncOnce(dir);
  const gate = run("--company", dir, "--check");
  const rows = rowCount(dir);
  const last = receipt(dir).revisions.at(-1);
  return [
    gate.code === 0 && last.rows === rows && last.file_id === "1STOREFILEID" && /^sha256:[0-9a-f]{64}$/.test(last.digest),
    `check exit ${gate.code}; receipt rows ${last?.rows} of ${rows} local`,
  ];
});

check("the staged copy is removed once its receipt exists, so there is one copy of the truth locally", () => {
  const dir = company("outbox");
  act(dir, 1);
  syncOnce(dir);
  const outbox = join(dir, "journal", "outbox");
  const left = existsSync(outbox) ? readFileSync : null;
  return [
    !existsSync(join(outbox, `${MONTH}.rev-001.jsonl`)),
    left ? "outbox emptied" : "no outbox",
  ];
});

/**
 * A receipt is written from the frozen bytes and never from the live file, so it cannot record a
 * row count that was never uploaded. Without the freeze, work done between staging and the receipt
 * would be marked as delivered while sitting only on a disk that is about to be destroyed.
 */
check("a receipt with nothing staged is refused rather than believed", () => {
  const dir = company("no-stage");
  act(dir, 1);
  const r = run("--company", dir, "--receipt", "--month", MONTH, "--file-id", "1X");
  return [r.code === 2 && /nothing staged/.test(r.err) && receipt(dir) === null, `exit ${r.code}`];
});

check("a receipt without a store id is refused: an upload nobody can point at is not a delivery", () => {
  const dir = company("no-id");
  act(dir, 1);
  run("--company", dir, "--stage");
  const r = run("--company", dir, "--receipt", "--month", MONTH);
  return [r.code === 2 && /--file-id/.test(r.err), `exit ${r.code}`];
});

/**
 * The measured failure: a file the store holds at 22% of its size while the connector reported
 * success. A receipt that only hashed the local staged bytes settled that month. The size the store
 * reports is the one fact about its copy a session can read for free, so the receipt demands it and
 * refuses when it differs.
 */
check("a receipt whose store size differs from the staged bytes is refused, and nothing is settled", () => {
  const dir = company("wrong-size");
  act(dir, 2);
  const { written } = syncOnce(dir, "1TRUNCATED", (size) => Math.floor(size * 0.22));
  const gate = run("--company", dir, "--check");
  return [
    written.code === 2 && /staged \d+ bytes, store reports \d+/.test(written.err) && receipt(dir) === null && gate.code === 1,
    `receipt exit ${written.code}; receipt file: ${receipt(dir) === null ? "none" : "written"}; check exit ${gate.code}`,
  ];
});

check("a receipt whose id carries no size is refused and says where the size comes from", () => {
  const dir = company("no-size");
  act(dir, 1);
  run("--company", dir, "--stage");
  const r = run("--company", dir, "--receipt", "--month", MONTH, "--file-id", "1BARE");
  return [r.code === 2 && /<id>:<size>/.test(r.err) && /fileSize/.test(r.err) && receipt(dir) === null, `exit ${r.code}`];
});

/**
 * Only the first revision is the whole month. Everything after it is the rows the store does not
 * have yet, named after the row count the previous receipt settled — so the bytes a sync uploads
 * stop growing with the month.
 */
check("rows written after a sync are owed again, and the next revision is a delta after the settled rows", () => {
  const dir = company("second-rev");
  act(dir, 1);
  const { first } = syncOnce(dir);
  act(dir, 1);
  const gate = run("--company", dir, "--check");
  const staged = run("--company", dir, "--stage");
  return [
    gate.code === 1 && new RegExp(`rev-002\\.delta-after-${first.rows}\\.jsonl`).test(staged.out),
    `check exit ${gate.code}; staged ${/rev-(\d+)\S*\.jsonl/.exec(staged.out)?.[0]}`,
  ];
});

/**
 * A month file is appended to and never rewritten, so the rows already uploaded must still be its
 * first rows. When they are not, something replaced it — a bad restore, a hand edit, two engagements
 * sharing a directory — and no upload repairs that. Exit 3 is its own code because it is a defect in
 * the evidence rather than work outstanding.
 */
check("a month rewritten rather than appended to is refused with its own exit code, never uploaded over", () => {
  const dir = company("diverged");
  act(dir, 2);
  syncOnce(dir);
  writeFileSync(monthFile(dir), '{"event":"ai_action","why":"not what was uploaded"}\n', "utf8");
  const gate = run("--company", dir, "--check");
  const staged = run("--company", dir, "--stage");
  return [
    gate.code === 3 && staged.code === 3 && /appended to, never rewritten/.test(gate.err + staged.err),
    `check exit ${gate.code}; stage exit ${staged.code}`,
  ];
});

check("a fresh container restores the months the store holds, and reports nothing owed after", () => {
  const source = company("restore-source");
  act(source, 3);
  syncOnce(source);
  const downloads = join(SANDBOX, "downloads");
  rmSync(downloads, { recursive: true, force: true });
  mkdirSync(downloads, { recursive: true });
  writeFileSync(join(downloads, `${MONTH}.rev-001.jsonl`), readFileSync(monthFile(source)));

  const fresh = company("restore-fresh", { binding: "ephemeral" });
  const restored = run("--company", fresh, "--restore", "--from", downloads);
  const gate = run("--company", fresh, "--check");
  return [
    restored.code === 0 && gate.code === 0 && rowCount(fresh) === rowCount(source),
    `restore exit ${restored.code}; ${rowCount(fresh)} rows restored of ${rowCount(source)}`,
  ];
});

/**
 * The one outcome this whole tool exists to prevent, arriving through the tool itself. A restore
 * that overwrote a month holding rows the store does not have would delete the only copy, which is
 * exactly the loss being fixed — so it refuses rather than merging: a merge would have to interleave
 * rows written by two sessions, and no ordering it invented would be evidence.
 */
check("a restore that would delete local rows the store does not have is refused", () => {
  const source = company("keep-source");
  act(source, 2);
  syncOnce(source);
  const downloads = join(SANDBOX, "downloads-keep");
  rmSync(downloads, { recursive: true, force: true });
  mkdirSync(downloads, { recursive: true });
  writeFileSync(join(downloads, `${MONTH}.rev-001.jsonl`), readFileSync(monthFile(source)));

  const local = company("keep-local");
  act(local, 4);
  const before = readFileSync(monthFile(local), "utf8");
  const r = run("--company", local, "--restore", "--from", downloads);
  return [
    r.code === 1 && /REFUSED/.test(r.out) && readFileSync(monthFile(local), "utf8") === before,
    `exit ${r.code}; local bytes untouched: ${readFileSync(monthFile(local), "utf8") === before}`,
  ];
});

/**
 * The sentence `opportunities` and `report` were missing. A month in the store and not on this
 * machine looks exactly like a month that never happened, and telling a client to come back when
 * there is more history is telling them to wait for data they already own.
 */
check("months the store holds and this machine does not are reported as restorable, not as absent", () => {
  const dir = company("stored-only");
  act(dir, 1);
  mkdirSync(join(dir, "journal", "sync"), { recursive: true });
  writeFileSync(
    join(dir, "journal", "sync", "2026-01.json"),
    JSON.stringify({
      schema: 1,
      month: "2026-01",
      company: "stored-only-1",
      revisions: [{ rev: 1, name: "2026-01.rev-001.jsonl", rows: 40, bytes: 900, digest: "sha256:x", file_id: "1OLD", at: "2026-02-01T00:00:00Z" }],
    })
  );
  const status = run("--company", dir);
  const opportunities = spawnSync(process.execPath, [join(ROOT, "tools", "opportunities.mjs"), "--journal", dir], { encoding: "utf8" });
  const said = opportunities.stdout + opportunities.stderr;
  return [
    /in the store, not on this machine/.test(status.out) && /2026-01/.test(said) && /--restore/.test(said),
    `status names it: ${/not on this machine/.test(status.out)}; opportunities names the month and the restore: ${/2026-01/.test(said)}/${/--restore/.test(said)}`,
  ];
});

/**
 * The practice-facing cost line. A month's receipts already know how many times it went up and how
 * many bytes that took; before this the status printed rows only, and the operator estimating what
 * an engagement's journal costs to keep had to open the receipt files by hand. The client report
 * deliberately does not carry bytes. A schema-1 entry has no `uploaded` and is the whole month, so
 * its `bytes` is the figure — asserted here so the fallback is proven rather than assumed.
 */
/**
 * A schema-2 entry's `bytes` is the whole month even when the entry is a delta, so summing it
 * double-counts; what that schema does carry is the store-confirmed size per file. A restored entry
 * uploaded nothing from this machine. Both fallbacks are asserted, because the wrong one printed a
 * plausible number.
 */
check("uploaded bytes for a schema-2 receipt come from the confirmed sizes, and a restored entry adds nothing", () => {
  const dir = company("cost-schema2");
  mkdirSync(join(dir, "journal", "sync"), { recursive: true });
  writeFileSync(
    join(dir, "journal", "sync", "2026-02.json"),
    JSON.stringify({
      schema: 2,
      month: "2026-02",
      revisions: [
        { rev: 1, kind: "full", after: null, rows: 4, bytes: 638, size: 638, file_id: "1A", at: "2026-02-01T00:00:00Z" },
        { rev: 2, kind: "delta", after: 4, rows: 8, bytes: 1276, size: 638, file_id: "1B", at: "2026-02-02T00:00:00Z" },
        { rev: 3, kind: "delta", after: 8, rows: 10, bytes: 1500, size: null, parts: [{ part: 1, of: 2, size: 120 }, { part: 2, of: 2, size: 104 }], file_id: ["1C", "1D"], at: "2026-02-03T00:00:00Z" },
      ],
    })
  );
  writeFileSync(
    join(dir, "journal", "sync", "2026-03.json"),
    JSON.stringify({ schema: 3, month: "2026-03", revisions: [{ rev: 5, kind: "full", rows: 9, bytes: 2000, uploaded: null, size: null, restored: true, at: "2026-03-01T00:00:00Z" }] })
  );
  const months = JSON.parse(run("--company", dir, "--json").out).months;
  const feb = months.find((m) => m.month === "2026-02");
  const mar = months.find((m) => m.month === "2026-03");
  return [feb?.uploadedBytes === 638 + 638 + 224 && feb?.revisions === 3 && mar?.uploadedBytes === 0 && mar?.revisions === 1, `feb=${feb?.uploadedBytes} (want 1500) mar=${mar?.uploadedBytes} (want 0)`];
});

check("status reports per month how many revisions were receipted and how many bytes went up, from the receipts", () => {
  const dir = company("cost");
  act(dir, 2);
  syncOnce(dir);
  act(dir, 1);
  syncOnce(dir, "1SECOND");
  const whole = statSync(monthFile(dir)).size;
  writeFileSync(
    join(dir, "journal", "sync", "2026-01.json"),
    JSON.stringify({ schema: 1, month: "2026-01", company: "cost-1", revisions: [{ rev: 1, name: "2026-01.rev-001.jsonl", rows: 40, bytes: 900, digest: "sha256:x", file_id: "1OLD", at: "2026-02-01T00:00:00Z" }] })
  );
  const text = run("--company", dir);
  const json = JSON.parse(run("--company", dir, "--json").out).months;
  const current = json.find((m) => m.month === MONTH);
  const old = json.find((m) => m.month === "2026-01");
  return [
    current?.revisions === 2 &&
      current?.uploadedBytes === whole &&
      old?.revisions === 1 &&
      old?.uploadedBytes === 900 &&
      new RegExp(`${MONTH}.*revs\\s+2\\s+uploaded\\s+${whole} B`).test(text.out) &&
      /2026-01.*revs\s+1\s+uploaded\s+900 B/.test(text.out),
    `current revs=${current?.revisions} uploaded=${current?.uploadedBytes} of ${whole} B on disk; schema-1 month revs=${old?.revisions} uploaded=${old?.uploadedBytes}`,
  ];
});

check("no company bound exits 2 rather than guessing which engagement this is", () => {
  const r = run("--check");
  return [r.code === 2 && /no company bound/.test(r.err), `exit ${r.code}`];
});

check("an unknown option and a malformed month are refused instead of widening the run", () => {
  const dir = company("args");
  const bad = run("--company", dir, "--upload");
  const month = run("--company", dir, "--month", "septiembre");
  return [bad.code === 2 && month.code === 2 && /YYYY-MM/.test(month.err), `exits ${bad.code}, ${month.code}`];
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
