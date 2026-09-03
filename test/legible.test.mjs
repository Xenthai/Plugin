import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { FLOOR, TARGET, measure, prose, sentences, syllables } from "../bin/legible.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SANDBOX = join(HERE, "sandbox", "legible");

const setup = () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  mkdirSync(SANDBOX, { recursive: true });
};

const write = (name, body) => {
  const p = join(SANDBOX, name);
  writeFileSync(p, body, "utf8");
  return p;
};

const run = (args) =>
  spawnSync(process.execPath, [join(ROOT, "bin", "legible.mjs"), ...args], {
    encoding: "utf8",
    cwd: ROOT,
  });

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

/**
 * Spanish syllable division is rule-governed, so these are right answers rather than close ones —
 * which is the justification for counting them in code instead of describing the rules in a skill.
 * The pairs that matter are the ones a naive vowel-group counter gets wrong: an accented weak vowel
 * breaks a diphthong (`día`) where the unaccented spelling does not (`dia`, as in `diario`), two
 * strong vowels never join (`caos`, `aéreo`), and `u` is silent in `que`/`guerra` but not in `pingüino`.
 */
check("syllables follow the diphthong and hiatus rules, not vowel groups", () => {
  const table = [
    ["casa", 2], ["perro", 2], ["cielo", 2], ["dia", 1], ["día", 2], ["río", 2],
    ["caos", 2], ["aéreo", 4], ["causa", 2], ["cuida", 2], ["buey", 1],
    ["que", 1], ["guerra", 2], ["pingüino", 3], ["cooperación", 5],
    ["automatización", 6], ["responsabilidad", 6], ["a", 1],
  ];
  const bad = table.filter(([w, n]) => syllables(w) !== n).map(([w, n]) => `${w}=${syllables(w)}≠${n}`);
  return [bad.length === 0, bad.length ? bad.join(" ") : `${table.length} words divide correctly`];
});

/**
 * The formula is transcribed inconsistently in secondary sources, and one common rendering
 * distributes the coefficient over the second term. This is the arithmetic that settles it: real
 * Spanish prose runs about two syllables per word and fifteen to twenty words per sentence, and the
 * scale it is reported on runs 0 to 100. The correct grouping lands inside that; the distributed one
 * lands past a thousand.
 */
check("the index lands on the published scale for ordinary Spanish prose", () => {
  const text = Array.from(
    { length: 40 },
    (_, i) =>
      `La persona que opera el proceso revisa cada solicitud y confirma que los datos estén completos antes de continuar con el paso ${i}.`
  ).join(" ");
  const m = measure(text);
  const inBand = m.score > 40 && m.score < 90;
  const spanishShape = m.syllables_per_word > 1.8 && m.syllables_per_word < 2.4;
  return [inBand && spanishShape, `score ${m.score.toFixed(1)}, ${m.syllables_per_word.toFixed(2)} syl/word`];
});

/**
 * A sentence-based formula applied to a table of one-word cells reports a document as far easier
 * than its prose reads, and every scaffold in this plugin is mostly table. Stripping structure is
 * what makes the score mean anything.
 */
check("tables, fences, headings and frontmatter are excluded from the measured prose", () => {
  const src = [
    "---", "name: x", "description: y", "---",
    "# Encabezado que no es una frase",
    "",
    "Esta es la prosa que sí se mide.",
    "",
    "| Campo | Valor |", "| --- | --- |", "| uno | dos |",
    "",
    "```bash", "node bin/algo.mjs --flag", "```",
  ].join("\n");
  const p = prose(src);
  return [
    p.includes("prosa que sí se mide") &&
      !p.includes("Encabezado") &&
      !p.includes("Campo") &&
      !p.includes("node bin"),
    JSON.stringify(p.trim().slice(0, 60)),
  ];
});

/**
 * An abbreviation inflates the count, and an inflated count raises the score, so it is guarded. A
 * sentence ending in a number is the case that must NOT be guarded: an earlier version skipped it
 * and turned every `Revise el paso 3.` into a non-sentence, which is the shape most operator
 * instructions take. Both directions are asserted because the bug was introduced by fixing one.
 */
check("abbreviations do not inflate the count, and a sentence ending in a number still counts", () => {
  const a = sentences("El Sr. Ramírez revisa el pago. Luego lo aprueba.");
  const b = sentences("El monto es de 1.5 millones de pesos. Se paga en marzo.");
  const c = sentences("Revise el paso 3. Marque la casilla 4. Avise al jefe.");
  return [a === 2 && b === 2 && c === 3, `abbrev=${a}, decimal=${b}, numbered=${c}`];
});

check("a document of long sentences falls below the floor and exits 1", () => {
  const long = Array.from(
    { length: 12 },
    () =>
      "En el supuesto de que la contraparte manifieste su inconformidad respecto de la determinación " +
      "adoptada por el área correspondiente, resultará indispensable documentar exhaustivamente la " +
      "totalidad de las circunstancias concurrentes, así como las consideraciones jurídicas y " +
      "administrativas que fundamentaron dicha determinación, con independencia de que la " +
      "inconformidad resulte procedente o improcedente conforme a la normatividad aplicable."
  ).join(" ");
  const p = write("dificil.md", long);
  const r = run([p]);
  return [r.status === 1 && /BELOW FLOOR/.test(r.stdout), `exit ${r.status}: ${r.stdout.slice(0, 70)}`];
});

check("a document of short sentences clears the target and exits 0", () => {
  const short = Array.from(
    { length: 30 },
    (_, i) => `Revise el paso ${i}. Marque la casilla. Avise al jefe de turno si algo falla.`
  ).join(" ");
  const p = write("facil.md", short);
  const r = run([p]);
  return [r.status === 0 && /OK/.test(r.stdout), `exit ${r.status}: ${r.stdout.slice(0, 70)}`];
});

/**
 * The scale was validated on fragments of at least 500 words; over a handful of sentences the
 * words-per-sentence term moves several points per sentence. Refusing is the only honest answer,
 * because a number printed here would be acted on.
 */
check("too little prose is refused with exit 2 rather than scored", () => {
  const p = write("corto.md", "Dos frases. Nada más.");
  const r = run([p]);
  return [r.status === 2 && /noise below/.test(r.stderr), `exit ${r.status}: ${r.stderr.slice(0, 70)}`];
});

check("--json carries the floor, the target and every term of the formula", () => {
  const short = Array.from({ length: 30 }, (_, i) => `Revise el paso ${i}. Marque la casilla ahora.`).join(" ");
  const p = write("json.md", short);
  const r = run([p, "--json"]);
  let d = null;
  try {
    d = JSON.parse(r.stdout);
  } catch {}
  const row = d?.results?.[0];
  return [
    d?.floor === FLOOR &&
      d?.target === TARGET &&
      typeof row?.syllables_per_word === "number" &&
      typeof row?.words_per_sentence === "number" &&
      typeof row?.prose_share === "number",
    JSON.stringify({ floor: d?.floor, target: d?.target, keys: row && Object.keys(row).length }),
  ];
});

check("--help exits 0 and names the real test rather than only the score", () => {
  const r = run(["--help"]);
  return [r.status === 0 && /screen, not the test/.test(r.stdout), `exit ${r.status}`];
});

/**
 * Every document the client receives is held to the floor, not only the handover one. A practice
 * that ships a readability floor and then ships documents under it has written advice nobody
 * follows, starting with itself.
 *
 * The gate is the floor rather than the target on purpose. Most of these are read by a director at
 * a desk, where the scale's own *normal* band is the right place to sit; the target binds on the
 * failure-recovery section of a handover, which HANDOVER.md §5b explains. What this catches is
 * drift: several of these sit within two points of the floor, so one long sentence added later
 * would push a client-facing document under it silently.
 */
check("every scaffold the client receives stays at or above the floor", () => {
  const files = readdirSync(join(ROOT, "scaffold", "company"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(ROOT, "scaffold", "company", f));
  const r = run([...files, "--json"]);
  let d = null;
  try {
    d = JSON.parse(r.stdout);
  } catch {}
  const under = (d?.results ?? []).filter((x) => !x.passes).map((x) => `${basename(x.file)} ${x.score.toFixed(1)}`);
  const tight = (d?.results ?? [])
    .filter((x) => x.passes && x.score < FLOOR + 3)
    .map((x) => `${basename(x.file)} ${x.score.toFixed(1)}`);
  return [
    r.status === 0 && under.length === 0 && (d?.results?.length ?? 0) === files.length,
    under.length
      ? `below the floor: ${under.join(", ")}`
      : `${files.length} scaffolds at or above ${FLOOR}${tight.length ? `; within 3 points: ${tight.join(", ")}` : ""}`,
  ];
});

setup();
let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  let note = "";
  try {
    [ok, note] = fn();
  } catch (err) {
    note = `threw: ${err.message}`;
  }
  if (!ok) failed++;
  process.stdout.write(`${ok ? "PASS" : "FAIL"}  ${name}  ->  ${note}\n`);
}
process.stdout.write(`\n${cases.length - failed}/${cases.length} passed\n`);
process.exit(failed ? 1 : 0);
