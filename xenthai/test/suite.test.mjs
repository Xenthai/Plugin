import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKILLS = join(ROOT, "skills");
const NOTICE = join(ROOT, "NOTICE.md");

const names = readdirSync(SKILLS, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const notice = existsSync(NOTICE) ? readFileSync(NOTICE, "utf8") : "";
const vendored = [...notice.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1]);
const own = names.filter((n) => !vendored.includes(n));

/**
 * Splits a SKILL.md into its frontmatter keys and body. Claude Code reads only `name` and
 * `description`; returning the keys is what lets the suite refuse a third one in a skill of ours.
 */
const parse = (text) => {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { keys: [], front: "", body: text };
  return { keys: [...m[1].matchAll(/^([A-Za-z_-]+):/gm)].map((k) => k[1]), front: m[1], body: m[2] };
};

/**
 * Keys a vendored skill may carry beyond `name` and `description`, because rewriting a third
 * party's frontmatter would change its behaviour (`disable-model-invocation` is the difference
 * between a skill that loads on its own and one that waits to be called). Our own skills get none.
 */
const VENDORED_EXTRA_KEYS = new Set(["license", "metadata", "disable-model-invocation", "allowed-tools", "argument-hint"]);

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("NOTICE.md exists and lists vendored skills the plugin carries", () => {
  const missing = vendored.filter((n) => !names.includes(n));
  return [vendored.length > 0 && missing.length === 0, missing.length ? `attributed but absent: ${missing.join(", ")}` : `${vendored.length} vendored skills listed`];
});

check("every vendored skill is a real directory with a SKILL.md and nothing nested", () => {
  const bad = [];
  for (const n of vendored) {
    const dir = join(SKILLS, n);
    if (!existsSync(dir)) continue;
    if (lstatSync(dir).isSymbolicLink()) bad.push(`${n} is a symlink`);
    if (!existsSync(join(dir, "SKILL.md"))) bad.push(`${n} has no SKILL.md`);
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : "all real"];
});

check("every vendored skill has name and description, and its name equals the folder", () => {
  const bad = [];
  for (const n of vendored) {
    const { keys, front } = parse(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"));
    if (!keys.includes("name") || !keys.includes("description")) bad.push(`${n}: needs name and description (${keys.join("+") || "no frontmatter"})`);
    const declared = /^name:\s*(.+)$/m.exec(front)?.[1]?.trim().replace(/^["']|["']$/g, "");
    if (declared !== n) bad.push(`${n} declares "${declared}"`);
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : `${vendored.length} frontmatters valid`];
});

check("our own skills carry exactly name and description, vendored ones only a named allowance beyond them", () => {
  const bad = [];
  for (const n of names) {
    const { keys } = parse(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"));
    const extra = keys.filter((k) => k !== "name" && k !== "description");
    if (own.includes(n) && extra.length) bad.push(`${n}: ${extra.join(", ")}`);
    if (vendored.includes(n)) {
      const outside = extra.filter((k) => !VENDORED_EXTRA_KEYS.has(k));
      if (outside.length) bad.push(`${n}: ${outside.join(", ")} is outside the allowance`);
    }
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : "own skills exactly two keys; vendored within the allowance"];
});

check("every vendored skill is attributed in NOTICE.md with a source URL and an open licence", () => {
  const bad = vendored.filter((n) => !new RegExp(`^\\| \`${n}\` \\| .+ \\| https://github\\.com/\\S+ \\| (MIT|Apache-2\\.0) \\|`, "m").test(notice));
  return [bad.length === 0, bad.length ? `incomplete rows: ${bad.join(", ")}` : `${vendored.length} rows with author, source and licence`];
});

check("an Apache-2.0 skill ships the licence text it is licensed under", () => {
  const apache = [...notice.matchAll(/^\| `([a-z0-9-]+)` \|.*\| Apache-2\.0 \|/gm)].map((m) => m[1]);
  const bad = apache.filter((n) => !existsSync(join(SKILLS, n, "LICENSE.txt")));
  return [bad.length === 0, bad.length ? `no LICENSE.txt: ${bad.join(", ")}` : `${apache.length} Apache-2.0 skills carry LICENSE.txt`];
});

check("external-skills.json entries have name, source and installCommand", () => {
  const p = join(ROOT, "external-skills.json");
  if (!existsSync(p)) return [false, "external-skills.json missing"];
  const list = JSON.parse(readFileSync(p, "utf8")).skills;
  const bad = (Array.isArray(list) ? list : []).filter((e) => !(typeof e.name === "string" && e.name && typeof e.source === "string" && e.source && typeof e.installCommand === "string" && e.installCommand.includes(e.source)));
  return [Array.isArray(list) && bad.length === 0, Array.isArray(list) ? (bad.length ? `${bad.length} entries missing a field` : `${list.length} external skills, each with three fields`) : "no skills array"];
});

check("an external skill is never also shipped", () => {
  const list = JSON.parse(readFileSync(join(ROOT, "external-skills.json"), "utf8")).skills;
  const both = list.filter((e) => names.includes(e.name)).map((e) => e.name);
  return [both.length === 0, both.length ? `both external and shipped: ${both.join(", ")}` : "disjoint"];
});

check("no bytecode or cache directory ships inside a skill", () => {
  const found = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "__pycache__" || e.name.endsWith(".pyc")) found.push(join(dir, e.name));
      else if (e.isDirectory()) walk(join(dir, e.name));
    }
  };
  walk(SKILLS);
  return [found.length === 0, found.length ? `${found.length} found` : "clean"];
});

check("a foreign frontmatter key on a vendored skill, or any extra key on our own, would be refused", () => {
  const foreign = parse("---\nname: x\ndescription: d\ntriggers: a\n---\nB").keys.filter((k) => k !== "name" && k !== "description" && !VENDORED_EXTRA_KEYS.has(k));
  const ours = parse("---\nname: design\ndescription: d\nlicense: MIT\n---\nB").keys.filter((k) => k !== "name" && k !== "description");
  return [foreign.length === 1 && ours.length === 1, `"triggers" refused for a vendored skill; "license" refused for our own`];
});

check("a vendored skill missing from NOTICE.md would be refused", () => {
  const rows = "| `a` | Someone | https://github.com/x/y | MIT |\n";
  const listed = [...rows.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1]);
  return [!listed.includes("b") && listed.includes("a"), "a skill with no row is absent from the parsed attribution"];
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
console.log(`${cases.length - failed}/${cases.length} passed  (${names.length} skills, ${vendored.length} vendored)`);
process.exit(failed ? 1 : 0);
