import { readdirSync, existsSync, mkdirSync, rmSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SCAFFOLD = join(ROOT, "scaffold", "company");
const SANDBOX = join(HERE, "sandbox", "status");
const TOOL = join(ROOT, "bin", "status.mjs");

const docs = readdirSync(SCAFFOLD).filter((f) => f.endsWith(".md"));
const skills = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const run = (...args) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
};

/**
 * A company directory holding the named scaffolds and a valid manifest. Built per case so a case
 * cannot see another's leftovers — the deterministic race that cost a debugging session once.
 */
const company = (name, files) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({ schema_version: 1, id: `${name}-1`, name: `Prueba ${name}`, store: { kind: "drive", root: "1AAA" } })
  );
  for (const f of files) copyFileSync(join(SCAFFOLD, f), join(dir, f));
  return dir;
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("--help exits 0, because a caller reads a non-zero exit as a broken tool", () => {
  const r = run("--help");
  return [r.code === 0 && /status/i.test(r.out), `exit ${r.code}, ${r.out.length} bytes of help`];
});

check("every scaffold on disk has an owning phase", () => {
  const r = run("--company", company("full", docs), "--json");
  const report = JSON.parse(r.out);
  return [
    report.unowned.length === 0,
    report.unowned.length
      ? `no phase fills: ${report.unowned.join(", ")} — a field nobody owns stays pending forever`
      : `${report.report.length} documents, all owned`,
  ];
});

check("every owning phase named is a skill that exists", () => {
  const r = run("--company", company("owners", docs), "--json");
  const report = JSON.parse(r.out);
  const named = new Set(report.report.flatMap((d) => d.owedBy ?? []));
  const ghosts = [...named].filter((n) => !n.includes(" ") && !skills.includes(n));
  return [
    ghosts.length === 0,
    ghosts.length ? `owner map names skills that do not exist: ${ghosts.join(", ")}` : `${named.size} owners, all real`,
  ];
});

check("a complete set of documents exits 0", () => {
  const r = run("--company", company("complete", docs));
  return [r.code === 0, `exit ${r.code} with ${docs.length} documents present`];
});

check("a missing document exits 1, because a missing document is a phase that never ran", () => {
  const r = run("--company", company("partial", ["BRAND.md", "PEOPLE.md"]));
  return [r.code === 1 && /AUSENTE/.test(r.out), `exit ${r.code}; reports AUSENTE: ${/AUSENTE/.test(r.out)}`];
});

check("a fresh company reports pending fields rather than zero work", () => {
  const r = run("--company", company("fresh", docs), "--json");
  const report = JSON.parse(r.out);
  return [
    report.totalPending > 100,
    `${report.totalPending} pending fields across ${report.report.length} documents`,
  ];
});

check("--pending names the field, not only the count", () => {
  const r = run("--company", company("labels", ["PEOPLE.md"]), "--pending");
  const bullets = (r.out.match(/^\s+·\s+\S/gm) ?? []).length;
  return [bullets > 0, `${bullets} field labels listed`];
});

check("no company bound and no --company exits 1 with a usable message", () => {
  const r = spawnSync(process.execPath, [TOOL], { encoding: "utf8", cwd: HERE });
  const usable = /--company/.test(r.stderr);
  return [r.status === 1 && usable, `exit ${r.status}; suggests --company: ${usable}`];
});

check("the owner map covers exactly the scaffolds on disk, in both directions", () => {
  const r = run("--company", company("cover", docs), "--json");
  const report = JSON.parse(r.out);
  const covered = report.report.map((d) => d.document).sort();
  const onDisk = [...docs].sort();
  const same = covered.join(",") === onDisk.join(",");
  return [same, same ? `${covered.length} documents match` : `report ${covered.length} vs disk ${onDisk.length}`];
});

check("a new scaffold with no owner would be reported as a plugin defect", () => {
  const dir = company("ghost", ["BRAND.md"]);
  writeFileSync(join(dir, "GHOST.md"), "# Ghost\n\n**Esquema:** 1\n\n— pendiente —\n");
  copyFileSync(join(dir, "GHOST.md"), join(SCAFFOLD, "GHOST.md"));
  try {
    const r = run("--company", dir, "--json");
    const report = JSON.parse(r.out);
    return [
      report.unowned.includes("GHOST.md") && r.code === 1,
      `unowned: ${report.unowned.join(", ") || "none"} — the tool refuses a document no phase fills`,
    ];
  } finally {
    rmSync(join(SCAFFOLD, "GHOST.md"), { force: true });
  }
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
rmSync(SANDBOX, { recursive: true, force: true });
if (existsSync(join(SCAFFOLD, "GHOST.md"))) rmSync(join(SCAFFOLD, "GHOST.md"));
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed  (${docs.length} documents, ${skills.length} skills)`);
process.exit(failed ? 1 : 0);
