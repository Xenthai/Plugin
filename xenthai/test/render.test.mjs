import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const ENGINE = join(ROOT, "capabilities", "social", "engine", "render.mjs");
const TEMPLATE = join(HERE, "fixtures", "template.html");
const OUT = join(HERE, "fixtures", "out");

/**
 * The fixture is a bare probe page, not a designed piece, so its fill is legitimately low. The
 * fill assertion is exercised by its own case below rather than by lowering the bar everywhere.
 */
const FIXTURE_MIN_FILL = "10";

const render = (args) =>
  spawnSync(
    process.execPath,
    [ENGINE, "--template", TEMPLATE, "--out", OUT, "--prefix", "fx", "--json", ...args],
    { encoding: "utf8", cwd: ROOT, env: process.env }
  );

const report = (res) => {
  try {
    return JSON.parse(res.stdout);
  } catch {
    return null;
  }
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("a well-formed piece passes every assertion on all four targets", () => {
  const res = render(["--piece", "good", "--expect-font", "Archivo", "--min-fill", FIXTURE_MIN_FILL]);
  const r = report(res);
  return [
    res.status === 0 && r?.failed === 0 && r?.total === 4,
    `exit ${res.status}; ${r?.total - r?.failed}/${r?.total} ok`,
  ];
});

check("dimmed texture inside the keep-out is allowed", () => {
  const res = render([
    "--piece",
    "texture-low",
    "--target",
    "vertical-story",
    "--min-fill",
    FIXTURE_MIN_FILL,
  ]);
  const r = report(res);
  return [res.status === 0 && r?.failed === 0, `exit ${res.status}; failures=${JSON.stringify(r?.report?.[0]?.failures)}`];
});

check("a message-bearing element inside the hard keep-out FAILS", () => {
  const res = render([
    "--piece",
    "bearing-low",
    "--target",
    "vertical-story",
    "--min-fill",
    FIXTURE_MIN_FILL,
  ]);
  const r = report(res);
  const said = (r?.report?.[0]?.failures ?? []).join(" ");
  return [
    res.status === 1 && /hard safe zone/.test(said),
    `exit ${res.status}; reason mentions the hard zone: ${/hard safe zone/.test(said)}`,
  ];
});

check("content taller than the frame FAILS on overflow", () => {
  const res = render(["--piece", "overflowing", "--target", "square", "--min-fill", FIXTURE_MIN_FILL]);
  const r = report(res);
  const said = (r?.report?.[0]?.failures ?? []).join(" ");
  return [res.status === 1 && /overflow/.test(said), `exit ${res.status}; said=${said.slice(0, 70)}`];
});

check("a sparse canvas FAILS the fill floor", () => {
  const res = render(["--piece", "good", "--target", "square", "--min-fill", "65"]);
  const r = report(res);
  const said = (r?.report?.[0]?.failures ?? []).join(" ");
  return [res.status === 1 && /fills only/.test(said), `exit ${res.status}; said=${said.slice(0, 60)}`];
});

check("a wrong expected font FAILS, catching silent substitution", () => {
  const res = render([
    "--piece",
    "good",
    "--target",
    "square",
    "--expect-font",
    "Helvetica Neue",
    "--min-fill",
    FIXTURE_MIN_FILL,
  ]);
  const r = report(res);
  const said = (r?.report?.[0]?.failures ?? []).join(" ");
  return [res.status === 1 && /substituted a font/.test(said), `exit ${res.status}`];
});

check("an exact brand colour is asserted from the real pixel", () => {
  const ok = render([
    "--piece",
    "good",
    "--target",
    "square",
    "--min-fill",
    FIXTURE_MIN_FILL,
    "--expect-color",
    "#dce9ff@120,255",
  ]);
  const bad = render([
    "--piece",
    "good",
    "--target",
    "square",
    "--min-fill",
    FIXTURE_MIN_FILL,
    "--expect-color",
    "#ff0000@120,255",
  ]);
  const saidBad = (report(bad)?.report?.[0]?.failures ?? []).join(" ");
  return [
    ok.status === 0 && bad.status === 1 && /pixel 120,255/.test(saidBad),
    `signal ok exit ${ok.status}; wrong colour exit ${bad.status}`,
  ];
});

check("an unknown render target is refused before any work", () => {
  const res = render(["--target", "instagram-vertical-thing"]);
  return [res.status === 2 && /unknown render target/.test(res.stderr), `exit ${res.status}`];
});

check("a missing template is refused before launching a browser", () => {
  const res = spawnSync(
    process.execPath,
    [ENGINE, "--template", join(HERE, "nope.html"), "--out", OUT],
    { encoding: "utf8", cwd: ROOT }
  );
  return [res.status === 2 && /template not found/.test(res.stderr), `exit ${res.status}`];
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
if (!failed) rmSync(OUT, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
