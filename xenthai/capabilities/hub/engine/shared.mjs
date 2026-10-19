import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

/**
 * The skeleton the artifact viewer wraps around a published page. A hub is tested inside it because
 * without its `[hidden]{display:none!important}` rule every hidden `article.page` (which is
 * `display:flex`) renders stacked, and the search results box shows as an empty bar — a local test
 * without the skeleton passes a hub the viewer then breaks.
 */
export const VIEWER_SKELETON =
  "<!doctype html><html><head><meta charset=utf8><meta name=viewport content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

/** The media type of a path by its extension, the way the artifact host infers it. */
export const mimeOf = (path) => MIME[extname(path).toLowerCase()] ?? "application/octet-stream";

/**
 * Removes the viewer's skeleton from an HTML file returned by an artifact read, so the hub can be
 * edited and republished as the fragment it was published as. Publishing it with the skeleton
 * still on nests a second `<!doctype>` inside the viewer's own `<body>`.
 */
export const stripSkeleton = (html) => {
  let s = html;
  const at = s.indexOf("<body>");
  if (at !== -1 && s.slice(0, at).trimStart().toLowerCase().startsWith("<!doctype")) s = s.slice(at + "<body>".length);
  s = s.trimEnd();
  if (s.endsWith("</body></html>")) s = s.slice(0, -"</body></html>".length);
  return `${s.replace(/^\n+/, "")}\n`;
};

/**
 * Serves a directory over loopback HTTP. A `file://` page cannot load its own support files the
 * way the artifact host serves them, so a check over `file://` reports a broken image the host
 * would show and misses one it would not. `wrapIndex` wraps `index.html` in the viewer skeleton;
 * every path requested that does not exist is collected, because a hub asking for a file nobody
 * published is the defect this exists to catch.
 */
export const serveDir = async (dir, { wrapIndex = false } = {}) => {
  const root = resolve(dir);
  const missing = new Set();
  const server = createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const rel = url === "/" ? "index.html" : url.replace(/^\/+/, "");
    const file = resolve(join(root, rel));
    if ((file !== root && !file.startsWith(root + sep)) || !existsSync(file) || !statSync(file).isFile()) {
      missing.add(rel);
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": mimeOf(file) });
    if (wrapIndex && rel === "index.html") {
      res.end(`${VIEWER_SKELETON}${readFileSync(file, "utf8")}\n</body></html>`);
      return;
    }
    createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/`,
    missing,
    close: () => new Promise((r) => server.close(r)),
  };
};

/**
 * The system-browser channels tried, in the render engine's order. A hub check drives the browser
 * already on the machine for the same reason the render engine does: `playwright-core` downloads
 * none, and the plugin installs with `--ignore-scripts`.
 */
const CHANNELS = ["msedge", "chrome", "msedge-beta", "chrome-beta", "chrome-dev"];

/**
 * Launches a browser, deferring the `playwright-core` import to this call so `--help` and argument
 * errors work on an install where the dependency is absent. An explicit executable (`--chrome` or
 * `CHROME_PATH`) wins over the channels, because a container's Chromium is a path, not a channel.
 * The error says which of the two absences it is: a missing driver is a two-second npm install, a
 * missing browser is the machine's.
 */
export const launchBrowser = async (executablePath) => {
  let chromium;
  try {
    ({ chromium } = await import("playwright-core"));
  } catch {
    const err = new Error('playwright-core is not installed; run "npm install --ignore-scripts" in the plugin root');
    err.code = "no-driver";
    throw err;
  }
  if (executablePath) return chromium.launch({ executablePath, args: ["--no-sandbox"] });
  const tried = [];
  for (const channel of CHANNELS) {
    try {
      return await chromium.launch({ channel });
    } catch (e) {
      tried.push(`${channel}: ${String(e.message).split("\n")[0].slice(0, 100)}`);
    }
  }
  const err = new Error(`no system browser could be launched; pass --chrome <path> or set CHROME_PATH\n  ${tried.join("\n  ")}`);
  err.code = "no-browser";
  throw err;
};

/** Text escaped for HTML; `quote` also escapes both quote characters, for an attribute value. */
export const escapeHtml = (text, quote = false) => {
  const s = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return quote ? s.replace(/"/g, "&quot;").replace(/'/g, "&#x27;") : s;
};

/** Value of `--name <value>` in an argv list, or undefined. */
export const option = (argv, name) => {
  const i = argv.indexOf(name);
  return i > -1 ? argv[i + 1] : undefined;
};
