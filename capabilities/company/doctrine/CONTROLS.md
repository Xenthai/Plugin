# Controls doctrine — how a rule is actually enforced

Read this before writing any rule that matters, and before promising a client that something cannot
happen.

Four questions, and this document answers each one:

1. **How is a policy enforced?** A skill or a hook — and the choice is not a preference.
2. **How is a change approved?** By someone who did not make it.
3. **How is a number watched?** Deterministically, with the model invited only after a breach.
4. **Where does truth live?** In exactly one place per artefact, named in advance.

---

## 1. A skill is a control, but only an advisory one

This is the sentence that orders everything else in this plugin:

> **A skill is a control, though an advisory one.**

A skill shapes what the model does. It does not prevent anything. The model reads it, follows it
almost always, and can skip it — under a long context, an unusual phrasing, or a conflicting
instruction. That is not a defect to be fixed with firmer wording. **It is the nature of the
instrument.**

> **A policy that must always hold needs something deterministic behind the skill. The skill makes
> violations rare and the hook makes them close to impossible.**

So the choice is made by one question: **what is the cost of this rule being broken once?**

| Cost of a single violation | Instrument | Why |
| --- | --- | --- |
| A worse deliverable, caught in review | **Skill** | Advisory is enough. A hook here adds friction with no gain |
| A client's material in the wrong company's store; a credential in a log; a claim published with no evidence; personal data collected with no notice | **Hook** | Advisory is not enough. This must be refused, not discouraged |
| Somewhere between | **Both.** The skill states the rule so it is followed by default; the hook refuses the case where it was not | The skill makes it rare, the hook makes it near-impossible |

**Every rule in this plugin's doctrine is an advisory control unless a hook backs it.** That is not a
weakness to hide from a client — it is the honest description of the instrument, and stating it is
what makes the two hooks that *do* refuse things credible.

### What this plugin refuses deterministically, and what it merely instructs

Today the guard refuses exactly two things: a store write with no company bound, and a local write
outside the bound company's directory. **Everything else in every doctrine file is advisory.**

When a client asks "can this happen?", the answer has two tiers and both must be given:

- **"No, it is refused"** — only for the two cases above.
- **"It is instructed against and recorded, and here is the record"** — for everything else.

Never give the first answer for a rule that only has the second mechanism. That is the single
easiest way to lose a client's trust permanently, because the day it happens the record will show
the rule existed and nothing stopped it.

### Where a client policy needs a hook

A policy the client states as absolute — data may not leave this folder, this document may never be
shared outside the company, personal data may not be collected without a notice — **is a hook, not
a skill.** If it cannot be expressed as a deterministic refusal, say so at the time it is stated,
and record it as an advisory control with its record. Do not accept an absolute policy and then
implement it as prose.

---

## 2. A denial is a queued decision, not a dead end

A guard that only blocks trains the operator to work around it. A guard that **records what it
refused, why, and what would authorise it** turns the same refusal into an approval workflow.

The pattern, from a published engineering account of the same problem: **default-deny, scope-based
approval, with denials recorded as pending decisions a human can approve.**

So every refusal writes three things:

| Field | Why it is not optional |
| --- | --- |
| What was attempted, as a reference | Without it the record cannot be audited later |
| Why it was refused, in the guard's own words | The operator must know which rule fired, not merely that one did |
| **What would authorise it** | This is the field that turns a block into a decision. A refusal with no route is an obstacle; a refusal with a route is governance |

And the block itself must explain itself: **when a hook stops an action, the reason and the route to
approval appear in the output.** A silent veto is indistinguishable from a bug.

---

## 3. Separation of duties: whoever produced it cannot approve it

> **The agent that wrote the code has no way to approve it.**

Applied here: **the session that drafted a deliverable has no route to mark it approved.** The
journal records author and approver as separate identities, and an approval names a person.

The honest limit, and it must be said to a client rather than papered over: in a plugin whose
audit trail is a file on the operator's own machine, **nothing physically prevents the same person
writing both entries.** The control is a record, not a barrier. A client who needs a real barrier
needs a system of record they administer — their own document platform's approval workflow, or a
two-party sign-off outside this plugin.

State that limit when you describe the audit trail. A practice that names the weakness in its own
control is more credible than one that claims parity with a system it does not have.

---

## 4. Watch a number deterministically, and call the model only after it breaks

This is the instrument a cadence report cannot provide. A report tells you what happened on a
schedule; **a control band tells you when something changed, on the day it changed.**

The design, and note that it is statistical process control — which came out of manufacturing before
it came anywhere near software:

- **Detection stays entirely deterministic. No model is involved in deciding that something
  broke.** A baseline is a mean and a standard deviation over a rolling window, with published
  run rules.
- The response is **tiered by how far out the observation is**, so a small wobble costs nothing and
  a real excursion gets attention:

| Tier | What happens | Why not more |
| --- | --- | --- |
| **1σ** | Log it. Nothing else | Most 1σ excursions are noise. Acting on them is how a monitoring system becomes background noise |
| **2σ** | Invoke the model **read-only** to diagnose | Worth a look, not worth a change |
| **3σ** | The model may act — **but only by proposing through the same review gate**, or by triggering a runbook that was approved in advance | An excursion is not authority |

**A breached band writes the next piece of work.** That is what closes the loop: the excursion
becomes an entry in the triage queue with its diagnosis attached, rather than a line in a report
nobody reads until the quarter ends.

### What to band for a company, not for a codebase

The bands belong on measures the client's own systems already timestamp. **If a measure needs a new
dashboard to exist, it is the wrong measure** — pick one that is already recorded.

| Measure | Where the timestamps already are |
| --- | --- |
| Days to close a quote | The quoting system, or the quote documents themselves |
| Rework or rejection rate on a process | Wherever the rework is recorded today, even a spreadsheet |
| Backlog age on a queue | The queue |
| Days sales outstanding | The invoicing system |
| Escalations per period on an automation | This plugin's own journal |

Two rules that keep this honest:

- **The detection script is version-controlled and testable.** A monitoring rule nobody can test is
  a rumour with a threshold.
- **Baseline before intervention.** A band computed after the work started measures the new process,
  not the change — which is the same error the measurement doctrine names for the before-and-after.

---

## 4b. Three AI-specific data controls, worth asking as three questions

Everything above governs what the plugin does. These three govern what a company's data does once
any AI touches it, and they are the ones a client has usually never been asked about directly.

1. **Can sensitive data be kept out of model training and model use, with certainty that none
   leaks?** Not "do we have a policy" — can it be demonstrated for a named dataset.
2. **Is third-party IP inside the models being used accounted for, and is the company's own IP
   prevented from leaving?** Both directions. Most clients have thought about neither.
3. **Can anyone trace how an AI system interacted with internal data?** Which data, when, on whose
   behalf, and can it be reconstructed afterwards.

Ask them exactly like that, in `process-access`, of the person who authorises. They are yes/no
questions with evidence attached, which is what makes them useful — a client who answers "yes" to
the third and cannot produce the record has just told you something more valuable than a "no".

### Why these three and not a longer list

They come from IDC's surveys, reported by Neil Ward-Dutton (IDC Europe) in *Data strategies for AI
leaders*, MIT Technology Review Insights, 2024 — **a paper sponsored by Snowflake**, which sells the
remedy. Treat the accompanying figure accordingly: only 30–40% of businesses were confident in each
control. That number is second-hand, the underlying IDC study is not in hand, and the sponsor's own
Head of AI is the dominant voice in the paper. **Do not put the percentage in a client deliverable**;
if it is mentioned aloud, name the sponsor in the same sentence, per `STANDARDS.md`.

The three controls themselves survive that discount entirely, because a checklist does not need a
survey behind it to be worth running. Each names a specific, checkable failure rather than a
posture, and each is one a Mexican client is exposed to under the LFPDPPP regardless of what any
survey says.

### What the answers change

A "no" to any of the three is not a reason to stop. It is a **scope finding**, and it belongs in
`PROCESSES.md` §5 alongside the prohibited-actions list:

| Answer | What it makes true |
| --- | --- |
| Cannot keep sensitive data out of training or use | No process touching personal or client data goes past rung 1 until it can. That is a prohibited action, not a risk to accept |
| Cannot account for IP in either direction | Anything producing public-facing or contractual text needs a named human approver on every output, and it needs to be written down |
| Cannot trace AI interaction with internal data | The engagement's own journal is the client's only trace. Say that plainly — it raises what the journal is worth, and it also means an absent journal is a lost control, not a quiet month |

The third answer is the one worth pausing on. A client who cannot trace this is not unusual, and the
plugin does not solve it for them — it solves it only for the work that passes through the plugin.
Claiming otherwise would be exactly the overreach `§1` refuses.

## 4c. The language a document is written in is a control, not a preference

The company's documents are read by that company's own people. So their language is decided by the
manifest's `locale` and never by whatever language the current conversation happens to be in — an
operator switching to English for one message must not turn a client's deliverable into English.

That rule used to be prose with nothing behind it, in the worst way: `locale` sat in every manifest
and **was read by nothing**, so it looked like a control and was decoration. Two things enforce it
now, and they cover different halves:

| Where | What it catches |
| --- | --- |
| `doctor`, on the manifest | A locale this toolchain cannot honour. Every client-facing part is Spanish by construction — the scaffolds, the report templates, `bin/report.mjs`'s prose, and the readability index whose scale and syllable rules are Spanish-only — so a non-Spanish locale is refused rather than ignored |
| `status`, on each written document | A document that **was filled** in the wrong language. The scaffold ships in es-MX and a session fills it, and a file with Spanish headings and English content looks finished |

`status` audits two sets, and the second one is where the visible artefacts live. The eighteen
scaffolds are named by the plugin, so they can be listed. **A report and a month's plan cannot** —
they sit in dated subfolders — and those are exactly what a director reads and what goes to review,
so they are scanned rather than listed.

Three directories are never audited, and the exclusions carry as much weight as the inclusions:
`journal/` holds English event names by design and is machine-read, `digest/` is written for the
practice rather than the client, and `feedback/` is about the plugin and must stay English so one
client's experience can improve every other install. Reporting any of the three as a defect would be
reporting a correct design as broken, which is how a check earns being ignored.

`status` abstains rather than guessing when a document is still mostly `— pendiente —`. That floor
is deliberately **far lower than the readability one**: readability is a mean over sentences and
needs a generous sample, while language is the frequency of a language's commonest words and is
decisive almost at once — over the first forty words of this repository's files, its English
documents score 0 per thousand and its es-MX ones 225 to 275. Sharing the readability floor meant
every short deliverable, a one-page biweekly report included, escaped the check entirely, which is
the opposite of what a floor is for.

### What counts as content, and what does not

The rule is about **content**, never about file names. `BRAND.md`, `reports/`, `digest/` and every
other path stay as they are: a name is a handle for the operator, and translating handles breaks
every reference in every skill for no reader's benefit.

Content includes the words inside a rendered asset. Those cannot be audited once they are pixels,
but the render is deterministic from `content/<periodo>/pieces.json`, so measuring that file measures
the published result exactly — and it is the last point at which a client's public copy can still be
checked. Every string in a piece is treated as copy except a short list of tokens (`archetype`,
`unit`, `art`, `chain`, `target`, `id`, `kind`). That exclusion list is deliberately the inverse of a
copy-field list: enumerating the copy fields would make a new archetype's text invisible until
somebody remembered to add it, and an unmeasured field is how the wrong language reaches a published
asset.

### Two signals, because one of them fails on headlines

Language is judged on Spanish function-word density **or** accent density, whichever clears its
floor. Requiring both would reinstate the bug that found this: marketing copy is telegraphic —
*Cotizaciones por semana*, not *las cotizaciones que se hacen por semana* — so it drops the very
words a density measure counts. A real es-MX chart piece scored 125 per thousand against a floor of
150 and was reported as foreign.

Accents survive that compression, because the words a headline keeps are the content words and that
is where Spanish accents live. Across this repository the English documents run 0 to 7 accents per
thousand words and the es-MX ones 111 to 126, so the two floors sit far from anything real.

### What the research says, and where this sits in it

Language identification is a studied problem, and both signals used here are named families in its
own literature: Cole et al. (1997), as enumerated by Vatanen et al., lists *"short words,
probabilities of various character combinations, n-grams of words, n-grams of characters, **diacritics
and special characters**, syllable characteristics, morphology and syntax"*. Function words are the
short-words family; accents are the diacritics one. Neither was invented here.

The standard method is character n-grams — Cavnar and Trenkle (1994) reach 99.8% on documents over
300 characters and 98.6% on shorter ones. **That method was deliberately not adopted**, because it
needs a trained profile per language and this task does not resemble the one it solves.

The literature's hard case is many languages and tiny samples. Vatanen et al. (LREC 2010) test 281
languages on samples of 5 to 21 characters and report 72.5% average recall for their best model —
English alone at 59.6%. Those figures are a floor for a far harder problem, not a benchmark for this
one: here the candidate set is **two** (Spanish, or not Spanish), there is a strong prior that the
document is meant to be es-MX, and the samples are twenty-five words or more.

### Validated externally, and the margins are wide

Calibrating on this repository's own files was internal validation — one author, one style — so the
floors were checked against text nobody here wrote:

| Sample | Kind | Function words / 1000 | Accents / 1000 |
| --- | --- | --- | --- |
| Ley Federal de Protección al Consumidor (PROFECO, 37k words) | Spanish, external | **396** | not testable, the extractor dropped them |
| Wikipedia es, *mercadotecnia* (231 words) | Spanish, external | **394** | **134** |
| the same, cut to 26 words | Spanish, external, short | 308 | **0** |
| *Data strategies for AI leaders* (MIT Tech Review, 3.5k words) | English, external | **1** | 0 |

Floors of 150 and 40 sit with external Spanish 2.6× above one and 3.3× above the other, and external
English 150× below. Two things fell out of it worth keeping:

- **Each signal caught the case the other missed, on real text.** The 26-word Spanish extract has
  zero accents and passed on function words; the telegraphic chart piece is below the function floor
  and passed on accents. The `OR` is not a hedge, it is load-bearing.
- **This repository was the harder sample in both directions.** Its English carries Spanish quotes
  (22 against an external 1) and its Spanish is more telegraphic (318 against an external 394). The
  floors were therefore calibrated conservatively by accident, which is the safe direction.

**What is still only internally validated** is the specific hard case: short, telegraphic es-MX
marketing copy. No external sample of that was obtained, so the chart piece standing in for it was
written here. If that case ever misbehaves, this is the paragraph that says why nobody had checked.

**Crying wolf on correct work is the worse failure of the two.** A check that flags a good piece
teaches its reader to stop looking, and after that it catches nothing at all.

**The failure this closes is a wrong answer that looks right**, which is the class this plugin
spends most of its rules on. It was also committed here: the readability index scored this plugin's
own English `INSTALL.md` at 87 and *muy fácil* for a while, because a Spanish formula run on English
still lands in its plausible range and still prints a band. A measurement that cannot fail on the
wrong input is not a measurement.

## 5. Name one source of truth per artefact, before there are two

> **For every artefact the process produces, name one system as the source of truth, with
> everything else holding a copy or a link to the original.**

Three workable configurations. Pick per artefact, not once for the engagement:

| Configuration | When it is right | The cost |
| --- | --- | --- |
| **The company's store is authoritative** | The documents this plugin writes are the record; the client's other systems reference them | Cleanest when one team owns the documents. Fails when a regulator or auditor already accepts the other system |
| **The client's existing system is authoritative** | Their ERP, their document platform, their ticketing system is the record; the plugin's documents are working copies | Requires reading the record at the start of a session and writing the outcome back in the same session |
| **Linkage, accepting two sources** | Neither can be displaced | Every plugin artefact records the other system's record id, and every record carries the plugin artefact's identifier. **This is the honest minimum bar and the right starting point** |

**Do not try to move a client off their system of record.** In a medium-to-large Mexican company
that system is frequently accepted by their auditor, their SAT filings, or their customers, and
displacing it is a change programme larger than the whole engagement. Link to it.

And name it early: **an artefact with no named source of truth becomes an orphaned record the moment
two copies disagree**, and by then nobody can say which one was right.

---

## 6. The control surface a client will actually use is not version control

An engineering account of a company that rolled agents out to 1,100 employees names its hardest
problem, and it was not the AI:

> **Expect the git hurdle, not the AI hurdle.** The hard part was getting business users comfortable
> with cloning a repo and working in Git and pull requests, more than anything about the AI itself.

That was at a company with four codebases, a deployment pipeline, and a CTO who personally built
the templates. **A client of this practice has none of those.**

So copy the **properties**, not the tool:

| Property a review gives | How to get it without version control |
| --- | --- |
| A comment on a specific line | A dated review block inside the document, quoting the line it concerns |
| A named approver | A signature line with a person, a role and a date — never "dirección" |
| History that cannot be quietly rewritten | An append-only change log at the foot of the document, plus the journal entry |
| Trivial rollback | The previous version kept, named by date, never overwritten |

**Do not put a client in git.** The properties are the control; the tool is incidental.

---

## 7. Two rules about the rules themselves

**When a mistake happens twice, the correction goes into the instruction — not into a special
case.** And when it does:

> **Fix the principle, not the example.**

A published account of a team that got this wrong describes the failure exactly: *"It would 'fix'
things by encoding the specific case, and we were accumulating patches instead of getting
smarter."* Their correction was to cap how many specifics may enter a change at all.

Applied here: when an engagement reveals a gap in a scaffold or a doctrine, **change the rule, not
by appending the client's case to it.** A scaffold that grows a special case per client is on its
way to being useless for the next one.

**And keep the always-loaded instructions short.** Anything a session reads at the start costs
context on every single session, and stale content costs it for no benefit. Short and current beats
long and comprehensive — a 500-line instruction file read at every session start is a tax paid
forever on text that was true once.

## 8. Cross-references

| File | Read it when |
| --- | --- |
| `capabilities/automate/doctrine/HANDOVER.md` | An automation is climbing the autonomy ladder — the rungs are advisory controls with a measured gate |
| `capabilities/report/doctrine/REPORTING.md` | A cadence is being proposed — bands are what a cadence cannot do |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | A band's baseline is being computed, or a before-and-after claimed |
| `capabilities/company/doctrine/STANDARDS.md` | A standard or certification is about to be named in a deliverable |
| `MCP.md` | A connector's trust or scope is in question |
