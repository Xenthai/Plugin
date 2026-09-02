import { readCompany } from "../lib/company.mjs";

/**
 * Announces, at session start, the two facts every skill depends on: which company the session is
 * bound to, and where the plugin lives on disk.
 *
 * The company name is printed so a person half-watching the screen catches a wrong binding by
 * osmosis — a repeated confirmation dialog is ignored within a week; a name in every reply is not.
 * The plugin root is announced because `${CLAUDE_PLUGIN_ROOT}` is documented for hook commands but
 * not for shell commands a skill runs later, so the resolved path is handed over here instead of
 * assumed there.
 */
const main = () => {
  const company = readCompany();
  const root = process.env.CLAUDE_PLUGIN_ROOT ?? null;

  const lines = ["Xenth AI Plugin ready."];
  lines.push(
    company.ok
      ? `Bound company: ${company.company.name} (${company.company.id}). State it in your first reply. ` +
          "Store writes are journaled; local writes outside this directory are blocked."
      : `No company is bound (${company.reason}). Store writes are refused until a .company.json exists in this directory tree. Local work is unaffected.`
  );
  if (root) lines.push(`Plugin root: ${root} — use this path for bin/journal.mjs and the render engine.`);

  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: lines.join(" ") } }));
};

try {
  main();
} catch {}
process.exit(0);
