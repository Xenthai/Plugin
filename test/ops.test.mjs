import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

/** Commands only: the assertion is about what CI executes, not what a comment mentions. */
const ciCommands = () =>
  read(".github/workflows/test.yml")
    .split(/\r?\n/)
    .filter((l) => /\brun:/.test(l))
    .join(" ; ");

check("CI installs with --ignore-scripts, the way the runtime does", () => {
  const cmds = ciCommands();
  const hasFlag = /npm ci --ignore-scripts/.test(cmds);
  const plainCi = /npm ci(?! --ignore-scripts)/.test(cmds);
  return [hasFlag && !plainCi, `--ignore-scripts: ${hasFlag}; a plain npm ci in a command: ${plainCi}`];
});

check("CI runs the gate and validates the manifest", () => {
  const yml = ciCommands();
  return [/npm test/.test(yml) && /plugin validate/.test(yml), "npm test and plugin validate both present"];
});

check("CI pins the validate CLI to a version rather than floating on latest", () => {
  const yml = ciCommands();
  const pinned = /@anthropic-ai\/claude-code@\d+\.\d+\.\d+/.test(yml);
  return [pinned, `pinned: ${pinned}`];
});

check("CI downloads no browser — the runner already has one", () => {
  const yml = ciCommands();
  return [!/playwright install/.test(yml), "no playwright install step"];
});

check("the install line names the marketplace, not the repository slug", () => {
  const marketplace = json(".claude-plugin/marketplace.json").name;
  const plugin = json(".claude-plugin/plugin.json").name;
  const expected = `claude plugin install ${plugin}@${marketplace}`;
  const install = read("INSTALL.md");
  const readme = read("README.md");
  return [
    install.includes(expected) && readme.includes(expected),
    `expected "${expected}" — INSTALL: ${install.includes(expected)}, README: ${readme.includes(expected)}`,
  ];
});

check("the runbook names only skills that ship", () => {
  const install = read("INSTALL.md");
  const shipped = new Set(readdirSync(join(ROOT, "skills")));
  const named = [...install.matchAll(/\/xenthai:([a-z-]+)/g)].map((m) => m[1]);
  const missing = named.filter((n) => !shipped.has(n));
  return [named.length > 0 && missing.length === 0, `named ${named.join(", ") || "(none)"}; missing ${missing.join(", ") || "none"}`];
});

check("the runbook covers the four steps no code can do", () => {
  const install = read("INSTALL.md");
  const required = [
    [/cannot declare|cannot be scripted|nobody can automate/i, "the connector cannot be automated"],
    [/[Aa]nyone with the link/, "the public assets-folder step"],
    [/\bID\b/, "the store root is an id, not a name"],
    [/comment/i, "reading a Doc's comments as the approval gate"],
  ];
  const missing = required.filter(([re]) => !re.test(install)).map(([, what]) => what);
  return [missing.length === 0, missing.length ? `missing: ${missing.join("; ")}` : "all four present"];
});

check("the changelog names the shipped version", () => {
  const version = json(".claude-plugin/plugin.json").version;
  const log = read("CHANGELOG.md");
  return [log.includes(version), `plugin.json says ${version}; changelog mentions it: ${log.includes(version)}`];
});

check("repository slug agrees across every manifest that states one", () => {
  const fromPlugin = (json(".claude-plugin/plugin.json").repository ?? "").replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
  const pkg = json("package.json").repository;
  const fromPkg = typeof pkg === "string" ? pkg : (pkg?.url ?? "");
  const normalised = fromPkg.replace(/^git\+/, "").replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "");
  const agree = !normalised || normalised === fromPlugin;
  return [Boolean(fromPlugin) && agree, `plugin.json: ${fromPlugin}; package.json: ${normalised || "(none)"}`];
});

check("tests are discovered by glob, so no suite is named in package.json", () => {
  const scripts = json("package.json").scripts ?? {};
  const test = scripts.test ?? "";
  const namesASuite = /\.test\.mjs/.test(test);
  const suites = readdirSync(HERE).filter((f) => f.endsWith(".test.mjs"));
  return [
    test === "node test/run.mjs" && !namesASuite && suites.length > 1,
    `test script is "${test}"; ${suites.length} suites on disk`,
  ];
});

check("the runner refuses a selector that matches nothing", () => {
  const runner = read("test/run.mjs");
  return [/exit\(1\)/.test(runner) && /no suite matches/.test(runner), "a bad selector exits non-zero"];
});

check("every file the runbook and CI reference exists", () => {
  const refs = ["MCP.md", "scaffold/company/.company.json.template", "test/run.mjs", ".github/workflows/test.yml"];
  const missing = refs.filter((r) => !existsSync(join(ROOT, r)));
  return [missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : "all present"];
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
