#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany } from "../lib/company.mjs";
import { STORE_DOCUMENTS, familyPattern, resolveForCompany } from "../lib/store-layout.mjs";

/**
 * Materialises one scaffold into an engagement folder, and refuses to write over anything.
 *
 * Every document in this plugin was created by prose until now — "create it from
 * `scaffold/company/X.md`" — and prose is a step a session can complete without noticing it did
 * not. `ROUTINES.md` is where that cost was paid: `company-new` instructs it in bold, `status`
 * reports it as owed, and it was still skipped in a first session and stayed missing for two days.
 * The document whose entire purpose is that **a routine nobody wrote down cannot be noticed
 * missing** is the one most able to go missing unnoticed, because nothing else names it.
 *
 * So the fix is not more emphasis in the skill. It is a command with an exit code, which either ran
 * or did not.
 *
 * Two properties are load-bearing:
 *
 * It NEVER overwrites. `company-new` and `company-intake` both carry the same absolute rule — a
 * scaffold written over an existing file destroys the only copy of somebody's work and no later
 * session can tell it happened. A rule stated in two skills and enforced in neither is advisory;
 * here it is a refusal, and the refusal is the ordinary outcome on any company whose store already
 * held documents.
 *
 * It writes LOCALLY, never to the store. A CLI holds no connector credentials, so the copy in the
 * client's Drive is still made by the session that runs this. Saying so in the help is the point:
 * the failure this exists to prevent is a session believing a document exists somewhere it does not.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SCAFFOLDS = join(HERE, "..", "scaffold", "company");

/**
 * The family documents (`PXX-nombre.md`, `AXX-nombre.md`) from `lib/store-layout.mjs`, the same
 * table `status.mjs` and `coverage.mjs` read — one file per process or per automation rather than a
 * single file. `--document` for these takes the REAL instance name (`03-procesos/P01-cotizacion.md`);
 * the template supplies the source text and is never written verbatim.
 */
const FAMILY_TEMPLATES = STORE_DOCUMENTS.filter((d) => d.family && !d.templatePath.endsWith("/")).map(
  (d) => ({
    dir: d.templatePath.split("/").slice(0, -1).join("/"),
    template: d.templatePath,
    pattern: familyPattern(d.templatePath),
  })
);

/**
 * The one placeholder a document's own TEXT carries, and the only substitution made in content.
 * Anything else — a date, a person, a cadence — is a fact somebody has to supply, and filling it
 * from a manifest would be inventing it, which is the failure `test/scaffold.test.mjs` exists to
 * catch. Literal `<`/`>` are harmless inside a Markdown file's text; only a path may not carry them.
 */
const COMPANY_PLACEHOLDER = /<empresa>/g;

/**
 * Every scaffold this build ships, as a POSIX relative path from `scaffold/company/` —
 * `mapeo-empresa/00-PERFIL.md`, `comunicacion/BRAND.md` — so the two-folder layout lists and
 * materialises exactly like the flat one it replaced. Family templates (`PXX-nombre.md`,
 * `AXX-nombre.md`) are listed too, as the source a real instance is written from.
 */
const available = () =>
  readdirSync(SCAFFOLDS, { recursive: true })
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.split(sep).join("/"))
    .sort();

/**
 * Resolves `--document` to `{ source, isFamily }`. A name whose directory matches a
 * `FAMILY_TEMPLATES` entry is checked FIRST, and against the template's own bare name refused
 * outright: writing `PXX-nombre.md` verbatim would land a placeholder filename in the store that
 * `tools/status.mjs`'s family pattern can never match, so it silently reports the phase as never
 * run. Any other filename in that directory is a real instance, sourced from the template. A name
 * outside every family directory falls back to an exact match against the singular scaffolds.
 */
const resolveTemplate = (name) => {
  const dir = name.split("/").slice(0, -1).join("/");
  const base = name.split("/").pop();
  const family = FAMILY_TEMPLATES.find((f) => f.dir === dir);
  if (family) {
    if (name === family.template) return { source: null, isFamily: true, isBareTemplate: true, family };
    if (family.pattern.test(base)) return { source: family.template, isFamily: true };
  }
  if (available().includes(name)) return { source: name, isFamily: false };
  return null;
};

const HELP = `Xenth AI scaffold — write one company document from its scaffold, without ever overwriting.

  node tools/scaffold.mjs --document <path.md> [--company <dir>] [--list] [--json]

  --document <path.md>  The scaffold to materialise, e.g. "mapeo-empresa/00-PERFIL.md" or
                         "comunicacion/BRAND.md". For a per-process or per-automation document, pass
                         the REAL instance name instead of the template's — e.g.
                         "mapeo-empresa/03-procesos/P01-cotizacion.md" (the "PXX-nombre.md" template
                         supplies its text), or "mapeo-empresa/06-specs/A01-<nombre>.md". Required
                         unless --list.
  --company <dir>       The engagement directory. Default: the bound company found from the cwd.
  --list                Print the scaffolds this build ships and exit.
  --json                Machine-readable result.

Writes the LOCAL copy in the engagement folder — the one \`tools/status.mjs\` reads. A CLI holds no
connector credentials, so the copy in the client's own store is still made by the session, through
the connector, after this.

The \`mapeo-empresa/\` folder becomes \`mapeo-<nombre del cliente>/\` once a manifest is readable, and
\`<empresa>\` inside a document's own text is replaced the same way. Every other placeholder is left
as it is: a scaffold marks what nobody has captured yet, and filling that in from a manifest would
be inventing it.

EXIT CODES
  0  the document was written.
  1  nothing was written because the file already exists. That is the correct outcome on a company
     whose store already held documents, and it is never overridden — a scaffold written over
     somebody's work destroys the only copy and no later session can tell it happened.
  2  could not run: no company bound, an unknown document, or a bad argument.
`;

const parseArgs = (argv) => {
  const args = { json: false, help: false, list: false, unknown: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      args.unknown.push(token);
      continue;
    }
    const key = token.slice(2);
    if (key === "json" || key === "help" || key === "list") {
      args[key] = true;
      continue;
    }
    if (key !== "document" && key !== "company") {
      args.unknown.push(token);
      continue;
    }
    const value = argv[++i];
    if (value === undefined || value.startsWith("--")) {
      args.missingValue = key;
      continue;
    }
    args[key] = value;
  }
  return args;
};

const finish = (text, code) => process.stdout.write(text, () => process.exit(code));

const fail = (message, code = 2) => {
  process.stderr.write(`${message}\n`);
  process.exit(code);
};

const main = () => {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return finish(HELP, 0);
  if (args.unknown.length) return fail(`unknown option(s): ${args.unknown.join(" ")}\n\n${HELP}`);
  if (args.missingValue) return fail(`--${args.missingValue} needs a value`);
  if (args.list) return finish(`${available().join("\n")}\n`, 0);
  if (!args.document) return fail(`--document is required. Available: ${available().join(", ")}`);

  /**
   * Resolved against the directory listing and the family templates rather than sanitised, so a
   * path in `--document` cannot reach a file outside the scaffold folder and cannot land one
   * outside the engagement folder either. An allowlist derived from what ships is the only version
   * of this check that cannot drift from the files it protects.
   */
  const name = args.document;
  const resolved = resolveTemplate(name);
  if (!resolved) {
    return fail(`no scaffold named "${name}". Available: ${available().join(", ")}`);
  }
  if (resolved.isBareTemplate) {
    return fail(
      `"${name}" is a family template, not a document — pass a real instance name instead, e.g. ` +
        `"${resolved.family.dir}/${resolved.family.pattern.source.includes("P\\d") ? "P01-nombre-real.md" : "A01-nombre-real.md"}".`
    );
  }

  /**
   * `--company` names the directory and still reads the manifest inside it when there is one, so
   * the name substitution works the same whether the caller stood in the engagement folder or
   * pointed at it. An unreadable or absent manifest there is not an error — the directory was
   * given explicitly, and the document is then written with its placeholder intact.
   */
  const ctx = args.company
    ? { ok: true, root: args.company, company: readCompany(args.company).company ?? null }
    : readCompany();
  if (!ctx.ok) {
    return fail(
      `no company bound (${ctx.reason}). Pass --company <dir> or run inside an engagement folder.`
    );
  }

  const companyName = ctx.company?.name ?? null;
  /**
   * `mapeo-empresa` is the only path SEGMENT ever renamed, and only once a company name is known —
   * everything after it (`03-procesos/P01-cotizacion.md`) is the caller's own choice and is never
   * touched. `<empresa>` inside the document's TEXT is a separate substitution, made below.
   */
  const resolvedName = resolveForCompany(name, companyName);
  const target = join(ctx.root, ...resolvedName.split("/"));
  if (existsSync(target)) {
    const message =
      `${name} already exists in ${ctx.root} — nothing written.\n\n` +
      "A scaffold is never written over an existing file: that destroys the only copy of work\n" +
      "somebody did, and no later session can tell it happened. Read what is there and fill it.";
    if (args.json) {
      return finish(`${JSON.stringify({ written: false, reason: "exists", document: name, path: target }, null, 2)}\n`, 1);
    }
    process.stderr.write(`${message}\n`);
    return process.exit(1);
  }

  const source = join(SCAFFOLDS, ...resolved.source.split("/"));
  mkdirSync(dirname(target), { recursive: true });
  if (companyName) {
    writeFileSync(target, readFileSync(source, "utf8").replace(COMPANY_PLACEHOLDER, companyName), "utf8");
  } else {
    copyFileSync(source, target);
  }

  const result = { written: true, document: name, template: resolved.source, path: target, company: companyName };
  return finish(
    args.json
      ? `${JSON.stringify(result, null, 2)}\n`
      : `escrito ${target}${companyName ? ` (<empresa> → ${companyName})` : ""}\n` +
          "Falta la copia en el store del cliente: eso lo hace la sesión, por el conector.\n",
    0
  );
};

main();
