# Presence doctrine — what may be observed, and what may be claimed from it

Read this before writing a single row of a company's `PRESENCE.md`. It exists because the ordinary
practice in this field — comparing a client's engagement rate to an industry benchmark — is not
merely imprecise. It is undefined, and this document carries the primary sources that establish
that.

Every rule here is either verified against a primary source, or marked **unverified** and treated
as such. That distinction is the whole point: a presence audit whose own numbers cannot survive the
scrutiny it applies to the client's is worthless.

---

## 1. The decisive fact: the sample cannot be representative

Reach and impressions are retrievable **only for accounts that have authorised the requesting
app.**

- What an outside observer can get for a professional account they do not own (Meta, Instagram
  Business Discovery API): `followers_count`, `media_count`, `id`, and per media item
  `comments_count`, `like_count`, `view_count`. **No reach. No impressions. No saves. No shares.**
- What requires the account holder's own authorisation (Meta, Instagram Insights): reach, views,
  saves, shares, profile visits, audience demographics — behind
  `instagram_business_manage_insights` / `instagram_manage_insights`, with Advanced Access needed
  for accounts the app does not own or manage.

Three consequences follow **necessarily**, not as an allegation about anyone's conduct:

1. A benchmark spanning thousands of accounts **must** use followers as its denominator, because
   followers is the only denominator observable without permission.
2. A benchmark using reach or impressions **can only** be computed on accounts that authorised the
   vendor — overwhelmingly its paying customers. The self-selection is structural. Disclosing it
   would not fix it.
3. The two kinds of figure differ in the **numerator** as well. Saves and shares are invisible from
   outside. An externally-observed rate omits them; an owner-authorised rate includes them.

This is why the answer is not "find a better benchmark". There is no third access path.

---

## 1b. What is actually observable with no access, per platform

Verified in a logged-out browser on 2 September 2026 against Mexican companies. **Auditability is
wildly unequal across platforms, and the audit must say so** rather than implying uniform coverage.

| Tier | Platforms | What a first session can actually produce |
| --- | --- | --- |
| **Near-complete** | YouTube · Facebook Pages · Meta Ad Library | Exact per-item views, reactions, comments **and shares**; exact dates; page creation date; confirmed legal owner; a live ads-running flag; and a free "Popular" sort that ranks the whole catalogue by performance |
| **Substantial** | Instagram · Google Business Profile | Exact per-post likes, comments and ISO timestamps; Reel play counts; highlight names. The full review corpus with dates and owner replies. Blocked past the first screen |
| **Header only** | TikTok · LinkedIn | Profile counts and playlist or tab structure. TikTok's video grid fails to automated collection; LinkedIn walls guests on an undocumented quota |
| **Permalinks only** | X | No feed browsing logged out. Full metrics on any post whose URL is already known — including public **bookmark counts**, a save-intent signal with no equivalent elsewhere |

### Read the HTML, not only the rendered page

Instagram's `<meta name="description">` yields the **exact** post count, like count and comment
count plus an ISO-8601 timestamp precise to the second, where the rendered UI rounds or hides them.
YouTube's grid rounds views ("8.5 K") while the expanded watch page gives the exact figure
("8,597"). **Always expand, and always read the source.**

### Timestamp every capture, without exception

Instagram's meta tag and its own rendered UI disagreed **within one page load** (607K versus
606 mil). A Facebook Reel's view count moved between two consecutive loads. LinkedIn's guest quota
and TikTok's grid both failed non-deterministically. Follower and view counts are the only trend
data this practice will ever be able to reconstruct, **and only if the capture time is recorded.**

### Paid media: the asymmetry is the headline

**Do not promise cross-platform paid-media intelligence in Mexico. It is not deliverable.**

| Source | Mexico coverage |
| --- | --- |
| **Meta Ad Library** | **Full, and no login required** — Meta's own FAQ says anyone can browse without an account. Creative, copy, CTA, destination domain, placements, start date, and a public count of an advertiser's active ads |
| Google Ads Transparency Center | Works, with three caveats: **verified advertisers only** (so an empty result is ambiguous), no targeting detail outside the EU and Türkiye, and impression **ranges** lagged 90 days starting 1 March 2023 |
| LinkedIn Ad Library | Creative, copy and the **legal payer entity** — but no dates, no impressions, no targeting. Those appear only on EU-targeted ads |
| **TikTok Commercial Content Library** | **Returns literally zero.** `MX` is absent from its own 33-region support endpoint — EU-27 plus Iceland, Liechtenstein, Norway, Switzerland, the UK and Türkiye |
| X ad repository | EU-scoped, and the European Commission **fined X €120 million** in December 2025 for a repository that *"lacks critical information, such as the content and topic of the advertisement, as well as the legal entity paying for it"* |

**The non-obvious finding worth checking on every client:** the documented rule is that outside the
EU and UK the Meta Ad Library holds only *active* ads. But a cement company's archive returned
~3,500 ads back to January 2021 **with spend ranges in MXN, impression ranges and audience-size
estimates** — because corporate CSR, sustainability, health and community messaging routinely gets
classified as social-issue advertising, which carries a **seven-year** public archive. Check it per
client before scoping. An empty result is informative too.

Two independent public sources cross-validate each other here: Facebook's Page Transparency panel
carries a binary *"this Page has / does not have ads running"* disclosure, and the Ad Library's
advertiser count agrees with it in both directions.

### Facebook Page Transparency: still there, and partly gutted

Reachable logged out at `facebook.com/<page>/about_profile_transparency`. **What survives:** exact
page creation date, page ID, the confirmed legal owner, and the ads-running flag. **What is gone,
contradicting most published guidance:** name-change history, merge count, admin count, and admins'
primary country. Do not build a checklist item on those.

### Five interpretive traps that would produce wrong findings

1. **A missing verification badge is evidence about spending, not identity.** LinkedIn now requires
   *"an established commercial relationship"* — ads, jobs, or a paid Page subscription. WhatsApp's
   badge is tied to a paid subscription. **Scoring "unverified" as a deficiency would be wrong.**
2. **"X hid like counts" is false.** The June 2024 change made the Likes **tab** private — who liked
   what — not the counts. Public like counts are still readable on any permalink.
3. **LinkedIn's "N employees" is not headcount.** It is self-association, takes up to 30 days to
   update, and admins cannot correct it. One Mexican group showed ~11,775 associated members against
   its own claim of more than 392,000 collaborators — a roughly **33× gap**. In Mexico this
   systematically under-counts field and blue-collar workforces. **The gap is the finding, not an
   error.**
4. **An exact YouTube subscriber count is not public** — three significant figures, and the API
   returns the same rounded value. It is not a workaround.
5. **A member can restrict which LinkedIn profile sections are public, and the list is officially
   unenumerated.** A neglected executive profile and a privacy-restricted one are indistinguishable
   from outside. Never report one as the other.

### Three "free" sources that this practice must refuse

Each looks free and is the excluded pattern — a free tier that limits until it is paid.

- **Google Places API requires billing enabled on a Cloud project**, per Google's own
  documentation. The monthly usage credit is exactly what the constraint excludes. **The manual
  Maps interface is not a downgrade: it gives the full review corpus with dates, where the API caps
  at five reviews.**
- **LinkedIn Premium Business / Sales Navigator insights** — headcount over time, employee
  distribution by function. Genuinely useful, genuinely paid. **Tell the client those metrics are
  out of scope rather than silently omitting them.**
- **LinkedIn competitor analytics** — free tier caps at one competitor, and it is admin-only anyway.

---

## 2. There is no engagement rate to benchmark against

| Platform | Native engagement-rate metric | Source |
| --- | --- | --- |
| Instagram | **None.** The full Insights metric list is `accounts_engaged`, `comments`, `engaged_audience_demographics`, `follows_and_unfollows`, `follower_demographics`, `impressions` (deprecated), `likes`, `profile_links_taps`, `reach`, `replies`, `reposts`, `saves`, `shares`, `total_interactions`, `views` | Meta, Instagram User Insights API reference |
| YouTube | **None with a formula.** The Engagement tab reports watch time, average view duration, views, likes, dislikes, end-screen click rate | YouTube Studio Help |
| Facebook Pages | Not pre-calculated; must be derived | *Unverified from Meta primary — best available support is vendor commentary* |
| LinkedIn | **Two conflicting definitions on its own help pages**: "ratio of interactions per impressions… clicks, reactions, comments, and shares" (Page content analytics) versus "paid and free clicks divided by total impressions" (Campaign Manager). A third variant including follows circulates; unverified | LinkedIn Help, both fetched directly |
| TikTok | Defines one for **paid** placements only | *Unverified from TikTok primary* |

**Every published Instagram engagement rate is a third-party construction.** So is every
cross-platform comparison of one.

### The industry standard defines neither the rate nor the denominator

The MRC Social Media Measurement Guidelines v1.0 (Media Rating Council, dated 2 November 2015 in
the document itself, sponsored by the 4A's, IAB and WOMMA; free PDF) is the only industry standard
for social media measurement. In 12,720 words:

- The strings **"engagement rate" and "denominator" appear zero times.**
- Engagement is defined qualitatively — *"A spectrum of consumer advertising activities and
  experiences (interactions and interest)--cognitive, emotional, and physical"* — and broken into
  Interaction, Content Redistribution, and Advocacy and Influence, with countable actions
  enumerated.
- On follower-style denominators, verbatim: *"Potential Reach: Projected Reach (total count of
  unique users) based on a count of a subset of platform users or a network such as friends,
  followers or fans. **Potential Reach should be limited to use as a planning metric only (not a
  currency measurement).**"*
- On volatile counts, measurers *"should develop consistent methodologies for counting such metrics
  at one or more points in time and fully disclose the rules applied, the time period of measurement
  and the limitations of such techniques."*

The standard itself disqualifies follower-based rates as evaluation currency. Whether a version
later than v1.0 exists is **unverified**; IAB's landing page shows only v1.0 and dates it
17 November 2015, which disagrees with the document. Use the document's own date.

### The numerator is not constant either

From one vendor's own technical documentation: Facebook engagements = reactions + comments + shares
+ post clicks; Instagram = likes + comments + saves + shares; LinkedIn = reactions + comments +
shares + post clicks; TikTok = likes + comments + shares; YouTube = likes + **dislikes** + comments
+ shares. The same vendor documents two different rates on the same data — engagements over reach,
and engagements over impressions — without stating which its published benchmarks use.

A Facebook-versus-Instagram engagement comparison is invalid **inside a single vendor's own
dataset**, because one counts post clicks and the other does not, and YouTube counts dislikes as
engagement.

### A metric that no longer exists

Meta: *"The following metrics have been deprecated for v22.0 and will be deprecated for all
versions on April 21, 2025: `impressions`"* — replaced by `views`. **Any Instagram
impressions-based benchmark published after that date rests on a metric that was withdrawn.**

When a platform changes a metric, **break the series and restate it.** Do not silently splice
`views` onto an `impressions` history.

---

## 3. The published benchmarks, measured against each other

Six publishers' all-industry Instagram engagement rate, from their 2026 reports, all read on the
same day:

| Publisher | Figure | Denominator | Statistic | Sample and how it was drawn |
| --- | --- | --- | --- | --- |
| Rival IQ / Quid | **0.30%** | Followers | Median | 150 per industry × 18, drawn at random from a third-party database of 200,000+ companies. Includes **paid** content |
| Dash Social | **0.4%** | Followers | Average | 3,363 handles ≥1K followers, customers and non-customers |
| Socialinsider | **0.45%** | Followers | Average | 35M posts / 447,613 pages. **Sampling method not disclosed** |
| Dash Social, *same dataset* | **1.9%** | **Views** | Average | Identical |
| Hootsuite | **3.5%** | **Not disclosed** | "Average" | **Not disclosed. No formula, no date range** |
| Buffer | **5.46%** | **Reach** | Average | 52M+ posts / ~161K profiles, **"Buffer users and Buffer-posted content only"** |

The spread between the highest and lowest is **18×**. But the two findings that matter are the ones
a denominator argument alone does not reach:

### Fixing the denominator does not make them comparable

Socialinsider and Rival IQ use the **same denominator, the same platform, the same year** — and
disagree by **1.5×**, in the direction their formulas cannot explain. Rival IQ's numerator is
*broader*: it adds shares, saves and video interactions to Socialinsider's likes-and-comments. It
should therefore read **higher**. It reads lower. The residual is median-versus-mean on a
right-skewed distribution plus sample composition — roughly 2,700 follower-banded brands against
447,613 pages.

Harmonising the denominator is not a fix. It was never only the denominator.

### They disagree on rank order, and nothing can rescale that away

TikTok's engagement rate divided by Instagram's, per publisher:

| Publisher | TikTok ÷ Instagram |
| --- | --- |
| Socialinsider | **7.8×** |
| Rival IQ | 6.7× |
| Dash Social | 1.18× |
| Buffer | 0.84× |
| Hootsuite | **0.43×** |

Hootsuite ranks TikTok the **worst** platform for engagement. Socialinsider's data makes it
**7.8× better than Instagram**.

This is the decisive observation. **A denominator artifact scales every number in a dataset by the
same factor, so it cannot invert a ranking.** These reports are therefore not noisy measurements of
one quantity. They are measurements of **different quantities** wearing the same name.

By industry the divergence is worse: nonprofits 0.56% versus 4.4% (**7.9×**), retail and consumer
goods 0.16% versus 3.0% (**18.8×**).

### The same dataset, two denominators, published side by side

Dash Social's report is the most useful document in the field because it publishes both
denominators for one dataset, which makes its own conflation auditable:

| Same dataset, same posts | Followers | Other denominator | Ratio |
| --- | --- | --- | --- |
| 2026 report | 0.4% | 1.9% (views) | **4.75×** |
| H1 2025 report | 0.3% | 4.0% (impressions) | **13.3×** |

That is the denominator effect **measured** rather than estimated. Use these figures rather than an
arithmetic argument — they come from one publisher's own pair of numbers on one set of posts.

Its own glossary concedes the problem and proceeds anyway: *"Average Engagement Rate — … Each
platform calculates engagement rate differently."*

### Never use any of these for year-over-year change

The "engagement is declining" narrative is confounded with at least four instrument changes:

1. Rival IQ moved its Instagram follower floor from 5,000 to 1,000 — and smaller accounts have
   structurally higher rates, so the change should have pushed the number **up**.
2. Its industry count went 12 → 14 → 18, mechanically shifting a median-of-medians.
3. Dash Social changed its denominator metric between editions.
4. Instagram retired `impressions` in April 2025.

And Socialinsider's own caveat: *"This study contains 2025 values, presented as 2026, because, at
the time of publication, there wasn't enough data for analysis."*

Prior-year Rival IQ reports now return 404 after an acquisition, so year-over-year verification
against the primary source is no longer possible even in principle.

### What correct vendor behaviour looks like

Two publishers behave well, and it is instructive that correctness produces an unusable benchmark:

- **Buffer** publishes its formula, leaves the report ungated, and states the limitation in plain
  words: *"Buffer users and Buffer-posted content only. It's not a full-platform view of any
  network."* An honest disclosure of self-selection is still self-selection.
- **Metricool** likewise discloses that its data covers "accounts connected to Metricool", and
  **publishes no engagement rate at all** — absolute interaction counts only. That is the same
  conclusion this doctrine reaches in §5.

Against these: **Hootsuite's benchmarks should not be used at all.** No sample, no method, no date
range, no formula — labelled "Original research", 11.7× away from the most-cited alternative, and
internally contradictory, since its own Instagram-metrics article says 1–3% is average while its
benchmark table says 3.5%.

**Zero of twelve publishers release raw data.** Every figure in this section is unreproducible, and
no independent audit or replication of any commercial benchmark report exists. That absence is
itself the finding.

---

## 4. Citation laundering, traced

A worked example to use when a client presents a benchmark, because it is more persuasive than an
assertion:

1. A major social-software vendor's blog, page dated March 2026, states Facebook organic reach fell
   from 16% to "between 1–2%". It attributes both figures to a second vendor's site.
2. That second vendor gives a year-by-year series with the disclaimer *"these percentages are
   estimates based on industry research and may vary by page size, industry, and content type."* No
   original source is cited or linked. No sample, no method, no date range.
3. There is no third hop. The chain terminates in the unattributed phrase "industry research".

**The finding is the absence.** Vendor cites vendor cites no one, and the repetition is mistaken
for corroboration. This chain satisfies zero of the eleven disclosure items in §6.

This is the same failure mode that put a third-party safe-zone figure into this plugin's own render
engine, 405 pixels wrong, verified rigorously against the wrong number. A figure repeated
everywhere is not a figure with a source.

---

## 5. The only honest comparisons

### The client against itself, over time

On a definition **frozen in writing at the start**, with:

- the numerator components enumerated,
- the denominator named,
- the extraction instrument named and version-pinned,
- every observation dated,
- and the series broken and restated whenever the platform changes a metric.

### The client against a named competitor set

Observed **on the same day, through the same instrument, with the same formula**, and with the
competitor list published.

Because saves and shares are invisible from outside, an externally-observed set can use only likes
+ comments (+ views where available) over followers. **Say so, and say that it therefore understates
accounts whose audiences save and share rather than react.** An audit that hides its own blind spot
has the same defect as the benchmarks it rejects.

### Prefer no rate at all

The strongest available model is an independent research organisation's, published June 2026: a
named set of 30 accounts, engagement defined as **combined likes and reposts per post reported as a
median**, the collection window stated to the day, year-over-year available for only 24 of the 30
accounts with **the missing six named and explained**, and a stated limitation where one account's
history had been removed shortly after capture.

It publishes **no rate and no denominator.** Absolute engagement per post, as a median, on an
enumerable account set, collected on stated dates.

Three reasons that shape is better:

- **Medians resist the outlier.** One viral post makes a mean meaningless.
- **Absolutes inherit no denominator problem.** There is nothing to argue about.
- **A named account set is reproducible.** Anyone can repeat the observation.

If a client insists on a rate, publish the numerator and the denominator beside it so the reader can
recompute. Never publish a rate alone.

---

## 5b. How much to sample, and how to know the sample was wrong

An exhaustive capture is impossible past the first screen on most platforms, so every presence audit
samples. The question nobody answers is **how to know the sample was representative** — and there is
a free, dated, externally-authored answer, so do not invent one.

**W3C's Website Accessibility Conformance Evaluation Methodology (WCAG-EM) 2.0**, a W3C Group Note
of 23 July 2026, Step 3, prescribes three parts:

1. A **structured sample** — chosen deliberately to cover the distinct types of content and the
   distinct functions present.
2. A **random sample sized at 10% of the structured set**, whose only purpose is to **test whether
   the structured set was representative.** If the random sample surfaces a content type absent from
   the structured set, **the structured set was wrong** — that is the finding, and the structured
   set is redrawn.
3. **Complete processes** — a multi-step flow is sampled end to end or not at all, because a
   fragment of a process tells you nothing about it.

Its scoping rule is equally usable: the scope must be defined so that for any given view it is
**unambiguous** whether it is in or out, with third-party content, mobile and language versions each
addressed explicitly.

**Terminology warning that applies to this practice's own output:** WCAG-EM yields a *conformance
evaluation by the evaluator*. There is no accreditation body for WCAG conformance, and there is none
for content strategy, information architecture, content audits or web content quality either.
**"WCAG certified" is never a correct phrase.** Neither is "certified content audit".

### Review cadence, with an authority behind it

For how often a captured state should be re-observed, a signed government memorandum gives a floor
that is free to quote and adapt: **US OMB Memorandum M-23-22, "Delivering a Digital-First Public
Experience," 22 September 2023**, § III, "Establish content review controls" — **any web content not
actively maintained must be reviewed no less than once every three years** from initial publication
or last review. It also recommends publishing on each page its last-updated date, next review date,
and owner.

The same memorandum describes the content to remove as *"not outdated, inaccurate, useless or
duplicative"* — which is the standard redundant-outdated-trivial triage restated in policy language.
**Prefer citing the memorandum over the practitioner blog post the triage actually comes from**
(Jeffrey Veen, Adaptive Path, 18 June 2002 — *not* the content-strategy author it is almost always
misattributed to). A signed federal memorandum is a stronger citation than either.

### The one source that may be copied verbatim into a client deliverable

Everything else in this doctrine is cite-only. **The UK Government Digital Service's content
guidance is published under the Open Government Licence v3.0, which permits commercial copying and
adaptation with attribution** — the only such permission in this entire corpus.

Its retirement procedure is directly reusable, and it is a decision procedure rather than a
judgement call, with three named outcomes:

| Outcome | What happens | When |
| --- | --- | --- |
| **Withdraw** | Stays published, removed from site search, gets an explanatory banner. Still reachable by direct URL | Expired schemes, old announcements, superseded material |
| **Unpublish** | Removed, with a redirect | Merged elsewhere, better served elsewhere, published in error, contains personal data, out of scope, infringing |
| **History mode** | An automatic system label, not a manual action | Content published under a previous administration |

**Its governing test is the sentence to steal:** whether leaving the content as it is **would get in
the way of a non-specialist user.** And note there is no delete option — which is the right default
for a client's public record too.

---

## 6. Score the client's benchmark instead of refusing it

When a company arrives with a benchmark deck from an agency, do not argue. Score the benchmark, in
front of them, against the eleven items the AAPOR Code of Professional Ethics and Practice requires
for minimal disclosure (April 2021; the code states it applies to all public opinion researchers
regardless of membership, and is free to cite):

1. Data collection strategy
2. Who sponsored and who conducted the research
3. Measurement tools and instruments
4. Population under study
5. Method used to generate and recruit the sample
6. Methods and modes of data collection
7. Dates of data collection
8. Sample sizes, and a discussion of precision
9. How the data were weighted
10. How data were processed, and quality-assurance procedures
11. A general statement acknowledging the limitations of design and collection

This converts an awkward refusal into a demonstration of method, and it cites a standard rather
than an opinion. The practice's own house rule — a stated source, a fixed definition, a measurement
date — is a subset of these eleven, so the same scorecard applies to this plugin's own output.

**Apply it to yourself first.** Every `PRESENCE.md` row states its instrument, its date and its
definition, or it is not written.

---

## 7. What may never be claimed

- **Never "certified" or "verified".** No accreditation exists for organic social engagement
  measurement — the Media Rating Council's accreditations attach to paid-advertising measurement
  (ad impressions, viewability, invalid traffic), and none covers organic engagement or any
  engagement rate. Nothing produced here can be described as certified by anyone. This is not
  caution; it is the only available position.
- **Never "ISO certified".** ISO does not perform certification, does not issue certificates, does
  not audit, and does not permit its logo in connection with certification. **No certification
  exists anywhere for brand, reputation or communications work** — read
  `capabilities/company/doctrine/STANDARDS.md` before naming any standard in a deliverable. It also
  carries the reproduction rule, which is the trap: ISO's terms, tightened on 29 May 2026, require
  a separate licence to put standards text into *"internal or external reports"*, *"presentations or
  communication materials"* or products offered to third parties, and prohibit AI use of that text
  outright. **Cite a dated designation, a title and a clause number; never the clause's text.**
- **Never an AVE.** Advertising Value Equivalency is rejected outright by Barcelona Principle 5
  (AMEC, 2020): *"AVEs are not the value of communication."*
- **Never a reach or impressions figure for an account this practice does not have authorised
  access to.** It is unavailable, not estimable.
- **Never a fake-engagement percentage.** Every circulating figure is published by a firm selling
  fraud detection, with no reproducible method. That inauthentic activity exists in unknown
  proportion is a reason benchmark levels are uninterpretable — it is not itself a number to quote.

---

## 8. Why nobody can check the vendors

Relevant because a client will reasonably ask why an independent source does not simply settle it.

- Facebook cut academic Pages/Groups API access in April 2018; **CrowdTangle closed permanently on
  14 August 2024**, replaced by the Meta Content Library.
- A 2025 survey plus interviews with 19 researchers working under the EU's statutory data-access
  regime found *"significant challenges in accessing social media data… complex API application
  processes, difficulties obtaining credentials, and limited API usability"*, which *"exacerbated
  existing institutional, regional, and financial inequities in data access."*

**Even credentialled academics under a statutory access mandate cannot reliably obtain this data.
Independent replication of a vendor benchmark is not currently feasible.** No survivorship-free
social dataset exists.

---

## 9. Sources

Everything above traces to one of these. Where a row says *unverified*, the claim it supports is
marked unverified in the body and must not be presented to a client as established.

### Standards and codes — free to cite, no certification implied

| Source | Body | Date | Status |
| --- | --- | --- | --- |
| Code of Professional Ethics and Practice, Standards for Minimal Disclosure | AAPOR | April 2021 | Verified, full eleven items |
| Social Media Measurement Guidelines v1.0 | Media Rating Council, sponsored by 4A's, IAB, WOMMA | 2 November 2015 | Verified, full text extracted |
| Barcelona Principles 3.0 | AMEC | 2020 | All seven verified via secondary source with primary references identified |
| Barcelona Principles **4.0** | AMEC | **2025** | **Exists and supersedes 3.0** — cited by the IPR Measurement Commission in August 2026 alongside an AMEC "GEO Principles and Practitioner Guide". Its text is **unverified** from AMEC primary; cite 3.0 with its date and verify 4.0 before relying on either |
| **Dictionary of Public Relations Measurement and Research**, 3rd ed. | Institute for Public Relations (US) | © 2013 | **Verified. Free, ungated PDF, no licence, no membership.** The best source in the field for fixed definitions — see below |
| Research, Measurement and Evaluation — Professional Practice Review | CIPR | © 2021 | **Verified. Free PDF, but "all rights reserved"** — cite, never reproduce. Carries model provenance with authors and dates |
| Global Capability Framework, 11 capabilities in 3 groups | Global Alliance, with the University of Huddersfield | 2018 | **Verified. Explicitly applicable to a department**, not only an individual — which is what makes it usable as an audit rubric. Directed by Prof. Anne Gregory with Dr Johanna Fawkes; **commonly misattributed to Zerfass** |
| AA1000AP — Inclusivity, Materiality, Responsiveness, Impact | AccountAbility | 2018 | Verified. AA1000SES 2015 is current and **v3 is in public consultation** |
| *Auditing Organizational Communication* | Hargie & Tourish (eds), Routledge, 2nd ed. | 2009 | The academic methodology backbone — named, distinct audit methods: questionnaire, interview, focus group, log-sheet, social network analysis, and crafting the audit report |

### The fixed definition to build on

The Institute for Public Relations' dictionary gives the citable, dated definition — and note that it
also supplies a defensible five-part audit scope:

> **Communication(s) Audit:** *"A systematic review and analysis of how effectively an organization
> communicates with all of its major internal and external audiences by identifying these audiences,
> by identifying the communication programs and their communication products utilized for each
> audience, by determining the effectiveness of these programs and their products, and by
> identifying gaps in the overall existing communication program; uses accepted research techniques
> and methodologies."*

The same dictionary defines **Advertising Value Equivalents (AVE)** as *"A **discredited** output
score that suggests an equivalent cost of buying space devoted to editorial content."* **The word
"discredited" is the Institute's own** — that is a cleaner citation for refusing an AVE than
anything else available.

Note also that the practice of starting with an audit is not an invention: a six-point communication
planning model published in 1969 already put *"situation or communication audit"* as step one.
| ISO's own position that it does not certify | ISO | — | Verified |
| ISO 20252 (market, opinion and social research) — the standard third parties do certify to | ISO | 2019 | Scope partially verified; details unverified |

### Platform documentation — fetched directly

Meta Instagram User Insights API reference · Meta Instagram Business Discovery API guide · Meta
Instagram Insights guide and its permission requirements · Meta's `impressions` deprecation notice
(all API versions, 21 April 2025) · YouTube Studio Help, Engagement tab · LinkedIn Help, Page
content analytics · LinkedIn Help, Campaign Manager engagement metrics.

### Peer-reviewed backing for the bias argument

- Olteanu, Castillo, Diaz & Kıcıman (2019). "Social Data: Biases, Methodological Pitfalls, and
  Ethical Boundaries." *Frontiers in Big Data* 2:13. Twelve named bias types; population bias, data
  collection bias, functional bias, non-individual accounts, and black-box sampling all apply
  directly. States that *"individuals do not randomly self-select when using social media
  platforms."*
- Ruths & Pfeffer (2014). "Social media for large studies of behavior." *Science* 346(6213),
  1063–1064. Platforms have *"substantial population biases"* and *"researchers seldom acknowledge,
  much less correct, these built-in sampling biases."*
- Tufekci (2014). "Big Questions for Social Media Big Data." *Proceedings of ICWSM* 8(1), 505–514.
  Names the model-organism problem and vague, unrepresentative sampling frames.
- Trunfio & Rossi (2021). "Conceptualising and measuring social media engagement: A systematic
  literature review." *Italian Journal of Marketing* 2021(3), 267–292. Reviewed 41 peer-reviewed
  articles, 2013 to March 2020: **only 17% use a normalised index at all**, and the review draws no
  standard denominator.
- Freelon (2018). "Computational Research in the Post-API Age." *Political Communication.*
- Mimizuka, Brown, Yang & Lukito (2025). "Post-Post-API Age: Studying Digital Platforms in Scant
  Data Access Times." arXiv:2505.09877.

### The survivorship mechanism, quantified in the field that studied it hardest

A social-analytics vendor's tracked-account panel is structurally the same object as a database of
voluntarily-reporting funds: accounts enter when they buy the tool, exit when they churn, and
history is backfilled at entry.

- Brown, Goetzmann, Ibbotson & Ross (1992). "Survivorship Bias in Performance Studies." *Review of
  Financial Studies* 5(4), 553–580. Truncation by survivorship *"gives rise to the appearance of
  predictability."*
- Fung & Hsieh (2000). "Performance Characteristics of Hedge Funds and Commodity Funds: Natural vs.
  Spurious Biases." *Journal of Financial and Quantitative Analysis* 35(3), 291–307. Separates
  natural biases from those arising from **database collection practices**.

Finance's response was not better disclosure. It was to build survivorship-free databases and to
treat voluntarily-reported benchmark series as biased by construction. **Present this as a
mechanism; do not import its magnitudes.**

---

## 10. Known gaps in this doctrine

Stated so nobody mistakes silence for verification.

- **No head-to-head numeric comparison of two named vendors' benchmarks for the same industry and
  platform.** The argument here rests on the access model, which is stronger, but a client may
  reasonably ask by how much vendors actually disagree, and that number is not in hand. The closest
  thing to a method-transparent publisher in the field should be verified properly rather than
  dismissed.
- **Brand-equity and communication-audit frameworks are largely unverified.** Keller's
  customer-based brand equity is soundly cited (*Journal of Marketing* 57, January 1993, 1–22) but
  its component structure and the brand-inventory / brand-exploratory terminology were not confirmed
  against the primary text. Aaker's *Managing Brand Equity* (1991) and the Brand Equity Ten are
  cited; the five-asset-category taxonomy was not verified. The organisational
  communication-audit strand was not verified at all, and an attribution of audit methodology to a
  professional communicators' association deserves particular scepticism — confirm that such a body
  publishes an audit methodology before citing one.
- **Reproducing a published model's figure is a copyright act.** Cite and describe, or draw an
  original structure and attribute the underlying model.
- **Quotations must be verified against extracted source text, never a summary.** During this
  research an automated read produced fabricated quotations attributing a denominator-disclosure
  requirement to the MRC guidelines; it was caught by extracting the PDF text and confirming the
  phrase appears nowhere in it. Apply the same check to anything quoted in a client deliverable.
