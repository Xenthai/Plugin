import { readCompany, isInside } from "../lib/company.mjs";
import { record } from "../lib/journal.mjs";

/**
 * Connector methods that write. Matched by trailing method name because a connector's server id
 * is a per-install uuid; only the method name is stable across installs.
 */
const STORE_WRITE = /__(create_file|copy_file|update_file|share_file|trash_file|upload_file)$/;

/**
 * Local file-writing tools whose target must stay inside the engagement directory. Bash is absent
 * on purpose and that absence is the guard's largest hole: a shell redirect writes anywhere. The
 * agreed compromise is policy plus audit — skills forbid shell writes to company material, and the
 * journal extracts the paths a command touches so a violation is at least visible.
 */
const LOCAL_WRITE = new Set(["Write", "Edit", "NotebookEdit"]);

const readEvent = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
};

/**
 * Vetoes the call. Exit code 2 is the only value Claude Code treats as a veto on PreToolUse, and
 * the reason goes to stderr so the operator reads it verbatim.
 *
 * Only two things are ever vetoed, and neither needs a list to maintain: a store write with no
 * company bound, and a local write outside the bound company's directory. Everything else that is
 * sensitive but reversible is recorded and announced, never blocked — a guard that interrupts
 * often is one the operator learns to click through.
 */
const block = (title, lines) => {
  process.stderr.write(["", `XENTH AI — WRITE BLOCKED: ${title}`, "", ...lines.map((l) => "  " + l), ""].join("\n") + "\n");
  process.exit(2);
};

const notice = (text) => process.stderr.write(`XENTH AI — ${text}\n`);

const main = async () => {
  const event = await readEvent();
  const tool = event.tool_name ?? "";
  const input = event.tool_input ?? {};

  const isStoreWrite = STORE_WRITE.test(tool);
  const isLocalWrite = LOCAL_WRITE.has(tool);
  if (!isStoreWrite && !isLocalWrite) process.exit(0);

  const ctx = readCompany(event.cwd ?? process.cwd());

  if (isStoreWrite && !ctx.ok) {
    block("this session is not bound to a company", [
      `Tool:   ${tool}`,
      `Reason: ${ctx.reason}`,
      "",
      "Writing to a company store requires a .company.json in the working directory tree.",
      "Open the right client folder and try again.",
    ]);
  }

  if (!ctx.ok) process.exit(0);
  const { company, root } = ctx;

  if (isStoreWrite && /__share_file$/.test(tool)) {
    const email = typeof input.emailAddress === "string" ? input.emailAddress.trim() : "(none)";
    notice(`sharing ${company.name}'s material with ${email} as ${input.role ?? "?"}. Recorded in the journal.`);
    record(
      {
        event: "ai_action",
        tool,
        target: { fileId: input.fileId ?? null, role: input.role ?? null },
        why: "share requested",
        detail: `recipient domain: ${email.includes("@") ? email.split("@")[1] : "unknown"}`,
      },
      event
    );
  }

  if (isLocalWrite) {
    const path = input.file_path ?? input.path ?? input.notebook_path;
    if (typeof path === "string" && !isInside(root, path)) {
      block("write outside the company directory", [
        `Bound company: ${company.name}`,
        `Directory:     ${root}`,
        `Target path:   ${path}`,
        "",
        "This session is bound to a company, so it does not write outside its folder.",
      ]);
    }
  }

  process.exit(0);
};

/**
 * Fails CLOSED on a decided mismatch and OPEN on an undecidable one. A bug here must not brick
 * every tool call in every session, so an internal error lets the call through — and records it,
 * because a guard that silently stops guarding is the worst of both worlds.
 */
main().catch((err) => {
  try {
    record({ event: "guard_error", result: "error", why: "company guard failed internally", detail: String(err && err.message).slice(0, 300) });
  } catch {}
  process.stderr.write("Xenth AI — the company guard could not evaluate this call and let it through. It was recorded in the journal.\n");
  process.exit(0);
});
