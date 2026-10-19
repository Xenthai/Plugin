#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeHtml, option, stripSkeleton } from "./shared.mjs";

const HELP = `Xenth AI hub switcher — add one hub to the switcher of an already-published hub, and change nothing else.

Usage:
  node switcher.mjs --in <read.html> --out <ready.html> --name "<Hub name>" --url <https://claude.ai/artifact/...> [--after "<Hub name>"]

  --in      The HTML an artifact read returned. The viewer's skeleton, if present, is removed.
  --out     Where the edited page is written, ready to publish to the sibling's url.
  --name    The new hub's name, exactly as every other switcher spells it.
  --url     The new hub's artifact url.
  --after   Insert after this hub, to keep the switcher's order; without it the hub goes last.
  --help    This text.

Both switchers change (top bar and mobile menu). The page is refused, and nothing written, when the
hub is already listed, when there are not exactly two switchers, or when anything outside them would
differ.

Exit codes:
  0  written
  1  refused
  2  could not start: a missing argument or unreadable file
`;

const NAV = /<nav class="hubs[^"]*"[^>]*>[\s\S]*?<\/nav>/g;
const SEP = '<span aria-hidden="true">|</span>';

/** A refusal: the sibling would publish with a switcher that disagrees with the others. */
export class SwitcherRefusal extends Error {}

/**
 * Adds a hub to both switchers of a sibling hub. Verifies its own work instead of trusting the
 * edit: everything outside the two `<nav class="hubs">` blocks must be byte-identical, and the new
 * name must appear exactly twice. A sibling may have co-authors, so an edit that touched anything
 * else would publish someone's change nobody reviewed.
 */
export const addToSwitcher = (html, { name, url, after }) => {
  const s = stripSkeleton(html);
  const navs = [...s.matchAll(NAV)];
  if (navs.length !== 2) throw new SwitcherRefusal(`expected 2 hub switchers and found ${navs.length}`);
  const label = `>${escapeHtml(name)}</a>`;
  const added = `<a href="${escapeHtml(url, true)}" target="_blank" rel="noopener">${escapeHtml(name)}</a>`;
  let out = "";
  let last = 0;
  for (const m of navs) {
    let block = m[0];
    if (block.includes(label)) throw new SwitcherRefusal(`"${name}" is already in the switcher`);
    if (after) {
      const anchor = `>${escapeHtml(after)}</a>`;
      const k = block.indexOf(anchor);
      if (k === -1) throw new SwitcherRefusal(`"${after}" is not in the switcher`);
      const at = k + anchor.length;
      block = block.slice(0, at) + SEP + added + block.slice(at);
    } else {
      block = block.slice(0, -"</nav>".length) + SEP + added + "</nav>";
    }
    out += s.slice(last, m.index) + block;
    last = m.index + m[0].length;
  }
  out += s.slice(last);
  const outside = (t) => t.replace(NAV, "<nav/>");
  if (outside(out) !== outside(s)) throw new SwitcherRefusal("something outside the switchers changed; nothing is written");
  if (out.split(label).length - 1 !== 2) throw new SwitcherRefusal("the new hub does not appear exactly twice");
  return out;
};

const main = () => {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  const src = option(argv, "--in");
  const out = option(argv, "--out");
  const name = option(argv, "--name");
  const url = option(argv, "--url");
  if (!src || !out || !name || !url) {
    process.stderr.write("--in, --out, --name and --url are required (see --help)\n");
    process.exit(2);
  }
  let html;
  try {
    html = readFileSync(src, "utf8");
  } catch (err) {
    process.stderr.write(`cannot read ${src}: ${String(err.message).split("\n")[0]}\n`);
    process.exit(2);
  }
  try {
    writeFileSync(out, addToSwitcher(html, { name, url, after: option(argv, "--after") }), "utf8");
  } catch (err) {
    if (!(err instanceof SwitcherRefusal)) throw err;
    process.stderr.write(`refused: ${err.message}\n`);
    process.exit(1);
  }
  process.stdout.write(`OK: "${name}" added to both switchers -> ${out}\n`);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
