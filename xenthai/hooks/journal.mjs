import { record, reference } from "../lib/journal.mjs";
import { readCompany } from "../lib/company.mjs";

/** Tools whose calls are pure reads. Logging them would bury the actions that matter. */
const READ_ONLY = new Set([
  "Read",
  "Glob",
  "Grep",
  "TodoWrite",
  "ToolSearch",
  "ListAgents",
  "ListSkills",
  "SearchSkills",
  "ListMcpResourcesTool",
]);

/**
 * Read-only connector methods, matched by trailing method name because a connector's server id is
 * a per-install uuid — the prefix cannot be hardcoded, only the method name is stable. Google
 * Drive's names first, then the Microsoft 365 connector's, which is how OneDrive is reached.
 */
const READ_ONLY_CONNECTOR = /__(search_files|read_file_content|get_file_metadata|list_|download_|sharepoint_search|sharepoint_folder_search|read_resource|get_me|get_granted_scopes|search_people)/;

/**
 * Tools whose permission prompt asks a question and performs nothing. The prompt looks identical to
 * every other one, and it is not an escalation: nothing was going to happen, so nothing was handed
 * over. `report` publishes the escalation count to the client as "decisions that passed to a
 * person", so a clarification counted there inflates the figure and pollutes the one trail the
 * client is asked to trust — and the inflation is silent, because a larger number reads as more
 * governance rather than less.
 *
 * The call itself is still recorded by the PostToolUse hook as an `ai_action`, so nothing
 * disappears from the journal; only the escalation label does.
 */
const ASKS_ONLY = new Set(["AskUserQuestion"]);

/**
 * A `PermissionRequest` is recorded as an escalation because that is what it is: the moment a
 * decision stopped being the session's and became a person's. Recording it is what makes the
 * approval queue in `capabilities/company/doctrine/CONTROLS.md` real rather than aspirational — a
 * refusal nobody can enumerate afterwards is an obstacle, and a refusal with a record and a route
 * is governance.
 *
 * "A decision" is the load-bearing half: `ASKS_ONLY` above names the prompts that decide nothing.
 */
const EVENT_BY_HOOK = {
  PostToolUse: "ai_action",
  PostToolUseFailure: "error",
  PermissionRequest: "escalation",
  SessionEnd: "session_end",
};

/**
 * Says, on the way out, that the journal is about to stop existing.
 *
 * This is the weakest control in the set and it is placed here deliberately anyway. A command hook
 * holds no connector credentials, and on SessionEnd no hook of any kind has an MCP client to call —
 * the one hook that can upload, the `mcp_tool` transport in INSTALL.md §5b, fires on PostToolUse
 * and needs the session to run the emit command. By SessionEnd the model is gone, so it cannot ask
 * anyone to. What is left is the operator reading one line, and one line is worth more than the
 * silence that let three days of an engagement disappear without any surface mentioning it.
 *
 * The controls that actually work are earlier: the SessionStart announcement, which the model reads
 * while it can still act, and `doctor`'s sync check, which fails rather than warns. This is the
 * receipt for having skipped both.
 *
 * `journal-sync` is imported here and not at the top, because this is its one consumer and it runs
 * once per session: loaded statically it cost every tool call 2–4 ms for a module that PostToolUse
 * never touches.
 */
const warnUnsynced = async (cwd) => {
  try {
    const ctx = readCompany(cwd);
    if (!ctx.ok || !ctx.binding?.ephemeral) return;
    const { allMonths } = await import("../tools/journal-sync.mjs");
    const owed = allMonths(ctx.root).reduce((n, m) => n + m.owed, 0);
    if (!owed) return;
    process.stderr.write(
      `\nXENTH AI — ${owed} journal row(s) were never uploaded, and this binding is ephemeral: when this\n` +
        "container is reclaimed they are gone, and with them the evidence for this engagement's reports.\n" +
        "Only a session can upload them. Next session: tools/journal-sync.mjs --stage.\n"
    );
  } catch (err) {
    process.stderr.write(`Xenth AI — could not tell whether this session's journal rows reached the store: ${String(err && err.message).slice(0, 120)}\n`);
  }
};

const readEvent = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
};

const main = async () => {
  const event = await readEvent();
  const hook = event.hook_event_name ?? "PostToolUse";
  const tool = event.tool_name ?? null;

  /**
   * Ambient recording requires a bound company. The hooks here match every tool on every event, so
   * without this gate a session in an unrelated project — someone else's repository, a personal
   * scratch directory — would have its tool names, targets and extracted command paths written into
   * this plugin's own data directory. That is observing far beyond the plugin's stated purpose, and
   * the published marketplace policy fails a hook that "observes prompts/tool I/O on sessions
   * unrelated to the plugin's purpose, regardless of whether it makes network calls."
   *
   * The invariant this appears to weaken — that a gap in the journal cannot be told apart from an
   * action that never happened — holds *inside* an engagement, which is the only place it was ever
   * meant to. `tools/journal.mjs` and the guard's own error path still fall back to the plugin's data
   * directory, because those are deliberate acts by the operator rather than ambient observation.
   */
  if (!readCompany(event.cwd ?? process.cwd()).ok) process.exit(0);

  if (hook === "SessionEnd") {
    record(
      {
        event: "session_end",
        actor: "system",
        why: "session ended",
        detail: event.transcript_path ? "transcript available" : null,
      },
      event
    );
    await warnUnsynced(event.cwd ?? process.cwd());
    process.exit(0);
  }

  if (tool && (READ_ONLY.has(tool) || READ_ONLY_CONNECTOR.test(tool))) process.exit(0);
  if (hook === "PermissionRequest" && tool && ASKS_ONLY.has(tool)) process.exit(0);

  const ref = reference(event.tool_input);
  record(
    {
      event: EVENT_BY_HOOK[hook] ?? "ai_action",
      actor: "ai",
      tool,
      target: ref.target,
      digest: ref.digest,
      bytes: ref.bytes,
      result: hook === "PostToolUseFailure" ? "error" : hook === "PermissionRequest" ? "pending" : "ok",
      why:
        hook === "PermissionRequest"
          ? `decision pending: ${tool ?? "unknown tool"} needs a person to authorise it`
          : event.prompt_id
            ? `turn ${String(event.prompt_id).slice(0, 8)}`
            : null,
    },
    event
  );
  process.exit(0);
};

/**
 * A logging failure must never block the work it was recording, so this exits 0 on any error and
 * complains on stderr. The visible complaint is the point: a journal that stops writing silently
 * is worse than an absent one, because a gap reads as "nothing happened".
 */
main().catch((err) => {
  process.stderr.write(
    `Xenth AI — the journal could not record this action: ${String(err && err.message).slice(0, 200)}\n`
  );
  process.exit(0);
});
