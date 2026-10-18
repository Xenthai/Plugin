#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { launchBrowser, option, serveDir } from "./shared.mjs";

const HELP = `Xenth AI diagram capture — one PNG per HTML diagram, at 2x, light theme, without viewer controls.

Usage:
  node capture.mjs <diagrams-folder> <png-folder> [--selector <css>] [--chrome <path-to-chromium>]

  <diagrams-folder>  Folder of *.html diagrams; one level of subfolders is searched too.
  <png-folder>       Where <name>.png is written for each diagram.
  --selector         The element holding the diagram canvas (default: .diagram-container, the
                     canvas an Archify diagram renders into). Without a match the full page is taken.
  --chrome           A Chromium executable; CHROME_PATH works too.
  --help             This text.

An interactive diagram viewer can fail inside an artifact (scroll or drag that does not respond),
so a hub always carries an image of each diagram and links the interactive one as an option.

Exit codes:
  0  every diagram captured
  1  no diagram found
  2  could not start: a missing folder, no driver or no browser
`;

/**
 * Controls an Archify viewer draws over its canvas. Hidden before the screenshot because a static
 * image of a pan button or a minimap is noise a reader tries to click.
 */
const VIEWER_CHROME = ".diagram-nav,.focus-chip,.overview-map,.route-probe,.semantic-lens,.diagram-guide,.node-finder{display:none!important}";

/**
 * Files a diagram tool writes beside the diagram itself (review and host wrappers); capturing one
 * produces a picture of a page about the diagram.
 */
const NOT_A_DIAGRAM = /review|wrapped|host/;

/** The diagram files under a folder, one level of subfolders deep, as paths relative to it. */
export const diagramFiles = (src) => {
  const files = [];
  for (const e of readdirSync(src, { withFileTypes: true })) {
    if (e.isFile() && e.name.endsWith(".html")) files.push(e.name);
    if (e.isDirectory()) {
      for (const f of readdirSync(join(src, e.name))) {
        if (f.endsWith(".html") && !NOT_A_DIAGRAM.test(f) && statSync(join(src, e.name, f)).isFile()) files.push(join(e.name, f));
      }
    }
  }
  return files.sort();
};

const main = async () => {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  const positional = argv.filter((a, i) => !a.startsWith("--") && !["--selector", "--chrome"].includes(argv[i - 1]));
  if (positional.length < 2 || !existsSync(positional[0])) {
    process.stderr.write("a diagrams folder and a png folder are required (see --help)\n");
    process.exit(2);
  }
  const src = resolve(positional[0]);
  const out = resolve(positional[1]);
  const selector = option(argv, "--selector") ?? ".diagram-container";
  const files = diagramFiles(src);
  if (!files.length) {
    process.stderr.write(`no .html files in ${src}\n`);
    process.exit(1);
  }
  mkdirSync(out, { recursive: true });
  const server = await serveDir(src);
  let browser;
  let ok = 0;
  try {
    browser = await launchBrowser(option(argv, "--chrome") ?? process.env.CHROME_PATH);
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2, colorScheme: "light" });
    for (const f of files) {
      const page = await ctx.newPage();
      await page.goto(`${server.base}${f.split(sep).join("/")}?theme=light`, { waitUntil: "load" });
      await page.waitForTimeout(1500);
      await page.addStyleTag({ content: VIEWER_CHROME });
      const name = `${basename(f, ".html")}.png`;
      const el = await page.$(selector);
      if (el) await el.screenshot({ path: join(out, name) });
      else {
        await page.screenshot({ path: join(out, name), fullPage: true });
        process.stdout.write(`(no ${selector}; full page) ${f}\n`);
      }
      process.stdout.write(`${name}\n`);
      ok++;
      await page.close();
    }
  } catch (err) {
    if (err.code !== "no-driver" && err.code !== "no-browser") throw err;
    process.stderr.write(`${err.message}\n`);
    process.exitCode = 2;
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
  if (process.exitCode !== 2) process.stdout.write(`${ok} image(s) in ${out}\n`);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
