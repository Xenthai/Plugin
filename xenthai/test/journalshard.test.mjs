/**
 * Sharded journal revisions, end to end: stage -> upload (simulated) -> receipt -> restore.
 *
 * The properties under test are the ones that made parts acceptable at all. A month restored from
 * its parts is byte-identical to the month that was frozen; the original rows survive as a prefix,
 * so nothing was reordered; an incomplete set is refused by name rather than concatenated into a
 * shorter month that still parses; and a month small enough for one upload keeps the old single-file
 * spelling, so the shape only appears when it is needed.
 */
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const TOOL = fileURLToPath(new URL("../tools/journal-sync.mjs", import.meta.url));
const sha = (b) => `sha256:${createHash("sha256").update(b).digest("hex")}`;

let pass = 0;
let fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) {
    pass++;
    console.log(`PASS  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}${detail ? `  ->  ${detail}` : ""}`);
  }
};

const run = (args, cwd) => {
  try {
    return { out: execFileSync("node", [TOOL, ...args], { cwd, encoding: "utf8" }), code: 0 };
  } catch (e) {
    return { out: `${e.stdout ?? ""}${e.stderr ?? ""}`, code: e.status ?? 1 };
  }
};

const newRoot = (name) => {
  const root = mkdtempSync(join(tmpdir(), `xenthai-shard-${name}-`));
  writeFileSync(
    join(root, ".company.json"),
    JSON.stringify({ schema_version: 1, binding: "ephemeral", kind: "personal", id: "t", name: "T", store: { kind: "drive", root: "X" } }, null, 2)
  );
  mkdirSync(join(root, "journal", "execution"), { recursive: true });
  return root;
};

// A month big enough to need parts: 300 rows of ~300 bytes each.
const rows = Array.from(
  { length: 300 },
  (_, i) => `${JSON.stringify({ schema: 2, n: i, ts: `2026-09-17T00:00:${String(i % 60).padStart(2, "0")}.000Z`, pad: "x".repeat(200) })}\n`
).join("");

// ---------------------------------------------------------------- stage --------
const root = newRoot("a");
const monthFile = join(root, "journal", "execution", "2026-09.jsonl");
writeFileSync(monthFile, rows);
const originalDigest = sha(readFileSync(monthFile));

const staged = run(["--stage", "--shard-bytes", "20000"], root);
const outbox = join(root, "journal", "outbox");
const parts = readdirSync(outbox).sort();
/**
 * `--stage` appends its own staging row before freezing, by design, so the frozen month is the
 * original rows plus that one. The digest under test is therefore the frozen month's, and the
 * original must still be its prefix — that prefix property is what proves nothing was reordered.
 */
const frozen = Buffer.concat(parts.map((n) => readFileSync(join(outbox, n))));
const frozenDigest = sha(frozen);
ok("the frozen month keeps the original rows as its prefix", frozen.subarray(0, Buffer.byteLength(rows)).equals(Buffer.from(rows)));
ok("the frozen month is the original plus the staging row", frozen.toString("utf8").trimEnd().split("\n").length === 301);
ok("a month past the budget stages as parts", parts.length > 1, `${parts.length} file(s)`);
ok("every part name carries its own total", parts.every((n) => /\.part-\d{2}-of-\d{2}\.jsonl$/.test(n)), parts.join(" "));
ok("the totals in the names agree with the count", parts.every((n) => Number(/-of-(\d{2})\./.exec(n)[1]) === parts.length));
ok("no whole-month file is left beside the parts", !parts.some((n) => /rev-\d{3}\.jsonl$/.test(n)));
ok(
  "every part digest stage printed matches the file it names",
  parts.every((n) => staged.out.includes(`${n}\n      file:`) && staged.out.includes(sha(readFileSync(join(outbox, n))))),
  staged.out.slice(0, 400)
);
ok("stage prints the month digest so the parts can be checked against it", staged.out.includes(frozenDigest), staged.out.slice(0, 260));
ok("no part exceeds the budget", parts.every((n) => readFileSync(join(outbox, n)).length <= 20000));
ok("no row is split across parts", parts.every((n) => readFileSync(join(outbox, n), "utf8").endsWith("\n")));

// -------------------------------------------------------------- receipt --------
const tooFew = run(["--receipt", "--month", "2026-09", "--file-id", "id1"], root);
ok("a receipt with fewer ids than parts is refused", tooFew.code === 2 && /id\(s\)/.test(tooFew.out), `code=${tooFew.code}`);

const ids = parts.map((_, i) => `drive-id-${i + 1}`);
const settled = run(["--receipt", "--month", "2026-09", "--file-id", ids.join(",")], root);
ok("a receipt with one id per part settles the month", settled.code === 0, settled.out.slice(0, 200));
ok("the receipt records the month digest, not a part digest", settled.out.includes(frozenDigest), settled.out.slice(0, 200));

const receipt = JSON.parse(readFileSync(join(root, "journal", "sync", "2026-09.json"), "utf8"));
const rev = receipt.revisions.at(-1);
ok("the receipt stores every part with its id and digest", Array.isArray(rev.parts) && rev.parts.length === parts.length);
ok("part order in the receipt matches the id order given", rev.parts.every((p, i) => p.file_id === ids[i] && p.name === parts[i]));
ok("the staged copies are removed once settled", readdirSync(outbox).length === 0);
ok("--check is clean after the receipt", run(["--check"], root).code === 0);

// -------------------------------------------------------------- restore --------
// Simulate the store: the parts as they would sit in the company's journal/ folder.
const store = mkdtempSync(join(tmpdir(), "xenthai-shard-store-"));
const fresh = newRoot("b");
// Re-stage from the original month to get the part files back for the store.
const root2 = newRoot("c");
writeFileSync(join(root2, "journal", "execution", "2026-09.jsonl"), rows);
run(["--stage", "--shard-bytes", "20000"], root2);
for (const n of readdirSync(join(root2, "journal", "outbox"))) cpSync(join(root2, "journal", "outbox", n), join(store, n));

const restored = run(["--restore", "--from", store], fresh);
ok("restore rebuilds a month from its parts", restored.code === 0, restored.out.slice(0, 300));
const restoredBytes = readFileSync(join(fresh, "journal", "execution", "2026-09.jsonl"));
ok("the restored month is byte-identical to what was staged", sha(restoredBytes) === sha(Buffer.concat(readdirSync(store).sort().map((n) => readFileSync(join(store, n))))));
ok("the restored month still carries the original rows as its prefix", restoredBytes.subarray(0, Buffer.byteLength(rows)).equals(Buffer.from(rows)));

// An incomplete set must be refused, loudly, naming the missing part.
const broken = mkdtempSync(join(tmpdir(), "xenthai-shard-broken-"));
const all = readdirSync(store).sort();
for (const n of all.slice(0, -1)) cpSync(join(store, n), join(broken, n));
const fresh2 = newRoot("d");
const refusedRun = run(["--restore", "--from", broken], fresh2);
ok("an incomplete part set is refused", /REFUSED/.test(refusedRun.out), refusedRun.out.slice(0, 300));
ok("the refusal names the missing part", new RegExp(`missing part\\(s\\) ${all.length}`).test(refusedRun.out), refusedRun.out.slice(0, 300));
ok("nothing was written from an incomplete set", !readdirSync(join(fresh2, "journal", "execution")).length);

// --------------------------------------------------- small month unchanged -----
const small = newRoot("e");
writeFileSync(join(small, "journal", "execution", "2026-08.jsonl"), rows.slice(0, 1200));
run(["--stage"], small);
const smallFiles = readdirSync(join(small, "journal", "outbox"));
ok("a month inside the budget still stages as one file with the old name", smallFiles.length === 1 && /^2026-08\.rev-001\.jsonl$/.test(smallFiles[0]), smallFiles.join(" "));
const smallReceipt = run(["--receipt", "--month", "2026-08", "--file-id", "only-id"], small);
ok("a single-file revision still takes one bare id", smallReceipt.code === 0, smallReceipt.out.slice(0, 200));

for (const d of [root, root2, fresh, fresh2, small, store, broken]) rmSync(d, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
