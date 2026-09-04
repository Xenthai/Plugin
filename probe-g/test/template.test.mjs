import { spawnSync } from "node:child_process";
import { rmSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const ENGINE = join(ROOT, "capabilities", "social", "engine", "render.mjs");
const TEMPLATE = join(ROOT, "capabilities", "social", "engine", "template.html");
const FX = join(HERE, "fixtures", "company");
const OUT = join(HERE, "fixtures", "out-template");

const pieces = Object.keys(JSON.parse(readFileSync(join(FX, "pieces.json"), "utf8")));

const res = spawnSync(
  process.execPath,
  [
    ENGINE,
    "--template", TEMPLATE,
    "--out", OUT,
    "--prefix", "co",
    "--pieces", join(FX, "pieces.json"),
    "--tokens", join(FX, "tokens.css"),
    "--brand", join(FX, "brand.json"),
    "--piece", pieces.join(","),
    "--expect-font", "Archivo,Hanken Grotesk,JetBrains Mono",
    "--expect-color", "#dce9ff@.foot",
    "--json",
  ],
  { encoding: "utf8", cwd: ROOT, env: process.env, maxBuffer: 16 * 1024 * 1024 }
);

let report = null;
try {
  report = JSON.parse(res.stdout);
} catch {}

if (!report) {
  console.log("FAIL  the engine produced no report");
  console.log(res.stderr.slice(0, 1200));
  process.exit(1);
}

const byPiece = new Map();
for (const r of report.report) {
  if (!byPiece.has(r.piece)) byPiece.set(r.piece, []);
  byPiece.get(r.piece).push(r);
}

let failed = 0;
for (const [piece, rs] of byPiece) {
  const bad = rs.filter((r) => !r.ok);
  const fills = rs.map((r) => `${r.target.replace("vertical-", "")}:${r.fill ?? "n/a"}%`).join("  ");
  if (bad.length) failed++;
  console.log(`${bad.length ? "FAIL" : "PASS"}  ${piece.padEnd(13)} ${fills}`);
  for (const b of bad) for (const f of b.failures) console.log(`        ${b.target}: ${f}`);
}

const total = pieces.length * 4;
console.log("");
console.log(`${report.total - report.failed}/${total} assets passed every assertion across ${pieces.length} archetypes and 4 targets`);
console.log(`channel: ${report.channel}; headline font on every asset: ${[...new Set(report.report.map((r) => r.headlineFont))].join(" | ")}`);

if (!failed && report.total === total) {
  rmSync(OUT, { recursive: true, force: true });
  process.exit(0);
}
process.exit(1);
