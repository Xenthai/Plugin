#!/usr/bin/env node
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { launchBrowser, option, serveDir } from "./shared.mjs";

const HELP = `Xenth AI hub check — look at a built hub the way the artifact viewer will show it, before publishing.

Usage:
  node check.mjs <hub-folder> [--out <screenshots-folder>] [--chrome <path-to-chromium>]

  <hub-folder>  The folder holding index.html and its support files (img/, d/).
  --out         Where screenshots go (default: <hub-folder>/../hub-check).
  --chrome      A Chromium executable; CHROME_PATH works too. Without either, the system browser
                channels the render engine uses are tried.
  --help        This text.

Serves the folder over loopback, wraps index.html in the viewer's skeleton, and walks every page in
the menu at desktop light (1440), desktop dark and phone (390). Fails on a JavaScript error,
horizontal overflow, more than one page visible at once, a broken image, a linked file that does
not exist, target="_blank" to the hub's own files, or an image viewer that does not open.
Screenshots are written either way — look at them before publishing.

Exit codes:
  0  no problems
  1  problems found (listed)
  2  could not start: no folder, no index.html, no driver or no browser
`;

const VIEWS = [
  { name: "desktop-light", width: 1440, height: 1000, scheme: "light" },
  { name: "desktop-dark", width: 1440, height: 1000, scheme: "dark" },
  { name: "phone-light", width: 390, height: 844, scheme: "light", mobile: true },
];

/**
 * Checks a built hub in a real browser. Returns the problems and the screenshots written; the
 * caller decides the exit code, so the suite can run it against a fixture hub.
 */
export const checkHub = async (dir, { outDir, executablePath } = {}) => {
  const root = resolve(dir);
  const shotsDir = resolve(outDir ?? join(root, "..", "hub-check"));
  mkdirSync(shotsDir, { recursive: true });
  const server = await serveDir(root, { wrapIndex: true });
  const problems = [];
  const shots = [];
  let browser;
  try {
    browser = await launchBrowser(executablePath);
    const probe = await browser.newPage();
    await probe.goto(server.base, { waitUntil: "load" });
    const ids = await probe.$$eval('#sidebar .group a[href^="#"]', (as) => as.map((a) => a.getAttribute("href").slice(1)));
    const files = await probe.$$eval('a[href]:not([href^="#"]):not([href^="http"]), [data-full], img[src]:not([src^="data:"])', (els) =>
      els.map((e) => e.getAttribute("href") || e.getAttribute("data-full") || e.getAttribute("src"))
    );
    const blankSelf = await probe.$$eval('a[target="_blank"]', (as) => as.map((a) => a.getAttribute("href")).filter((h) => !/^https?:\/\//.test(h)));
    await probe.close();
    for (const f of new Set(files)) if (!existsSync(join(root, f.split("#")[0]))) problems.push(`linked file does not exist: ${f}`);
    for (const h of blankSelf) problems.push(`target="_blank" to one of the hub's own files (the viewer blocks it): ${h}`);
    if (!ids.length) problems.push("the menu has no pages");

    for (const v of VIEWS) {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, colorScheme: v.scheme, isMobile: !!v.mobile, hasTouch: !!v.mobile });
      const page = await ctx.newPage();
      page.on("pageerror", (e) => problems.push(`[${v.name}] JavaScript error: ${e.message}`));
      for (const [n, id] of ids.entries()) {
        await page.goto(`${server.base}#${id}`, { waitUntil: "load" });
        await page.waitForTimeout(250);
        const st = await page.evaluate((pid) => {
          const visible = [...document.querySelectorAll("article.page")].filter((p) => getComputedStyle(p).display !== "none").map((p) => p.id);
          const broken = [...document.images]
            .filter((i) => i.complete && i.naturalWidth === 0 && !i.closest("[hidden]") && i.getAttribute("src"))
            .map((i) => i.getAttribute("src"));
          return { sw: document.documentElement.scrollWidth, iw: innerWidth, visible, broken, ok: visible.length === 1 && visible[0] === `p-${pid}` };
        }, id);
        if (st.sw > st.iw + 1) problems.push(`[${v.name}] #${id}: overflows horizontally (${st.sw}px in ${st.iw}px)`);
        if (!st.ok) problems.push(`[${v.name}] #${id}: ${st.visible.length} pages visible at once (${st.visible.join(", ")})`);
        for (const b of st.broken) problems.push(`[${v.name}] #${id}: broken image ${b}`);
        if (v.name === "desktop-light" || n === 0) {
          const file = join(shotsDir, `${v.name}-${String(n + 1).padStart(2, "0")}-${id}.png`);
          await page.screenshot({ path: file });
          shots.push(file);
        }
        if (v.name === "desktop-light") {
          const zoom = await page.$(`#p-${id} .zoom`);
          if (zoom) {
            await zoom.click();
            const open = await page.evaluate(() => !document.getElementById("lightbox").hidden);
            if (!open) problems.push(`#${id}: the image viewer did not open`);
            await page.keyboard.press("Escape");
          }
        }
      }
      await ctx.close();
    }
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
  for (const m of server.missing) if (!/favicon/.test(m)) problems.push(`the hub requested a file that does not exist: ${m}`);
  return { problems: [...new Set(problems)], shots, shotsDir };
};

const main = async () => {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  const dir = argv.find((a, i) => !a.startsWith("--") && !["--out", "--chrome"].includes(argv[i - 1]));
  if (!dir || !existsSync(join(resolve(dir), "index.html"))) {
    process.stderr.write("a hub folder holding index.html is required (see --help)\n");
    process.exit(2);
  }
  let r;
  try {
    r = await checkHub(dir, { outDir: option(argv, "--out"), executablePath: option(argv, "--chrome") ?? process.env.CHROME_PATH });
  } catch (err) {
    if (err.code !== "no-driver" && err.code !== "no-browser") throw err;
    process.stderr.write(`${err.message}\n`);
    process.exit(2);
  }
  process.stdout.write(`Screenshots in ${r.shotsDir} (${r.shots.length}).\n`);
  if (r.problems.length) {
    process.stdout.write(`\n${r.problems.length} problem(s):\n${r.problems.map((p) => ` - ${p}`).join("\n")}\n`);
    process.exit(1);
  }
  process.stdout.write("No problems: pages, overflow, images, links and image viewer.\n");
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
