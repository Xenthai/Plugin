# Delegating design work

Implements: fuera del playbook (X9)

Adds to the `engineering` skill's delegation rules (model per complexity, agent caps, relayed-message clause, no git
state operations); nothing here replaces them.

## Who does what

| Role | Does | Never |
|---|---|---|
| One writer agent | Owns the mockup file for the whole loop; applies each batch of comments | Shares the file with a second writer |
| Critique agents | Read-only lenses on the mockup or the live surface (motion, copy, accessibility, layout) | Edit |
| Orchestrator | Reads, reviews, republishes, replies in threads; edits inline only for a tiny change (one CSS line) and says so | Rewrites sections of the file |

## The writer

1. The same writer is resumed with its context for each batch of comments, through a message to that named agent.
   A fresh writer per round loses the decisions the earlier rounds made and re-breaks them.
2. Name the writer when it starts so it can be addressed; a name nobody recorded cannot be resumed.
3. The brief carries: the file path, the tokens source, the batch of comments verbatim with each anchor's DOM path,
   the frozen parts, and the relayed-message clause.
4. Comments go in verbatim. A paraphrase by the orchestrator changes the rule the owner wrote.
5. Message a writer only when it is idle. A message to a running agent forks a copy.

## Critique lenses

1. One lens per agent, on a cheap model: motion against the frequency gate, copy against the dictionaries,
   accessibility, layout against the recorded breakpoints.
2. Lenses read the captured images and the file; they return findings with the element and the rule, never edits.
3. Run lenses before the owner sees a version, not after: the owner's attention is the scarcest resource in the loop.
4. A finding the owner already ruled on is dropped, not re-raised.

## When an agent dies

An agent stopped by a usage limit leaves the file in an unknown state: half a batch applied, a script tag unclosed.

1. Do not trust the file. Diff it against the snapshot, run `node --check` on the inline script, capture the frames.
2. Decide from the diff: finish the batch inline if what is missing is small, otherwise resume the writer.
3. Never publish a file whose last editor died before reporting.

## Scale

1. Cap per-item fan-outs: a lens per page, never a lens per comment. Ten comments are one batch to one writer.
2. The `engineering` skill's cap on agents launched without asking applies unchanged.

## Before you finish

- One named writer owned the file; each batch resumed it.
- Comments reached it verbatim with anchors.
- Critiques were read-only and ran before the owner looked.
- Any inline edit by the orchestrator was tiny and stated.
- A file left by a dead agent was diffed and syntax-checked before use.
