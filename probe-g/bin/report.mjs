#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const HELP = `Xenth AI report — aggregate a company's execution journal into an auditable report.

  node bin/report.mjs --journal <dir> [--month YYYY-MM] [--out <file>] [--root <folderId>] [--json]

  --journal <dir>    Company store root, its journal/execution directory, or any directory holding
                     <YYYY-MM>.jsonl files. Required.
  --month YYYY-MM    One month, or several separated by commas. Default: every month found.
  --out <file>       Write there instead of stdout. Parent directories are created.
  --root <folderId>  The bound root folder. Without it the unauthorized-action check cannot run and
                     the report says so instead of reporting a clean result.
  --json             Emit the computed figures instead of the rendered report.

Every figure carries its definition, its source file, its period and who measured it. The report
body is es-MX because a director reads it. This tool never states a saving, an improvement or a
counterfactual: it has only the journal, and the journal records activity.
`;

const BOOLEAN_FLAGS = new Set(["json", "help"]);
const VALUE_FLAGS = new Set(["journal", "month", "out", "root"]);
const MONTH_FILE = /^(\d{4}-(?:0[1-9]|1[0-2]))\.jsonl$/;
const MONTH_ARG = /^\d{4}-(?:0[1-9]|1[0-2])$/;
const PERSON = "person:";
const FOLDER_FIELDS = ["parentId", "folderId"];
const REFERENCE_KEYS = ["fileId", "title", "file_path", "path", "url"];
const PENDING = "— pendiente —";

/**
 * Rejects an unknown or valueless flag rather than ignoring it: a mistyped `--month` would
 * otherwise silently widen the report to every month and still exit 0, which reads as success.
 */
const parseArgs = (argv) => {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) return { error: `unexpected argument "${token}"` };
    const key = token.slice(2);
    if (BOOLEAN_FLAGS.has(key)) {
      args[key] = true;
      continue;
    }
    if (!VALUE_FLAGS.has(key)) return { error: `unknown option "--${key}"` };
    const value = argv[++i];
    if (value === undefined || value.startsWith("--")) return { error: `--${key} needs a value` };
    args[key] = value;
  }
  return { args };
};

/**
 * Accepts the store root, its `journal/execution` directory, or the directory of month files
 * itself. Callers arrive with whichever path they already held, and guessing wrong would report
 * zero activity — indistinguishable from a month in which nothing happened.
 */
const resolveExecutionDir = (dir) => {
  const candidates = [join(dir, "journal", "execution"), join(dir, "execution"), dir];
  for (const candidate of candidates) {
    let names = [];
    try {
      names = readdirSync(candidate);
    } catch {
      continue;
    }
    const months = names.filter((name) => MONTH_FILE.test(name)).sort();
    if (months.length) return { dir: candidate, months: months.map((name) => name.replace(".jsonl", "")) };
  }
  return null;
};

/**
 * Unparsable lines are counted rather than skipped: a truncated append is a defect in the evidence
 * and a report that hides it overstates how complete the journal is.
 */
const readMonth = (file) => {
  const rows = [];
  const malformed = [];
  const bytes = readFileSync(file);
  const digest = createHash("sha256").update(bytes).digest("hex");
  const lines = bytes.toString("utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].trim();
    if (!text) continue;
    try {
      rows.push(JSON.parse(text));
    } catch {
      malformed.push(i + 1);
    }
  }
  return { rows, malformed, digest, bytes: bytes.length };
};

const tally = (values) => {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
};

/** Ties break on the key so one journal renders identically every run: two reports of one month
 * that differ in row order invite the reader to wonder what else moved. */
const ranked = (counts) =>
  [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), "en"));

const isNamedPerson = (actor) => typeof actor === "string" && actor.startsWith(PERSON) && actor.length > PERSON.length;

/** Spanish plural agreement, so a period with one run does not read "1 ejecuciones" to a director. */
const plural = (count, singular, many) => `${count} ${count === 1 ? singular : many}`;

/**
 * Drops the `person:` prefix for a column headed "Persona". The raw field value stays in the
 * per-actor breakdown, where it is the auditable thing being counted.
 */
const personName = (actor) => (isNamedPerson(actor) ? actor.slice(PERSON.length) : (actor ?? PENDING));

/**
 * Pairs `review_start` with `review_end` inside one session and one actor, closing the oldest open
 * start first because a person's review is sequential. Unmatched starts and ends are returned
 * instead of dropped: a review whose end was never recorded is missing evidence, and discarding it
 * would understate touch time while producing a tidier number.
 */
const reviewTouchTime = (rows) => {
  const open = new Map();
  const pairs = [];
  const unmatchedEnds = [];
  const unusable = [];
  const ordered = rows
    .filter((row) => row.event === "review_start" || row.event === "review_end")
    .map((row, index) => ({ row, index, at: Date.parse(row.ts ?? "") }))
    .sort((a, b) => a.at - b.at || a.index - b.index);
  for (const item of ordered) {
    if (!Number.isFinite(item.at)) {
      unusable.push(item.row);
      continue;
    }
    const key = `${item.row.session ?? ""}\u0000${item.row.actor ?? ""}`;
    if (item.row.event === "review_start") {
      if (!open.has(key)) open.set(key, []);
      open.get(key).push(item);
      continue;
    }
    const queue = open.get(key);
    if (!queue || !queue.length) {
      unmatchedEnds.push(item.row);
      continue;
    }
    const start = queue.shift();
    pairs.push({ actor: start.row.actor ?? null, session: start.row.session ?? null, ms: item.at - start.at });
  }
  const unmatchedStarts = [...open.values()].flat().map((item) => item.row);
  const ms = pairs.reduce((total, pair) => total + pair.ms, 0);
  const byActor = new Map();
  for (const pair of pairs) {
    const current = byActor.get(pair.actor) ?? { pairs: 0, ms: 0 };
    byActor.set(pair.actor, { pairs: current.pairs + 1, ms: current.ms + pair.ms });
  }
  return { pairs, ms, byActor, unmatchedStarts, unmatchedEnds, unusable };
};

const minutesOf = (ms) => Math.round(ms / 6000) / 10;

const approvalsOf = (rows) => {
  const all = rows.filter((row) => row.event === "approval");
  const named = all.filter((row) => isNamedPerson(row.actor));
  const unnamed = all.filter((row) => !isNamedPerson(row.actor));
  return {
    total: all.length,
    named: named.length,
    unnamed: unnamed.length,
    approvers: ranked(tally(named.map((row) => row.actor.slice(PERSON.length)))),
    unnamedRows: unnamed.map((row) => ({
      actor: row.actor ?? null,
      ts_local: row.ts_local ?? row.ts ?? null,
      why: row.why ?? null,
    })),
  };
};

/**
 * Rows whose store target names a folder other than the bound root. This finds disagreements the
 * journal can see; it cannot establish absence, because the journal holds only what passed through
 * the plugin. The report states that limit next to the result.
 */
const foreignFolderRows = (rows, root) => {
  const found = [];
  for (const row of rows) {
    const target = row.target;
    if (!target || typeof target !== "object") continue;
    for (const field of FOLDER_FIELDS) {
      const value = target[field];
      if (typeof value !== "string" || !value || value === root) continue;
      found.push({
        event: row.event ?? PENDING,
        tool: row.tool ?? PENDING,
        field,
        value,
        reference: REFERENCE_KEYS.map((key) => target[key]).find((v) => typeof v === "string" && v) ?? PENDING,
        ts_local: row.ts_local ?? row.ts ?? PENDING,
      });
    }
  }
  return found;
};

/**
 * The exact sentence the report is allowed to make about unauthorized actions, built from what was
 * actually measured. It is generated rather than written by hand so the claim can never be stronger
 * than the check that ran: with no `--root` the folder comparison did not happen, and saying
 * nothing about it would let a reader assume it passed.
 */
const unauthorizedStatement = ({ guardErrors, foreign, checked, root }) => {
  if (!checked) {
    return `No se registraron filas \`guard_error\` (${guardErrors}). La comprobación de escrituras al almacén fuera de la carpeta raíz vinculada **no se ejecutó**: no se indicó la carpeta raíz, así que este reporte no afirma nada sobre ella.`;
  }
  if (guardErrors === 0 && foreign.length === 0) {
    return `No se registraron filas \`guard_error\` y no se registró ninguna escritura al almacén fuera de la carpeta raíz vinculada (\`${root}\`).`;
  }
  const parts = [];
  if (guardErrors > 0) parts.push(`${guardErrors} fila(s) \`guard_error\``);
  if (foreign.length > 0) parts.push(`${foreign.length} referencia(s) a una carpeta distinta de \`${root}\``);
  return `La bitácora **no** sostiene la afirmación limpia en este periodo: ${parts.join(" y ")}. El detalle está en la tabla siguiente.`;
};

const summarise = ({ month, file, rows, malformed, digest, bytes, root }) => {
  const events = tally(rows.map((row) => row.event ?? PENDING));
  const countOf = (event) => events.get(event) ?? 0;
  const review = reviewTouchTime(rows);
  const approvals = approvalsOf(rows);
  const foreign = root ? foreignFolderRows(rows, root) : [];
  const guardErrors = countOf("guard_error");
  const stamps = rows.map((row) => row.ts_local ?? row.ts).filter((value) => typeof value === "string").sort();
  const plugin = [...new Set(rows.map((row) => row.plugin).filter(Boolean))].sort().join(" / ") || PENDING;
  const company = [...new Set(rows.map((row) => row.company).filter(Boolean))].sort().join(", ") || PENDING;
  const unauthorized = { guardErrors, foreign, checked: Boolean(root), root: root ?? null };
  const defects = [];
  if (approvals.unnamed > 0) {
    defects.push(
      `${approvals.unnamed} aprobación(es) sin persona nombrada. Una aprobación cuyo actor no inicia con \`person:\` no demuestra que alguien aprobara: no la presente como aprobación.`
    );
  }
  if (review.unmatchedStarts.length > 0) {
    defects.push(
      `${review.unmatchedStarts.length} inicio(s) de revisión sin cierre. Su tiempo no se suma al total; el tiempo de revisión reportado es un mínimo, no el real.`
    );
  }
  if (review.unmatchedEnds.length > 0) {
    defects.push(`${review.unmatchedEnds.length} cierre(s) de revisión sin inicio previo en la misma sesión y actor.`);
  }
  if (review.unusable.length > 0) {
    defects.push(`${review.unusable.length} fila(s) de revisión sin marca de tiempo utilizable.`);
  }
  if (malformed.length > 0) {
    defects.push(`${malformed.length} línea(s) ilegibles en el archivo de origen (líneas ${malformed.join(", ")}).`);
  }
  const unknown = ranked(events).filter(([event]) => String(event).startsWith("unknown:"));
  if (unknown.length > 0) {
    defects.push(
      `Eventos fuera del vocabulario: ${unknown.map(([event, n]) => `${event} (${n})`).join(", ")}. No son comparables con otros periodos.`
    );
  }
  if (!unauthorized.checked) {
    defects.push("La carpeta raíz vinculada no se indicó, así que la comprobación de escrituras fuera de ella no se ejecutó.");
  }
  return {
    month,
    source: basename(file),
    digest,
    bytes,
    rows: rows.length,
    malformedLines: malformed,
    plugin,
    company,
    measuredBy: `Xenth AI Plugin ${plugin} desde la bitácora`,
    observed: { first: stamps[0] ?? PENDING, last: stamps[stamps.length - 1] ?? PENDING },
    actors: ranked(tally(rows.map((row) => row.actor ?? PENDING))),
    events: ranked(events),
    automation: { runs: countOf("ai_action"), escalations: countOf("escalation") },
    approvals,
    review: {
      pairs: review.pairs.length,
      ms: review.ms,
      minutes: minutesOf(review.ms),
      byActor: [...review.byActor.entries()]
        .map(([actor, value]) => [actor, { pairs: value.pairs, minutes: minutesOf(value.ms) }])
        .sort((a, b) => b[1].minutes - a[1].minutes || String(a[0]).localeCompare(String(b[0]), "en")),
      unmatchedStarts: review.unmatchedStarts.map((row) => ({
        actor: row.actor ?? PENDING,
        session: row.session ?? PENDING,
        ts_local: row.ts_local ?? row.ts ?? PENDING,
        why: row.why ?? null,
      })),
      unmatchedEnds: review.unmatchedEnds.length,
      unusable: review.unusable.length,
    },
    counts: {
      lookup: countOf("lookup"),
      blocked: countOf("blocked"),
      delivery: countOf("delivery"),
      guard_error: guardErrors,
      error: countOf("error"),
    },
    unauthorized: { ...unauthorized, statement: unauthorizedStatement(unauthorized) },
    defects,
  };
};

const cell = (value) => String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");

const table = (headers, rows) =>
  [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");

const ISAE_HEADERS = ["Métrica", "Valor", "Definición", "Fuente", "Periodo", "Medido por"];

const isaeRows = (summary, entries) =>
  entries.map(({ metric, value, definition }) => [
    metric,
    value,
    definition,
    summary.source,
    summary.month,
    summary.measuredBy,
  ]);

/**
 * The automation figure and the escalation figure are one metric with one value on purpose. A run
 * count alone is an output metric that proves nothing, and two separate rows are two rows one of
 * which gets quoted without the other.
 */
const coreMetrics = (summary) => [
  {
    metric: "Filas de bitácora",
    value: summary.rows,
    definition: "Líneas JSONL legibles en el archivo de origen.",
  },
  {
    metric: "Ejecuciones automatizadas acompañadas de escalamientos a una persona",
    value: `${plural(summary.automation.runs, "ejecución", "ejecuciones")} / ${plural(summary.automation.escalations, "escalamiento", "escalamientos")}`,
    definition:
      "Filas `ai_action` publicadas junto a las filas `escalation`. El conteo de ejecuciones es una métrica de salida: por sí solo no demuestra ningún resultado, y por eso nunca se publica sin los escalamientos.",
  },
  {
    metric: "Aprobaciones con persona nombrada",
    value: summary.approvals.named,
    definition: "Filas `approval` cuyo campo `actor` inicia con `person:`.",
  },
  {
    metric: "Aprobaciones sin persona nombrada (defecto)",
    value: summary.approvals.unnamed,
    definition: "Filas `approval` sin persona nombrada. Una aprobación anónima no demuestra que alguien aprobara.",
  },
  {
    metric: "Tiempo de revisión humana (minutos)",
    value: summary.review.minutes,
    definition:
      "Suma de los intervalos `review_start`→`review_end` emparejados por actor dentro de una misma sesión. Es touch time, no tiempo de ciclo.",
  },
  {
    metric: "Pares de revisión emparejados",
    value: summary.review.pairs,
    definition: "Intervalos completos que sostienen el minutaje anterior.",
  },
  {
    metric: "Inicios de revisión sin cierre (defecto)",
    value: summary.review.unmatchedStarts.length,
    definition: "Filas `review_start` sin `review_end`. Se reportan aparte y su tiempo no se suma.",
  },
  {
    metric: "Cierres de revisión sin inicio (defecto)",
    value: summary.review.unmatchedEnds,
    definition: "Filas `review_end` sin `review_start` previo en la misma sesión y actor.",
  },
  {
    metric: "Consultas",
    value: summary.counts.lookup,
    definition: "Filas `lookup`: una búsqueda o lectura de referencia.",
  },
  {
    metric: "Acciones bloqueadas",
    value: summary.counts.blocked,
    definition: "Filas `blocked`: una acción que la guardia detuvo.",
  },
  {
    metric: "Entregas",
    value: summary.counts.delivery,
    definition: "Filas `delivery`: un artefacto puesto a disposición del cliente.",
  },
  {
    metric: "Errores de guardia",
    value: summary.counts.guard_error,
    definition: "Filas `guard_error`: la guardia falló al evaluar una acción.",
  },
  {
    metric: "Errores",
    value: summary.counts.error,
    definition: "Filas `error`: una herramienta falló.",
  },
];

/**
 * The digest of the exact bytes this report was computed from, and the client's own command to
 * check it.
 *
 * Deliberately not a hash chain over the rows. A chain is computed by whoever writes the journal,
 * so it detects nothing that party wants hidden — it would only prove the file had not been
 * reordered by someone with no write access, who is not the threat. What makes a digest mean
 * something is where it comes to rest: this report is written into the CLIENT's store, whose
 * revision history is kept by the storage provider and cannot be rewritten by the practice. From
 * the moment the client holds this report, the journal for this month is pinned, and a later edit
 * to it produces a different digest against a dated document nobody here controls.
 *
 * The limit is stated in the block itself rather than left for a reader to work out, because a
 * verification section that overstates what it verifies is worse than none: it invites exactly the
 * trust it has not earned. It pins the file from this report forward. It says nothing about what
 * the file was before the first report was delivered.
 */
const verification = (summary) =>
  [
    "> **Verificación de origen.** Este reporte se calculó sobre estos bytes exactos:",
    ">",
    `> - archivo: \`${summary.source}\` · ${summary.bytes} bytes · ${plural(summary.rows, "fila", "filas")}`,
    `> - SHA-256: \`${summary.digest}\``,
    ">",
    "> Para comprobarlo usted mismo, sobre su propia copia del archivo. En Windows:",
    ">",
    `> \`\`\`\n> certutil -hashfile ${summary.source} SHA256\n> \`\`\``,
    ">",
    "> En Mac o Linux:",
    ">",
    `> \`\`\`\n> shasum -a 256 ${summary.source}\n> \`\`\``,
    ">",
    "> Si el resultado coincide, el archivo que usted tiene es el que produjo estas cifras. Si no",
    "> coincide, el archivo cambió después de este reporte y las cifras de aquí ya no le corresponden.",
    ">",
    "> **Lo que esto no comprueba:** que la bitácora estuviera completa antes de la fecha de este",
    "> reporte. Una bitácora sólo registra lo que pasó por el plugin. Esta huella fija el archivo de",
    "> aquí en adelante, no hacia atrás.",
  ].join("\n");

const renderMonth = (summary) => {
  const out = [];
  out.push(`## Periodo ${summary.month}`);
  out.push("");
  out.push(
    `Empresa: ${summary.company} · archivo de origen: \`${summary.source}\` · filas observadas del ${summary.observed.first} al ${summary.observed.last}.`
  );
  out.push("");
  out.push(verification(summary));
  out.push("");
  out.push("### Cifras medidas y evidenciadas");
  out.push("");
  out.push(table(ISAE_HEADERS, isaeRows(summary, coreMetrics(summary))));
  out.push("");
  out.push("### Acciones por actor");
  out.push("");
  out.push(
    table(
      ISAE_HEADERS,
      isaeRows(
        summary,
        summary.actors.map(([actor, count]) => ({
          metric: `Acciones de \`${actor}\``,
          value: count,
          definition: `Filas cuyo campo \`actor\` es \`${actor}\`.`,
        }))
      )
    )
  );
  out.push("");
  out.push("### Acciones por tipo de evento");
  out.push("");
  out.push(
    table(
      ISAE_HEADERS,
      isaeRows(
        summary,
        summary.events.map(([event, count]) => ({
          metric: `Eventos \`${event}\``,
          value: count,
          definition: `Filas cuyo campo \`event\` es \`${event}\`.`,
        }))
      )
    )
  );
  out.push("");
  out.push("### Aprobaciones");
  out.push("");
  if (summary.approvals.approvers.length) {
    out.push(
      table(
        ["Persona", "Aprobaciones", "Fuente", "Periodo", "Medido por"],
        summary.approvals.approvers.map(([name, count]) => [name, count, summary.source, summary.month, summary.measuredBy])
      )
    );
  } else {
    out.push("No hay ninguna aprobación con persona nombrada en este periodo.");
  }
  out.push("");
  if (summary.approvals.unnamed > 0) {
    out.push(
      `**Defecto de evidencia:** ${summary.approvals.unnamed} de ${summary.approvals.total} aprobación(es) no nombran a la persona que aprobó. Una aprobación sin nombre no demuestra nada y no debe presentarse como aprobación.`
    );
    out.push("");
    out.push(
      table(
        ["Actor registrado", "Momento", "Motivo registrado"],
        summary.approvals.unnamedRows.map((row) => [row.actor ?? PENDING, row.ts_local ?? PENDING, row.why ?? PENDING])
      )
    );
    out.push("");
  }
  out.push("### Tiempo de revisión humana");
  out.push("");
  if (summary.review.byActor.length) {
    out.push(
      table(
        ["Persona", "Pares emparejados", "Minutos", "Fuente", "Periodo", "Medido por"],
        summary.review.byActor.map(([actor, value]) => [
          personName(actor),
          value.pairs,
          value.minutes,
          summary.source,
          summary.month,
          summary.measuredBy,
        ])
      )
    );
  } else {
    out.push("No hay ningún par `review_start`→`review_end` completo en este periodo.");
  }
  out.push("");
  if (summary.review.unmatchedStarts.length) {
    out.push(
      `**Inicios de revisión sin cierre:** ${summary.review.unmatchedStarts.length}. Su duración no se suma, así que el minutaje anterior es un mínimo medido, no el tiempo real de revisión.`
    );
    out.push("");
    out.push(
      table(
        ["Persona", "Sesión", "Inicio", "Motivo registrado"],
        summary.review.unmatchedStarts.map((row) => [personName(row.actor), row.session, row.ts_local, row.why ?? PENDING])
      )
    );
    out.push("");
  }
  out.push("### Acciones no autorizadas");
  out.push("");
  out.push(`> ${summary.unauthorized.statement}`);
  out.push("");
  if (summary.unauthorized.foreign.length) {
    out.push(
      table(
        ["Evento", "Herramienta", "Campo", "Carpeta registrada", "Referencia", "Momento"],
        summary.unauthorized.foreign.map((row) => [row.event, row.tool, row.field, row.value, row.reference, row.ts_local])
      )
    );
    out.push("");
  }
  out.push(
    "La bitácora contiene únicamente lo que pasó por el plugin. Es evidencia de lo registrado, no una prueba de ausencia: no puede demostrar que no ocurriera una acción no autorizada por otra vía."
  );
  out.push("");
  out.push("### Defectos de evidencia del periodo");
  out.push("");
  if (summary.defects.length) {
    for (const defect of summary.defects) out.push(`- ${defect}`);
  } else {
    out.push("- Ninguno detectado en este periodo.");
  }
  out.push("");
  return out.join("\n");
};

const renderReport = (result) => {
  const out = [];
  const companies = [...new Set(result.periods.map((period) => period.company))].join(", ") || PENDING;
  out.push("# Reporte de actividad registrada en bitácora");
  out.push("");
  out.push(`- **Empresa:** ${companies}`);
  out.push(`- **Periodos incluidos:** ${result.periods.map((period) => period.month).join(", ")}`);
  out.push(`- **Directorio de bitácora:** \`${result.journalDir}\``);
  out.push(`- **Carpeta raíz vinculada:** ${result.root ? `\`${result.root}\`` : "no indicada"}`);
  out.push(`- **Reporte generado:** ${result.generated}`);
  out.push("");
  out.push(
    "Este reporte se construye únicamente con la bitácora de ejecución. Cada cifra declara su definición, su archivo de origen, el periodo que cubre y quién la midió, y toda cifra aquí está **medida y evidenciada** contra esos archivos: ninguna proviene de una estimación ni de un recuerdo."
  );
  out.push("");
  out.push("## Lo que este reporte no dice");
  out.push("");
  out.push(
    "- **Describe actividad, no mejora.** Un conteo de acciones es una métrica de salida. Para hablar de mejora hace falta una métrica de proceso del propio cliente medida antes y ahora, y esa métrica no vive en la bitácora."
  );
  out.push(
    "- **No contiene ningún contrafactual.** No dice cuánto habría tardado el trabajo sin el sistema, porque ese dato no existe: nadie ejecutó el mes dos veces."
  );
  out.push(
    "- **No sustituye la lectura de quien lo presenta.** El mecanismo, las explicaciones alternativas y la contribución que sí se puede sostener se redactan aparte, sobre estas cifras."
  );
  out.push("");
  for (const period of result.periods) {
    out.push(renderMonth(period));
  }
  return `${out.join("\n").trimEnd()}\n`;
};

const args = parseArgs(process.argv.slice(2));

if (args.error) {
  process.stderr.write(`${args.error}\nRun with --help for the options.\n`);
  process.exit(1);
}

if (args.args.help) {
  process.stdout.write(HELP);
  process.exit(0);
}

if (!args.args.journal) {
  process.stderr.write("--journal <dir> is required.\nRun with --help for the options.\n");
  process.exit(1);
}

const journalRoot = resolve(args.args.journal);
const found = resolveExecutionDir(journalRoot);

if (!found) {
  process.stderr.write(
    `no <YYYY-MM>.jsonl files under "${journalRoot}" (tried journal/execution, execution, and the directory itself).

An absent journal is NOT the same as a quiet month, and the difference has to reach the report.
A journal that never existed usually means the hooks never ran: they are active in Claude Cowork and
Claude Code, and inactive in chat on the web and in the Desktop Chat tab. Nothing there records a
tool call, so there is no gap to detect — the whole file is simply missing.

Say which of the two it is. Presenting an absence of rows as an absence of activity is the one
reading of this that a client would be right to hold against the practice.
`
  );
  process.exit(1);
}

const requested = args.args.month ? args.args.month.split(",").map((value) => value.trim()).filter(Boolean) : null;

if (requested) {
  const malformed = requested.filter((month) => !MONTH_ARG.test(month));
  if (malformed.length) {
    process.stderr.write(`--month expects YYYY-MM, got "${malformed.join(", ")}".\n`);
    process.exit(1);
  }
  const missing = requested.filter((month) => !found.months.includes(month));
  if (missing.length) {
    process.stderr.write(`no journal file for ${missing.join(", ")} in "${found.dir}". Available: ${found.months.join(", ")}.\n`);
    process.exit(1);
  }
}

const months = requested ?? found.months;

const result = {
  generated: new Date().toISOString(),
  journalDir: found.dir,
  root: args.args.root ?? null,
  rootChecked: Boolean(args.args.root),
  periods: months.map((month) => {
    const file = join(found.dir, `${month}.jsonl`);
    const { rows, malformed, digest, bytes } = readMonth(file);
    return summarise({ month, file, rows, malformed, digest, bytes, root: args.args.root ?? null });
  }),
};

const body = args.args.json ? `${JSON.stringify(result, null, 2)}\n` : renderReport(result);

if (args.args.out) {
  const out = resolve(args.args.out);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, body, "utf8");
  process.stdout.write(`wrote ${out}\n`);
} else {
  process.stdout.write(body);
}
