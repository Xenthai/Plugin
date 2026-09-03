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

/**
 * The runbooks must send an operator to the CATALOGUE, never to this repository.
 *
 * This repo carries two things that look alike and are not. `plugin.json` is the plugin. The
 * `marketplace.json` beside it is a **development** catalogue named `xenthai-dev` that points at
 * itself with `"./"`, so the plugin can be installed from a working copy — the same arrangement
 * `obra/superpowers` uses. Adding this repository as a marketplace works from a terminal, which
 * clones it, and fails in the desktop app, which syncs over HTTP and needs each plugin's own
 * repository URL.
 *
 * That distinction cost an afternoon, so it is asserted rather than remembered: the runbooks name
 * the published catalogue, and the dev manifest is never mistaken for it.
 */
const PUBLISHED_MARKETPLACE = "Xenthai/Marketplace";

check("both runbooks send an operator to the published catalogue, not to this repository", () => {
  const expected = `claude plugin marketplace add ${PUBLISHED_MARKETPLACE}`;
  const bad = [];
  for (const f of ["INSTALL.md", "README.md"]) {
    const text = read(f);
    if (!text.includes(expected)) bad.push(`${f} does not say "${expected}"`);
    if (/marketplace add Xenthai\/Plugin\b/.test(text)) bad.push(`${f} sends the operator to the plugin repo`);
  }
  return [bad.length === 0, bad.join("; ") || `both name ${PUBLISHED_MARKETPLACE}`];
});

/**
 * The manifest in this repository is the development one. If it ever takes the published
 * marketplace's name, adding either would replace the other — Claude Code keeps one marketplace per
 * name per user — and the operator would be installing from a source nobody intended.
 */
check("this repository's marketplace manifest is the development one, and says so", () => {
  const m = json(".claude-plugin/marketplace.json");
  const entry = m.plugins?.[0];
  const bad = [];
  if (m.name !== "xenthai-dev") bad.push(`name is ${m.name}, not xenthai-dev`);
  if (entry?.source !== "./") bad.push(`source is ${JSON.stringify(entry?.source)}, not "./"`);
  if (entry?.version !== json(".claude-plugin/plugin.json").version) bad.push("entry version does not match plugin.json");
  return [bad.length === 0, bad.join("; ") || `${m.name} → ${entry.source} @ ${entry.version}`];
});

check("package.json points at the same repository as the plugin manifest", () => {
  const a = json(".claude-plugin/plugin.json").repository;
  const b = json("package.json").repository?.url;
  return [a === b, `plugin: ${a} · package: ${b}`];
});

/**
 * The install line names the PUBLISHED marketplace, which is `xenthai` — not this repository's
 * development one, `xenthai-dev`. Deriving it from the local manifest was correct until the
 * catalogue moved to its own repository, and then it silently expected the wrong line.
 */
check("the install line names the marketplace, not the repository slug", () => {
  const marketplace = "xenthai";
  const plugin = json(".claude-plugin/plugin.json").name;
  const expected = `claude plugin install ${plugin}@${marketplace}`;
  const install = read("INSTALL.md");
  const readme = read("README.md");
  return [
    install.includes(expected) && readme.includes(expected),
    `expected "${expected}" — INSTALL: ${install.includes(expected)}, README: ${readme.includes(expected)}`,
  ];
});

/**
 * Removing the plugin is documented because forgetting how is the normal case: it is done once every
 * few months, under pressure, on somebody else's machine. Three things have to survive an edit — the
 * two commands, the order between them, and the fact that a client's own documents are never touched.
 *
 * The order is the part that matters. Removing the marketplace first leaves the plugin installed
 * with no source, which is a state that looks fine until an update or a reinstall is attempted.
 */
check("the README documents how to remove the plugin, in the order that works", () => {
  const readme = read("README.md");
  const marketplace = json(".claude-plugin/marketplace.json").plugins[0].name;
  const bad = [];
  if (!readme.includes(`claude plugin uninstall ${marketplace}@xenthai`)) bad.push("no uninstall command");
  if (!readme.includes("claude plugin marketplace remove xenthai")) bad.push("no marketplace remove command");
  const uninstallAt = readme.indexOf("claude plugin uninstall");
  const removeAt = readme.indexOf("claude plugin marketplace remove");
  if (uninstallAt === -1 || removeAt === -1 || uninstallAt > removeAt) bad.push("uninstall is not shown before marketplace remove");
  if (!/journal|documents/i.test(readme.slice(removeAt, removeAt + 900))) bad.push("does not say a client's own records are left alone");
  return [bad.length === 0, bad.join("; ") || "both commands, in order, with the client's records protected"];
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
