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

/** The owner's loop: mined from rounds with an owner, they stay whatever the craft files around them become. */
const FILES = ["PROCESS.md", "MOCKUP.md", "REVIEW-LOOP.md", "PATTERNS.md", "MOTION.md", "PROOF.md", "DELEGATION.md"];

/**
 * The craft the router dispatches to, one responsibility each. UX answers what the person is trying to
 * do and whether they can; UI answers what it looks like and how it moves.
 */
const CHILDREN = [
  "design-ux-research",
  "design-ux-flow",
  "design-ux-copy",
  "design-ux-accessibility",
  "design-ux-evaluate",
  "design-ui-direction",
  "design-ui-system",
  "design-ui-layout",
  "design-ui-motion",
  "design-ui-polish",
  "design-ui-inspect",
];

const childText = Object.fromEntries(
  CHILDREN.map((n) => {
    const p = join(ROOT, "skills", n, "SKILL.md");
    return [n, existsSync(p) ? readFileSync(p, "utf8") : ""];
  })
);
const suiteText = [skill, ...Object.values(childText)].join("\n");

const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(skill);
const frontText = front?.[1] ?? "";
const body = front?.[2] ?? "";

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("every doctrine file is referenced by the router or one of its skills", () => {
  if (!skill) return [false, "skills/design/SKILL.md missing"];
  const missing = doctrineFiles.filter((f) => !suiteText.includes(`capabilities/design/doctrine/${f}`));
  return [missing.length === 0, missing.length ? `not referenced: ${missing.join(", ")}` : `${doctrineFiles.length} doctrine files, all referenced`];
});

check("every child skill exists, and the router names each one", () => {
  const absent = CHILDREN.filter((n) => !childText[n]);
  const unnamed = CHILDREN.filter((n) => !skill.includes(`\`${n}\``));
  return [absent.length === 0 && unnamed.length === 0, `absent: ${absent.join(",") || "none"}; not named by the router: ${unnamed.join(",") || "none"}`];
});

check("the owner's seven files stay, and every other doctrine file is a UX, UI or review file", () => {
  const absent = FILES.filter((f) => !doctrineFiles.includes(f));
  const stray = doctrineFiles.filter((f) => !FILES.includes(f) && !/^(UX|UI)-[A-Z-]+\.md$|^REVIEW\.md$/.test(f));
  return [absent.length === 0 && stray.length === 0, `absent: ${absent.join(",") || "none"}; stray: ${stray.join(",") || "none"}`];
});

check("every doctrine file any design skill names exists", () => {
  const named = [...suiteText.matchAll(/capabilities\/design\/doctrine\/([A-Z-]+\.md)/g)].map((m) => m[1]);
  const ghosts = [...new Set(named)].filter((f) => !existsSync(join(DOCTRINE, f)));
  return [named.length > 0 && ghosts.length === 0, ghosts.length ? `named but absent: ${ghosts.join(", ")}` : `${new Set(named).size} names resolve`];
});

check("every reference-table row states the condition for opening the file", () => {
  const rows = suiteText.split(/\r?\n/).filter((l) => /^\| `capabilities\/[a-z]+\/doctrine\//.test(l));
  const bare = rows.filter((l) => (l.split("|")[2] ?? "").trim().length < 15);
  return [rows.length >= FILES.length && bare.length === 0, `${rows.length} rows, ${bare.length} without a condition`];
});

check("no doctrine file or design skill carries a product, ticket, decision number or brand from the source work", () => {
  const leaks = [];
  for (const [f, text] of Object.entries({ ...doctrine, design: skill, ...childText })) {
    const line = text.split(/\r?\n/).find((l) => LEAKS.test(l));
    if (line) leaks.push(`${f}: ${line.trim().slice(0, 60)}`);
  }
  return [leaks.length === 0, leaks.length ? leaks.join("; ") : "no source-product names"];
});

check("a leaked product name, ticket id, decision number or brand would be caught", () => {
  const samples = ["see SUL-1234 for the fix", "decided in D378", "the Conecta panel does this", "PR #302 merged it", "Xenth AI shipped it", "the Pendientes page"];
  const caught = samples.filter((s) => LEAKS.test(s));
  const allowed = ["an Instagram post preview", "the WhatsApp chat"].filter((s) => LEAKS.test(s));
  return [caught.length === samples.length && allowed.length === 0, `${caught.length}/${samples.length} samples refused, ${allowed.length} channel names wrongly refused`];
});

check("the router's frontmatter is exactly name and description", () => {
  const keys = [...frontText.matchAll(/^([A-Za-z_-]+):/gm)].map((k) => k[1]);
  return [keys.length === 2 && keys[0] === "name" && keys[1] === "description" && /^name:\s*design\s*$/m.test(frontText), `keys: ${keys.join(", ")}`];
});

check("the description states WHEN, routes to engineering, social and brand, and names both families", () => {
  const d = /description:\s*([\s\S]*)$/.exec(frontText)?.[1] ?? "";
  const when = /\b(when|whenever|before|at the start)\b/i.test(d) || /\bUse for\b/.test(d);
  const routed = ["engineering", "social", "brand"].filter((s) => !d.includes(`use ${s}`));
  const families = /design-ux-/.test(d) && /design-ui-/.test(d);
  return [when && routed.length === 0 && families, routed.length ? `not routed: ${routed.join(", ")}` : `trigger clause present, three routes named, both families named: ${families}`];
});

check("the router body sits between 2 and 12 KB", () => {
  const n = Buffer.byteLength(body, "utf8");
  return [n >= 2048 && n <= 12288, `${n} bytes`];
});

check("research-stage work routes to design-ux-research, and nothing routes outside the plugin", () => {
  const routed = /research[\s\S]{0,200}`design-ux-research`/.test(body);
  const outside = /`intent`|ghaida/.test(suiteText);
  return [routed && !outside, `routes research inside: ${routed}; names an outside family: ${outside}`];
});

check("the router states STOP conditions and an always-on rules list", () => {
  const stop = /^## STOP conditions/m.test(skill);
  const rules = /^## \d+ · Always-on rules/m.test(skill);
  return [stop && rules, `STOP: ${stop}, always-on rules: ${rules}`];
});

check("every doctrine file declares what it implements, closes with a checklist and stays under 8.5 KB", () => {
  const bad = Object.entries(doctrine).filter(([, t]) => !/^Implements: /m.test(t) || !/^## Before you finish/m.test(t) || Buffer.byteLength(t, "utf8") > 8704).map(([f]) => f);
  return [bad.length === 0, bad.length ? `defective: ${bad.join(", ")}` : `${doctrineFiles.length} files comply`];
});

check("no doctrine file or design skill carries an emoji", () => {
  const bad = Object.entries({ ...doctrine, "SKILL.md": skill, ...childText }).filter(([, t]) => /\p{Extended_Pictographic}/u.test(t)).map(([f]) => f);
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

check("a stray doctrine file or an outside research family would be refused", () => {
  const stray = !/^(UX|UI)-[A-Z-]+\.md$|^REVIEW\.md$/.test("NOTES.md");
  const outside = /`intent`|ghaida/.test("For research use `intent` first.");
  return [stray && outside, `stray refused: ${stray}; outside family caught: ${outside}`];
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
