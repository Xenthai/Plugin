#!/usr/bin/env node
import { existsSync, mkdirSync, openSync, readFileSync, readSync, closeSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeHtml, mimeOf, option } from "./shared.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

const HELP = `Xenth AI hub build — assemble one hub's index.html from brand.json, content.json and the shared template.

Usage:
  node build.mjs --brand <brand.json> --content <content.json> --out <dir>/index.html [--template <dir>]

  --brand      The company's brand: colours, fonts, logos, banner textures. Logo and texture paths
               resolve against this file's folder and are embedded as data: URIs.
  --content    The hub, its sibling-hub switcher, resources and pages. Schema in
               capabilities/hub/doctrine/SCHEMA.md.
  --out        Where index.html is written. Image and interactive paths inside blocks are relative
               to this folder, because they are published as the artifact's support files.
  --template   A folder holding shell.html and icons.svg (default: this engine's own).
  --help       This text.

Every WARNING printed is a defect to fix before publishing: low contrast, a link to a page or file
that does not exist, an image without alt text, a hub with no owner.

Exit codes:
  0  written (read the warnings)
  1  refused: a content error that would publish a broken hub
  2  could not start: a missing or unreadable argument
`;

/**
 * Interface strings. The Spanish set is client-facing es-MX; English exists for a company whose
 * hubs are in English. `content.i18n` overrides any key.
 */
export const I18N = {
  es: {
    menu: "Menú", close: "Cerrar", search: "Buscar en el hub", theme: "Tema", light: "Claro", auto: "Auto",
    dark: "Oscuro", results_label: "Resultados de búsqueda", pages: "Páginas del hub", pager: "Página anterior y siguiente",
    zoomed: "Imagen ampliada", actual: "Tamaño real", fit: "Ajustar al ancho", prev: "Anterior", next: "Siguiente",
    result: "resultado", results: "resultados", noResults: "Sin resultados para", resources: "Otros recursos",
    read: "Leer", zoom: "Ampliar", interactive: "Abrir interactivo", hubs: "Hubs", owner: "Responsable",
    version: "Versión", internal: "Documento interno",
  },
  en: {
    menu: "Menu", close: "Close", search: "Search the hub", theme: "Theme", light: "Light", auto: "Auto",
    dark: "Dark", results_label: "Search results", pages: "Hub pages", pager: "Previous and next page",
    zoomed: "Enlarged image", actual: "Actual size", fit: "Fit to width", prev: "Previous", next: "Next",
    result: "result", results: "results", noResults: "No results for", resources: "Other resources",
    read: "Read", zoom: "Enlarge", interactive: "Open interactive", hubs: "Hubs", owner: "Owner",
    version: "Version", internal: "Internal document",
  },
};

/** The marker a missing fact carries in client-facing text, so the audit can count it per page. */
export const PENDING = "[por confirmar]";

/**
 * The artifact host's page limit is 16 MB; the warning fires a megabyte early because embedded
 * logos and textures are base64 and grow by a third.
 */
const SIZE_WARN = 15 * 1024 * 1024;

/** A refusal: the hub would publish broken, so nothing is written. */
class Refusal extends Error {}

const hexToRgb = (hex) => {
  let h = String(hex).trim().replace(/^#/, "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Refusal(`invalid colour: #${h}`);
  return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
};

const rgbToHex = (rgb) => `#${rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("")}`;

/** Mixes colour `a` toward `b` by `t` (0 is `a`, 1 is `b`). */
export const mix = (a, b, t) => {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  return rgbToHex(x.map((v, i) => v + (y[i] - v) * t));
};

const luminance = (hex) => {
  const ch = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
};

/** WCAG contrast ratio between two colours. */
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Derives every light and dark token from two brand colours, so each hub of a company looks the
 * same without anyone hand-picking sixteen values per theme. `brand.light` and `brand.dark`
 * override any derived token, which is how a new hub matches one already published. Contrast is
 * checked on the pairs a reader depends on; a failure is a warning, not a refusal, because the
 * operator may be matching an existing hub on purpose.
 */
export const buildTokens = (brand, warn) => {
  const c = brand.colors ?? {};
  const primary = c.brand ?? "#1f3a8a";
  const accent = c.accent ?? "#e8730c";
  const accentInk = c.accent_ink || (contrast(accent, "#0d0d0d") >= contrast(accent, "#ffffff") ? "#0d0d0d" : "#ffffff");
  const light = {
    brand: primary, accent, "accent-ink": accentInk,
    bg: "#ffffff", "bg-nav": "#f7f8fb", "bg-inset": "#f0f2f7", fg: "#0d0d0d", "fg-strong": "#1a1a1a", muted: "#5b6474",
    rule: "#e2e5ee", link: primary, "link-fg": "#ffffff", "icon-bg": mix(primary, "#ffffff", 0.9), "icon-fg": primary,
    ok: primary, "warn-bd": accent, "warn-bg": mix(accent, "#ffffff", 0.9), "bad-fg": mix(accent, "#000000", 0.3),
    "note-bg": mix(primary, "#ffffff", 0.93),
    ...(brand.light ?? {}),
  };
  const base = mix("#0b0c14", primary, 0.25);
  const linkDark = mix(primary, "#ffffff", 0.7);
  const dark = {
    bg: base, "bg-nav": mix(base, primary, 0.12), "bg-inset": mix(base, primary, 0.25), fg: "#e8eaf3", "fg-strong": "#ffffff",
    muted: "#a3aac4", rule: mix(base, "#ffffff", 0.12), link: linkDark, "link-fg": base,
    "icon-bg": mix(base, linkDark, 0.16), "icon-fg": mix(linkDark, "#ffffff", 0.3), ok: linkDark,
    "warn-bg": mix(base, accent, 0.16), "bad-fg": mix(accent, "#ffffff", 0.45), "note-bg": mix(base, linkDark, 0.08),
    ...(brand.dark ?? {}),
  };

  for (const [theme, t] of [["light", light], ["dark", dark]]) {
    for (const fg of ["fg", "link", "muted"]) {
      const r = contrast(t[fg], t.bg);
      if (r < 4.5) warn(`low contrast: ${fg} on bg (${theme}) measures ${r.toFixed(1)}:1`);
    }
  }
  if (contrast("#ffffff", primary) < 4.5) {
    warn(`white on the brand colour measures ${contrast("#ffffff", primary).toFixed(1)}:1; the banner and table headers may not read`);
  }
  if (contrast(accentInk, accent) < 4.5) warn(`accent_ink on accent measures ${contrast(accentInk, accent).toFixed(1)}:1`);

  const fonts = brand.fonts ?? {};
  const body = fonts.body ?? "Inter";
  const display = fonts.display ?? body;
  const stack = '"Helvetica Neue", Arial, system-ui, sans-serif';
  const block = (selector, t, scheme) => {
    const lines = Object.entries(t).map(([k, v]) => `  --${k}: ${v};`);
    if (scheme) lines.push(`  color-scheme: ${scheme};`);
    return `${selector} {\n${lines.join("\n")}\n}`;
  };
  const root = {
    ...light,
    "brand-rgb": hexToRgb(primary).join(", "),
    font: `"${body}", ${stack}`,
    "font-display": `"${display}", ${stack}`,
    mono: 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace',
    "header-h": "60px",
  };
  const css =
    `${block(":root", root)}\n` +
    `@media (prefers-color-scheme: dark) {\n${block(':root:not([data-theme="light"])', dark, "dark")}\n}\n` +
    block(':root[data-theme="dark"]', dark, "dark");

  let google = fonts.google;
  if (google === undefined) {
    google = [...new Set([body, display])].sort().map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700;800`).join("&");
  } else if (google && !google.startsWith("family=")) {
    google = `family=${google}`;
  }
  const links = google
    ? '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${google}&display=swap">`
    : "";
  return { css, links };
};

const dataUri = (path) => {
  const mime = mimeOf(path);
  return `data:${mime};base64,${readFileSync(path).toString("base64")}`;
};

/** Width and height of a PNG from its IHDR chunk, so a figure reserves its box before it loads. */
const pngSize = (path) => {
  try {
    const head = Buffer.alloc(24);
    const fd = openSync(path, "r");
    readSync(fd, head, 0, 24, 0);
    closeSync(fd);
    if (head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
      return [head.readUInt32BE(16), head.readUInt32BE(20)];
    }
  } catch {
    return null;
  }
  return null;
};

const INLINE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/**
 * A link, by where it points. A `#id` must name a page of this hub. An `https://` link opens a new
 * tab. A relative path is one of the artifact's own files and opens in the same frame, because the
 * host blocks a support file opened with `target="_blank"` (`ERR_BLOCKED_BY_RESPONSE`). `mailto:`
 * and `tel:` do not work inside an artifact, so the label is kept as text.
 */
const link = (url, labelHtml, ctx, cls = "") => {
  const c = cls ? ` class="${cls}"` : "";
  if (url.startsWith("#")) {
    if (url !== "#" && !ctx.pageIds.has(url.slice(1))) ctx.warn(`internal link to a page that does not exist: ${url}`);
    return `<a${c} href="${escapeHtml(url, true)}">${labelHtml}</a>`;
  }
  if (/^https?:\/\//.test(url)) return `<a${c} href="${escapeHtml(url, true)}" target="_blank" rel="noopener">${labelHtml}</a>`;
  if (url.startsWith("mailto:") || url.startsWith("tel:")) {
    ctx.warn(`mailto:/tel: links do not work inside an artifact; show the value as text: ${url}`);
    return labelHtml;
  }
  if (!existsSync(join(ctx.outDir, url.split("#")[0]))) ctx.warn(`linked file does not exist (it is published beside the hub): ${url}`);
  return `<a${c} href="${escapeHtml(url, true)}">${labelHtml}</a>`;
};

/** Escapes text and applies the three inline forms content may carry: `code`, **bold**, [label](url). */
const inline = (text, ctx) => {
  if (text === undefined || text === null) return "";
  const s = String(text);
  let out = "";
  let pos = 0;
  for (const m of s.matchAll(INLINE)) {
    out += escapeHtml(s.slice(pos, m.index));
    if (m[1] !== undefined) out += `<code>${escapeHtml(m[1])}</code>`;
    else if (m[2] !== undefined) out += `<b>${escapeHtml(m[2])}</b>`;
    else out += link(m[4], escapeHtml(m[3]), ctx);
    pos = m.index + m[0].length;
  }
  return out + escapeHtml(s.slice(pos));
};

const icon = (name, ctx, cls = "i") => {
  let n = name;
  if (!ctx.icons.has(n)) {
    ctx.warn(`unknown icon "${n}"; "info" is used`);
    n = "info";
  }
  return `<svg class="${cls}"><use href="#i-${n}"/></svg>`;
};

/** One content block to HTML. An unknown type refuses the build rather than dropping content silently. */
const renderBlock = (b, ctx) => {
  const t = b.type;
  if (t === "p" || t === "lede" || t === "src") {
    return `<p${t === "p" ? "" : ` class="${t}"`}>${inline(b.text, ctx)}</p>`;
  }
  if (t === "checks") {
    const bad = b.tone === "bad";
    const ico = icon(bad ? "alert" : "check", ctx);
    return `<ul class="checks${bad ? " bad" : ""}">${b.items.map((x) => `<li>${ico}<span>${inline(x, ctx)}</span></li>`).join("")}</ul>`;
  }
  if (t === "aside") {
    const caution = b.tone === "caution";
    const ico = icon(b.icon ?? (caution ? "alert" : "info"), ctx);
    const title = b.title ? `<b>${inline(b.title, ctx)}</b>` : "";
    return `<div class="aside${caution ? " caution" : ""}">${ico}<div>${title}<span>${inline(b.text ?? "", ctx)}</span></div></div>`;
  }
  if (t === "cards") {
    const cards = b.items.map((it) => {
      const ico = `<span class="ico${it.tone === "caution" ? " o" : ""}">${icon(it.icon ?? "arrow-right", ctx)}</span>`;
      let inner = `${ico}<b>${inline(it.title, ctx)}</b><span>${inline(it.text ?? "", ctx)}</span>`;
      const href = it.page ? `#${it.page}` : it.url;
      if (!href) return `<div class="icard">${inner}</div>`;
      inner += `<span class="more">${ctx.t.read} ${icon("arrow-right", ctx)}</span>`;
      return link(href, inner, ctx, "icard");
    });
    return `<div class="cards">${cards.join("")}</div>`;
  }
  if (t === "stats") {
    const items = b.items.map((it) => `<div class="stat">${icon(it.icon ?? "chart", ctx)}<b>${inline(it.value, ctx)}</b><span>${inline(it.label, ctx)}</span></div>`);
    return `<div class="stats">${items.join("")}</div>`;
  }
  if (t === "flow") {
    const items = b.items.map((it) => `<li><span class="ico">${icon(it.icon ?? "check", ctx)}</span><b>${inline(it.title, ctx)}</b><span>${inline(it.text ?? "", ctx)}</span></li>`);
    return `<ol class="flow">${items.join("")}</ol>`;
  }
  if (t === "table") {
    const termFirst = b.term_first ?? true;
    const head = b.columns.map((c) => `<th>${inline(c, ctx)}</th>`).join("");
    const rows = b.rows.map((r) => `<tr>${r.map((v, i) => `<td${i === 0 && termFirst ? ' class="term"' : ""}>${inline(String(v), ctx)}</td>`).join("")}</tr>`);
    return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  }
  if (t === "figure") {
    const src = b.src;
    const path = join(ctx.outDir, src);
    let size = null;
    if (!existsSync(path)) ctx.warn(`image does not exist (it is published beside the hub): ${src}`);
    else size = pngSize(path);
    const wh = size ? ` width="${size[0]}" height="${size[1]}"` : "";
    if (!b.alt) ctx.warn(`image without alt text: ${src}`);
    let actions = `<button type="button" class="ghost" data-full="${escapeHtml(src, true)}">${icon("zoom", ctx)}${ctx.t.zoom}</button>`;
    if (b.interactive) actions += link(b.interactive, icon("arrow-right", ctx) + ctx.t.interactive, ctx, "primary");
    const cap = `<figcaption><span>${icon(b.icon ?? "layers", ctx)}${inline(b.caption ?? "", ctx)}</span><span class="fig-actions">${actions}</span></figcaption>`;
    return (
      `<figure class="fig${b.tall ? " tall" : ""}"><button type="button" class="zoom" data-full="${escapeHtml(src, true)}" aria-label="${ctx.t.zoom}">` +
      `<img src="${escapeHtml(src, true)}" alt="${escapeHtml(b.alt ?? "", true)}" loading="lazy"${wh}>` +
      `<span class="hint">${icon("zoom", ctx)}${ctx.t.zoom}</span></button>${cap}</figure>`
    );
  }
  if (t === "paths") {
    return `<ul class="paths">${b.items.map((it) => `<li><code>${escapeHtml(it.path)}</code><span>${inline(it.text ?? "", ctx)}</span></li>`).join("")}</ul>`;
  }
  if (t === "faq") {
    const items = b.items.map((it) => `<details class="faq"><summary>${icon("chevron", ctx)}${inline(it.q, ctx)}</summary><p>${inline(it.a, ctx)}</p></details>`);
    return `<div class="faqs">${items.join("")}</div>`;
  }
  if (t === "chips") return `<div class="chips">${b.items.map((x) => `<span>${inline(x, ctx)}</span>`).join("")}</div>`;
  if (t === "html") {
    ctx.warn(`raw html block on page ${ctx.page}: review it by hand`);
    return b.html;
  }
  throw new Refusal(`unknown block type ${JSON.stringify(t)} (page ${ctx.page})`);
};

const renderPage = (p, group, ctx, first) => {
  ctx.page = p.id;
  const bn = p.banner ?? {};
  const bgAttr = Number.isInteger(bn.bg) && bn.bg >= 0 && bn.bg < ctx.bgCount ? ` data-bg="${bn.bg}"` : "";
  const parts = [
    `<article class="page" id="p-${p.id}" data-title="${escapeHtml(p.title, true)}"${first ? "" : " hidden"}>`,
    `  <div class="banner"${bgAttr}>`,
    `    <span class="badge-ico">${icon(bn.icon ?? p.icon ?? "sparkle", ctx)}</span>`,
    `    <span class="crumb">${icon(bn.crumb_icon ?? group.icon ?? "home", ctx)}${inline(bn.crumb ?? group.title, ctx)}</span>`,
    `    <h1>${inline(bn.h1 ?? p.title, ctx)}</h1>`,
    '    <div class="bar" aria-hidden="true"></div>',
  ];
  if (bn.lede) parts.push(`    <p>${inline(bn.lede, ctx)}</p>`);
  parts.push("  </div>");
  for (const s of p.sections ?? []) {
    parts.push('  <section class="doc">');
    if (s.title) parts.push(`    <h2><span class="h-ico">${icon(s.icon ?? "info", ctx)}</span>${inline(s.title, ctx)}</h2>`);
    for (const b of s.blocks ?? []) parts.push(`    ${renderBlock(b, ctx)}`);
    parts.push("  </section>");
  }
  parts.push("</article>");
  return parts.join("\n");
};

/**
 * The sibling-hub switcher. A sibling opens in a new tab because it is another artifact, which the
 * host allows; the current hub links to its own first page. Fewer than two hubs renders nothing.
 */
const hubsNav = (hubs, cls, ctx, firstId) => {
  if (!hubs || hubs.length < 2) return "";
  const items = hubs.map((h) => {
    const name = escapeHtml(h.name);
    if (h.current) return `<a href="#${firstId}" aria-current="page">${name}</a>`;
    if (!/^https?:\/\//.test(h.url ?? "")) ctx.warn(`hub "${h.name}" has no absolute url`);
    return `<a href="${escapeHtml(h.url ?? "#", true)}" target="_blank" rel="noopener">${name}</a>`;
  });
  return `<nav class="${cls}" aria-label="${ctx.t.hubs}">${items.join('<span aria-hidden="true">|</span>')}</nav>`;
};

/**
 * Assembles a hub. Returns the HTML and every warning; throws a `Refusal` for content that would
 * publish broken (duplicate or malformed page ids, an unknown block, an unreplaced marker, a
 * `<!doctype>` the viewer would nest). Pure apart from reading the template and the brand files,
 * so the suite can build a hub without a CLI.
 */
export const buildHub = ({ brand, content, brandDir, outDir, templateDir = HERE }) => {
  const warnings = [];
  const warn = (m) => warnings.push(m);
  const hub = content.hub ?? {};
  if (!hub.name) throw new Refusal("hub.name is required");
  const lang = String(hub.lang ?? brand.lang ?? "es").slice(0, 2);
  const t = { ...(I18N[lang] ?? I18N.es), ...(content.i18n ?? {}) };

  const shell = readFileSync(join(templateDir, "shell.html"), "utf8");
  const sprite = readFileSync(join(templateDir, "icons.svg"), "utf8");
  const icons = new Set([...sprite.matchAll(/id="i-([a-z0-9-]+)"/g)].map((m) => m[1]));

  const groups = content.groups ?? [];
  const pages = groups.flatMap((g) => (g.pages ?? []).map((p) => [g, p]));
  if (!pages.length) throw new Refusal("the hub has no pages");
  const ids = pages.map(([, p]) => p.id);
  const dup = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (dup.length) throw new Refusal(`duplicate page ids: ${dup.sort().join(", ")}`);
  for (const id of ids) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id ?? "")) throw new Refusal(`invalid page id "${id}": lowercase, digits and hyphens only (it is the #anchor)`);
  }

  const bgCss = [];
  for (const [n, file] of (brand.banner_images ?? []).entries()) {
    const path = join(brandDir, file);
    if (existsSync(path)) bgCss.push(`[data-bg="${n}"] { background-image: url(${dataUri(path)}); }`);
    else warn(`banner texture does not exist: ${path}`);
  }

  const ctx = { icons, pageIds: new Set(ids), outDir, t, page: "", bgCount: bgCss.length, warn };
  const { css: tokens, links: fontLinks } = buildTokens(brand, warn);

  const name = brand.name ?? "Empresa";
  const logos = [];
  for (const [key, cls] of [["logo_light", "logo-light"], ["logo_dark", "logo-dark"]]) {
    if (!brand[key]) continue;
    const path = join(brandDir, brand[key]);
    if (existsSync(path)) logos.push(`<img class="${cls}" src="${dataUri(path)}" alt="${escapeHtml(name, true)}">`);
    else warn(`logo does not exist: ${path}`);
  }
  if (logos.length === 1) {
    logos.push(logos[0].includes("logo-light") ? logos[0].replace("logo-light", "logo-dark") : logos[0].replace("logo-dark", "logo-light"));
  }
  const brandHtml = logos.join("") || `<span class="wordmark">${escapeHtml(name)}</span>`;

  const first = ids[0];
  const hubs = content.hubs ?? [];
  if (hubs.length >= 2 && hubs.filter((h) => h.current).length !== 1) warn('exactly one hub in "hubs" must carry "current": true');
  let top = hubsNav(hubs, "hubs", ctx, first);
  if (top) top = `<i class="sep" aria-hidden="true"></i>\n  ${top}`;

  const groupsHtml = groups.map((g) => {
    const items = (g.pages ?? []).map((p) => `\n      <li><a href="#${p.id}">${icon(p.icon ?? "file", ctx)}${escapeHtml(p.title)}</a></li>`).join("");
    return `    <div class="group"><div class="group-title">${escapeHtml(g.title)}</div><ul>${items}\n    </ul></div>`;
  });

  const resources = content.resources ?? [];
  const resourcesHtml = resources.length
    ? `    <div class="nav-foot">\n      <p>${t.resources}</p>${resources
        .map((r) => `\n      ${link(r.url, `${icon(r.icon ?? "external", ctx, "i ri")}<span>${escapeHtml(r.label)}</span>${/^https?:\/\//.test(r.url) ? icon("external", ctx) : ""}`, ctx)}`)
        .join("")}\n    </div>`
    : "";

  const pagesHtml = pages.map(([g, p], i) => renderPage(p, g, ctx, i === 0)).join("\n\n");

  let footer = hub.footer;
  if (!footer) {
    const left = [`<b>${escapeHtml(name)}</b>`, escapeHtml(hub.name)];
    if (hub.internal ?? true) left.push(t.internal);
    left.push(`${t.owner}: ${escapeHtml(hub.owner || PENDING)}`);
    if (hub.version) left.push(`${t.version} ${escapeHtml(String(hub.version))}`);
    if (hub.date) left.push(escapeHtml(hub.date));
    footer = `<span>${left.join(" · ")}</span><span>${inline(hub.footer_right ?? "", ctx)}</span>`;
  }
  if (!hub.owner) warn(`the hub has no owner (hub.owner): the footer will read ${PENDING}`);

  const docTitle = `${name} - ${hub.name}`;
  const rep = {
    DOC_TITLE: escapeHtml(docTitle), FONT_LINKS: fontLinks, TOKENS: tokens, BANNER_BG_CSS: bgCss.join("\n"),
    SPRITE: sprite, BRAND: brandHtml, FIRST_PAGE: first, HUBS_TOP: top,
    HUBS_MOBILE: hubsNav(hubs, "hubs hubs-m", ctx, first), SIDEBAR_GROUPS: groupsHtml.join("\n"), RESOURCES: resourcesHtml,
    PAGES: pagesHtml, FOOTER: footer, I18N_JSON: JSON.stringify(t), HUB_NAME_JSON: JSON.stringify(docTitle),
    T_MENU: t.menu, T_SEARCH: t.search, T_THEME: t.theme, T_LIGHT: t.light, T_AUTO: t.auto, T_DARK: t.dark,
    T_RESULTS: t.results_label, T_PAGES: t.pages, T_PAGER: t.pager, T_ZOOMED: t.zoomed, T_ACTUAL: t.actual, T_CLOSE: t.close,
  };
  const html = shell.replace(/%%([A-Z0-9_]+)%%/g, (m, k) => (Object.hasOwn(rep, k) ? rep[k] : m));
  const left = [...new Set(html.match(/%%[A-Z0-9_]+%%/g) ?? [])];
  if (left.length) throw new Refusal(`unreplaced markers: ${left.sort().join(", ")}`);
  if (html.slice(0, 200).toLowerCase().includes("<!doctype")) throw new Refusal("the page must not carry <!doctype>: the viewer adds the skeleton");
  const bytes = Buffer.byteLength(html, "utf8");
  if (bytes > SIZE_WARN) warn(`the hub weighs ${(bytes / 1048576).toFixed(1)} MB; an artifact page is limited to 16 MB — move images to support files`);
  return { html, warnings, pages: ids.length, bytes };
};

const readJson = (path, what) => {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    process.stderr.write(`cannot read ${what} ${path}: ${String(err.message).split("\n")[0]}\n`);
    process.exit(2);
  }
};

const main = () => {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    process.exit(0);
  }
  const brandPath = option(argv, "--brand");
  const contentPath = option(argv, "--content");
  const out = option(argv, "--out");
  if (!brandPath || !contentPath || !out) {
    process.stderr.write("--brand, --content and --out are required (see --help)\n");
    process.exit(2);
  }
  const brand = readJson(brandPath, "brand");
  const content = readJson(contentPath, "content");
  const outPath = resolve(out);
  mkdirSync(dirname(outPath), { recursive: true });
  try {
    const r = buildHub({
      brand,
      content,
      brandDir: dirname(resolve(brandPath)),
      outDir: dirname(outPath),
      templateDir: resolve(option(argv, "--template") ?? HERE),
    });
    writeFileSync(outPath, r.html, "utf8");
    process.stdout.write(`OK ${outPath} · ${r.pages} pages · ${Math.round(r.bytes / 1024)} KB\n`);
    for (const w of r.warnings) process.stdout.write(`WARNING: ${w}\n`);
  } catch (err) {
    if (!(err instanceof Refusal)) throw err;
    process.stderr.write(`refused: ${err.message}\n`);
    process.exit(1);
  }
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
