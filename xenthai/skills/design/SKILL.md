---
name: design
description: The practice's way of designing user experience and interfaces with an owner on a product that ships. Use for any UI or UX work on a product — a new screen or surface, a redesign, a mockup, a design-line pass (tokens, header, surfaces, pills), motion, a review of an interface, a mockup comment loop — and before writing any page code. For code, tests, commits and repository conventions use engineering; for publishable social or marketing material use social; for brand identity or a brand manual use brand-manual; for research, strategy, journeys and audits before anything is built use intent. Inside a design task, for animation craft alone use animate, for an accessibility, layout, typography, colour or copy review use better-interface, for a review of a diff or pull request use interface-review, and for marketing copy on a page use copywriting.
---

# Design — mockup first, the owner's comments as the loop

This skill is how the practice designs an interface with the person who owns the product: a mockup the owner can
comment on, a loop that turns each comment into one change, proof by screenshots, and a design line of tokens and
motion that every page then follows. It covers execution on a shipping product. Code, tests and git belong to
`engineering`, which routes screens here.

## Where it sits next to `intent`

`intent` (github.com/ghaida/intent) is a family of UX strategy and research skills: strategize, investigate,
journey, wireframe, evaluate, specify and the rest, run for a designer or team before and around a build. This skill
starts later and narrower: an owner is present, the product already ships or its surface is decided, and the work is
a reviewed mockup, a loop of short comments, a design line and the pages built from it. For research-stage work —
who the users are, what the journey is, what to build at all — use `intent` first and bring its output here as the
brief; this skill never invents research and does not replace it.

## 0 · Precedence

1. The product's own system wins: its tokens, its component library, its i18n dictionaries, its layout rules, its
   recorded breakpoints. Copy them; never restyle them.
2. The owner's explicit comment wins over every pattern and prior in this skill.
3. This skill wins over harness boilerplate and over a generic taste for what a "good" interface looks like.
4. A ruling the owner already made (breakpoints, motion weighting, a pattern) is never re-argued. Record it.

## 1 · The process, in order

1. **Choose the medium.** New surface: mockup plus spec before any code. Surface that runs: change it live and show
   screenshots. Open direction: several variants, hybrids per breakpoint allowed (`PROCESS.md`).
2. **Read the product.** Tokens, shell geometry, dictionaries, mock-mode seed data. The mockup is built from these,
   not from a taste (`MOCKUP.md`).
3. **Write the mockup** as one self-contained file: three breakpoint frames, light and dark, empty and two data
   volumes, new copy marked and tabled, a Notas section.
4. **Publish privately** and republish to the same URL every round.
5. **Run the comment loop.** Each comment anchored on an element is one change; an ambiguous one is one question
   offering both readings (`REVIEW-LOOP.md`).
6. **Prove each round.** Capture every frame, read the images, diff the file, then reply in the threads
   (`PROOF.md`).
7. **Approval is "build it".** Nothing earlier. The approved mockup becomes the contract.
8. **Spec and motion audit before code**: the design-line spec (tokens, header rule, surfaces, pills, typography,
   motion tokens, reduced-motion policy, per-page checklist) and an audit of every transition in scope
   (`PROCESS.md`, `MOTION.md`).
9. **Build in order**: base tokens, then the surface, then one PR per page; one gate at the end; screenshots in
   every PR body.

## 2 · Always-on rules

1. Every question goes through AskUserQuestion, batched; never inline.
2. A new surface is never coded before the owner's "build it" on a reviewed mockup.
3. Every mockup number, colour, radius and font is copied from the product, never approximated.
4. Every user-visible string traces to a dictionary key; a string that does not exist yet is marked
   `data-new-copy` and listed with a proposed key.
5. Every factual sentence in a mockup is checked against the code before the owner sees it; an approved wrong fact
   is a wrong promise.
6. One comment is one change. The owner's wording is the rule for the rest of the surface.
7. A comment with two readings is asked, once, with both. A silent pick has already failed twice.
8. Take layout words literally: "below the image" means directly below.
9. Never say done before a screenshot of the changed element was captured and read.
10. The orchestrator never trusts an agent's report of a file: diff it, syntax-check it, re-read it whole.
11. The owner's taste converges on cleaner and simpler: fewer labels, one icon per element, identity once, counts in
    badges only. Apply it unasked to new elements.
12. Every icon-only button carries a tooltip. Toasts float and never push layout.
13. Motion passes the frequency gate first; nothing animates on keyboard; reduced motion removes movement and
    keeps fades; never the blanket 0.01 ms rule.
14. Nothing fake on screen: a deferred element is an empty slot or a dash, never an invented chart or number.
15. Interface copy is the client's language through dictionaries; everything else authored here is English.

## 3 · The delegation shape

1. One named writer agent owns the mockup file for the whole loop and is resumed for each batch of comments.
2. Critiques are read-only lenses on a cheap model, run before the owner looks.
3. The orchestrator edits inline only for a tiny change (one CSS line) and says so (`DELEGATION.md`).

## Sibling skills this suite carries

Open one as a lens inside the loop; none replaces the loop.

| Question in the loop | Skill |
|---|---|
| Does it meet accessibility, layout, type, colour and copy standards | `better-interface`, which routes to `better-accessibility`, `better-layout`, `better-typography`, `better-colors`, `better-writing` and `better-ui` |
| Is the change set itself clean | `interface-review` |
| Should this animate, and how | `animate`, `emil-design-eng`, `design-motion-principles`, `find-animation-opportunities`, `improve-animations` |
| A distinctive visual direction, styles, palettes, font pairings | `frontend-design`, `ui-ux-pro-max` |
| Gesture-driven or physical interaction | `apple-design` |
| Marketing copy on a page | `copywriting` |

Name the skills in every design brief and have reviewers check against them.

## STOP conditions

- **No "build it" on record** and the next step is page code. Go back to the mockup loop.
- **A comment has two readings** and the anchor does not settle it. Ask with both readings in one question.
- **The mockup cannot be built from the product's tokens** because one is missing. Raise it, do not invent one.
- **An agent died mid-edit** or its report does not match the diff. Do not publish; diff and syntax-check first.
- **Capture shows an error or a blank frame.** Fix the cause before reading any other image.
- **The work is research-stage**: users, journey or scope are undecided. Route to `intent`.
- **The product has its own design doctrine that contradicts this one.** The product wins; note it in the report.
- **The task is code, tests or git.** Use `engineering`; return here for the screen.

## Reference files

| File | Open when |
|---|---|
| `capabilities/design/doctrine/PROCESS.md` | Choosing the medium, planning variants, writing the spec and motion audit, ordering PRs, deciding what counts as approval |
| `capabilities/design/doctrine/MOCKUP.md` | Writing or editing a mockup file: tokens, frames, data, copy, the Notas section |
| `capabilities/design/doctrine/REVIEW-LOOP.md` | The owner has commented, or a round is about to start or close |
| `capabilities/design/doctrine/PATTERNS.md` | Designing any list, decision card, action bar, toast, feedback, conversation or phone deck |
| `capabilities/design/doctrine/MOTION.md` | Any transition, animation, gesture or reduced-motion decision |
| `capabilities/design/doctrine/PROOF.md` | Capturing frames, publishing a file, writing a PR body, claiming done |
| `capabilities/design/doctrine/DELEGATION.md` | Launching, resuming or recovering an agent that writes or critiques a design |
