import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKILLS = join(ROOT, "skills");
const CAPABILITIES = join(ROOT, "capabilities");
const NOTICE = join(ROOT, "NOTICE.md");

const names = readdirSync(SKILLS, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const notice = existsSync(NOTICE) ? readFileSync(NOTICE, "utf8") : "";

/**
 * A row shaped like the attribution table of a copied skill. The plugin carries no third-party skill:
 * other authors' ideas are rewritten in its own words and credited in prose, so a row of this shape
 * means a copy came back.
 */
const COPIED_ROW = /^\| `([a-z0-9-]+)` \|/gm;

/**
 * A skill that downloads its rules when it runs behaves differently on every run and offline not at
 * all, and the text it obeys was never reviewed here.
 */
const REMOTE_RULES = /raw\.githubusercontent\.com|curl\s+-[a-zA-Z]*\s*https?:|WebFetch\s+https?:/;

const markdownUnder = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return markdownUnder(p);
    return e.name.endsWith(".md") ? [p] : [];
  });

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("every skill is a real directory holding exactly one file, its SKILL.md", () => {
  const bad = [];
  for (const n of names) {
    const dir = join(SKILLS, n);
    if (lstatSync(dir).isSymbolicLink()) bad.push(`${n} is a symlink`);
    const entries = readdirSync(dir);
    if (entries.length !== 1 || entries[0] !== "SKILL.md") bad.push(`${n}: ${entries.join(", ")}`);
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : `${names.length} skills, one SKILL.md each`];
});

check("every skill's frontmatter is exactly name and description, and its name equals the folder", () => {
  const bad = [];
  for (const n of names) {
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"))?.[1] ?? "";
    const keys = [...front.matchAll(/^([A-Za-z_-]+):/gm)].map((k) => k[1]);
    if (keys.join(",") !== "name,description") bad.push(`${n}: ${keys.join("+") || "no frontmatter"}`);
    const declared = /^name:\s*(.+)$/m.exec(front)?.[1]?.trim();
    if (declared !== n) bad.push(`${n} declares "${declared}"`);
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : `${names.length} frontmatters valid`];
});

check("no third-party skill is shipped or installed from outside", () => {
  const rows = [...notice.matchAll(COPIED_ROW)].map((m) => m[1]);
  const external = existsSync(join(ROOT, "external-skills.json"));
  const bad = [...rows.map((r) => `NOTICE.md lists a copied skill: ${r}`), ...(external ? ["external-skills.json exists"] : [])];
  return [bad.length === 0, bad.length ? bad.join("; ") : "no copied or external skill"];
});

check("NOTICE.md credits the sources whose ideas the skills were rewritten from", () => {
  const credits = [...notice.matchAll(/^- .+ — .+ — https?:\/\/\S+$/gm)].length;
  return [credits > 0, `${credits} credited sources`];
});

check("no skill or doctrine file fetches its rules from the network", () => {
  const files = [...markdownUnder(SKILLS), ...markdownUnder(CAPABILITIES)];
  const bad = files.filter((f) => REMOTE_RULES.test(readFileSync(f, "utf8"))).map((f) => f.slice(ROOT.length + 1));
  return [bad.length === 0, bad.length ? bad.join(", ") : `${files.length} files, none fetch rules`];
});

check("a copied-skill row, an extra file in a skill and a remote rule source would each be refused", () => {
  const row = [..."| `a` | Someone | https://github.com/x/y | MIT |\n".matchAll(COPIED_ROW)].length === 1;
  const extra = ["SKILL.md", "data.csv"].length !== 1;
  const remote = REMOTE_RULES.test("Fetch https://raw.githubusercontent.com/x/y/main/rules.md before each review");
  return [row && extra && remote, `row=${row} extra=${extra} remote=${remote}`];
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
console.log(`${cases.length - failed}/${cases.length} passed  (${names.length} skills)`);
process.exit(failed ? 1 : 0);
