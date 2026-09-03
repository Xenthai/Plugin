#!/usr/bin/env node
/**
 * Skill-trigger evaluation. Deliberately NOT part of `npm test`: it needs the `claude` CLI on
 * PATH and working API access, and a suite that goes red for lack of a login trains the operator
 * to ignore red.
 *
 * This is a PROXY. It measures whether the descriptions in `skills/<name>/SKILL.md`, read side by
 * side, are enough to route a realistic operator request to the right skill. It does not measure
 * whether a live session under-triggers: in a session the model also sees the conversation, the
 * bound company's documents and the hooks' output, and it may invoke nothing at all. The
 * description is the only trigger surface a plugin author controls, so it is the part worth
 * measuring in isolation, and a description that fails here fails in a session too.
 *
 * Ground truth (`expected` in skill-triggers.json) is the skill whose description most
 * specifically claims the request: `social` when the binding or the phase must be established
 * first, `none` when no skill applies today. Every run counts on its own, three runs per query and
 * no majority vote, because a router that is right two times out of three misroutes a third of
 * the time.
 *
 * `--self-test` drives the same scoring path with fake classifiers and needs no CLI; it exists to
 * prove the gate fails when it should. `--dry-run` prints the prompt and the exact invocation for
 * the first item so the CLI syntax can be checked against `claude --help` before a call is spent.
 */
import { spawn } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SKILLS_DIR = join(ROOT, "skills");
const DATASET = join(HERE, "skill-triggers.json");
const NONE = "none";
const SPLITS = ["train", "test"];
const KINDS = ["target", "near-miss"];
const ITEM_FIELDS = ["id", "query", "expected", "split", "kind", "why"];
/** The Agent Skills spec's six fields — the set claude.ai, the Skills API and packaging accept. */
const FRONTMATTER_KEYS = ["allowed-tools", "compatibility", "description", "license", "metadata", "name"];

/** Test-split accuracy below this exits 1: the descriptions do not disambiguate. */
const PASS_THRESHOLD = 0.8;

/** The recipe's 60/40 split, with the slack a dataset of about twenty items can actually land on. */
const TRAIN_SHARE = { min: 0.55, max: 0.65 };

/** The recipe's "half near-misses", with the same slack. */
const NEAR_MISS_SHARE = { min: 0.4, max: 0.6 };

const DEFAULT_RUNS = 3;
const DEFAULT_CONCURRENCY = 3;
const DEFAULT_BUDGET_USD = "0.10";
const CALL_TIMEOUT_MS = 180_000;
const RETRY_WITH_SHELL = new Set(["EINVAL", "ENOENT"]);

/**
 * Replaces Claude Code's default system prompt so each call is a bare classification rather than
 * an agent turn: cheaper, faster, and closer to a one-token answer. Kept free of shell
 * metacharacters because on Windows it may travel through cmd.exe when `claude` is a .cmd shim.
 */
const SYSTEM_PROMPT = "You are a strict text classifier. Reply with exactly one token.";

const HELP = `Skill-trigger evaluation: do the skill descriptions route what they should?

  node test/skill-eval.mjs [--runs 3] [--concurrency 3] [--model <alias>] [--budget-usd 0.10]
  node test/skill-eval.mjs --dry-run     print the prompt and the exact CLI invocation for the first item; no call
  node test/skill-eval.mjs --self-test   prove the dataset checks and the accuracy gate catch failures; no CLI needed

Reads the descriptions in skills/<name>/SKILL.md and the queries in test/skill-triggers.json, asks
\`claude -p\` which skill applies to each query, three times, and reports accuracy per split, per
skill and per kind, plus the confusion pairs. Exit 0 when test-split accuracy is at least 80%, 1
when it is below, 2 when the dataset or a skill is malformed or the CLI cannot answer. Needs the
claude CLI and API access, so it is not part of npm test. --budget-usd caps each call.
`;

const parseArgs = (argv) => {
  const args = {
    runs: DEFAULT_RUNS,
    concurrency: DEFAULT_CONCURRENCY,
    budgetUsd: DEFAULT_BUDGET_USD,
    model: null,
    dryRun: false,
    selfTest: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--self-test") args.selfTest = true;
    else if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--runs") args.runs = Number(argv[++i]);
    else if (a === "--concurrency") args.concurrency = Number(argv[++i]);
    else if (a === "--model") args.model = argv[++i] ?? "";
    else if (a === "--budget-usd") args.budgetUsd = argv[++i] ?? "";
    else throw new Error(`unknown option ${a}`);
  }
  if (!Number.isInteger(args.runs) || args.runs < 1) throw new Error("--runs must be a positive integer");
  if (!Number.isInteger(args.concurrency) || args.concurrency < 1) throw new Error("--concurrency must be a positive integer");
  if (!/^\d+(\.\d+)?$/.test(args.budgetUsd)) throw new Error("--budget-usd must be a number");
  if (args.model !== null && !/^[A-Za-z0-9._:-]+$/.test(args.model)) throw new Error("--model must be a model alias or id");
  return args;
};

/**
 * Reads YAML frontmatter the way the trigger surface is actually shaped: one `key: value` per
 * line, plus the folded (`>`) and literal (`|`) block forms a long description may legitimately
 * use. Anything richer than that is not something a skill file should contain.
 */
const parseFrontmatter = (text) => {
  const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!m) return {};
  const lines = m[1].split(/\r?\n/);
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([A-Za-z_-]+):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^[>|][-+]?$/.test(value)) {
      const block = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) block.push(lines[++i].trim());
      value = block.join(value.startsWith(">") ? " " : "\n");
    }
    out[kv[1]] = value.replace(/^(["'])(.*)\1$/, "$2");
  }
  return out;
};

const readSkills = (dir = SKILLS_DIR) =>
  readdirSync(dir)
    .filter((d) => statSync(join(dir, d)).isDirectory())
    .sort()
    .map((d) => {
      let text;
      try {
        text = readFileSync(join(dir, d, "SKILL.md"), "utf8");
      } catch {
        return { dir: d, name: null, description: null, keys: [], missing: true };
      }
      const fm = parseFrontmatter(text);
      return { dir: d, name: fm.name ?? null, description: fm.description ?? null, keys: Object.keys(fm), missing: false };
    });

/**
 * A skill whose frontmatter name differs from its directory would make every `expected` label in
 * the dataset silently wrong, and a frontmatter key outside the Agent Skills spec's six fields is
 * rejected outright on upload to claude.ai or the Skills API. Both are refused before a single call
 * is spent.
 *
 * Note what this does NOT claim: Claude Code itself reads roughly twenty frontmatter keys, and
 * `allowed-tools` and `argument-hint` are used by Anthropic's own published skills. The constraint
 * here is portability, not readability.
 */
const skillProblems = (skills) => {
  const problems = [];
  if (!skills.length) problems.push("skills/ contains no skill directories");
  for (const s of skills) {
    const at = `skills/${s.dir}/SKILL.md`;
    if (s.missing) {
      problems.push(`${at} is missing`);
      continue;
    }
    if (s.name !== s.dir) problems.push(`${at}: frontmatter name "${s.name}" differs from its directory`);
    if (!s.description) problems.push(`${at}: frontmatter has no description`);
    const extra = s.keys.filter((k) => !FRONTMATTER_KEYS.includes(k));
    if (extra.length) problems.push(`${at}: frontmatter carries keys the Skills API would reject: ${extra.join(", ")}`);
  }
  return problems;
};

const share = (items, predicate) => (items.length ? items.filter(predicate).length / items.length : 0);
const asPercent = (n) => `${Math.round(100 * n)}%`;

const datasetProblems = (data, skillNames) => {
  const items = Array.isArray(data?.items) ? data.items : null;
  if (!items) return ["dataset has no items array"];
  const problems = [];
  const labels = new Set([...skillNames, NONE]);
  const ids = new Set();
  const queries = new Set();
  items.forEach((it, i) => {
    const at = `item ${it?.id ?? `#${i}`}`;
    for (const f of ITEM_FIELDS) if (typeof it?.[f] !== "string" || !it[f].trim()) problems.push(`${at}: missing ${f}`);
    if (ids.has(it?.id)) problems.push(`${at}: duplicate id`);
    ids.add(it?.id);
    if (queries.has(it?.query)) problems.push(`${at}: duplicate query`);
    queries.add(it?.query);
    if (it?.expected && !labels.has(it.expected)) problems.push(`${at}: expected "${it.expected}" is not a skill in skills/ or "${NONE}"`);
    if (it?.split && !SPLITS.includes(it.split)) problems.push(`${at}: split "${it.split}" is not ${SPLITS.join("|")}`);
    if (it?.kind && !KINDS.includes(it.kind)) problems.push(`${at}: kind "${it.kind}" is not ${KINDS.join("|")}`);
    if (typeof it?.why === "string" && /\r?\n/.test(it.why.trim())) problems.push(`${at}: why must be one line`);
  });
  for (const label of labels) {
    if (!items.some((it) => it.expected === label)) problems.push(`no item expects "${label}": every skill and "${NONE}" must be covered`);
  }
  if (!items.some((it) => it.split === "test")) problems.push("test split is empty");
  const train = share(items, (it) => it.split === "train");
  if (train < TRAIN_SHARE.min || train > TRAIN_SHARE.max) {
    problems.push(`train share is ${asPercent(train)} of ${items.length} items; the recipe is 60/40`);
  }
  const nearMiss = share(items, (it) => it.kind === "near-miss");
  if (nearMiss < NEAR_MISS_SHARE.min || nearMiss > NEAR_MISS_SHARE.max) {
    problems.push(`near-miss share is ${asPercent(nearMiss)} of ${items.length} items; the recipe is half`);
  }
  return problems;
};

/**
 * The prompt carries nothing but what a live session gets: the descriptions, listed the way
 * Claude Code lists them, and the request. Any hint about phases or routing here would measure
 * the hint, not the descriptions.
 */
const buildPrompt = (skills, query) =>
  [
    "An operator of a Claude Code plugin typed the request below. These are the plugin's skills, each with the description Claude reads when deciding whether to invoke it:",
    "",
    ...skills.map((s) => `- ${s.name}: ${s.description}`),
    "",
    "Request:",
    '"""',
    query,
    '"""',
    "",
    `Reply with the exact name of the single skill whose description most specifically covers this request, or ${NONE} if no description covers it. One token, nothing else: no punctuation, no explanation.`,
  ].join("\n");

/**
 * Accepts an answer only as an exact label, case-insensitively and stripped of decoration. Never a
 * fuzzy match: an answer that names two skills, or a skill plus a reason, is a routing failure and
 * is counted as one under an `invalid:` prefix so the confusion pairs show what came back.
 */
const normalise = (raw, labels) => {
  const first = String(raw ?? "").split(/\r?\n/).map((l) => l.trim()).find(Boolean) ?? "";
  const token = first.replace(/^[`"'*\s]+|[`"'*.\s]+$/g, "").toLowerCase();
  return labels.has(token) ? token : `invalid:${first.slice(0, 40) || "(empty)"}`;
};

/**
 * Verified against `claude --help` (2.1.205): `--tools ""` disables every tool so the classifier
 * cannot act; `--strict-mcp-config` with no config given stops the operator's own MCP servers from
 * starting on every one of sixty calls; `--disable-slash-commands` keeps the operator's installed
 * skills out of the loop; `--no-session-persistence` keeps sixty throwaway sessions out of the
 * resume picker. The prompt travels on stdin so Spanish text never meets a shell.
 */
const claudeArgs = (args) => [
  "-p",
  "--output-format",
  "text",
  "--tools",
  "",
  "--no-session-persistence",
  "--strict-mcp-config",
  "--disable-slash-commands",
  "--max-budget-usd",
  args.budgetUsd,
  "--system-prompt",
  SYSTEM_PROMPT,
  ...(args.model ? ["--model", args.model] : []),
];

/**
 * Only used when Windows resolves `claude` to a .cmd shim, which Node refuses to spawn without a
 * shell. With a shell Node joins arguments verbatim, so quoting is ours; every argument is one this
 * file wrote and the prompt travels on stdin, so a plain double-quote wrap is sufficient.
 */
const quoteForShell = (arg) => (arg === "" ? '""' : /\s/.test(arg) ? `"${arg}"` : arg);

const runClaude = (prompt, argv, shell) =>
  new Promise((resolve) => {
    const child = spawn("claude", shell ? argv.map(quoteForShell) : argv, { shell, stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    let out = "";
    let err = "";
    const timer = setTimeout(() => child.kill(), CALL_TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ error });
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, out, err });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(prompt);
  });

/**
 * One classifier over the CLI. The spawn mode is resolved once: a native `claude` spawns directly
 * on every platform, and only a Windows .cmd shim needs the shell fallback. The probe exists so a
 * CLI that is not logged in fails once, before the run, instead of sixty times inside it; this
 * harness never logs in on anyone's behalf.
 */
const cliClassifier = (args) => {
  const argv = claudeArgs(args);
  let shell = false;
  const failures = [];
  const spawnOnce = async (prompt) => {
    let res = await runClaude(prompt, argv, shell);
    if (res.error && !shell && process.platform === "win32" && RETRY_WITH_SHELL.has(res.error.code)) {
      shell = true;
      res = await runClaude(prompt, argv, shell);
    }
    return res;
  };
  const firstLine = (res) => (res.err || res.out || "").trim().split(/\r?\n/)[0] ?? "";
  const probe = async () => {
    const res = await spawnOnce("Reply with exactly the word ok.");
    if (res.error) return { ok: false, reason: `the claude CLI could not be started (${res.error.code ?? res.error.message}); install it and put it on PATH` };
    if (res.code !== 0) return { ok: false, reason: `the claude CLI answered the probe with exit ${res.code}: ${firstLine(res)}. Log in with \`claude auth login\` first; this harness never does that for you` };
    return { ok: true };
  };
  const call = async (prompt) => {
    const res = await spawnOnce(prompt);
    if (res.error) throw new Error(`the claude CLI stopped being startable mid-run: ${res.error.message}`);
    if (res.signal || res.code === null) return "timeout";
    if (res.code !== 0) {
      if (failures.length < 3) failures.push(`exit ${res.code}: ${firstLine(res)}`);
      return `error: exit ${res.code}`;
    }
    return res.out;
  };
  return { probe, call, failures };
};

const pool = async (jobs, width) => {
  const results = new Array(jobs.length);
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const i = next++;
      results[i] = await jobs[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(width, jobs.length) }, worker));
  return results;
};

const score = (items, answers) => {
  const bucket = () => ({ correct: 0, total: 0 });
  const add = (b, correct, total) => {
    b.correct += correct;
    b.total += total;
  };
  const bySplit = Object.fromEntries(SPLITS.map((s) => [s, bucket()]));
  const byKind = Object.fromEntries(KINDS.map((k) => [k, bucket()]));
  const byLabel = {};
  const confusion = new Map();
  const rows = [];
  const unstable = [];
  for (const item of items) {
    const got = answers.get(item.id) ?? [];
    const correct = got.filter((a) => a === item.expected).length;
    add(bySplit[item.split], correct, got.length);
    add(byKind[item.kind], correct, got.length);
    byLabel[item.expected] ??= bucket();
    add(byLabel[item.expected], correct, got.length);
    for (const a of got) {
      if (a === item.expected) continue;
      const key = `${item.expected} -> ${a}`;
      confusion.set(key, (confusion.get(key) ?? 0) + 1);
    }
    if (new Set(got).size > 1) unstable.push({ id: item.id, got });
    rows.push({ ...item, got, correct });
  }
  const accuracy = (b) => (b.total ? b.correct / b.total : 0);
  const testAccuracy = accuracy(bySplit.test);
  return {
    rows,
    bySplit,
    byKind,
    byLabel,
    confusion: [...confusion.entries()].sort((a, b) => b[1] - a[1]),
    unstable,
    testAccuracy,
    exitCode: testAccuracy >= PASS_THRESHOLD ? 0 : 1,
  };
};

const evaluate = async (items, skills, opts, classify) => {
  const labels = new Set([...skills.map((s) => s.name), NONE]);
  const jobs = [];
  for (const item of items) {
    for (let run = 0; run < opts.runs; run++) {
      jobs.push(async () => ({ id: item.id, answer: normalise(await classify(buildPrompt(skills, item.query)), labels) }));
    }
  }
  let done = 0;
  const results = await pool(
    jobs.map((job) => async () => {
      const r = await job();
      done++;
      opts.onProgress?.(done, jobs.length);
      return r;
    }),
    opts.concurrency
  );
  const answers = new Map(items.map((it) => [it.id, []]));
  for (const { id, answer } of results) answers.get(id).push(answer);
  return score(items, answers);
};

const tally = (got) => {
  const counts = new Map();
  for (const g of got) counts.set(g, (counts.get(g) ?? 0) + 1);
  return [...counts].map(([g, n]) => `${g} x${n}`).join(", ");
};

const fraction = (b) => `${b.correct}/${b.total} (${b.total ? ((100 * b.correct) / b.total).toFixed(1) : "0.0"}%)`;

const printReport = (result, items, opts, elapsedMs) => {
  const lines = [];
  lines.push(`skill-trigger evaluation: ${items.length} queries x ${opts.runs} runs, model ${opts.model ?? "(CLI default)"}, ${(elapsedMs / 1000).toFixed(0)}s`, "");
  const width = Math.max(...items.map((it) => it.id.length));
  for (const r of result.rows) {
    const all = r.correct === r.got.length;
    lines.push(`${all ? "PASS" : "MISS"}  ${r.id.padEnd(width)}  ${r.split.padEnd(5)}  ${r.expected.padEnd(15)}  ${r.correct}/${r.got.length}${all ? "" : `  got: ${tally(r.got)}`}`);
  }
  lines.push("");
  lines.push(`accuracy by split     ${SPLITS.map((s) => `${s} ${fraction(result.bySplit[s])}`).join("   ")}`);
  lines.push(`accuracy by kind      ${KINDS.map((k) => `${k} ${fraction(result.byKind[k])}`).join("   ")}`);
  lines.push(`accuracy by expected  ${Object.entries(result.byLabel).map(([l, b]) => `${l} ${fraction(b)}`).join(" | ")}`);
  lines.push(`confusion pairs       ${result.confusion.length ? result.confusion.map(([p, n]) => `${p} x${n}`).join(" | ") : "none"}`);
  lines.push(`unstable queries      ${result.unstable.length ? result.unstable.map((u) => `${u.id} (${tally(u.got)})`).join(" | ") : "none"}`);
  lines.push("");
  lines.push(`test split ${(100 * result.testAccuracy).toFixed(1)}% ${result.exitCode ? "<" : ">="} ${asPercent(PASS_THRESHOLD)}: ${result.exitCode ? "FAIL" : "PASS"}`);
  console.log(lines.join("\n"));
};

const clone = (x) => JSON.parse(JSON.stringify(x));

const selfTest = async () => {
  const skills = readSkills();
  const names = skills.map((s) => s.name);
  const data = JSON.parse(readFileSync(DATASET, "utf8"));
  const labels = new Set([...names, NONE]);
  const byPrompt = new Map(data.items.map((it) => [buildPrompt(skills, it.query), it]));
  const wrongFor = (item) => (item.expected === NONE ? "social" : NONE);
  const fake = { runs: 3, concurrency: 4 };
  const cases = [];
  const check = (name, fn) => cases.push([name, fn]);

  check("every skill's frontmatter parses to its directory name, a description, and nothing else", () => {
    const p = skillProblems(skills);
    return [p.length === 0 && skills.length >= 6, p.join("; ") || `${skills.length} skills`];
  });

  check("the frontmatter parser reads a folded multi-line description", () => {
    const fm = parseFrontmatter("---\nname: x\ndescription: >\n  first line\n  second line\n---\nbody");
    return [fm.name === "x" && fm.description === "first line second line", JSON.stringify(fm)];
  });

  check("the shipped dataset passes every check", () => {
    const p = datasetProblems(data, names);
    return [p.length === 0, p.join("; ") || `${data.items.length} items`];
  });

  check("an expected label that is not a skill is REFUSED, naming the item", () => {
    const broken = clone(data);
    broken.items[0].expected = "social-video";
    const p = datasetProblems(broken, names);
    return [p.some((x) => x.includes(broken.items[0].id) && x.includes("social-video")), p.join("; ")];
  });

  check("a dataset with no query for one skill is REFUSED", () => {
    const broken = clone(data);
    broken.items = broken.items.filter((it) => it.expected !== "social-handoff");
    const p = datasetProblems(broken, names);
    return [p.some((x) => x.includes('no item expects "social-handoff"')), p.join("; ")];
  });

  check("a split that is not 60/40 is REFUSED", () => {
    const broken = clone(data);
    for (const it of broken.items) it.split = "train";
    const p = datasetProblems(broken, names);
    return [p.some((x) => x.includes("train share is 100%")) && p.some((x) => x.includes("test split is empty")), p.join("; ")];
  });

  check("a duplicate id, a duplicate query and a missing why are each REFUSED", () => {
    const broken = clone(data);
    broken.items[1].id = broken.items[0].id;
    broken.items[2].query = broken.items[0].query;
    broken.items[3].why = "";
    const p = datasetProblems(broken, names);
    return [
      p.some((x) => x.includes("duplicate id")) && p.some((x) => x.includes("duplicate query")) && p.some((x) => x.includes(`item ${broken.items[3].id}: missing why`)),
      p.join("; "),
    ];
  });

  check("answers count only as an exact skill name or none; anything else is invalid and a miss", () => {
    const accepted =
      normalise("`social-plan`.", labels) === "social-plan" && normalise("None\n", labels) === NONE && normalise("**Social-Produce**", labels) === "social-produce";
    const rejected = ["social-plan, because it fits best", "social-plan or social", "", "social-planning"].every((a) => normalise(a, labels).startsWith("invalid:"));
    return [accepted && rejected, `accepted=${accepted} rejected=${rejected}`];
  });

  check("an oracle classifier scores 100% on both splits, no confusion, no instability, exit 0", async () => {
    const r = await evaluate(data.items, skills, fake, async (prompt) => byPrompt.get(prompt).expected);
    return [
      r.exitCode === 0 && r.testAccuracy === 1 && r.bySplit.train.correct === r.bySplit.train.total && r.confusion.length === 0 && r.unstable.length === 0,
      `test ${fraction(r.bySplit.test)}, train ${fraction(r.bySplit.train)}, exit ${r.exitCode}`,
    ];
  });

  check("a classifier that answers social for everything FAILS the gate and names every confusion pair with its count", async () => {
    const r = await evaluate(data.items, skills, fake, async () => "social");
    const expectedPairs = new Map();
    for (const it of data.items) if (it.expected !== "social") expectedPairs.set(`${it.expected} -> social`, (expectedPairs.get(`${it.expected} -> social`) ?? 0) + 3);
    const got = new Map(r.confusion);
    const pairsMatch = got.size === expectedPairs.size && [...expectedPairs].every(([pair, n]) => got.get(pair) === n);
    const socialPerfect = r.byLabel.social.correct === r.byLabel.social.total && r.byLabel[NONE].correct === 0;
    return [r.exitCode === 1 && r.testAccuracy < PASS_THRESHOLD && pairsMatch && socialPerfect, `test ${fraction(r.bySplit.test)}, ${got.size} pairs, exit ${r.exitCode}`];
  });

  check("two right runs out of three FAILS at 66.7%: every run counts, there is no majority vote", async () => {
    const seen = new Map();
    const r = await evaluate(data.items, skills, fake, async (prompt) => {
      const item = byPrompt.get(prompt);
      const n = (seen.get(item.id) ?? 0) + 1;
      seen.set(item.id, n);
      return n === 3 ? wrongFor(item) : item.expected;
    });
    const twoThirds = Math.abs(r.testAccuracy - 2 / 3) < 1e-9;
    return [r.exitCode === 1 && twoThirds && r.unstable.length === data.items.length, `test ${fraction(r.bySplit.test)}, ${r.unstable.length} unstable, exit ${r.exitCode}`];
  });

  check("the gate is inclusive at the threshold: the most misses that keep 80% pass, one more fails", async () => {
    const testRuns = data.items.filter((it) => it.split === "test").length * fake.runs;
    const allowedWrong = Math.floor(testRuns * (1 - PASS_THRESHOLD));
    const run = (wrong) => {
      let remaining = wrong;
      return evaluate(data.items, skills, fake, async (prompt) => {
        const item = byPrompt.get(prompt);
        if (item.split === "test" && remaining > 0) {
          remaining--;
          return wrongFor(item);
        }
        return item.expected;
      });
    };
    const pass = await run(allowedWrong);
    const fail = await run(allowedWrong + 1);
    return [
      pass.exitCode === 0 && fail.exitCode === 1 && pass.bySplit.train.correct === pass.bySplit.train.total,
      `${pass.bySplit.test.correct}/${testRuns} -> exit ${pass.exitCode}; ${fail.bySplit.test.correct}/${testRuns} -> exit ${fail.exitCode}`,
    ];
  });

  check("a timeout or a CLI error is a counted miss, visible in the confusion pairs", async () => {
    const r = await evaluate(data.items, skills, { runs: 1, concurrency: 4 }, async (prompt) => (byPrompt.get(prompt).split === "test" ? "timeout" : "error: exit 1"));
    const pairs = r.confusion.map(([p]) => p);
    return [
      r.exitCode === 1 && r.bySplit.test.correct === 0 && pairs.some((p) => p.endsWith("-> invalid:timeout")) && pairs.some((p) => p.endsWith("-> invalid:error: exit 1")),
      `test ${fraction(r.bySplit.test)}, pairs: ${pairs.slice(0, 2).join(" | ")}`,
    ];
  });

  let failed = 0;
  for (const [name, fn] of cases) {
    let ok = false;
    let detail = "";
    try {
      [ok, detail] = await fn();
    } catch (err) {
      detail = `threw: ${err.message}`;
    }
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  ->  ${detail}` : ""}`);
  }
  console.log("");
  console.log(`${cases.length - failed}/${cases.length} passed`);
  return failed ? 1 : 0;
};

const main = async () => {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    console.log(HELP);
    return 2;
  }
  if (args.help) {
    console.log(HELP);
    return 0;
  }
  if (args.selfTest) return selfTest();

  const skills = readSkills();
  const data = JSON.parse(readFileSync(DATASET, "utf8"));
  const problems = [...skillProblems(skills), ...datasetProblems(data, skills.map((s) => s.name))];
  if (problems.length) {
    for (const p of problems) console.error(`refused: ${p}`);
    return 2;
  }

  if (args.dryRun) {
    const first = data.items[0];
    console.log(`--- prompt for ${first.id} (expected ${first.expected}, ${first.split}, ${first.kind}) ---`);
    console.log(buildPrompt(skills, first.query));
    console.log("--- invocation, prompt on stdin ---");
    console.log(`claude ${claudeArgs(args).map(quoteForShell).join(" ")}`);
    console.log(`--- ${data.items.length} items x ${args.runs} runs = ${data.items.length * args.runs} calls; none made ---`);
    return 0;
  }

  const classifier = cliClassifier(args);
  const probe = await classifier.probe();
  if (!probe.ok) {
    console.error(`refused: ${probe.reason}`);
    return 2;
  }
  const started = Date.now();
  const result = await evaluate(
    data.items,
    skills,
    { ...args, onProgress: (done, total) => process.stderr.write(`\r${done}/${total} calls`) },
    classifier.call
  );
  process.stderr.write("\n");
  printReport(result, data.items, args, Date.now() - started);
  for (const f of classifier.failures) console.error(`cli: ${f}`);
  return result.exitCode;
};

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err.stack ?? String(err));
    process.exit(2);
  }
);
