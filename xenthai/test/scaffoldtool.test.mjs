import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

/**
 * `tools/scaffold.mjs` — the command that replaced "create it from the scaffold" as prose.
 *
 * The suite is deliberately about the two properties the prose could not carry: a document that
 * either exists afterwards or produced a non-zero exit, and a refusal to write over anything. The
 * second is the one with a client's work behind it.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SCAFFOLD = join(ROOT, "scaffold", "company");
const SANDBOX = join(HERE, "sandbox", "scaffoldtool");
const TOOL = join(ROOT, "tools", "scaffold.mjs");

const run = (...args) => {
  const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf8", cwd: SANDBOX });
  return { code: r.status, out: r.stdout ?? "", err: r.stderr ?? "" };
};

const company = (name, { manifest = true } = {}) => {
  const dir = join(SANDBOX, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  if (manifest) {
    writeFileSync(
      join(dir, ".company.json"),
      JSON.stringify({
        schema_version: 1,
        id: `${name}-1`,
        name: "Refaccionaria Álvarez",
        locale: "es-MX",
        store: { kind: "drive", root: "1AAA" },
      })
    );
  }
  return dir;
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("--help exits 0, because a caller reads a non-zero exit as a broken tool", () => {
  const r = run("--help");
  return [r.code === 0 && /--document/.test(r.out), `exit ${r.code}`];
});

check("--list names exactly the scaffolds that ship", () => {
  const r = run("--list");
  const listed = r.out.trim().split("\n").sort();
  const onDisk = readdirSync(SCAFFOLD, { recursive: true })
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.split(sep).join("/"))
    .sort();
  return [
    r.code === 0 && JSON.stringify(listed) === JSON.stringify(onDisk),
    `${listed.length} listed, ${onDisk.length} on disk`,
  ];
});

/**
 * The failure the tool exists for. `company-new` instructs `09-rutinas.md` in bold and `status`
 * reports it as owed, and it was still skipped in a first session and stayed missing for two days.
 */
check("09-rutinas.md is written into the engagement folder, with the company's real name", () => {
  const dir = company("nueva");
  const r = run("--document", "mapeo-empresa/09-rutinas.md", "--company", dir);
  const target = join(dir, "mapeo-Refaccionaria Álvarez", "09-rutinas.md");
  const text = existsSync(target) ? readFileSync(target, "utf8") : "";
  return [
    r.code === 0 && text.startsWith("# 09-rutinas (A7 §S5) — RUTINAS — Refaccionaria Álvarez") && !text.includes("<empresa>"),
    `exit ${r.code}; first line "${text.split("\n")[0]}"`,
  ];
});

/**
 * A scaffold written over an existing file destroys the only copy of somebody's work, and no later
 * session can tell it happened. `company-new` and `company-intake` both state that as absolute;
 * this is where it is enforced rather than asserted, so the case checks the bytes, not the exit.
 */
check("an existing document is never overwritten, and the exit says so", () => {
  const dir = company("heredada");
  const theirs = "# RUTINAS — trabajo previo del cliente\n\nEsto lo escribió alguien más.\n";
  mkdirSync(join(dir, "mapeo-Refaccionaria Álvarez"), { recursive: true });
  writeFileSync(join(dir, "mapeo-Refaccionaria Álvarez", "09-rutinas.md"), theirs, "utf8");
  const r = run("--document", "mapeo-empresa/09-rutinas.md", "--company", dir);
  const after = readFileSync(join(dir, "mapeo-Refaccionaria Álvarez", "09-rutinas.md"), "utf8");
  return [
    r.code === 1 && after === theirs && /already exists/.test(r.err),
    `exit ${r.code}; bytes intact: ${after === theirs}`,
  ];
});

check("--json reports the refusal as data, not only as an exit code", () => {
  const dir = company("json-heredada");
  mkdirSync(join(dir, "comunicacion"), { recursive: true });
  writeFileSync(join(dir, "comunicacion", "PROOF.md"), "previo\n", "utf8");
  const r = run("--document", "comunicacion/PROOF.md", "--company", dir, "--json");
  let parsed = {};
  try {
    parsed = JSON.parse(r.out);
  } catch {}
  return [r.code === 1 && parsed.written === false && parsed.reason === "exists", `exit ${r.code}; ${r.out.trim().slice(0, 60)}`];
});

/**
 * `--document` is compared against the shipped listing rather than sanitised, so nothing outside
 * `scaffold/company` can be read and nothing outside the engagement folder can be written.
 */
check("a path in --document is refused rather than escaping either directory", () => {
  const dir = company("traversal");
  const r = run("--document", "../../lib/company.mjs", "--company", dir);
  const escaped = existsSync(join(dir, "..", "..", "lib", "company.mjs.copy"));
  return [r.code === 2 && !escaped && /no scaffold named/.test(r.err), `exit ${r.code}`];
});

check("no company bound and no --company exits 2 with a usable message", () => {
  const r = run("--document", "mapeo-empresa/09-rutinas.md");
  return [r.code === 2 && /no company bound/.test(r.err), `exit ${r.code}; ${r.err.trim().slice(0, 50)}`];
});

check("an unknown option is refused instead of being ignored", () => {
  const dir = company("opcion");
  const r = run("--document", "mapeo-empresa/09-rutinas.md", "--company", dir, "--overwrite");
  return [r.code === 2 && !existsSync(join(dir, "mapeo-Refaccionaria Álvarez", "09-rutinas.md")), `exit ${r.code}`];
});

/**
 * The document is written locally; the client's copy still goes through a connector in a session,
 * because a CLI holds no credentials. A session that believes otherwise reports a delivery that
 * never reached the store, which is the failure this line prevents.
 */
check("the help says the store copy is still the session's job", () => {
  const r = run("--help");
  return [/no\s+connector credentials/.test(r.out.replace(/\n/g, " ")), r.out.includes("connector") ? "stated" : "missing"];
});

/**
 * The skill that owes `ROUTINES.md` has to name the command, or the prose failure returns in a
 * different shape: an instruction nobody can tell was skipped.
 */
check("company-new invokes the tool rather than describing the copy", () => {
  const skill = readFileSync(join(ROOT, "skills", "company-new", "SKILL.md"), "utf8");
  return [
    /tools\/scaffold\.mjs" --document mapeo-empresa\/09-rutinas\.md/.test(skill),
    skill.includes("scaffold.mjs") ? "named" : "still prose only",
  ];
});

rmSync(SANDBOX, { recursive: true, force: true });
mkdirSync(SANDBOX, { recursive: true });

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
