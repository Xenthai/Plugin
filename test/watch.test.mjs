import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { analyse } from "../bin/watch.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CLI = join(ROOT, "bin", "watch.mjs");
const SANDBOX = join(HERE, "sandbox", "watch");

const DAY = 86_400_000;
const NOW = Date.parse("2026-09-03T12:00:00.000Z");

/** Rows as `lib/journal.mjs` actually writes them: every row carries an ISO `ts`. */
const row = (event, daysAgo, extra = {}) => ({
  schema: 1,
  plugin: "0.2.0",
  ts: new Date(NOW - daysAgo * DAY).toISOString(),
  ts_local: new Date(NOW - daysAgo * DAY).toISOString().slice(0, 16).replace("T", " "),
  company: "acme-sa",
  actor: "ai",
  event,
  result: "ok",
  ...extra,
});

/** Eight active days, two days apart, ending three days ago — a live engagement with a 2-day cadence. */
const LIVE = [
  ...[16, 14, 12, 10, 8, 6, 5, 3].flatMap((d) => [
    row("ai_action", d, { tool: "Write" }),
    row("review_start", d, { actor: "person:Ana" }),
    row("review_end", d, { actor: "person:Ana" }),
  ]),
  row("approval", 5, { actor: "person:Ana" }),
  row("escalation", 6),
  row("health", 4, { actor: "system" }),
  row("ai_action", 8, { tool: "Edit", actor: "person:Beto" }),
];

const store = (name, rows) => {
  const dir = join(SANDBOX, name, "journal", "execution");
  mkdirSync(dir, { recursive: true });
  const byMonth = new Map();
  for (const r of rows) {
    const m = r.ts ? r.ts.slice(0, 7) : "2026-09";
    if (!byMonth.has(m)) byMonth.set(m, []);
    byMonth.get(m).push(r);
  }
  for (const [m, rs] of byMonth) {
    writeFileSync(join(dir, `${m}.jsonl`), `${rs.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
  }
  return join(SANDBOX, name);
};

const run = (...argv) => spawnSync(process.execPath, [CLI, ...argv], { encoding: "utf8", cwd: ROOT });
const verdictOf = (d, id) => d.signals.find((s) => s.id === id)?.verdict;

let failed = 0;
const check = (label, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok && detail !== undefined) console.log(`        ${String(detail).slice(0, 300)}`);
};

rmSync(SANDBOX, { recursive: true, force: true });
const liveStore = store("live", LIVE);

const live = analyse(LIVE, NOW);
check("a live engagement reports OK on silence", verdictOf(live, "silence") === "OK", JSON.stringify(live.signals.find((s) => s.id === "silence")));
check("the cadence is measured from the client's own gaps", live.cadence_days === 2, `cadence ${live.cadence_days}`);
check("activity is counted in days, not rows, so one busy afternoon is one day", live.active_days === 9, `${live.active_days} days from ${LIVE.length} rows`);

/**
 * The silence threshold is a multiple of THIS client's median gap, not a global constant. A client
 * recording every two days and one recording daily have different silences, and one fixed threshold
 * either cries wolf on the first or misses the second.
 */
const gone = analyse(LIVE.map((r) => ({ ...r, ts: new Date(Date.parse(r.ts) - 20 * DAY).toISOString() })), NOW);
check("the same engagement twenty days later reports ACT on silence", verdictOf(gone, "silence") === "ACT", JSON.stringify(gone.signals.find((s) => s.id === "silence")));

/**
 * The bug this file was written after finding: rows present, not one with a parseable `ts`. Every
 * row `lib/journal.mjs` writes carries one, so their absence means the journal was hand-edited,
 * truncated, or written by something else. Rendering that as UNKNOWN would be an absence reading as
 * calm, which is the single failure this tool exists to prevent.
 */
const undated = analyse(LIVE.map(({ ts, ...rest }) => rest), NOW);
check("rows with no parseable timestamp are ACT, never quiet or unknown", verdictOf(undated, "silence") === "ACT", JSON.stringify(undated.signals.find((s) => s.id === "silence")));

check("an empty journal is UNKNOWN on silence rather than OK", verdictOf(analyse([], NOW), "silence") === "UNKNOWN", JSON.stringify(analyse([], NOW).signals[0]));

/**
 * AI rows with no person's rows is the dangerous shape, not the quiet one — work is being produced
 * and nothing is being reviewed. It outranks plain silence.
 */
const unreviewed = analyse(LIVE.filter((r) => !String(r.actor).startsWith("person:")), NOW);
check("AI work with zero human rows is ACT on review", verdictOf(unreviewed, "human_review") === "ACT", JSON.stringify(unreviewed.signals.find((s) => s.id === "human_review")));

check("zero escalations alongside AI work is a finding, not a success", verdictOf(analyse(LIVE.filter((r) => r.event !== "escalation"), NOW), "escalations") === "WATCH", "escalations");
check("an unnamed approval is ACT", verdictOf(analyse([...LIVE, row("approval", 2)], NOW), "unnamed_approvals") === "ACT", "unnamed");
check("a guard rejection is ACT", verdictOf(analyse([...LIVE, row("guard_error", 2, { result: "error" })], NOW), "guard") === "ACT", "guard");
check("two named people clears the single-point-of-failure signal", verdictOf(live, "people") === "OK", `people=${live.signals.find((s) => s.id === "people")?.value}`);
check("a stale doctor is ACT", verdictOf(analyse(LIVE.map((r) => (r.event === "health" ? row("health", 90, { actor: "system" }) : r)), NOW), "install") === "ACT", "install");

/**
 * No composite score, in either direction. `ROADMAP.md` rules one out as indefensible at n=1, and
 * averaging a silence signal against a governance defect would hide whichever one mattered.
 */
check(
  "the digest carries a worst-of verdict and no score",
  live.verdict !== undefined && !("score" in live) && !live.signals.some((s) => "score" in s || "weight" in s),
  Object.keys(live).join(",")
);

/**
 * The whole reason this file may be placed in a folder shared with the practice. Every one of these
 * strings is present in the fixture rows and must not survive into the digest.
 */
const rendered = run("--journal", liveStore, "--company", "acme-sa").stdout;
const leaks = ["Ana", "Beto", "Write", "Edit", "acme-sa.jsonl"].filter((s) => rendered.includes(s));
check("the rendered digest leaks no person, tool or file name", leaks.length === 0, `leaked: ${leaks.join(", ")}`);

/**
 * The deterministic half of `feedback`, carried by the digest so plugin signal accumulates without
 * waiting for a session. `detect` returns each finding's subject — a file path, an escalation reason
 * — and every one of those is the company's data. Only the shape may survive, so this asserts the
 * detector fired AND that its subject did not travel.
 */
const recurring = store("recurring", [0, 1, 2].flatMap((m) =>
  [10, 20].map((d) => ({
    ...row("ai_action", d + m * 31, { tool: "Write", target: { file_path: "reportes/cotizacion-secreta.md" }, capability: "process" }),
  }))
));
const rec = run("--journal", recurring, "--json");
let recData = null;
try {
  recData = JSON.parse(rec.stdout);
} catch {}
check(
  "the digest carries which detector fired and how wide, never its subject",
  recData?.plugin?.recurrence?.some((r) => r.detector === "recurring-target" && r.widest_span >= 2) &&
    !rec.stdout.includes("cotizacion-secreta"),
  JSON.stringify(recData?.plugin?.recurrence)
);
check(
  "capabilities seen are counted, so the ones missing from the list are the finding",
  recData?.plugin?.capabilities_seen?.some((c) => c.capability === "process" && c.rows > 0),
  JSON.stringify(recData?.plugin?.capabilities_seen)
);

/**
 * The period a row belongs to comes from the file name, not from its `ts`. Grouping by an
 * unparseable timestamp would put every row in one `undefined` bucket, make every pattern one period
 * wide, and report "nothing recurred" — a silent false negative in the exact tool built to catch
 * silent false negatives.
 */
const undatedRecurring = join(SANDBOX, "undated-recurring");
mkdirSync(join(undatedRecurring, "journal", "execution"), { recursive: true });
for (const month of ["2026-07", "2026-08", "2026-09"]) {
  const rs = [10, 20].map((d) => {
    const { ts, ...rest } = row("ai_action", d, { tool: "Write", target: { file_path: "x.md" }, capability: "process" });
    return rest;
  });
  const body = rs.map((r) => JSON.stringify(r)).join("\n");
  writeFileSync(join(undatedRecurring, "journal", "execution", `${month}.jsonl`), `${body}\n`, "utf8");
}
const ur = run("--journal", undatedRecurring, "--json");
let urData = null;
try {
  urData = JSON.parse(ur.stdout);
} catch {}
check(
  "recurrence still groups when rows carry no timestamp, because the period is the file name",
  (urData?.plugin?.recurrence?.length ?? 0) > 0,
  JSON.stringify(urData?.plugin?.recurrence)
);

const jsonOut = run("--journal", liveStore, "--json").stdout;
let parsed = null;
try {
  parsed = JSON.parse(jsonOut);
} catch {}
const jsonLeaks = ["Ana", "Beto", "Write", "Edit"].filter((s) => jsonOut.includes(s));
check("--json leaks nothing either, and carries the signals", parsed?.signals?.length > 0 && jsonLeaks.length === 0, `leaked: ${jsonLeaks.join(", ")}`);

/**
 * A monitor on a schedule that exits non-zero on a finding is a monitor that gets disabled after the
 * second alert. The verdict travels in the file, not in the exit code.
 */
const withFinding = store("finding", [...LIVE, row("approval", 2)]);
check("a finding still exits 0, because a scheduled monitor must keep running", run("--journal", withFinding).status === 0, `exit ${run("--journal", withFinding).status}`);
check("a missing journal exits 2 and names both causes", (() => {
  const r = run("--journal", join(SANDBOX, "nope"));
  return r.status === 2 && /inactive in chat on the web/.test(r.stderr) && /Neither is a quiet month/.test(r.stderr);
})(), run("--journal", join(SANDBOX, "nope")).stderr.slice(0, 160));

check("--out writes the digest and reports the verdict on stdout", (() => {
  const out = join(SANDBOX, "digest", "acme.md");
  const r = run("--journal", liveStore, "--out", out);
  return r.status === 0 && /OK|WATCH|ACT/.test(r.stdout) && readFileSync(out, "utf8").includes("Digest de compromiso");
})(), "out");

check("--help exits 0 and states that it runs with no model in the loop", (() => {
  const r = run("--help");
  return r.status === 0 && /without a session/.test(r.stdout) && /counts, dates and verdicts ONLY/.test(r.stdout);
})(), "help");

check("an unknown option exits 2", run("--journal", liveStore, "--nope").status === 2, `exit ${run("--journal", liveStore, "--nope").status}`);

console.log(`\n${failed ? `${failed} failed` : `every assertion passed over ${LIVE.length} rows across 9 active days`}`);
process.exit(failed ? 1 : 0);
