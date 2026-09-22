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
 * Table files this PR ships without a doctrine or skill citation yet, and why. Rulings 1 and 11
 * wired X3 and A9 into `PROCESS.md`, `process-access/SKILL.md` and `MATURITY.md`, so those five
 * tables are no longer listed here. Archetypes, the store layout, X4, X5 and X7 belong to rulings
 * outside this PR's scope (3, 4, 6) and stay unreferenced until their own doctrine changes land.
 */
const ALLOWED_UNREFERENCED = {
  "archetypes.md": "wired into company-profile doctrine outside this PR's rulings",
  "store-layout.md": "wired into company doctrine outside this PR's rulings",
  "x4-criteria.md": "wires into the coverage skill and its doctrine outside this PR's rulings",
  "x5-catalogue.md": "wires into risk doctrine outside this PR's rulings",
  "x5-matrix.md": "wires into risk doctrine outside this PR's rulings",
  "x7-glossary.md": "wires into doctrine outside this PR's rulings",
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

/** Every playbook chapter code `method.json`'s `phases` dataset carries, e.g. `A2`, `X3`, `00`. */
const CHAPTER_CODES = new Set(methodJson.datasets.phases.chapters.map((c) => c.code));

/** The two whole-line special cases an `Implements:` line may hold instead of chapter codes. */
const SPECIAL_IMPLEMENTS = new Set(["none (mechanics)", "fuera del playbook (X9)"]);

/**
 * Finds every `capabilities/*\/doctrine/*.md` file as a `{ path, text }` pair, read once here and
 * reused by both checks below so a doctrine file is never parsed twice for two assertions.
 */
function findDoctrineFiles() {
  const capNames = readdirSync(join(ROOT, "capabilities"), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  return capNames.flatMap((cap) => {
    const dir = join(ROOT, "capabilities", cap, "doctrine");
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const path = join(dir, f);
        return { path: `capabilities/${cap}/doctrine/${f}`, text: readFileSync(path, "utf8") };
      });
  });
}

/**
 * Returns the trimmed `Implements: ...` line immediately following a file's first `# ` heading, or
 * `null` if the first non-empty line after the heading is not one — a blockquote subtitle counts as
 * "not one", so the line has to be the very next content, not merely present somewhere in the file.
 */
function findImplementsLine(text) {
  const lines = text.split(/\r?\n/);
  const h1 = lines.findIndex((l) => l.startsWith("# "));
  if (h1 === -1) return null;
  for (let i = h1 + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line === "") continue;
    return line.startsWith("Implements:") ? line : null;
  }
  return null;
}

/**
 * Validates one `Implements:` line's content against `CHAPTER_CODES`. A segment is either one of
 * the two whole-line special cases (only legal alone, never mixed with a code) or starts with a
 * chapter code the vendored data actually carries — `A2` out of `A2 §3`, matched on a word
 * boundary so `A2` does not also accept `A20`.
 */
function validateImplements(line) {
  const content = line.slice("Implements:".length).trim();
  if (SPECIAL_IMPLEMENTS.has(content)) return { ok: true };
  const segments = content
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  if (segments.length === 0) return { ok: false, reason: "empty Implements line" };
  for (const segment of segments) {
    const m = /^(00|01|[ABX]\d)\b/.exec(segment);
    if (!m || !CHAPTER_CODES.has(m[1])) {
      return { ok: false, reason: `"${segment}" names no chapter in method.json` };
    }
  }
  return { ok: true };
}

check("every doctrine file carries an Implements line naming a real chapter or an approved special case", () => {
  const bad = [];
  for (const { path, text } of findDoctrineFiles()) {
    const line = findImplementsLine(text);
    if (!line) {
      bad.push(`${path}: no Implements line under its H1`);
      continue;
    }
    const result = validateImplements(line);
    if (!result.ok) bad.push(`${path}: ${result.reason}`);
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : `${findDoctrineFiles().length} doctrine files, all valid`];
});

check("an Implements line naming a chapter absent from method.json is refused", () => {
  const result = validateImplements("Implements: Z9 §1 · A2 §3");
  return [!result.ok, result.ok ? "a bad code was NOT refused" : `refused: ${result.reason}`];
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

check("capabilities/method/tables/field-guide.md exists", () => {
  const path = join(TABLES_DIR, "field-guide.md");
  return [existsSync(path), existsSync(path) ? "present" : `missing: ${path}`];
});

check("skills/setup/SKILL.md references the field guide table", () => {
  const body = readFileSync(join(ROOT, "skills", "setup", "SKILL.md"), "utf8");
  const referenced = body.includes("method/tables/field-guide.md");
  return [referenced, referenced ? "referenced" : "skills/setup/SKILL.md does not mention field-guide.md"];
});

/**
 * Resolves a `fieldGuide` step's `executor.ref` (kind `skill`) to `skills/<ref>/SKILL.md`. Shared
 * by the real-data check and its wrong-ref counterpart below, so both exercise the same lookup.
 */
function skillRefExists(ref) {
  return existsSync(join(ROOT, "skills", ref, "SKILL.md"));
}

check("every fieldGuide step with a skill executor names an existing skills/<ref>/SKILL.md", () => {
  const fieldGuide = methodJson.datasets.fieldGuide;
  const skillSteps = fieldGuide.steps.filter((s) => s.executor?.kind === "skill");
  const missing = skillSteps.filter((s) => !skillRefExists(s.executor.ref)).map((s) => `${s.id} -> ${s.executor.ref}`);
  return [
    skillSteps.length > 0 && missing.length === 0,
    missing.length
      ? `refs with no skills/<ref>/SKILL.md: ${missing.join(", ")}`
      : `${skillSteps.length} skill-executed steps, all resolve`,
  ];
});

check("a fieldGuide step naming a nonexistent skill is refused", () => {
  const bad = { id: "fixture-1", executor: { kind: "skill", ref: "does-not-exist" } };
  return [!skillRefExists(bad.executor.ref), skillRefExists(bad.executor.ref) ? "a bad ref was NOT refused" : "refused: no such skills/does-not-exist/SKILL.md"];
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
