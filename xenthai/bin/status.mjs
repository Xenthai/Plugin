#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";

import { copyFromPieces, readsAsSpanish } from "./legible.mjs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany } from "../lib/company.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = join(HERE, "..");

const HELP = `Xenth AI status — what each of a company's documents still needs, and who owes it.

Reads the company's documents and reports, per document: whether it exists, how many fields are
still marked pending, which skill is supposed to fill it, and whether what was written is actually
in es-MX. A field nobody owns stays pending forever, and a document filled in the wrong language
looks finished — those are the two failures this surfaces.

The language column reads es-MX, "NO ES es-MX", or "sin prosa" when a document is still mostly
pending and there is too little text to judge.

  node bin/status.mjs [--company <dir>] [--json] [--pending] [--help]

  --company <dir>   The engagement directory. Default: the bound company found from the cwd.
  --pending         List the pending field labels, not only the counts.
  --json            Machine-readable output.

Exit 0 when every document exists, is owned, and reads as es-MX. Exit 1 otherwise — a missing
document is a phase that never ran, and a document in the wrong language is a delivery defect,
neither of which is a cosmetic gap.
`;

/**
 * Which skill is responsible for leaving each document without pending fields.
 *
 * This map is the answer to "who owes this". A document absent from it has no owning phase, which
 * means nothing will ever fill it — the tool reports that as a defect in the plugin, not in the
 * company's data.
 */
const OWNERS = {
  "INTAKE.md": ["company-intake"],
  "PRESENCE.md": ["social-presence"],
  "BRAND.md": ["social-identity"],
  "PROOF.md": ["social-identity", "social-voice"],
  "DESIGN.md": ["social-identity"],
  "CUSTOMERS.md": ["social-identity"],
  "PEOPLE.md": ["social-identity", "process-map"],
  "VOICE.md": ["social-voice"],
  "SOCIAL.md": ["social-plan"],
  "OFFER.md": ["company-offer"],
  "PRODUCTS.md": ["company-offer"],
  "SERVICES.md": ["company-offer"],
  "SYSTEMS.md": ["process-map"],
  "PROCESSES.md": ["process-map", "process-access", "opportunities"],
  "BASELINE.md": ["baseline"],
  "ROUTINES.md": ["company-new", "report", "process-access"],
  "AUTOMATIONS.md": ["automate-handover"],
  "INTERVIEW.md": ["every skill that interviews"],
};

const PENDING = /—\s*pendiente\s*—/g;

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const key = argv[i].slice(2);
  args[key] = ["json", "pending", "help"].includes(key) ? true : (argv[++i] ?? "");
}

if (args.help) {
  process.stdout.write(HELP);
  process.exit(0);
}

const ctx = args.company ? { ok: true, root: args.company, company: null } : readCompany();
if (!ctx.ok) {
  process.stderr.write(
    `no company bound (${ctx.reason}). Pass --company <dir> or run inside an engagement folder.\n`
  );
  process.exit(1);
}

const scaffoldDir = join(PLUGIN, "scaffold", "company");
const expected = readdirSync(scaffoldDir).filter((f) => f.endsWith(".md"));

/**
 * Labels of pending fields: a table row's first cell, or the bold label preceding the marker.
 * Reported so an operator sees WHICH field is missing rather than only how many.
 */
const pendingLabels = (text) => {
  const labels = [];
  for (const line of text.split(/\r?\n/)) {
    if (!/—\s*pendiente\s*—/.test(line)) continue;
    const row = /^\s*\|\s*([^|]+?)\s*\|/.exec(line);
    const bold = /^\s*\*\*([^*]+?):?\*\*/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const label = (row?.[1] ?? bold?.[1] ?? bullet?.[1] ?? line).trim();
    if (label && !/^—\s*pendiente/.test(label)) labels.push(label.slice(0, 60));
  }
  return labels;
};

/**
 * Client-facing markdown the plugin GENERATES, rather than the fixed scaffold list — a report a
 * director reads, a plan that goes to review. These are the most visible artefacts an engagement
 * produces and they were the ones nothing audited, because they live in dated subfolders and the
 * scaffold list cannot name them.
 *
 * The exclusions are as load-bearing as the inclusions. `journal/` carries English event names by
 * design (`ai_action`, `review_start`) and is machine-read, `digest/` is written for the practice
 * rather than the client, and `feedback/` is about the plugin and must stay English so one client's
 * experience can improve every other install. Measuring any of the three would report a defect
 * where the design is correct, which is how a check gets ignored.
 */
const GENERATED_DIRS = ["reports", "content"];
const NEVER_AUDITED = ["journal", "digest", "feedback"];

/**
 * `pieces.json` is audited too, because it is the source of every word inside a rendered asset. The
 * PNG itself cannot be checked — the copy is pixels by then — but the render is deterministic from
 * this file, so measuring the source measures the published result exactly. `brand.json` and
 * `tokens.css` carry values rather than words and are not read.
 */
const COPY_JSON = "pieces.json";

const generated = (root) => {
  const found = [];
  const walk = (rel, depth) => {
    if (depth > 3) return;
    let entries = [];
    try {
      entries = readdirSync(join(root, rel), { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const next = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        if (!NEVER_AUDITED.includes(e.name)) walk(next, depth + 1);
      } else if (e.name.endsWith(".md") || e.name === COPY_JSON) {
        found.push(next);
      }
    }
  };
  for (const dir of GENERATED_DIRS) walk(dir, 1);
  return found.sort();
};

/**
 * The text to measure for one generated file. A `pieces.json` is reduced to the words a reader will
 * see; anything else is read as the prose it already is.
 */
const auditable = (root, rel) => {
  const raw = readFileSync(join(root, rel), "utf8");
  if (!rel.endsWith(COPY_JSON)) return raw;
  try {
    return copyFromPieces(JSON.parse(raw)).join(". ");
  } catch {
    return "";
  }
};

const report = expected.map((name) => {
  const path = join(ctx.root, name);
  const exists = existsSync(path);
  const text = exists ? readFileSync(path, "utf8") : "";
  const owners = OWNERS[name] ?? null;
  return {
    document: name,
    exists,
    pending: exists ? (text.match(PENDING) ?? []).length : null,
    labels: exists ? pendingLabels(text) : [],
    language: exists ? readsAsSpanish(text) : null,
    owedBy: owners,
    unowned: owners === null,
  };
});

/**
 * Documents that exist and do NOT read as Spanish. The scaffolds ship in es-MX and a skill fills
 * them in a session, so this is the only place the written result is checked — a document with
 * Spanish headings and English content looks finished and is a delivery defect. `doctor` guarantees
 * the manifest's locale is Spanish; this guarantees the files match it.
 */
const produced = generated(ctx.root).map((rel) => ({
  document: rel,
  exists: true,
  pending: null,
  labels: [],
  language: readsAsSpanish(auditable(ctx.root, rel)),
  owedBy: null,
  unowned: false,
  generated: true,
}));

const wrongLanguage = [...report, ...produced].filter((r) => r.exists && r.language?.verdict === false);

const missing = report.filter((r) => !r.exists);
const unowned = report.filter((r) => r.unowned);
const totalPending = report.reduce((n, r) => n + (r.pending ?? 0), 0);

if (args.json) {
  process.stdout.write(
    JSON.stringify(
      {
        company: ctx.company?.name ?? args.company,
        totalPending,
        missing: missing.map((r) => r.document),
        unowned: unowned.map((r) => r.document),
        wrongLanguage: wrongLanguage.map((r) => r.document),
        report,
        produced,
      },
      null,
      2
    ) + "\n"
  );
} else {
  process.stdout.write(`\n${ctx.company?.name ?? ctx.root}\n\n`);
  for (const r of report) {
    const state = !r.exists ? "AUSENTE" : r.pending === 0 ? "completo" : `${r.pending} pendientes`;
    const lang = !r.exists
      ? ""
      : r.language?.verdict === false
        ? "NO ES es-MX"
        : r.language?.verdict === null
          ? "sin prosa"
          : "es-MX";
    process.stdout.write(
      `  ${r.document.padEnd(16)} ${state.padEnd(16)} ${lang.padEnd(12)} ${r.unowned ? "*** sin dueño ***" : r.owedBy.join(", ")}\n`
    );
    if (args.pending && r.labels.length) {
      for (const l of r.labels.slice(0, 12)) process.stdout.write(`      · ${l}\n`);
      if (r.labels.length > 12) process.stdout.write(`      · … y ${r.labels.length - 12} más\n`);
    }
  }
  if (produced.length) {
    process.stdout.write(`\n  Entregables generados\n\n`);
    for (const r of produced) {
      const lang = r.language?.verdict === false ? "NO ES es-MX" : r.language?.verdict === null ? "sin prosa" : "es-MX";
      process.stdout.write(`  ${r.document.padEnd(33)} ${lang}\n`);
    }
  }
  process.stdout.write(`\n  ${totalPending} campos pendientes · ${missing.length} documentos ausentes\n`);
  if (unowned.length) {
    process.stdout.write(`  DEFECTO DEL PLUGIN: ${unowned.map((r) => r.document).join(", ")} no tiene fase que lo llene\n`);
  }
  if (wrongLanguage.length) {
    const named = wrongLanguage.map((r) => `${r.document} (${r.language.per1000.toFixed(0)}/1000, piso ${r.language.floor})`).join(", ");
    process.stdout.write(
      `  IDIOMA EQUIVOCADO: ${named}\n` +
        "  Estos documentos los lee la gente de la empresa. El scaffold nace en es-MX y una sesión lo llenó en otro idioma.\n"
    );
  }
}

process.exit(missing.length || unowned.length || wrongLanguage.length ? 1 : 0);
