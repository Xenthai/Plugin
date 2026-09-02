import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DOCTRINE = join(ROOT, "capabilities", "baseline", "doctrine", "MEASUREMENT.md");
const SCAFFOLD = join(ROOT, "scaffold", "company", "BASELINE.md");
const SKILL = join(ROOT, "skills", "baseline", "SKILL.md");

/**
 * Words that assert an accreditation nobody in this practice holds. A baseline is self-reported and
 * evidenced; calling it certified or verified is the single claim most likely to be challenged, and
 * the one with a regulator attached.
 */
const OVERCLAIM = /\b(certificad[oa]s?|verificad[oa]s?|auditad[oa]s? por|garantiza(?:mos)?)\b/i;

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

const doctrine = existsSync(DOCTRINE) ? readFileSync(DOCTRINE, "utf8") : "";
const scaffold = existsSync(SCAFFOLD) ? readFileSync(SCAFFOLD, "utf8") : "";
const skill = existsSync(SKILL) ? readFileSync(SKILL, "utf8") : "";

check("the measurement doctrine exists", () => [
  doctrine.length > 4096,
  doctrine.length ? `${doctrine.length} bytes` : "capabilities/baseline/doctrine/MEASUREMENT.md missing",
]);

check("the doctrine carries the throughput law, not only cycle time", () => {
  const law = /Little/.test(doctrine);
  const why = /throughput/i.test(doctrine) && /cycle time/i.test(doctrine);
  return [law && why, law ? "Little's Law cited with both terms" : "no basis for measuring throughput separately"];
});

check("the doctrine states the direction of recall bias, not merely that it exists", () => {
  const direction = /\bhigh\b/i.test(doctrine) && /recall|self-report/i.test(doctrine);
  return [
    direction,
    direction ? "recurring-task recall skews high" : "bias named without a direction is unusable",
  ];
});

check("attribution is contribution, never a counterfactual", () => {
  const contribution = /Contribution Analysis|Mayne/i.test(doctrine);
  const refusesCounterfactual = /counterfactual/i.test(doctrine);
  return [
    contribution && refusesCounterfactual,
    `contribution analysis: ${contribution}; counterfactual addressed: ${refusesCounterfactual}`,
  ];
});

check("the doctrine requires a paired quality metric with every throughput figure", () => {
  const paired = /paired quality|quality metric/i.test(doctrine);
  const why = /rework|error|rejection/i.test(doctrine);
  return [paired && why, paired ? "paired metric required" : "throughput can be inflated by splitting units"];
});

check("the baseline skill refuses the words that require an accreditation", () => {
  const refuses = /certificado/i.test(skill) && /Never/i.test(skill);
  return [refuses, refuses ? "the skill names the forbidden words" : "nothing stops the claim"];
});

check("the baseline scaffold makes no certified or guaranteed claim", () => {
  const lines = scaffold.split(/\r?\n/);
  const offenders = lines
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => OVERCLAIM.test(l) && !/\bnunca\b|\bno\b|—\s*pendiente/i.test(l));
  return [
    offenders.length === 0,
    offenders.length ? `line ${offenders[0][0]}: ${offenders[0][1].trim().slice(0, 70)}` : "no overclaim",
  ];
});

check("the baseline scaffold declares a schema version", () => [
  /\*\*Esquema:\*\*\s*\d/.test(scaffold),
  /\*\*Esquema:\*\*\s*(\d)/.exec(scaffold)?.[1] ?? "no schema line",
]);

check("the baseline scaffold has a before and an after, dated", () => {
  const before = /antes/i.test(scaffold);
  const after = /despu[ée]s/i.test(scaffold);
  const dated = /fecha/i.test(scaffold);
  return [before && after && dated, `antes: ${before}; después: ${after}; fecha: ${dated}`];
});

check("the baseline is company-wide, not a social metric sheet", () => {
  const socialOnly = /seguidores/i.test(scaffold) && !/proceso/i.test(scaffold);
  return [!socialOnly, socialOnly ? "the baseline collapsed into social metrics" : "process-level measures present"];
});

check("an overclaiming line would fail", () => {
  const fake = "Resultados certificados: 40% de mejora garantizada.";
  return [OVERCLAIM.test(fake), "a certified/guaranteed claim was refused"];
});

check("a paired-metric-free throughput claim is recognisable as incomplete", () => {
  const fake = "Cotizaciones por semana: 12 → 36.";
  const hasQuality = /error|retrabajo|rechazo/i.test(fake);
  return [!hasQuality, "a throughput figure with no quality metric was refused"];
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
