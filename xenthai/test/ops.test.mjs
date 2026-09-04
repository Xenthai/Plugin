import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
/** The repository holds the catalogue and CI; the plugin is one directory beneath it. */
const REPO = join(ROOT, "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const json = (rel) => JSON.parse(read(rel));
const repoRead = (rel) => readFileSync(join(REPO, rel), "utf8");
const repoJson = (rel) => JSON.parse(repoRead(rel));

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

/** Commands only: the assertion is about what CI executes, not what a comment mentions. */
/**
 * Every executable line of the workflow, comments removed.
 *
 * It kept only lines matching `run:`, which stopped working the moment a step became a `run: |`
 * block: the commands then live on the lines that follow and the `run:` line itself carries
 * nothing. Comments are dropped rather than kept because a comment that quotes the command it warns
 * against — "installs cleanly with a normal `npm ci`" — reads to a regex exactly like the command.
 */
const ciCommands = () =>
  repoRead(".github/workflows/test.yml")
    .split(/\r?\n/)
    .filter((l) => !/^\s*#/.test(l))
    .join(" ; ");

check("CI installs with --ignore-scripts, the way the runtime does", () => {
  const cmds = ciCommands();
  const hasFlag = /npm ci --ignore-scripts/.test(cmds);
  const plainCi = /npm ci(?! --ignore-scripts)/.test(cmds);
  return [hasFlag && !plainCi, `--ignore-scripts: ${hasFlag}; a plain npm ci in a command: ${plainCi}`];
});

check("CI runs the gate and validates both manifests where they actually live", () => {
  const yml = ciCommands();
  const bad = [];
  if (!/npm test/.test(yml)) bad.push("no npm test");
  if (!/plugin validate --strict/.test(yml)) bad.push("the manifests are not validated with --strict");
  if (!/\.\.\/\.claude-plugin\/marketplace\.json/.test(yml)) bad.push("the catalogue is not validated one level up");
  if (!/\.claude-plugin\/plugin\.json/.test(yml)) bad.push("plugin.json is not validated");
  // --strict fails on any warning, and the absent `version` raises one deliberately. CI has to
  // tolerate that single warning by name; if it stops doing so, every push fails on a choice this
  // repository made on purpose.
  if (!/version: No version specified/.test(yml)) bad.push("CI does not tolerate the deliberate absence of version by name, so --strict will fail on it");
  return [bad.length === 0, bad.join("; ") || "gate plus both manifests"];
});

/**
 * CI runs from the plugin directory, so npm has to be pointed at the lockfile inside it. Without
 * that, the cache key is computed from a lockfile that no longer exists at the repository root and
 * the job dies in setup-node, before a single test runs.
 */
check("CI runs npm from the plugin directory and caches from its lockfile", () => {
  const yml = repoRead(".github/workflows/test.yml");
  const bad = [];
  if (!/working-directory: xenthai/.test(yml)) bad.push("no working-directory");
  if (!/cache-dependency-path: xenthai\/package-lock\.json/.test(yml)) bad.push("cache key not pointed at the plugin's lockfile");
  return [bad.length === 0, bad.join("; ") || "working-directory and cache path both set"];
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
 * Catalogue at the repository root, plugin in ./xenthai beneath it — the shape `fru-dev3/AI-Ready-Life`
 * uses and the only one observed working in the desktop app.
 *
 * It is asserted rather than remembered because it looks arbitrary. Be honest about how well it is
 * established: a relative source is known to resolve in the app, and a plugin declared by URL was
 * never cleanly shown to fail, because the run that suggested it also carried a settings mismatch
 * that alone explains the failure. So this pins what works and claims nothing about what does not.
 */
const PLUGIN_DIR = "xenthai";
const CATALOGUE = ".claude-plugin/marketplace.json";

/**
 * One name, added from one place. Whichever of the terminal and the desktop app adds the marketplace
 * first writes its source into settings.json, and the other sends a different shape for the same
 * name — `Xenthai/Plugin` against `https://github.com/Xenthai/Plugin`. The second is refused for
 * disagreeing with the declaration, and the app renders that as a sync error that reads like a bad
 * URL. The runbooks say so; this asserts they still do.
 */
const CATALOGUE_NAME = "xenthai";

check("the catalogue declares the plugin as a path inside this repository, never a URL", () => {
  const source = repoJson(CATALOGUE).plugins?.[0]?.source;
  const bad = [];
  if (typeof source !== "string") {
    bad.push(`source is ${JSON.stringify(source)} — an object source names another repository, which the desktop app cannot reach`);
  } else if (source !== `./${PLUGIN_DIR}`) {
    bad.push(`source is ${JSON.stringify(source)}, not "./${PLUGIN_DIR}"`);
  }
  if (!existsSync(join(REPO, PLUGIN_DIR, ".claude-plugin/plugin.json"))) {
    bad.push(`${PLUGIN_DIR}/.claude-plugin/plugin.json does not exist, so the source resolves to nothing`);
  }
  return [bad.length === 0, bad.join("; ") || `${JSON.stringify(source)} resolves to a real plugin manifest`];
});

check("every runbook warns that adding from both places is refused", () => {
  const bad = [];
  for (const [label, text] of [["README.md", read("README.md")], ["INSTALL.md", read("INSTALL.md")], ["the repository README", repoRead("README.md")]]) {
    if (!/settings\.json/.test(text) || !/https:\/\/github\.com\/Xenthai\/Plugin/.test(text)) bad.push(`${label} does not name both shapes and where they are declared`);
  }
  return [bad.length === 0, bad.join("; ") || "all three warn, naming both shapes"];
});

check("one catalogue, at the repository root", () => {
  const m = repoJson(CATALOGUE);
  const bad = [];
  if (existsSync(join(ROOT, CATALOGUE))) bad.push(`a second catalogue exists at ${PLUGIN_DIR}/${CATALOGUE}`);
  if (m.name !== CATALOGUE_NAME) bad.push(`the catalogue is named ${m.name}, not ${CATALOGUE_NAME}`);
  // Neither manifest may declare a version. A declared version pins the plugin: the CLI hands an
  // existing install an update only when that string changes, so every fix merged between two bumps
  // is unreachable by anyone who already installed. Absent from both, the version resolves to the
  // commit SHA and every push reaches a client. This asserts the absence, because the failure it
  // guards is silent — a pinned plugin installs and runs, it just never updates again.
  if (m.plugins?.[0]?.version !== undefined) bad.push("the catalogue entry declares a version, which pins the plugin and stops updates");
  if (json(".claude-plugin/plugin.json").version !== undefined) bad.push("plugin.json declares a version, which pins the plugin and stops updates");
  return [bad.length === 0, bad.join("; ") || `${m.name}, version resolved from the commit`];
});

check("package.json points at the same repository as the plugin manifest", () => {
  const a = json(".claude-plugin/plugin.json").repository;
  const b = json("package.json").repository?.url;
  return [a === b, `plugin: ${a} · package: ${b}`];
});

/** Each half is derived from its manifest, so the runbooks cannot drift when either name moves. */
check("all three runbooks name the catalogue's repository and the install line", () => {
  const marketplace = repoJson(CATALOGUE).name;
  const plugin = json(".claude-plugin/plugin.json").name;
  const add = "claude plugin marketplace add Xenthai/Plugin";
  const install = `claude plugin install ${plugin}@${marketplace}`;
  const bad = [];
  const runbooks = [
    ["README.md", read("README.md")],
    ["INSTALL.md", read("INSTALL.md")],
    ["the repository README", repoRead("README.md")],
  ];
  for (const [label, text] of runbooks) {
    if (!text.includes(add)) bad.push(`${label} does not say "${add}"`);
    if (!text.includes(install)) bad.push(`${label} does not say "${install}"`);
    if (/marketplace add Xenthai\/Marketplace\b/.test(text)) bad.push(`${label} still sends the operator to the retired catalogue`);
  }
  return [bad.length === 0, bad.join("; ") || `${add} then ${install}, in all three`];
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
  const marketplace = repoJson(CATALOGUE).name;
  const plugin = json(".claude-plugin/plugin.json").name;
  const bad = [];
  if (!readme.includes(`claude plugin uninstall ${plugin}@${marketplace}`)) bad.push("no uninstall command");
  if (!readme.includes(`claude plugin marketplace remove ${marketplace}`)) bad.push("no marketplace remove command");
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

// The changelog can no longer be checked against a version field, because there is none — the
// version is the commit. What is still worth asserting is that the file is kept: a dated entry at
// the top, and no `[Unreleased]` section, since nothing merged is unshipped any more.
check("the changelog carries a dated entry and claims nothing is unreleased", () => {
  const log = read("CHANGELOG.md");
  const bad = [];
  if (/^## \[Unreleased\]/m.test(log)) bad.push("an [Unreleased] section survives, but every push now ships");
  const dated = log.match(/^## \[[^\]]+\] - \d{4}-\d{2}-\d{2}/m);
  if (!dated) bad.push("no dated entry heading was found");
  return [bad.length === 0, bad.join("; ") || `newest entry: ${dated[0].replace("## ", "")}`];
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
  const refs = ["MCP.md", "scaffold/company/.company.json.template", "test/run.mjs"];
  const missing = refs.filter((r) => !existsSync(join(ROOT, r)));
  if (!existsSync(join(REPO, ".github/workflows/test.yml"))) missing.push(".github/workflows/test.yml");
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
