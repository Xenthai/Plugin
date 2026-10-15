# Page copy

Implements: fuera del playbook (X9)

How a company's web page is argued: home, landing, pricing, feature, about. The company-independent rules for any
client-facing words (the two questions, voice as rules, the never list, language, regulators) are in
`capabilities/social/doctrine/COPY.md` and are not repeated here. Where this file and the company's `VOICE.md`
disagree, `VOICE.md` wins.

## Who reads a business page

A business purchase is decided by several people who research separately and rarely announce themselves
(`skills/social-plan/SKILL.md` records the figure as a working assumption). Consequences for a page:

1. The page is read by roles, not by one persona: the person with the problem, the one who will use the product, the
   one who pays, the one who must approve the risk. Each finds the answer to their question without having to call.
2. Most visitors are not ready for a meeting. The primary action is sized to the page's job; a lower-commitment
   secondary path (see how it works, see pricing, read a case) serves the researcher.
3. Judgement on the page persuades more than insistence: a clear explanation of how the problem gets solved is itself
   the evidence of competence.

## One page, one job

Before any sentence, write down:

| Field | Content |
|---|---|
| Job | The one decision this page must move a visitor toward |
| Reader | Which roles arrive, from where, knowing what (ad, search, referral, a sales email) |
| Primary action | One, with its commitment level |
| Secondary action | At most one |
| Claims available | The live rows of `PROOF.md` this page may use |
| Words | The customer's own phrases, from `CUSTOMERS.md` and the interview log |

A section that serves no field above is cut.

## Clarity first

1. In five seconds above the fold a stranger can say what it is, who it is for, and what to do next. Test it on the
   draft by reading only the headline, subheadline and button.
2. Clear beats clever. A pun or metaphor stays only if the plain reading still works without it.
3. The customer's words beat the company's. Category jargon stays only if the buyers use it themselves.
4. One idea per section; the sections in order make one argument.

## Benefits tied to proof

Each benefit is a chain of three links; a missing link changes what may be written:

| Link | Source | If missing |
|---|---|---|
| Feature: what the product does | The company's offer documents | Do not mention it |
| Change: what is different for the reader | Customer interviews, `CUSTOMERS.md` | State the feature plainly, without an invented consequence |
| Proof: evidence the change happens | A live `PROOF.md` row | Describe the mechanism, not a result |

1. Specific beats vague, but a specific number is a claim. Without a row, be specific about how the thing works
   ("revisa cada factura contra la orden de compra") instead of how much it delivers.
2. Outcomes, comparisons, client names, logos, credentials, timelines, prices, guarantees and deadlines all need a row.
   A price is a claim; so is "sin plazo forzoso".
3. A testimonial is a claim twice: the quote needs a row and the person's permission to be named.
4. The image beside a claim demonstrates it: a screenshot of the real product, a real report, a real document. A stock
   photo proves nothing.

## The sections

The default argument, top to bottom; reorder only with a reason written in the annotations.

1. **Hero.** Headline (the value, for whom), subheadline (how, or the main objection answered, two sentences at most),
   primary action, the demonstrating visual.
2. **Problem.** The situation in the reader's words, specific enough that they recognise their own week; the cost of
   leaving it as it is, only as far as a row supports it.
3. **How it works.** Three or four steps, each an action and its result. This is where the mechanism replaces the
   missing number.
4. **Proof.** The strongest live rows: a case, a quote with name and role, a credential. Fewer and real beats many
   and vague. No row, no section; never a placeholder logo strip.
5. **Objections.** The questions buyers actually ask, from interviews and sales conversations: fit, effort to start,
   risk, price, difference from the alternative they already use (including doing nothing).
6. **Close.** The value in one line, the primary action again, and what happens after the click.

| Page | What changes |
|---|---|
| Home | Serves several readers; routes each to their page; the broadest true value statement |
| Landing | One source, one message, one action; the headline continues the promise that brought the visitor; navigation minimal |
| Pricing | Helps choose: who each plan is for, what is included, what is not, the recommended plan marked, the money questions answered |
| Feature | One capability: what it does, the change it makes, how, and its path to try or buy |
| About | Why the company exists, who is behind it, how it works with clients; still ends with an action |

## Headlines

1. Write four to six candidates, each from a different angle: outcome, problem, audience plus category, mechanism,
   the reader's question, the contrast with the current way.
2. Each candidate passes the competitor test of `COPY.md` and names the `PROOF.md` row it leans on, or "no claim".
3. No candidate opens with a negation; "Nunca más..." and "Deje de..." are out by `COPY.md`.
4. Recommend one, with the reason, and keep two alternatives.

## Calls to action

1. A verb plus what the visitor gets: "Agendar diagnóstico", "Ver precios para su equipo", "Descargar el caso
   completo". Never "Enviar", "Más información" alone, or "Haga clic aquí".
2. The commitment matches the reader's stage; a demand for a call on a researcher's page is the wrong size.
3. Say what happens next beside the button when it is not obvious ("Le respondemos en un día hábil" only if the
   company does, and the register has it).
4. Risk reducers and urgency are claims. A deadline, a free period or "sin compromiso" appears only if true and
   registered.
5. Person and mood follow `VOICE.md`; without a rule there, use the infinitive, as interface buttons do.

## The output

One markdown file per page revision in the company store, each revision a new file:

1. Page brief (the table under "One page, one job").
2. The copy section by section, ready to paste, in es-MX.
3. Under each section an annotation: its job, the rule it applies, the `PROOF.md` rows used or "no claim".
4. Headline and primary CTA alternatives, two or three each, with the angle and the reason.
5. Meta title (about 60 characters) and meta description (about 155), both carrying no claim without a row.
6. A claims table: every claim on the page, its row, its re-verification date.
7. Open questions: what an interview or the client must answer before a section can be stronger.

## Before you finish

- The page brief exists and every section serves it.
- Headline, subheadline and button alone say what, for whom and what next.
- Every benefit has its feature; every outcome, number, name, logo, price, guarantee and deadline has a live row.
- The visual next to each claim demonstrates it.
- Headlines come from different angles, pass the competitor test, none opens with a negation.
- CTAs name what the visitor gets and fit the reader's stage.
- Voice follows `VOICE.md`; register and anglicisms follow `COPY.md`.
- Annotations, alternatives, meta, the claims table and open questions are in the file.
