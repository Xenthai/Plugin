import { readdirSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SCAFFOLD_TOOL = join(ROOT, "tools", "scaffold.mjs");
const SANDBOX = join(HERE, "sandbox", "status");
const TOOL = join(ROOT, "tools", "status.mjs");

const scaffoldRun = (...args) => spawnSync(process.execPath, [SCAFFOLD_TOOL, ...args], { encoding: "utf8" });
const docs = scaffoldRun("--list").stdout.trim().split("\n");

const skills = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const run = (...args) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
};

/**
 * A family template's own bare name is a placeholder, not a document — `scaffold.mjs` refuses to
 * write it verbatim, exactly as it would refuse a real session doing the same thing. A fixture asks
 * for a concrete instance instead; `tools/status.mjs` still reports it under the template's own
 * path, since that is what its directory-and-pattern check looks for.
 */
const FAMILY_INSTANCE = {
  "mapeo-empresa/03-procesos/PXX-nombre.md": "mapeo-empresa/03-procesos/P01-ejemplo.md",
  "mapeo-empresa/06-specs/AXX-nombre.md": "mapeo-empresa/06-specs/A01-ejemplo.md",
};

/**
 * A company directory holding a manifest and the named documents, materialised through
 * `tools/scaffold.mjs` exactly as a real session would — so a fixture lands at
 * `mapeo-Prueba <case>/...` and never at the bare `mapeo-empresa/...` template path.
 */
const company = (name, docNames) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({ schema_version: 1, id: `${name}-1`, name: `Prueba ${name}`, store: { kind: "drive", root: "1AAA" } })
  );
  for (const doc of docNames) {
    const target = FAMILY_INSTANCE[doc] ?? doc;
    const r = scaffoldRun("--document", target, "--company", dir);
    if (r.status !== 0) throw new Error(`fixture setup failed for ${doc}: ${r.stderr}`);
  }
  return dir;
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

/**
 * The half of the language rule that had no enforcement. `doctor` gates the manifest's locale, and
 * the store ships in es-MX — but a skill fills them during a session, and nothing checked the
 * written result. A document carrying Spanish headings and English content looks finished, is read
 * by the company's own people, and is a delivery defect.
 *
 * Both directions are asserted, and so is the abstention: a document still mostly `— pendiente —`
 * has almost no prose, and a density measured over thirty words would flag every fresh scaffold.
 */
check("a document filled in the wrong language is reported and exits non-zero", () => {
  const dir = company("idioma", ["comunicacion/BRAND.md", "comunicacion/VOICE.md"]);
  const english = [
    "# VOICE",
    "",
    "This document describes how the company writes and what it never says. The voice is direct and",
    "plain, it avoids superlatives, and it never claims anything without a verification row behind it.",
    "Every rule below is written as a word-level instruction rather than as an adjective, because an",
    "adjective is not something a writer who is not the brand owner can apply consistently across a",
    "month of posts and a dozen pieces of copy written by different people on different days.",
    "",
    "The list that follows names the words this company uses and the words it refuses, together with",
    "a short reason for each one, so that a new writer can settle an argument about wording without",
    "asking anyone. Where a rule depends on the platform, the platform is named. Where a rule exists",
    "because a regulator would object to the alternative, the regulator is named as well, since a",
    "rule whose reason nobody remembers is a rule somebody will quietly drop within a few months.",
  ].join("\n");
  writeFileSync(join(dir, "comunicacion", "VOICE.md"), english, "utf8");
  const r = run("--company", dir);
  const spanishOk = /BRAND\.md[^\n]*es-MX/.test(r.out);
  return [
    r.code === 1 && /VOICE\.md[^\n]*NO ES es-MX/.test(r.out) && /IDIOMA EQUIVOCADO/.test(r.out) && spanishOk,
    `exit ${r.code}; ${(r.out.match(/VOICE\.md[^\n]*/) ?? [])[0]}`,
  ];
});

/**
 * The store layout cannot name a report or a plan, because those live in dated subfolders — so the
 * most client-visible artefacts an engagement produces were the ones nothing audited. A report goes
 * to a director and a plan goes to review.
 *
 * The exclusions matter as much: `journal/` carries English event names by design and is
 * machine-read, `digest/` is written for the practice, and `feedback/` is about the plugin and must
 * stay English so one client's experience improves every other install. Reporting any of the three
 * as a defect would be reporting a correct design as broken, which is how a check gets ignored.
 */
check("generated deliverables are audited, and the journal, digest and feedback are not", () => {
  const dir = company("generados", ["comunicacion/BRAND.md"]);
  const write = (rel, body) => {
    mkdirSync(join(dir, dirname(rel)), { recursive: true });
    writeFileSync(join(dir, rel), body, "utf8");
  };
  const es =
    "Este documento describe lo que se acordó con la empresa para el mes, en qué plataforma se dice " +
    "cada cosa y en qué orden, con la fecha de cada pieza y el nombre de quien la aprueba antes de " +
    "que se produzca cualquier cosa a partir de ella.";
  const en =
    "This document describes what was agreed with the company for the month, on which platform each " +
    "thing gets said and in what order, with the date of every piece and the name of whoever has to " +
    "approve it before anything is produced from it at all.";
  write("reports/2026-09/report.md", `# Reporte\n\n${es}\n`);
  write("content/2026-09/plan.md", `# Plan\n\n${en}\n`);
  write("journal/execution/2026-09.jsonl", '{"event":"ai_action","actor":"ai","result":"ok"}\n');
  write("digest/estado.md", `# Digest\n\n${es}\n`);
  write("feedback/2026-09-03-acme.md", `# Feedback\n\n${en}\n`);

  const r = run("--company", dir, "--json");
  let j = null;
  try {
    j = JSON.parse(r.out);
  } catch {}
  const seen = (j?.produced ?? []).map((p) => p.document);
  const wrong = j?.wrongLanguage ?? [];
  return [
    r.code === 1 &&
      seen.includes("reports/2026-09/report.md") &&
      seen.includes("content/2026-09/plan.md") &&
      !seen.some((d) => /^(journal|digest|feedback)\//.test(d)) &&
      wrong.includes("content/2026-09/plan.md") &&
      !wrong.includes("reports/2026-09/report.md") &&
      !wrong.some((d) => /^(journal|digest|feedback)\//.test(d)),
    `audited=${JSON.stringify(seen)} wrong=${JSON.stringify(wrong)}`,
  ];
});

/**
 * The language floor is far below the readability one on purpose. Readability is a mean over
 * sentences and needs a generous sample; language is the frequency of a language's commonest words
 * and is decisive almost at once. Sharing the readability floor meant every short client-facing
 * artefact — a one-page biweekly report, a month's plan — escaped the check entirely.
 */
check("a short English deliverable is still caught, because language needs a smaller sample", () => {
  const dir = company("corto", ["comunicacion/BRAND.md"]);
  mkdirSync(join(dir, "reports", "2026-09"), { recursive: true });
  writeFileSync(
    join(dir, "reports", "2026-09", "report.md"),
    "# Report\n\nActivity recorded in the period, with the counts by actor and the review time that a " +
      "person spent inside each one, plus every figure that the evidence here cannot support at all. " +
      "Nothing below is a saving, and nothing here says what would have happened without the work, " +
      "because nobody ran the month twice and there is no second version of it to compare against.\n",
    "utf8"
  );
  const r = run("--company", dir, "--json");
  let j = null;
  try {
    j = JSON.parse(r.out);
  } catch {}
  const row = (j?.produced ?? [])[0];
  return [
    row?.language?.verdict === false && row.language.words < 100 && row.language.words >= 40,
    JSON.stringify(row?.language),
  ];
});

/**
 * A rendered PNG cannot be audited — its words are pixels — but the render is deterministic from
 * `pieces.json`, so measuring that measures the published result exactly. This is the only point at
 * which a client's published copy can still be checked.
 */
check("copy inside pieces.json is audited, and telegraphic Spanish is not called foreign", () => {
  const dir = company("piezas", ["comunicacion/BRAND.md"]);
  mkdirSync(join(dir, "content", "2026-09"), { recursive: true });
  const es = {
    q3: {
      archetype: "chart",
      eyebrow: "Trimestre 3 · re-medición",
      headline: "Cotizaciones<br>por semana",
      beforeLabel: "antes",
      afterLabel: "ahora",
      bars: [
        { label: "Cotización estándar", before: 12, after: 34, quality: "rechazo 8% → 6%" },
        { label: "Cotización especial", before: 3, after: 7, quality: "rechazo 21% → 19%" },
        { label: "Refacturación", before: 9, after: 11, quality: "retrabajo 14% → 15%" },
      ],
      basis:
        "Mediana de instancias completadas por semana. Definición congelada 2026-03-02. Medido sobre 12 semanas por Operaciones.",
    },
  };
  writeFileSync(join(dir, "content", "2026-09", "pieces.json"), JSON.stringify(es), "utf8");
  const good = run("--company", dir, "--json");
  let gj = null;
  try {
    gj = JSON.parse(good.out);
  } catch {}
  const lang = (gj?.produced ?? []).find((p) => p.document.endsWith("pieces.json"))?.language;

  const en = JSON.parse(JSON.stringify(es));
  en.q3.eyebrow = "Quarter three remeasure";
  en.q3.headline = "Quotes<br>per week";
  en.q3.beforeLabel = "before";
  en.q3.afterLabel = "now";
  en.q3.bars = [
    { label: "Standard quote", before: 12, after: 34, quality: "rejection 8% to 6%" },
    { label: "Special quote", before: 3, after: 7, quality: "rejection 21% to 19%" },
    { label: "Rebilling", before: 9, after: 11, quality: "rework 14% to 15%" },
  ];
  en.q3.basis = "Median of instances completed per week. Definition frozen on the second of March. Measured over twelve weeks by Operations.";
  writeFileSync(join(dir, "content", "2026-09", "pieces.json"), JSON.stringify(en), "utf8");
  const bad = run("--company", dir, "--json");
  let bj = null;
  try {
    bj = JSON.parse(bad.out);
  } catch {}

  return [
    lang?.verdict === true &&
      lang.per1000 < lang.floor &&
      lang.accents_per_1000 >= lang.accent_floor &&
      (bj?.wrongLanguage ?? []).some((d) => d.endsWith("pieces.json")),
    `es: ${JSON.stringify(lang)}; en flagged: ${JSON.stringify(bj?.wrongLanguage)}`,
  ];
});

check("a fresh scaffold with almost no prose abstains rather than being called wrong", () => {
  const dir = company("sinprosa", ["comunicacion/PROOF.md"]);
  writeFileSync(join(dir, "comunicacion", "PROOF.md"), "# PROOF\n\n| Afirmación | Fuente |\n| --- | --- |\n| — pendiente — | |\n", "utf8");
  const r = run("--company", dir);
  return [!/NO ES es-MX/.test(r.out) && /sin prosa/.test(r.out), (r.out.match(/PROOF\.md[^\n]*/) ?? [])[0]];
});

check("--help exits 0, because a caller reads a non-zero exit as a broken tool", () => {
  const r = run("--help");
  return [r.code === 0 && /status/i.test(r.out), `exit ${r.code}, ${r.out.length} bytes of help`];
});

check("every store document has an owning phase", () => {
  const r = run("--company", company("full", docs), "--json");
  const report = JSON.parse(r.out);
  return [
    report.unowned.length === 0,
    report.unowned.length
      ? `no phase fills: ${report.unowned.join(", ")} — a field nobody owns stays pending forever`
      : `${report.report.length} documents, all owned`,
  ];
});

check("every owning phase named is a skill that exists", () => {
  const r = run("--company", company("owners", docs), "--json");
  const report = JSON.parse(r.out);
  const named = new Set(report.report.flatMap((d) => d.owedBy ?? []));
  const ghosts = [...named].filter((n) => !n.includes(" ") && !skills.includes(n));
  return [
    ghosts.length === 0,
    ghosts.length ? `owner map names skills that do not exist: ${ghosts.join(", ")}` : `${named.size} owners, all real`,
  ];
});

check("a complete set of documents exits 0", () => {
  const r = run("--company", company("complete", docs));
  return [r.code === 0, `exit ${r.code} with ${docs.length} documents present`];
});

check("a missing document exits 1, because a missing document is a phase that never ran", () => {
  const r = run("--company", company("partial", ["comunicacion/BRAND.md"]));
  return [r.code === 1 && /AUSENTE/.test(r.out), `exit ${r.code}; reports AUSENTE: ${/AUSENTE/.test(r.out)}`];
});

check("a fresh company reports pending fields rather than zero work", () => {
  const r = run("--company", company("fresh", docs), "--json");
  const report = JSON.parse(r.out);
  return [
    report.totalPending > 100,
    `${report.totalPending} pending fields across ${report.report.length} documents`,
  ];
});

check("--pending names the field, not only the count", () => {
  const r = run("--company", company("labels", ["mapeo-empresa/01-personas.md"]), "--pending");
  const bullets = (r.out.match(/^\s+·\s+\S/gm) ?? []).length;
  return [bullets > 0, `${bullets} field labels listed`];
});

check("no company bound and no --company exits 1 with a usable message", () => {
  const r = spawnSync(process.execPath, [TOOL], { encoding: "utf8", cwd: HERE });
  const usable = /--company/.test(r.stderr);
  return [r.status === 1 && usable, `exit ${r.status}; suggests --company: ${usable}`];
});

check("the store table covers exactly the documents status reports, in both directions", () => {
  const r = run("--company", company("cover", docs), "--json");
  const report = JSON.parse(r.out);
  const covered = report.report.map((d) => d.document).sort();
  /**
   * `07-datos/README.md` is a convenience stub `scaffold.mjs` can materialise; the store table
   * carries the directory it lives in, `07-datos/`, since the SSOT document is the folder of
   * extracts, not that one placeholder file.
   */
  const onDisk = docs.map((d) => (d === "mapeo-empresa/07-datos/README.md" ? "mapeo-empresa/07-datos/" : d)).sort();
  const same = covered.join(",") === onDisk.join(",");
  return [same, same ? `${covered.length} documents match` : `report ${covered.length} vs disk ${onDisk.length}`];
});

check("a new scaffold with no owner would be reported as a plugin defect", () => {
  const dir = company("ghost", ["comunicacion/BRAND.md"]);
  const ghostPath = join(ROOT, "scaffold", "company", "comunicacion", "GHOST.md");
  writeFileSync(ghostPath, "# Ghost\n\n**Esquema:** 1\n\n— pendiente —\n");
  writeFileSync(join(dir, "comunicacion", "GHOST.md"), "# Ghost\n\n**Esquema:** 1\n\n— pendiente —\n");
  try {
    const r = run("--company", dir, "--json");
    const report = JSON.parse(r.out);
    return [
      report.unowned.includes("comunicacion/GHOST.md") && r.code === 1,
      `unowned: ${report.unowned.join(", ") || "none"} — the tool refuses a document no phase fills`,
    ];
  } finally {
    rmSync(ghostPath, { force: true });
  }
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
rmSync(SANDBOX, { recursive: true, force: true });
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed  (${docs.length} documents, ${skills.length} skills)`);
process.exit(failed ? 1 : 0);
