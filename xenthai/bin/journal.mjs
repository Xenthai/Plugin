#!/usr/bin/env node
import { record, EVENTS } from "../lib/journal.mjs";

const HELP = `Xenth AI journal — append one semantic entry to the bound company's journal.

Tool calls are journaled automatically by a hook. Use this only for events a hook cannot know the
meaning of. It exists so a skill can append without a shell redirect, which the company guard
cannot see.

  node bin/journal.mjs --event <name> --why "<reason>" [--actor person:<name>] [--target <ref>]
                       [--capability <name>] [--result ok|error|blocked] [--approval <text>]
                       [--detail <text>] [--session <id>] [--json]

Events: ${Object.values(EVENTS).filter((e) => !["ai_action", "error", "session_end", "guard_error"].includes(e)).join(", ")}

--why is required in practice: an entry that does not say why cannot be audited. Name the person
for anything a person did — an approval with no named actor proves nothing. Never put client
content or a secret in --detail.
`;

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith("--")) continue;
  const key = argv[i].slice(2);
  args[key] = key === "json" || key === "help" ? true : (argv[++i] ?? "");
}

/**
 * An explicit --help succeeded and exits 0: callers discover this script by running --help rather
 * than reading it, so a non-zero exit there reads as a broken tool. Help printed for a missing
 * event is a failure and exits 1.
 */
if (args.help) {
  process.stdout.write(HELP);
  process.exit(0);
}
if (!args.event) {
  process.stdout.write(HELP);
  process.exit(1);
}
if (!Object.values(EVENTS).includes(args.event)) {
  process.stderr.write(`unknown event "${args.event}". Run with --help for the list.\n`);
  process.exit(1);
}

const file = record(
  {
    event: args.event,
    actor: args.actor ?? "ai",
    why: args.why ?? null,
    target: args.target ?? null,
    capability: args.capability ?? null,
    result: args.result ?? "ok",
    approval: args.approval ?? null,
    detail: args.detail ?? null,
  },
  { session_id: args.session ?? null }
);

process.stdout.write(args.json ? JSON.stringify({ written: true, event: args.event, file }) + "\n" : `recorded ${args.event} -> ${file}\n`);
