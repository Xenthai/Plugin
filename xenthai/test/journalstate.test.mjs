import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The revision chain surviving a machine that does not.
 *
 * `journal/sync/<month>.json` holds which revision came last and how many rows it settled. On an
 * ephemeral binding that file dies with the container, so the next session read "no revisions",
 * proposed `rev-001`, and uploaded it into a folder that already held a `rev-001` from the previous
 * container — two different files with one name, and a month that can no longer be rebuilt. That is
 * the failure these cases are about, and it is corruption rather than cost: nothing errored, the
 * upload succeeded, and the damage is only visible months later to whoever tries to read the history.
 *
 * Two halves, and both are needed. The chain's state is uploaded beside the rows, so a fresh machine
 * can adopt it for about 2 KB instead of downloading 600 KB of history it already stored. And until
 * it does, staging a first revision on such a binding is refused, because "I have no receipt" and
 * "this month was never uploaded" are the same observation from here and have opposite consequences.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TOOL = join(ROOT, "tools", "journal-sync.mjs");
const HOOK = join(ROOT, "hooks", "journal.mjs");
const SANDBOX = join(HERE, "sandbox", "journalstate");

const MONTH = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" })
  .format(new Date())
  .slice(0, 7);

const run = (...args) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf8", cwd: SANDBOX });
  return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
};

const runRaw = (...args) => spawnSync(process.execPath, [TOOL, ...args], { cwd: SANDBOX });

const company = (name, { binding = "ephemeral" } = {}) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({
      schema_version: 1,
      id: `${name}-1`,
      name: `Prueba ${name}`,
      ...(binding ? { binding } : {}),
      store: { kind: "drive", root: "1STOREROOTXXXXXXXXXXXXXXXXXXXXXX" },
    })
  );
  return dir;
};

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
const receiptFile = (dir) => join(dir, "journal", "sync", `${MONTH}.json`);
const receipt = (dir) => (existsSync(receiptFile(dir)) ? JSON.parse(readFileSync(receiptFile(dir), "utf8")) : null);

const stage = (dir, ...extra) => {
  const r = run("--company", dir, "--stage", "--json", ...extra);
  return { ...r, first: r.code === 0 ? JSON.parse(r.out).staged.find((s) => s.month === MONTH) : null };
};

const stagedNames = (staged) => (staged.parts ? staged.parts.map((p) => p.name) : [staged.name]);

/** Settles the staged revision as the store would, and copies what was uploaded into `store`. */
const settle = (dir, staged, store) => {
  const names = stagedNames(staged);
  const ids = names.map((name, i) => {
    if (store) cpSync(join(outbox(dir), name), join(store, name));
    return `id-${staged.rev}-${i + 1}:${statSync(join(outbox(dir), name)).size}`;
  });
  const written = run("--company", dir, "--receipt", "--month", MONTH, "--file-id", ids.join(","));
  if (store && written.code === 0) {
    cpSync(receiptFile(dir), join(store, `${MONTH}.sync.rev-${String(staged.rev).padStart(3, "0")}.json`));
  }
  return written;
};

const freshStore = (name) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  return dir;
};

/** A company that has synced twice, with everything it uploaded sitting in `store`. */
const seeded = (name, rows = [3, 2]) => {
  const dir = company(`${name}-source`);
  const store = freshStore(`${name}-store`);
  let first = true;
  for (const n of rows) {
    act(dir, n);
    const staged = stage(dir, ...(first ? ["--first-revision"] : [])).first;
    settle(dir, staged, store);
    first = false;
  }
  return { dir, store, rows: receipt(dir).revisions.at(-1).rows };
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

/**
 * The acceptance case, and the one that was corrupting histories: a container with no journal at
 * all, holding only the 2 KB state file, continues the chain at the right revision and the right
 * base instead of proposing rev-001 over a name the store already holds.
 */
check("a fresh container adopts the state file alone and continues the chain, downloading no history", () => {
  const { store, rows } = seeded("adopt");
  const state = readdirSync(store).filter((n) => /\.sync\.rev-\d+\.json$/.test(n)).sort().at(-1);
  const fresh = company("adopt-fresh");
  const adopted = run("--company", fresh, "--adopt-state", join(store, state));
  act(fresh, 10);
  const staged = stage(fresh);
  const settled = settle(fresh, staged.first, null);
  const gate = run("--company", fresh, "--check");
  return [
    adopted.code === 0 &&
      staged.first?.name === `${MONTH}.rev-003.delta-after-${rows}.jsonl` &&
      staged.first?.upload_rows === 11 &&
      settled.code === 0 &&
      gate.code === 0 &&
      !existsSync(join(fresh, "journal", "execution", "downloaded")),
    `adopt ${adopted.code}; staged ${staged.first?.name}; uploaded ${staged.first?.upload_rows} row(s); receipt ${settled.code}; check ${gate.code}`,
  ];
});

check("the adopted month's numbers are the month's, not this machine's", () => {
  const { store, rows } = seeded("numbers");
  const state = readdirSync(store).filter((n) => /\.sync\.rev-\d+\.json$/.test(n)).sort().at(-1);
  const fresh = company("numbers-fresh");
  run("--company", fresh, "--adopt-state", join(store, state));
  act(fresh, 4);
  const status = run("--company", fresh, "--json");
  const month = JSON.parse(status.out).months.find((m) => m.month === MONTH);
  return [
    month.carried === rows && month.rows === rows + 4 && month.synced === rows && month.owed === 4 && !month.diverged,
    `carried=${month?.carried} rows=${month?.rows} synced=${month?.synced} owed=${month?.owed}`,
  ];
});

/**
 * The digest a machine cannot compute is null rather than a hash of the fragment it happens to
 * hold: a month digest over a tail, presented as the month's, is exactly the kind of evidence that
 * looks right and is not. The chain is what such a machine can prove, so that is what it records.
 */
check("a receipt written after adopting carries no month digest, and carries a chain instead", () => {
  const { store } = seeded("digest");
  const state = readdirSync(store).filter((n) => /\.sync\.rev-\d+\.json$/.test(n)).sort().at(-1);
  const fresh = company("digest-fresh");
  run("--company", fresh, "--adopt-state", join(store, state));
  act(fresh, 2);
  settle(fresh, stage(fresh).first, null);
  const entry = receipt(fresh).revisions.at(-1);
  return [
    entry.digest === null && /^sha256:[0-9a-f]{64}$/.test(entry.chain) && entry.local.rows === 3 && entry.rows > entry.local.rows,
    `digest=${entry.digest} chain=${entry.chain?.slice(0, 20)} local=${entry.local?.rows} month=${entry.rows}`,
  ];
});

check("staging a first revision on an ephemeral binding is refused until somebody says the month was never uploaded", () => {
  const dir = company("unproven");
  act(dir, 2);
  const refused = run("--company", dir, "--stage");
  const nothingStaged = !existsSync(outbox(dir));
  const confirmed = run("--company", dir, "--stage", "--first-revision");
  return [
    refused.code === 4 &&
      /--adopt-state/.test(refused.err) &&
      /sync\.rev-<NNN>\.json/.test(refused.err) &&
      nothingStaged &&
      confirmed.code === 0,
    `refused ${refused.code} with nothing staged: ${nothingStaged}; confirmed ${confirmed.code}`,
  ];
});

check("a durable binding is not asked to confirm anything, and neither is an adopted month", () => {
  const durable = company("durable", { binding: null });
  act(durable, 2);
  const first = run("--company", durable, "--stage");
  const { store } = seeded("second-sync");
  const state = readdirSync(store).filter((n) => /\.sync\.rev-\d+\.json$/.test(n)).sort().at(-1);
  const fresh = company("second-sync-fresh");
  run("--company", fresh, "--adopt-state", join(store, state));
  act(fresh, 1);
  const after = run("--company", fresh, "--stage");
  return [first.code === 0 && after.code === 0, `durable ${first.code}; adopted ${after.code}`];
});

/**
 * Adopting a chain this machine is already part of would count its own history twice — once as
 * carried, once as its own rows — and every number after that would be wrong in the flattering
 * direction. Both ways that can happen are refused by name.
 */
check("adopting is refused when this machine already has the month, by receipt or by rows", () => {
  const { dir, store } = seeded("double");
  const state = readdirSync(store).filter((n) => /\.sync\.rev-\d+\.json$/.test(n)).sort().at(-1);
  const withReceipt = run("--company", dir, "--adopt-state", join(store, state));

  const rowsOnly = company("double-rows");
  cpSync(monthFile(dir), join(rowsOnly, "journal", "execution", `${MONTH}.jsonl`));
  const withRows = run("--company", rowsOnly, "--adopt-state", join(store, state));
  return [
    withReceipt.code === 2 &&
      /already in the chain/.test(withReceipt.err) &&
      withRows.code === 2 &&
      /already on this machine/.test(withRows.err) &&
      receipt(rowsOnly) === null,
    `receipt case ${withReceipt.code}; rows case ${withRows.code}`,
  ];
});

check("a file that is not a state file is refused rather than adopted as an empty chain", () => {
  const dir = company("garbage");
  const path = join(dir, "not-a-state.json");
  writeFileSync(path, JSON.stringify({ hello: "world" }));
  const notJson = run("--company", dir, "--adopt-state", join(dir, "missing.json"));
  const wrongShape = run("--company", dir, "--adopt-state", path);
  return [notJson.code === 2 && wrongShape.code === 2 && /state file/.test(wrongShape.err), `missing ${notJson.code}; wrong shape ${wrongShape.code}`];
});

/**
 * The state file goes up through the same transport as the rows, so the session pays nothing for
 * it: `--receipt` names it and `--emit` prints it byte for byte.
 */
check("--receipt names the state file with its size, and --emit prints the head revision alone", () => {
  const dir = company("emit-state");
  act(dir, 2);
  const staged = stage(dir, "--first-revision").first;
  const written = settle(dir, staged, null);
  const name = `${MONTH}.sync.rev-001.json`;
  const printed = runRaw("--company", dir, "--emit", name);
  const doc = JSON.parse(printed.stdout.toString("utf8"));
  const local = JSON.parse(readFileSync(receiptFile(dir), "utf8"));
  const stale = run("--company", dir, "--emit", `${MONTH}.sync.rev-009.json`);
  return [
    written.code === 0 &&
      written.out.includes(name) &&
      new RegExp(`${printed.stdout.length + 1} bytes`).test(written.out) &&
      printed.status === 0 &&
      doc.revisions.length === 1 &&
      doc.revisions[0].rev === local.revisions.at(-1).rev &&
      doc.revisions[0].rows === local.revisions.at(-1).rows &&
      doc.month === MONTH &&
      stale.code === 2,
    `receipt names it with its size: ${new RegExp(`${printed.stdout.length + 1} bytes`).test(written.out)}; emit ${printed.status}, ${printed.stdout.length}+1 bytes; stale name ${stale.code}`,
  ];
});

/**
 * The measured failure this shape exists for: the state file used to be the whole local receipt,
 * which at eleven revisions was 50 KB — past what a hook carries — and reached the store at 60% of
 * itself with every step reporting success. What travels now is one revision, so a month's history
 * cannot push it over the channel however long the month runs.
 */
check("the state file stays small as revisions pile up, and nothing over the transport's budget is ever printed", () => {
  const dir = company("state-size");
  act(dir, 2);
  settle(dir, stage(dir, "--first-revision").first, null);
  for (let i = 0; i < 11; i++) {
    act(dir, 2);
    settle(dir, stage(dir).first, null);
  }
  const printed = runRaw("--company", dir, "--emit", `${MONTH}.sync.rev-012.json`);
  const historyBytes = statSync(receiptFile(dir)).size;

  act(dir, 40);
  const big = stage(dir).first;
  const oversized = run("--company", dir, "--emit", big.name, "--shard-bytes", "1024");
  return [
    printed.status === 0 &&
      printed.stdout.length < 2000 &&
      historyBytes > printed.stdout.length * 3 &&
      JSON.parse(printed.stdout.toString("utf8")).revisions.length === 1 &&
      oversized.code === 2 &&
      /transport carries/.test(oversized.err),
    `12 revisions: state ${printed.stdout.length} bytes against a ${historyBytes}-byte local receipt; oversized emit ${oversized.code}`,
  ];
});

/**
 * A machine that adopted holds a window into the month, not its beginning. Restoring the full
 * history onto it must still refuse to lose rows — and must not refuse the ordinary case, which a
 * prefix comparison would have done for ever.
 */
check("restoring the full history onto a machine that adopted is allowed, and still refuses to lose its rows", () => {
  const { store, dir: source } = seeded("restore");
  const state = readdirSync(store).filter((n) => /\.sync\.rev-\d+\.json$/.test(n)).sort().at(-1);
  const fresh = company("restore-fresh");
  run("--company", fresh, "--adopt-state", join(store, state));
  act(fresh, 2);
  settle(fresh, stage(fresh).first, store);
  const restored = run("--company", fresh, "--restore", "--from", store);
  const whole = readFileSync(monthFile(fresh));

  const lost = company("restore-lost");
  run("--company", lost, "--adopt-state", join(store, state));
  act(lost, 3);
  const before = readFileSync(monthFile(lost));
  const refused = run("--company", lost, "--restore", "--from", store);
  return [
    restored.code === 0 &&
      whole.length > readFileSync(monthFile(source)).length - 1 &&
      refused.code === 1 &&
      /REFUSED/.test(refused.out) &&
      readFileSync(monthFile(lost)).equals(before),
    `restore ${restored.code}, ${whole.toString().split("\n").filter(Boolean).length} rows; unsynced machine ${refused.code}, bytes kept: ${readFileSync(monthFile(lost)).equals(before)}`,
  ];
});

check("a restore clears the carried state, because the machine now holds the month itself", () => {
  const { store } = seeded("clear");
  const state = readdirSync(store).filter((n) => /\.sync\.rev-\d+\.json$/.test(n)).sort().at(-1);
  const fresh = company("clear-fresh");
  run("--company", fresh, "--adopt-state", join(store, state));
  const carriedBefore = receipt(fresh).carried?.rows ?? 0;
  const restored = run("--company", fresh, "--restore", "--from", store);
  const after = receipt(fresh);
  const status = JSON.parse(run("--company", fresh, "--json").out).months.find((m) => m.month === MONTH);
  return [
    carriedBefore > 0 && restored.code === 0 && !after.carried && status.carried === 0 && status.owed === 0,
    `carried before ${carriedBefore}; after ${after?.carried?.rows ?? 0}; owed ${status?.owed}`,
  ];
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
