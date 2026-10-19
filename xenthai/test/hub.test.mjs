import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

import { auditHub, crossCheck } from "../capabilities/hub/engine/audit.mjs";
import { buildHub, contrast } from "../capabilities/hub/engine/build.mjs";
import { checkHub } from "../capabilities/hub/engine/check.mjs";
import { stripSkeleton, VIEWER_SKELETON } from "../capabilities/hub/engine/shared.mjs";
import { addToSwitcher, SwitcherRefusal } from "../capabilities/hub/engine/switcher.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const ENGINE = join(ROOT, "capabilities", "hub", "engine");
const DOCTRINE = join(ROOT, "capabilities", "hub", "doctrine");
const TEMPLATES = join(ROOT, "capabilities", "hub", "templates");
const SANDBOX = join(HERE, "sandbox", "hub");

const brand = JSON.parse(readFileSync(join(ENGINE, "examples", "brand.example.json"), "utf8"));
const content = JSON.parse(readFileSync(join(ENGINE, "examples", "content.example.json"), "utf8"));
const clone = (o) => JSON.parse(JSON.stringify(o));

/** The five skills of the hub family; the router decides which hubs, the others own one step each. */
const CHILDREN = ["hub-intake", "hub-build", "hub-atlas", "hub-audit"];

/**
 * A client-name, vendor or ticket leak in the shared doctrine would ride into every company that
 * installs the plugin. The hub material was written from one engagement's hubs, so this is the
 * failure worth guarding.
 */
const LEAKS = /\bSUL-[0-9]+|Sulfinance|Kuspit|Monato|Tazapay|EnXinga|Conecta\b/;

const png = (w, h) => {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
  const raw = Buffer.concat(Array.from({ length: h }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3, 0xff)])));
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
};

/** A hub folder with the example's support files present, so no warning is about a missing file. */
const fixtureDir = () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  const dir = join(SANDBOX, "hub");
  mkdirSync(join(dir, "img"), { recursive: true });
  mkdirSync(join(dir, "d"), { recursive: true });
  writeFileSync(join(dir, "img", "ejemplo.png"), png(400, 200));
  writeFileSync(join(dir, "d", "ejemplo.html"), "<!doctype html><title>d</title><div class=\"diagram-container\">d</div>");
  return dir;
};

const build = (c = content, b = brand, outDir = fixtureDir()) => buildHub({ brand: b, content: c, brandDir: join(ENGINE, "examples"), outDir });

const refusal = (fn) => {
  try {
    fn();
    return null;
  } catch (err) {
    return err.message;
  }
};

const cli = (script, args) => spawnSync(process.execPath, [join(ENGINE, script), ...args], { encoding: "utf8", cwd: ROOT });

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("every engine CLI answers --help and exits 0", () => {
  const bad = ["build.mjs", "check.mjs", "switcher.mjs", "audit.mjs", "capture.mjs"].filter((s) => {
    const r = cli(s, ["--help"]);
    return r.status !== 0 || !/Usage:/.test(r.stdout);
  });
  return [bad.length === 0, bad.length ? `no help: ${bad.join(", ")}` : "5 CLIs answer --help"];
});

check("the example hub builds clean: no doctype, no marker left, every page and the switcher present", () => {
  const r = build();
  const ok =
    r.warnings.length === 0 &&
    r.html.startsWith("<title>") &&
    !/%%[A-Z0-9_]+%%/.test(r.html) &&
    r.pages === 3 &&
    (r.html.match(/<nav class="hubs/g) ?? []).length === 2 &&
    r.html.includes('"menu":"Menú"');
  return [ok, `${r.pages} pages, ${r.warnings.length} warnings${r.warnings.length ? `: ${r.warnings.join("; ")}` : ""}`];
});

check("a duplicate page id, a malformed id and an unknown block type are each refused", () => {
  const dup = clone(content);
  dup.groups[1].pages[1].id = "pedido";
  const bad = clone(content);
  bad.groups[0].pages[0].id = "Introducción";
  const unknown = clone(content);
  unknown.groups[0].pages[0].sections[0].blocks.push({ type: "video", src: "x.mp4" });
  const got = [refusal(() => build(dup)), refusal(() => build(bad)), refusal(() => build(unknown))];
  const ok = /duplicate/.test(got[0] ?? "") && /invalid page id/.test(got[1] ?? "") && /unknown block type/.test(got[2] ?? "");
  return [ok, got.map((g) => g ?? "(accepted)").join(" | ")];
});

check("a missing owner, a broken internal link, a missing image, a mailto and low contrast each warn", () => {
  const c = clone(content);
  delete c.hub.owner;
  c.groups[0].pages[0].sections[0].blocks.push({ type: "p", text: "Ver [la página](#no-existe) o [escribir](mailto:a@b.mx)." });
  c.groups[1].pages[0].sections[1].blocks[0].src = "img/falta.png";
  const b = clone(brand);
  b.colors.brand = "#ffd84d";
  const w = build(c, b).warnings.join("\n");
  const want = [/no owner/, /page that does not exist: #no-existe/, /image does not exist.*falta\.png/, /mailto/, /white on the brand colour/];
  const missed = want.filter((rx) => !rx.test(w)).map(String);
  return [missed.length === 0, missed.length ? `not warned: ${missed.join(", ")}` : "5 defects, 5 warnings"];
});

check("contrast is WCAG's: black on white is 21:1 and a colour on itself is 1:1", () => {
  const a = contrast("#000000", "#ffffff");
  const b = contrast("#14532d", "#14532d");
  return [Math.abs(a - 21) < 1e-9 && Math.abs(b - 1) < 1e-9, `${a.toFixed(2)} and ${b.toFixed(2)}`];
});

check("text is escaped and a sibling hub opens in a new tab while an own file never does", () => {
  const c = clone(content);
  c.groups[0].pages[0].sections[0].blocks.push({ type: "p", text: "<script>alert(1)</script> y [mapa](d/ejemplo.html)" });
  const html = build(c).html;
  const escaped = html.includes("&lt;script&gt;alert(1)&lt;/script&gt;");
  const ownSameFrame = /<a href="d\/ejemplo\.html">mapa<\/a>/.test(html);
  const siblingNewTab = /href="https:\/\/claude\.ai\/artifact\/EJEMPLO-PRODUCTO" target="_blank"/.test(html);
  return [escaped && ownSameFrame && siblingNewTab, `escaped=${escaped} own=${ownSameFrame} sibling=${siblingNewTab}`];
});

check("the switcher adds a hub to both navs in order, changes nothing else, and refuses a repeat", () => {
  const html = build().html;
  const out = addToSwitcher(`${VIEWER_SKELETON}${html}\n</body></html>`, { name: "Hub de IA", url: "https://claude.ai/artifact/IA", after: "Hub de Producto" });
  const navs = out.match(/<nav class="hubs[^"]*"[^>]*>[\s\S]*?<\/nav>/g) ?? [];
  const ordered = navs.every((n) => /Hub de Producto<\/a><span aria-hidden="true">\|<\/span><a href="https:\/\/claude\.ai\/artifact\/IA"/.test(n));
  const noSkeleton = !out.toLowerCase().includes("<!doctype");
  let repeat = null;
  try {
    addToSwitcher(out, { name: "Hub de IA", url: "https://x" });
  } catch (err) {
    repeat = err instanceof SwitcherRefusal ? err.message : null;
  }
  return [navs.length === 2 && ordered && noSkeleton && /already/.test(repeat ?? ""), `navs=${navs.length} ordered=${ordered} skeleton-stripped=${noSkeleton} repeat=${repeat}`];
});

check("the switcher refuses a page that does not have exactly two switchers", () => {
  let msg = null;
  try {
    addToSwitcher("<title>x</title><nav class=\"hubs\"><a href=\"#a\">A</a></nav>", { name: "B", url: "https://b" });
  } catch (err) {
    msg = err.message;
  }
  return [/expected 2/.test(msg ?? ""), msg ?? "(accepted)"];
});

check("stripping the viewer skeleton restores the published fragment exactly", () => {
  const html = build().html;
  const back = stripSkeleton(`${VIEWER_SKELETON}${html}\n</body></html>`);
  return [back.trimEnd() === html.trimEnd(), back.trimEnd() === html.trimEnd() ? "round-trips" : "differs"];
});

check("the audit counts pending items per page and reads owner, version and date from the footer", () => {
  const r = auditHub(build().html, "ejemplo");
  const pending = Object.values(r.pending).reduce((a, n) => a + n, 0);
  const ok = r.pages === 3 && pending === 4 && r.version === "1" && r.date === "Enero 2027" && r.issues.length === 0;
  return [ok, `pages=${r.pages} pending=${pending} version=${r.version} date=${r.date} issues=${r.issues.join("; ") || "none"}`];
});

check("the audit flags a client RFC, a credential and a missing owner, and ignores the embedded data", () => {
  const c = clone(content);
  delete c.hub.owner;
  c.groups[0].pages[0].sections[0].blocks.push({ type: "p", text: "Cliente GODE561231GR8, password: hunter2" });
  const r = auditHub(build(c).html);
  const rfc = r.sensitive.some((s) => /RFC.*GODE561231GR8/.test(s));
  const cred = r.sensitive.some((s) => /credential/.test(s));
  const owner = r.issues.some((i) => /names no owner/.test(i));
  return [rfc && cred && owner, `rfc=${rfc} credential=${cred} owner=${owner}`];
});

check("the audit reports hubs whose switchers disagree, and one hub under two urls", () => {
  const a = build().html;
  const b = addToSwitcher(a, { name: "Hub de IA", url: "https://claude.ai/artifact/IA" });
  const c = a.replace("EJEMPLO-PERSONAS", "OTRA-PERSONAS");
  const cross = crossCheck([auditHub(a, "a"), auditHub(b, "b"), auditHub(c, "c")]).join("\n");
  const ok = /switchers disagree/.test(cross) && /"Hub de Personas" appears under different urls/.test(cross);
  return [ok, cross.split("\n")[0] || "(nothing reported)"];
});

check("the build CLI writes the hub and exits 1, writing nothing, on a refusal", () => {
  const dir = fixtureDir();
  const contentPath = join(SANDBOX, "content.json");
  const badPath = join(SANDBOX, "bad.json");
  writeFileSync(contentPath, JSON.stringify(content));
  const bad = clone(content);
  bad.groups[0].pages[0].id = "";
  writeFileSync(badPath, JSON.stringify(bad));
  const brandPath = join(ENGINE, "examples", "brand.example.json");
  const okRun = cli("build.mjs", ["--brand", brandPath, "--content", contentPath, "--out", join(dir, "index.html")]);
  const badOut = join(SANDBOX, "refused", "index.html");
  const badRun = cli("build.mjs", ["--brand", brandPath, "--content", badPath, "--out", badOut]);
  const ok = okRun.status === 0 && existsSync(join(dir, "index.html")) && badRun.status === 1 && !existsSync(badOut);
  return [ok, `ok=${okRun.status} refused=${badRun.status} wrote-refused=${existsSync(badOut)}`];
});

check("the router names every child, and each child exists", () => {
  const router = readFileSync(join(ROOT, "skills", "hub", "SKILL.md"), "utf8");
  const missing = CHILDREN.filter((c) => !router.includes(`\`${c}\``) || !existsSync(join(ROOT, "skills", c, "SKILL.md")));
  return [missing.length === 0, missing.length ? `missing: ${missing.join(", ")}` : `${CHILDREN.length} children routed`];
});

check("every doctrine and template file a hub skill names exists, and every doctrine file is named", () => {
  const bodies = ["hub", ...CHILDREN].map((n) => readFileSync(join(ROOT, "skills", n, "SKILL.md"), "utf8")).join("\n");
  const named = [...bodies.matchAll(/capabilities\/hub\/(doctrine|templates)\/([A-Z-]+\.md)/g)].map((m) => join(ROOT, "capabilities", "hub", m[1], m[2]));
  const dangling = [...new Set(named)].filter((p) => !existsSync(p)).map((p) => p.slice(ROOT.length + 1));
  const orphans = readdirSync(DOCTRINE).filter((f) => !bodies.includes(`capabilities/hub/doctrine/${f}`));
  const unusedTemplates = readdirSync(TEMPLATES).filter((f) => !bodies.includes(`capabilities/hub/templates/${f}`));
  const bad = [...dangling.map((d) => `dangling ${d}`), ...orphans.map((o) => `orphan ${o}`), ...unusedTemplates.map((t) => `unused template ${t}`)];
  return [bad.length === 0, bad.length ? bad.join("; ") : `${readdirSync(DOCTRINE).length} doctrine files, all named`];
});

check("every doctrine file closes with a checklist the session runs before replying", () => {
  const bad = readdirSync(DOCTRINE).filter((f) => !/^## Before you finish/m.test(readFileSync(join(DOCTRINE, f), "utf8")));
  return [bad.length === 0, bad.length ? `no closing checklist: ${bad.join(", ")}` : "all close with one"];
});

check("no hub doctrine, template, example or skill carries a client name or ticket", () => {
  const files = [
    ...readdirSync(DOCTRINE).map((f) => join(DOCTRINE, f)),
    ...readdirSync(TEMPLATES).map((f) => join(TEMPLATES, f)),
    ...readdirSync(join(ENGINE, "examples")).map((f) => join(ENGINE, "examples", f)),
    ...["hub", ...CHILDREN].map((n) => join(ROOT, "skills", n, "SKILL.md")),
  ];
  const bad = files.filter((f) => LEAKS.test(readFileSync(f, "utf8"))).map((f) => f.slice(ROOT.length + 1));
  return [bad.length === 0 && LEAKS.test("ver SUL-123"), bad.length ? bad.join(", ") : `${files.length} files clean, and a leak would be caught`];
});

check("the doctrine is English and the client-facing templates are Spanish", () => {
  const es = (t) => (t.match(/\b(que|de|la|el|los|las|en|con|para|se|del|por|una)\b/gi) ?? []).length / Math.max(1, t.split(/\s+/).length);
  const doctrineHigh = readdirSync(DOCTRINE).filter((f) => es(readFileSync(join(DOCTRINE, f), "utf8")) > 0.12);
  const templatesLow = readdirSync(TEMPLATES).filter((f) => es(readFileSync(join(TEMPLATES, f), "utf8")) < 0.12);
  const bad = [...doctrineHigh.map((f) => `doctrine reads Spanish: ${f}`), ...templatesLow.map((f) => `template reads English: ${f}`)];
  return [bad.length === 0, bad.length ? bad.join("; ") : "doctrine English, templates es-MX"];
});

let failed = 0;
for (const [name, fn] of cases) {
  let ok = false;
  let detail = "";
  try {
    [ok, detail] = fn();
  } catch (err) {
    detail = `threw: ${err.message}`;
  }
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ->  ${detail}` : ""}`);
}

/**
 * The browser pass runs where a browser can be launched (`CHROME_PATH`, or a system channel) and
 * says plainly when it could not, the way the render suites report `browser:fail(none)`: a skip
 * printed as a skip, never counted as a pass.
 */
let browserLine;
let ran = 1;
try {
  const dir = fixtureDir();
  writeFileSync(join(dir, "index.html"), build(content, brand, dir).html);
  const r = await checkHub(dir, { outDir: join(SANDBOX, "shots"), executablePath: process.env.CHROME_PATH });
  const ok = r.problems.length === 0 && r.shots.length > 0;
  if (!ok) failed++;
  browserLine = `${ok ? "PASS" : "FAIL"}  the example hub passes the browser check  ->  ${r.shots.length} screenshots${r.problems.length ? `; ${r.problems.join("; ")}` : ""}`;
} catch (err) {
  if (err.code !== "no-driver" && err.code !== "no-browser") {
    failed++;
    browserLine = `FAIL  the example hub passes the browser check  ->  threw: ${err.message}`;
  } else {
    ran = 0;
    browserLine = `SKIP  the example hub passes the browser check  ->  browser:fail(none): ${err.message.split("\n")[0]}`;
  }
}
console.log(browserLine);

console.log("");
console.log(`${cases.length + ran - failed}/${cases.length + ran} passed${ran ? "" : " (browser check skipped)"}`);
process.exit(failed ? 1 : 0);
