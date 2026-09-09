#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany } from "../lib/company.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLUGIN = join(HERE, "..");

const HELP = `Xenth AI coverage — what is still missing, who holds it, and whether the next phase may start.

status.mjs counts pending fields and names the skill that owes each document. This adds the three
things it cannot: which pending fields are BLOCKING, which role is expected to hold each answer, and
a verdict on proceeding. It does the mechanical half; the coverage skill does the judgement — the
wording of each question and the grading of fields that are filled but weak.

  node tools/coverage.mjs [--company <dir>] [--json] [--pending] [--track <t>] [--help]

  --company <dir>   The engagement directory. Default: the bound company found from the cwd.
  --track <t>       Limit to one track: comunicacion | operacion. Default: both.
  --pending         List every pending label, not only the blocking ones.
  --json            Machine-readable output.

Exit 0 when no blocking field is pending. Exit 1 otherwise — a blocking gap is a phase that cannot
honestly start, not a cosmetic one.
`;

/**
 * Which track and phase each document belongs to.
 *
 * The two tracks are numbered independently and both have a phase 1. A bare number is ambiguous
 * everywhere in this plugin, so nothing here reports one without its track.
 */
const PHASE = {
  "INTAKE.md": ["—", "intake"],
  "PRESENCE.md": ["comunicacion", 0],
  "BRAND.md": ["comunicacion", 1],
  "PROOF.md": ["comunicacion", 1],
  "DESIGN.md": ["comunicacion", 1],
  "CUSTOMERS.md": ["comunicacion", 1],
  "VOICE.md": ["comunicacion", 2],
  "SOCIAL.md": ["comunicacion", "plan"],
  "PROFILE.md": ["operacion", 1],
  "SYSTEMS.md": ["operacion", 3],
  "PEOPLE.md": ["operacion", 3],
  "PROCESSES.md": ["operacion", 3],
  "AUTOMATION-SPEC.md": ["operacion", 5],
  "OFFER.md": ["—", "offer"],
  "PRODUCTS.md": ["—", "offer"],
  "SERVICES.md": ["—", "offer"],
  "BASELINE.md": ["—", "baseline"],
  "ROUTINES.md": ["—", "setup"],
  "AUTOMATIONS.md": ["—", "handover"],
  "INTERVIEW.md": ["—", "every session"],
};

/**
 * Blocking fields, matched against the label status.mjs would report.
 *
 * A field is blocking when a LATER phase cannot be done honestly without it — not when it would be
 * nice to have. Integration surface blocks a quote; a role blocks an access map; a dated instance
 * blocks every duration downstream. Everything else is recorded, chased, and does not stop the work.
 *
 * Keep this list short. A list where everything blocks says the same thing as a list where nothing
 * does, and gets ignored the same way.
 */
const BLOCKING = {
  "PROFILE.md": [/impide vender el doble/i, /arquetipo/i, /unidad de medida/i],
  "SYSTEMS.md": [/superficie de integraci/i, /modalidad/i],
  "PROCESSES.md": [
    /rol responsable/i,
    /instancias con fecha/i,
    /excepci/i,
    /aprobaci[oó]n requerida/i,
    /superficie de integraci/i,
    /veces al mes/i,
    /minutos por vez/i,
  ],
  "PEOPLE.md": [/[uú]nico punto de falla/i],
  "AUTOMATION-SPEC.md": [
    /criterio/i,
    /identificador [uú]nico/i,
    /qu[eé] pasa si el registro ya existe/i,
    /escal[oó]n objetivo/i,
    /qu[eé] rol aprueba/i,
  ],
  "BASELINE.md": [/definici[oó]n operativa/i],
};

/**
 * Who is expected to hold the answer. SESSION.md governs the real choice; this is the default the
 * skill starts from and overrides when the company's own roles say otherwise.
 *
 * Roles, never names. People leave, and a name in a generated agenda is personal data.
 */
const HOLDER = {
  "PROFILE.md": "quien dirige la empresa",
  "BRAND.md": "quien dirige la empresa",
  "OFFER.md": "quien cotiza",
  "PRODUCTS.md": "quien cotiza",
  "SERVICES.md": "quien cotiza",
  "SYSTEMS.md": "quien administra los sistemas — verificado por el consultor",
  "PEOPLE.md": "quien dirige la empresa",
  "PROCESSES.md": "quien ejecuta el proceso",
  "BASELINE.md": "quien ejecuta el proceso",
  "AUTOMATIONS.md": "quien va a operar la automatización",
  "AUTOMATION-SPEC.md": "quien administra los sistemas",
  "INTAKE.md": "quien tenga los archivos",
  "PRESENCE.md": "el consultor — se observa, no se pregunta",
  "ROUTINES.md": "quien dirige la empresa",
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

/**
 * status.mjs takes a pending row's FIRST CELL as the label, which is right for a two-column field
 * table and useless for an inventory grid — there the first cell is `P1` and the field's name is in
 * the header row above it. So this carries the nearest heading and, for a grid, the header cell in
 * the same column, and reports `section :: field`.
 *
 * The difference is not cosmetic. `P1` cannot be matched against a blocking rule and cannot be read
 * back to a client as a question; `1. Inventario de procesos :: Rol responsable` can be both.
 *
 * The `Esquema:` line every scaffold opens with is skipped: it is document metadata, not a field
 * anybody is owed.
 */
const pendingLabels = (text) => {
  const labels = [];
  let section = "";
  let header = null;
  for (const line of text.split(/\r?\n/)) {
    const h = /^#{2,3}\s+(.*)$/.exec(line);
    if (h) {
      section = h[1]
        .replace(/—\s*pendiente\s*—/g, "")
        .replace(/[·\s]+$/, "")
        .trim();
      header = null;
      continue;
    }
    const cells = /^\s*\|(.+)\|\s*$/.exec(line);
    if (cells) {
      const parts = cells[1].split("|").map((c) => c.trim());
      if (parts.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      if (!/—\s*pendiente\s*—/.test(line)) {
        header = parts;
        continue;
      }
      if (/^\*\*Esquema/.test(line)) continue;
      const first = parts[0];
      const named = first && !/^—\s*pendiente/.test(first) && !/^[A-Z]?\d+$/.test(first);
      if (named) {
        labels.push(`${section} :: ${first}`.slice(0, 90));
      } else {
        parts.forEach((c, i) => {
          if (!/—\s*pendiente\s*—/.test(c)) return;
          const name = header?.[i]?.replace(/\*/g, "").trim();
          if (name) labels.push(`${section} :: ${name}`.slice(0, 90));
        });
      }
      continue;
    }
    if (!/—\s*pendiente\s*—/.test(line)) continue;
    if (/^\s*(\*\*Esquema|·)/.test(line)) continue;
    const bold = /^\s*\*\*([^*]+?):?\*\*/.exec(line);
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const label = (bold?.[1] ?? bullet?.[1] ?? line).trim();
    if (label && !/^—\s*pendiente/.test(label)) labels.push(`${section} :: ${label}`.slice(0, 90));
  }
  return [...new Set(labels)];
};

const scaffoldDir = join(PLUGIN, "scaffold", "company");
const expected = readdirSync(scaffoldDir).filter((f) => f.endsWith(".md"));

const isBlocking = (doc, label) => (BLOCKING[doc] ?? []).some((re) => re.test(label));

const rows = expected
  .filter((name) => {
    if (!args.track) return true;
    return (PHASE[name]?.[0] ?? "—") === args.track;
  })
  .map((name) => {
    const path = join(ctx.root, name);
    const exists = existsSync(path);
    const text = exists ? readFileSync(path, "utf8") : "";
    const labels = exists ? pendingLabels(text) : [];
    const blocking = labels.filter((l) => isBlocking(name, l));
    const [track, phase] = PHASE[name] ?? ["—", "—"];
    return {
      document: name,
      track,
      phase,
      exists,
      pending: exists ? (text.match(PENDING) ?? []).length : null,
      blocking,
      labels,
      holder: HOLDER[name] ?? null,
    };
  });

/**
 * A document that does not exist yet is not a gap — it is a phase that has not run. Only a document
 * that exists and still withholds a blocking field stops the next one, because that is the case
 * where the session happened and the answer was not obtained.
 */
const blockers = rows.filter((r) => r.exists && r.blocking.length);
const verdict = blockers.length === 0 ? "ready" : "not-ready";

if (args.json) {
  process.stdout.write(
    JSON.stringify({ root: ctx.root, verdict, blockingDocuments: blockers.length, rows }, null, 2) + "\n"
  );
  process.exit(verdict === "ready" ? 0 : 1);
}

const pad = (s, n) => String(s).padEnd(n);
process.stdout.write(`\nCoverage — ${ctx.root}\n\n`);
process.stdout.write(
  `${pad("DOCUMENT", 22)}${pad("TRACK", 14)}${pad("PHASE", 15)}${pad("PENDING", 9)}${pad("BLOCKING", 10)}HOLDER\n`
);
for (const r of rows) {
  process.stdout.write(
    pad(r.document, 22) +
      pad(r.track, 14) +
      pad(r.phase, 15) +
      pad(r.exists ? r.pending : "absent", 9) +
      pad(r.exists ? r.blocking.length : "—", 10) +
      (r.holder ?? "—") +
      "\n"
  );
  const show = args.pending ? r.labels : r.blocking;
  for (const l of show) process.stdout.write(`${" ".repeat(22)}· ${l}\n`);
}

process.stdout.write(`\nVerdict: ${verdict}\n`);
if (verdict === "ready") {
  process.stdout.write(
    "No blocking field is pending in a document that exists. Absent documents are phases that have\n" +
      "not run, which the routing tables handle — not gaps this reports.\n\n"
  );
} else {
  process.stdout.write(
    `${blockers.length} document(s) exist and still withhold a blocking field. The session happened and\n` +
      "the answer was not obtained, so the next phase cannot start honestly. Turn each one into a\n" +
      "written question, a named document request, a derivation or an observation — never into\n" +
      '"investigate further" — and group them by the role that holds them.\n\n'
  );
}
process.exit(verdict === "ready" ? 0 : 1);
