import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKILLS = join(ROOT, "skills");

const names = readdirSync(SKILLS, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

/**
 * Every skill of ours is `<category>-<responsibility>` or is the router named after its category, so a
 * reader can tell from a name alone which track or practice owns it. `true` marks a category whose
 * router must exist: an entry point the others assume ran first. The rest are families of peers that
 * no router fronts, because nothing has to be established before any one of them.
 */
const CATEGORIES = {
  company: false,
  process: true,
  automate: false,
  brand: true,
  social: true,
  design: true,
  engineering: true,
  plugin: false,
  engagement: false,
};

const categoryOf = (name) => {
  if (Object.hasOwn(CATEGORIES, name)) return name;
  const prefix = Object.keys(CATEGORIES).find((c) => name.startsWith(`${c}-`) && name.length > c.length + 1);
  return prefix ?? null;
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("every skill of ours carries a category", () => {
  const bare = names.filter((n) => categoryOf(n) === null);
  return [bare.length === 0, bare.length ? `no category: ${bare.join(", ")}` : `${names.length} skills, all categorised`];
});

check("every category that declares a router has one", () => {
  const missing = Object.entries(CATEGORIES)
    .filter(([c, routed]) => routed && !existsSync(join(SKILLS, c, "SKILL.md")))
    .map(([c]) => c);
  return [missing.length === 0, missing.length ? `router missing: ${missing.join(", ")}` : "every declared router exists"];
});

check("a skill with no category would be refused", () => {
  const refused = ["foo", "doctor", "company", "companyx-new", "design-"].filter((n) => n !== "company" && categoryOf(n) === null);
  return [refused.length === 4 && categoryOf("company") === "company", `refused: ${refused.join(", ")}`];
});

check("a categorised name resolves to its category, never to a longer one by accident", () => {
  const got = ["design-ux-research", "engagement-report", "plugin-doctor"].map(categoryOf);
  return [got.join(",") === "design,engagement,plugin", got.join(",")];
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
console.log(`${cases.length - failed}/${cases.length} passed  (${names.length} skills, ${Object.keys(CATEGORIES).length} categories)`);
process.exit(failed ? 1 : 0);
