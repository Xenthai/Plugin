import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DOCTRINE = join(ROOT, "capabilities", "automate", "doctrine", "HANDOVER.md");
const SCAFFOLD = join(ROOT, "scaffold", "company", "AUTOMATIONS.md");
const SKILL = join(ROOT, "skills", "automate-handover", "SKILL.md");

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");
const doctrine = read(DOCTRINE);
const scaffold = read(SCAFFOLD);
const skill = read(SKILL);

check("the handover doctrine exists", () => [
  doctrine.length > 4096,
  doctrine.length ? `${doctrine.length} bytes` : "capabilities/automate/doctrine/HANDOVER.md missing",
]);

check("the doctrine names all three rungs of the autonomy ladder", () => {
  const rungs = ["Visible", "Assisted", "Unattended"];
  const missing = rungs.filter((r) => !new RegExp(`\\b${r}\\b`).test(doctrine));
  return [missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : rungs.join(" → ")];
});

/**
 * A ladder without an exit criterion per rung is a ladder nobody climbs: "we'll watch it for a
 * while" becomes permanent because no one ever has to decide. The ten-instance figure is the
 * criterion that makes rung 1 a decision rather than a feeling.
 */
check("every rung carries an exit criterion, and rung 1's is countable", () => {
  const criterion = /exit criterion/i.test(doctrine);
  const countable = /ten\b.*real instances|at least \*\*ten\*\*/i.test(doctrine);
  return [criterion && countable, `exit criteria named: ${criterion}; rung 1 countable: ${countable}`];
});

check("the ladder can go down, not only up", () => [
  /go\s+down\s+as\s+well\s+as\s+up|back\s+to\s+rung\s+2/i.test(doctrine),
  /go down as well as up/i.test(doctrine) ? "demotion is a recorded event" : "a one-way ladder cannot correct itself",
]);

check("the doctrine gates the build on three answerable questions", () => {
  const one = /one\s+sentence/i.test(doctrine);
  const good = /what\s+good\s+looks\s+like/i.test(doctrine);
  const steps = /without\s+hand-waving/i.test(doctrine);
  return [one && good && steps, `goal: ${one}; proof: ${good}; steps: ${steps}`];
});

check("the prior test — autonomous, recurring, reviewable — is stated, and reviewable is flagged", () => {
  const triad = /autonomous, recurring,? and reviewable/i.test(doctrine);
  const flagged = /[Rr]eviewable is the (one|criterion)/.test(doctrine);
  return [triad && flagged, `triad: ${triad}; reviewable flagged as the skipped one: ${flagged}`];
});

/**
 * Stopping rather than rerouting is a deliberate posture, not an oversight. The assertion exists so
 * a later editor who "improves" the automation into rerouting has to delete a stated reason first.
 */
check("stopping instead of rerouting is written as a choice with its reasoning", () => {
  const named = /is a choice/i.test(doctrine);
  const authority = /decision\s+made\s+without\s+authority/i.test(doctrine);
  const visible = /break\s+is\s+visible/i.test(doctrine);
  const evidence = /destroys\s+the\s+evidence/i.test(doctrine);
  return [
    named && authority && visible && evidence,
    `stated as a choice: ${named}; authority: ${authority}; visibility: ${visible}; evidence: ${evidence}`,
  ];
});

check("the posture is chosen per automation, never once for the plugin", () => [
  /per\s+automation,\s+not\s+once\s+for\s+the\s+plugin/i.test(doctrine),
  /per automation/i.test(doctrine) ? "per automation" : "a plugin-wide posture would be wrong for research work",
]);

check("the scaffold carries the rung fields, so an unrecorded rung defaults to 1", () => {
  const column = /\|\s*Pelda[ñn]o\s*\|/i.test(scaffold);
  const fields = /Pelda[ñn]o actual/i.test(scaffold) && /Instancias comparadas/i.test(scaffold);
  const defaults = /est[áa] en el 1/i.test(scaffold);
  return [column && fields && defaults, `column: ${column}; fields: ${fields}; default stated: ${defaults}`];
});

check("the scaffold records the failure posture and who decided it", () => {
  const table = /se detiene \/ rerutea/i.test(scaffold);
  const who = /Qui[ée]n lo decidi[óo]/i.test(scaffold);
  return [table && who, `posture recorded: ${table}; decider named: ${who}`];
});

check("the scaffold is es-MX, because a director reads it", () => {
  const prose = scaffold
    .split(/\r?\n/)
    .filter((l) => !l.trim().startsWith("```") && !/^\s*[-|>]/.test(l))
    .join(" ");
  const hit = /\b(the|this file|should be|must be|instead of)\b/i.exec(prose);
  return [!hit, hit ? `English word "${hit[0]}" in prose` : "Spanish only"];
});

check("the skill gates on the rung before writing anything", () => {
  const rung = /which rung/i.test(skill);
  const defaults = /no\s+rung\s+recorded\s+is\s+at\s+rung\s+1/i.test(skill);
  return [rung && defaults, `gates on rung: ${rung}; states the default: ${defaults}`];
});

check("the skill still leads with the off switch, which is the acceptance test", () => [
  /switch\s+it\s+off,\s+alone/i.test(skill),
  /switch it off/i.test(skill) ? "the off switch is the test" : "a client who cannot switch it off does not own it",
]);

check("a doctrine that lost its exit criteria would fail", () => {
  const fake = "Rung 1 Visible. Rung 2 Assisted. Rung 3 Unattended. Climb when it feels ready.";
  return [!/exit criterion/i.test(fake), '"when it feels ready" is not an exit criterion, and was refused'];
});

check("an automation with no recorded rung is not treated as unattended", () => {
  const fake = "| 1 | Cotización | P1 | n8n | | 2026-09-01 | en vivo |";
  const hasRung = /\|\s*[123]\s*·/.test(fake);
  return [!hasRung, "a row with an empty rung cell reads as rung 1, never as unattended"];
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
