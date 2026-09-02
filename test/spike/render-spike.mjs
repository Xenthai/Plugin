import { chromium } from "playwright-core";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");

const CHANNELS = ["msedge", "chrome", "msedge-beta", "chrome-beta"];

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,400..800" +
  "&family=Hanken+Grotesk:wght@400..600&family=JetBrains+Mono:wght@400..500&display=swap";

const PROBE = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="${FONTS_HREF}">
<style>
  html,body{margin:0;background:#000;color:#f2f5f9}
  body{width:1080px;height:1080px;display:flex;flex-direction:column;
       justify-content:center;gap:24px;padding:80px;box-sizing:border-box}
  .m{font-family:"Archivo",sans-serif;font-weight:700;font-size:64px;
     text-transform:uppercase;line-height:0.98;white-space:nowrap;
     display:inline-block;letter-spacing:-0.01em;
     align-self:flex-start;width:max-content}
  #w100{font-stretch:100%}
  #w116{font-stretch:116%}
  #vs  {font-variation-settings:"wdth" 116}
  #body{font-family:"Hanken Grotesk",sans-serif;font-size:23px;color:#b9c3d1}
  #mono{font-family:"JetBrains Mono",monospace;font-size:23px;color:#dce9ff}
  #sig {color:#dce9ff}
</style>
<span class="m" id="w100">TU EMPRESA MÁS INTELIGENTE</span>
<span class="m" id="w116">TU EMPRESA MÁS INTELIGENTE</span>
<span class="m" id="vs">TU EMPRESA MÁS INTELIGENTE</span>
<p id="body">Acentos y diacríticos: á é í ó ú ñ ü ¿ ¡ — prueba de es-MX.</p>
<p id="mono">03:14 &middot; IA &nbsp; cotización #4471 &rarr; enviada</p>
<p id="sig">bloque de color de señal</p>`;

const findChannel = async () => {
  const tried = [];
  for (const channel of CHANNELS) {
    try {
      const browser = await chromium.launch({ channel });
      return { browser, channel, tried };
    } catch (err) {
      tried.push(`${channel}: ${String(err.message).split("\n")[0].slice(0, 110)}`);
    }
  }
  return { browser: null, channel: null, tried };
};

const run = async () => {
  mkdirSync(OUT, { recursive: true });

  const { browser, channel, tried } = await findChannel();
  if (!browser) {
    console.log("FALLA: ningun canal del sistema disponible");
    tried.forEach((t) => console.log("  " + t));
    process.exit(1);
  }
  console.log(`canal usado: ${channel}`);
  if (tried.length) tried.forEach((t) => console.log(`  (descartado) ${t}`));

  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.setContent(PROBE, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  const probe = await page.evaluate(() => {
    const width = (id) => {
      const el = document.getElementById(id);
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = Array.from(range.getClientRects());
      const textWidth = rects.length
        ? Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left))
        : el.getBoundingClientRect().width;
      return Math.round(textWidth * 100) / 100;
    };
    const usedFamily = (id) => {
      const el = document.getElementById(id);
      return getComputedStyle(el).fontFamily;
    };
    return {
      loadedFaces: Array.from(document.fonts).filter((f) => f.status === "loaded").length,
      families: [...new Set(Array.from(document.fonts).map((f) => f.family))].sort(),
      archivoLoaded: document.fonts.check('700 64px Archivo'),
      hankenLoaded: document.fonts.check('400 23px "Hanken Grotesk"'),
      monoLoaded: document.fonts.check('400 23px "JetBrains Mono"'),
      w100: width("w100"),
      w116: width("w116"),
      wVarSettings: width("vs"),
      computedStretch116: getComputedStyle(document.getElementById("w116")).fontStretch,
      familyOnHeadline: usedFamily("w100"),
      signalColor: getComputedStyle(document.getElementById("sig")).color,
      docSize: [document.body.offsetWidth, document.body.offsetHeight],
    };
  });

  const shot = join(OUT, "spike-1080.png");
  await page.screenshot({ path: shot, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
  await browser.close();

  const deltaStretch = Math.round((probe.w116 - probe.w100) * 100) / 100;
  const deltaVarSettings = Math.round((probe.wVarSettings - probe.w100) * 100) / 100;
  const pctStretch = Math.round((deltaStretch / probe.w100) * 1000) / 10;

  const checks = [
    ["canal del sistema sin descarga", true, channel],
    ["Archivo cargada", probe.archivoLoaded, probe.archivoLoaded],
    ["Hanken Grotesk cargada", probe.hankenLoaded, probe.hankenLoaded],
    ["JetBrains Mono cargada", probe.monoLoaded, probe.monoLoaded],
    [
      "font-stretch mueve el eje wdth",
      deltaStretch > 1,
      `100%=${probe.w100}px  116%=${probe.w116}px  delta=${deltaStretch}px (${pctStretch}%)`,
    ],
    [
      "font-variation-settings mueve el eje",
      deltaVarSettings > 1,
      `delta=${deltaVarSettings}px`,
    ],
    [
      "font-family efectiva es Archivo (sin sustitucion)",
      /Archivo/i.test(probe.familyOnHeadline),
      probe.familyOnHeadline,
    ],
    [
      "tamano exacto 1080x1080",
      probe.docSize[0] === 1080 && probe.docSize[1] === 1080,
      probe.docSize.join("x"),
    ],
    ["color de senal exacto", probe.signalColor === "rgb(220, 233, 255)", probe.signalColor],
    ["PNG escrito y con peso razonable", statSync(shot).size > 8000, statSync(shot).size + " B"],
  ];

  console.log("");
  let failed = 0;
  for (const [name, ok, detail] of checks) {
    if (!ok) failed++;
    console.log(`${ok ? "OK  " : "FALLA"} ${name}  ->  ${detail}`);
  }

  console.log("");
  console.log(`familias detectadas: ${probe.families.join(", ")}`);
  console.log(`caras cargadas: ${probe.loadedFaces}`);
  console.log(`computed font-stretch en el nodo de 116%: ${probe.computedStretch116}`);
  console.log(`captura: ${shot}`);
  console.log("");
  console.log(failed ? `${failed} verificacion(es) fallaron` : "todas las verificaciones pasaron");
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error("ERROR NO CONTROLADO:", err);
  process.exit(1);
});
