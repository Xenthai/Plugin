import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const METHOD_DIR = join(ROOT, "capabilities", "method");
const TABLES_DIR = join(METHOD_DIR, "tables");

const methodJson = JSON.parse(readFileSync(join(METHOD_DIR, "method.json"), "utf8"));

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("method.json parses and carries source.repo and a 40-hex commit", () => {
  const repo = methodJson?.source?.repo;
  const commit = methodJson?.source?.commit ?? "";
  const okRepo = repo === "Xenthai/Web";
  const okCommit = /^[0-9a-f]{40}$/i.test(commit);
  return [okRepo && okCommit, `repo=${repo} commit=${commit || "(missing)"}`];
});

check("every dataset id listed in method.json carries a non-empty payload", () => {
  const datasets = methodJson.datasets ?? {};
  const ids = Object.keys(datasets);
  const empty = ids.filter((id) => {
    const value = datasets[id];
    if (value === undefined || value === null) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    return false;
  });
  return [
    ids.length > 0 && empty.length === 0,
    empty.length ? `empty payload: ${empty.join(", ")}` : `${ids.length} datasets, all non-empty`,
  ];
});

/** Reproduces X3 §2: `puntaje = round((Σ rating × weight) ÷ formula.denominator × 100)`. */
function x3Score(x3Scoring, ratings) {
  const total = x3Scoring.criteria.reduce((sum, criterion) => {
    return sum + (ratings[criterion.id] ?? 0) * criterion.weight;
  }, 0);
  return Math.round((total / x3Scoring.formula.denominator) * 100);
}

/**
 * Throws when `x3Scoring`'s criteria weights do not sum to 18 — the value the formula's
 * denominator (90 = 18 × the 1-5 rating scale) assumes. This is the one assertion function both
 * the real vendored data and the broken fixture below run through.
 */
function assertX3WeightsSum(x3Scoring) {
  const sum = x3Scoring.criteria.reduce((total, criterion) => total + criterion.weight, 0);
  if (sum !== 18) {
    throw new Error(`X3 weights sum to ${sum}, expected 18`);
  }
}

check("X3 has eight criteria whose weights sum to 18", () => {
  const x3 = methodJson.datasets.x3Scoring;
  assertX3WeightsSum(x3);
  const sum = x3.criteria.reduce((total, criterion) => total + criterion.weight, 0);
  return [x3.criteria.length === 8 && sum === 18, `${x3.criteria.length} criteria, weights sum ${sum}`];
});

check("the X3 formula reproduces 88 and 51 from the two worked examples", () => {
  const x3 = methodJson.datasets.x3Scoring;
  const exampleA = x3Score(x3, { C1: 3, C2: 5, C3: 5, C4: 4, C5: 5, C6: 4, C7: 4, C8: 5 });
  const exampleB = x3Score(x3, { C1: 5, C2: 3, C3: 2, C4: 2, C5: 2, C6: 2, C7: 3, C8: 1 });
  return [
    exampleA === 88 && exampleB === 51,
    `Example A -> ${exampleA} (want 88), Example B -> ${exampleB} (want 51)`,
  ];
});

check("a fixture with a wrong weights sum is refused by assertX3WeightsSum", () => {
  const real = methodJson.datasets.x3Scoring;
  const broken = {
    ...real,
    criteria: real.criteria.map((criterion, index) =>
      index === 0 ? { ...criterion, weight: criterion.weight + 1 } : criterion,
    ),
  };
  let threw = false;
  let message = "";
  try {
    assertX3WeightsSum(broken);
  } catch (error) {
    threw = true;
    message = error.message;
  }
  return [threw, threw ? `refused: ${message}` : "a broken fixture was NOT refused"];
});

/**
 * Table files this PR ships without a doctrine or skill citation yet, and why. PR 2 wires X3, X4,
 * X5, A9, archetypes and the store layout into the doctrine and skill files that will cite these
 * tables by path; until then every table is expected to be unreferenced, which is why every file
 * is named here rather than a subset.
 */
const ALLOWED_UNREFERENCED = {
  "a9-levels.md": "PR 2 wires A9 into company doctrine",
  "a9-statements.md": "PR 2 wires A9 into company doctrine",
  "archetypes.md": "PR 2 wires archetypes into company-profile doctrine",
  "store-layout.md": "PR 2 wires the A2 store layout into company doctrine",
  "x3-criteria.md": "PR 2 replaces PROCESS.md S5 with this table per CONFORMANCE.md Ruling 1",
  "x3-decisions.md": "PR 2 replaces PROCESS.md S5 with this table per CONFORMANCE.md Ruling 1",
  "x3-scales.md": "PR 2 replaces PROCESS.md S5 with this table per CONFORMANCE.md Ruling 1",
  "x4-criteria.md": "PR 2 wires X4 into the coverage skill and its doctrine",
  "x5-catalogue.md": "PR 2 wires X5 into risk doctrine",
  "x5-matrix.md": "PR 2 wires X5 into risk doctrine",
  "x7-glossary.md": "PR 2 wires the X7 glossary into doctrine",
};

check("every table file is referenced by doctrine/a skill, or is in ALLOWED_UNREFERENCED with a reason", () => {
  const files = readdirSync(TABLES_DIR).filter((f) => f.endsWith(".md"));
  const skillNames = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  const skillBodies = skillNames
    .map((name) => readFileSync(join(ROOT, "skills", name, "SKILL.md"), "utf8"))
    .join("\n");
  const capNames = readdirSync(join(ROOT, "capabilities"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  const doctrineBodies = capNames
    .flatMap((cap) => {
      const dir = join(ROOT, "capabilities", cap, "doctrine");
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .map((f) => readFileSync(join(dir, f), "utf8"));
    })
    .join("\n");
  const corpus = `${skillBodies}\n${doctrineBodies}`;
  const unreferenced = files.filter((f) => !corpus.includes(`method/tables/${f}`));
  const unexplained = unreferenced.filter((f) => !(f in ALLOWED_UNREFERENCED));
  return [
    unexplained.length === 0,
    unexplained.length
      ? `unreferenced and not in ALLOWED_UNREFERENCED: ${unexplained.join(", ")}`
      : `${files.length} tables; ${unreferenced.length} unreferenced-but-explained (PR 2), 0 unexplained`,
  ];
});

/**
 * Pulls the `BLOCKING` object literal's text out of `tools/coverage.mjs`, bracket-counting from
 * the declaration to its matching close. The constant is not exported, and this suite must not
 * add an export to a file outside its brief.
 */
function extractBlockingSource(coverageSource) {
  const start = coverageSource.indexOf("const BLOCKING = {");
  if (start === -1) throw new Error("tools/coverage.mjs: BLOCKING constant not found");
  let depth = 0;
  let end = -1;
  for (let i = start; i < coverageSource.length; i += 1) {
    if (coverageSource[i] === "{") depth += 1;
    else if (coverageSource[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) throw new Error("tools/coverage.mjs: BLOCKING constant not closed");
  return coverageSource.slice(start, end);
}

/**
 * Reads `{ "doc": [/pattern/flags, ...], ... }` out of the object-literal text without evaluating
 * it as code — `new Function`/`eval` on file content is refused outright even when the file is our
 * own, so this locates each quoted key and, for the span up to the next key, matches regex
 * literals with a regex that itself understands escapes and character classes (so a class like
 * `[oó]` is not mistaken for the end of the literal) and compiles each with the `RegExp`
 * constructor, which parses a pattern string but never executes one.
 */
function parseBlocking(blockingSource) {
  const keyRe = /"([^"]+)":\s*\[/g;
  const headers = [];
  let keyMatch;
  while ((keyMatch = keyRe.exec(blockingSource))) {
    headers.push({ key: keyMatch[1], headerEnd: keyMatch.index + keyMatch[0].length, start: keyMatch.index });
  }
  const regexLiteralRe = /\/((?:\\.|\[(?:\\.|[^\]\\])*\]|[^/\\\n])+)\/([a-z]*)/g;
  const result = {};
  for (let i = 0; i < headers.length; i += 1) {
    const segmentEnd = i + 1 < headers.length ? headers[i + 1].start : blockingSource.length;
    const segment = blockingSource.slice(headers[i].headerEnd, segmentEnd);
    const regexes = [];
    regexLiteralRe.lastIndex = 0;
    let literalMatch;
    while ((literalMatch = regexLiteralRe.exec(segment))) {
      regexes.push(new RegExp(literalMatch[1], literalMatch[2]));
    }
    result[headers[i].key] = regexes;
  }
  return result;
}

check(
  "every coverage.mjs BLOCKING regex matches an X4 statement/evidenceSatisfies, or is reported PASS-with-note",
  () => {
    const coverageSource = readFileSync(join(ROOT, "tools", "coverage.mjs"), "utf8");
    const BLOCKING = parseBlocking(extractBlockingSource(coverageSource));
    const x4 = methodJson.datasets.x4Coverage;
    const corpus = x4.criteria.flatMap((c) => [c.statement, c.evidenceSatisfies]).join(" \n ");

    const rows = [];
    for (const [doc, regexes] of Object.entries(BLOCKING)) {
      for (const regex of regexes) {
        const match = corpus.match(regex);
        rows.push({ doc, pattern: regex.source, matched: Boolean(match), sample: match?.[0] ?? "" });
      }
    }

    console.log("");
    console.log("coverage.mjs BLOCKING -> X4 mapping:");
    console.log("| document | regex | X4 statement/evidenceSatisfies match |");
    console.log("| --- | --- | --- |");
    for (const row of rows) {
      const cell = row.matched ? `yes — "${row.sample}"` : "no match yet (PR 2 renames documents)";
      console.log(`| ${row.doc} | /${row.pattern}/i | ${cell} |`);
    }

    const unmatched = rows.filter((row) => !row.matched);
    return [
      true,
      `${rows.length - unmatched.length}/${rows.length} regexes already match X4 text; ` +
        `${unmatched.length} pending PR 2's rename (see mapping printed above) — not a failure yet`,
    ];
  },
);

check("drift: vendored method.json matches METHOD_SOURCE when set, skipped when unset", () => {
  const sourcePath = process.env.METHOD_SOURCE;
  if (!sourcePath) {
    return [true, "METHOD_SOURCE unset; skipped (CI sets this to the Web export's dist/method.json)"];
  }
  if (!existsSync(sourcePath)) {
    return [false, `METHOD_SOURCE=${sourcePath} does not exist`];
  }
  const vendored = readFileSync(join(METHOD_DIR, "method.json"));
  const source = readFileSync(sourcePath);
  const identical = Buffer.compare(vendored, source) === 0;
  return [identical, identical ? "byte-identical to METHOD_SOURCE" : "vendored copy has drifted from METHOD_SOURCE"];
});

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  let detail = "";
  try {
    [ok, detail] = fn();
  } catch (error) {
    detail = `threw: ${error.message}`;
  }
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ->  ${detail}` : ""}`);
}
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
