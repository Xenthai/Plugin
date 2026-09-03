import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { detect } from "../bin/opportunities.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const CLI = join(ROOT, "bin", "opportunities.mjs");
const SANDBOX = join(HERE, "sandbox", "opportunities");
const STORE = join(SANDBOX, "store");
const EXECUTION = join(STORE, "journal", "execution");
const THIN = join(SANDBOX, "thin");

const row = (event, extra = {}) => ({
  schema: 1,
  plugin: "0.2.0",
  company: "acme-sa",
  actor: "ai",
  event,
  result: "ok",
  ...extra,
});

/**
 * Three periods, built so every threshold has a case on both sides of it. `cotizacion.md` recurs in
 * all three and must be found; `unico-<n>.md` appears in exactly one each and must NOT be, which is
 * the assertion that proves the floor counts distinct periods rather than occurrences — the single
 * unique file per period sums to three occurrences overall and still is not a pattern.
 */
const period = (p, day) => [
  row("ai_action", { tool: "Write", target: { file_path: "reportes/cotizacion.md" }, ts_local: `2026-${day}-03 09:00` }),
  row("ai_action", { tool: "Edit", target: { file_path: "reportes/cotizacion.md" }, ts_local: `2026-${day}-03 09:12` }),
  row("escalation", { why: "descuento por encima del límite", ts_local: `2026-${day}-05 11:00` }),
  row("error", { tool: "Bash", result: "error", target: { file_path: "scripts/exportar.sh" }, ts_local: `2026-${day}-07 16:00` }),
  row("blocked", { tool: "Write", result: "blocked", target: { file_path: "otra-empresa/BRAND.md" }, ts_local: `2026-${day}-07 17:00` }),
  row("review_start", { actor: "person:Ana", target: { file_path: "reportes/cotizacion.md" }, ts_local: `2026-${day}-08 10:00` }),
  row("review_end", { actor: "person:Ana", target: { file_path: "reportes/cotizacion.md" }, ts_local: `2026-${day}-08 10:25` }),
  row("ai_action", { tool: "Write", target: { file_path: `unico-${day}.md` }, ts_local: `2026-${day}-09 12:00` }),
];

const PERIODS = [
  ["2026-07", "07"],
  ["2026-08", "08"],
  ["2026-09", "09"],
];

rmSync(SANDBOX, { recursive: true, force: true });
mkdirSync(EXECUTION, { recursive: true });
mkdirSync(join(THIN, "journal", "execution"), { recursive: true });
const ALL = [];
for (const [name, day] of PERIODS) {
  const rows = period(name, day);
  ALL.push(...rows.map((r) => ({ ...r, period: name })));
  writeFileSync(join(EXECUTION, `${name}.jsonl`), `${rows.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
}
writeFileSync(
  join(THIN, "journal", "execution", "2026-09.jsonl"),
  `${period("2026-09", "09").map((r) => JSON.stringify(r)).join("\n")}\n`,
  "utf8"
);

const run = (...argv) => spawnSync(process.execPath, [CLI, ...argv], { encoding: "utf8", cwd: ROOT });

let failed = 0;
const check = (label, ok, detail) => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok && detail !== undefined) console.log(`        ${String(detail).slice(0, 300)}`);
};

const found = detect(ALL, 3);
const subjects = found.map((f) => f.subject);

check("--help exits 0 and documents every option", (() => {
  const h = run("--help");
  return h.status === 0 && ["--journal", "--min", "--json"].every((f) => h.stdout.includes(f));
})(), run("--help").stdout.slice(0, 120));

check("a missing --journal exits 2", run("--json").status === 2, `exit ${run("--json").status}`);
check("an unknown option exits 2", run("--journal", STORE, "--nope").status === 2, `exit ${run("--journal", STORE, "--nope").status}`);

/**
 * A pattern over one period is not a pattern, and a threshold of one would let a single busy
 * afternoon manufacture a finding. Refusing the argument is cheaper than explaining the number.
 */
check("--min below 2 is refused, because one period is not a pattern", (() => {
  const r = run("--journal", STORE, "--min", "1");
  return r.status === 2 && /not a pattern/.test(r.stderr);
})(), run("--journal", STORE, "--min", "1").stderr.slice(0, 120));

check("the recurring document is found", subjects.includes("reportes/cotizacion.md"), subjects.join(", "));
check("the recurring escalation reason is found", subjects.includes("descuento por encima del límite"), subjects.join(", "));
check("the recurring failure is found with its tool and target", subjects.includes("Bash → scripts/exportar.sh"), subjects.join(", "));
check("the repeatedly blocked target is found", subjects.includes("otra-empresa/BRAND.md"), subjects.join(", "));

/**
 * The floor counts DISTINCT PERIODS, not occurrences. These three files sum to three occurrences
 * across the journal and appear in one period each — the exact shape that a naive occurrence count
 * would report as a pattern.
 */
check(
  "a file touched once per period is not reported, so the floor is periods and not occurrences",
  !subjects.some((s) => String(s).startsWith("unico-")),
  subjects.filter((s) => String(s).startsWith("unico-")).join(", ")
);

/**
 * A finding phrased as a recommendation asserts the answer to the autonomous-recurring-reviewable
 * test without having run it. Every finding carries the question instead, and this is what keeps
 * that true through later edits.
 */
check(
  "every finding carries a question and never a recommendation",
  found.length > 0 && found.every((f) => /\?/.test(f.question)) && !found.some((f) => /debe automatizar|recomendamos/i.test(f.question)),
  found.map((f) => f.question.slice(0, 40)).join(" | ")
);

check(
  "every finding carries the periods it spans and rows as evidence",
  found.every((f) => Array.isArray(f.periods) && f.periods.length >= 3 && f.evidence.length > 0),
  JSON.stringify(found[0] ?? null).slice(0, 200)
);

/**
 * Ordering is by a count, never by a score. ROADMAP.md rules out a composite improvement score as
 * indefensible with one client and no control group, and ranking these would smuggle one back in.
 */
check(
  "findings are ordered by periods spanned and carry no score field",
  found.every((f, i) => i === 0 || found[i - 1].periods.length >= f.periods.length) &&
    !found.some((f) => "score" in f || "rank" in f || "priority" in f),
  Object.keys(found[0] ?? {}).join(",")
);

const rendered = run("--journal", STORE);
check("the report renders and exits 0", rendered.status === 0, rendered.stderr.slice(0, 200));
check("the rendered body is es-MX", /Patrones repetidos en la bitácora/.test(rendered.stdout), rendered.stdout.slice(0, 80));

/**
 * A reader who does not know the journal's coverage reads the list as a complete survey of the
 * company. It is not: it is blind to every process nobody has opened. The warning ships with the
 * output rather than living in a comment.
 */
check(
  "the output states that it only sees what passed through the plugin",
  /sólo ve lo que pasó por el plugin/.test(rendered.stdout) && /nunca como un inventario/.test(rendered.stdout),
  (rendered.stdout.match(/Esta lista[^\n]*/) ?? [])[0]
);

/**
 * Fewer periods than the threshold has to produce a refusal rather than a shorter list. A finding
 * measured over too little history is noise, and printing it teaches a client to skip the section.
 */
const thin = run("--journal", THIN);
check(
  "one period of history is refused with an explanation, not reported as findings",
  thin.status === 0 && /Todavía no hay con qué/.test(thin.stdout) && !/cotizacion\.md/.test(thin.stdout),
  thin.stdout.slice(0, 200)
);

/**
 * Nothing recurring is a legitimate state and must read as a result, not as a broken tool — the
 * alternative is inventing a finding to fill the section.
 */
const quiet = detect(ALL, 99);
check("an unreachable threshold yields no findings rather than an error", Array.isArray(quiet) && quiet.length === 0, quiet.length);

const jsonRes = run("--journal", STORE, "--json");
let data = null;
try {
  data = JSON.parse(jsonRes.stdout);
} catch {}
check(
  "--json carries the periods, the threshold, the bias warning and the findings",
  data && Array.isArray(data.periods) && data.min === 3 && typeof data.bias === "string" && Array.isArray(data.findings) && data.findings.length > 0,
  JSON.stringify({ periods: data?.periods, min: data?.min, findings: data?.findings?.length })
);

console.log(`\n${failed ? `${failed} failed` : `every assertion passed over ${PERIODS.length} periods and ${ALL.length} rows`}`);
process.exit(failed ? 1 : 0);
