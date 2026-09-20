import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CLI = join(ROOT, "tools", "report.mjs");
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
 * Twenty-three rows whose every aggregate is known by hand: 6 ai_action of which two are Bash calls
 * (one running journal-sync.mjs, one running render.mjs), 2 escalation, 2 approvals of which one is
 * anonymous, two review pairs of 12 and 18 minutes plus one start that never closes, one each of
 * lookup/blocked/guard_error/error/health, three delivery rows — one ok for the client, one the
 * journal's own staging row, one pending for the client — and two references to a folder other than
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
  row("delivery", { ...at("15:25:00"), actor: "system", capability: "journal", result: "pending", target: "2026-09.rev-001.jsonl", why: "journal 2026-09 revision 1 staged" }),
  row("delivery", { ...at("15:26:00"), capability: "report", result: "pending", target: { title: "reporte 2026-09", folderId: BOUND_ROOT } }),
  row("health", { ...at("15:27:00"), actor: "system", why: "doctor ran" }),
  row("ai_action", { ...at("15:28:00"), tool: "Bash", target: { command: "sha256:0000000000000000", action: "node journal-sync.mjs --emit" } }),
  row("ai_action", { ...at("15:29:00"), tool: "Bash", target: { command: "sha256:1111111111111111", action: "node render.mjs --pieces" } }),
];

const digestOf = (letter) => `sha256:${letter.repeat(16)}`;

/**
 * Four pending escalations, of which exactly two have an outcome the journal can see: one Write that
 * ran 3 minutes later in the same session, one Bash that failed 1 minute later. The Write's earlier
 * run with the same digest sits BEFORE the escalation and must not pair; the Edit's later run sits in
 * another session and must not pair either. The hand-recorded escalation (result ok) is a semantic
 * event with nothing to execute and stays out of the outcome figures.
 */
const ESCALATIONS = [
  row("ai_action", { ...at("09:59:00"), session: "S1", tool: "Write", digest: digestOf("a") }),
  row("escalation", { ...at("10:00:00"), session: "S1", tool: "Write", digest: digestOf("a"), result: "pending" }),
  row("ai_action", { ...at("10:03:00"), session: "S1", tool: "Write", digest: digestOf("a") }),
  row("escalation", { ...at("10:05:00"), session: "S1", tool: "Bash", digest: digestOf("b"), result: "pending" }),
  row("escalation", { ...at("10:10:00"), session: "S2", tool: "Edit", digest: digestOf("c"), result: "pending" }),
  row("ai_action", { ...at("10:12:00"), session: "S3", tool: "Edit", digest: digestOf("c") }),
  row("escalation", { ...at("10:20:00"), session: "S1", tool: "Bash", digest: digestOf("d"), result: "pending" }),
  row("error", { ...at("10:21:00"), session: "S1", tool: "Bash", digest: digestOf("d"), result: "error" }),
  row("escalation", { ...at("10:30:00"), capability: "social", why: "recorded by hand, nothing to execute" }),
];

const PERSONAL = [
  row("ai_action", { ...at("11:00:00"), schema: 2, store_kind: "personal", company: "vida-personal", tool: "Write" }),
  row("delivery", { ...at("11:01:00"), schema: 2, store_kind: "personal", company: "vida-personal" }),
];

const MIXED = [
  row("ai_action", { ...at("11:00:00"), schema: 2, store_kind: "client", tool: "Write" }),
  row("ai_action", { ...at("11:01:00"), schema: 2, store_kind: "personal", tool: "Write" }),
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
  check("23 rows counted", period.rows === 23, period.rows);
  check("source names the journal file", period.source === "2026-09.jsonl", period.source);
  check(
    "the digest is the sha256 of the exact bytes on disk, not of the parsed rows",
    period.digest ===
      createHash("sha256").update(readFileSync(join(EXECUTION, "2026-09.jsonl"))).digest("hex") &&
      period.bytes === statSync(join(EXECUTION, "2026-09.jsonl")).size,
    `${String(period.digest).slice(0, 16)}… / ${period.bytes} bytes`
  );
  check("measured-by carries the plugin version from the rows", period.measuredBy === "Xenth AI Plugin 0.1.0 desde la bitácora", period.measuredBy);
  check("6 automation runs paired with 2 escalations", period.automation.runs === 6 && period.automation.escalations === 2, JSON.stringify(period.automation));
  check("runs are never exposed without escalations", Object.keys(period.automation).sort().join(",") === "escalations,runs", Object.keys(period.automation).join(","));
  check("1 named approval, by Ana", period.approvals.named === 1 && period.approvals.approvers[0][0] === "Ana", JSON.stringify(period.approvals.approvers));
  check("1 unnamed approval surfaced as a defect", period.approvals.unnamed === 1 && period.defects.some((d) => d.includes("aprobación(es) sin persona nombrada")), JSON.stringify(period.defects));
  check("2 review pairs totalling 30 minutes", period.review.pairs === 2 && period.review.minutes === 30, JSON.stringify({ pairs: period.review.pairs, minutes: period.review.minutes }));
  check("touch time split by person: Ana 12, Beto 18", JSON.stringify(period.review.byActor) === JSON.stringify([["person:Beto", { pairs: 1, minutes: 18 }], ["person:Ana", { pairs: 1, minutes: 12 }]]), JSON.stringify(period.review.byActor));
  check("the unmatched review start is reported separately", period.review.unmatchedStarts.length === 1 && period.review.unmatchedStarts[0].session === "S2", JSON.stringify(period.review.unmatchedStarts));
  check("the unmatched start is surfaced as a defect", period.defects.some((d) => d.includes("inicio(s) de revisión sin cierre")), JSON.stringify(period.defects));
  check("no unmatched review ends in the fixture", period.review.unmatchedEnds === 0, period.review.unmatchedEnds);
  check(
    "counts: one client delivery, one pending client delivery apart, one journal revision, three instrumentation rows",
    JSON.stringify(period.counts) === JSON.stringify({ lookup: 1, blocked: 1, delivery: 1, delivery_without_ok: 1, journal_revisions: 1, instrumentation: 3, guard_error: 1, error: 1 }),
    JSON.stringify(period.counts)
  );
  check("the journal's own staging row is not counted as a delivery", period.counts.delivery === 1 && period.counts.journal_revisions === 1, JSON.stringify(period.counts));
  check("a non-journal delivery without result ok is a defect", period.defects.some((d) => d.includes("1 entrega(s) registradas sin resultado ok")), JSON.stringify(period.defects));
  check(
    "instrumentation counts the health row, the journal row and the journal-sync Bash call, not the render Bash call",
    period.counts.instrumentation === 3,
    period.counts.instrumentation
  );
  check("hand-recorded escalations (result ok) produce no outcome figures", period.escalations?.pending === 0 && period.escalations?.paired === 0 && period.escalations?.unpaired === 0, JSON.stringify(period.escalations));
  check("schema-1 rows read as a client store", period.storeKind === "client" && JSON.stringify(period.storeKinds) === JSON.stringify([["client", 23]]), JSON.stringify(period.storeKinds));
  check("actors tallied: ai 15, person:Ana 4, person:Beto 2, system 2", JSON.stringify(period.actors) === JSON.stringify([["ai", 15], ["person:Ana", 4], ["person:Beto", 2], ["system", 2]]), JSON.stringify(period.actors));
  check("both foreign-folder references are listed", period.unauthorized.foreign.length === 2 && period.unauthorized.foreign.every((f) => f.value === FOREIGN_ROOT), JSON.stringify(period.unauthorized.foreign));
  check("the foreign write is listed by parentId and the delivery by folderId", period.unauthorized.foreign.map((f) => f.field).sort().join(",") === "folderId,parentId", JSON.stringify(period.unauthorized.foreign.map((f) => f.field)));
  check("the unauthorized line refuses the clean claim when guard_error and foreign rows exist", period.unauthorized.statement.includes("**no** sostiene"), period.unauthorized.statement);
}

const markdown = run("--journal", STORE, "--month", "2026-09", "--root", BOUND_ROOT);
check("the report renders and exits 0", markdown.status === 0, markdown.stderr.slice(0, 400));
const body = markdown.stdout;

check("the report body is es-MX", body.includes("Cifras medidas y evidenciadas") && body.includes("Acciones no autorizadas"), body.slice(0, 200));

const realDigest = createHash("sha256").update(readFileSync(join(EXECUTION, "2026-09.jsonl"))).digest("hex");
check("the rendered digest is the one a client would compute from their own copy", body.includes(realDigest), (body.match(/SHA-256:[^\n]*/) ?? [])[0]);
/**
 * A verification block is worth having only if the reader can run it. A Mexican client is most
 * likely on Windows, where `shasum` does not exist — a command they cannot run turns the section
 * into decoration, which is exactly the kind of unearned trust this whole report refuses elsewhere.
 */
check("the verify command is given for Windows as well as Unix", /certutil -hashfile 2026-09\.jsonl SHA256/.test(body) && /shasum -a 256 2026-09\.jsonl/.test(body), (body.match(/certutil[^\n]*/) ?? [])[0]);
/**
 * The digest pins the file from the report's date forward, because the report comes to rest in the
 * client's store where the practice cannot rewrite a past revision. It says nothing about the file
 * before that. Stating the limit is what separates this from tamper-evidence theatre, so it is
 * asserted rather than trusted to survive an edit.
 */
check("the block states what the digest does not prove", /no comprueba/.test(body) && /no hacia atrás/.test(body), (body.match(/Lo que esto no comprueba[^\n]*/) ?? [])[0]);
check("no figure is called certificada or verificada", !/certificad|verificad/i.test(body), (body.match(/.{0,60}(certificad|verificad).{0,60}/i) ?? [])[0]);
check("the ISAE columns are present on the metric table", ["Métrica", "Definición", "Fuente", "Periodo", "Medido por"].every((h) => body.includes(h)), body.slice(0, 200));
check("every ISAE row carries the source file and the measurer", (body.match(/\| 2026-09\.jsonl \| 2026-09 \| Xenth AI Plugin 0\.1\.0 desde la bitácora \|/g) ?? []).length >= 13, (body.match(/\| 2026-09\.jsonl \| 2026-09 \|/g) ?? []).length);
check("the run count is rendered only beside the escalation count", /Ejecuciones automatizadas acompañadas de escalamientos[^|]*\| 6 ejecuciones \/ 2 escalamientos \|/.test(body), (body.match(/Ejecuciones automatizadas[^\n]*/) ?? [])[0]);
check("Entregas renders the client figure and the staging row on its own line", body.includes("| Entregas | 1 |") && body.includes("| Revisiones de bitácora preparadas para subir | 1 |"), (body.match(/\| (Entregas|Revisiones de bitácora)[^\n]{0,40}/g) ?? []).join(" ~ "));
check("the staging row's definition points at the receipt, not the row", /Revisiones de bitácora preparadas para subir \| 1 \|[^\n]*recibo/.test(body), (body.match(/Revisiones de bitácora[^\n]*/) ?? [])[0]);
check("the instrumentation row says a director may subtract it", /Filas de instrumentación del plugin \| 3 \|[^\n]*restarlas de «Filas de bitácora»/.test(body), (body.match(/Filas de instrumentación[^\n]*/) ?? [])[0]);
check("the header names the store kind as cliente", body.includes("**Tipo de almacén:** cliente"), (body.match(/Tipo de almacén[^\n]*/) ?? [])[0]);
check("a client store prints no personal-material notice", !body.includes("material propio del operador"), (body.match(/material propio[^\n]*/) ?? [])[0]);
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

const fixture = (name, rows) => {
  const dir = join(SANDBOX, name, "journal", "execution");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "2026-09.jsonl"), `${rows.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
  return join(SANDBOX, name);
};

const parsed = (res) => {
  try {
    return JSON.parse(res.stdout).periods[0];
  } catch {
    return null;
  }
};

const escalationsDir = fixture("escalations", ESCALATIONS);
const escalations = parsed(run("--journal", escalationsDir, "--json"));
if (!escalations) {
  check("the escalation fixture emits parsable figures", false);
} else {
  const e = escalations.escalations ?? {};
  check("4 pending escalations found, the hand-recorded one left out", e.pending === 4 && escalations.automation.escalations === 5, JSON.stringify(e));
  check("2 escalations paired: the Write that ran and the Bash that failed", e.paired === 2 && JSON.stringify(e.byOutcome) === JSON.stringify({ ai_action: 1, error: 1 }), JSON.stringify(e));
  check("2 escalations unpaired: the Bash that never ran and the Edit whose run is in another session", e.unpaired === 2 && (e.unpairedRows ?? []).map((r) => r.tool).sort().join(",") === "Bash,Edit", JSON.stringify(e.unpairedRows));
  check("3 + 1 minutes between escalation and execution, so the earlier Write run did not pair backwards", e.minutes === 4, e.minutes);
  check("the earlier run with the same digest is not counted as an outcome", e.paired + e.unpaired === e.pending, JSON.stringify(e));
}
const escalationsBody = run("--journal", escalationsDir).stdout;
check(
  "escalation outcomes render as three rows",
  escalationsBody.includes("| Escalamientos con desenlace registrado | 2 |") &&
    escalationsBody.includes("| Escalamientos sin desenlace registrado | 2 |") &&
    escalationsBody.includes("| Minutos entre el escalamiento y la ejecución | 4 |"),
  (escalationsBody.match(/\| Escalamientos[^\n]{0,60}|\| Minutos entre[^\n]{0,60}/g) ?? []).join(" ~ ")
);
check(
  "the outcome definitions deny being an approval and say who decided is unknown",
  /Escalamientos con desenlace registrado \|[^\n]*no sabe quién lo decidió[^\n]*No es una aprobación/.test(escalationsBody) &&
    /Escalamientos sin desenlace registrado \|[^\n]*negó[^\n]*sesión terminó[^\n]*nunca corrió/.test(escalationsBody),
  (escalationsBody.match(/Escalamientos con desenlace[^\n]*/) ?? [])[0]
);
check("the comparability cell is unchanged by the pairing", escalationsBody.includes("| 3 ejecuciones / 5 escalamientos |"), (escalationsBody.match(/\| \d+ ejecuci[^|]*\|/) ?? [])[0]);

const personalDir = fixture("personal", PERSONAL);
const personalBody = run("--journal", personalDir).stdout;
check("a personal store is named in the header", personalBody.includes("**Tipo de almacén:** personal"), (personalBody.match(/Tipo de almacén[^\n]*/) ?? [])[0]);
check(
  "a personal store prints the notice that this is not a client report",
  /material propio del operador[^\n]*Entregas y Aprobaciones[^\n]*no debe presentarse a un cliente/.test(personalBody),
  (personalBody.match(/material propio[^\n]*/) ?? [])[0]
);
const personal = parsed(run("--journal", personalDir, "--json"));
check("a personal store carries no mixed-kind defect", Boolean(personal) && personal.storeKind === "personal" && !personal.defects.some((d) => d.includes("mezcla")), personal ? JSON.stringify(personal.defects) : "unparsable");

const mixedDir = fixture("mixed", MIXED);
const mixed = parsed(run("--journal", mixedDir, "--json"));
check(
  "a file mixing client and personal rows is a defect",
  Boolean(mixed) && mixed.storeKind === "mixed" && mixed.defects.some((d) => d.includes("mezcla filas de más de un tipo de almacén") && d.includes("cliente: 1") && d.includes("personal: 1")),
  mixed ? JSON.stringify(mixed.defects) : "unparsable"
);
check("a mixed file is marked mixto in the header", run("--journal", mixedDir).stdout.includes("**Tipo de almacén:** cliente, personal (mixto)"), false);

/**
 * The cadence templates carry the reporting doctrine structurally, so a report cannot omit a
 * mandatory section by accident. These assertions are what make that true — a template is only a
 * guarantee if something refuses the version that lost a section.
 */
const TEMPLATES = join(ROOT, "capabilities", "report", "templates");
const CADENCES = ["quincenal", "mensual", "trimestral", "semestral", "anual", "cierre-de-mapeo"];
const tpl = (n) => readFileSync(join(TEMPLATES, `${n}.md`), "utf8");

for (const name of CADENCES) {
  let text = "";
  try {
    text = tpl(name);
  } catch {
    check(`the ${name} template exists`, false, "file missing");
    continue;
  }
  check(`${name}: declares the one question it answers`, /La pregunta que responde este reporte:/.test(text));
  check(`${name}: declares a schema version`, /\*\*Esquema:\*\*\s*\d/.test(text));
  check(`${name}: marks uncaptured fields rather than inventing them`, /—\s*pendiente\s*—/.test(text));
  check(
    `${name}: is es-MX, because a director reads it`,
    !/\b(the|should be|must be|instead of)\b/i.test(
      text.split(/\r?\n/).filter((l) => !/^\s*[-|>`]/.test(l)).join(" ")
    )
  );
}

check(
  "the biweekly template forbids an outcome claim, which two weeks cannot support",
  /no lleva ninguna afirmaci[óo]n de resultado/i.test(tpl("quincenal"))
);
check(
  "the quarterly template withholds attribution and hands it to the semiannual",
  /No lleva atribuci[óo]n/i.test(tpl("trimestral")) && /semestral/i.test(tpl("trimestral"))
);
check(
  "the semiannual template requires alternative explanations to be answered with evidence",
  /Explicaciones alternativas/i.test(tpl("semestral")) && /evidencia en contra/i.test(tpl("semestral"))
);
check(
  "the annual template carries the claim ledger and the option of not renewing",
  /libro de afirmaciones/i.test(tpl("anual")) && /\*\*No renovar\*\*/.test(tpl("anual"))
);
check(
  "the mapping-close template contains no achievement and asks for a signature on the starting numbers",
  /no ha pasado nada/i.test(tpl("cierre-de-mapeo")) && /Qui[ée]n firm[óo]/i.test(tpl("cierre-de-mapeo"))
);
check(
  "every template refuses the hours-saved counterfactual by name",
  CADENCES.filter((n) => /[Hh]oras ahorradas/.test(tpl(n))).length >= 5,
  `only ${CADENCES.filter((n) => /[Hh]oras ahorradas/.test(tpl(n))).length} name it`
);
check(
  "a template that lost its question line would fail",
  !/La pregunta que responde este reporte:/.test("# REPORTE MENSUAL\n\n**Esquema:** 1\n\n— pendiente —")
);

console.log("");
console.log(failed ? `${failed} assertion(s) failed` : "every assertion passed against a 23-row fixture journal with 6 planted evidence defects");

if (!failed) {
  rmSync(SANDBOX, { recursive: true, force: true });
  process.exit(0);
}
process.exit(1);
