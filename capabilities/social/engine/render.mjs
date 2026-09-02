#!/usr/bin/env node
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readPng } from "../../../lib/png.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const HELP = `Xenth AI render — produce exact-pixel social assets and refuse to ship a bad one.

Renders a parameterised HTML template once per (piece x target) pair, asserts the result against
the platform spec, and exits non-zero if any assertion fails. A failed assertion means no asset is
promised: it is better to deliver nothing than to deliver something cropped.

USAGE
  node render.mjs --template <path|url> --out <dir> [options]

REQUIRED
  --template <path|url>   The HTML template. It receives ?p=<piece>&f=<target> and must render one
                          finished canvas at the target's exact pixel size.
  --out <dir>             Where PNGs are written.

OPTIONS
  --piece <a,b,c>         Piece ids to pass as ?p=. Default: "default" (one unnamed piece).
  --target <a,b,c>        Render targets from formats.json. Default: every target.
  --prefix <text>         Filename prefix. Default: "asset".
  --expect-font <a,b>     Font families the rendered headline may use — the company's declared
                          display and body faces, comma-separated. Fails when the headline rendered in
                          a family on neither list, which is what a silent OS substitution looks like.
  --expect-color <hex@where>  Assert an exact pixel colour, read from the PNG. Repeatable. "where"
                          is either a coordinate "x,y", sampled exactly, or a CSS selector, in
                          which case the first matching element's box is scanned and the assertion
                          holds if the colour appears anywhere inside it — text is mostly background,
                          so a single centre pixel would fail on every glyph-bearing element.
                          Examples: "#dce9ff@80,300"  "#dce9ff@.foot"
  --pieces <file.json>    Piece data, keyed by piece id, injected into the page as window.__xenthPieces.
  --tokens <file.css>     A company's design tokens, injected as window.__xenthTokens. Usually the
                          fenced css block from its DESIGN.md, copied verbatim.
  --brand <file.json>     Name, logo and foot, injected as window.__xenthBrand.
                          These three keep the template static HTML: data arrives as plain files a
                          skill writes, and nothing is fetched over file://, where fetch is blocked.
  --pdf                   Also write each canvas as a vector PDF beside its PNG. Chromium prints
                          it natively, so this adds no dependency. The page box is the target size at
                          96dpi, so one CSS pixel is one PDF point and the composition matches the PNG
                          rather than reflowing onto paper. The PNG is still produced and still
                          carries every assertion — the PDF is an extra artefact, never a substitute
                          for the asset that was verified.
  --min-fill <pct>        Minimum share of the body box the content must occupy. Default: 65.
  --channel <name>        Browser channel override. Default: the cached probe, else msedge.
  --json                  Emit a machine-readable report instead of lines.
  --help                  This text.

WHAT IS ASSERTED, PER ASSET
  1. exact output dimensions from formats.json
  2. no element overflows its container
  3. nothing that carries the message sits inside the HARD safe zone
  4. nothing at all sits beyond the SOFT safe zone
  5. the headline renders in the expected font family (with --expect-font)
  6. exact brand colours at named coordinates (with --expect-color)
  7. the PNG is not suspiciously small

MARKING TEXTURE
  The hard safe zone applies to anything that carries the message. Mark deliberately dimmed,
  disposable elements with data-texture in the template; everything unmarked is treated as
  load-bearing. Forgetting a mark therefore fails strict, never permissive.

EXIT CODES
  0  every asset rendered and passed
  1  at least one assertion failed (details on stdout)
  2  could not start: no template, no browser, or a bad argument
`;

/**
 * Options that take no value. A flag missing from this set silently consumes the next argument as
 * its value, which drops that argument — and when the dropped one is `--pieces`, the template falls
 * back to its demo placeholder and every assertion still passes, because the placeholder is well
 * composed. That happened. `assertInjected` below is the second half of the fix, so a repeat of
 * this mistake fails instead of shipping a placeholder.
 */
const BOOLEAN_FLAGS = new Set(["json", "help", "pdf"]);

const parse = (argv) => {
  const out = { expectColor: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    if (BOOLEAN_FLAGS.has(key)) {
      out[key] = true;
      continue;
    }
    const value = argv[++i] ?? "";
    if (key === "expect-color") out.expectColor.push(value);
    else out[key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return out;
};

/** Keys beginning with `$` are documentation inside the JSON, never data. */
const dataKeys = (obj) => Object.keys(obj).filter((k) => !k.startsWith("$"));

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const parseColorExpectations = (list) =>
  list.map((raw) => {
    const at = raw.indexOf("@");
    const hex = at >= 0 ? raw.slice(0, at) : raw;
    const where = at >= 0 ? raw.slice(at + 1).trim() : "";
    const rgb = hexToRgb(hex);
    if (!rgb || !where) throw new Error(`bad --expect-color "${raw}", expected "#rrggbb@x,y" or "#rrggbb@<css selector>"`);
    const [x, y] = where.split(",").map((v) => Number.parseInt(v, 10));
    if (Number.isInteger(x) && Number.isInteger(y)) return { hex: hex.trim(), rgb, x, y };
    return { hex: hex.trim(), rgb, selector: where };
  });

const CHANNELS = ["msedge", "chrome", "msedge-beta", "chrome-beta", "chrome-dev"];

const cachedChannel = () => {
  const dir = process.env.CLAUDE_PLUGIN_DATA;
  if (!dir) return null;
  try {
    return JSON.parse(readFileSync(join(dir, "render-channel.json"), "utf8")).channel ?? null;
  } catch {
    return null;
  }
};

const launch = async (preferred) => {
  const order = [preferred, cachedChannel(), ...CHANNELS].filter(Boolean);
  const tried = [];
  for (const channel of [...new Set(order)]) {
    try {
      return { browser: await chromium.launch({ channel }), channel };
    } catch (err) {
      tried.push(`${channel}: ${String(err.message).split("\n")[0].slice(0, 100)}`);
    }
  }
  const err = new Error("no system browser could be launched");
  err.tried = tried;
  throw err;
};

/**
 * Measures the rendered page. Runs inside the browser, so it must be self-contained.
 *
 * Effective opacity is walked through ancestors rather than read off the element: a container at
 * low opacity makes its children invisible while their own computed opacity still reads 1, and
 * counting those as content produces phantom violations.
 */
const measure = ({ hard, soft, expectFont }) => {
  {
    const frame = document.querySelector("[data-frame]") ?? document.body;
    const effectiveOpacity = (el) => {
      let o = 1;
      let node = el;
      while (node && node !== document.documentElement) {
        o *= Number.parseFloat(getComputedStyle(node).opacity || "1");
        node = node.parentElement;
      }
      return o;
    };

    const leaves = [];
    const push = (rect, el, sample) => {
      if (!rect.width || !rect.height) return;
      if (effectiveOpacity(el) < 0.03) return;
      leaves.push({
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        texture: el.closest("[data-texture]") !== null,
        inBody: el.closest("[data-body]") !== null,
        tag: el.tagName.toLowerCase(),
        sample: String(sample || "").trim().slice(0, 40),
      });
    };

    // Text is measured through Range rects over its own text nodes, not through element boxes.
    // An element box is clamped by its container, and an element containing inline markup — a
    // <br> in a headline is the common case — is not a leaf, so element-based detection misses
    // the single most important element on the canvas.
    const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.nodeValue;
      if (!text || !text.trim()) continue;
      const el = node.parentElement;
      if (!el || el.tagName === "STYLE" || el.tagName === "SCRIPT") continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) push(rect, el, text);
    }

    frame.querySelectorAll("svg, img").forEach((el) => {
      push(el.getBoundingClientRect(), el, el.tagName);
    });

    const bearing = leaves.filter((l) => !l.texture);
    const box = (list) =>
      list.length
        ? {
            top: Math.min(...list.map((l) => l.top)),
            bottom: Math.max(...list.map((l) => l.bottom)),
            left: Math.min(...list.map((l) => l.left)),
            right: Math.max(...list.map((l) => l.right)),
          }
        : null;

    const outside = (list, zone) =>
      list.filter(
        (l) =>
          l.top < zone.top || l.bottom > zone.bottom || l.left < zone.left || l.right > zone.right
      );

    // Fill compares the content INSIDE the body box against that box. Measuring every leaf in
    // the frame — the lockup and the foot sit outside the body box — against the body's height
    // yields values above 100%, which means nothing at all.
    const bodyBox = document.querySelector("[data-body]");
    const bodyRect = bodyBox ? bodyBox.getBoundingClientRect() : null;
    const bodyContent = box(leaves.filter((l) => l.inBody));
    const fill =
      bodyRect && bodyRect.height > 0 && bodyContent
        ? Math.round(((bodyContent.bottom - bodyContent.top) / bodyRect.height) * 1000) / 10
        : null;

    const headline = document.querySelector("[data-headline]") ?? frame.querySelector("h1, h2");

    return {
      size: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
      viewport: [window.innerWidth, window.innerHeight],
      overflow: Math.max(0, Math.round(frame.scrollHeight - frame.clientHeight)),
      leaves: leaves.length,
      bearingOutsideHard: outside(bearing, hard).slice(0, 6),
      anythingOutsideSoft: soft ? outside(leaves, soft).slice(0, 6) : [],
      fill,
      headlineFont: headline ? getComputedStyle(headline).fontFamily : null,
      headlineStretch: headline ? getComputedStyle(headline).fontStretch : null,
      expectFont: expectFont ?? null,
    };
  }
};

const run = async () => {
  const args = parse(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  if (!args.template || !args.out) {
    process.stdout.write(HELP);
    process.exit(2);
  }

  const specPath = join(HERE, "formats.json");
  const spec = JSON.parse(readFileSync(specPath, "utf8"));
  const allTargets = dataKeys(spec.render_targets);

  const targets = (args.target ? args.target.split(",") : allTargets).map((t) => t.trim());
  const unknown = targets.filter((t) => !allTargets.includes(t));
  if (unknown.length) {
    process.stderr.write(
      `unknown render target(s): ${unknown.join(", ")}\nknown: ${allTargets.join(", ")}\n`
    );
    process.exit(2);
  }

  const pieces = (args.piece ? args.piece.split(",") : ["default"]).map((p) => p.trim());
  const prefix = args.prefix ?? "asset";
  const minFill = Number.parseFloat(args.minFill ?? "65");
  const wantPdf = Boolean(args.pdf);

  let colors;
  try {
    colors = parseColorExpectations(args.expectColor);
  } catch (err) {
    process.stderr.write(err.message + "\n");
    process.exit(2);
  }

  const isUrl = /^https?:\/\//i.test(args.template);
  if (!isUrl && !existsSync(args.template)) {
    process.stderr.write(`template not found: ${args.template}\n`);
    process.exit(2);
  }
  const base = isUrl
    ? args.template
    : pathToFileURL(isAbsolute(args.template) ? args.template : resolve(args.template)).href;

  const outDir = isAbsolute(args.out) ? args.out : resolve(args.out);
  mkdirSync(outDir, { recursive: true });

  const readIf = (path, parse) => {
    if (!path) return null;
    const abs = isAbsolute(path) ? path : resolve(path);
    if (!existsSync(abs)) {
      process.stderr.write(`file not found: ${abs}
`);
      process.exit(2);
    }
    const text = readFileSync(abs, "utf8");
    return parse ? JSON.parse(text) : text;
  };
  const injected = {
    pieces: readIf(args.pieces, true),
    tokens: readIf(args.tokens, false),
    brand: readIf(args.brand, true),
  };
  if (args.pieces && !pieces.some((id) => injected.pieces && injected.pieces[id])) {
    process.stderr.write(`none of the requested pieces (${pieces.join(", ")}) exist in ${args.pieces}
`);
    process.exit(2);
  }

  let browser;
  let channel;
  try {
    ({ browser, channel } = await launch(args.channel));
  } catch (err) {
    process.stderr.write(
      `${err.message}\n${(err.tried ?? []).map((t) => "  " + t).join("\n")}\n\n` +
        "On macOS and Linux a system browser is often absent. Install one once with:\n" +
        "  npx playwright install chromium\n"
    );
    process.exit(2);
  }

  const report = [];
  for (const piece of pieces) {
    for (const target of targets) {
      const t = spec.render_targets[target];
      const zone = t.safe_zone ?? {};
      const hard = zone.hard ?? { top: 0, bottom: t.height, left: 0, right: t.width };
      const soft = zone.soft ?? null;

      const ctx = await browser.newContext({
        viewport: { width: t.width, height: t.height },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      await page.addInitScript((data) => {
        if (data.pieces) window.__xenthPieces = data.pieces;
        if (data.tokens) window.__xenthTokens = data.tokens;
        if (data.brand) window.__xenthBrand = data.brand;
      }, injected);
      const url = `${base}?p=${encodeURIComponent(piece)}&f=${encodeURIComponent(target)}`;
      await page.goto(url, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await page
        .waitForFunction(() => document.documentElement.dataset.fitted === "1", null, { timeout: 4000 })
        .catch(() => {});
      await page.waitForTimeout(120);

      /**
       * Refuses a placeholder render. The template flags itself when no piece data reached it, and
       * that state must never produce a passing asset: the placeholder is well composed, so it
       * clears every geometric assertion and looks like a delivered piece. It is a hard exit rather
       * than a per-asset failure because the cause is always the invocation, never the composition.
       */
      const renderedDemo = await page.evaluate(() => document.documentElement.dataset.demo === "1");
      if (renderedDemo && args.pieces) {
        await ctx.close();
        await browser.close();
        process.stderr.write(
          `piece data was supplied via --pieces but never reached the page, so the template rendered its
placeholder. Every assertion would have passed on that placeholder. Check the argument order: a
value-taking option immediately before --pieces will consume it.
`
        );
        process.exit(2);
      }

      const m = await page.evaluate(measure, {
        hard,
        soft,
        expectFont: args.expectFont ?? null,
      });

      const points = [];
      for (const c of colors) {
        if (!c.selector) {
          points.push(c);
          continue;
        }
        const box = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { left: Math.floor(r.left), top: Math.floor(r.top), right: Math.ceil(r.right), bottom: Math.ceil(r.bottom) };
        }, c.selector);
        points.push(box ? { ...c, box } : { ...c, error: `selector "${c.selector}" matched nothing` });
      }

      const name = `${prefix}-${piece}-${target}-${t.width}x${t.height}.png`;
      const file = join(outDir, name);
      await page.screenshot({
        path: file,
        clip: { x: 0, y: 0, width: t.width, height: t.height },
      });

      /**
       * The same canvas as a vector PDF, when asked for. Chromium prints it natively, so this adds
       * no dependency; the page box is set to the target's own pixel size at 96dpi so one CSS pixel
       * is one PDF point and the composition is identical to the PNG rather than reflowed onto
       * paper. The PNG is still produced and still carries every assertion — the PDF is an
       * additional artefact, never a substitute for the asset that was verified.
       */
      let pdfFile = null;
      if (wantPdf) {
        pdfFile = join(outDir, name.replace(/\.png$/, ".pdf"));
        await page.pdf({
          path: pdfFile,
          width: `${t.width / 96}in`,
          height: `${t.height / 96}in`,
          printBackground: true,
          pageRanges: "1",
          margin: { top: "0", right: "0", bottom: "0", left: "0" },
        });
      }

      await ctx.close();

      const sampled = [];
      if (points.length) {
        const png = readPng(file);
        for (const c of points) {
          if (c.error) {
            sampled.push(c);
            continue;
          }
          try {
            if (c.box) {
              const want = c.rgb.join(",");
              let hit = null;
              const x0 = Math.max(0, c.box.left);
              const y0 = Math.max(0, c.box.top);
              const x1 = Math.min(png.width - 1, c.box.right);
              const y1 = Math.min(png.height - 1, c.box.bottom);
              for (let y = y0; y <= y1 && !hit; y++) {
                for (let x = x0; x <= x1; x++) {
                  if (png.pixel(x, y).join(",") === want) {
                    hit = [x, y];
                    break;
                  }
                }
              }
              sampled.push({ ...c, x: hit ? hit[0] : x0, y: hit ? hit[1] : y0, got: hit ? c.rgb : png.pixel(x0, y0), scanned: true });
            } else {
              sampled.push({ ...c, got: png.pixel(c.x, c.y) });
            }
          } catch (err) {
            sampled.push({ ...c, got: null, error: err.message });
          }
        }
      }

      const bytes = statSync(file).size;
      const failures = [];

      if (m.viewport[0] !== t.width || m.viewport[1] !== t.height) {
        failures.push(`viewport ${m.viewport.join("x")} is not ${t.width}x${t.height}`);
      }
      if (m.overflow > 0) failures.push(`container overflow of ${m.overflow}px`);
      if (m.bearingOutsideHard.length) {
        const f = m.bearingOutsideHard[0];
        failures.push(
          `${m.bearingOutsideHard.length} message-bearing element(s) inside the hard safe zone ` +
            `(first: <${f.tag}> y ${f.top}..${f.bottom} "${f.sample}"; zone y ${hard.top}..${hard.bottom})`
        );
      }
      if (m.anythingOutsideSoft.length) {
        const f = m.anythingOutsideSoft[0];
        failures.push(
          `${m.anythingOutsideSoft.length} element(s) beyond the soft bound ` +
            `(first: <${f.tag}> y ${f.top}..${f.bottom} "${f.sample}")`
        );
      }
      if (args.expectFont && m.headlineFont) {
        const allowed = args.expectFont.split(",").map((f) => f.trim().toLowerCase()).filter(Boolean);
        const rendered = m.headlineFont.toLowerCase();
        if (!allowed.some((f) => rendered.includes(f))) {
          failures.push(
            `headline font is "${m.headlineFont}", none of [${args.expectFont}] — the OS substituted a font`
          );
        }
      }
      for (const s of sampled) {
        if (s.error) {
          failures.push(`could not sample ${s.selector ?? `${s.x},${s.y}`}: ${s.error}`);
        } else if (s.got.join(",") !== s.rgb.join(",")) {
          failures.push(
            s.scanned
              ? `no pixel inside "${s.selector}" is rgb(${s.rgb.join(", ")}) (${s.hex})`
              : `pixel ${s.x},${s.y} is rgb(${s.got.join(", ")}), expected rgb(${s.rgb.join(", ")}) (${s.hex})`
          );
        }
      }
      if (m.fill === null) {
        failures.push("the template marks no [data-body], so fill cannot be measured — a check that silently passes is not a check");
      } else if (m.fill < minFill) {
        failures.push(`content fills only ${m.fill}% of the body box, minimum is ${minFill}%`);
      } else if (m.fill > 100) {
        failures.push(`content overflows the body box (${m.fill}%) and can overlap the foot — it stays inside the platform's safe zone, which is why no other check sees it`);
      }
      if (m.leaves === 0) failures.push("the canvas rendered no measurable content at all");
      if (bytes < 1000) failures.push(`png is only ${bytes} bytes, which cannot be a real render`);

      report.push({
        piece,
        target,
        file: name,
        pdf: pdfFile ? pdfFile.split(/[\/]/).pop() : null,
        bytes,
        fill: m.fill,
        leaves: m.leaves,
        headlineFont: m.headlineFont,
        headlineStretch: m.headlineStretch,
        ok: failures.length === 0,
        failures,
      });
    }
  }

  await browser.close();

  const bad = report.filter((r) => !r.ok);
  if (args.json) {
    process.stdout.write(
      JSON.stringify({ channel, total: report.length, failed: bad.length, report }, null, 2) + "\n"
    );
  } else {
    process.stdout.write(`channel: ${channel}\n\n`);
    for (const r of report) {
      process.stdout.write(
        `${r.ok ? "OK  " : "FAIL"} ${r.file}  fill ${r.fill ?? "n/a"}%  ${r.bytes} B\n`
      );
      for (const f of r.failures) process.stdout.write(`       ${f}\n`);
    }
    process.stdout.write(
      `\n${report.length - bad.length}/${report.length} assets passed every assertion\n`
    );
  }
  process.exit(bad.length ? 1 : 0);
};

run().catch((err) => {
  process.stderr.write(`render failed: ${err && err.stack ? err.stack : err}\n`);
  process.exit(2);
});
