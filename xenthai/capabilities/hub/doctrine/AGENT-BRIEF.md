# Diagram agent brief

Implements: fuera del playbook (X9)

The shared brief and per-agent prompt for generating an atlas's diagrams in parallel. Read it before
launching the diagram agents. Write the brief once to a file, fill the braces, and have every agent
read it first.

---

## Shared brief

```markdown
# Shared brief for one diagram of the {repo} repository

- Repo: {local path}. Fixed commit: {40-character sha}, origin {url without credentials}.
- Diagram tool: {Archify's path, or "Mermaid/SVG by hand"}. With Archify, read its whole SKILL.md
  first and follow it (authoring-from-repository references, defaults, the type's schema and example).
- CLI (Archify): node {path}/bin/archify.mjs, run from the repo root.
- Browser for validation: {Chromium path or environment variable}.
- Output folder: {repo}/.archify/<type>-<slug>-{date-time}/ with candidate.json and <slug>.html
  (Mermaid: <slug>.html rendering the diagram in a `.diagram-container` element).
- Language: {the company's language}; code names as they are.
- Evidence: every node, state, entity or participant carries real paths and lines, read with line
  numbers. Pass --repo-root to the validation.
- Detail goes in cards, never in more nodes or arrows.
- Forbidden: secrets, environment variable values, hosts, internal URLs, cloud account ids, bucket
  names, production ports, customer data. It is internal material, without sensitive detail.
- Never invent: what is not in the code goes to a card as [por confirmar].
- No commits, no publishing, no edits outside your folder.
- Validate until it passes (follow the tool's repair section).
- Finally take a screenshot of the page at 1440 px wide and look at it. Overlapping or unreadable
  text: repair and validate again.
- Report in ≤150 words: HTML path, screenshot path, what it shows, what you left out, differences
  with the documentation, and what you could not confirm.
```

## Per-agent prompt

```
Read {brief path} first and follow it.

Diagram: type `{type}`, slug `{slug}`. Topic: {what it must explain and for whom}.
Sources to start from: {3–6 file or document paths, with line numbers if known}.
Include: {the essentials}. In cards: {the secondary}.
If the documentation and the code disagree, draw what the code does and note the difference.
```

Launch every agent in the same turn, in the background.

## Before you finish

- The brief names the fixed commit and the forbidden list.
- Every agent received its type, slug, topic and starting sources.
