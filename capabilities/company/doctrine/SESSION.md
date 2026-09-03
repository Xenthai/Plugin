# Session doctrine — how to run the hour with a person

`INTAKE.md` says to get facts from documents rather than by asking. This file is for what is left:
the facts that exist only in somebody's head, and the session where they come out.

It applies to every skill that fills a document by talking to a person — `social-identity`,
`social-voice`, `social-presence`, `company-offer`, `process-map`, `process-access`, `baseline`,
`automate-handover`. The failure it prevents is not an awkward meeting. It is a document full of
confident, wrong facts, which then gets published, quoted in a report, or automated against.

## 1. Who is in the room decides what the answer is

This is the first rule because it is the one that silently corrupts everything downstream, and it is
specific to this market rather than generic facilitation advice.

Mexican companies concentrate decision-making heavily in one person — power distance 81/100, and
only about 21% have a board. In a room with their director present, an operator will not contradict
them. Ask "how long does this take?" with the boss sitting there and the answer you write down is
the boss's estimate, delivered in the operator's voice. It will be wrong in the flattering
direction, and nothing later in the engagement can detect that it was wrong, because it is now a
recorded fact with a name attached.

So, before the session, decide who each question belongs to:

| The question is about | Ask | Why not the other one |
| --- | --- | --- |
| How the work actually runs, its exceptions, how long it really takes | The person who does it | Management is routinely unaware of the real exceptions — that is the finding, not a complaint |
| What the company wants, what it will pay for, what may be claimed publicly | Whoever actually decides | The org chart routinely points at someone who cannot approve anything |
| Whether an automation may act alone, and what it must never do | Whoever carries the consequence | Authorisation that is not held by the person exposed to the failure is not authorisation |

If the director insists on being present for the operator's part — and they often will, this is
their company — ask them to say once, out loud, that they want the operator's version and not the
official one. Then ask them to stay quiet. That single sentence, said by the boss, is worth more
than any facilitation technique, and it costs nothing to request.

Record whose answer each fact is. `INTERVIEW.md` exists for this. A fact with a name can be traced
and corrected later; a fact without one can only be believed or discarded.

## 2. One question at a time

Five questions asked together get one and a half answers. The other three and a half get re-asked
later in the session, which reads to the client as not having listened — and they are right.

A double-barrelled question is the same failure inside one sentence. "¿Quién aprueba y en cuánto
tiempo?" gets one answer and you will not know which half it belongs to. Split it.

## 3. Never ask what a document already answered

The client sent the constancia fiscal, the price list, the org chart. Opening a session with a
question those answer tells them their documents were not read, and it spends the goodwill that the
hard questions later in the session need. Read them first. `INTAKE.md` says which files to request
and what each unblocks.

## 4. Ask for instances, never for averages

"¿Cuánto suele tardar?" produces an estimate, and estimates of one's own recurring work run high by
a median of 47%, always in the flattering direction. "Deme los últimos tres" produces facts.

Ask for **three to five specific, dated cases** — this invoice, that ticket, the last one that went
wrong. Specific episodes are recalled far better than rates, they can be checked, and they carry the
exceptions that an average erases. If the person cannot produce three, that is itself the finding:
the process is not as routine as the org believes.

## 5. Show where the session ends

Say at the start how many blocks there are, and say which one you are on as you go. A session with
no visible end is one the client starts managing instead of answering — checking the time, giving
shorter answers, agreeing in order to finish.

## 6. Stop before exhaustion, and never fill a field to be finished

At ninety minutes of fatigue a person will confirm almost anything to end the session. A document
filled in that state contains facts that are wrong and indistinguishable from the ones that are
right, and those facts get published later.

So the sequence is: stop, leave the remaining fields as `— pendiente —`, and book the rest. A
pending field is a working state that every scaffold in this plugin is built to carry. **A guessed
field is not recoverable** — once written it reads exactly like a known one.

People also judge an experience by its hardest moment and by its last one. Do not end on the
hardest question. Put an easy, concrete one last, so the session the client remembers is one they
could answer.

## 7. Read the field back before moving on

Write into the document during the session, not afterwards from notes. Then read the filled field
out loud, in the words that are now in the document, and ask whether that is right.

This is the whole confirmation step and it takes ten seconds. It catches the misunderstanding while
the person who can correct it is still in the room, which is the only time correcting it is cheap.

## 8. How to ask, inside the tool

Two different kinds of question run through a session, and they need different shapes:

- **A closed choice the operator can answer** — which cadence, which platform, which of three
  postures — goes through `AskUserQuestion`. Options are faster to answer than prose and they make
  the decision legible afterwards.
- **An open fact that belongs to the client** — what they said, in their words — is asked in prose,
  so the operator can paste the client's own wording rather than pick the nearest option. Voice,
  positioning and the reason a customer buys are all destroyed by being turned into a multiple
  choice.

Never turn a client's own words into an option list and then record the option as their answer.

## 9. Breadth before depth, and the session's real product

Fill every document's first level before deepening any one of them. A session that goes deep on the
first process and never reaches the other eleven has produced a detailed record of an arbitrary
choice.

The session is not the deliverable. The document is. If the hour produced a good conversation and
no filled fields, it produced nothing that survives to the next session — and the next session will
re-ask, which is where clients stop taking the meetings.

## 10. Cross-references

| File | Read it when |
| --- | --- |
| `capabilities/company/doctrine/INTAKE.md` | Before the session — what to request instead of asking |
| `capabilities/baseline/doctrine/MEASUREMENT.md` | The session will produce a number anyone might later publish |
| `capabilities/process/doctrine/PROCESS.md` | The session is a process mapping or scoping one |
| `capabilities/company/doctrine/CONTROLS.md` | The session will decide who authorises what |
| `<store>/INTERVIEW.md` | Always, at the end — whose answers these were |
