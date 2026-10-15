# Research: who the users are and what they are trying to get done

Implements: fuera del playbook (X9)

Research exists to change a decision. A study with no decision attached produces a document nobody reads; a decision
with no study attached is a guess the owner pays for later. Every round starts by writing the decision down.

## Pick the method from the question

| The open question | Method | Minimum that answers it |
|---|---|---|
| What do people do today, in what order, with what workarounds | Contextual inquiry: watch the work where it happens | 3 to 5 sessions per role |
| Why they act, what they tried before, what made them switch | Semi-structured interview about a recent concrete episode | 5 to 8 per segment |
| How many people share a behaviour already seen | Survey or product analytics, only after interviews named the behaviour | Enough responses for the split being compared |
| Whether people can use a design | Usability test (`UX-EVALUATE.md`) | 5 per distinct user group |
| How people group the content | Card sort (`UX-FLOW.md`) | 15 for open sorts |
| What the product already knows | Desk review: support tickets, sales notes, analytics, reviews, the owner's own records | Read before any session is booked |

1. Desk review always runs first. A question the records already answer is not asked of a participant.
2. Qualitative before quantitative: a survey can only count categories that interviews discovered.
3. Opinion questions ("would you use", "do you like") are never a method. They measure politeness.

## Recruit

1. Screen by behaviour, not demographics: "approved a supplier invoice in the last two weeks", not "finance, 30 to 45".
2. Recruit across the extremes the product serves: a heavy user, a new one, one who left, one who uses a rival.
3. Friends of the owner and staff of the company are recorded as such; their sessions never carry a theme alone.

## Interview rules

1. Ask about the last time it happened, not what usually happens. Memory of a specific episode carries detail;
   a generalisation carries what the person thinks they should do.
2. Never pitch, never show the idea before the episode is told. Once seen, it contaminates everything after.
3. Ask open and short: "walk me through", "what happened next", "why then". One question at a time.
4. Silence is a tool: wait after an answer; the useful part often comes second.
5. A feature request is a clue to a need, never the need. Ask what it would let them do, and what they do now
   instead.
6. Money, time and effort already spent are evidence; enthusiasm is not. A workaround someone built is the strongest
   signal a problem is real.
7. Two people run a session when possible: one asks, one writes verbatim notes with timestamps.
8. The guide is a list of topics and a few anchor questions, never a script read aloud.

## Contextual inquiry rules

1. Go to where the work happens, during the work. The participant is the expert; the researcher is the apprentice.
2. Note artefacts: sticky notes, spreadsheets beside the system, printed forms, a second screen. Each is a
   requirement the system failed to meet.
3. Interrupt only to ask what a just-observed action meant, then let the work continue.
4. Record the sequence, the breakdowns (where the person hesitates, repeats, or asks someone) and the handoffs.

## Synthesis

1. Within 24 hours, turn each session into atomic observations: one fact or quote per note, tagged with the
   participant code and the timestamp. An observation is what happened; an interpretation is written separately.
2. Affinity: cluster observations bottom-up by similarity of meaning, never into categories decided beforehand.
   Name each cluster with a sentence that states a finding, not a topic word ("people re-key totals because the
   export drops decimals", not "export").
3. A finding states its evidence: how many participants, which ones, and the strongest quote. A finding from one
   participant is labelled as a signal, not a pattern.
4. Contradictions stay visible. Two segments behaving differently is a finding, not noise to average out.
5. The output is short: the decision, three to seven findings with evidence, the job stories, the assumptions
   that changed status, and what remains unknown.

## Jobs to be done

A job is the progress a person is trying to make in a circumstance, independent of any product. Products are hired
and fired for jobs.

1. Write each job as a job story: when (the situation), I want to (the motivation), so I can (the outcome). The
   situation carries the design weight; a persona's age or hobby carries none.
2. A job never names a feature or a solution. If it does, rewrite until the solution could be anything.
3. For switching behaviour, map the four forces from interviews about a recent switch: the push of the current
   situation, the pull of the new option, the anxiety about the new option and the habit of the present one. A
   design that adds pull while ignoring anxiety and habit loses.
4. Distinguish the functional job from its emotional and social dimensions; all three show up in the episode.
5. Personas, when the owner wants them, are built from the job stories and the observed behaviour, never invented.

## Assumptions and risk

1. Before research, list every belief the design depends on, each as a falsifiable sentence.
2. Classify each by type: value (they want it), usability (they can use it), feasibility (it can be built),
   viability (it works for the business).
3. Plot each on two axes: how much evidence exists, how bad it is if wrong. Test the high-impact, low-evidence ones
   first; a well-evidenced assumption is not re-tested to feel safer.
4. Each assumption carries a status: untested, supported, refuted, with the evidence that moved it.
5. Pick the cheapest test that can refute it: a records check before an interview, an interview before a
   prototype, a prototype before a build.

## When research is enough

Stop and design when all of these hold:

1. The decision written at the start can now be made, and the owner agrees which way the evidence points.
2. The last two sessions in a segment added no new cluster.
3. Every high-impact assumption is supported or refuted, or explicitly accepted as a risk by the owner.
4. Further rounds would cost more than being wrong would, given the change can be reversed after release.

Continue past "enough" only when the decision is hard to reverse: pricing, a data model, a removal of something
people use. Discovery does not end at launch; a weekly touchpoint with a user is cheaper than a big study later.

## Records and privacy

1. Research artefacts are company material in markdown inside the bound company's store; never in the plugin, never
   in the journal. The journal records that a session happened, never what was said.
2. Participants get a code (P1, P2); names, phone numbers and recordings stay out of synthesis documents.
3. Consent to record is asked before the session and noted with the code. No consent, no recording.
4. A quote used in client-facing text goes through the company's claims register like any other claim.
5. Interview guides, consent wording and anything the client reads are es-MX, default usted.

## Before you finish

- The decision this research serves is written at the top.
- Desk review ran before any session; the method matches the question.
- Interviews asked about specific past episodes; no pitch, no opinion questions.
- Observations are atomic and coded; clusters are named as findings with participant counts.
- Job stories name a situation and no solution.
- Assumptions carry type, impact, evidence and status.
- The stop conditions are met, or the owner accepted the remaining risk in writing.
- No participant identity or content left the company store.
