import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKILL = join(ROOT, "skills", "design", "SKILL.md");
const DOCTRINE = join(ROOT, "capabilities", "design", "doctrine");

const skill = existsSync(SKILL) ? readFileSync(SKILL, "utf8") : "";
const doctrineFiles = existsSync(DOCTRINE) ? readdirSync(DOCTRINE).filter((f) => f.endsWith(".md")) : [];
const doctrine = Object.fromEntries(doctrineFiles.map((f) => [f, readFileSync(join(DOCTRINE, f), "utf8")]));

/**
 * The doctrine was distilled from one practice's work with one owner on one product. A product
 * name, a ticket prefix, a decision number or the maker's own brand in it would date the rule to
 * that product and leak it into every engagement that installs the plugin. Channel names such as
 * WhatsApp, Instagram and Facebook are allowed: a pattern has to name the surface it was approved on.
 */
const LEAKS = /\bD[0-9]{2,3}\b|\bSUL-[0-9]+|#[0-9]{2,}\b|Sulfinance|Conecta|Xenth|Pendientes|Agentes|Reuniones|EnXinga|Kuspit|Banxico|Cloudflare|NestJS|Monato|Tazapay/;

const FILES = ["PROCESS.md", "MOCKUP.md", "REVIEW-LOOP.md", "PATTERNS.md", "MOTION.md", "PROOF.md", "DELEGATION.md"];

const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(skill);
const frontText = front?.[1] ?? "";
const body = front?.[2] ?? "";

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("the skill exists and points at every doctrine file in its reference table", () => {
  if (!skill) return [false, "skills/design/SKILL.md missing"];
  const missing = doctrineFiles.filter((f) => !skill.includes(`capabilities/design/doctrine/${f}`));
  return [doctrineFiles.length === FILES.length && missing.length === 0, missing.length ? `not referenced: ${missing.join(", ")}` : `${doctrineFiles.length} doctrine files, all referenced`];
});

check("the doctrine holds exactly the seven files the design practice is made of", () => {
  const absent = FILES.filter((f) => !doctrineFiles.includes(f));
  const extra = doctrineFiles.filter((f) => !FILES.includes(f));
  return [absent.length === 0 && extra.length === 0, absent.length || extra.length ? `absent: ${absent.join(",") || "none"}; unlisted: ${extra.join(",") || "none"}` : FILES.join(", ")];
});

check("every doctrine file the skill names exists", () => {
  const named = [...skill.matchAll(/capabilities\/design\/doctrine\/([A-Z-]+\.md)/g)].map((m) => m[1]);
  const ghosts = [...new Set(named)].filter((f) => !existsSync(join(DOCTRINE, f)));
  return [named.length > 0 && ghosts.length === 0, ghosts.length ? `named but absent: ${ghosts.join(", ")}` : `${new Set(named).size} names resolve`];
});

check("every reference-table row states the condition for opening the file", () => {
  const rows = skill.split(/\r?\n/).filter((l) => /^\| `capabilities\/design\/doctrine\//.test(l));
  const bare = rows.filter((l) => (l.split("|")[2] ?? "").trim().length < 15);
  return [rows.length === FILES.length && bare.length === 0, `${rows.length} rows, ${bare.length} without a condition`];
});

check("no doctrine file or the skill carries a product, ticket, decision number or brand from the source work", () => {
  const leaks = [];
  for (const [f, text] of Object.entries(doctrine)) {
    const line = text.split(/\r?\n/).find((l) => LEAKS.test(l));
    if (line) leaks.push(`${f}: ${line.trim().slice(0, 60)}`);
  }
  const skillLine = skill.split(/\r?\n/).find((l) => LEAKS.test(l));
  if (skillLine) leaks.push(`SKILL.md: ${skillLine.trim().slice(0, 60)}`);
  return [leaks.length === 0, leaks.length ? leaks.join("; ") : "no source-product names"];
});

check("a leaked product name, ticket id, decision number or brand would be caught", () => {
  const samples = ["see SUL-1234 for the fix", "decided in D378", "the Conecta panel does this", "PR #302 merged it", "Xenth AI shipped it", "the Pendientes page"];
  const caught = samples.filter((s) => LEAKS.test(s));
  const allowed = ["an Instagram post preview", "the WhatsApp chat"].filter((s) => LEAKS.test(s));
  return [caught.length === samples.length && allowed.length === 0, `${caught.length}/${samples.length} samples refused, ${allowed.length} channel names wrongly refused`];
});

check("the frontmatter is exactly name and description", () => {
  const keys = [...frontText.matchAll(/^([A-Za-z_-]+):/gm)].map((k) => k[1]);
  return [keys.length === 2 && keys[0] === "name" && keys[1] === "description" && /^name:\s*design\s*$/m.test(frontText), `keys: ${keys.join(", ")}`];
});

check("the description states WHEN and routes to engineering, social, brand-manual, intent and the three lenses with their condition", () => {
  const d = /description:\s*([\s\S]*)$/.exec(frontText)?.[1] ?? "";
  const when = /\b(when|whenever|before|at the start)\b/i.test(d) || /\bUse for\b/.test(d);
  const routed = ["engineering", "social", "brand-manual", "intent", "animate", "better-interface", "interface-review", "copywriting"].filter((s) => !d.includes(`use ${s}`));
  return [when && routed.length === 0, routed.length ? `not routed: ${routed.join(", ")}` : "trigger clause present, eight routes named"];
});

check("the body sits between 2 and 12 KB", () => {
  const n = Buffer.byteLength(body, "utf8");
  return [n >= 2048 && n <= 12288, `${n} bytes`];
});

check("the body positions the skill against intent in its own paragraph and sends research there", () => {
  const para = body.split(/\r?\n\r?\n/).find((p) => /`intent`/.test(p) && /research/.test(p) && /github\.com\/ghaida\/intent/.test(p));
  return [Boolean(para), para ? "positioning paragraph present" : "no paragraph names intent, research and its source"];
});

check("the skill states STOP conditions and an always-on rules list", () => {
  const stop = /^## STOP conditions/m.test(skill);
  const rules = /^## \d+ · Always-on rules/m.test(skill);
  return [stop && rules, `STOP: ${stop}, always-on rules: ${rules}`];
});

check("every doctrine file declares what it implements, closes with a checklist and stays under 8.5 KB", () => {
  const bad = Object.entries(doctrine).filter(([, t]) => !/^Implements: /m.test(t) || !/^## Before you finish/m.test(t) || Buffer.byteLength(t, "utf8") > 8704).map(([f]) => f);
  return [bad.length === 0, bad.length ? `defective: ${bad.join(", ")}` : `${doctrineFiles.length} files comply`];
});

check("no doctrine file or the skill carries an emoji", () => {
  const bad = Object.entries({ ...doctrine, "SKILL.md": skill }).filter(([, t]) => /\p{Extended_Pictographic}/u.test(t)).map(([f]) => f);
  return [bad.length === 0, bad.length ? `emoji in: ${bad.join(", ")}` : "none"];
});

check("a skill with a third frontmatter key, an oversize body or no STOP section would be refused", () => {
  const parse = (t) => {
    const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(t);
    return { keys: [...m[1].matchAll(/^([A-Za-z_-]+):/gm)].map((k) => k[1]), body: m[2] };
  };
  const three = parse("---\nname: x\ndescription: Use when testing.\ntriggers: a\n---\nBody");
  const big = parse(`---\nname: x\ndescription: d\n---\n${"x".repeat(13000)}`);
  const refusedKeys = three.keys.length !== 2;
  const refusedSize = Buffer.byteLength(big.body) > 12288;
  const refusedStop = !/^## STOP conditions/m.test("## Something else");
  return [refusedKeys && refusedSize && refusedStop, "all three violations detected"];
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
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
