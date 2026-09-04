#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/**
 * Runs every `test/*.test.mjs` in name order.
 *
 * Discovery is by glob rather than a list in package.json for one reason that cost real time:
 * several agents adding their own suite to a shared `test` script race on that one file, and a
 * script naming a file that does not exist yet breaks every other suite with it. A new suite is
 * now a new file and nothing else.
 *
 * `test/skill-eval.mjs` is deliberately not matched — it needs the Claude CLI and API access, so
 * it is a separate `eval:skills` command, not part of the gate.
 */
const suites = readdirSync(HERE)
  .filter((name) => name.endsWith(".test.mjs"))
  .sort();

const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const selected = only.length
  ? suites.filter((s) => only.some((o) => s.includes(o)))
  : suites;

if (!selected.length) {
  process.stderr.write(
    only.length
      ? `no suite matches ${only.join(", ")}. Available: ${suites.join(", ")}\n`
      : "no test/*.test.mjs found\n"
  );
  process.exit(1);
}

const failed = [];
for (const suite of selected) {
  process.stdout.write(`\n──── ${suite} ────\n`);
  const res = spawnSync(process.execPath, [join(HERE, suite)], { stdio: "inherit" });
  if (res.status !== 0) failed.push(`${suite} (exit ${res.status})`);
}

process.stdout.write(`\n════ ${selected.length - failed.length}/${selected.length} suites passed ════\n`);
for (const f of failed) process.stdout.write(`FAILED  ${f}\n`);
process.exit(failed.length ? 1 : 0);
