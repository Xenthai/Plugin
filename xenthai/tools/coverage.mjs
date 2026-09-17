#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readCompany } from "../lib/company.mjs";
import { STORE_DOCUMENTS, familyDir, familyPattern, resolveForCompany } from "../lib/store-layout.mjs";

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
 * Which track and phase each document belongs to, keyed by its bracket-free template path
 * (`lib/store-layout.mjs`). The playbook code (A2 §3, A3 §2, A7 X2.5…) is the number that survives a
 * rename; the plugin's own operación 1-5 count is kept beside it because Decision 24 kept it on
 * purpose — the two answer different questions and neither replaces the other.
 *
 * The two tracks are numbered independently and both have a phase 1. A bare number is ambiguous
 * everywhere in this plugin, so nothing here reports one without its track.
 */
const PHASE = {
  "mapeo-empresa/00-ESTADO.md": ["operacion", "—"],
  "mapeo-empresa/00-PERFIL.md": ["operacion", "1 (A2 §3)"],
  "mapeo-empresa/01-empresa.md": ["operacion", "3 (A2 §5)"],
  "mapeo-empresa/01-personas.md": ["operacion", "3 (A2 §5)"],
  "mapeo-empresa/01-oferta/OFERTA.md": ["—", "offer"],
  "mapeo-empresa/01-oferta/PRODUCTOS.md": ["—", "offer"],
  "mapeo-empresa/01-oferta/SERVICIOS.md": ["—", "offer"],
  "mapeo-empresa/02-inventario.md": ["operacion", "3 (A2 §4)"],
  "mapeo-empresa/03-procesos/INDICE.md": ["operacion", "3 (A2 §7)"],
  "mapeo-empresa/03-procesos/PXX-nombre.md": ["operacion", "3 (A2 §7)"],
  "mapeo-empresa/04-evidencia/HALLAZGOS.md": ["operacion", "3 (A2 §6)"],
  "mapeo-empresa/04-evidencia/fuentes.md": ["operacion", "3 (A2 §6, §9)"],
  "mapeo-empresa/04-evidencia/ENTREVISTAS.md": ["—", "every session"],
  "mapeo-empresa/05-backlog.md": ["operacion", "4 (A3 §2)"],
  "mapeo-empresa/06-specs/AXX-nombre.md": ["operacion", "5 (A7 · X2.5)"],
  "mapeo-empresa/06-specs/REGISTRO.md": ["—", "handover"],
  "mapeo-empresa/07-datos/": ["—", "evidence"],
  "mapeo-empresa/08-linea-base.md": ["—", "baseline"],
  "mapeo-empresa/09-rutinas.md": ["—", "setup"],
  "mapeo-empresa/98-COBERTURA.md": ["operacion", "3 (A2 §8)"],
  "mapeo-empresa/99-preguntas-abiertas.md": ["operacion", "3 (A2 §8)"],
  "comunicacion/PRESENCE.md": ["comunicacion", "0"],
  "comunicacion/BRAND.md": ["comunicacion", "1"],
  "comunicacion/PROOF.md": ["comunicacion", "1"],
  "comunicacion/DESIGN.md": ["comunicacion", "1"],
  "comunicacion/CUSTOMERS.md": ["comunicacion", "1"],
  "comunicacion/VOICE.md": ["comunicacion", "2"],
  "comunicacion/SOCIAL.md": ["comunicacion", "plan"],
};

/**
 * Blocking fields, matched against the label status.mjs would report.
 *
 * A field is blocking when a LATER phase cannot be done honestly without it — not when it would be
 * nice to have. Integration surface blocks a quote; a role blocks an access map; a dated instance
 * blocks every duration downstream. Everything else is recorded, chased, and does not stop the work.
 *
 * Keep this list short. A list where everything blocks says the same thing as a list where nothing
 * does, and gets ignored the same way. Each document's regexes mechanise an X4 criterion
 * (`capabilities/method/tables/x4-criteria.md`) where one exists with the same concept — the
 * wording stays the tool's own regex, never a criterion retyped by hand:
 *
 * | Document | X4 criteria mechanised |
 * | --- | --- |
 * | `00-PERFIL.md` | PA1, PA2 — the four location questions and the archetype |
 * | `02-inventario.md` | IT2, IT3, IT4 — who controls each system, integration surface, channel modality |
 * | `03-procesos/PXX-nombre.md` | PR4, PR6, PR7 — frequency and minutes, exceptions, authorisation thresholds |
 * | `04-evidencia/HALLAZGOS.md`, `fuentes.md` | ED1, ED2, ED3 — sample and exclusions, the contrast table, unwritten business rules |
 * | `01-personas.md` | NE6 — single points of failure |
 */
const BLOCKING = {
  "mapeo-empresa/00-PERFIL.md": [/impide vender el doble/i, /arquetipo/i, /unidad de medida/i],
  "mapeo-empresa/02-inventario.md": [/superficie de integraci/i, /modalidad/i],
  "mapeo-empresa/03-procesos/PXX-nombre.md": [
    /rol responsable/i,
    /instancias con fecha/i,
    /excepci/i,
    /aprobaci[oó]n requerida|aprueba/i,
    /superficie de integraci/i,
    /veces al mes/i,
    /minutos por vez/i,
  ],
  "mapeo-empresa/04-evidencia/HALLAZGOS.md": [/tabla de contrastes/i, /reglas de negocio no escritas/i],
  "mapeo-empresa/04-evidencia/fuentes.md": [/qu[eé] quedó fuera/i, /autorizaci[oó]n/i],
  "mapeo-empresa/01-personas.md": [/[uú]nico punto de falla/i],
  "mapeo-empresa/06-specs/AXX-nombre.md": [
    /criterio/i,
    /identificador [uú]nico/i,
    /qu[eé] pasa si el registro ya existe/i,
    /escal[oó]n objetivo/i,
    /aprueba/i,
  ],
  "mapeo-empresa/08-linea-base.md": [/definici[oó]n operativa/i],
};

/**
 * Who is expected to hold the answer. SESSION.md governs the real choice; this is the default the
 * skill starts from and overrides when the company's own roles say otherwise.
 *
 * Roles, never names. People leave, and a name in a generated agenda is personal data.
 */
const HOLDER = {
  "mapeo-empresa/00-PERFIL.md": "quien dirige la empresa",
  "comunicacion/BRAND.md": "quien dirige la empresa",
  "mapeo-empresa/01-oferta/OFERTA.md": "quien cotiza",
  "mapeo-empresa/01-oferta/PRODUCTOS.md": "quien cotiza",
  "mapeo-empresa/01-oferta/SERVICIOS.md": "quien cotiza",
  "mapeo-empresa/02-inventario.md": "quien administra los sistemas — verificado por el consultor",
  "mapeo-empresa/01-personas.md": "quien dirige la empresa",
  "mapeo-empresa/03-procesos/PXX-nombre.md": "quien ejecuta el proceso",
  "mapeo-empresa/08-linea-base.md": "quien ejecuta el proceso",
  "mapeo-empresa/06-specs/REGISTRO.md": "quien va a operar la automatización",
  "mapeo-empresa/06-specs/AXX-nombre.md": "quien administra los sistemas",
  "mapeo-empresa/01-empresa.md": "quien tenga los archivos",
  "comunicacion/PRESENCE.md": "el consultor — se observa, no se pregunta",
  "mapeo-empresa/09-rutinas.md": "quien dirige la empresa",
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

/**
 * `--company` reads the manifest inside that directory when there is one, exactly as
 * `tools/scaffold.mjs` does — so every tool agrees on where `mapeo-<nombre>/` actually is.
 */
const ctx = args.company
  ? { ok: true, root: args.company, company: readCompany(args.company).company ?? null }
  : readCompany();
if (!ctx.ok) {
  process.stderr.write(
    `no company bound (${ctx.reason}). Pass --company <dir> or run inside an engagement folder.\n`
  );
  process.exit(1);
}

const companyName = ctx.company?.name ?? null;

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

/**
 * The document identifiers this tool reports on: every non-family entry from
 * `lib/store-layout.mjs`, plus the family templates' own template path (its blocking fields, if
 * any, apply to every real instance underneath it — checked per instance below).
 */
const expected = STORE_DOCUMENTS.map((d) => d.templatePath);

const isBlocking = (doc, label) => (BLOCKING[doc] ?? []).some((re) => re.test(label));

/** A family document's blocking/pending state is the worst across its real instances. */
const familyRows = (doc) => {
  const dir = join(ctx.root, ...familyDir(doc.templatePath, companyName).split("/"));
  if (!existsSync(dir)) return { exists: false, pending: null, labels: [] };
  const pattern = familyPattern(doc.templatePath);
  const files = readdirSync(dir).filter((f) => pattern.test(f));
  if (files.length === 0) return { exists: false, pending: null, labels: [] };
  let pending = 0;
  const labels = [];
  for (const f of files) {
    const text = readFileSync(join(dir, f), "utf8");
    pending += (text.match(PENDING) ?? []).length;
    labels.push(...pendingLabels(text));
  }
  return { exists: true, pending, labels: [...new Set(labels)] };
};

const rows = expected
  .filter((name) => {
    if (!args.track) return true;
    return (PHASE[name]?.[0] ?? "—") === args.track;
  })
  .map((name) => {
    const doc = STORE_DOCUMENTS.find((d) => d.templatePath === name);
    let exists;
    let pending;
    let labels;
    if (doc?.family) {
      ({ exists, pending, labels } = familyRows(doc));
    } else {
      const resolved = resolveForCompany(name, companyName);
      const path = join(ctx.root, ...resolved.split("/"));
      exists = existsSync(path);
      const text = exists ? readFileSync(path, "utf8") : "";
      pending = exists ? (text.match(PENDING) ?? []).length : null;
      labels = exists ? pendingLabels(text) : [];
    }
    const blocking = labels.filter((l) => isBlocking(name, l));
    const [track, phase] = PHASE[name] ?? ["—", "—"];
    return { document: name, track, phase, exists, pending, blocking, labels, holder: HOLDER[name] ?? null };
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
  `${pad("DOCUMENT", 34)}${pad("TRACK", 14)}${pad("PHASE", 18)}${pad("PENDING", 9)}${pad("BLOCKING", 10)}HOLDER\n`
);
for (const r of rows) {
  process.stdout.write(
    pad(r.document, 34) +
      pad(r.track, 14) +
      pad(r.phase, 18) +
      pad(r.exists ? r.pending : "absent", 9) +
      pad(r.exists ? r.blocking.length : "—", 10) +
      (r.holder ?? "—") +
      "\n"
  );
  const show = args.pending ? r.labels : r.blocking;
  for (const l of show) process.stdout.write(`${" ".repeat(34)}· ${l}\n`);
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
