import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CLI = join(ROOT, "bin", "report.mjs");
const SANDBOX = join(HERE, "fixtures", "report-sandbox");
const STORE = join(SANDBOX, "store");
const EXECUTION = join(STORE, "journal", "execution");
const BOUND_ROOT = "root-folder-1";
const FOREIGN_ROOT = "other-folder-9";

const row = (event, extra = {}) => ({
  schema: 1,
  plugin: "0.1.0",
  ts: null,
  ts_local: null,
  session: null,
  turn: null,
  company: "acme-sa",
  actor: "ai",
  event,
  tool: null,
  capability: null,
  target: null,
  why: "fixture",
  result: "ok",
  approval: null,
  bytes: null,
  digest: null,
  detail: null,
  ...extra,
});

const at = (clock) => ({ ts: `2026-09-01T${clock}Z`, ts_local: `2026-09-01 ${clock.replace("Z", "")}` });

/**
 * Eighteen rows whose every aggregate is known by hand: 4 ai_action, 2 escalation, 2 approvals of
 * which one is anonymous, two review pairs of 12 and 18 minutes plus one start that never closes,
 * one each of lookup/blocked/delivery/guard_error/error, and two references to a folder other than
 * the bound root — one via parentId and one via folderId, so both compared fields are exercised.
 */
const SEPTEMBER = [
  row("ai_action", { ...at("15:00:00"), tool: "Write", target: { file_path: "content/2026-09/plan.md", parentId: BOUND_ROOT } }),
  row("ai_action", { ...at("15:01:00"), tool: "Edit", target: { file_path: "content/2026-09/plan.md", parentId: BOUND_ROOT } }),
  row("ai_action", { ...at("15:02:00"), tool: "Write", target: { file_path: "content/2026-09/piece-01.md", parentId: BOUND_ROOT } }),
  row("ai_action", { ...at("15:03:00"), tool: "Write", target: { file_path: "content/2026-09/piece-02.md", parentId: FOREIGN_ROOT } }),
  row("escalation", { ...at("15:10:00"), capability: "social", why: "claim without a proof row" }),
  row("escalation", { ...at("15:11:00"), capability: "social", why: "figure needs the director" }),
  row("review_start", { ...at("16:00:00"), actor: "person:Ana", session: "S1" }),
  row("review_start", { ...at("16:00:30"), actor: "person:Beto", session: "S1" }),
  row("review_end", { ...at("16:12:00"), actor: "person:Ana", session: "S1" }),
  row("review_end", { ...at("16:18:30"), actor: "person:Beto", session: "S1" }),
  row("review_start", { ...at("17:00:00"), actor: "person:Ana", session: "S2", why: "second pass, never closed" }),
  row("approval", { ...at("16:13:00"), actor: "person:Ana", approval: "aprobado", why: "approved the plan" }),
  row("approval", { ...at("16:14:00"), why: "approval with no person named" }),
  row("lookup", { ...at("15:20:00") }),
  row("blocked", { ...at("15:21:00"), result: "blocked" }),
  row("delivery", { ...at("15:22:00"), target: { title: "plan 2026-09", folderId: FOREIGN_ROOT } }),
  row("guard_error", { ...at("15:23:00"), result: "error" }),
  row("error", { ...at("15:24:00"), result: "error" }),
];

const AUGUST = [row("ai_action", { ts: "2026-08-20T10:00:00Z", ts_local: "2026-08-20 10:00:00", tool: "Write" })];

const run = (...argv) => spawnSync(process.execPath, [CLI, ...argv], { encoding: "utf8", cwd: ROOT, maxBuffer: 16 * 1024 * 1024 });

let failed = 0;

const check = (label, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok && detail !== undefined) console.log(`        ${String(detail).slice(0, 400)}`);
};

rmSync(SANDBOX, { recursive: true, force: true });
mkdirSync(EXECUTION, { recursive: true });
writeFileSync(join(EXECUTION, "2026-09.jsonl"), `${SEPTEMBER.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
writeFileSync(join(EXECUTION, "2026-08.jsonl"), `${AUGUST.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");

const help = run("--help");
check("--help exits 0", help.status === 0, `exit ${help.status}`);
check("--help documents every option", ["--journal", "--month", "--out", "--root", "--json"].every((f) => help.stdout.includes(f)), help.stdout.slice(0, 200));

const unknown = run("--journal", STORE, "--nope");
check("an unknown option exits non-zero", unknown.status !== 0, `exit ${unknown.status}`);

const positional = run(STORE);
check("a positional argument exits non-zero", positional.status !== 0, `exit ${positional.status}`);

const noJournal = run("--json");
check("a missing --journal exits non-zero", noJournal.status !== 0, `exit ${noJournal.status}`);

const valueless = run("--journal");
check("a flag with no value exits non-zero", valueless.status !== 0, `exit ${valueless.status}`);

const badMonth = run("--journal", STORE, "--month", "sept");
check("a malformed --month exits non-zero", badMonth.status !== 0, `exit ${badMonth.status}`);

const absentMonth = run("--journal", STORE, "--month", "2026-01");
check("a month with no journal file exits non-zero", absentMonth.status !== 0, `exit ${absentMonth.status}`);

const emptyDir = join(SANDBOX, "empty");
mkdirSync(emptyDir, { recursive: true });
const noRows = run("--journal", emptyDir);
check("a directory with no month files exits non-zero", noRows.status !== 0, `exit ${noRows.status}`);

const jsonRes = run("--journal", STORE, "--month", "2026-09", "--root", BOUND_ROOT, "--json");
let computed = null;
try {
  computed = JSON.parse(jsonRes.stdout);
} catch {}

if (!computed) {
  check("--json emits parsable figures", false, jsonRes.stderr || jsonRes.stdout.slice(0, 400));
} else {
  const period = computed.periods[0];
  check("one period is reported for --month 2026-09", computed.periods.length === 1 && period.month === "2026-09", JSON.stringify(computed.periods.map((p) => p.month)));
  check("18 rows counted", period.rows === 18, period.rows);
  check("source names the journal file", period.source === "2026-09.jsonl", period.source);
  check("measured-by carries the plugin version from the rows", period.measuredBy === "Xenth AI Plugin 0.1.0 desde la bitácora", period.measuredBy);
  check("4 automation runs paired with 2 escalations", period.automation.runs === 4 && period.automation.escalations === 2, JSON.stringify(period.automation));
  check("runs are never exposed without escalations", Object.keys(period.automation).sort().join(",") === "escalations,runs", Object.keys(period.automation).join(","));
  check("1 named approval, by Ana", period.approvals.named === 1 && period.approvals.approvers[0][0] === "Ana", JSON.stringify(period.approvals.approvers));
  check("1 unnamed approval surfaced as a defect", period.approvals.unnamed === 1 && period.defects.some((d) => d.includes("aprobación(es) sin persona nombrada")), JSON.stringify(period.defects));
  check("2 review pairs totalling 30 minutes", period.review.pairs === 2 && period.review.minutes === 30, JSON.stringify({ pairs: period.review.pairs, minutes: period.review.minutes }));
  check("touch time split by person: Ana 12, Beto 18", JSON.stringify(period.review.byActor) === JSON.stringify([["person:Beto", { pairs: 1, minutes: 18 }], ["person:Ana", { pairs: 1, minutes: 12 }]]), JSON.stringify(period.review.byActor));
  check("the unmatched review start is reported separately", period.review.unmatchedStarts.length === 1 && period.review.unmatchedStarts[0].session === "S2", JSON.stringify(period.review.unmatchedStarts));
  check("the unmatched start is surfaced as a defect", period.defects.some((d) => d.includes("inicio(s) de revisión sin cierre")), JSON.stringify(period.defects));
  check("no unmatched review ends in the fixture", period.review.unmatchedEnds === 0, period.review.unmatchedEnds);
  check("lookup, blocked, delivery, guard_error and error each count 1", JSON.stringify(period.counts) === JSON.stringify({ lookup: 1, blocked: 1, delivery: 1, guard_error: 1, error: 1 }), JSON.stringify(period.counts));
  check("actors tallied: ai 12, person:Ana 4, person:Beto 2", JSON.stringify(period.actors) === JSON.stringify([["ai", 12], ["person:Ana", 4], ["person:Beto", 2]]), JSON.stringify(period.actors));
  check("both foreign-folder references are listed", period.unauthorized.foreign.length === 2 && period.unauthorized.foreign.every((f) => f.value === FOREIGN_ROOT), JSON.stringify(period.unauthorized.foreign));
  check("the foreign write is listed by parentId and the delivery by folderId", period.unauthorized.foreign.map((f) => f.field).sort().join(",") === "folderId,parentId", JSON.stringify(period.unauthorized.foreign.map((f) => f.field)));
  check("the unauthorized line refuses the clean claim when guard_error and foreign rows exist", period.unauthorized.statement.includes("**no** sostiene"), period.unauthorized.statement);
}

const markdown = run("--journal", STORE, "--month", "2026-09", "--root", BOUND_ROOT);
check("the report renders and exits 0", markdown.status === 0, markdown.stderr.slice(0, 400));
const body = markdown.stdout;

check("the report body is es-MX", body.includes("Cifras medidas y evidenciadas") && body.includes("Acciones no autorizadas"), body.slice(0, 200));
check("no figure is called certificada or verificada", !/certificad|verificad/i.test(body), (body.match(/.{0,60}(certificad|verificad).{0,60}/i) ?? [])[0]);
check("the ISAE columns are present on the metric table", ["Métrica", "Definición", "Fuente", "Periodo", "Medido por"].every((h) => body.includes(h)), body.slice(0, 200));
check("every ISAE row carries the source file and the measurer", (body.match(/\| 2026-09\.jsonl \| 2026-09 \| Xenth AI Plugin 0\.1\.0 desde la bitácora \|/g) ?? []).length >= 13, (body.match(/\| 2026-09\.jsonl \| 2026-09 \|/g) ?? []).length);
check("the run count is rendered only beside the escalation count", /Ejecuciones automatizadas acompañadas de escalamientos[^|]*\| 4 ejecuciones \/ 2 escalamientos \|/.test(body), (body.match(/Ejecuciones automatizadas[^\n]*/) ?? [])[0]);
check("the unnamed approval is labelled a defect in the body", /Defecto de evidencia:\*\* 1 de 2 aprobación\(es\) no nombran a la persona/.test(body), (body.match(/Defecto de evidencia[^\n]*/) ?? [])[0]);
check("the unmatched start is visible with its session", body.includes("Inicios de revisión sin cierre:** 1") && body.includes("S2"), (body.match(/Inicios de revisión sin cierre[^\n]*/) ?? [])[0]);
check("both foreign folder references appear in the body", (body.match(new RegExp(FOREIGN_ROOT, "g")) ?? []).length >= 2, (body.match(new RegExp(FOREIGN_ROOT, "g")) ?? []).length);
check("the report states the journal cannot prove absence", body.includes("no una prueba de ausencia"), false);
check("the report states it describes activity, not improvement", body.includes("Describe actividad, no mejora"), false);
check("the report claims no counterfactual", body.includes("No contiene ningún contrafactual"), false);

const clean = [row("ai_action", { ...at("15:00:00"), tool: "Write", target: { file_path: "a.md", parentId: BOUND_ROOT } }), row("escalation", at("15:05:00"))];
const cleanDir = join(SANDBOX, "clean", "journal", "execution");
mkdirSync(cleanDir, { recursive: true });
writeFileSync(join(cleanDir, "2026-09.jsonl"), `${clean.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");

const cleanRes = run("--journal", join(SANDBOX, "clean"), "--root", BOUND_ROOT);
check(
  "with no guard_error and no foreign write the exact clean line is emitted",
  cleanRes.status === 0 && cleanRes.stdout.includes("No se registraron filas `guard_error` y no se registró ninguna escritura al almacén fuera de la carpeta raíz vinculada"),
  (cleanRes.stdout.match(/> No se registraron[^\n]*/) ?? [])[0] ?? cleanRes.stderr.slice(0, 300)
);

check(
  "a period with one run reads in the singular",
  cleanRes.stdout.includes("| 1 ejecución / 1 escalamiento |"),
  (cleanRes.stdout.match(/\| \d+ ejecuci[^|]*\|/) ?? [])[0]
);

check(
  "the Persona column drops the person: prefix",
  body.includes("| Ana | 1 | 12 |") && body.includes("| Ana | S2 |"),
  (body.match(/\| (?:person:)?Ana \| [^\n]*/g) ?? []).join(" ~ ")
);

const unbounded = run("--journal", join(SANDBOX, "clean"));
check(
  "without --root the report says the folder check did not run instead of claiming it passed",
  unbounded.stdout.includes("**no se ejecutó**") && !unbounded.stdout.includes("no se registró ninguna escritura al almacén fuera"),
  (unbounded.stdout.match(/> No se registraron[^\n]*/) ?? [])[0]
);

const bothMonths = run("--journal", STORE);
check("with no --month every month found is reported", bothMonths.stdout.includes("## Periodo 2026-08") && bothMonths.stdout.includes("## Periodo 2026-09"), bothMonths.stderr.slice(0, 300));

const truncated = join(SANDBOX, "truncated", "journal", "execution");
mkdirSync(truncated, { recursive: true });
writeFileSync(join(truncated, "2026-09.jsonl"), `${JSON.stringify(row("ai_action", at("15:00:00")))}\n{"schema":1,"event":"ai_ac\n`, "utf8");
const truncatedRes = run("--journal", join(SANDBOX, "truncated"), "--json");
let truncatedReport = null;
try {
  truncatedReport = JSON.parse(truncatedRes.stdout);
} catch {}
check(
  "an unreadable line is counted as a defect, not skipped silently",
  Boolean(truncatedReport) && truncatedReport.periods[0].malformedLines.length === 1 && truncatedReport.periods[0].defects.some((d) => d.includes("ilegibles")),
  truncatedReport ? JSON.stringify(truncatedReport.periods[0].defects) : truncatedRes.stderr.slice(0, 300)
);

const outFile = join(SANDBOX, "out", "reporte.md");
const outRes = run("--journal", STORE, "--month", "2026-09", "--root", BOUND_ROOT, "--out", outFile);
check(
  "--out writes the report to a created directory",
  outRes.status === 0 && readFileSync(outFile, "utf8").includes("# Reporte de actividad registrada en bitácora"),
  outRes.stderr.slice(0, 300)
);

const flat = run("--journal", EXECUTION, "--month", "2026-09", "--json");
check("the month directory can be passed directly", flat.status === 0, flat.stderr.slice(0, 300));

console.log("");
console.log(failed ? `${failed} assertion(s) failed` : "every assertion passed against an 18-row fixture journal with 5 planted evidence defects");

if (!failed) {
  rmSync(SANDBOX, { recursive: true, force: true });
  process.exit(0);
}
process.exit(1);
