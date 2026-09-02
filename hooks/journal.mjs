import { record, reference } from "../lib/journal.mjs";

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
 * a per-install uuid — the prefix cannot be hardcoded, only the method name is stable.
 */
const READ_ONLY_CONNECTOR = /__(search_files|read_file_content|get_file_metadata|list_|download_)/;

/**
 * A `PermissionRequest` is recorded as an escalation because that is what it is: the moment a
 * decision stopped being the session's and became a person's. Recording it is what makes the
 * approval queue in `capabilities/company/doctrine/CONTROLS.md` real rather than aspirational — a
 * refusal nobody can enumerate afterwards is an obstacle, and a refusal with a record and a route
 * is governance.
 */
const EVENT_BY_HOOK = {
  PostToolUse: "ai_action",
  PostToolUseFailure: "error",
  PermissionRequest: "escalation",
  SessionEnd: "session_end",
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
    process.exit(0);
  }

  if (tool && (READ_ONLY.has(tool) || READ_ONLY_CONNECTOR.test(tool))) process.exit(0);

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
