#!/usr/bin/env node
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
 * THE SPLIT THIS TOOL IS BUILT AROUND. A CLI holds no connector credentials, and neither does a
 * hook, so nothing outside a session can write to a client's store. The upload is therefore the
 * session's, and everything that can be made deterministic is this file's: which rows are owed, what
 * exactly to upload, and whether what came back is what went up. A tool that appeared to deliver and
 * did not would be worse than the loss it was written to prevent.
 *
 * A REVISION IS A NEW FILE, which is the rule `MCP.md` already states for every other document in
 * the store: the connector's `update_file` changes a title and a parent and cannot change contents.
 * So a month arrives as `<YYYY-MM>.rev-001.jsonl`, then `rev-002`, each one the whole month as it
 * stood. Readers take the highest revision.
 *
 * PARTS WERE REJECTED ONCE, AND THE OBJECTION WAS RIGHT AS STATED: a missing part truncates the
 * history silently, while a missing revision leaves a visible gap in a numbered sequence. What
 * changed is not the objection but the arithmetic behind it. A revision is uploaded by a session,
 * and a session's only way to create a file is to reproduce its bytes inside a tool call — a channel
 * that was measured truncating a 95 KB month to 22% of itself and reporting success. An unbounded
 * single file is therefore not the safe option; it is the one whose failure is silent, because the
 * store ends up holding a file with the right name and the wrong contents.
 *
 * So parts are allowed, under the condition that answers the original objection: the expected count
 * is inside every part's own name — `<YYYY-MM>.rev-<NNN>.part-<NN>-of-<MM>.jsonl` — so a missing part
 * is a visible gap in a numbered sequence in exactly the way a missing revision is, readable from the
 * folder listing alone without opening anything. `--restore` refuses a revision whose set is
 * incomplete and names the parts it is missing, and `--receipt` will not settle a month until the
 * concatenation of what was uploaded hashes to the month it froze.
 *
 * A month that fits in one part is still one file with the old name. The shape only appears when the
 * month outgrows what a session can carry.
 */

const MONTH_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.jsonl$/;
const MONTH = /^\d{4}-(?:0[1-9]|1[0-2])$/;
const REVISION_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.rev-(\d{3,})\.jsonl$/;
const SHARD_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.rev-(\d{3,})\.part-(\d{2,})-of-(\d{2,})\.jsonl$/;

/**
 * How many bytes a part may hold. Not a store limit — the store takes far more — but the budget of
 * the channel that has to carry it: the session reproduces these bytes inside a tool call, and the
 * failure mode past the budget is a truncated upload that reports success. 20 KB leaves room under
 * the measured cliff rather than sitting on it.
 */
const SHARD_BYTES = 20_000;

/** Shape of a receipt file, versioned for the same reason a journal row is. */
export const RECEIPT_SCHEMA = 1;

const HELP = `Xenth AI journal-sync — put a month of the journal in the client's store, and say what is owed.

  node tools/journal-sync.mjs [--company <dir>] [--json]
  node tools/journal-sync.mjs --check
  node tools/journal-sync.mjs --stage [--month YYYY-MM] [--shard-bytes N]
  node tools/journal-sync.mjs --receipt --month YYYY-MM --file-id <id>[,<id>...]
  node tools/journal-sync.mjs --restore --from <dir>

  (no command)   Report every month: rows on this machine, rows in the store, rows owed.
  --check        Exit 1 when any month has rows the store does not hold. What doctor calls.
  --stage        Freeze the month into journal/outbox/<YYYY-MM>.rev-<NNN>.jsonl and print the file
                 to upload, its digest and the folder it belongs in. A month too large for one
                 upload is split into .part-<NN>-of-<MM> files, each with its own digest.
  --receipt      Record that the staged revision reached the store, by the id the connector returned.
                 Verifies the staged bytes before believing it, then removes the staged copy. For a
                 sharded revision, pass one id per part in part order, comma separated: the receipt
                 is refused unless every part is present and their concatenation hashes to the month.
  --restore      Rebuild the local journal from revisions downloaded into <dir>. Refuses to write
                 over a local month that holds rows the store does not.

  --company <dir>  The engagement directory. Default: the bound company found from the cwd.
  --month          One month. Default: every month with rows owed.
  --shard-bytes    Bytes a single part may hold before --stage splits the month. Default 20000.
  --json           Machine-readable output.

THE UPLOAD IS NOT DONE HERE. A CLI has no connector credentials. This stages a file and verifies
what came back; a session creates it in the store, inside the company's own \`journal/\` folder.

EXIT CODES
  0  the command did what it says.
  1  --check found rows the store does not hold, or --restore refused rather than lose local rows.
  2  could not run: no company bound, a bad argument, or a month that does not parse.
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

const shardName = (month, rev, part, total) =>
  `${month}.rev-${String(rev).padStart(3, "0")}.part-${String(part).padStart(2, "0")}-of-${String(total).padStart(2, "0")}.jsonl`;

/**
 * Cuts a month into byte ranges that each end on a row boundary. A row is never split: a single row
 * longer than the budget travels alone and oversized rather than broken, because half a JSON object
 * is not a row a reader can skip — it is a file a reader cannot parse.
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
 * A group is either a single whole-month file or a set of parts; both spellings of one revision in
 * one folder is itself a defect, and `resolveGroup` refuses it rather than choosing.
 */
const groupRevisions = (names) => {
  const groups = new Map();
  for (const name of names) {
    const plain = REVISION_FILE.exec(name);
    const shard = SHARD_FILE.exec(name);
    const month = (plain ?? shard)?.[1];
    if (!month) continue;
    const rev = Number((plain ?? shard)[2]);
    if (!groups.has(rev)) groups.set(rev, { month, rev, plain: null, parts: new Map() });
    const group = groups.get(rev);
    if (plain) group.plain = name;
    else group.parts.set(Number(shard[3]), { name, of: Number(shard[4]) });
  }
  return groups;
};

/**
 * The bytes a revision actually stands for, plus what it is missing. `missing` non-empty is the only
 * honest answer for an incomplete part set: concatenating what is there would produce a shorter month
 * that still parses, which is exactly the silent truncation the part naming exists to prevent.
 */
const resolveGroup = (dir, group) => {
  if (group.plain && group.parts.size) {
    return { bytes: Buffer.alloc(0), names: [], digests: [], missing: ["both a whole-month file and parts for this revision"], expected: 0 };
  }
  if (group.plain) {
    const bytes = readFileSync(join(dir, group.plain));
    return { bytes, names: [group.plain], digests: [sha(bytes)], missing: [], expected: 1 };
  }
  const declared = [...new Set([...group.parts.values()].map((d) => d.of))];
  if (declared.length !== 1) {
    return { bytes: Buffer.alloc(0), names: [], digests: [], missing: [`parts disagree on the total (${declared.join(", ")})`], expected: 0 };
  }
  const expected = declared[0];
  const missing = [];
  for (let i = 1; i <= expected; i++) if (!group.parts.has(i)) missing.push(i);
  if (missing.length) return { bytes: Buffer.alloc(0), names: [], digests: [], missing, expected };
  const names = [];
  const buffers = [];
  const digests = [];
  for (let i = 1; i <= expected; i++) {
    const { name } = group.parts.get(i);
    const bytes = readFileSync(join(dir, name));
    names.push(name);
    buffers.push(bytes);
    digests.push(sha(bytes));
  }
  return { bytes: Buffer.concat(buffers), names, digests, missing: [], expected };
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
  const values = new Set(["company", "month", "file-id", "from", "shard-bytes"]);
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

const stage = (root, states, company, limit = SHARD_BYTES) => {
  const owed = states.filter((s) => s.owed > 0);
  if (!owed.length) return { staged: [], text: "nothing to stage: every row on this machine is already in the store.\n" };
  mkdirSync(outboxDir(root), { recursive: true });
  const staged = owed.map((s) => {
    const rev = s.revision + 1;
    const name = `${s.month}.rev-${String(rev).padStart(3, "0")}.jsonl`;
    const path = join(outboxDir(root), name);
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
        target: name,
        detail: `${s.owed} row(s) not yet in the store`,
      },
      { cwd: root }
    );
    copyFileSync(s.file, path);
    const frozen = measure(path);
    const common = {
      month: s.month,
      rev,
      rows: frozen.rows,
      bytes: frozen.bytes,
      digest: frozen.digest,
      new_rows: frozen.rows - s.synced,
    };
    if (frozen.bytes <= limit) return { ...common, name, path, parts: null };
    /**
     * Sharded. The single frozen file is removed once its parts exist, so the outbox never holds two
     * spellings of the same revision: a `--receipt` free to pick either could settle a month against
     * bytes nobody uploaded.
     */
    const ranges = shardRanges(frozen.rowEnds, limit);
    const parts = ranges.map(([from, to], i) => {
      const partName = shardName(s.month, rev, i + 1, ranges.length);
      const partPath = join(outboxDir(root), partName);
      const slice = frozen.raw.subarray(from, to);
      writeFileSync(partPath, slice);
      return {
        part: i + 1,
        of: ranges.length,
        name: partName,
        path: partPath,
        rows: measureBytes(slice).rows,
        bytes: slice.length,
        digest: sha(slice),
      };
    });
    rmSync(path, { force: true });
    return { ...common, name: null, path: null, parts };
  });
  const folder = company?.store?.root ?? "(store.root is not set in the manifest)";
  const text =
    `${staged.length} month(s) staged. Upload each file below into the company's journal/ folder,\n` +
    `under store root ${folder}, keeping the name exactly:\n\n` +
    staged
      .map((s) =>
        s.parts
          ? `  ${s.month} revision ${s.rev} — ${s.parts.length} parts, ${s.rows} rows ` +
            `(${s.new_rows} new since revision ${s.rev - 1})\n` +
            `    month digest: ${s.digest}\n` +
            s.parts
              .map((d) => `    ${d.name}\n      file:   ${d.path}\n      rows:   ${d.rows}, ${d.bytes} bytes\n      digest: ${d.digest}\n`)
              .join("") +
            `    then:   node tools/journal-sync.mjs --receipt --month ${s.month} --file-id <id-1>,<id-2>,...\n` +
            "    Upload every part. The ids go in part order, comma separated, and the receipt is\n" +
            "    refused unless their concatenation hashes to the month digest above.\n"
          : `  ${s.name}\n    file:   ${s.path}\n    rows:   ${s.rows} (${s.new_rows} new since revision ${s.rev - 1})\n` +
            `    digest: ${s.digest}\n    then:   node tools/journal-sync.mjs --receipt --month ${s.month} --file-id <id>\n`
      )
      .join("\n") +
    "\nThe upload is yours to make — this tool has no connector credentials. Record the id the\n" +
    "connector returns; a revision with no receipt is a revision nobody can prove arrived.\n";
  return { staged, text };
};

const receipt = (root, month, fileId, company) => {
  let names = [];
  try {
    names = readdirSync(outboxDir(root)).filter((n) => (REVISION_FILE.test(n) || SHARD_FILE.test(n)) && n.startsWith(`${month}.`));
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
  const ids = String(fileId)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const resolved = resolveGroup(outboxDir(root), group);
  if (resolved.missing.length) {
    return fail(
      `${month} revision ${rev} is staged in ${group.parts.size} of ${resolved.expected} parts. Missing ` +
        `part(s) ${resolved.missing.join(", ")}.\n` +
        "Nothing was settled. Re-run --stage: a receipt written over an incomplete set would claim rows\n" +
        "that are not in the store."
    );
  }
  if (ids.length !== resolved.names.length) {
    return fail(
      `${month} revision ${rev} is ${resolved.names.length} file(s) and --file-id carries ${ids.length} id(s).\n` +
        (resolved.names.length > 1
          ? "Pass one id per part, in part order, comma separated. The order is what ties an id to the\n" +
            "bytes it acknowledges, so a receipt cannot be written from a count that does not match."
          : "Pass exactly one id.")
    );
  }
  const path = resolved.names.length === 1 ? join(outboxDir(root), resolved.names[0]) : null;
  const name = resolved.names.length === 1 ? resolved.names[0] : `${month}.rev-${String(rev).padStart(3, "0")} (${resolved.names.length} parts)`;
  const frozen = measureBytes(resolved.bytes);
  const existing = readReceipt(root, month) ?? {
    schema: RECEIPT_SCHEMA,
    month,
    company: company?.id ?? null,
    revisions: [],
  };
  existing.revisions.push({
    rev,
    name,
    rows: frozen.rows,
    bytes: frozen.bytes,
    digest: frozen.digest,
    file_id: ids.length === 1 ? ids[0] : ids,
    /**
     * Recorded per part, and not merely as a count. A month restored from the store is reassembled
     * from these names in this order; without them a later session would have to trust a folder
     * listing to be complete, which is the assumption the whole tool refuses to make.
     */
    parts:
      resolved.names.length === 1
        ? null
        : resolved.names.map((partName, i) => ({
            part: i + 1,
            of: resolved.names.length,
            name: partName,
            digest: resolved.digests[i],
            file_id: ids[i],
          })),
    at: new Date().toISOString(),
  });
  writeReceipt(root, month, existing);
  for (const partName of resolved.names) rmSync(join(outboxDir(root), partName), { force: true });

  /**
   * No journal row is written here, and the absence is deliberate: a row appended now would not be
   * inside the revision it describes, so the month would be owed again the instant it was settled.
   * `--stage` already recorded the staging; what this adds is the id and the digest in the receipt,
   * which is the part a later session needs and a row could not carry anyway.
   */
  return finish(
    `receipt written: ${month} revision ${rev}, ${frozen.rows} rows, ${frozen.digest}, ` +
      `store id${ids.length > 1 ? "s" : ""} ${ids.join(", ")}.\n` +
      (resolved.names.length > 1
        ? `Verified across ${resolved.names.length} parts: their concatenation hashes to the month above.\n`
        : "") +
      "The staged copy was removed; the store holds those bytes now.\n",
    0
  );
};

const restore = (root, from) => {
  let names = [];
  try {
    names = readdirSync(from).filter((n) => REVISION_FILE.test(n) || SHARD_FILE.test(n));
  } catch {
    return fail(`cannot read ${from}`);
  }
  if (!names.length) {
    return fail(
      `no <YYYY-MM>.rev-<NNN>.jsonl files in ${from}. Download the highest revision of each month\n` +
        "from the company's journal/ folder first; that name is what says which month it is. A month\n" +
        "stored in parts is <YYYY-MM>.rev-<NNN>.part-<NN>-of-<MM>.jsonl, and every part is needed."
    );
  }
  const byMonth = new Map();
  for (const group of groupRevisions(names).values()) {
    const current = byMonth.get(group.month);
    if (!current || current.rev < group.rev) byMonth.set(group.month, group);
  }

  const restored = [];
  const refused = [];
  for (const [month, group] of [...byMonth.entries()].sort()) {
    const rev = group.rev;
    const resolved = resolveGroup(from, group);
    if (resolved.missing.length) {
      refused.push({
        month,
        reason: `revision ${rev} is incomplete — missing part(s) ${resolved.missing.join(", ")} of ${resolved.expected}`,
      });
      continue;
    }
    const name = resolved.names.length === 1 ? resolved.names[0] : `${month}.rev-${String(rev).padStart(3, "0")} (${resolved.names.length} parts)`;
    const incoming = measureBytes(resolved.bytes);
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
    mkdirSync(executionDir(root), { recursive: true });
    writeFileSync(target, resolved.bytes);
    writeReceipt(root, month, {
      schema: RECEIPT_SCHEMA,
      month,
      company: null,
      revisions: [
        {
          rev,
          name,
          rows: incoming.rows,
          bytes: incoming.bytes,
          digest: incoming.digest,
          file_id: null,
          parts:
            resolved.names.length === 1
              ? null
              : resolved.names.map((partName, i) => ({ part: i + 1, of: resolved.names.length, name: partName, digest: resolved.digests[i], file_id: null })),
          at: new Date().toISOString(),
          restored: true,
        },
      ],
    });
    restored.push({ month, rev, rows: incoming.rows });
  }

  const text =
    (restored.length
      ? `restored ${restored.map((r) => `${r.month} (revision ${r.rev}, ${r.rows} rows)`).join(", ")}\n`
      : "nothing restored\n") +
    (refused.length
      ? `\nREFUSED: ${refused.map((r) => `${r.month} — ${r.reason}`).join("; ")}\n` +
        "A month refused for local rows holds evidence this machine has and the store does not: sync\n" +
        "it first, because a restore that overwrote it would delete the only copy. A month refused for\n" +
        "a missing part is a download that did not finish — fetch the named parts and run it again.\n"
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

  const states = allMonths(root).filter((s) => !args.month || s.month === args.month);
  const diverged = states.filter((s) => s.diverged);
  if (diverged.length && !args.check) return fail(divergedMessage(diverged), 3);

  if (args.receipt) {
    if (!args.month) return fail("--receipt needs --month YYYY-MM");
    if (!args["file-id"]) return fail("--receipt needs --file-id <id>: an upload nobody can point at is not a delivery");
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
