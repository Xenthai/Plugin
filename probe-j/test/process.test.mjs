import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DOCTRINE = join(ROOT, "capabilities", "process", "doctrine", "PROCESS.md");
const SCAFFOLD = join(ROOT, "scaffold", "company", "PROCESSES.md");

/**
 * English function words that cannot occur inside a Spanish sentence. A company scaffold is read by
 * a Mexican director, so English prose in one is a defect. Word-boundary anchored so a code
 * identifier or a proper noun does not trip it.
 */
const ENGLISH = /\b(the|this|these|should|must|instead|owner of|when the)\b/i;

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

const doctrine = existsSync(DOCTRINE) ? readFileSync(DOCTRINE, "utf8") : "";
const scaffold = existsSync(SCAFFOLD) ? readFileSync(SCAFFOLD, "utf8") : "";

check("the process doctrine exists", () => [
  doctrine.length > 4096,
  doctrine.length ? `${doctrine.length} bytes` : "capabilities/process/doctrine/PROCESS.md missing",
]);

check("the doctrine cites its source for the elicitation limit", () => [
  /Wanner/.test(doctrine),
  /Wanner/.test(doctrine) ? "Wanner cited" : "no citation for the interview-length limit",
]);

check("error cost and regulatory constraint are labelled judgement, not research", () => {
  const at = doctrine.search(/Expert-judgement criteria/i);
  if (at < 0) return [false, "no expert-judgement section"];
  const section = doctrine.slice(at, at + 2000);
  const namesBoth = /error cost/i.test(section) && /regulator/i.test(section);
  const labels = /judgement/i.test(section) && /research/i.test(section);
  return [namesBoth && labels, `names both: ${namesBoth}; contrasts with research: ${labels}`];
});

check("the doctrine says breadth before depth, which is what sizes the session", () => [
  /breadth before depth/i.test(doctrine),
  /breadth before depth/i.test(doctrine) ? "stated" : "the session-sizing rule is missing",
]);

check("the process scaffold is es-MX prose", () => {
  const prose = scaffold
    .split(/\r?\n/)
    .filter((l) => !l.trim().startsWith("```") && !/^\s*[-|>]/.test(l))
    .join(" ");
  const hit = ENGLISH.exec(prose);
  return [!hit, hit ? `English word "${hit[0]}" in prose` : "Spanish only"];
});

check("the process scaffold marks uncaptured fields rather than inventing them", () => [
  /—\s*pendiente\s*—/.test(scaffold),
  /—\s*pendiente\s*—/.test(scaffold) ? "pendiente marker present" : "no pendiente marker",
]);

check("the process scaffold declares a schema version, so it can be migrated later", () => [
  /\*\*Esquema:\*\*\s*\d/.test(scaffold),
  /\*\*Esquema:\*\*\s*(\d)/.exec(scaffold)?.[1] ?? "no schema line",
]);

check("the scaffold records exceptions, which is where the automation actually breaks", () => [
  /excepci[óo]n/i.test(scaffold),
  /excepci[óo]n/i.test(scaffold) ? "exceptions captured" : "no exception field — the automation will be scoped to the happy path",
]);

check("the two process skills split breadth from depth instead of overlapping", () => {
  const map = readFileSync(join(ROOT, "skills", "process-map", "SKILL.md"), "utf8");
  const access = readFileSync(join(ROOT, "skills", "process-access", "SKILL.md"), "utf8");
  const mapRefusesScoring = /process-access/.test(map);
  const accessRefusesMapping = /process-map/.test(access);
  return [
    mapRefusesScoring && accessRefusesMapping,
    `process-map points forward: ${mapRefusesScoring}; process-access points back: ${accessRefusesMapping}`,
  ];
});

check("a scaffold with English prose would fail", () => {
  const fake = "Este documento describe the process de cotización.";
  return [ENGLISH.test(fake), 'a fixture containing " the " was refused'];
});

check("a scaffold with no pendiente marker would fail", () => {
  const fake = "| Cotización | Ventas | 2 días | Ninguna |";
  return [!/—\s*pendiente\s*—/.test(fake), "a fully-invented row was refused"];
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
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
