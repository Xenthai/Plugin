#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany, MANIFEST_ENV, EPHEMERAL, SCHEMA, KINDS, STORE_KINDS, kindOf, isPersonal, storeKindOf } from "../lib/company.mjs";
import { EVENTS, PLUGIN_VERSION, record } from "../lib/journal.mjs";
import { allMonths } from "./journal-sync.mjs";

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

  node tools/doctor.mjs [--json] [--help]

CHECKS, IN ORDER
  node      Node ${MIN_NODE} or later.
  company   .company.json found up the tree and valid for this plugin — or clearly "no company bound".
  browser   a system browser playwright-core can launch, trying ${CHANNELS.join(", ")} and keeping
            the first that opens. Launched and closed once. Never downloads a browser.
  fonts     every font file template.html declares is present under capabilities/social/engine/fonts,
            and every bundled face carries its OFL-*.txt licence text.
  engine    template.html present; formats.json present, parses, and names at least one render target.
  sync      the journal rows on this machine are also in the company's store. FAILS on a closed
            month that was never uploaded, and on an ephemeral binding whose month has no revision
            at all or whose newest one is over a day old. A session's own tail is reported, never
            failed: staging writes a row, so a rule failing on one row could never go green.
  journal   the journal directory accepts an append: one "health" row summarising this run is
            written last, as status codes, never as paths, so it can summarise the whole run.

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
    /**
     * A Drive root is an opaque id and anything with a slash in it is a link or a name somebody
     * pasted instead. A OneDrive root may legitimately be a Graph path (`/drive/root:/Clientes/Acme`),
     * which is stable and checkable by prefix, so only a URL is refused there.
     */
    const pathAllowed = storeKindOf(ctx.company) === "onedrive";
    if (/^https?:\/\//.test(String(root)) || (!pathAllowed && String(root).includes("/"))) {
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
     * is Spanish by construction — the scaffolds, the report templates, `tools/report.mjs`'s own
     * prose, and `tools/legible.mjs`, whose scale, syllable rules and bands are Spanish-only. A
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
    /**
     * The one placement `company-new` forbids, and the one environment that leaves no alternative.
     * The guard resolves a company by walking up from the session's working directory, and in a
     * cloud container that directory IS the home — so the doctrine's rule and the mechanism
     * disagreed, and the rule lost, silently, in the only environment where it was being broken.
     *
     * It is now keepable two ways and enforced in both: bind explicitly with ${MANIFEST_ENV}, which
     * beats the walk-up and needs no manifest at the home at all, or declare the binding ephemeral
     * in the manifest and accept what that means. Undeclared, it is a defect with a name rather than
     * a rule everybody had already learned to ignore.
     */
    const binding = ctx.binding ?? {};
    if (binding.atHome && !binding.ephemeral) {
      return result(
        "company",
        "FAIL",
        `${name} (${id})'s manifest is at the home directory (${ctx.root}). That is the ambient-authority placement company-new refuses: every session started anywhere under this home binds to this company whether or not anyone meant it. Either point ${MANIFEST_ENV} at a manifest in its own engagement folder, which beats the directory walk, or — in a container whose disk does not survive the session, where there is no other directory — declare "binding": "${EPHEMERAL}" in the manifest and read what that costs in doctor's sync line`,
        "home-manifest-undeclared",
        { id, name, path: ctx.path, root: ctx.root }
      );
    }
    const how =
      (binding.via === "env" ? `declared by ${MANIFEST_ENV}` : `bound by ${ctx.path}`) +
      (binding.ephemeral ? ", EPHEMERAL BINDING — not reusable between sessions: this disk is destroyed when the session ends, so nothing survives it that was not put in the store" : "");
    /**
     * Printed even though `client` is the default, because the whole point of the field is that an
     * operator can see which of the two they are about to write into. A default that stays
     * invisible until it is wrong is the failure this line exists to prevent.
     */
    const kind = kindOf(ctx.company);
    const whose = isPersonal(ctx.company) ? "PERSONAL store — your own material, not a client's" : "client store";
    return result("company", "OK", `${name} (${id}) ${how}, ${whose}, store ${root}, locale ${locale}`, binding.ephemeral ? "ephemeral" : null, {
      id,
      name,
      path: ctx.path,
      kind,
      locale,
      binding,
    });
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
    "declared-manifest-missing": `${MANIFEST_ENV} is set to ${ctx.path} and there is no manifest there. Nothing falls back to the directory walk on purpose: an operator who believes they are bound to one company and is silently bound to another is the one mistake here that is both invisible and permanent`,
    "unreadable-manifest": `${ctx.path} is not valid JSON (${firstLine(ctx.detail)})`,
    "incomplete-manifest": `${ctx.path} is missing ${(ctx.missing ?? []).join(", ")}`,
    "future-schema": `${ctx.path} declares schema_version ${ctx.found}; this plugin understands ${SCHEMA}. A newer plugin wrote it — refuse rather than guess`,
    "unknown-kind": `${ctx.path} declares kind ${JSON.stringify(ctx.found)}; this plugin knows ${[...KINDS].join(" and ")}. It is refused rather than read as a client's store, because a store filed under the wrong kind puts the operator's own material in a client's audit trail, or the reverse`,
    "unknown-store-kind": `${ctx.path} declares store.kind ${JSON.stringify(ctx.found)}; this plugin knows ${[...STORE_KINDS].join(" and ")}. It is refused rather than read as Drive: the connector names, the root's shape and the upload steps all differ per provider`,
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

/**
 * SIL OFL 1.1 lets a face ship with software only if its licence text travels with it.
 *
 * The suffix is stripped as well as the extension because a variable font's file says which axes it
 * carries and its licence covers the family. Upstream writes that as `Archivo[wdth,wght].ttf`; these
 * are renamed because a bracket in a filename has to be percent-encoded in a URL and quoted in a
 * shell, and every consumer that forgets is a silent 404 rather than an error.
 */
const licenceFor = (file) => `OFL-${file.replace(/\[.*$|-variable\.ttf$|\.ttf$/gi, "")}.txt`;

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
 * Whether the rows on this machine are also in the company's store.
 *
 * This is the check that would have caught the failure it exists for. A cloud container's disk is
 * destroyed when the session ends, and the journal is written to it, so three days of an engagement
 * disappeared without any tool noticing — and the two things built on the journal, `opportunities`
 * and the quarterly report, went on refusing for a reason that reads as "this engagement is young"
 * rather than "the history is being deleted".
 *
 * WHEN IT FAILS, and why "any unsynced row" is the wrong rule even here.
 *
 * A sync cannot reach zero and stay there, and the reason is structural rather than sloppy: staging
 * writes a journal row, and so does this very check, one line further down. Any rule that failed on
 * a single outstanding row would therefore be red the moment after it went green — and `company-new`
 * STOPS on a doctor that is not green, so that rule would have made an ephemeral engagement
 * impossible to open at all. A check that cannot be satisfied is not strict; it is broken, and it
 * gets ignored on the day it is right.
 *
 * What actually deserves a failure is a month whose evidence is not in the store AT ALL, and a
 * revision old enough that the rows since it are no longer a session's tail. So:
 *
 * - ephemeral, and a month with rows has no revision → FAIL. This is the observed failure: three
 *   days of an engagement, never uploaded once.
 * - ephemeral, unsynced rows, and the newest revision older than a day → FAIL. On a disk that does
 *   not survive the session, yesterday's revision is not evidence of anything current.
 * - any binding, a CLOSED month unsynced → FAIL. Nothing will add to it, so nothing excuses it.
 * - a durable machine's current month → reported, never failed. Failing there would put every
 *   install that has not uploaded since breakfast in the red.
 */

/** A revision older than this stops covering the rows written after it. One working day. */
const REVISION_STALE_MS = 24 * 60 * 60 * 1000;

const monthIn = (zone) => {
  const fmt = (z) => new Intl.DateTimeFormat("sv-SE", { timeZone: z, dateStyle: "short" }).format(new Date()).slice(0, 7);
  try {
    return fmt(zone || "America/Mexico_City");
  } catch {
    return fmt("America/Mexico_City");
  }
};

const checkSync = (cwd) => {
  const ctx = readCompany(cwd);
  if (!ctx.ok) return result("sync", "SKIP", "no company bound, so there is no store to compare against", "no-company");
  let months;
  try {
    months = allMonths(ctx.root);
  } catch (err) {
    return result("sync", "FAIL", `could not read the journal's sync state (${firstLine(err.message)})`, "unreadable");
  }
  const diverged = months.filter((m) => m.diverged);
  if (diverged.length) {
    return result(
      "sync",
      "FAIL",
      `${diverged.map((m) => m.month).join(", ")}: the rows already uploaded are no longer this month's first rows, so the file was rewritten rather than appended to. Run tools/journal-sync.mjs and read what it says before uploading anything over it`,
      "diverged",
      { months: diverged.map((m) => m.month) }
    );
  }
  const ephemeral = Boolean(ctx.binding?.ephemeral);
  /**
   * The current month in the COMPANY's zone, because that is the zone `lib/journal.mjs` names the
   * file after. Comparing against UTC would call a live month closed for the first hours of every
   * month in a western zone, and fail a durable install for rows it has every right to still hold.
   */
  const current = monthIn(ctx.company?.timezone);
  const stale = (m) => {
    const at = Date.parse(m.lastSyncedAt ?? "");
    return !Number.isFinite(at) || Date.now() - at > REVISION_STALE_MS;
  };
  const unsynced = months.filter((m) => m.owed > 0);
  const owed = unsynced.filter((m) => (m.month < current ? true : ephemeral && stale(m)));
  if (owed.length) {
    const rows = owed.reduce((n, m) => n + m.owed, 0);
    const never = owed.filter((m) => !m.revision).length === owed.length;
    return result(
      "sync",
      "FAIL",
      `${rows} row(s) in ${owed.map((m) => m.month).join(", ")} exist only on this machine. ` +
        (owed.every((m) => m.month < current)
          ? "Those months are closed and nothing will add to them, so there is no reason left for the store not to hold them"
          : never
            ? "This binding is ephemeral and this month has never been uploaded: that disk is destroyed when the session ends, so the engagement's evidence goes with it"
            : "This binding is ephemeral and the last revision is more than a day old, so those rows are no longer a session's tail") +
        ". Run tools/journal-sync.mjs --stage, upload what it names, then --receipt",
      never ? "never-synced" : "owed",
      { months: owed.map((m) => ({ month: m.month, owed: m.owed })) }
    );
  }
  const total = months.reduce((n, m) => n + m.rows, 0);
  const pending = unsynced.reduce((n, m) => n + m.owed, 0);
  return result(
    "sync",
    "OK",
    months.length
      ? `${total} row(s) across ${months.length} month(s), the store has all but ${pending}` +
          (pending
            ? ephemeral
              ? " — this session's tail, and it is lost with the container unless it is staged before the session ends"
              : " from the current month, which is owed at month end"
            : "")
      : "no journal rows recorded yet, so nothing is owed to the store",
    String(months.length),
    { months: months.map((m) => ({ month: m.month, rows: m.rows, synced: m.synced, owed: m.owed })) }
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
  const checks = [checkNode(), checkCompany(cwd), await checkBrowser(), checkFonts(), checkEngine(), checkSync(cwd)];
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
