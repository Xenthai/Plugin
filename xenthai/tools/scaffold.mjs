#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readCompany } from "../lib/company.mjs";

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
 * The one placeholder every scaffold shares, and the only substitution made here. Anything else —
 * a date, a person, a cadence — is a fact somebody has to supply, and filling it from a manifest
 * would be inventing it, which is the failure `test/scaffold.test.mjs` exists to catch.
 */
const COMPANY_PLACEHOLDER = /<empresa>/g;

const available = () => readdirSync(SCAFFOLDS).filter((f) => f.endsWith(".md")).sort();

const HELP = `Xenth AI scaffold — write one company document from its scaffold, without ever overwriting.

  node tools/scaffold.mjs --document <NAME.md> [--company <dir>] [--list] [--json]

  --document <NAME.md>  The scaffold to materialise. Required unless --list.
  --company <dir>       The engagement directory. Default: the bound company found from the cwd.
  --list                Print the scaffolds this build ships and exit.
  --json                Machine-readable result.

Writes the LOCAL copy in the engagement folder — the one \`tools/status.mjs\` reads. A CLI holds no
connector credentials, so the copy in the client's own store is still made by the session, through
the connector, after this.

\`<empresa>\` is replaced with the bound company's name when a manifest is readable. Every other
placeholder is left as it is: a scaffold marks what nobody has captured yet, and filling that in
from a manifest would be inventing it.

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
   * Compared against the directory listing rather than sanitised, so a path in `--document` cannot
   * reach a file outside the scaffold folder and cannot land one outside the engagement folder
   * either. An allowlist derived from what ships is the only version of this check that cannot
   * drift from the files it protects.
   */
  const name = args.document;
  if (!available().includes(name)) {
    return fail(`no scaffold named "${name}". Available: ${available().join(", ")}`);
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

  const target = join(ctx.root, name);
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

  const source = join(SCAFFOLDS, name);
  const companyName = ctx.company?.name ?? null;
  mkdirSync(ctx.root, { recursive: true });
  if (companyName) {
    writeFileSync(target, readFileSync(source, "utf8").replace(COMPANY_PLACEHOLDER, companyName), "utf8");
  } else {
    copyFileSync(source, target);
  }

  const result = { written: true, document: name, path: target, company: companyName };
  return finish(
    args.json
      ? `${JSON.stringify(result, null, 2)}\n`
      : `escrito ${target}${companyName ? ` (<empresa> → ${companyName})` : ""}\n` +
          "Falta la copia en el store del cliente: eso lo hace la sesión, por el conector.\n",
    0
  );
};

main();
