import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DOCTOR = join(ROOT, "bin", "doctor.mjs");
const SANDBOX = join(HERE, "sandbox", "doctor");
const BOUND = join(SANDBOX, "bound");
const FUTURE = join(SANDBOX, "future");
const UNBOUND = join(SANDBOX, "unbound");
const DATA = join(SANDBOX, "plugin-data");
const BROKEN = join(SANDBOX, "broken-plugin");

const CHANNELS = ["msedge", "chrome", "msedge-beta", "chrome-beta"];
const LOCAL = ["node", "browser", "fonts", "engine", "journal"];

const manifest = (id, name, schema) =>
  JSON.stringify(
    { schema_version: schema, id, name, timezone: "America/Mexico_City", store: { kind: "drive", root: "1DOCTORROOTXXXXXXXXXXXXXXXXXXXXXX" } },
    null,
    2
  );

const setup = () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  for (const dir of [BOUND, FUTURE, UNBOUND, DATA]) mkdirSync(dir, { recursive: true });
  writeFileSync(join(BOUND, ".company.json"), manifest("co-doc-0001", "Doctor Co", 1));
  writeFileSync(join(FUTURE, ".company.json"), manifest("co-doc-0099", "Future Co", 99));
};

/**
 * A damaged copy of the plugin, placed INSIDE the real tree so that a bare `playwright-core` import
 * still resolves up to the real node_modules without a symlink. One declared face and one licence
 * text are removed and formats.json is truncated, so the fonts and engine checks have a defect to find.
 */
const brokenPlugin = () => {
  const engine = "capabilities/social/engine";
  for (const rel of ["bin/doctor.mjs", "lib/company.mjs", "lib/journal.mjs", ".claude-plugin/plugin.json", `${engine}/template.html`]) {
    mkdirSync(dirname(join(BROKEN, rel)), { recursive: true });
    copyFileSync(join(ROOT, rel), join(BROKEN, rel));
  }
  cpSync(join(ROOT, engine, "fonts"), join(BROKEN, engine, "fonts"), { recursive: true });
  const ttfs = readdirSync(join(BROKEN, engine, "fonts")).filter((f) => /\.ttf$/i.test(f)).sort();
  const removedFont = ttfs[0];
  const removedLicence = `OFL-${ttfs[1].replace(/\[.*$|\.ttf$/gi, "")}.txt`;
  rmSync(join(BROKEN, engine, "fonts", removedFont));
  rmSync(join(BROKEN, engine, "fonts", removedLicence));
  writeFileSync(join(BROKEN, engine, "formats.json"), '{ "render_targets": { "square": ');
  return { removedFont, removedLicence, script: join(BROKEN, "bin", "doctor.mjs") };
};

const doctor = (cwd, args = [], script = DOCTOR) => {
  const res = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PLUGIN_DATA: DATA },
    timeout: 120_000,
  });
  let json = null;
  try {
    json = JSON.parse(res.stdout);
  } catch {}
  const by = Object.fromEntries((json?.checks ?? []).map((c) => [c.name, c]));
  return { code: res.status, out: res.stdout ?? "", err: res.stderr ?? "", json, by };
};

const statuses = (by) => ["node", "company", ...LOCAL.slice(1)].map((n) => `${n}=${by[n]?.status ?? "?"}`).join(" ");

const rows = (dir) => {
  const month = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" }).format(new Date()).slice(0, 7);
  const file = join(dir, "journal", "execution", `${month}.jsonl`);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("--help exits 0 and names the options, statuses and exit codes", () => {
  const r = doctor(BOUND, ["--help"]);
  return [r.code === 0 && /--json/.test(r.out) && /SKIP/.test(r.out) && /EXIT CODES/.test(r.out), `exit ${r.code}`];
});

check("an unknown option is refused with exit 2", () => {
  const r = doctor(BOUND, ["--jsno"]);
  return [r.code === 2 && /unknown option/.test(r.err), `exit ${r.code}`];
});

/**
 * A manifest whose `store.root` holds the given value. `readCompany` validates that `store` exists,
 * not what is in it, so these are the bindings that look healthy and fail at the first write.
 */
const withRoot = (dir, root) => {
  const path = join(SANDBOX, dir);
  mkdirSync(path, { recursive: true });
  writeFileSync(
    join(path, ".company.json"),
    JSON.stringify({ schema_version: 1, id: `co-${dir}`, name: `Co ${dir}`, store: { kind: "drive", root } }, null, 2)
  );
  return path;
};

check("the template's own placeholder in store.root is a FAIL, not a healthy install", () => {
  const r = doctor(withRoot("placeholder", "ID-DE-LA-CARPETA-RAIZ"), ["--json"]);
  const c = r.by.company;
  return [
    c?.status === "FAIL" && c?.code === "company:fail(unset-store-root)" && r.code === 1,
    `${c?.code}; exit ${r.code}`,
  ];
});

check("a null store.root — the bootstrap's own midpoint — is a FAIL that says how to finish it", () => {
  const r = doctor(withRoot("bootstrapping", null), ["--json"]);
  const c = r.by.company;
  const explains = /company-new/.test(c?.reason ?? "");
  return [
    c?.code === "company:fail(unset-store-root)" && explains,
    `${c?.code}; names the skill mid-bootstrap: ${explains}`,
  ];
});

check("a link or a path in store.root is a FAIL, because a name never proves identity", () => {
  const r = doctor(withRoot("linked", "https://drive.google.com/drive/folders/1ABC"), ["--json"]);
  const c = r.by.company;
  return [c?.code === "company:fail(store-root-not-an-id)", `${c?.code}`];
});

check("a real folder id passes and is echoed, so the operator can compare it against the store", () => {
  const r = doctor(withRoot("goodroot", "1REALFOLDERID000000000000000000000"), ["--json"]);
  const c = r.by.company;
  const echoed = /1REALFOLDERID/.test(c?.reason ?? "");
  return [c?.status === "OK" && echoed, `status=${c?.status}; id echoed: ${echoed}`];
});

check("a valid manifest on a healthy machine: every check OK, exit 0", () => {
  const r = doctor(BOUND, ["--json"]);
  const allOk = ["company", ...LOCAL].every((n) => r.by[n]?.status === "OK");
  return [
    r.code === 0 && r.json?.ok === true && allOk && r.by.company?.data?.id === "co-doc-0001" && CHANNELS.includes(r.by.browser?.data?.channel),
    `exit ${r.code}; ${statuses(r.by)}; channel=${r.by.browser?.data?.channel}`,
  ];
});

check("that run left exactly one health row in the bound company's journal: codes only, no paths", () => {
  const all = rows(BOUND);
  const row = all.at(-1);
  const detail = row?.detail ?? "";
  return [
    all.length === 1 &&
      row.event === "health" &&
      row.actor === "system" &&
      row.company === "co-doc-0001" &&
      row.capability === "doctor" &&
      row.result === "ok" &&
      /company:ok/.test(detail) &&
      /browser:ok\(/.test(detail) &&
      !/[\\/]/.test(detail),
    `rows=${all.length} result=${row?.result} detail=${detail}`,
  ];
});

check("a manifest from a newer plugin (schema_version 99) FAILS the company check and exits 1", () => {
  const r = doctor(FUTURE, ["--json"]);
  const said = r.by.company?.reason ?? "";
  const othersOk = LOCAL.every((n) => r.by[n]?.status === "OK");
  return [
    r.code === 1 && r.json?.ok === false && r.by.company?.status === "FAIL" && /schema_version 99/.test(said) && /understands 1/.test(said) && othersOk && r.json?.summary?.failed === 1,
    `exit ${r.code}; ${statuses(r.by)}; said "${said.slice(-60)}"`,
  ];
});

check("that failure is journaled as an error where an unbound run lands, never inside the broken company", () => {
  const row = rows(DATA).at(-1);
  return [
    row?.event === "health" && row.result === "error" && row.company === null && /company:fail\(future-schema\)/.test(row.detail) && rows(FUTURE).length === 0,
    `result=${row?.result} company=${row?.company} detail=${row?.detail}`,
  ];
});

check("no company bound: company SKIP, the local checks still run, exit 1", () => {
  const r = doctor(UNBOUND, ["--json"]);
  const localsOk = LOCAL.every((n) => r.by[n]?.status === "OK");
  return [
    r.code === 1 && r.by.company?.status === "SKIP" && /no company bound/.test(r.by.company?.reason ?? "") && localsOk && r.json?.summary?.skipped === 1 && r.json?.summary?.failed === 0,
    `exit ${r.code}; ${statuses(r.by)}`,
  ];
});

check("text mode prints one status line per check and a summary", () => {
  const r = doctor(UNBOUND);
  const lines = r.out.trim().split("\n");
  const statusLines = lines.filter((l) => /^(OK|FAIL|SKIP)\s+\w+\s+\S/.test(l));
  return [
    r.code === 1 && statusLines.length === 6 && /^SKIP\s+company\s+no company bound/m.test(r.out) && /xenthai \S+ — 5 ok, 0 failed, 1 skipped$/m.test(r.out),
    `exit ${r.code}; status lines=${statusLines.length}; last="${lines.at(-1)}"`,
  ];
});

check("a plugin copy missing a font, a licence text and a parseable formats.json FAILS fonts and engine", () => {
  const { removedFont, removedLicence, script } = brokenPlugin();
  const r = doctor(BOUND, ["--json"], script);
  const fontsSaid = r.by.fonts?.reason ?? "";
  return [
    r.code === 1 &&
      r.by.fonts?.status === "FAIL" &&
      fontsSaid.includes(removedFont) &&
      fontsSaid.includes(removedLicence) &&
      r.by.engine?.status === "FAIL" &&
      /formats\.json does not parse/.test(r.by.engine?.reason ?? "") &&
      ["node", "company", "browser", "journal"].every((n) => r.by[n]?.status === "OK") &&
      r.json?.summary?.failed === 2,
    `exit ${r.code}; ${statuses(r.by)}; fonts named ${removedFont}: ${fontsSaid.includes(removedFont)}, ${removedLicence}: ${fontsSaid.includes(removedLicence)}`,
  ];
});

check("that broken run is journaled as an error naming both failed checks", () => {
  const all = rows(BOUND);
  const row = all.at(-1);
  return [
    all.length === 2 && row.result === "error" && /fonts:fail\(/.test(row.detail) && /engine:fail\(formats-unparseable\)/.test(row.detail),
    `rows=${all.length} result=${row?.result} detail=${row?.detail}`,
  ];
});

setup();
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
if (!failed) rmSync(SANDBOX, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
