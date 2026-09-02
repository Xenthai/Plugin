#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany } from "../lib/company.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = join(HERE, "..");

const HELP = `Xenth AI status — what each of a company's documents still needs, and who owes it.

Reads the company's documents and reports, per document: whether it exists, how many fields are
still marked pending, which sections are untouched, and which skill is supposed to fill it. A field
nobody owns stays pending forever, which is the failure this surfaces.

  node bin/status.mjs [--company <dir>] [--json] [--pending] [--help]

  --company <dir>   The engagement directory. Default: the bound company found from the cwd.
  --pending         List the pending field labels, not only the counts.
  --json            Machine-readable output.

Exit 0 when every document exists, 1 when one is missing or unowned — a missing document is a
phase that never ran, not a cosmetic gap.
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
  "PROCESSES.md": ["process-map", "process-access"],
  "BASELINE.md": ["baseline"],
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
    owedBy: owners,
    unowned: owners === null,
  };
});

const missing = report.filter((r) => !r.exists);
const unowned = report.filter((r) => r.unowned);
const totalPending = report.reduce((n, r) => n + (r.pending ?? 0), 0);

if (args.json) {
  process.stdout.write(
    JSON.stringify(
      { company: ctx.company?.name ?? args.company, totalPending, missing: missing.map((r) => r.document), unowned: unowned.map((r) => r.document), report },
      null,
      2
    ) + "\n"
  );
} else {
  process.stdout.write(`\n${ctx.company?.name ?? ctx.root}\n\n`);
  for (const r of report) {
    const state = !r.exists ? "AUSENTE" : r.pending === 0 ? "completo" : `${r.pending} pendientes`;
    process.stdout.write(
      `  ${r.document.padEnd(16)} ${state.padEnd(16)} ${r.unowned ? "*** sin dueño ***" : r.owedBy.join(", ")}\n`
    );
    if (args.pending && r.labels.length) {
      for (const l of r.labels.slice(0, 12)) process.stdout.write(`      · ${l}\n`);
      if (r.labels.length > 12) process.stdout.write(`      · … y ${r.labels.length - 12} más\n`);
    }
  }
  process.stdout.write(`\n  ${totalPending} campos pendientes · ${missing.length} documentos ausentes\n`);
  if (unowned.length) {
    process.stdout.write(`  DEFECTO DEL PLUGIN: ${unowned.map((r) => r.document).join(", ")} no tiene fase que lo llene\n`);
  }
}

process.exit(missing.length || unowned.length ? 1 : 0);
