---
name: design-ux-evaluate
description: Use when an interface, mockup or prototype already exists and the question is whether people can actually use it — a heuristic review, a cognitive walkthrough of a first-use flow, planning or running a task-based usability test, rating how severe the problems found are, or turning evaluation results into changes for the owner. For the combined critique of a mockup round, diff or pull request use design-ui-inspect; for whether the problem and users are understood at all use design-ux-research; for restructuring the flow that evaluation showed is broken use design-ux-flow.
---

# Design UX evaluate — does it work for the people who use it

This skill judges an existing design against the job its users came to do. Expert inspection first, because it is
cheap and clears the obvious; a walkthrough for any flow a first-time user must survive alone; a usability test with
real participants for anything about to be built or already complained about. Findings come out rated and one change
each, so they enter the owner's comment loop as decisions, not as a report. The combined pre-owner critique of a
round, a diff or a pull request is `design-ui-inspect`, and may call this skill when a flow needs judging against real tasks.

## Procedure

1. **Name the scope and the job.** Which tasks, screens, states, breakpoints; which job story each task serves.
   Without a job story, write the goal the owner states and mark it as an assumption.
2. **Pick the method** from the situation table (`capabilities/design/doctrine/UX-EVALUATE.md`).
3. **Heuristic review.** Walk every screen and state twice; ask each heuristic question; every "no" is a finding
   with its location.
4. **Cognitive walkthrough** for each first-use flow: the four questions at every step, answered as the person.
5. **Usability test** when the method calls for it: five participants per user group, scenario tasks from job
   stories, think-aloud, neutral facilitation, success, time, errors and ease recorded per task.
6. **List everything, then rate.** Severity is set only after the full list exists, by two or three raters where
   possible, reported on the suite's shared scale.
7. **Merge by root cause**, one row listing every location, with evidence and one proposed change.
8. **Route rule checks to their owners**: accessibility to `design-ux-accessibility`, contrast to `design-ui-system`,
   motion to `design-ui-motion`, spacing to `design-ui-layout`, words to `design-ux-copy`. Cite their results.
9. **Feed the loop.** Drop what the owner already ruled on; HIGH findings go to the owner as questions with the
   proposed change; the rest are batched.
10. **Re-check after the fix** with the same task or walkthrough step, and capture the proof.

## Always-on rules

1. Evaluate against tasks people really do, never against a checklist alone.
2. A task's wording never hints at the path; "pay last week's invoice", never "click Payments".
3. The facilitator never helps. A task completed with help is recorded as a failure with help.
4. Five participants find most problems for one group in a qualitative test; never use five for a metric
   comparison, and run more small rounds rather than one large one.
5. Never rate while still searching.
6. A finding without evidence is labelled an opinion.
7. One finding, one proposed change, small enough for one review-loop comment.
8. Record what worked; the next round must not break it.
9. State coverage and what was not verified. Never claim a pass on what was not inspected.
10. Findings are read-only proposals. Evaluation never edits the design itself.
11. Participants are recorded by code only; recordings and quotes stay in the company store.

## STOP conditions

- **No job or task can be named** for the surface. Ask the owner what people come to do there before evaluating.
- **The request is a diff, a pull request or a whole mockup round critique.** Use `design-ui-inspect`.
- **The test would need participants the owner cannot reach.** Run the heuristic review and walkthrough, state that
  user testing is missing, and let the owner decide.
- **Findings show the job itself is misunderstood**, not the interface. Route to `design-ux-research`.
- **Findings show the structure is wrong**, not a detail. Route to `design-ux-flow` before polishing anything.
- **The owner already ruled on a finding.** Drop it.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/UX-EVALUATE.md` | Choosing the method, running a heuristic review, walkthrough or usability test, rating severity, writing findings, feeding the owner loop |
| `capabilities/design/doctrine/REVIEW.md` | Reporting findings on the shared severity scale and row format, or the evaluation is one lens of a combined critique |
| `capabilities/design/doctrine/UX-STATES.md` | Checking that every reachable state of a view was designed and evaluated |
| `capabilities/design/doctrine/UX-RESEARCH.md` | Recruiting participants, handling consent and keeping session records |
| `capabilities/design/doctrine/REVIEW-LOOP.md` | Findings are about to go to the owner as comments or questions |
| `capabilities/design/doctrine/PROOF.md` | Capturing evidence of a finding or of its fix |
