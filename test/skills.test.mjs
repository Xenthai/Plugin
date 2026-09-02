import { readFileSync, readdirSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKILLS = join(ROOT, "skills");
const SANDBOX = join(HERE, "sandbox", "skills");

const names = readdirSync(SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

/**
 * Frontmatter keys and body of a SKILL.md. Claude Code reads only `name` and `description` at
 * startup; a third key is silently ignored, so it looks like configuration and behaves like a
 * comment. Returning the keys is what lets the suite refuse one.
 */
const parse = (text) => {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { keys: [], front: "", body: text };
  return {
    keys: [...m[1].matchAll(/^([A-Za-z_-]+):/gm)].map((k) => k[1]),
    front: m[1],
    body: m[2],
  };
};

/**
 * Skills whose description names a sibling skill and the condition that sends work there. Without
 * it the router either fires for everything or never fires, and the measured failure mode is
 * under-triggering.
 */
const MUST_ROUTE = ["social", "process", "company-new", "company-intake", "company-offer", "baseline", "social-presence", "automate-handover"];

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("every skill is one level deep, which is the only depth that loads", () => {
  const nested = [];
  for (const n of names) {
    const inner = readdirSync(join(SKILLS, n), { withFileTypes: true }).filter((e) => e.isDirectory());
    for (const d of inner) {
      if (existsSync(join(SKILLS, n, d.name, "SKILL.md"))) nested.push(`${n}/${d.name}`);
    }
  }
  return [nested.length === 0, nested.length ? `nested skills never load: ${nested.join(", ")}` : `${names.length} at depth 1`];
});

check("every skill declares exactly name and description", () => {
  const bad = [];
  for (const n of names) {
    const { keys } = parse(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"));
    const ok = keys.length === 2 && keys.includes("name") && keys.includes("description");
    if (!ok) bad.push(`${n}: ${keys.join("+") || "no frontmatter"}`);
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : `${names.length} skills, name+description only`];
});

check("every skill's name equals its directory", () => {
  const bad = [];
  for (const n of names) {
    const { front } = parse(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"));
    const declared = /^name:\s*(.+)$/m.exec(front)?.[1]?.trim();
    if (declared !== n) bad.push(`${n} declares "${declared}"`);
  }
  return [bad.length === 0, bad.length ? bad.join("; ") : "all match"];
});

check("every skill body is between 2 and 12 KB", () => {
  const sizes = names.map((n) => {
    const { body } = parse(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"));
    return [n, Buffer.byteLength(body, "utf8")];
  });
  const bad = sizes.filter(([, b]) => b < 2048 || b > 12288);
  const span = `${Math.min(...sizes.map((s) => s[1]))}–${Math.max(...sizes.map((s) => s[1]))} bytes`;
  return [
    bad.length === 0,
    bad.length ? bad.map(([n, b]) => `${n} ${b}B`).join(", ") : `${sizes.length} bodies, ${span}`,
  ];
});

/**
 * A description's job is to say WHEN the skill applies. The measured failure mode is
 * under-triggering, not collision: a description summarising the workflow reads as documentation
 * and the model skips it. Any temporal or conditional clause satisfies this — the phrasing is free.
 */
const TRIGGER = /\b(when|whenever|after|before|at the (very )?start)\b/i;

check("every description says WHEN, never HOW", () => {
  const bad = names.filter((n) => {
    const { front } = parse(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"));
    const d = /description:\s*([\s\S]*?)(?=\n[a-z_-]+:|$)/.exec(front)?.[1] ?? "";
    return !TRIGGER.test(d);
  });
  return [
    bad.length === 0,
    bad.length ? `no trigger clause: ${bad.join(", ")}` : `${names.length} descriptions carry a trigger clause`,
  ];
});

check("routers and phase entries name a sibling and the condition that sends work there", () => {
  const bad = MUST_ROUTE.filter((n) => {
    const { front } = parse(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"));
    const siblings = names.filter((s) => s !== n && front.includes(s));
    return siblings.length === 0;
  });
  return [
    bad.length === 0,
    bad.length ? `no sibling named: ${bad.join(", ")}` : `${MUST_ROUTE.length} route by name`,
  ];
});

check("every skill states its STOP conditions", () => {
  const bad = names.filter(
    (n) => !/^#{2,3}\s+.*STOP conditions/im.test(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8"))
  );
  return [bad.length === 0, bad.length ? `no STOP section: ${bad.join(", ")}` : `${names.length} declare when to stop`];
});

check("the plugin root is announced once by the hook, not repeated in every skill", () => {
  const hook = readFileSync(join(ROOT, "hooks", "bootstrap.mjs"), "utf8");
  const announces = /CLAUDE_PLUGIN_ROOT/.test(hook) && /additionalContext/.test(hook);
  const repeats = names.filter((n) => /guaranteed inside hooks/.test(readFileSync(join(SKILLS, n, "SKILL.md"), "utf8")));
  return [
    announces && repeats.length === 0,
    announces
      ? repeats.length
        ? `the hook announces it, yet ${repeats.length} skills still repeat the caveat`
        : "announced once at SessionStart, repeated nowhere"
      : "the bootstrap hook does not announce the root, so the skills would have to",
  ];
});

/**
 * Policies that appear in more than one skill. Each must appear in EXACTLY ONE wording.
 *
 * The failure this catches is not disobedience — it is that the model reads every loaded
 * instruction and has to reconcile the ones that overlap before it can act. Two skills stating the
 * same policy in non-identical language pay that cost on every invocation, and the published
 * account of removing over 80% of a system prompt with no measurable eval loss names exactly this
 * as the thing that was removed. So a policy stated twice is a defect even when both statements are
 * correct: one of them is redundant and the difference between them is pure overhead.
 */
const SHARED_POLICIES = [
  { name: "how company files are written", fingerprint: /Company files change through/ },
  { name: "where the write policy's reasoning lives", fingerprint: /doctrine\/CONTROLS\.md/ },
];

check("a policy shared across skills is stated in exactly one wording", () => {
  const problems = [];
  for (const { name, fingerprint } of SHARED_POLICIES) {
    const forms = new Map();
    for (const n of names) {
      for (const line of readFileSync(join(SKILLS, n, "SKILL.md"), "utf8").split(/\r?\n/)) {
        if (!fingerprint.test(line)) continue;
        const norm = line.trim().replace(/\s+/g, " ");
        if (!forms.has(norm)) forms.set(norm, []);
        forms.get(norm).push(n);
      }
    }
    if (forms.size > 1) {
      problems.push(
        `${name}: ${forms.size} wordings — ${[...forms.values()].map((s) => s.join("/")).join(" vs ")}`
      );
    }
  }
  return [
    problems.length === 0,
    problems.length ? problems.join("; ") : `${SHARED_POLICIES.length} shared policies, one wording each`,
  ];
});

check("two wordings of one policy would fail", () => {
  const a = "Company files change through `Write` and `Edit` only.";
  const b = "Create and change company files with `Write` and `Edit` only.";
  const forms = new Set([a, b].map((s) => s.trim().replace(/\s+/g, " ")));
  return [forms.size > 1, "the same policy in two wordings was detected as two forms"];
});

check("a skill with a third frontmatter key would fail", () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  mkdirSync(SANDBOX, { recursive: true });
  const p = join(SANDBOX, "SKILL.md");
  writeFileSync(p, "---\nname: fake\ndescription: Use when testing. \nallowed-tools: Read\n---\n\nBody.\n");
  const { keys } = parse(readFileSync(p, "utf8"));
  const passes = keys.length === 2;
  return [!passes, `fixture declared ${keys.join("+")} and was refused`];
});

check("a skill whose name disagrees with its directory would fail", () => {
  const p = join(SANDBOX, "SKILL.md");
  writeFileSync(p, "---\nname: not-the-directory\ndescription: Use when testing. \n---\n\nBody.\n");
  const { front } = parse(readFileSync(p, "utf8"));
  const declared = /^name:\s*(.+)$/m.exec(front)[1].trim();
  return [declared !== "skills", `fixture declared "${declared}" and was refused`];
});

check("a description with no trigger clause would fail", () => {
  const d = "Renders company documents into social pieces using the shared engine.";
  return [!/\b(use when|use at|use it when|use this when)\b/i.test(d), "a HOW-only description was refused"];
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
rmSync(SANDBOX, { recursive: true, force: true });
console.log("");
console.log(`${cases.length - failed}/${cases.length} passed  (${names.length} skills: ${names.join(", ")})`);
process.exit(failed ? 1 : 0);
