#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { option, stripSkeleton } from "./shared.mjs";

const HELP = `Xenth AI hub audit — report what a set of published hubs needs maintained.

Usage:
  node audit.mjs <hub1.html> [<hub2.html> ...] [--json <out.json>]

  <hubN.html>  A hub as an artifact read returns it, with or without the viewer's skeleton.
  --json       Also write the full report as JSON.
  --help       This text.

Per hub: pages against the menu, the switcher, the footer (owner, version, date), ${"[por confirmar]"}
markers per page, broken internal links, target="_blank" to the hub's own files, support files
referenced, commits cited, and text that looks sensitive. Across hubs: whether every switcher
lists the same hubs in the same order, and whether a hub appears under more than one url.

Sensitive-looking text is a lead to check by hand, never a verdict: a public contact address is
fine, a client's tax id is not.

Exit codes:
  0  report printed (read it: problems do not change the exit code)
  2  could not start: no file, or an unreadable one
`;

/**
 * Patterns for text that should not be in a hub. Each is a lead, not a finding: the auditor reads
 * the hit. The Mexican identifiers are here because the plugin's clients are Mexican companies; a
 * client RFC or CURP inside an internal hub is the most common real leak.
 */
const SENSITIVE = [
  ["email address", /[\w.+-]+@[\w-]+\.[\w.-]+/g],
  ["possible RFC (Mexico)", /(?<![\p{L}\p{N}_])[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}(?![\p{L}\p{N}_])/gu],
  ["possible CURP", /\b[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d\b/g],
  ["long number (account or card)", /(?<![\w.#-])\d{12,19}(?![\w.-])/g],
  ["CLABE or IBAN", /\b\d{18}\b|\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g],
  ["AWS ARN", /arn:aws:[a-z0-9-]+:/g],
  ["IP address", /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
  ["internal host", /\b[\w-]+\.(?:internal|local|corp|lan)\b/g],
  ["credential keyword", /\b(?:password|contraseña|api[_-]?key|secret|token)\s*[:=]/giu],
];

const MONTHS = /\b(?:enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i;

const unescapeHtml = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

/** The visible text of an HTML fragment: scripts, styles and inline SVG removed, entities decoded. */
export const textOf = (fragment) =>
  unescapeHtml(fragment.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

/**
 * Audits one hub's HTML. Embedded `data:` payloads and the script are removed before any pattern
 * runs, because a base64 logo matches the long-number and IBAN patterns by chance and buries the
 * real hits.
 */
export const auditHub = (raw, file = "(inline)") => {
  const s = stripSkeleton(raw);
  const clean = s.replace(/data:[a-z/+.-]+;base64,[A-Za-z0-9+/=]+/g, "data:…").replace(/<script[\s\S]*?<\/script>/g, "");
  const r = { file, issues: [], notes: [] };
  const title = /<title>([\s\S]*?)<\/title>/.exec(s);
  r.title = title ? unescapeHtml(title[1]).trim() : "(untitled)";
  r.size_kb = Math.round(Buffer.byteLength(raw, "utf8") / 1024);
  if (r.size_kb > 15 * 1024) r.issues.push(`weighs ${r.size_kb} KB: close to the 16 MB page limit`);

  const groups = clean.match(/<div class="group">[\s\S]*?<\/ul>/g) ?? [];
  const menuIds = groups.flatMap((g) => [...g.matchAll(/<a [^>]*href="#([a-z0-9-]+)"/g)].map((m) => m[1]));
  const pageIds = [...clean.matchAll(/<article class="page" id="p-([a-z0-9-]+)"/g)].map((m) => m[1]);
  const titles = Object.fromEntries([...clean.matchAll(/<article class="page" id="p-([a-z0-9-]+)" data-title="([^"]*)"/g)].map((m) => [m[1], unescapeHtml(m[2])]));
  r.pages = pageIds.length;
  for (const id of new Set(menuIds)) if (!pageIds.includes(id)) r.issues.push(`the menu points at #${id} but no such page exists`);
  for (const id of pageIds) if (!menuIds.includes(id)) r.notes.push(`page #${id} is not in the menu`);

  const navs = [...clean.matchAll(/<nav class="hubs[^"]*"[^>]*>([\s\S]*?)<\/nav>/g)].map((m) => m[1]);
  const switchers = navs.map((n) =>
    [...n.matchAll(/<a [^>]*>[\s\S]*?<\/a>/g)].map((a) => ({
      name: textOf(a[0]),
      url: /href="([^"]*)"/.exec(a[0])?.[1] ?? "",
      current: a[0].includes("aria-current"),
    }))
  );
  r.switcher = switchers[0] ?? [];
  if (switchers.length === 2 && switchers[0].map((x) => x.name).join("|") !== switchers[1].map((x) => x.name).join("|")) {
    r.issues.push("the top-bar switcher and the mobile-menu switcher disagree");
  }
  if (!switchers.length) r.notes.push("no hub switcher");
  else if (r.switcher.filter((x) => x.current).length !== 1) r.issues.push("the switcher must mark exactly one hub as current");

  const foot = /<div class="foot-note">([\s\S]*?)<\/div>/.exec(clean) ?? /<footer[^>]*>([\s\S]*?)<\/footer>/.exec(clean);
  r.footer = foot ? textOf(foot[1]) : "";
  r.version = null;
  r.date = null;
  if (!foot) r.issues.push("no footer (owner, version, date)");
  else {
    if (/responsable:\s*\[por confirmar\]|owner:\s*\[/i.test(r.footer) || !/responsable|owner/i.test(r.footer)) r.issues.push("the footer names no owner");
    r.version = /(?:versi[oó]n|version)\s*([\w.]+)/i.exec(r.footer)?.[1] ?? null;
    r.date = MONTHS.exec(r.footer)?.[0] ?? null;
  }
  r.commits = [...new Set([...textOf(clean).matchAll(/commit\s+([0-9a-f]{7,40})/gi)].map((m) => m[1]))].sort();

  r.pending = {};
  for (const m of clean.matchAll(/<article class="page" id="p-([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/article>/g)) {
    const n = (textOf(m[2]).match(/\[por confirmar\]/gi) ?? []).length;
    if (n) r.pending[titles[m[1]] ?? m[1]] = n;
  }

  for (const href of new Set([...clean.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]))) {
    if (!pageIds.includes(href) && !href.startsWith("i-")) r.issues.push(`internal link to #${href}, which is not a page`);
  }
  for (const m of clean.matchAll(/<a [^>]*href="([^"#:][^"]*)"[^>]*target="_blank"/g)) {
    if (!/^https?:\/\//.test(m[1])) r.issues.push(`target="_blank" to one of the hub's own files (the viewer blocks it): ${m[1]}`);
  }
  r.support_files = [...new Set([...clean.matchAll(/(?:src|href|data-full)="((?:img|d|assets|files)\/[^"]+)"/g)].map((m) => m[1]))].sort();
  r.external_links = [...new Set([...clean.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))].sort();

  const visible = textOf(clean);
  const hits = new Set();
  for (const [label, rx] of SENSITIVE) {
    for (const m of visible.matchAll(rx)) {
      if (label === "IP address" && m[0].split(".").every((x) => Number(x) < 10)) continue;
      hits.add(`${label}: ${m[0].slice(0, 60)}`);
    }
  }
  r.sensitive = [...hits].sort().slice(0, 40);
  return r;
};

/**
 * Compares hubs with each other. A company whose hubs disagree on the switcher sends a reader in a
 * circle, and a hub listed under two urls means one of them is a stale copy.
 */
export const crossCheck = (reports) => {
  const cross = [];
  if (reports.length < 2) return cross;
  const lists = reports.map((r) => [r.title, r.switcher.map((x) => x.name)]);
  const shapes = new Set(lists.filter(([, v]) => v.length).map(([, v]) => v.join("|")));
  if (shapes.size > 1) {
    cross.push("the switchers disagree between hubs:");
    for (const [t, v] of lists) cross.push(`  - ${t}: ${v.join(" | ") || "(no switcher)"}`);
  }
  const urls = new Map();
  for (const r of reports) {
    for (const x of r.switcher) {
      if (x.current) continue;
      if (!urls.has(x.name)) urls.set(x.name, new Set());
      urls.get(x.name).add(x.url);
    }
  }
  for (const [n, us] of urls) if (us.size > 1) cross.push(`hub "${n}" appears under different urls: ${[...us].sort().join(", ")}`);
  return cross;
};

const format = (reports, cross) => {
  const out = [];
  for (const r of reports) {
    out.push(`## ${r.title}`);
    out.push(`- File: ${r.file} · ${r.size_kb} KB · ${r.pages} pages`);
    out.push(`- Footer: ${r.footer || "(no footer)"}`);
    if (r.commits.length) out.push(`- Commits cited: ${r.commits.join(", ")}`);
    out.push(`- Switcher: ${r.switcher.map((x) => (x.current ? `**${x.name}**` : x.name)).join(" | ") || "(no switcher)"}`);
    const pending = Object.entries(r.pending);
    if (pending.length) {
      out.push(`- [por confirmar]: ${pending.reduce((a, [, n]) => a + n, 0)} in total · ${pending.map(([p, n]) => `${p} (${n})`).join("; ")}`);
    }
    if (r.support_files.length) out.push(`- Support files referenced: ${r.support_files.length} (compare with the artifact's published file list)`);
    for (const i of r.issues) out.push(`- PROBLEM: ${i}`);
    for (const n of r.notes) out.push(`- Note: ${n}`);
    if (r.sensitive.length) {
      out.push("- CHECK BY HAND (possibly sensitive; may be false positives):");
      for (const h of r.sensitive) out.push(`  - ${h}`);
    }
    out.push("");
  }
  if (cross.length) out.push("## Across hubs", ...cross);
  return out.join("\n");
};

const main = () => {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  const json = option(argv, "--json");
  const files = argv.filter((a, i) => a !== "--json" && argv[i - 1] !== "--json");
  if (!files.length) {
    process.stderr.write("at least one hub file is required (see --help)\n");
    process.exit(2);
  }
  const reports = files.map((f) => {
    try {
      return auditHub(readFileSync(f, "utf8"), f);
    } catch (err) {
      process.stderr.write(`cannot read ${f}: ${String(err.message).split("\n")[0]}\n`);
      process.exit(2);
    }
  });
  const cross = crossCheck(reports);
  process.stdout.write(`${format(reports, cross)}\n`);
  if (json) writeFileSync(json, JSON.stringify({ hubs: reports, cross }, null, 2), "utf8");
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
