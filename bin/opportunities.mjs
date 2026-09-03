#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads a company's execution journal and reports what RECURRED, with the rows behind each pattern.
 *
 * This is the counting half of finding what to improve next. It proposes nothing. Repetition is a
 * fact the journal can establish; what a repetition means — automate it, restructure the document,
 * delegate the decision, fix the broken step — is a judgement that needs the process, the people and
 * the client's own priorities, and `skills/opportunities/SKILL.md` is where that judgement is made.
 *
 * Two properties are deliberate and both cost something:
 *
 * Every detector has a floor, and the floor counts DISTINCT PERIODS rather than occurrences. Three
 * edits to one file in one afternoon is one event; three edits in three separate months is a
 * pattern. Counting raw occurrences would let a single busy session manufacture a finding, and a
 * detector that fires on noise trains its reader to ignore it.
 *
 * Nothing is scored or ranked on one axis. `ROADMAP.md` rules out a composite improvement score
 * because it is indefensible with one client and no control group, and ranking these findings would
 * smuggle the same thing back in through a side door. They come out ordered by how many distinct
 * periods each spans, which is a count and not a judgement.
 */

const MONTH_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.jsonl$/;
const DEFAULT_MIN_PERIODS = 3;

/**
 * The journal holds only what passed through the plugin. Every finding here is therefore biased
 * toward work the practice already touches, and is blind to the process nobody has opened yet —
 * which is often the one worth the most. Printed with the findings rather than left in a comment,
 * because a reader who does not know this will read the list as a complete survey.
 */
const BIAS =
  "Esta lista sólo ve lo que pasó por el plugin. No ve el proceso que nadie ha tocado todavía, y " +
  "ése suele ser el que más vale. Úsela para priorizar entre lo conocido, nunca como un inventario.";

const resolveExecutionDir = (dir) => {
  for (const candidate of [join(dir, "journal", "execution"), join(dir, "execution"), dir]) {
    let names = [];
    try {
      names = readdirSync(candidate);
    } catch {
      continue;
    }
    const months = names.filter((name) => MONTH_FILE.test(name)).sort();
    if (months.length) return { dir: candidate, months };
  }
  return null;
};

const load = (dir, months) => {
  const rows = [];
  for (const name of months) {
    const period = name.replace(".jsonl", "");
    for (const line of readFileSync(join(dir, name), "utf8").split("\n")) {
      const text = line.trim();
      if (!text) continue;
      try {
        rows.push({ ...JSON.parse(text), period });
      } catch {
        /* a malformed line is a defect bin/report.mjs reports; it carries no pattern */
      }
    }
  }
  return rows;
};

/**
 * A row's target reduced to one comparable string. The journal stores a reference object whose keys
 * vary by tool, so a pattern over targets needs one canonical field or it finds nothing.
 */
const targetKey = (row) => {
  const t = row.target;
  if (!t) return null;
  if (typeof t === "string") return t;
  for (const key of ["file_path", "path", "title", "fileId", "url"]) {
    if (typeof t[key] === "string" && t[key]) return t[key];
  }
  return null;
};

const groupBy = (rows, keyOf) => {
  const groups = new Map();
  for (const row of rows) {
    const key = keyOf(row);
    if (key === null || key === undefined) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
};

const periodsOf = (rows) => [...new Set(rows.map((r) => r.period))].sort();

const evidence = (rows) =>
  rows
    .slice(-4)
    .map((r) => `${r.ts_local ?? r.ts ?? "sin fecha"} · ${r.event}${r.tool ? ` · ${r.tool}` : ""}`);

/**
 * Each detector answers one question and states it as a question. A finding phrased as a
 * recommendation ("automate this") asserts the answer to the autonomous-recurring-reviewable test
 * without having run it; phrased as a question it hands the reader the test instead of the verdict.
 */
const DETECTORS = [
  {
    id: "recurring-target",
    title: "El mismo documento se trabaja periodo tras periodo",
    question:
      "¿Es candidato a automatización? Aplique la prueba: ¿es autónomo, recurrente y revisable? " +
      "La tercera es la que casi nadie verifica.",
    run: (rows, min) =>
      [...groupBy(rows.filter((r) => r.event === "ai_action"), targetKey)]
        .map(([key, group]) => ({ subject: key, rows: group }))
        .filter((f) => periodsOf(f.rows).length >= min),
  },
  {
    id: "repeated-escalation",
    title: "El mismo motivo de escalamiento vuelve a aparecer",
    question:
      "¿Es una decisión que ya puede delegarse con una regla escrita, o una política que nunca se " +
      "escribió? Un escalamiento que se repite igual es una decisión sin criterio documentado.",
    run: (rows, min) =>
      [...groupBy(rows.filter((r) => r.event === "escalation"), (r) => r.why ?? null)]
        .map(([key, group]) => ({ subject: key, rows: group }))
        .filter((f) => periodsOf(f.rows).length >= min),
  },
  {
    id: "recurring-error",
    title: "La misma herramienta falla sobre el mismo objetivo",
    question:
      "¿Qué paso está roto? Esto no es una oportunidad de mejora: es una falla que ya cuesta " +
      "trabajo cada periodo y nadie ha reportado.",
    run: (rows, min) =>
      [...groupBy(rows.filter((r) => r.event === "error" || r.result === "error"), (r) => {
        const t = targetKey(r);
        return t ? `${r.tool ?? "sin herramienta"} → ${t}` : null;
      })]
        .map(([key, group]) => ({ subject: key, rows: group }))
        .filter((f) => periodsOf(f.rows).length >= min),
  },
  {
    id: "repeated-block",
    title: "El guardián rechaza lo mismo una y otra vez",
    question:
      "¿Es trabajo legítimo que el plugin no contempla, o alguien intentando algo que no debe? " +
      "Lo primero es un hueco del producto. Lo segundo es un hallazgo de gobierno. No son lo mismo.",
    run: (rows, min) =>
      [...groupBy(rows.filter((r) => r.event === "blocked" || r.event === "guard_error"), (r) => targetKey(r) ?? r.tool ?? null)]
        .map(([key, group]) => ({ subject: key, rows: group }))
        .filter((f) => periodsOf(f.rows).length >= min),
  },
  {
    id: "review-heavy-target",
    title: "Un mismo documento consume revisión humana cada periodo",
    question:
      "¿La estructura del documento está peleando con la tarea? Un archivo que se revisa completo " +
      "cada periodo suele estar pidiendo partirse, no automatizarse.",
    run: (rows, min) =>
      [...groupBy(rows.filter((r) => r.event === "review_start" || r.event === "review_end"), targetKey)]
        .map(([key, group]) => ({ subject: key, rows: group }))
        .filter((f) => periodsOf(f.rows).length >= min),
  },
];

export const detect = (rows, min = DEFAULT_MIN_PERIODS) => {
  const findings = [];
  for (const d of DETECTORS) {
    for (const f of d.run(rows, min)) {
      const periods = periodsOf(f.rows);
      findings.push({
        detector: d.id,
        title: d.title,
        question: d.question,
        subject: f.subject,
        occurrences: f.rows.length,
        periods,
        evidence: evidence(f.rows),
      });
    }
  }
  return findings.sort(
    (a, b) => b.periods.length - a.periods.length || b.occurrences - a.occurrences || String(a.subject).localeCompare(String(b.subject), "es")
  );
};

const HELP = `Xenth AI opportunities — what recurred in a company's journal, with the rows behind it.

  node bin/opportunities.mjs --journal <dir> [--min ${DEFAULT_MIN_PERIODS}] [--json]

  --journal <dir>  Company store root, its journal/execution directory, or any directory holding
                   <YYYY-MM>.jsonl files. Required.
  --min N          Distinct periods a pattern must span to be reported. Default ${DEFAULT_MIN_PERIODS}.
  --json           Emit the findings as data.

Reports repetition. Proposes nothing: each finding carries the question it raises, not an answer.
Exit 0 whether or not anything was found — nothing recurring is a valid and reportable state.
Exit 2 when no journal can be read or the arguments are wrong.

The journal holds only what passed through the plugin, so this is blind to any process nobody has
opened yet. Read skills/opportunities/SKILL.md before turning a finding into a recommendation.`;

const main = () => {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(`${HELP}\n`);
    process.exit(0);
  }
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      process.stderr.write(`unexpected argument "${token}"\n`);
      process.exit(2);
    }
    const key = token.slice(2);
    if (key === "json") {
      args.json = true;
      continue;
    }
    if (key !== "journal" && key !== "min") {
      process.stderr.write(`unknown option "--${key}"\n`);
      process.exit(2);
    }
    const value = argv[++i];
    if (value === undefined || value.startsWith("--")) {
      process.stderr.write(`--${key} needs a value\n`);
      process.exit(2);
    }
    args[key] = value;
  }
  if (!args.journal) {
    process.stderr.write("--journal is required\n");
    process.exit(2);
  }
  const min = args.min === undefined ? DEFAULT_MIN_PERIODS : Number(args.min);
  if (!Number.isInteger(min) || min < 2) {
    process.stderr.write("--min needs an integer of at least 2; a pattern over one period is not a pattern\n");
    process.exit(2);
  }

  const found = resolveExecutionDir(args.journal);
  if (!found) {
    process.stderr.write(
      `no <YYYY-MM>.jsonl files under "${args.journal}".\n\n` +
        "An absent journal is not a company with nothing to improve. The hooks that write it run in\n" +
        "Claude Cowork and Claude Code and are inactive in chat on the web and in the Desktop Chat\n" +
        "tab, so the file may never have been created. Say which it is.\n"
    );
    process.exit(2);
  }

  const rows = load(found.dir, found.months);
  const periods = [...new Set(rows.map((r) => r.period))].sort();
  const findings = detect(rows, min);

  if (args.json) {
    process.stdout.write(`${JSON.stringify({ periods, rows: rows.length, min, bias: BIAS, findings }, null, 2)}\n`);
    process.exit(0);
  }

  process.stdout.write(`# Patrones repetidos en la bitácora\n\n`);
  process.stdout.write(
    `Periodos leídos: ${periods.join(", ") || "ninguno"} · ${rows.length} filas · ` +
      `umbral: un patrón se reporta al abarcar ${min} periodos distintos.\n\n`
  );
  process.stdout.write(`> ${BIAS}\n\n`);

  if (periods.length < min) {
    process.stdout.write(
      `**Todavía no hay con qué.** La bitácora cubre ${periods.length} periodo(s) y el umbral es ${min}. ` +
        "Un patrón medido sobre menos periodos que eso es ruido, y reportarlo enseñaría al cliente a " +
        "ignorar esta sección. Vuelva cuando haya más historia.\n"
    );
    process.exit(0);
  }

  if (!findings.length) {
    process.stdout.write(
      "**Nada se repitió por encima del umbral.** Eso es un resultado, no una falla del análisis: " +
        "significa que el trabajo registrado no muestra repetición suficiente para sostener una " +
        "propuesta. No invente una.\n"
    );
    process.exit(0);
  }

  let current = null;
  for (const f of findings) {
    if (f.detector !== current) {
      current = f.detector;
      process.stdout.write(`\n## ${f.title}\n\n${f.question}\n\n`);
    }
    process.stdout.write(
      `- **${f.subject}** — ${f.occurrences} vez(ces) en ${f.periods.length} periodos (${f.periods.join(", ")})\n`
    );
    for (const line of f.evidence) process.stdout.write(`  - ${line}\n`);
  }
  process.stdout.write(
    "\n---\n\nCada punto de arriba es una repetición medida, no una recomendación. Convertirlo en una " +
      "propuesta exige la prueba de autonomía, recurrencia y revisión, y el precio y el dueño que " +
      "sólo el cliente puede dar.\n"
  );
  process.exit(0);
};

if (process.argv[1]?.endsWith("opportunities.mjs")) main();
