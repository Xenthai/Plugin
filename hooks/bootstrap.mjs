import { readCompany } from "../lib/company.mjs";

/**
 * Announces, at session start, the two facts every skill depends on: which company the session is
 * bound to, and where the plugin lives on disk.
 *
 * The company name is announced twice on purpose, because the two surfaces catch different
 * mistakes. `additionalContext` tells the session itself which company it is bound to, so the
 * first reply can state it. `sessionTitle` puts that name in the tab, the session list and the
 * resume picker, where it stays visible after the announcement has scrolled away — an operator
 * holding four client engagements open at once reads the binding off the list instead of
 * reconstructing it. Writing one company's material into another company's store is the worst
 * thing this plugin can do, and it happens by looking at the wrong window.
 *
 * No title is set when nothing is bound. A generic title is worse than the one the session would
 * have named itself, and the absence of a client name is itself the signal that nothing is bound.
 *
 * The plugin root is announced because `${CLAUDE_PLUGIN_ROOT}` is documented for hook commands but
 * not for shell commands a skill runs later, so the resolved path is handed over here instead of
 * assumed there.
 */
const main = () => {
  const company = readCompany();
  const root = process.env.CLAUDE_PLUGIN_ROOT ?? null;

  /**
   * Announced once here rather than repeated in twenty skills, for the same reason the plugin root
   * is: the model reads every loaded instruction, so a rule stated per-skill is paid for on every
   * invocation and drifts between wordings. It also has to reach the twelve skills that no shared
   * doctrine file happens to be wired into.
   *
   * The two halves pull in opposite directions and both matter. The operator is a person having a
   * conversation and gets answered in the language they wrote in. The company's documents are
   * deliverables read by that company's own people, so their language is decided by the manifest's
   * `locale` and never by whatever language the current message happened to be in.
   */
  const lines = [
    "Xenth AI Plugin ready.",
    "Reply to the operator in the language they wrote to you in. The company's own documents keep the language its .company.json declares, whatever language this conversation is in.",
  ];
  lines.push(
    company.ok
      ? `Bound company: ${company.company.name} (${company.company.id}). State it in your first reply. ` +
          "Store writes are journaled; local writes outside this directory are blocked."
      : `No company is bound (${company.reason}). Store writes are refused until a .company.json exists in this directory tree. Local work is unaffected.`
  );
  if (root) lines.push(`Plugin root: ${root} — use this path for bin/journal.mjs and the render engine.`);

  const out = { hookEventName: "SessionStart", additionalContext: lines.join(" ") };
  if (company.ok) out.sessionTitle = `${company.company.name} — Xenth AI`;

  process.stdout.write(JSON.stringify({ hookSpecificOutput: out }));
};

/**
 * A bootstrap failure must not block the session, but it must not vanish either: the binding
 * announcement is a control, and an operator who never sees it has lost the control without being
 * told. Same posture as the journal hook — complain on stderr, exit 0.
 */
try {
  main();
} catch (err) {
  process.stderr.write(
    `Xenth AI — the session could not be announced, so no company binding was stated: ${String(err && err.message).slice(0, 200)}\n`
  );
}
process.exit(0);
