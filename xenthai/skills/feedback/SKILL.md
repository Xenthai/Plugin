---
name: feedback
description: Collect what to fix, add, remove or patch in this plugin, from evidence rather than from impressions — the errors that keep recurring, the guard rejections, the documents that never fill, the skills nobody ever invokes, and what the operator worked around by hand. Use monthly at a client, at the end of a session where something did not work, when an operator says a step is confusing or slow, before shipping a plugin change, and when deciding what to build next. Produces a dated report carrying no client data. For improving the CLIENT's company rather than the plugin, use opportunities.
---

# Feedback — improving the instrument, not the company

Two improvement loops are easy to confuse and they have different subjects:

| Loop | Improves | Skill |
| --- | --- | --- |
| What should this **company** do next | The client's processes and documents | `opportunities` |
| What should this **plugin** do differently | The instrument itself, for every client | this one |

Getting them mixed produces the worst of both: a plugin change justified by one client's preference,
or a company finding filed as a bug.

## The rule that makes this safe to carry off the client's machine

**This report contains nothing about the company.** No client name, no file contents, no person's
name, no target paths, no figures from their business. It carries the *shape* of what went wrong:
which skill, which tool, which event, how many times, over how many periods.

That is not a privacy nicety. It is what allows one client's experience to improve every other
client's install without their material travelling anywhere. If a finding cannot be stated without
naming the company or quoting its documents, it is a company finding — put it in `PROCESSES.md` and
leave it out of here.

## Where the signal comes from, in order

Ask the operator last. Most of what matters is already recorded, and starting with the record means
the questions you do ask are the ones nothing else could answer.

**1. What recurred.** Run the detector rather than remembering:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/opportunities.mjs" --journal <store-root> --json
```

Read it for *plugin* defects, which are a different reading than the company ones:

| Finding | The plugin defect behind it |
| --- | --- |
| `recurring-error` on the same tool | A step that fails repeatedly is not the operator's fault. Either the tool is wrong or a skill instructs something impossible |
| `repeated-block` | The guard is refusing legitimate work. That is a product gap, and the operator has been working around it silently |
| `review-heavy-target` | A document whose structure fights its task. Usually it needs splitting, which is a scaffold change |
| `repeated-escalation` | A decision the plugin makes a person take every time, that a written rule could settle once |

**2. What never filled.** `node "${CLAUDE_PLUGIN_ROOT}/bin/status.mjs" --pending`. A field pending
for three months is not a client who forgot. It is a field nobody can answer, asked in a way that
does not work, or a field that should not exist.

**3. What never fired.** Which skills appear in the journal's `capability` values, and which never
do. A skill nobody invoked in three months is either mis-described — a description is the only
trigger surface — or it is not needed. Both are findings and they have opposite fixes.

**4. What the digest says.** `node "${CLAUDE_PLUGIN_ROOT}/bin/watch.mjs" --journal <store-root>`. An
`ACT` that has been standing for weeks means the signal is either unread or unreadable.

**5. Then ask the operator, four questions.** `capabilities/company/doctrine/SESSION.md` governs how
— one at a time, of the person who does the work, not their director:

- ¿Qué hizo a mano que esperaba que el sistema hiciera?
- ¿Qué paso volvió a hacer porque no quedó claro la primera vez?
- ¿Qué dejó de usar, y por qué?
- ¿Qué le pareció más lento de lo que debería?

The third is the one that matters. **Abandonment is the strongest signal available and it never
appears as a complaint** — an operator who stopped using something does not file a report about it.

## Turning a signal into a change, and refusing the ones that should not be

Every candidate answers three questions, and it is dropped if any answer is missing:

1. **What is the evidence?** A count and a period, or a quoted operator sentence with their role.
   *"Se siente lento"* is not evidence; *"tres veces en dos meses, el paso X se hizo a mano"* is.
2. **Is it the plugin's or this client's?** A change justified by one client's preference is how an
   instrument stops being general. The test: would this help a client in a different sector?
3. **What class of problem is it?** Not "what would fix it" — that comes later. A one-off fix to a
   recurring class is waste.

Then classify, because the four classes have different bars:

| Class | Bar to change |
| --- | --- |
| **Defect** — it does not do what it says | Evidence from one client is enough. Fix it |
| **Gap** — it does not do something it should | Evidence from two clients, or one plus a clear class of problem |
| **Friction** — it works but costs too much | Measure the cost first. Friction with no measurement is taste |
| **Excess** — it does something nobody needs | The hardest to see and the cheapest to fix. A skill nobody invoked, a field nobody filled, a doctrine file nobody reads |

**Excess is the class this practice will under-report**, because nobody complains about a feature
they ignore. Look for it deliberately: the published finding behind this plugin's own design is that
over 80% of a system prompt was removed with no measurable loss, and the diagnosis was
overconstraining. Every unused skill and unfilled field is that tax, paid on every session.

## Write it where it accumulates

One dated file per collection, in the practice's own store — **never in the client's**:

```
feedback/<YYYY-MM-DD>-<client-id>.md
```

The client id is a slug, not a name, and it is there only so a repeated finding can be counted
across clients. Two clients hitting the same friction is what promotes it from taste to a gap.

Each entry: the class, the evidence with its count and period, the class of problem, and — if the
operator said it — their sentence and their role. No recommendation. A recommendation written at
collection time anchors the fix to the first idea anybody had.

Then record that the collection happened:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/journal.mjs" --event lookup --capability feedback \
  --why "plugin feedback collected for <period>" --target "feedback/<YYYY-MM-DD>.md"
```

## Reading the pile, later, to decide what to build

This is the other half and it runs away from the client, with several months of files:

- **Count findings across clients, not within one.** One client's three mentions is one client. Two
  clients' one mention each is a pattern.
- **Sort by class, then by count.** Defects first regardless of count; then excess, because deleting
  is cheaper and faster than adding and it is what keeps the instrument small; then gaps; then
  friction, which needs its measurement before it competes.
- **A finding that has appeared for three collections and not been acted on is itself a finding.**
  Either it is not real, or the practice is avoiding it. Say which.

## STOP conditions

- **A finding cannot be stated without naming the company or quoting its documents.** It is a
  company finding. `PROCESSES.md` owns it, and it does not travel.
- **The only evidence is an impression** — yours or the operator's, with no count and no quoted
  sentence. Record it as an open question, not as a finding.
- **A change is proposed for a single client's preference.** Say so plainly and put it in that
  company's own documents. An instrument bent to one client stops fitting the next.
- **The journal does not exist.** Then most of this has no input. Say so, ask the four questions
  anyway, and record that the recorded half was unavailable and why — the hooks run in Claude Code
  and Cowork and are inactive in chat on the web and in the Desktop Chat tab.

## Reference material

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/SESSION.md` | Before asking the operator anything |
| `capabilities/company/doctrine/CONTROLS.md` | A finding is about what the guard refuses or merely records |
| `capabilities/company/doctrine/MATURITY.md` | A finding is about whether the client's own level moved |
| `ROADMAP.md` | Before proposing anything — it may already be there, or deliberately refused |
| `node bin/watch.mjs --help` | Before quoting any signal from this file |
