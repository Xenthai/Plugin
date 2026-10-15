---
name: design-ux-research
description: Use before designing a product surface when who its users are, what job they hire it for, or whether the problem is real is still undecided — planning or running user interviews or contextual inquiry, synthesising notes into findings or job stories, listing and ranking the assumptions a design rests on, or deciding whether there is enough evidence to start designing. For journeys, structure, flows and states once the users and the job are known use design-ux-flow; for judging an interface that already exists use design-ux-evaluate; for a company's internal processes use process.
---

# Design UX research — evidence before the first frame

This skill finds out who the users of a product are, what progress they are trying to make, and which beliefs the
design depends on, with just enough evidence to make the next design decision. It runs before `design-ux-flow` and
before any mockup, and its output becomes the brief the `design` loop starts from. It never invents research: a
finding without a participant or a record behind it is labelled as an assumption.

## Procedure

1. **Write the decision.** One sentence: what will be decided with this research, and by whom. No decision, no study.
2. **Desk review.** Read what already exists: the owner's records, support tickets, sales notes, analytics, reviews,
   earlier research in the company store. Mark every question it answers as closed.
3. **List the assumptions** the decision rests on, each falsifiable, typed and ranked by impact and evidence
   (`capabilities/design/doctrine/UX-RESEARCH.md`). Research targets the high-impact, low-evidence ones.
4. **Pick the method from the question**, using the method table in the doctrine. Behaviour is observed;
   motivation is asked about past episodes; counting comes only after the categories exist.
5. **Recruit by behaviour**, across the extremes the product serves; record each participant only by a code.
6. **Write the guide** as topics and anchor questions, in es-MX with usted when the participant is the client's
   user. Show it to the owner before the first session.
7. **Run the sessions**, one asking and one writing verbatim notes when possible, following the interview or
   inquiry rules of the doctrine.
8. **Synthesise within 24 hours** of each session: atomic observations, then affinity clusters named as findings,
   each with its participant count.
9. **Write the job stories** and, for switching behaviour, the four forces.
10. **Update every assumption's status** with the evidence that moved it.
11. **Check the stop conditions.** Enough: hand the brief to `design-ux-flow`. Not enough: name the next cheapest
    test and run it.

## Always-on rules

1. A question the records already answer is never asked of a participant.
2. Never ask what people would do, would want or would pay. Ask what they did the last time.
3. Never show the idea before the participant has told the episode.
4. A feature request is a clue to a need. Record the need it serves, not the feature.
5. A finding names its evidence: participants, count, strongest quote. One participant is a signal, not a pattern.
6. Contradictions between segments stay in the output as findings.
7. A job story names a situation and an outcome, never a solution.
8. Personas, if asked for, are derived from observed behaviour and job stories, never from demographics invented
   to look complete.
9. Research artefacts live in the bound company's store as markdown. Names, recordings and quotes never enter the
   journal or the plugin.
10. A quote or figure that will appear in client-facing text passes through the company's claims register first.
11. Every question to the owner goes through AskUserQuestion, batched.

## Output

A research brief in the company store, short enough to read in five minutes: the decision; three to seven findings
with evidence; the job stories; the assumption table with statuses; what remains unknown and the risk the owner
accepted. Client-facing parts in es-MX; the rest English.

## STOP conditions

- **No decision is written.** Stop and ask the owner what this research will decide.
- **No company is bound** and research notes are about to be written. Bind one first; notes never go elsewhere.
- **No consent** to record from a participant. Take written notes only, or do not run the session.
- **The owner wants opinions validated** ("ask them if they like it"). Reframe to past behaviour or a usability test,
  and say why.
- **The stop conditions are met.** Stop researching and hand over; more sessions are not more certainty.
- **The question is about a company's own operation**, not its product's users. Use `process`.
- **The design already exists and the question is whether it works.** Use `design-ux-evaluate`.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UX-RESEARCH.md` | Choosing a method, writing a guide, running an interview or inquiry, synthesising, writing job stories, ranking assumptions, deciding research is enough |
| `capabilities/design/doctrine/UX-EVALUATE.md` | The open question is whether people can use a design, so the method is a usability test |
| `capabilities/design/doctrine/UX-FLOW.md` | The open question is how people group or find content, so the method is a card sort or tree test |
| `capabilities/design/doctrine/PROCESS.md` | Handing the brief to the design loop and choosing the medium for the first artefact |
