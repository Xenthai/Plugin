#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { readCompany } from "../lib/company.mjs";
import { EVENTS, record } from "../lib/journal.mjs";

/**
 * Moves a month of the execution journal into the client's own store, and reports what is still
 * owed.
 *
 * The journal is written to `<company root>/journal/execution/<YYYY-MM>.jsonl` — a local path. On a
 * durable machine that is fine and has always been fine. In a cloud container it is a file on a disk
 * that is destroyed when the session ends, and the loss is silent: the next session starts with an
 * empty journal, which is indistinguishable from an engagement that has not done anything yet.
 *
 * What that costs is not the rows. It is the two things built on top of them. `opportunities`
 * refuses below three distinct periods and the quarterly report is the first cadence that may claim
 * a result — so in that environment neither can ever run, and both refuse for a reason that reads as
 * "this engagement is young" when the truth is "the history is being deleted every night".
 *
 * THE SPLIT THIS TOOL IS BUILT AROUND. A CLI holds no connector credentials, so it never writes to a
 * store itself. Everything that can be made deterministic is this file's: which rows are owed, what
 * exactly to upload, and whether what came back is what went up. The bytes reach the store in one of
 * two ways, and both are the session's: the model creates the file through the connector, or a
 * `PostToolUse` hook of type `mcp_tool` copies `--emit`'s stdout into the connector's create call,
 * so the bytes travel once as input and the model generates none of them (see `emit`). A tool that
 * appeared to deliver and did not would be worse than the loss it was written to prevent.
 *
 * A REVISION IS A NEW FILE, which is the rule `MCP.md` already states for every other document in
 * the store: the connector's `update_file` changes a title and a parent and cannot change contents.
 * The first revision of a month is the whole month as it stood: `<YYYY-MM>.rev-001.jsonl`. Every
 * revision after it is a DELTA — only the rows appended since the previous receipt —
 * `<YYYY-MM>.rev-<NNN>.delta-after-<R>.jsonl`, where `<R>` is the row count the previous revision
 * settled. A whole-month revision above deltas is legal and becomes the new base. Readers rebuild the
 * month by concatenating the highest whole-month revision with every delta after it, in order.
 *
 * WHY DELTAS. A revision used to be the whole month every time, re-split into parts whose names
 * carried the total, so every part was renamed as the month grew and a sync re-uploaded the entire
 * month: twenty-seven files and most of an hour for thirty new rows. A delta is the rows that are
 * actually new — typically one file under the budget — and the uploaded byte count stops growing
 * with the month. The receipt still records the whole month's row count and digest, so `--check`,
 * `doctor` and the divergence rule below are unchanged.
 *
 * PARTS WERE REJECTED ONCE, AND THE OBJECTION WAS RIGHT AS STATED: a missing part truncates the
 * history silently, while a missing revision leaves a visible gap in a numbered sequence. Parts are
 * allowed under the condition that answers it: the expected count is inside every part's own name —
 * `.part-<NN>-of-<MM>` — so a missing part is a visible gap readable from the folder listing alone.
 * `--restore` refuses a revision whose set is incomplete and names the parts it is missing, and
 * `--receipt` will not settle a month until the concatenation of what was uploaded hashes to the
 * month it froze.
 *
 * THE STORE'S OWN BYTE COUNT IS PART OF THE RECEIPT. The upload channel was measured truncating a
 * file to 22% of itself while the connector reported success, and a receipt that only hashed the
 * local staged bytes would have settled that month. `--receipt` therefore takes `<id>:<size>` per
 * file — the size the connector reports for what it holds — and refuses when it differs from the
 * staged bytes. Reading a file's metadata is a read the journal does not record, so this costs the
 * session nothing.
 */

/**
 * Every spelling a revision file may have in the store, in one grammar:
 *   1 month · 2 revision · 3 base row count (present ⇒ a delta) · 4 part · 5 total parts.
 * `2026-09.rev-009.jsonl`, `2026-09.rev-009.part-01-of-27.jsonl`,
 * `2026-09.rev-010.delta-after-1072.jsonl`, `2026-09.rev-011.delta-after-1108.part-01-of-03.jsonl`.
 */
export const STORE_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.rev-(\d{3,})(?:\.delta-after-(\d+))?(?:\.part-(\d{2,})-of-(\d{2,}))?\.jsonl$/;

const MONTH_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.jsonl$/;
const MONTH = /^\d{4}-(?:0[1-9]|1[0-2])$/;

/**
 * How many bytes a part may hold. Not a store limit — the store takes far more — but the budget of
 * the channel that has to carry it: a tool call reproduces these bytes, and the failure mode past
 * the budget is a truncated upload that reports success. 20 KB leaves room under the measured cliff
 * rather than sitting on it, and stays under the 30,000 characters Claude Code hands a hook from a
 * Bash call's stdout, which is what the transport hook copies.
 */
const SHARD_BYTES = 20_000;

/**
 * Shape of a receipt file, versioned for the same reason a journal row is. Schema 1 entries are
 * whole-month revisions with no store-reported size; schema 2 entries carry `kind`, `after` and the
 * size the store confirmed per file. A schema 1 entry is read as `kind: "full"`, because schema 1
 * could not describe anything else.
 */
export const RECEIPT_SCHEMA = 2;

const HELP = `Xenth AI journal-sync — put a month of the journal in the client's store, and say what is owed.

  node tools/journal-sync.mjs [--company <dir>] [--json]
  node tools/journal-sync.mjs --check
  node tools/journal-sync.mjs --stage [--month YYYY-MM] [--shard-bytes N]
  node tools/journal-sync.mjs --emit <file>
  node tools/journal-sync.mjs --receipt --month YYYY-MM --file-id <id>:<size>[,<id>:<size>...]
  node tools/journal-sync.mjs --restore --from <dir>

  (no command)   Report every month: rows on this machine, rows in the store, rows owed.
  --check        Exit 1 when any month has rows the store does not hold. What doctor calls.
  --stage        Freeze the month and print the file(s) to upload, each with its digest and size, and
                 the folder they belong in. The first revision of a month is the whole month,
                 <YYYY-MM>.rev-001.jsonl; every later one is only the rows since the last receipt,
                 <YYYY-MM>.rev-<NNN>.delta-after-<R>.jsonl. A file over the budget is split into
                 .part-<NN>-of-<MM> files, each with its own digest.
  --emit         Print a staged file's exact bytes to stdout, minus the final newline, and nothing
                 else. This is what the transport hook copies into the connector's create call; the
                 hook adds the newline back, and --receipt's size check proves the result.
  --receipt      Record that the staged revision reached the store: for every file, the id the
                 connector returned and the size the store reports for it, as <id>:<size>, in file
                 order, comma separated. Refused unless every part is present, every size equals the
                 staged bytes, and the concatenation hashes to the month. Then removes the staged copy.
  --restore      Rebuild the local journal from revisions downloaded into <dir>: the highest whole-month
                 revision plus every delta after it. Refuses an incomplete set, a delta whose base does
                 not match, a file that is not whole rows, and a local month holding rows the store
                 does not.

  --company <dir>  The engagement directory. Default: the bound company found from the cwd.
  --month          One month. Default: every month with rows owed.
  --shard-bytes    Bytes a single file may hold before --stage splits it. Default 20000.
  --json           Machine-readable output.

THE UPLOAD IS NOT DONE HERE. A CLI has no connector credentials. This stages bytes and verifies
what came back; a session creates the file in the store, inside the company's own \`journal/\`
folder — either through the connector directly, or through a PostToolUse hook of type mcp_tool
that copies --emit's output into the connector's create call, so no byte is generated by the model.

EXIT CODES
  0  the command did what it says.
  1  --check found rows the store does not hold, or --restore refused rather than lose local rows.
  2  could not run: no company bound, a bad argument, a month that does not parse, or a receipt
     whose sizes or ids do not match what was staged.
  3  a defect in the evidence: the local month and the last receipt disagree about rows already
     synced, which means the file was rewritten rather than appended to. Never silent.
`;

const sha = (buffer) => `sha256:${createHash("sha256").update(buffer).digest("hex")}`;

/**
 * A month file's rows, bytes and digest, plus the digest of its first `n` rows. Every row is one
 * newline-terminated line — `lib/journal.mjs` appends nothing else — so a prefix is exactly the
 * bytes up to the nth newline, and comparing that against an earlier revision's whole-file digest
 * is what proves the file was appended to rather than rewritten.
 */
const measureBytes = (bytes) => {
  let rows = 0;
  const ends = [];
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x0a) {
      ends.push(i + 1);
      rows++;
    }
  }
  return {
    rows,
    bytes: bytes.length,
    digest: sha(bytes),
    prefixDigest: (n) => (n === 0 ? sha(Buffer.alloc(0)) : n > rows ? null : sha(bytes.subarray(0, ends[n - 1]))),
    rowEnds: ends,
    raw: bytes,
  };
};

const measure = (file) => measureBytes(readFileSync(file));

/**
 * True when `bytes` is whole journal rows: ends on a newline and every line parses as JSON. This is
 * how a file that arrived truncated is told apart from a short one, without any receipt to compare
 * against — the case a fresh container restoring from the store alone is in.
 */
const wellFormed = (bytes) => {
  if (!bytes.length) return true;
  if (bytes[bytes.length - 1] !== 0x0a) return false;
  for (const line of bytes.toString("utf8").split("\n")) {
    if (!line) continue;
    try {
      JSON.parse(line);
    } catch {
      return false;
    }
  }
  return true;
};

const pad3 = (n) => String(n).padStart(3, "0");
const pad2 = (n) => String(n).padStart(2, "0");

const revisionName = (month, rev, after, part = null, total = null) =>
  `${month}.rev-${pad3(rev)}${after === null ? "" : `.delta-after-${after}`}${part === null ? "" : `.part-${pad2(part)}-of-${pad2(total)}`}.jsonl`;

const parseStoreName = (name) => {
  const m = STORE_FILE.exec(name);
  if (!m) return null;
  return {
    month: m[1],
    rev: Number(m[2]),
    after: m[3] === undefined ? null : Number(m[3]),
    part: m[4] === undefined ? null : Number(m[4]),
    of: m[5] === undefined ? null : Number(m[5]),
  };
};

/**
 * Cuts bytes into ranges that each end on a row boundary. A row is never split: a single row longer
 * than the budget travels alone and oversized rather than broken, because half a JSON object is not
 * a row a reader can skip — it is a file a reader cannot parse.
 */
const shardRanges = (rowEnds, limit) => {
  const ranges = [];
  let start = 0;
  let cut = 0;
  for (const end of rowEnds) {
    if (end - start > limit && cut > start) {
      ranges.push([start, cut]);
      start = cut;
    }
    cut = end;
  }
  if (cut > start) ranges.push([start, cut]);
  return ranges;
};

/**
 * Sorts a folder's revision files into one group per revision number, whichever spelling they use.
 * A group is either a single file or a set of parts, and every name in it must agree on the base it
 * is a delta of; both spellings of one revision in one folder, or parts naming different bases, is
 * itself a defect, and `resolveGroup` refuses it rather than choosing.
 */
const groupRevisions = (names) => {
  const groups = new Map();
  for (const name of names) {
    const parsed = parseStoreName(name);
    if (!parsed) continue;
    if (!groups.has(parsed.rev)) groups.set(parsed.rev, { month: parsed.month, rev: parsed.rev, after: parsed.after, plain: null, parts: new Map(), conflict: false });
    const group = groups.get(parsed.rev);
    if (group.after !== parsed.after) group.conflict = true;
    if (parsed.part === null) group.plain = name;
    else group.parts.set(parsed.part, { name, of: parsed.of });
  }
  return groups;
};

const refusal = (missing, expected = 0) => ({ bytes: Buffer.alloc(0), names: [], digests: [], sizes: [], missing, expected });

/**
 * The bytes a revision actually stands for, plus what it is missing. `missing` non-empty is the only
 * honest answer for an incomplete part set: concatenating what is there would produce a shorter
 * revision that still parses, which is exactly the silent truncation the part naming exists to
 * prevent.
 */
const resolveGroup = (dir, group) => {
  if (group.conflict) return refusal(["files of this revision disagree on the base they follow"]);
  if (group.plain && group.parts.size) return refusal(["both a single file and parts for this revision"]);
  if (group.plain) {
    const bytes = readFileSync(join(dir, group.plain));
    return { bytes, names: [group.plain], digests: [sha(bytes)], sizes: [bytes.length], missing: [], expected: 1 };
  }
  const declared = [...new Set([...group.parts.values()].map((d) => d.of))];
  if (declared.length !== 1) return refusal([`parts disagree on the total (${declared.join(", ")})`]);
  const expected = declared[0];
  const missing = [];
  for (let i = 1; i <= expected; i++) if (!group.parts.has(i)) missing.push(i);
  if (missing.length) return refusal(missing, expected);
  const names = [];
  const buffers = [];
  const digests = [];
  const sizes = [];
  for (let i = 1; i <= expected; i++) {
    const { name } = group.parts.get(i);
    const bytes = readFileSync(join(dir, name));
    names.push(name);
    buffers.push(bytes);
    digests.push(sha(bytes));
    sizes.push(bytes.length);
  }
  return { bytes: Buffer.concat(buffers), names, digests, sizes, missing: [], expected };
};

const executionDir = (root) => join(root, "journal", "execution");
const syncDir = (root) => join(root, "journal", "sync");
const outboxDir = (root) => join(root, "journal", "outbox");

const monthsOnDisk = (root) => {
  try {
    return readdirSync(executionDir(root))
      .filter((n) => MONTH_FILE.test(n))
      .map((n) => n.replace(".jsonl", ""))
      .sort();
  } catch {
    return [];
  }
};

const receiptPath = (root, month) => join(syncDir(root), `${month}.json`);

const readReceipt = (root, month) => {
  try {
    const data = JSON.parse(readFileSync(receiptPath(root, month), "utf8"));
    return Array.isArray(data.revisions) ? data : null;
  } catch {
    return null;
  }
};

const writeReceipt = (root, month, receipt) => {
  mkdirSync(syncDir(root), { recursive: true });
  writeFileSync(receiptPath(root, month), `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
};

const latestRevision = (receipt) => (receipt?.revisions?.length ? receipt.revisions[receipt.revisions.length - 1] : null);

/**
 * One month's state, and the only place the three numbers that matter are compared.
 *
 * `diverged` is deliberately not folded into `owed`. Rows appended since the last upload are the
 * ordinary case and are fixed by uploading again; a prefix that no longer matches means the file
 * was rewritten under the journal's feet, which no upload repairs and which nothing else would ever
 * have noticed.
 */
export const monthState = (root, month) => {
  const file = join(executionDir(root), `${month}.jsonl`);
  const local = existsSync(file) ? measure(file) : null;
  const receipt = readReceipt(root, month);
  const last = latestRevision(receipt);
  const synced = last?.rows ?? 0;
  const diverged = Boolean(local && last && local.prefixDigest(last.rows) !== last.digest);
  return {
    month,
    file,
    rows: local?.rows ?? 0,
    bytes: local?.bytes ?? 0,
    digest: local?.digest ?? null,
    synced,
    owed: Math.max((local?.rows ?? 0) - synced, 0),
    revision: last?.rev ?? 0,
    lastSyncedAt: last?.at ?? null,
    diverged,
    storedOnly: !local && synced > 0,
  };
};

export const allMonths = (root) => {
  const fromDisk = monthsOnDisk(root);
  let fromReceipts = [];
  try {
    fromReceipts = readdirSync(syncDir(root))
      .filter((n) => n.endsWith(".json"))
      .map((n) => n.replace(".json", ""))
      .filter((m) => MONTH.test(m));
  } catch {
    /* no receipts yet is the ordinary state before the first sync */
  }
  return [...new Set([...fromDisk, ...fromReceipts])].sort().map((m) => monthState(root, m));
};

/**
 * Months the store holds and this machine does not. This is the sentence `opportunities` and
 * `report` were missing: an absent journal reads as an engagement with no history, and this is how
 * they tell that apart from a history sitting in the client's Drive waiting to be restored.
 */
export const syncedButAbsent = (root) => allMonths(root).filter((m) => m.storedOnly).map((m) => m.month);

const parseArgs = (argv) => {
  const args = { json: false, help: false, check: false, stage: false, receipt: false, restore: false, unknown: [] };
  const flags = new Set(["json", "help", "check", "stage", "receipt", "restore"]);
  const values = new Set(["company", "month", "file-id", "from", "shard-bytes", "emit"]);
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      args.unknown.push(token);
      continue;
    }
    const key = token.slice(2);
    if (flags.has(key)) {
      args[key] = true;
      continue;
    }
    if (!values.has(key)) {
      args.unknown.push(token);
      continue;
    }
    const value = argv[++i];
    if (value === undefined || value.startsWith("--")) {
      args.missingValue = key;
      continue;
    }
    args[key] = value;
  }
  return args;
};

const finish = (text, code) => process.stdout.write(text, () => process.exit(code));

const fail = (message, code = 2) => {
  process.stderr.write(`${message}\n`);
  process.exit(code);
};

const divergedMessage = (states) =>
  `the local journal and the last receipt disagree for ${states.map((s) => s.month).join(", ")}.\n\n` +
  "A month file is appended to, never rewritten, so the rows already uploaded must still be its\n" +
  "first rows. They are not. Something replaced the file — a bad restore, a manual edit, or two\n" +
  "engagements sharing a directory. Do not upload over it: find out which, because one of those\n" +
  "three means a client's evidence is already wrong.";

/**
 * Writes the staged files for one revision — one file, or parts when the bytes exceed the budget —
 * and describes each so `--stage`'s output can name what to upload and `--emit` can find it.
 */
const writeStaged = (root, month, rev, after, bytes, limit) => {
  const single = revisionName(month, rev, after);
  const singlePath = join(outboxDir(root), single);
  if (bytes.length <= limit) {
    writeFileSync(singlePath, bytes);
    return { name: single, path: singlePath, parts: null };
  }
  const ranges = shardRanges(measureBytes(bytes).rowEnds, limit);
  const parts = ranges.map(([from, to], i) => {
    const partName = revisionName(month, rev, after, i + 1, ranges.length);
    const partPath = join(outboxDir(root), partName);
    const slice = bytes.subarray(from, to);
    writeFileSync(partPath, slice);
    return { part: i + 1, of: ranges.length, name: partName, path: partPath, rows: measureBytes(slice).rows, bytes: slice.length, digest: sha(slice) };
  });
  return { name: null, path: null, parts };
};

const stage = (root, states, company, limit = SHARD_BYTES) => {
  const owed = states.filter((s) => s.owed > 0);
  if (!owed.length) return { staged: [], text: "nothing to stage: every row on this machine is already in the store.\n" };
  mkdirSync(outboxDir(root), { recursive: true });
  const staged = owed.map((s) => {
    const rev = s.revision + 1;
    const after = s.synced > 0 ? s.synced : null;
    /**
     * Recorded BEFORE the freeze, and this order is the whole trick. A row written after the copy
     * would be a row the copy does not contain, so every sync would leave the month one row short
     * and `--check` would report work owed for ever — which on an ephemeral binding means `doctor`
     * is red permanently and stops meaning anything. Written first, the staging row travels inside
     * the bytes it describes.
     *
     * It says `pending` because that is what it knows. The store's own file listing is what says the
     * revision arrived, and `journal/sync/<month>.json` is what ties the two together with an id and
     * a digest; an append-only journal cannot go back and amend a row, and pretending otherwise
     * would be the one kind of evidence this plugin refuses to produce.
     */
    record(
      {
        event: EVENTS.DELIVERY,
        actor: "system",
        capability: "journal",
        result: "pending",
        why: `journal ${s.month} revision ${rev} staged for upload to the company's store`,
        target: revisionName(s.month, rev, after),
        detail: `${s.owed} row(s) not yet in the store`,
      },
      { cwd: root }
    );
    /**
     * The whole month is measured even for a delta, so the month digest the receipt will carry is
     * computed from the exact bytes the delta is cut from; `main` has already refused the month if
     * the rows receipted so far are no longer its prefix.
     */
    const frozen = measure(s.file);
    const upload = after === null ? frozen.raw : frozen.raw.subarray(frozen.rowEnds[after - 1]);
    const written = writeStaged(root, s.month, rev, after, upload, limit);
    return {
      month: s.month,
      rev,
      kind: after === null ? "full" : "delta",
      after,
      rows: frozen.rows,
      bytes: frozen.bytes,
      digest: frozen.digest,
      new_rows: frozen.rows - s.synced,
      upload_rows: measureBytes(upload).rows,
      upload_bytes: upload.length,
      upload_digest: sha(upload),
      ...written,
    };
  });
  const folder = company?.store?.root ?? "(store.root is not set in the manifest)";
  const createTool = company?.store?.tools?.create ?? "create_file";
  const emit = (name) => `node tools/journal-sync.mjs --emit ${name}`;
  const describe = (s) => {
    const head =
      `  ${s.month} revision ${s.rev} — ${s.kind === "full" ? "the whole month" : `rows after ${s.after}`}: ` +
      `${s.upload_rows} row(s), ${s.upload_bytes} bytes (${s.new_rows} new since revision ${s.rev - 1})\n` +
      `    month digest: ${s.digest} (${s.rows} rows)\n`;
    const files = s.parts
      ? s.parts.map((d) => `    ${d.name}\n      file:   ${d.path}\n      rows:   ${d.rows}, ${d.bytes} bytes\n      digest: ${d.digest}\n      emit:   ${emit(d.name)}\n`).join("")
      : `    ${s.name}\n      file:   ${s.path}\n      digest: ${s.upload_digest}\n      emit:   ${emit(s.name)}\n`;
    const ids = s.parts ? s.parts.map((_, i) => `<id-${i + 1}>:<size-${i + 1}>`).join(",") : "<id>:<size>";
    return `${head}${files}    then:   node tools/journal-sync.mjs --receipt --month ${s.month} --file-id ${ids}\n`;
  };
  const text =
    `${staged.length} month(s) staged. Put each file below into the company's journal/ folder under\n` +
    `store root ${folder}, keeping the name exactly (${createTool}, text/plain, no conversion).\n\n` +
    staged.map(describe).join("\n") +
    "\nA CLI has no connector credentials, so the upload is the session's: run the emit command with\n" +
    "the file's name as the Bash description where the transport hook is installed, or create the\n" +
    "file through the connector yourself. Then read each file's metadata and pass its id and reported\n" +
    "size to --receipt, in file order — a revision with no receipt is a revision nobody can prove\n" +
    "arrived, and a size that differs from the staged bytes is an upload that did not arrive whole.\n";
  return { staged, text };
};

/**
 * Prints a staged file's bytes and nothing else, without the final newline. The transport hook
 * receives a Bash call's stdout with trailing whitespace already stripped and appends one newline
 * itself, so the file is reproduced exactly whether or not that stripping happens; `--receipt`'s
 * size check is what proves it did. Only a name from the outbox is accepted — the basename, matched
 * against the store grammar — so the command cannot be turned into a way of printing another file.
 */
const emit = (root, name) => {
  const file = basename(name);
  if (!STORE_FILE.test(file)) return fail(`--emit takes a staged revision file name, not "${name}"`);
  const path = join(outboxDir(root), file);
  if (!existsSync(path)) return fail(`${file} is not staged. Run --stage first, then emit the names it prints.`);
  const bytes = readFileSync(path);
  const body = bytes.length && bytes[bytes.length - 1] === 0x0a ? bytes.subarray(0, bytes.length - 1) : bytes;
  process.stdout.write(body, () => process.exit(0));
};

/**
 * `<id>:<size>` pairs, one per uploaded file, in file order. The size is required because it is the
 * one fact about the store's copy a session can read for free, and the one the measured failure
 * would have been caught by.
 */
const parseFileIds = (raw) => {
  const pairs = String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((token) => {
      const at = token.lastIndexOf(":");
      if (at < 1) return { id: token, size: null };
      const size = Number(token.slice(at + 1));
      return { id: token.slice(0, at), size: Number.isInteger(size) && size >= 0 ? size : null };
    });
  return pairs;
};

const describeRevision = (month, rev, names) => (names.length === 1 ? names[0] : `${month}.rev-${pad3(rev)} (${names.length} parts)`);

const receipt = (root, month, fileId, company) => {
  let names = [];
  try {
    names = readdirSync(outboxDir(root)).filter((n) => STORE_FILE.test(n) && n.startsWith(`${month}.`));
  } catch {
    /* handled below as "nothing staged" */
  }
  if (!names.length) {
    return fail(
      `nothing staged for ${month}. Run --stage first: a receipt is written from the bytes that were\n` +
        "uploaded, never from the live file, so that it cannot claim rows that never went up."
    );
  }
  const revisions = groupRevisions(names);
  const rev = Math.max(...revisions.keys());
  const group = revisions.get(rev);
  const pairs = parseFileIds(fileId);
  const resolved = resolveGroup(outboxDir(root), group);
  if (resolved.missing.length) {
    return fail(
      `${month} revision ${rev} is staged in ${group.parts.size} of ${resolved.expected} parts. Missing ` +
        `part(s) ${resolved.missing.join(", ")}.\n` +
        "Nothing was settled. Re-run --stage: a receipt written over an incomplete set would claim rows\n" +
        "that are not in the store."
    );
  }
  if (pairs.length !== resolved.names.length) {
    return fail(
      `${month} revision ${rev} is ${resolved.names.length} file(s) and --file-id carries ${pairs.length} id(s).\n` +
        (resolved.names.length > 1
          ? "Pass one <id>:<size> per part, in part order, comma separated. The order is what ties an id to\n" +
            "the bytes it acknowledges, so a receipt cannot be written from a count that does not match."
          : "Pass exactly one <id>:<size>.")
    );
  }
  const unsized = pairs.filter((p) => p.size === null);
  if (unsized.length) {
    return fail(
      `--file-id needs the size the store reports for each file, as <id>:<size>: ${unsized.map((p) => p.id).join(", ")} ` +
        "carr" + (unsized.length === 1 ? "ies" : "y") + " none.\n" +
        "Read the file's metadata through the connector (get_file_metadata, or search_files on its title)\n" +
        "and pass the fileSize it returns. The upload channel has been measured truncating a file while\n" +
        "reporting success; the size is how a receipt tells a delivered file from a damaged one."
    );
  }
  const wrong = pairs.map((p, i) => ({ ...p, name: resolved.names[i], staged: resolved.sizes[i] })).filter((p) => p.size !== p.staged);
  if (wrong.length) {
    return fail(
      `the store's copy does not match what was staged for ${month} revision ${rev}:\n` +
        wrong.map((p) => `  ${p.name}: staged ${p.staged} bytes, store reports ${p.size} (${p.id})`).join("\n") +
        "\nNothing was settled. Trash the damaged file(s), upload again from the staged copy, and read the\n" +
        "size back before writing the receipt. A file the store holds at the wrong size is the silent\n" +
        "truncation this check exists to catch."
    );
  }
  const existing = readReceipt(root, month) ?? { schema: RECEIPT_SCHEMA, month, company: company?.id ?? null, revisions: [] };
  const prev = latestRevision(existing);
  let whole;
  if (group.after === null) {
    whole = measureBytes(resolved.bytes);
  } else {
    /**
     * A delta only means something relative to the base it names. The base must be the revision the
     * receipt last settled, and the live month must still begin with that revision's bytes — the
     * same divergence rule `monthState` applies, checked again here against the exact bytes the
     * whole-month digest is about to be computed from.
     */
    if (!prev || prev.rows !== group.after) {
      return fail(
        `${month} revision ${rev} is a delta after ${group.after} rows, but the last receipt settled ${prev?.rows ?? "no"} rows.\n` +
          "Nothing was settled. Re-run --stage so the delta is cut from the revision the receipt knows."
      );
    }
    const file = join(executionDir(root), `${month}.jsonl`);
    const local = existsSync(file) ? measure(file) : null;
    if (!local || local.prefixDigest(prev.rows) !== prev.digest) return fail(divergedMessage([{ month }]), 3);
    whole = measureBytes(Buffer.concat([local.raw.subarray(0, local.rowEnds[prev.rows - 1]), resolved.bytes]));
  }
  const uploaded = measureBytes(resolved.bytes);
  const entry = {
    rev,
    kind: group.after === null ? "full" : "delta",
    after: group.after,
    name: describeRevision(month, rev, resolved.names),
    rows: whole.rows,
    bytes: whole.bytes,
    digest: whole.digest,
    uploaded: { rows: uploaded.rows, bytes: uploaded.bytes, digest: uploaded.digest },
    file_id: pairs.length === 1 ? pairs[0].id : pairs.map((p) => p.id),
    size: pairs.length === 1 ? pairs[0].size : null,
    /**
     * Recorded per part, and not merely as a count. A month restored from the store is reassembled
     * from these names in this order; without them a later session would have to trust a folder
     * listing to be complete, which is the assumption the whole tool refuses to make.
     */
    parts:
      resolved.names.length === 1
        ? null
        : resolved.names.map((partName, i) => ({ part: i + 1, of: resolved.names.length, name: partName, digest: resolved.digests[i], size: pairs[i].size, file_id: pairs[i].id })),
    at: new Date().toISOString(),
  };
  existing.schema = RECEIPT_SCHEMA;
  existing.revisions.push(entry);
  writeReceipt(root, month, existing);
  for (const partName of resolved.names) rmSync(join(outboxDir(root), partName), { force: true });

  /**
   * No journal row is written here, and the absence is deliberate: a row appended now would not be
   * inside the revision it describes, so the month would be owed again the instant it was settled.
   * `--stage` already recorded the staging; what this adds is the id and the digest in the receipt,
   * which is the part a later session needs and a row could not carry anyway.
   */
  return finish(
    `receipt written: ${month} revision ${rev} (${entry.kind}${entry.after === null ? "" : ` after ${entry.after}`}), ` +
      `${uploaded.rows} row(s) uploaded, month now ${whole.rows} rows, ${whole.digest}, ` +
      `store id${pairs.length > 1 ? "s" : ""} ${pairs.map((p) => p.id).join(", ")}.\n` +
      `Size${pairs.length > 1 ? "s" : ""} confirmed against the staged bytes` +
      (resolved.names.length > 1 ? `, and the ${resolved.names.length} parts concatenate to the digest above.\n` : ".\n") +
      "The staged copy was removed; the store holds those bytes now.\n",
    0
  );
};

/**
 * The revisions a month is rebuilt from: the highest whole-month revision, then every delta above
 * it in order, each one's base equal to the rows accumulated so far. A gap in the numbering, a
 * delta whose base does not match, and a file that is not whole rows are each refused by name,
 * because every one of them means the store holds a history this tool cannot vouch for.
 */
const chainFor = (dir, groups) => {
  const revs = [...groups.keys()].sort((a, b) => a - b);
  const fulls = revs.filter((r) => groups.get(r).after === null);
  if (!fulls.length) return { error: `no whole-month revision — only deltas, which have nothing to follow` };
  const base = fulls[fulls.length - 1];
  const max = revs[revs.length - 1];
  const buffers = [];
  const names = [];
  const steps = [];
  let rows = 0;
  for (let rev = base; rev <= max; rev++) {
    const group = groups.get(rev);
    if (!group) return { error: `revision ${rev} is missing between ${base} and ${max}` };
    const resolved = resolveGroup(dir, group);
    if (resolved.missing.length) {
      return { error: `revision ${rev} is incomplete — missing part(s) ${resolved.missing.join(", ")}${resolved.expected ? ` of ${resolved.expected}` : ""}` };
    }
    if (!wellFormed(resolved.bytes)) return { error: `revision ${rev} is not whole rows — it arrived truncated or damaged` };
    if (group.after !== null && group.after !== rows) return { error: `revision ${rev} follows ${group.after} rows but the revisions before it hold ${rows}` };
    buffers.push(resolved.bytes);
    names.push(...resolved.names);
    rows += measureBytes(resolved.bytes).rows;
    steps.push({ rev, group, resolved });
  }
  return { bytes: Buffer.concat(buffers), names, steps, base, max, rows };
};

const restore = (root, from) => {
  let names = [];
  try {
    names = readdirSync(from).filter((n) => STORE_FILE.test(n));
  } catch {
    return fail(`cannot read ${from}`);
  }
  if (!names.length) {
    return fail(
      `no <YYYY-MM>.rev-<NNN>.jsonl files in ${from}. Download each month's highest whole-month revision\n` +
        "and every delta after it from the company's journal/ folder first; the names say which month and\n" +
        "which revision each is. A file stored in parts is .part-<NN>-of-<MM>.jsonl, and every part is needed."
    );
  }
  const byMonth = new Map();
  for (const group of groupRevisions(names).values()) {
    if (!byMonth.has(group.month)) byMonth.set(group.month, new Map());
    byMonth.get(group.month).set(group.rev, group);
  }

  const restored = [];
  const refused = [];
  for (const [month, groups] of [...byMonth.entries()].sort()) {
    const chain = chainFor(from, groups);
    if (chain.error) {
      refused.push({ month, reason: chain.error });
      continue;
    }
    const incoming = measureBytes(chain.bytes);
    const target = join(executionDir(root), `${month}.jsonl`);
    if (existsSync(target)) {
      /**
       * The local file must be a prefix of what is being restored, or the restore would delete rows
       * this machine holds and the store does not. That is the one outcome this whole tool exists to
       * prevent, so it refuses rather than merging: a merge would have to reorder rows written by
       * two sessions and no ordering it picked would be evidence.
       */
      const local = measure(target);
      if (local.digest !== incoming.digest && incoming.prefixDigest(local.rows) !== local.digest) {
        refused.push({ month, reason: "local rows the store does not have" });
        continue;
      }
      if (local.rows > incoming.rows) {
        refused.push({ month, reason: "local rows the store does not have" });
        continue;
      }
    }
    const last = chain.steps[chain.steps.length - 1];
    mkdirSync(executionDir(root), { recursive: true });
    writeFileSync(target, chain.bytes);
    writeReceipt(root, month, {
      schema: RECEIPT_SCHEMA,
      month,
      company: null,
      revisions: [
        {
          rev: chain.max,
          kind: last.group.after === null ? "full" : "delta",
          after: last.group.after,
          name: chain.steps.length === 1 ? describeRevision(month, chain.max, last.resolved.names) : `${month}.rev-${pad3(chain.base)} + ${chain.steps.length - 1} delta(s) to rev-${pad3(chain.max)}`,
          rows: incoming.rows,
          bytes: incoming.bytes,
          digest: incoming.digest,
          uploaded: null,
          file_id: null,
          size: null,
          parts:
            last.resolved.names.length === 1
              ? null
              : last.resolved.names.map((partName, i) => ({ part: i + 1, of: last.resolved.names.length, name: partName, digest: last.resolved.digests[i], size: null, file_id: null })),
          at: new Date().toISOString(),
          restored: true,
        },
      ],
    });
    restored.push({ month, rev: chain.max, rows: incoming.rows, files: chain.names.length });
  }

  const text =
    (restored.length
      ? `restored ${restored.map((r) => `${r.month} (revision ${r.rev}, ${r.rows} rows from ${r.files} file(s))`).join(", ")}\n`
      : "nothing restored\n") +
    (refused.length
      ? `\nREFUSED: ${refused.map((r) => `${r.month} — ${r.reason}`).join("; ")}\n` +
        "A month refused for local rows holds evidence this machine has and the store does not: sync\n" +
        "it first, because a restore that overwrote it would delete the only copy. A month refused for\n" +
        "a missing part or revision is a download that did not finish — fetch what is named and run it\n" +
        "again. A month refused as not whole rows holds a file the store received damaged: the receipt\n" +
        "that settled it names the size it should have, and the previous revision is intact.\n"
      : "");
  return finish(text, refused.length ? 1 : 0);
};

const statusText = (states, company) => {
  if (!states.length) return "no journal on this machine and no receipts: nothing has been recorded yet.\n";
  const lines = states.map(
    (s) =>
      `  ${s.month}  local ${String(s.rows).padStart(5)}  store ${String(s.synced).padStart(5)}  ` +
      `owed ${String(s.owed).padStart(5)}${s.diverged ? "  DIVERGED" : s.storedOnly ? "  (in the store, not on this machine)" : ""}`
  );
  const owed = states.reduce((n, s) => n + s.owed, 0);
  return (
    `${company?.name ?? "engagement"} — journal against the store\n\n${lines.join("\n")}\n\n` +
    (owed
      ? `${owed} row(s) exist only on this machine. Run --stage.\n`
      : "every row on this machine is in the store.\n")
  );
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return finish(HELP, 0);
  if (args.unknown.length) return fail(`unknown option(s): ${args.unknown.join(" ")}\n\n${HELP}`);
  if (args.missingValue) return fail(`--${args.missingValue} needs a value`);
  if (args.month && !MONTH.test(args.month)) return fail(`--month must be YYYY-MM, not "${args.month}"`);

  const ctx = args.company
    ? { ok: true, root: args.company, company: readCompany(args.company).company ?? null }
    : readCompany();
  if (!ctx.ok) {
    return fail(`no company bound (${ctx.reason}). Pass --company <dir> or run inside an engagement folder.`);
  }
  const root = ctx.root;

  if (args.restore) {
    if (!args.from) return fail("--restore needs --from <dir>");
    return restore(root, args.from);
  }
  if (args.emit) return emit(root, args.emit);

  const states = allMonths(root).filter((s) => !args.month || s.month === args.month);
  const diverged = states.filter((s) => s.diverged);
  if (diverged.length && !args.check) return fail(divergedMessage(diverged), 3);

  if (args.receipt) {
    if (!args.month) return fail("--receipt needs --month YYYY-MM");
    if (!args["file-id"]) return fail("--receipt needs --file-id <id>:<size>: an upload nobody can point at is not a delivery");
    return receipt(root, args.month, args["file-id"], ctx.company);
  }

  if (args.stage) {
    const limit = args["shard-bytes"] === undefined ? SHARD_BYTES : Number(args["shard-bytes"]);
    if (!Number.isInteger(limit) || limit < 1024) {
      return fail(`--shard-bytes must be an integer of at least 1024, not "${args["shard-bytes"]}"`);
    }
    const { staged, text } = stage(root, states, ctx.company, limit);
    return finish(args.json ? `${JSON.stringify({ staged }, null, 2)}\n` : text, 0);
  }

  const owed = states.filter((s) => s.owed > 0);
  if (args.check) {
    const clean = !owed.length && !diverged.length;
    if (args.json) {
      return finish(`${JSON.stringify({ ok: clean, owed, diverged: diverged.map((s) => s.month) }, null, 2)}\n`, clean ? 0 : diverged.length ? 3 : 1);
    }
    if (diverged.length) return fail(divergedMessage(diverged), 3);
    return finish(
      clean
        ? "every row on this machine is in the store.\n"
        : `${owed.reduce((n, s) => n + s.owed, 0)} row(s) in ${owed.map((s) => s.month).join(", ")} exist only on this machine.\n`,
      clean ? 0 : 1
    );
  }

  return finish(
    args.json
      ? `${JSON.stringify({ company: ctx.company?.id ?? null, months: states.map(({ file, ...rest }) => ({ ...rest, file: basename(file) })) }, null, 2)}\n`
      : statusText(states, ctx.company),
    0
  );
};

if (process.argv[1]?.endsWith("journal-sync.mjs")) main();
