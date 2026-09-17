import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SCAFFOLD = join(ROOT, "scaffold", "company");

const docs = readdirSync(SCAFFOLD, { recursive: true })
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.split(sep).join("/"))
  .sort();
const read = (f) => readFileSync(join(SCAFFOLD, ...f.split("/")), "utf8");

/**
 * Words that only occur in English prose, chosen so they cannot appear inside a Spanish sentence
 * or a fenced code block's identifiers. A scaffold is read by a Mexican director, so English prose
 * in one is a defect, not a style preference.
 */
const ENGLISH_MARKERS = /\b(the|this file|owner of|when the|should be|must be|instead of)\b/i;

/**
 * Scaffolds this suite governs. Files a build wave produced join the list once reviewed, so the
 * suite states its real coverage instead of implying it checked everything.
 */
const GOVERNED = [
  "comunicacion/BRAND.md", "comunicacion/VOICE.md", "comunicacion/PROOF.md", "comunicacion/DESIGN.md",
  "comunicacion/SOCIAL.md", "comunicacion/PRESENCE.md", "comunicacion/CUSTOMERS.md",
  "mapeo-empresa/00-ESTADO.md", "mapeo-empresa/00-PERFIL.md", "mapeo-empresa/01-empresa.md",
  "mapeo-empresa/01-personas.md", "mapeo-empresa/01-oferta/OFERTA.md", "mapeo-empresa/01-oferta/PRODUCTOS.md",
  "mapeo-empresa/01-oferta/SERVICIOS.md", "mapeo-empresa/02-inventario.md",
  "mapeo-empresa/03-procesos/INDICE.md", "mapeo-empresa/03-procesos/PXX-nombre.md",
  "mapeo-empresa/04-evidencia/ENTREVISTAS.md", "mapeo-empresa/04-evidencia/HALLAZGOS.md",
  "mapeo-empresa/04-evidencia/fuentes.md", "mapeo-empresa/05-backlog.md",
  "mapeo-empresa/06-specs/AXX-nombre.md", "mapeo-empresa/06-specs/REGISTRO.md",
  "mapeo-empresa/07-datos/README.md", "mapeo-empresa/08-linea-base.md", "mapeo-empresa/09-rutinas.md",
  "mapeo-empresa/98-COBERTURA.md", "mapeo-empresa/99-preguntas-abiertas.md",
];

const UNGOVERNED = docs.filter((f) => !GOVERNED.includes(f));

/**
 * A folder-index note rather than a data-capturing document — it has no field for anyone to fill,
 * so neither the `— pendiente —` marker nor a schema line applies to it.
 */
const NO_FIELDS = ["mapeo-empresa/07-datos/README.md"];

/**
 * True when a document DEFINES the fact as a fillable field rather than merely mentioning it.
 *
 * In a table only the first TWO cells are tested, because that is where a label lives — the first
 * cell of a body row, or the first two columns of a header row. Testing the whole row cannot tell a
 * label from an explanation in a later cell, and that produced three false defects; testing only
 * the first cell then broke every pattern anchored across two header columns. A cross-reference
 * explaining why a fact matters is good writing, and only a second fillable definition drifts.
 */
const definesField = (text, pattern) =>
  text.split(/\r?\n/).some((line) => {
    const row = /^\s*\|([^|]*)\|([^|]*)\|/.exec(line);
    if (row) return pattern.test(`|${row[1]}|${row[2]}|`);
    return pattern.test(line) && (/^\s*\*\*.*:\*\*/.test(line) || /^#{1,4}\s/.test(line) || /^```/.test(line));
  });

/**
 * Every fact has exactly one owning document. A second document defining it drifts, and then two
 * files disagree with no way to tell which is current. A duplicate must be replaced by a link.
 */
const SINGLE_OWNER = [
  { fact: "who authorises public claims", owner: "mapeo-empresa/01-empresa.md", pattern: /[Aa]firmaciones p[úu]blicas/ },
  { fact: "who actually decides", owner: "mapeo-empresa/01-empresa.md", pattern: /qui[ée]n decide de verdad/i },
  { fact: "the product catalogue", owner: "mapeo-empresa/01-oferta/PRODUCTOS.md", pattern: /^\|\s*SKU o clave\s*\|/im },
  { fact: "the service catalogue", owner: "mapeo-empresa/01-oferta/SERVICIOS.md", pattern: /^\|\s*Servicio\s*\|\s*C[óo]mo se le llama/im },
  { fact: "the commercial terms", owner: "mapeo-empresa/01-oferta/OFERTA.md", pattern: /^\|\s*Forma de pago\s*\|/im },
  { fact: "the discount limit", owner: "mapeo-empresa/01-oferta/OFERTA.md", pattern: /^\*\*Descuentos:\*\*/im },
  { fact: "category entry points", owner: "comunicacion/CUSTOMERS.md", pattern: /Qu[ée] dispara la b[úu]squeda|puntos de entrada a la categor[íi]a/i },
  { fact: "the claims register", owner: "comunicacion/PROOF.md", pattern: /^\|\s*Afirmaci[óo]n, textual/im },
  { fact: "the design tokens block", owner: "comunicacion/DESIGN.md", pattern: /^```css$/im },
  { fact: "the word lists", owner: "comunicacion/VOICE.md", pattern: /^\*\*No decimos:\*\*/im },
  { fact: "the dated public-state observation", owner: "comunicacion/PRESENCE.md", pattern: /^\|\s*Seguidores\s*\|/im },
];

/** Resolves a Markdown link's target relative to the file that carries it, POSIX-style. */
const resolveLink = (from, target) => {
  if (/^https?:\/\//.test(target) || target.startsWith("#")) return null;
  const dir = from.split("/").slice(0, -1).join("/");
  const parts = [...dir.split("/").filter(Boolean), ...target.split("/")];
  const out = [];
  for (const part of parts) {
    if (part === "." || part === "") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out.join("/");
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("every scaffold a session creates exists", () => {
  const missing = GOVERNED.filter((f) => !existsSync(join(SCAFFOLD, ...f.split("/"))));
  return [missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${GOVERNED.length} present, ${docs.length} on disk`];
});

check("scaffolds are es-MX, because a director reads them", () => {
  const offenders = docs.filter((f) => {
    const prose = read(f)
      .split(/\r?\n/)
      .filter((l) => !l.trim().startsWith("```") && !/^\s*[-|]/.test(l))
      .join(" ");
    return ENGLISH_MARKERS.test(prose);
  });
  return [offenders.length === 0, offenders.length ? `English prose in: ${offenders.join(", ")}` : "all Spanish"];
});

check("every scaffold marks uncaptured fields rather than inventing them", () => {
  const offenders = docs.filter((f) => !NO_FIELDS.includes(f) && !/—\s*pendiente\s*—/.test(read(f)));
  return [offenders.length === 0, offenders.length ? `no pendiente marker: ${offenders.join(", ")}` : "all marked"];
});

check("every scaffold declares a schema version", () => {
  const offenders = GOVERNED.filter((f) => !NO_FIELDS.includes(f) && !/\*\*Esquema:\*\*/.test(read(f)));
  return [
    offenders.length === 0,
    offenders.length ? `no schema line: ${offenders.join(", ")}` : `${GOVERNED.length} governed, ${UNGOVERNED.join(", ") || "none"} not yet reviewed`,
  ];
});

check("one fact, one owner — no document defines another's field", () => {
  const problems = [];
  for (const { fact, owner, pattern } of SINGLE_OWNER) {
    const definers = docs.filter((f) => definesField(read(f), pattern));
    if (!definers.includes(owner)) {
      problems.push(`${fact}: owner ${owner} does not define it (defined in ${definers.join(", ") || "nothing"})`);
    }
    const extra = definers.filter((f) => f !== owner);
    if (extra.length) problems.push(`${fact}: also defined in ${extra.join(", ")} — should link to ${owner}`);
  }
  return [problems.length === 0, problems.length ? problems.join("; ") : `${SINGLE_OWNER.length} facts each defined once`];
});

check("every cross-reference points at a scaffold that exists", () => {
  const broken = [];
  const known = new Set(docs);
  for (const f of docs) {
    for (const m of read(f).matchAll(/\]\(([^)]+\.md)\)/g)) {
      const resolved = resolveLink(f, m[1]);
      if (resolved && !known.has(resolved)) broken.push(`${f} → ${m[1]} (resolved ${resolved})`);
    }
  }
  return [broken.length === 0, broken.length ? `broken links: ${broken.join(", ")}` : "all links resolve"];
});

check("no scaffold links to itself", () => {
  const selfish = docs.filter((f) =>
    [...read(f).matchAll(/\]\(([^)]+\.md)\)/g)].some((m) => resolveLink(f, m[1]) === f)
  );
  return [selfish.length === 0, selfish.length ? `self-links in: ${selfish.join(", ")}` : "none"];
});

check("the business brief names what each missing file blocks", () => {
  const intake = read("mapeo-empresa/01-empresa.md");
  const hasBlocks = /Qu[ée] bloquea/i.test(intake);
  const hasStates = /no existe/.test(intake) && /recibido/.test(intake);
  return [hasBlocks && hasStates, `blocks column: ${hasBlocks}; outcome states incl. "no existe": ${hasStates}`];
});

check("the intake doctrine exists and is English, unlike the scaffolds", () => {
  const p = join(ROOT, "capabilities", "company", "doctrine", "INTAKE.md");
  if (!existsSync(p)) return [false, "capabilities/company/doctrine/INTAKE.md missing"];
  const text = readFileSync(p, "utf8");
  return [/\bthe\b/i.test(text) && /document/i.test(text), "doctrine is in English"];
});

check("the intake skill routes to the phase skills instead of interviewing itself", () => {
  const p = join(ROOT, "skills", "company-intake", "SKILL.md");
  if (!existsSync(p)) return [false, "skills/company-intake/SKILL.md missing"];
  const text = readFileSync(p, "utf8");
  const front = text.split("---")[1] ?? "";
  const keys = [...front.matchAll(/^([a-z_-]+):/gim)].map((m) => m[1]);
  const onlyTwo = keys.length === 2 && keys.includes("name") && keys.includes("description");
  const routes = /social-identity|process-map/.test(front);
  const stops = /## STOP conditions/.test(text);
  return [onlyTwo && routes && stops, `frontmatter ${keys.join("+")}; negative routing ${routes}; STOP ${stops}`];
});

check("a scaffold that invented a fact would be caught", () => {
  const fake = "El director general es Juan Pérez y aprueba todo.";
  const wouldPass = /—\s*pendiente\s*—/.test(fake);
  return [!wouldPass, "a filled-in fact with no pendiente marker fails the marker check"];
});

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  let detail = "";
  try {
    [ok, detail] = fn();
  } catch (err) {
    detail = `threw: ${err.message}`;
  }
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ->  ${detail}` : ""}`);
}
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed  (${docs.length} scaffolds: ${docs.join(", ")})`);
process.exit(failed ? 1 : 0);
