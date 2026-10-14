import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKILL = join(ROOT, "skills", "engineering", "SKILL.md");
const DOCTRINE = join(ROOT, "capabilities", "engineering", "doctrine");

const skill = existsSync(SKILL) ? readFileSync(SKILL, "utf8") : "";
const doctrineFiles = existsSync(DOCTRINE) ? readdirSync(DOCTRINE).filter((f) => f.endsWith(".md")) : [];
const doctrine = Object.fromEntries(doctrineFiles.map((f) => [f, readFileSync(join(DOCTRINE, f), "utf8")]));

/**
 * The doctrine was distilled from one practice's private repositories. A client name, a ticket
 * prefix, a decision number or a vendor's product in it would be that history leaking into every
 * engagement that installs the plugin, and would also date the rule to one codebase. Vendors named
 * in DEFAULTS.md's table are the one exception: a default has to name a tool to be one.
 */
const LEAKS = /\bD[0-9]{2,3}\b|\bSUL-[0-9]+|#[0-9]{2,}\b|Sulfinance|Conecta|EnXinga|Kuspit|Banxico|Cloudflare|NestJS|Monato|Tazapay/;

/** The six choices PROFILE.md hands to the repository instead of deciding globally. */
const KNOBS = ["Git authority", "Feature flags", "Scope stance", "Exact numbers", "Non-compliant repo", "Dev server"];

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("the skill exists and points at every doctrine file in its reference table", () => {
  if (!skill) return [false, "skills/engineering/SKILL.md missing"];
  const missing = doctrineFiles.filter((f) => !skill.includes(`capabilities/engineering/doctrine/${f}`));
  return [doctrineFiles.length >= 9 && missing.length === 0, missing.length ? `not referenced: ${missing.join(", ")}` : `${doctrineFiles.length} doctrine files, all referenced`];
});

check("every doctrine file the skill names exists", () => {
  const named = [...skill.matchAll(/capabilities\/engineering\/doctrine\/([A-Z-]+\.md)/g)].map((m) => m[1]);
  const ghosts = [...new Set(named)].filter((f) => !existsSync(join(DOCTRINE, f)));
  return [named.length > 0 && ghosts.length === 0, ghosts.length ? `named but absent: ${ghosts.join(", ")}` : `${new Set(named).size} names resolve`];
});

check("no doctrine file or the skill carries a project, ticket, decision number or vendor from the source repositories", () => {
  const leaks = [];
  for (const [f, text] of Object.entries(doctrine)) {
    if (f === "DEFAULTS.md") continue;
    const line = text.split(/\r?\n/).find((l) => LEAKS.test(l));
    if (line) leaks.push(`${f}: ${line.trim().slice(0, 60)}`);
  }
  const skillLine = skill.split(/\r?\n/).find((l) => LEAKS.test(l));
  if (skillLine) leaks.push(`SKILL.md: ${skillLine.trim().slice(0, 60)}`);
  return [leaks.length === 0, leaks.length ? leaks.join("; ") : "no source-repository names"];
});

check("a leaked ticket id or client name would be caught", () => {
  const samples = ["see SUL-1234 for the fix", "decided in D378", "the Conecta panel does this", "PR #302 merged it"];
  const caught = samples.filter((s) => LEAKS.test(s));
  return [caught.length === samples.length, `${caught.length}/${samples.length} samples refused`];
});

check("PROFILE.md names the six per-repository knobs with options and a moment to resolve each", () => {
  const text = doctrine["PROFILE.md"] ?? "";
  const missing = KNOBS.filter((k) => !new RegExp(`^\\| ${k} \\|.+\\|.+\\|`, "m").test(text));
  return [missing.length === 0, missing.length ? `knob rows missing: ${missing.join(", ")}` : `${KNOBS.length} knobs, each a row with options and a moment`];
});

check("the doctrine says where a resolved knob is recorded, and the skill reads the same place", () => {
  const text = doctrine["PROFILE.md"] ?? "";
  const both = /engineering-profile/.test(text) && /engineering-profile/.test(skill);
  return [both, both ? "`engineering-profile` named in PROFILE.md and SKILL.md" : "the recording location is not the same in both"];
});

check("every doctrine file ends with a checklist the session runs before replying", () => {
  const bare = Object.entries(doctrine).filter(([, t]) => !/^## Before you finish/m.test(t)).map(([f]) => f);
  return [bare.length === 0, bare.length ? `no closing checklist: ${bare.join(", ")}` : `${doctrineFiles.length} files close with a checklist`];
});

check("every doctrine file declares what it implements, like the other capabilities' doctrine", () => {
  const bare = Object.entries(doctrine).filter(([, t]) => !/^Implements: /m.test(t)).map(([f]) => f);
  return [bare.length === 0, bare.length ? `no Implements line: ${bare.join(", ")}` : "all declare"];
});

/**
 * The always-on rules are the ones whose violation cost most in the source sessions, and they
 * must be readable without opening a single doctrine file. Twenty is the count the skill promises;
 * fewer means one was dropped in an edit, more means doctrine crept into the router.
 */
check("the skill lists exactly twenty always-on rules", () => {
  const section = /## 2 · Always-on rules([\s\S]*?)## 3 ·/.exec(skill)?.[1] ?? "";
  const n = (section.match(/^\d+\. /gm) ?? []).length;
  return [n === 20, `${n} rules`];
});

check("the skill routes the two sibling tracks and the brand manual away from itself", () => {
  const front = /^---\n([\s\S]*?)\n---/.exec(skill)?.[1] ?? "";
  const siblings = ["process", "social", "brand-manual"].filter((s) => !front.includes(`use ${s}`));
  return [siblings.length === 0, siblings.length ? `not routed: ${siblings.join(", ")}` : "process, social and brand-manual named with their condition"];
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
