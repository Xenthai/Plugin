#!/usr/bin/env node
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { detect } from "./opportunities.mjs";

/**
 * The practice-facing digest of one engagement's health, computed without a model and without a
 * session.
 *
 * This is the only part of the plugin that must keep working when nobody is present, so it is plain
 * arithmetic over a local JSONL file: no Claude, no connector, no network, no API cost. Anything
 * needing judgement needs a session, and a session needs a person — so the split is deliberate and
 * it is what makes "automatic" an honest claim here rather than an aspiration.
 *
 * It answers the one question no other tool in this plugin can. `report` and `opportunities` both
 * read a period that exists; neither can say **how long it has been quiet**, and a client who
 * quietly stopped using the plugin is indistinguishable from a client having a calm month until the
 * quarterly report is due and three months are gone.
 *
 * CONTENT NEVER LEAVES. Every signal is a count, a date or a verdict. The digest carries no target,
 * no `why`, no `detail`, no file name and no person's name — only how many distinct people appear.
 * That is the same posture `lib/journal.mjs` already takes with rows, and it is what lets this file
 * be shared with the practice without the practice becoming a data processor for the client's
 * personal data.
 */

const MONTH_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.jsonl$/;
const DAY = 86_400_000;

/**
 * Verdicts, in the order a reader should act on them. `ACT` means pick up the phone; `WATCH` means
 * it is a finding for the next session; `OK` means the signal fired and found nothing.
 *
 * There is deliberately no composite score. A single engagement-health number is indefensible with
 * one client and no control group — `ROADMAP.md` rules one out — and averaging a silence signal
 * with a governance defect would hide whichever one mattered.
 */
const ACT = "ACT";
const WATCH = "WATCH";
const OK = "OK";
const UNKNOWN = "UNKNOWN";

/** Distinct active days below this and the median gap between them is not a cadence yet. */
const MIN_ACTIVE_DAYS = 5;

/** Multiple of a client's own median gap that counts as gone quiet, and the absolute ceiling. */
const QUIET_FACTOR = 3;
const QUIET_MAX_DAYS = 30;

/** A `health` row older than this means nobody has verified the install in a long time. */
const HEALTH_STALE_DAYS = 45;

const resolveExecutionDir = (dir) => {
  for (const candidate of [join(dir, "journal", "execution"), join(dir, "execution"), dir]) {
    let names = [];
    try {
      names = readdirSync(candidate);
    } catch {
      continue;
    }
    const months = names.filter((n) => MONTH_FILE.test(n)).sort();
    if (months.length) return { dir: candidate, months };
  }
  return null;
};

/**
 * `period` comes from the FILE NAME, not from a row's `ts`. The recurrence detectors group by it,
 * and a row whose timestamp is missing or unparseable would otherwise land in a group of `undefined`
 * and silently make every pattern one period wide — which reads as "nothing recurred". The file name
 * is the one thing about a row that cannot be wrong.
 */
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
        /* a malformed line is a defect `report` names; it carries no signal here */
      }
    }
  }
  return rows;
};

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const isPerson = (actor) => typeof actor === "string" && actor.startsWith("person:") && actor.length > 7;

/**
 * Distinct days on which anything was recorded, as day numbers. Days rather than rows because a
 * burst of forty rows in one afternoon is one day of activity, and a cadence measured in rows would
 * read that burst as a healthy month.
 */
const activeDays = (rows) => {
  const days = new Set();
  for (const r of rows) {
    const t = Date.parse(r.ts ?? "");
    if (Number.isFinite(t)) days.add(Math.floor(t / DAY));
  }
  return [...days].sort((a, b) => a - b);
};

const signal = (id, question, verdict, value, note) => ({ id, question, verdict, value, note });

/**
 * The deterministic half of `skills/feedback`, so plugin-improvement signal accumulates on a
 * schedule instead of waiting for a monthly session.
 *
 * `detect` returns each finding's SUBJECT — a file path, an escalation reason, a tool-and-target
 * pair. Every one of those is the company's data and none of it may leave, so only the shape
 * survives here: which detector fired, how many findings it produced, and the widest span any of
 * them covered. Which capabilities appear at all is the other half, and a capability's ABSENCE from
 * this list is the finding — a skill nobody invoked in months is either mis-described, since a
 * description is its only trigger surface, or unnecessary. Those have opposite fixes, and only a
 * session can tell them apart.
 */
const pluginSignal = (rows) => {
  const byDetector = new Map();
  for (const f of detect(rows, 2)) {
    const cur = byDetector.get(f.detector) ?? { findings: 0, widest_span: 0 };
    byDetector.set(f.detector, {
      findings: cur.findings + 1,
      widest_span: Math.max(cur.widest_span, f.periods.length),
    });
  }
  const caps = new Map();
  for (const r of rows) {
    if (typeof r.capability === "string" && r.capability) caps.set(r.capability, (caps.get(r.capability) ?? 0) + 1);
  }
  return {
    recurrence: [...byDetector.entries()].map(([detector, v]) => ({ detector, ...v })).sort((a, b) => b.widest_span - a.widest_span),
    capabilities_seen: [...caps.entries()].sort((a, b) => b[1] - a[1]).map(([capability, rows]) => ({ capability, rows })),
  };
};

export const analyse = (rows, now = Date.now()) => {
  const days = activeDays(rows);
  const last = days.length ? days[days.length - 1] : null;
  const quietDays = last === null ? null : Math.floor(now / DAY) - last;
  const gaps = days.slice(1).map((d, i) => d - days[i]);
  const cadence = days.length >= MIN_ACTIVE_DAYS ? median(gaps) : null;

  const count = (pred) => rows.filter(pred).length;
  const aiActions = count((r) => r.event === "ai_action");
  const personRows = count((r) => isPerson(r.actor));
  const approvals = rows.filter((r) => r.event === "approval");
  const namedApprovals = approvals.filter((r) => isPerson(r.actor)).length;
  const unnamedApprovals = approvals.length - namedApprovals;
  const escalations = count((r) => r.event === "escalation");
  const guardErrors = count((r) => r.event === "guard_error");
  const errors = count((r) => r.event === "error" || r.result === "error");
  const people = new Set(rows.filter((r) => isPerson(r.actor)).map((r) => r.actor)).size;

  const healthRows = rows.filter((r) => r.event === "health").map((r) => Date.parse(r.ts ?? "")).filter(Number.isFinite);
  const lastHealth = healthRows.length ? Math.max(...healthRows) : null;
  const healthAge = lastHealth === null ? null : Math.floor((now - lastHealth) / DAY);

  const signals = [];

  /**
   * The silence signal, and the only one measured against the client's OWN history rather than a
   * fixed threshold. A workshop that records twice a week and one that records daily have different
   * silences, and a single global threshold would either cry wolf on the first or miss the second
   * entirely.
   */
  if (quietDays === null && rows.length > 0) {
    /**
     * Rows exist and not one carries a parseable `ts`. That is a defect in the evidence, and it must
     * never render as quiet: `lib/journal.mjs` stamps every row it writes, so rows without one were
     * hand-edited, truncated, or written by something that is not this plugin. Reporting UNKNOWN
     * here would be the exact failure this whole tool exists to prevent — an absence reading as calm.
     */
    signals.push(
      signal("silence", "¿Sigue habiendo actividad?", ACT, rows.length,
        `Hay ${rows.length} fila(s) y ninguna con marca de tiempo legible. La bitácora está dañada o no la escribió este plugin. No es un mes tranquilo.`)
    );
  } else if (quietDays === null) {
    signals.push(signal("silence", "¿Sigue habiendo actividad?", UNKNOWN, null, "La bitácora existe y está vacía. Nunca se registró nada."));
  } else if (cadence === null) {
    signals.push(
      signal("silence", "¿Sigue habiendo actividad?", UNKNOWN, quietDays,
        `Solo ${days.length} día(s) con actividad. Se necesitan ${MIN_ACTIVE_DAYS} para que la cadencia de este cliente signifique algo.`)
    );
  } else {
    const limit = Math.min(Math.max(cadence * QUIET_FACTOR, 2), QUIET_MAX_DAYS);
    signals.push(
      signal("silence", "¿Sigue habiendo actividad?", quietDays > limit ? ACT : OK, quietDays,
        `Cadencia propia de este cliente: ${cadence} día(s) entre días con actividad. Umbral: ${limit}.`)
    );
  }

  /**
   * A person's rows going to zero while the AI's keep coming is the dangerous shape, not the quiet
   * one: it means work is being produced and nothing is being reviewed.
   */
  signals.push(
    signal("human_review", "¿Alguien está revisando?", personRows === 0 && aiActions > 0 ? ACT : personRows === 0 ? WATCH : OK, personRows,
      personRows === 0 && aiActions > 0
        ? "Hay trabajo de IA registrado y ninguna fila de una persona. O se publica sin revisar, o nadie está revisando."
        : "Filas cuyo actor es una persona nombrada.")
  );

  signals.push(
    signal("approvals", "¿Se está aprobando algo?", namedApprovals === 0 ? WATCH : OK, namedApprovals,
      namedApprovals === 0 ? "Cero aprobaciones nombradas. O no se publica nada, o se publica sin aprobar." : "Aprobaciones con persona nombrada.")
  );

  /**
   * Zero escalations is a finding rather than a success — the `report` skill already refuses to
   * present it as one. It means no decision was ever handed back to a person.
   */
  signals.push(
    signal("escalations", "¿Se devolvieron decisiones a una persona?", escalations === 0 && aiActions > 0 ? WATCH : OK, escalations,
      escalations === 0 && aiActions > 0 ? "Nunca se escaló una decisión. Eso es hallazgo, no éxito." : "Escalamientos registrados.")
  );

  signals.push(
    signal("people", "¿De quién se movió el nivel?", people <= 1 ? WATCH : OK, people,
      people <= 1 ? "Una sola persona (o ninguna) aparece en la bitácora: punto único de falla, y el compromiso no se está esparciendo." : "Personas nombradas distintas.")
  );

  signals.push(
    signal("unnamed_approvals", "¿Hay aprobaciones que no lo son?", unnamedApprovals > 0 ? ACT : OK, unnamedApprovals,
      unnamedApprovals > 0 ? "Una aprobación anónima no demuestra que alguien aprobara. No es citable en un reporte." : "Toda aprobación nombra a su persona.")
  );

  signals.push(
    signal("guard", "¿Se intentó escribir fuera de la carpeta vinculada?", guardErrors > 0 ? ACT : OK, guardErrors,
      guardErrors > 0 ? "El guard registró un rechazo. Es el fallo invisible del sistema; revísalo antes de cualquier otra cosa." : "Sin rechazos del guard.")
  );

  signals.push(
    signal("errors", "¿Algo falla de forma sostenida?", errors > 0 ? WATCH : OK, errors,
      errors > 0 ? "Corre tools/opportunities.mjs para ver si se repite sobre el mismo objetivo entre periodos." : "Sin errores registrados.")
  );

  signals.push(
    signal("install", "¿Alguien verificó el install?", healthAge === null ? WATCH : healthAge > HEALTH_STALE_DAYS ? ACT : OK, healthAge,
      healthAge === null ? "Nunca se registró una fila `health`. Nadie ha corrido doctor en esta instalación." : `Días desde el último doctor.`)
  );

  const worst = signals.some((s) => s.verdict === ACT) ? ACT : signals.some((s) => s.verdict === WATCH) ? WATCH : signals.some((s) => s.verdict === UNKNOWN) ? UNKNOWN : OK;

  return {
    plugin: pluginSignal(rows),
    generated: new Date(now).toISOString(),
    periods: [...new Set(rows.map((r) => (typeof r.ts === "string" ? r.ts.slice(0, 7) : null)).filter(Boolean))].sort(),
    rows: rows.length,
    active_days: days.length,
    quiet_days: quietDays,
    cadence_days: cadence,
    verdict: worst,
    signals,
  };
};

const HELP = `Xenth AI watch — one engagement's health, as counts and dates, with no model in the loop.

  node tools/watch.mjs --journal <dir> [--company <id>] [--out <file>] [--json]

  --journal <dir>  Company store root, its journal/execution directory, or any directory holding
                   <YYYY-MM>.jsonl files. Required.
  --company <id>   Label the digest. Read from .company.json when omitted and one is beside the journal.
  --out <file>     Write there instead of stdout. Parent directories are created.
  --json           Emit the signals as data.

Answers the question no other tool here can: how long has it been quiet, measured against THIS
client's own cadence rather than a fixed threshold.

Runs without Claude, without a session, without a connector and without network. That is the point:
put it on a schedule and it keeps working when nobody is present. Anything needing judgement needs a
session, and a session needs a person.

The digest carries counts, dates and verdicts ONLY — never a file name, a target, a reason or a
person's name. It is safe to place in a folder shared with the practice.

Exit 0 always when a journal was read, whatever the verdict: this is a monitor, and a scheduled task
that fails on a finding stops reporting the findings. Exit 2 when no journal can be read.`;

const readCompanyId = (dir) => {
  for (const p of [join(dir, ".company.json"), join(dir, "..", ".company.json"), join(dir, "..", "..", ".company.json"), join(dir, "..", "..", "..", ".company.json")]) {
    try {
      const d = JSON.parse(readFileSync(p, "utf8"));
      if (typeof d.id === "string") return d.id;
    } catch {
      /* absent or unreadable is not an error here — the label is a convenience */
    }
  }
  return null;
};

const render = (d, company) => {
  const out = [];
  out.push(`# Digest de compromiso — ${company ?? "sin etiqueta"}`);
  out.push("");
  out.push(`Generado: ${d.generated} · veredicto: **${d.verdict}**`);
  out.push(`Periodos: ${d.periods.join(", ") || "ninguno"} · ${d.rows} filas · ${d.active_days} día(s) con actividad`);
  if (d.quiet_days !== null) out.push(`Días desde la última actividad: **${d.quiet_days}**`);
  out.push("");
  out.push("| Señal | Pregunta | Veredicto | Valor |");
  out.push("| --- | --- | --- | --- |");
  for (const s of d.signals) out.push(`| \`${s.id}\` | ${s.question} | **${s.verdict}** | ${s.value ?? "—"} |`);
  out.push("");
  for (const s of d.signals.filter((x) => x.verdict === ACT || x.verdict === WATCH || x.verdict === UNKNOWN)) {
    out.push(`- **${s.verdict} · \`${s.id}\`** — ${s.note}`);
  }
  out.push("");
  out.push("## Señal para mejorar el plugin");
  out.push("");
  if (d.plugin.recurrence.length) {
    out.push("| Detector | Hallazgos | Periodos que abarca el más amplio |");
    out.push("| --- | --- | --- |");
    for (const r of d.plugin.recurrence) out.push(`| \`${r.detector}\` | ${r.findings} | ${r.widest_span} |`);
  } else {
    out.push("Ningún patrón se repitió por encima del umbral.");
  }
  out.push("");
  out.push(
    d.plugin.capabilities_seen.length
      ? `Capacidades que aparecen en la bitácora: ${d.plugin.capabilities_seen.map((c) => `\`${c.capability}\` (${c.rows})`).join(", ")}.`
      : "Ninguna fila declara capacidad. Nada se invocó a través de una skill."
  );
  out.push("");
  out.push(
    "**Lo que falta en esa lista es el hallazgo.** Una skill que nadie invocó en meses está mal " +
      "descrita —la descripción es su única superficie de disparo— o no hace falta. Son arreglos " +
      "opuestos y solo una sesión los distingue: eso es `feedback`."
  );
  out.push("");
  out.push(
    "> Este digest lleva conteos, fechas y veredictos. No lleva nombres de archivo, objetivos, razones " +
      "ni nombres de personas. Un veredicto no es un diagnóstico: dice dónde mirar, no qué pasó."
  );
  return `${out.join("\n")}\n`;
};

const main = () => {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(`${HELP}\n`);
    process.exit(0);
  }
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith("--")) {
      process.stderr.write(`unexpected argument "${t}"\n`);
      process.exit(2);
    }
    const key = t.slice(2);
    if (key === "json") {
      args.json = true;
      continue;
    }
    if (!["journal", "out", "company"].includes(key)) {
      process.stderr.write(`unknown option "--${key}"\n`);
      process.exit(2);
    }
    const v = argv[++i];
    if (v === undefined || v.startsWith("--")) {
      process.stderr.write(`--${key} needs a value\n`);
      process.exit(2);
    }
    args[key] = v;
  }
  if (!args.journal) {
    process.stderr.write("--journal is required\n");
    process.exit(2);
  }

  const found = resolveExecutionDir(args.journal);
  if (!found) {
    process.stderr.write(
      `no <YYYY-MM>.jsonl files under "${args.journal}".\n\n` +
        "This is itself the most serious finding this tool can produce, and it has two causes that\n" +
        "must not be confused. Either nothing has ever been recorded — the hooks run in Claude Code\n" +
        "and Cowork and are inactive in chat on the web and in the Desktop Chat tab, so an operator\n" +
        "working there records nothing — or the journal was moved. Neither is a quiet month.\n"
    );
    process.exit(2);
  }

  const rows = load(found.dir, found.months);
  const company = args.company ?? readCompanyId(found.dir);
  const d = analyse(rows);
  const body = args.json ? `${JSON.stringify({ company, ...d }, null, 2)}\n` : render(d, company);

  if (args.out) {
    mkdirSync(dirname(args.out), { recursive: true });
    writeFileSync(args.out, body, "utf8");
    process.stdout.write(`${args.out} · ${d.verdict}\n`);
  } else {
    process.stdout.write(body);
  }
  process.exit(0);
};

if (process.argv[1]?.endsWith("watch.mjs")) main();
