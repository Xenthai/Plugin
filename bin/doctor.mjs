#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany, SCHEMA } from "../lib/company.mjs";
import { EVENTS, PLUGIN_VERSION, record } from "../lib/journal.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE = join(HERE, "..", "capabilities", "social", "engine");
const FONTS = join(ENGINE, "fonts");
const TEMPLATE = join(ENGINE, "template.html");
const FORMATS = join(ENGINE, "formats.json");

const MIN_NODE = 20;

/**
 * Tried in this order, each launched by `channel`, which names a browser already on the machine:
 * playwright-core then never downloads anything. The order mirrors the render engine's, so an OK
 * here predicts a render that starts, not merely a browser that exists somewhere.
 */
const CHANNELS = ["msedge", "chrome", "msedge-beta", "chrome-beta"];

/** A channel whose executable is absent fails in milliseconds; only a wedged browser reaches this. */
const LAUNCH_TIMEOUT_MS = 20_000;

/**
 * The `url("fonts/<file>")` of each @font-face in the template. The template, not a hardcoded
 * list, is what the render will actually ask for, so it is the source of what must be present.
 */
const FONT_URL = /url\(\s*["']?fonts\/([^"')]+)["']?\s*\)/g;

const HELP = `Xenth AI doctor — the local health checks nothing else runs, one line per check.

  node bin/doctor.mjs [--json] [--help]

CHECKS, IN ORDER
  node      Node ${MIN_NODE} or later.
  company   .company.json found up the tree and valid for this plugin — or clearly "no company bound".
  browser   a system browser playwright-core can launch, trying ${CHANNELS.join(", ")} and keeping
            the first that opens. Launched and closed once. Never downloads a browser.
  fonts     every font file template.html declares is present under capabilities/social/engine/fonts,
            and every bundled face carries its OFL-*.txt licence text.
  engine    template.html present; formats.json present, parses, and names at least one render target.
  journal   the journal directory accepts an append: one "health" row summarising this run is written,
            as status codes, never as paths.

STATUS
  OK    the check passed.
  FAIL  the check ran and found a defect; the reason says what.
  SKIP  the check could not run; the reason says why. Today only "no company bound".

EXIT CODES
  0  every check is OK.
  1  at least one check is FAIL or SKIP — a doctor that could not verify something does not report clean.
  2  could not start: bad argument, or an internal failure printed on stderr.

WHAT THIS DOES NOT CHECK
  Connectors. A CLI has no credentials, so the store round trips — read, write and trash, comments,
  public link — are walked in a session by the doctor skill: skills/doctor/SKILL.md.
`;

const firstLine = (text) => String(text ?? "").split("\n")[0].slice(0, 160);

const decode = (text) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
};

/**
 * `code` is the only part of a check that reaches the journal. A reason carries local paths and
 * error text; the row travels to the client's store, so the row gets the status and a short token.
 */
const result = (name, status, reason, token = null, data = null) => ({
  name,
  status,
  reason,
  code: `${name}:${status.toLowerCase()}${token ? `(${token})` : ""}`,
  data,
});

const checkNode = () => {
  const version = `v${process.versions.node}`;
  const major = Number.parseInt(process.versions.node, 10);
  return major >= MIN_NODE
    ? result("node", "OK", `${version} (${MIN_NODE} or later required)`, version, { version })
    : result("node", "FAIL", `${version} is older than Node ${MIN_NODE}, which the plugin requires`, version, { version });
};

/**
 * Absence is a normal state — the plugin is usable outside an engagement, and lib/company.mjs says
 * callers must never treat it as an error — so it is a SKIP with its reason. A manifest that exists
 * and does not validate is a defect somebody has to fix, so it is a FAIL.
 */
/**
 * Values a `store.root` can hold that pass every structural check and fail at the first write: the
 * template's own placeholder, an empty string, or the bootstrap's deliberate null. `readCompany`
 * validates that `store` exists, not what is in it, so without this an install where the operator
 * copied the template and forgot one line reports healthy and fails at the first delivery — the
 * exact class of failure this tool exists to find two minutes after install instead.
 */
const UNSET_ROOT = new Set(["", "ID-DE-LA-CARPETA-RAIZ", "ID-DE-LA-CARPETA-RAÍZ", "TODO", "null"]);

const checkCompany = (cwd) => {
  const ctx = readCompany(cwd);
  if (ctx.ok) {
    const { id, name, store } = ctx.company;
    const root = store?.root;
    if (root === null || root === undefined || UNSET_ROOT.has(String(root).trim())) {
      return result(
        "company",
        "FAIL",
        `${name} (${id}) is bound but store.root is not set (${JSON.stringify(root)}). Nothing can be written to the company's store until it holds the folder id. If company-new is mid-bootstrap this is expected; finish it`,
        "unset-store-root",
        { id, name, path: ctx.path }
      );
    }
    if (/^https?:\/\//.test(String(root)) || String(root).includes("/")) {
      return result(
        "company",
        "FAIL",
        `${name} (${id}) has a URL or path in store.root (${root}). It must be the folder id alone — a name or a link never proves identity, and the id is what the guard compares against`,
        "store-root-not-an-id",
        { id, name, path: ctx.path }
      );
    }
    /**
     * `locale` was declared in every manifest and read by nothing, which is worse than not having
     * the field: it looks like a control and is decoration. Every client-facing part of this plugin
     * is Spanish by construction — the scaffolds, the report templates, `bin/report.mjs`'s own
     * prose, and `bin/legible.mjs`, whose scale, syllable rules and bands are Spanish-only. A
     * manifest declaring `en-US` would still produce Spanish documents while claiming otherwise.
     *
     * So the field now gates rather than describes. The day a non-Spanish client arrives, this
     * refusal names exactly what has to be built instead of letting the engagement start on a
     * promise the toolchain cannot keep.
     */
    const locale = ctx.company.locale;
    if (typeof locale !== "string" || !/^es(-|$)/i.test(locale)) {
      return result(
        "company",
        "FAIL",
        `${name} (${id}) declares locale ${JSON.stringify(locale)}. Every client-facing part of this plugin is Spanish by construction — the scaffolds, the report templates and the readability index, whose scale and syllable rules are Spanish-only. A non-Spanish locale would produce Spanish documents while the manifest claimed otherwise, so it is refused rather than ignored`,
        "unsupported-locale",
        { id, name, path: ctx.path, locale: locale ?? null }
      );
    }
    return result("company", "OK", `${name} (${id}) bound by ${ctx.path}, store ${root}, locale ${locale}`, null, { id, name, path: ctx.path, locale });
  }
  if (ctx.reason === "no-manifest") {
    return result(
      "company",
      "SKIP",
      `no company bound: no .company.json in ${cwd} or any parent. Local checks only; the connector round trips need a bound company`,
      "no-manifest"
    );
  }
  const reasons = {
    "unreadable-manifest": `${ctx.path} is not valid JSON (${firstLine(ctx.detail)})`,
    "incomplete-manifest": `${ctx.path} is missing ${(ctx.missing ?? []).join(", ")}`,
    "future-schema": `${ctx.path} declares schema_version ${ctx.found}; this plugin understands ${SCHEMA}. A newer plugin wrote it — refuse rather than guess`,
  };
  return result("company", "FAIL", reasons[ctx.reason] ?? `${ctx.path ?? cwd}: ${ctx.reason}`, ctx.reason, { path: ctx.path ?? null });
};

const checkBrowser = async () => {
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch (err) {
    return result(
      "browser",
      "FAIL",
      `playwright-core is not installed (${firstLine(err.message)}); run "npm install --ignore-scripts" in the plugin root`,
      "no-playwright-core"
    );
  }
  const tried = [];
  for (const channel of CHANNELS) {
    try {
      const browser = await chromium.launch({ channel, timeout: LAUNCH_TIMEOUT_MS });
      const version = browser.version();
      await browser.close();
      const after = tried.length ? ` after ${tried.map((t) => t.channel).join(", ")} failed` : "";
      return result("browser", "OK", `${channel} ${version} launched and closed${after}`, channel, { channel, version, tried });
    } catch (err) {
      tried.push({ channel, error: firstLine(err.message) });
    }
  }
  return result(
    "browser",
    "FAIL",
    `no system browser could be launched (tried ${CHANNELS.join(", ")}). Install Microsoft Edge or Google Chrome; the render engine drives the same channels, and nothing here downloads one`,
    "none",
    { tried }
  );
};

/** SIL OFL 1.1 lets a face ship with software only if its licence text travels with it. */
const licenceFor = (file) => `OFL-${file.replace(/\[.*$|\.ttf$/gi, "")}.txt`;

const checkFonts = () => {
  let declared;
  try {
    declared = [...readFileSync(TEMPLATE, "utf8").matchAll(FONT_URL)].map((m) => decode(m[1]));
  } catch (err) {
    return result("fonts", "FAIL", `cannot read ${TEMPLATE} to learn which faces the render needs (${firstLine(err.message)})`, "no-template");
  }
  if (!declared.length) {
    return result(
      "fonts",
      "FAIL",
      `${TEMPLATE} declares no fonts/ url, so what the render needs cannot be verified — a check that cannot see is not a check`,
      "none-declared"
    );
  }
  const bundled = existsSync(FONTS) ? readdirSync(FONTS).filter((f) => /\.ttf$/i.test(f)) : [];
  const missing = [
    ...declared.filter((f) => !existsSync(join(FONTS, f))),
    ...[...new Set([...declared, ...bundled].map(licenceFor))].filter((l) => !existsSync(join(FONTS, l))),
  ];
  if (missing.length) {
    const token = missing.slice(0, 3).join(",") + (missing.length > 3 ? `+${missing.length - 3}` : "");
    return result("fonts", "FAIL", `missing under ${FONTS}: ${missing.join(", ")}`, token, { declared, bundled, missing });
  }
  return result(
    "fonts",
    "OK",
    `${declared.length} faces declared by template.html present with their OFL text: ${declared.join(", ")}`,
    String(declared.length),
    { declared, bundled }
  );
};

const checkEngine = () => {
  const problems = [];
  const codes = [];
  let templateBytes = null;
  try {
    templateBytes = statSync(TEMPLATE).size;
    if (!templateBytes) {
      problems.push("template.html is empty");
      codes.push("template-empty");
    }
  } catch {
    problems.push("template.html is missing");
    codes.push("template-missing");
  }
  let targets = [];
  try {
    const spec = JSON.parse(readFileSync(FORMATS, "utf8"));
    targets = Object.keys(spec.render_targets ?? {}).filter((k) => !k.startsWith("$"));
    if (!targets.length) {
      problems.push("formats.json names no render_targets");
      codes.push("formats-no-targets");
    }
  } catch (err) {
    if (existsSync(FORMATS)) {
      problems.push(`formats.json does not parse (${firstLine(err.message)})`);
      codes.push("formats-unparseable");
    } else {
      problems.push("formats.json is missing");
      codes.push("formats-missing");
    }
  }
  if (problems.length) {
    return result("engine", "FAIL", `${problems.join("; ")} under ${ENGINE}`, codes.join("+"), { templateBytes, targets });
  }
  return result(
    "engine",
    "OK",
    `template.html ${templateBytes} B; formats.json parses with ${targets.length} render targets: ${targets.join(", ")}`,
    String(targets.length),
    { templateBytes, targets }
  );
};

/**
 * Runs last, so the row it appends can summarise the run. The row is the point as much as the
 * write test is: a client's setup gets diagnosed later from its own journal, without a call.
 */
const checkJournal = (checks) => {
  const failed = checks.some((c) => c.status === "FAIL");
  try {
    const file = record({
      event: EVENTS.HEALTH,
      actor: "system",
      capability: "doctor",
      why: "health check of this machine",
      result: failed ? "error" : "ok",
      detail: checks.map((c) => c.code).join(" "),
    });
    const last = JSON.parse(readFileSync(file, "utf8").trimEnd().split("\n").at(-1));
    if (last.event !== EVENTS.HEALTH) throw new Error(`the last row reads "${last.event}", not "${EVENTS.HEALTH}"`);
    return result("journal", "OK", `health row appended to ${file}`, null, { file });
  } catch (err) {
    return result("journal", "FAIL", `could not append a health row to the journal (${firstLine(err.message)})`, "append-failed");
  }
};

const parseArgs = (argv) => {
  const args = { json: false, help: false, unknown: [] };
  for (const token of argv) {
    if (token === "--json") args.json = true;
    else if (token === "--help") args.help = true;
    else args.unknown.push(token);
  }
  return args;
};

const lines = (checks) => checks.map((c) => `${c.status.padEnd(5)} ${c.name.padEnd(8)} ${c.reason}`).join("\n");

/**
 * Exits only once stdout has drained. On Windows a pipe write is asynchronous, and exiting right
 * after it truncates the JSON a caller is about to parse.
 */
const finish = (text, code) => process.stdout.write(text, () => process.exit(code));

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return finish(HELP, 0);
  if (args.unknown.length) {
    process.stderr.write(`unknown option(s): ${args.unknown.join(" ")}\n`);
    return finish(HELP, 2);
  }

  const cwd = process.cwd();
  const checks = [checkNode(), checkCompany(cwd), await checkBrowser(), checkFonts(), checkEngine()];
  checks.push(checkJournal(checks));

  const summary = {
    ok: checks.filter((c) => c.status === "OK").length,
    failed: checks.filter((c) => c.status === "FAIL").length,
    skipped: checks.filter((c) => c.status === "SKIP").length,
  };
  const allOk = summary.ok === checks.length;
  const text = args.json
    ? JSON.stringify({ plugin: PLUGIN_VERSION, cwd, ok: allOk, summary, checks }, null, 2) + "\n"
    : `${lines(checks)}\n\nxenthai ${PLUGIN_VERSION} — ${summary.ok} ok, ${summary.failed} failed, ${summary.skipped} skipped\n`;
  return finish(text, allOk ? 0 : 1);
};

main().catch((err) => {
  process.stderr.write(`doctor failed: ${err && err.stack ? err.stack : err}\n`);
  process.exit(2);
});
