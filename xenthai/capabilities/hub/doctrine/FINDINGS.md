# Engineering findings doctrine

Implements: fuera del playbook (X9)

How the findings of a repository atlas are written. Read it before writing the findings page and the
reply. A finding is **a fact verifiable in the code** plus **the question or risk it opens**. It goes on
the engineering hub's last page and, the top 3–5 only, in the reply.

---

## Three kinds

| Kind | What it is | Shape |
|---|---|---|
| To confirm | Code and documentation (or expectation) disagree, or a decision is missing | "El doc dice que aprueba operaciones; el código solo exige el permiso X." |
| Risk | Something that can cause a security, money or data incident | "La guarda de rutas del portal corre solo en el navegador." |
| Debt | Something that makes the system harder to change or test | "La regla de capas no tiene lint; ya hay una excepción en el módulo Y." |

## Format

A table for what to confirm:

| Tema | Hallazgo | Dónde |
|---|---|---|
| {short topic} | {fact in one sentence, with the exact code name} | {hub page or path} |

A list for risks and debt: one line per finding, starting with the fact.

## Rules

- Cite the exact name (file, function, table, permission). Without a path it is not a finding.
- Never "grave", "crítico" or "urgente": the fact speaks. The team decides priority.
- Never detail that eases an attack (how to exploit, credentials, hosts). Describe the risk, never the exploit.
- If the repo has an open-questions or decisions file, suggest recording there what gets confirmed.

## Before you finish

- Every finding cites a path.
- No finding carries a severity adjective or an exploit.
