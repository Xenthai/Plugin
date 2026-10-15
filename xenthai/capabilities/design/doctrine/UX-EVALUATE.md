# Evaluation: finding what is wrong with an interface and how much it matters

Implements: fuera del playbook (X9)

Evaluation judges a design against how people actually use it. Inspection by an expert is cheap and finds the
obvious; testing with users is slower and finds what experts cannot see. Use both, in that order. The combined
critique pass on a mockup round, a diff or a pull request is `REVIEW.md`; this file is the user-centred judgement
that runs when the question is whether people can do the job, inside that pass or on its own.

## Choose the method

| Situation | Method |
|---|---|
| A mockup or running surface before the owner sees it | Heuristic review, as one read-only lens (`DELEGATION.md`) |
| A new flow a first-time user must get through unaided | Cognitive walkthrough of that flow |
| A design about to be built, or a surface people complain about | Task-based usability test |
| A change in a metric after release | Analytics first, then a test on the step where the drop happens |

## Heuristic review

Walk every screen and state of the scope twice: once to learn the flow, once to judge it. Ask each question; every
"no" is a finding.

1. Status: does the person always know what the system is doing and what just happened, within a moment?
2. Words: does the interface use the person's vocabulary and real-world order, not the system's?
3. Escape: can every action be cancelled, undone or left, without losing work?
4. Consistency: does the same thing look, sound and behave the same everywhere, and follow platform conventions?
5. Prevention: does the design make the error impossible or unlikely before it has to explain it?
6. Recognition: are options, recent values and needed information visible, so nothing must be remembered from
   another screen?
7. Efficiency: can frequent users go faster (shortcuts, defaults, bulk actions) without slowing new ones?
8. Focus: does every element on screen serve the current task? Each extra element competes with the needed ones.
9. Recovery: do error messages say in plain words what went wrong and how to fix it?
10. Help: when explanation is needed, is it in context, short and tied to the task?

## Cognitive walkthrough

For each step of the flow, as a first-time user with the job story's goal, answer:

1. Will the person try to achieve the right effect at this point?
2. Will they notice that the correct action is available?
3. Will they connect that action with the effect they want?
4. After acting, will they see that progress was made?

A "no" with a reason is a finding at that step. Write the reason as the person would think it.

## Usability test

1. Five participants per distinct user group find most of the problems a design has for that group. Three rounds
   of five, fixing between rounds, beat one round of fifteen. Five is too few for numbers; for metrics comparisons
   recruit for the statistics.
2. Tasks are scenarios built from job stories, with a goal and no hint of the path: "You need to pay last week's
   supplier invoice", never "Click Payments".
3. Participants think aloud. The facilitator stays neutral: answers a question with a question, never helps unless
   the participant is fully stuck, and then records the task as failed.
4. Record per task: success (unaided, with help, failed), time, errors, and a one-question ease rating after the
   task. Record what they did and said, verbatim, with timestamps.
5. Test the real flow at the real fidelity the decision needs: a clickable mockup for structure, the running
   surface for timing and states.
6. Remote unmoderated tests are fine for well-defined tasks; moderated sessions for anything exploratory.
7. Participant identity and recordings follow the records rules of `UX-RESEARCH.md`.

## Severity

Rate each finding after all findings are listed, never while still hunting.

| Rating | Meaning | Action |
|---|---|---|
| 4 | Blocks the task or loses data or money | Fix before release |
| 3 | Major: costly to overcome or many people hit it | Fix in this cycle |
| 2 | Minor: slows or annoys, workaround obvious | Schedule |
| 1 | Cosmetic | Fix if touched anyway |

1. Three factors set the level: how many people hit it, how hard it is to get past, and whether it recurs on every
   visit or only once.
2. Two or three raters rate independently and reconcile; one rater's level is a draft.
3. The suite reports one scale, the HIGH, MEDIUM, LOW of `REVIEW.md`, with its order and tie-breaks. The 4 to 1
   ratings map onto it: 4 is HIGH; 3 is HIGH when it recurs or reaches many people, otherwise MEDIUM; 2 is MEDIUM;
   1 is LOW. Use 4 to 1 while rating, report the shared scale.
4. The measurement of contrast, target size, motion and the rest belongs to the sibling skill that owns that rule;
   the evaluation cites its result, never re-measures with another rule.

## Writing a finding

Findings use the row format of `REVIEW.md`, one row per root cause listing every place it shows up, plus:

1. Evidence is a participant code and quote, a walkthrough step, or a screenshot. A finding without evidence is an
   opinion and is labelled so.
2. The proposed change is one change, small enough to become one comment in the review loop.
3. Positive findings are recorded too: what worked is what the next round must not break.
4. Coverage is stated: which tasks, screens, states and breakpoints were evaluated, and what was not verified.

## Feeding the owner loop

1. Run the review before the owner looks, as read-only lenses; findings never become edits on their own
   (`DELEGATION.md`).
2. A finding the owner already ruled on is dropped, not re-raised (`REVIEW-LOOP.md`).
3. HIGH findings go to the owner as questions with a proposed change; MEDIUM and LOW are batched.
4. After a fix, the same task or walkthrough step is re-run to confirm the finding is gone (`PROOF.md`).

## Before you finish

- The method matches the situation; expert review ran before user testing.
- Each heuristic question was asked of every screen and state in scope.
- Test tasks are scenarios without path hints; five per user group; failures recorded honestly.
- Severity was rated after listing, by more than one rater where possible, and reported on the shared scale.
- Every finding has evidence, one proposed change, and its locations; coverage and gaps are stated.
- Fixed findings were re-checked.
