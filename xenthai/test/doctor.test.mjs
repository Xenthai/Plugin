import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const DOCTOR = join(ROOT, "tools", "doctor.mjs");
const SANDBOX = join(HERE, "sandbox", "doctor");
const BOUND = join(SANDBOX, "bound");
const FUTURE = join(SANDBOX, "future");
const UNBOUND = join(SANDBOX, "unbound");
const DATA = join(SANDBOX, "plugin-data");
const BROKEN = join(SANDBOX, "broken-plugin");
const CONFIG = join(SANDBOX, "config");

const CHANNELS = ["msedge", "chrome", "msedge-beta", "chrome-beta"];
const LOCAL = ["node", "browser", "fonts", "engine", "journal"];

const manifest = (id, name, schema) =>
  JSON.stringify(
    { schema_version: schema, id, name, locale: "es-MX", timezone: "America/Mexico_City", store: { kind: "drive", root: "1DOCTORROOTXXXXXXXXXXXXXXXXXXXXXX" } },
    null,
    2
  );

const setup = () => {
  rmSync(SANDBOX, { recursive: true, force: true });
  for (const dir of [BOUND, FUTURE, UNBOUND, DATA, CONFIG]) mkdirSync(dir, { recursive: true });
  writeFileSync(join(BOUND, ".company.json"), manifest("co-doc-0001", "Doctor Co", 1));
  writeFileSync(join(FUTURE, ".company.json"), manifest("co-doc-0099", "Future Co", 99));
};

/**
 * A damaged copy of the plugin, placed INSIDE the real tree so that a bare `playwright-core` import
 * still resolves up to the real node_modules without a symlink. One declared face and one licence
 * text are removed and formats.json is truncated, so the fonts and engine checks have a defect to find.
 */
const brokenPlugin = () => {
  const engine = "capabilities/social/engine";
  for (const rel of ["tools/doctor.mjs", "tools/journal-sync.mjs", "lib/company.mjs", "lib/journal.mjs", "lib/transport.mjs", ".claude-plugin/plugin.json", `${engine}/template.html`]) {
    mkdirSync(dirname(join(BROKEN, rel)), { recursive: true });
    copyFileSync(join(ROOT, rel), join(BROKEN, rel));
  }
  cpSync(join(ROOT, engine, "fonts"), join(BROKEN, engine, "fonts"), { recursive: true });
  const files = readdirSync(join(BROKEN, engine, "fonts")).sort();
  const removedFont = files.filter((f) => /\.ttf$/i.test(f))[0];
  const removedLicence = files.filter((f) => /^OFL-.+\.txt$/i.test(f))[1];
  rmSync(join(BROKEN, engine, "fonts", removedFont));
  rmSync(join(BROKEN, engine, "fonts", removedLicence));
  writeFileSync(join(BROKEN, engine, "formats.json"), '{ "render_targets": { "square": ');
  return { removedFont, removedLicence, script: join(BROKEN, "tools", "doctor.mjs") };
};

/**
 * `CLAUDE_CONFIG_DIR` points into the sandbox so the transport check reads a user settings file this
 * suite controls, never the operator's own — a hook in their `~/.claude/settings.json` would turn
 * every "absent" case here into "present" and prove nothing about the code.
 */
const doctor = (cwd, args = [], script = DOCTOR) => {
  const res = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PLUGIN_DATA: DATA, CLAUDE_CONFIG_DIR: CONFIG },
    timeout: 120_000,
  });
  let json = null;
  try {
    json = JSON.parse(res.stdout);
  } catch {}
  const by = Object.fromEntries((json?.checks ?? []).map((c) => [c.name, c]));
  return { code: res.status, out: res.stdout ?? "", err: res.stderr ?? "", json, by };
};

const statuses = (by) => ["node", "company", ...LOCAL.slice(1), "sync", "transport"].map((n) => `${n}=${by[n]?.status ?? "?"}`).join(" ");

const rows = (dir) => {
  const month = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" }).format(new Date()).slice(0, 7);
  const file = join(dir, "journal", "execution", `${month}.jsonl`);
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
};

const cases = [];
const check = (name, fn) => cases.push([name, fn]);

check("--help exits 0 and names the options, statuses and exit codes", () => {
  const r = doctor(BOUND, ["--help"]);
  return [r.code === 0 && /--json/.test(r.out) && /SKIP/.test(r.out) && /EXIT CODES/.test(r.out), `exit ${r.code}`];
});

check("an unknown option is refused with exit 2", () => {
  const r = doctor(BOUND, ["--jsno"]);
  return [r.code === 2 && /unknown option/.test(r.err), `exit ${r.code}`];
});

/**
 * A manifest whose `store.root` holds the given value. `readCompany` validates that `store` exists,
 * not what is in it, so these are the bindings that look healthy and fail at the first write.
 */
const withRoot = (dir, root, kind = "drive") => {
  const path = join(SANDBOX, dir);
  mkdirSync(path, { recursive: true });
  writeFileSync(
    join(path, ".company.json"),
    JSON.stringify({ schema_version: 1, id: `co-${dir}`, name: `Co ${dir}`, locale: "es-MX", store: { kind, root } }, null, 2)
  );
  return path;
};

check("the template's own placeholder in store.root is a FAIL, not a healthy install", () => {
  const r = doctor(withRoot("placeholder", "ID-DE-LA-CARPETA-RAIZ"), ["--json"]);
  const c = r.by.company;
  return [
    c?.status === "FAIL" && c?.code === "company:fail(unset-store-root)" && r.code === 1,
    `${c?.code}; exit ${r.code}`,
  ];
});

check("a null store.root — the bootstrap's own midpoint — is a FAIL that says how to finish it", () => {
  const r = doctor(withRoot("bootstrapping", null), ["--json"]);
  const c = r.by.company;
  const explains = /company-new/.test(c?.reason ?? "");
  return [
    c?.code === "company:fail(unset-store-root)" && explains,
    `${c?.code}; names the skill mid-bootstrap: ${explains}`,
  ];
});

check("a link or a path in store.root is a FAIL, because a name never proves identity", () => {
  const r = doctor(withRoot("linked", "https://drive.google.com/drive/folders/1ABC"), ["--json"]);
  const c = r.by.company;
  return [c?.code === "company:fail(store-root-not-an-id)", `${c?.code}`];
});

/**
 * The second provider. A OneDrive root may be a Graph path, which is stable and checkable by
 * prefix, so the slash rule that catches a pasted Drive link does not apply there — a URL still
 * does. And a provider this build does not know is refused, not read as Drive.
 */
check("a OneDrive store may name its root by Graph path, still never by URL, and an unknown provider is refused", () => {
  const byPath = doctor(withRoot("od-path", "/drive/root:/Clientes/Acme", "onedrive"), ["--json"]).by.company;
  const byUrl = doctor(withRoot("od-url", "https://contoso.sharepoint.com/sites/x", "onedrive"), ["--json"]).by.company;
  const unknown = doctor(withRoot("box", "1SOMEID", "dropbox"), ["--json"]).by.company;
  return [
    byPath?.status === "OK" && byUrl?.code === "company:fail(store-root-not-an-id)" && /unknown-store-kind/.test(unknown?.code ?? ""),
    `path=${byPath?.status} url=${byUrl?.code} unknown=${unknown?.code}`,
  ];
});

check("a real folder id passes and is echoed, so the operator can compare it against the store", () => {
  const r = doctor(withRoot("goodroot", "1REALFOLDERID000000000000000000000"), ["--json"]);
  const c = r.by.company;
  const echoed = /1REALFOLDERID/.test(c?.reason ?? "");
  return [c?.status === "OK" && echoed, `status=${c?.status}; id echoed: ${echoed}`];
});

check("a valid manifest on a healthy machine: every check OK, exit 0", () => {
  const r = doctor(BOUND, ["--json"]);
  const allOk = ["company", "sync", "transport", ...LOCAL].every((n) => r.by[n]?.status === "OK");
  return [
    r.code === 0 && r.json?.ok === true && allOk && r.by.company?.data?.id === "co-doc-0001" && CHANNELS.includes(r.by.browser?.data?.channel),
    `exit ${r.code}; ${statuses(r.by)}; channel=${r.by.browser?.data?.channel}`,
  ];
});

check("that run left exactly one health row in the bound company's journal: codes only, no paths", () => {
  const all = rows(BOUND);
  const row = all.at(-1);
  const detail = row?.detail ?? "";
  return [
    all.length === 1 &&
      row.event === "health" &&
      row.actor === "system" &&
      row.company === "co-doc-0001" &&
      row.capability === "doctor" &&
      row.result === "ok" &&
      /company:ok/.test(detail) &&
      /browser:ok\(/.test(detail) &&
      /transport:ok\(absent\)/.test(detail) &&
      !/[\\/]/.test(detail),
    `rows=${all.length} result=${row?.result} detail=${detail}`,
  ];
});

/**
 * `locale` was in every manifest and read by nothing, which is worse than not having the field: it
 * looks like a control and was decoration. Every client-facing part of this plugin is Spanish by
 * construction — the scaffolds, the report templates, the report tool's own prose, and the
 * readability index whose scale and syllable rules are Spanish-only. A manifest declaring en-US
 * would have produced Spanish documents while claiming otherwise, so the field gates now.
 */
check("a non-Spanish locale FAILS the company check rather than silently producing Spanish", () => {
  for (const [locale, label] of [["en-US", "english"], [null, "absent"], ["", "empty"]]) {
    const dir = join(SANDBOX, `locale-${label}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, ".company.json"),
      JSON.stringify({ schema_version: 1, id: "co-x", name: "Co X", locale, store: { kind: "drive", root: "1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" } }),
      "utf8"
    );
    const r = doctor(dir, ["--json"]);
    if (r.code !== 1 || r.by.company?.status !== "FAIL" || r.by.company?.code !== "company:fail(unsupported-locale)") {
      return [false, `${label}: exit ${r.code}, status ${r.by.company?.status}, code ${r.by.company?.code}`];
    }
  }
  return [true, "en-US, absent and empty are each refused with unsupported-locale"];
});

/**
 * The kind is printed even when it is the default, because an operator about to write into the
 * wrong one of the two stores is exactly who reads this line. A default that stays invisible until
 * it is wrong is what this assertion exists to prevent.
 */
check("the company check names WHOSE store is bound, personal or client", () => {
  const cases = [
    ["kind-personal", "personal", /PERSONAL store/],
    ["kind-client", "client", /client store/],
    ["kind-absent", undefined, /client store/],
  ];
  for (const [label, kind, expected] of cases) {
    const dir = join(SANDBOX, label);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, ".company.json"),
      JSON.stringify({
        schema_version: 1,
        id: `co-${label}`,
        name: "Store X",
        ...(kind ? { kind } : {}),
        locale: "es-MX",
        store: { kind: "drive", root: "1KINDXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
      }),
      "utf8"
    );
    const c = doctor(dir, ["--json"]).by.company;
    if (c?.status !== "OK" || !expected.test(c?.reason ?? "")) {
      return [false, `${label}: status ${c?.status}, reason ${c?.reason}`];
    }
  }
  return [true, "personal says so; client and an absent kind both read as a client store"];
});

/**
 * Fails closed, for the same reason `future-schema` does. A kind written by a build with rules this
 * one does not have must not be read as a client's store: that files the operator's own material in
 * a client's audit trail, and nothing later can tell that it happened.
 */
check("an unrecognised kind FAILS rather than defaulting to a client store", () => {
  const dir = join(SANDBOX, "kind-unknown");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({
      schema_version: 1,
      id: "co-odd",
      name: "Odd Store",
      kind: "household",
      locale: "es-MX",
      store: { kind: "drive", root: "1KINDXXXXXXXXXXXXXXXXXXXXXXXXXXXX" },
    }),
    "utf8"
  );
  const r = doctor(dir, ["--json"]);
  return [
    r.code === 1 && r.by.company?.status === "FAIL" && r.by.company?.code === "company:fail(unknown-kind)",
    `exit ${r.code}, status ${r.by.company?.status}, code ${r.by.company?.code}`,
  ];
});

/**
 * The rule `company-new` states in bold and the guard made impossible to keep: a manifest at a home
 * directory binds every session started anywhere beneath it. In a cloud container the working
 * directory IS the home, so the placement the doctrine forbids was the only one that worked, and it
 * was already being used in the field. Undeclared it is now a defect with a name; declared it is a
 * working binding that says on every run what it costs.
 */
check("an undeclared manifest at the home directory FAILS, and a declared ephemeral one passes and says so", () => {
  const home = join(SANDBOX, "fake-home");
  mkdirSync(home, { recursive: true });
  const write = (binding) =>
    writeFileSync(
      join(home, ".company.json"),
      JSON.stringify({ schema_version: 1, id: "co-home", name: "Home Co", locale: "es-MX", ...(binding ? { binding } : {}), store: { kind: "drive", root: "1HOMEROOTXXXXXXXXXXXXXXXXXXXXXXXX" } }),
      "utf8"
    );
  const at = (args) => {
    const res = spawnSync(process.execPath, [DOCTOR, ...args], {
      cwd: home,
      encoding: "utf8",
      env: { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_PLUGIN_DATA: DATA },
      timeout: 120_000,
    });
    return JSON.parse(res.stdout).checks.find((c) => c.name === "company");
  };
  write(null);
  const undeclared = at(["--json"]);
  write("ephemeral");
  const declared = at(["--json"]);
  return [
    undeclared?.code === "company:fail(home-manifest-undeclared)" &&
      declared?.status === "OK" &&
      /EPHEMERAL BINDING/.test(declared?.reason ?? "") &&
      /not reusable between sessions/.test(declared?.reason ?? ""),
    `undeclared=${undeclared?.code}; declared=${declared?.code}`,
  ];
});

/**
 * The check that would have caught three days of an engagement disappearing with its container. It
 * is a FAIL rather than a warning on an ephemeral binding because there "later" does not exist, and
 * only on a closed month for a durable one, so a real machine is not red every afternoon.
 */
check("sync FAILS on an ephemeral binding with unsynced rows, and stays OK on a durable one", () => {
  const make = (name, binding) => {
    const dir = join(SANDBOX, name);
    mkdirSync(join(dir, "journal", "execution"), { recursive: true });
    writeFileSync(
      join(dir, ".company.json"),
      JSON.stringify({ schema_version: 1, id: `co-${name}`, name, locale: "es-MX", ...(binding ? { binding } : {}), store: { kind: "drive", root: "1SYNCROOTXXXXXXXXXXXXXXXXXXXXXXXX" } }),
      "utf8"
    );
    const month = new Date().toISOString().slice(0, 7);
    writeFileSync(join(dir, "journal", "execution", `${month}.jsonl`), '{"event":"ai_action"}\n', "utf8");
    return dir;
  };
  const ephemeral = doctor(make("sync-ephemeral", "ephemeral"), ["--json"]).by.sync;
  const durable = doctor(make("sync-durable", null), ["--json"]).by.sync;
  return [
    ephemeral?.code === "sync:fail(never-synced)" &&
      /journal-sync/.test(ephemeral?.reason ?? "") &&
      durable?.status === "OK",
    `ephemeral=${ephemeral?.code}; durable=${durable?.code}`,
  ];
});

/**
 * A green doctor has to be REACHABLE on an ephemeral binding, and very nearly was not: staging
 * writes a journal row and this check's own run writes another, so a rule failing on a single
 * outstanding row would go red the moment after it went green — and `company-new` STOPS on a doctor
 * that is not green, which would have made an ephemeral engagement impossible to open. Two runs back
 * to back, with the second one seeing the first one's health row, is exactly that treadmill.
 */
check("once the month is in the store, repeated runs stay green while naming the session's own tail", () => {
  const dir = join(SANDBOX, "sync-settled");
  mkdirSync(join(dir, "journal", "execution"), { recursive: true });
  mkdirSync(join(dir, "journal", "sync"), { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({ schema_version: 1, id: "co-settled", name: "Settled Co", locale: "es-MX", binding: "ephemeral", store: { kind: "drive", root: "1SETTLEDXXXXXXXXXXXXXXXXXXXXXXXXX" } }),
    "utf8"
  );
  const month = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Mexico_City", dateStyle: "short" }).format(new Date()).slice(0, 7);
  const first = '{"event":"ai_action"}\n';
  writeFileSync(join(dir, "journal", "execution", `${month}.jsonl`), first, "utf8");
  writeFileSync(
    join(dir, "journal", "sync", `${month}.json`),
    JSON.stringify({
      schema: 1,
      month,
      company: "co-settled",
      revisions: [
        {
          rev: 1,
          name: `${month}.rev-001.jsonl`,
          rows: 1,
          bytes: Buffer.byteLength(first),
          digest: `sha256:${createHash("sha256").update(first).digest("hex")}`,
          file_id: "1UPLOADED",
          at: new Date().toISOString(),
        },
      ],
    }),
    "utf8"
  );
  const one = doctor(dir, ["--json"]).by.sync;
  const two = doctor(dir, ["--json"]).by.sync;
  return [
    one?.status === "OK" && two?.status === "OK" && /tail/.test(two?.reason ?? ""),
    `first=${one?.status}; second=${two?.status} — "${(two?.reason ?? "").slice(-60)}"`,
  ];
});

/**
 * A hook as INSTALL.md §5b writes it, with one field overridden per case. Each override is a way
 * the hook was measured failing while looking installed, and the point of the check is that each
 * has a name: a control that is decoration is trusted, which is worse than none.
 */
const transportHook = (overrides = {}) => ({
  hooks: {
    PostToolUse: [
      {
        matcher: "Bash",
        hooks: [
          {
            type: "mcp_tool",
            if: "Bash(*journal-sync.mjs --emit*)",
            server: "Google_Drive",
            tool: "create_file",
            timeout: 60,
            input: {
              parentId: "1JOURNALFOLDERXXXXXXXXXXXXXXXXXX",
              title: "${tool_input.description}",
              contentMimeType: "text/plain",
              disableConversionToGoogleType: true,
              textContent: "${tool_response.stdout}\n",
            },
            ...overrides,
          },
        ],
      },
    ],
  },
});

/**
 * A company directory with a hook written where the session loads it. The store root is the one
 * `manifest()` uses, so a `parentId` equal to it is the "journal filed at the root" defect.
 */
const withHook = (name, hook, binding = null) => {
  const dir = join(SANDBOX, `transport-${name}`);
  mkdirSync(join(dir, ".claude"), { recursive: true });
  writeFileSync(
    join(dir, ".company.json"),
    JSON.stringify({ schema_version: 1, id: `co-${name}`, name: `Transport ${name}`, locale: "es-MX", ...(binding ? { binding } : {}), store: { kind: "drive", root: "1DOCTORROOTXXXXXXXXXXXXXXXXXXXXXX" } })
  );
  if (hook) writeFileSync(join(dir, ".claude", "settings.local.json"), typeof hook === "string" ? hook : JSON.stringify(hook, null, 2));
  return dir;
};

/**
 * Absence is graded by the binding. On a durable machine the hook saves tokens and nothing else, so
 * its absence is an OK that says what it costs; on an ephemeral disk the session is the only thing
 * that reaches the store, and every upload without the hook passes its bytes through the model, so
 * the same absence FAILS and names where to write the file.
 */
check("transport absent is OK on a durable binding and FAILS on an ephemeral one, naming where to write it", () => {
  const durable = doctor(withHook("durable-absent", null), ["--json"]).by.transport;
  const ephemeral = doctor(withHook("ephemeral-absent", null, "ephemeral"), ["--json"]).by.transport;
  return [
    durable?.code === "transport:ok(absent)" &&
      /INSTALL\.md §5b/.test(durable?.reason ?? "") &&
      ephemeral?.code === "transport:fail(absent-ephemeral)" &&
      /settings\.local\.json/.test(ephemeral?.reason ?? "") &&
      /tokens/.test(ephemeral?.reason ?? ""),
    `durable=${durable?.code}; ephemeral=${ephemeral?.code}`,
  ];
});

check("a valid hook in the starting directory's settings.local.json is OK(present) and names the file", () => {
  const dir = withHook("valid", transportHook(), "ephemeral");
  const c = doctor(dir, ["--json"]).by.transport;
  const named = (c?.reason ?? "").includes(join(dir, ".claude", "settings.local.json"));
  const leftToSession = /parentId is this company's journal\/ folder/.test(c?.reason ?? "");
  return [c?.code === "transport:ok(present)" && named && leftToSession, `${c?.code}; file named=${named}; session's half named=${leftToSession}`];
});

/**
 * The spelling DECISIONS.md #21f recorded as never matching. A session runs the tool by absolute
 * path, so a pattern beginning with the program name does not apply, and a hook whose `if` does not
 * match does nothing — the upload silently costs every token the hook exists to save.
 */
check("an if pattern anchored on the command name FAILS as pattern-anchored", () => {
  const c = doctor(withHook("anchored", transportHook({ if: "Bash(node * journal-sync.mjs --emit*)" })), ["--json"]).by.transport;
  return [c?.code === "transport:fail(pattern-anchored)" && /Bash\(\*journal-sync\.mjs --emit\*\)/.test(c?.reason ?? ""), `${c?.code}`];
});

check("a parentId equal to store.root FAILS as parent-is-root: the journal lives one folder below", () => {
  const hook = transportHook();
  hook.hooks.PostToolUse[0].hooks[0].input.parentId = "1DOCTORROOTXXXXXXXXXXXXXXXXXXXXXX";
  const c = doctor(withHook("root-parent", hook), ["--json"]).by.transport;
  return [c?.code === "transport:fail(parent-is-root)", `${c?.code}`];
});

/**
 * A Bash call's stdout reaches the hook without its final newline, and `--emit` prints the file
 * without it, so the hook's `"\n"` is what makes the uploaded bytes equal the staged ones — and
 * `--receipt` refuses the size otherwise.
 */
check("a textContent without the trailing newline FAILS as no-newline, and several defects are joined with +", () => {
  const one = transportHook();
  one.hooks.PostToolUse[0].hooks[0].input.textContent = "${tool_response.stdout}";
  const noNewline = doctor(withHook("no-newline", one), ["--json"]).by.transport;
  const many = transportHook({ tool: "update_file" });
  many.hooks.PostToolUse[0].hooks[0].input.title = "journal.jsonl";
  many.hooks.PostToolUse[0].hooks[0].input.textContent = "static text\n";
  delete many.hooks.PostToolUse[0].hooks[0].input.parentId;
  const several = doctor(withHook("several", many), ["--json"]).by.transport;
  return [
    noNewline?.code === "transport:fail(no-newline)" && several?.code === "transport:fail(no-stdout+title-not-description+no-parent+wrong-tool)",
    `one=${noNewline?.code}; several=${several?.code}`,
  ];
});

/**
 * The user's settings are one of the files a session loads, so a hook there counts — and the suite
 * points `CLAUDE_CONFIG_DIR` at its own directory precisely so this case is the only one that finds
 * anything there.
 */
check("a hook in the user settings directory is found too, and an unparseable settings file is a named defect", () => {
  writeFileSync(join(CONFIG, "settings.json"), JSON.stringify(transportHook(), null, 2));
  const user = doctor(withHook("user-level", null, "ephemeral"), ["--json"]).by.transport;
  rmSync(join(CONFIG, "settings.json"));
  const broken = doctor(withHook("unparseable", "{ not json"), ["--json"]).by.transport;
  return [
    user?.code === "transport:ok(present)" &&
      (user?.reason ?? "").includes(join(CONFIG, "settings.json")) &&
      broken?.code === "transport:fail(unparseable)" &&
      /does not parse/.test(broken?.reason ?? ""),
    `user=${user?.code}; unparseable=${broken?.code}`,
  ];
});

check("the health row carries the transport code", () => {
  const dir = withHook("row", transportHook({ if: "Bash(node * journal-sync.mjs --emit*)" }));
  doctor(dir, ["--json"]);
  const row = rows(dir).at(-1);
  return [row?.event === "health" && /transport:fail\(pattern-anchored\)/.test(row?.detail ?? "") && !/[\\/]/.test(row?.detail ?? ""), `detail=${row?.detail}`];
});

/**
 * The parameter names the Drive check reads are Drive's. A OneDrive hook carries the names
 * `company-new` read from the connector's own schema, so applying Drive's to it would fail a
 * correct hook — the same silence the check exists to remove, pointed the other way. What survives
 * on every provider is the pattern, the declared create tool, and the emitted bytes with the newline.
 */
check("a OneDrive hook is judged by its declared create tool and the emitted bytes, never by Drive's parameter names", () => {
  const hook = (tool) => ({
    hooks: {
      PostToolUse: [
        {
          matcher: "Bash",
          hooks: [
            { type: "mcp_tool", if: "Bash(*journal-sync.mjs --emit*)", server: "Microsoft_365", tool, timeout: 60, input: { driveId: "b!DRIVE", itemId: "01JOURNAL", name: "${tool_input.description}", content: "${tool_response.stdout}\n" } },
          ],
        },
      ],
    },
  });
  const company = (name, tools) => {
    const dir = join(SANDBOX, `transport-${name}`);
    mkdirSync(join(dir, ".claude"), { recursive: true });
    writeFileSync(
      join(dir, ".company.json"),
      JSON.stringify({ schema_version: 1, id: `co-${name}`, name: "OneDrive Co", locale: "es-MX", store: { kind: "onedrive", root: "/drive/root:/Clientes/Acme", ...(tools ? { tools } : {}) } })
    );
    return dir;
  };
  const declared = company("od-declared", { create: "sharepoint_upload_file" });
  writeFileSync(join(declared, ".claude", "settings.local.json"), JSON.stringify(hook("sharepoint_upload_file")));
  const undeclared = company("od-undeclared", null);
  writeFileSync(join(undeclared, ".claude", "settings.local.json"), JSON.stringify(hook("sharepoint_upload_file")));
  const ok = doctor(declared, ["--json"]).by.transport;
  const missing = doctor(undeclared, ["--json"]).by.transport;
  return [
    ok?.code === "transport:ok(present)" && missing?.code === "transport:fail(tools-undeclared+wrong-tool)",
    `declared=${ok?.code}; undeclared=${missing?.code}`,
  ];
});

check("a manifest from a newer plugin (schema_version 99) FAILS the company check and exits 1", () => {
  const r = doctor(FUTURE, ["--json"]);
  const said = r.by.company?.reason ?? "";
  const othersOk = LOCAL.every((n) => r.by[n]?.status === "OK");
  return [
    r.code === 1 && r.json?.ok === false && r.by.company?.status === "FAIL" && /schema_version 99/.test(said) && /understands 1/.test(said) && othersOk && r.json?.summary?.failed === 1,
    `exit ${r.code}; ${statuses(r.by)}; said "${said.slice(-60)}"`,
  ];
});

check("that failure is journaled as an error where an unbound run lands, never inside the broken company", () => {
  const row = rows(DATA).at(-1);
  return [
    row?.event === "health" && row.result === "error" && row.company === null && /company:fail\(future-schema\)/.test(row.detail) && rows(FUTURE).length === 0,
    `result=${row?.result} company=${row?.company} detail=${row?.detail}`,
  ];
});

check("no company bound: company SKIP, the local checks still run, exit 1", () => {
  const r = doctor(UNBOUND, ["--json"]);
  const localsOk = LOCAL.every((n) => r.by[n]?.status === "OK");
  return [
    r.code === 1 &&
      r.by.company?.status === "SKIP" &&
      /no company bound/.test(r.by.company?.reason ?? "") &&
      localsOk &&
      r.by.sync?.status === "SKIP" &&
      r.by.transport?.status === "SKIP" &&
      r.json?.summary?.skipped === 3 &&
      r.json?.summary?.failed === 0,
    `exit ${r.code}; ${statuses(r.by)}`,
  ];
});

check("text mode prints one status line per check and a summary", () => {
  const r = doctor(UNBOUND);
  const lines = r.out.trim().split("\n");
  const statusLines = lines.filter((l) => /^(OK|FAIL|SKIP)\s+\w+\s+\S/.test(l));
  return [
    r.code === 1 && statusLines.length === 8 && /^SKIP\s+company\s+no company bound/m.test(r.out) && /xenthai \S+ — 5 ok, 0 failed, 3 skipped$/m.test(r.out),
    `exit ${r.code}; status lines=${statusLines.length}; last="${lines.at(-1)}"`,
  ];
});

check("a plugin copy missing a font, a licence text and a parseable formats.json FAILS fonts and engine", () => {
  const { removedFont, removedLicence, script } = brokenPlugin();
  const r = doctor(BOUND, ["--json"], script);
  const fontsSaid = r.by.fonts?.reason ?? "";
  return [
    r.code === 1 &&
      r.by.fonts?.status === "FAIL" &&
      fontsSaid.includes(removedFont) &&
      fontsSaid.includes(removedLicence) &&
      r.by.engine?.status === "FAIL" &&
      /formats\.json does not parse/.test(r.by.engine?.reason ?? "") &&
      ["node", "company", "browser", "journal"].every((n) => r.by[n]?.status === "OK") &&
      r.json?.summary?.failed === 2,
    `exit ${r.code}; ${statuses(r.by)}; fonts named ${removedFont}: ${fontsSaid.includes(removedFont)}, ${removedLicence}: ${fontsSaid.includes(removedLicence)}`,
  ];
});

check("that broken run is journaled as an error naming both failed checks", () => {
  const all = rows(BOUND);
  const row = all.at(-1);
  return [
    all.length === 2 && row.result === "error" && /fonts:fail\(/.test(row.detail) && /engine:fail\(formats-unparseable\)/.test(row.detail),
    `rows=${all.length} result=${row?.result} detail=${row?.detail}`,
  ];
});

setup();
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
if (!failed) rmSync(SANDBOX, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
