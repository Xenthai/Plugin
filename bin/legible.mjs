#!/usr/bin/env node
import { readFileSync } from "node:fs";

/**
 * Readability of a Spanish document, for the documents an operator has to act on.
 *
 * Szigriszt-Pazos perspicuity, reported on the INFLESZ scale (Barrio-Cantalejo et al., *An. Sist.
 * Sanit. Navar.* 2008;31(2), validated over 630 fragments from 210 publications). Spanish gets its
 * own index rather than a translated Flesch because Spanish words carry more syllables per word
 * than English ones, so an English formula reports every Spanish text as harder than it reads.
 *
 * The published formula is transcribed inconsistently across secondary sources — one common
 * rendering distributes the coefficient over the second term. Arithmetic settles which is right:
 * ordinary Spanish prose (about 2.0 syllables per word, 20 words per sentence) scores 62 under the
 * form used here and 1328 under the distributed one, and the scale it is reported on runs 0 to 100.
 * `ENVELOPE` below turns that reasoning into a check that runs on every invocation.
 */
const SZIGRISZT = (syllables, words, sentences) => 206.835 - 62.3 * (syllables / words) - words / sentences;

/**
 * The band edges are the published INFLESZ ones. The names are kept in Spanish because they are
 * what a client reads in a report, and translating a scale's own labels invents a scale.
 */
const BANDS = [
  [40, "muy difícil"],
  [55, "algo difícil"],
  [65, "normal"],
  [80, "bastante fácil"],
  [Infinity, "muy fácil"],
];

/**
 * A plausible range for the index over real Spanish prose. Outside it the implementation is wrong,
 * not the text — this is the arithmetic check on the formula's grouping, run every time rather than
 * trusted once.
 */
const ENVELOPE = [-50, 120];

/**
 * The floor a handover document has to clear, and the target for the part of it that gets read
 * under pressure. `capabilities/automate/doctrine/HANDOVER.md` carries why these two numbers and
 * not one, and why neither of them is the actual test.
 */
export const FLOOR = 55;
export const TARGET = 65;

/**
 * Below this many words the index is noise: the validation sampled fragments of at least 500 words,
 * and a sentence-length average over a handful of sentences moves several points per sentence. The
 * script refuses rather than reporting a number nobody should act on.
 */
const MIN_WORDS = 100;
const THIN_WORDS = 200;

const VOWELS = "aeiouáéíóúüàèìòùâêîôûAEIOUÁÉÍÓÚÜÀÈÌÒÙÂÊÎÔÛ";
const STRONG = new Set([..."aeoáéóàèòâêôAEOÁÉÓÀÈÒÂÊÔ"]);
const ACCENTED_WEAK = new Set([..."íúìùîûÍÚÌÙÎÛ"]);

/**
 * Syllables in one Spanish word, by counting vowel nuclei.
 *
 * Spanish orthography is close enough to phonemic that this is an exact count rather than the
 * estimate an English syllable counter is forced into, which is the whole reason this is code and
 * not a rule in a skill. Two adjacent vowels are one nucleus when they form a diphthong and two
 * when they form a hiatus: strong+strong is always a hiatus (*ca-os*), an accented weak vowel next
 * to a strong one is always a hiatus (*dí-a*, *rí-o*), and everything else joins (*cau-sa*,
 * *cui-da*, *buey*). A `u` written after `q` or `g` and before `e`/`i` is silent and carries no
 * nucleus (*que*, *guerra*) unless written `ü` (*pin-güi-no*).
 */
export const syllables = (word) => {
  const w = word.replace(/[^A-Za-zÀ-ÿ]/g, "");
  if (!w) return 0;
  let count = 0;
  let prev = null;
  for (let i = 0; i < w.length; i++) {
    const c = w[i];
    if (!VOWELS.includes(c)) {
      prev = null;
      continue;
    }
    const lower = c.toLowerCase();
    const before = i > 0 ? w[i - 1].toLowerCase() : "";
    const after = i + 1 < w.length ? w[i + 1].toLowerCase() : "";
    if (lower === "u" && (before === "q" || before === "g") && (after === "e" || after === "i")) {
      prev = null;
      continue;
    }
    if (prev === null) {
      count++;
    } else {
      const hiatus =
        (STRONG.has(prev) && STRONG.has(c)) || ACCENTED_WEAK.has(prev) || ACCENTED_WEAK.has(c);
      if (hiatus) count++;
    }
    prev = c;
  }
  return count || 1;
};

/**
 * Prose only. A markdown table, a fenced block, a heading and a link target are not sentences, and
 * a sentence-based formula applied to a table of one-word cells reports a document as far easier
 * than the paragraph an operator actually has to follow. Stripping them is what makes the number
 * mean something; how much was stripped is reported alongside it, because a handover document that
 * is almost entirely table has hardly been measured at all.
 */
export const prose = (src) => {
  const lines = src.split(/\r?\n/);
  const kept = [];
  let fenced = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    if (/^\s*\|/.test(line)) continue;
    if (/^\s*#{1,6}\s/.test(line)) continue;
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) continue;
    if (/^\s*(name|description|allowed-tools|license|compatibility|metadata):/.test(line)) continue;
    kept.push(line);
  }
  return kept
    .join("\n")
    .replace(/`[^`]*`/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_>#|]/g, " ")
    .replace(/\{\{[^}]*\}\}/g, " ")
    .replace(/[ \t]+/g, " ");
};

/**
 * Sentence count. The split needs whitespace after the terminator, which already excludes a decimal
 * point — `1.5` has no space to split on. An abbreviation does have one, so `El Sr. Ramírez` would
 * otherwise count as a sentence; an inflated count lowers words-per-sentence and so raises the
 * index, and a readability tool whose errors all flatter the document is worse than no tool.
 *
 * There is deliberately no rule about a sentence ending in a number. One was tried and it skipped
 * every line of the form `Revise el paso 3.`, which is the shape most instructions to an operator
 * take — collapsing forty sentences into one and reporting the document as unreadable.
 */
const ABBREV = /\b(?:sr|sra|srta|dr|dra|lic|ing|arq|av|col|núm|etc|ej|pág|art|frac|vs|ss|aa|cp|rfc)\.$/i;

export const sentences = (text) => {
  const parts = text.split(/(?<=[.!?…])\s+/);
  let n = 0;
  for (const part of parts) {
    const t = part.trim();
    if (!t) continue;
    if (ABBREV.test(t)) continue;
    if (!/[A-Za-zÀ-ÿ]/.test(t)) continue;
    n++;
  }
  return Math.max(n, 1);
};

export const measure = (src) => {
  const text = prose(src);
  const words = text.match(/[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*/g) ?? [];
  const syl = words.reduce((a, w) => a + syllables(w), 0);
  const sen = sentences(text);
  const score = SZIGRISZT(syl, words.length, sen);
  const band = BANDS.find(([edge]) => score < edge)?.[1] ?? "muy fácil";
  return {
    words: words.length,
    syllables: syl,
    sentences: sen,
    syllables_per_word: words.length ? syl / words.length : 0,
    words_per_sentence: words.length / sen,
    score,
    band,
    prose_share: src.length ? text.replace(/\s+/g, "").length / src.replace(/\s+/g, "").length : 0,
  };
};

const HELP = `Readability of a Spanish document, on the INFLESZ scale.

  node bin/legible.mjs <file.md> [<file.md> ...] [--json] [--floor ${FLOOR}]

Reports Szigriszt-Pazos perspicuity over the document's PROSE — markdown tables, fenced blocks,
headings and frontmatter are excluded, and the share of the document that was measurable is
reported with the score.

Exit 0 when every file is at or above the floor, 1 when one is below, 2 when a file cannot be
measured (too little prose to be meaningful) or the arguments are wrong.

The score is a screen, not the test. A document of short jargon sentences scores well and is still
unusable. capabilities/automate/doctrine/HANDOVER.md says what the actual test is.`;

const main = () => {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(`${HELP}\n`);
    process.exit(argv.length ? 0 : 2);
  }
  const json = argv.includes("--json");
  const fi = argv.indexOf("--floor");
  const floor = fi === -1 ? FLOOR : Number(argv[fi + 1]);
  if (!Number.isFinite(floor)) {
    process.stderr.write("--floor needs a number\n");
    process.exit(2);
  }
  const files = argv.filter((a, i) => !a.startsWith("--") && !(fi !== -1 && i === fi + 1));
  if (!files.length) {
    process.stderr.write("no files given\n");
    process.exit(2);
  }

  const results = [];
  let worst = 0;
  for (const f of files) {
    let src;
    try {
      src = readFileSync(f, "utf8");
    } catch (err) {
      process.stderr.write(`cannot read ${f}: ${err.message}\n`);
      process.exit(2);
    }
    const m = measure(src);
    if (m.score < ENVELOPE[0] || m.score > ENVELOPE[1]) {
      process.stderr.write(
        `${f}: index ${m.score.toFixed(1)} is outside the plausible envelope ${ENVELOPE.join("..")}. ` +
          "The implementation is wrong, not the document. Do not report this number.\n"
      );
      process.exit(2);
    }
    if (m.words < MIN_WORDS) {
      process.stderr.write(
        `${f}: only ${m.words} words of prose. The index is noise below ${MIN_WORDS} — the scale was ` +
          "validated on fragments of at least 500 words. Measure a longer document, or read this one.\n"
      );
      process.exit(2);
    }
    results.push({ file: f, ...m, floor, passes: m.score >= floor, thin: m.words < THIN_WORDS });
    worst = Math.max(worst, m.score < floor ? 1 : 0);
  }

  if (json) {
    process.stdout.write(`${JSON.stringify({ floor, target: TARGET, results }, null, 2)}\n`);
    process.exit(worst);
  }

  for (const r of results) {
    const verdict = r.score >= TARGET ? "OK" : r.passes ? "UNDER TARGET" : "BELOW FLOOR";
    process.stdout.write(
      `${verdict.padEnd(12)} ${r.score.toFixed(1)} (${r.band})  ${r.file}\n` +
        `            ${r.words} palabras · ${r.syllables_per_word.toFixed(2)} sílabas/palabra · ` +
        `${r.words_per_sentence.toFixed(1)} palabras/frase · ${(r.prose_share * 100).toFixed(0)}% del documento es prosa\n`
    );
    if (r.thin) {
      process.stdout.write(
        `            fewer than ${THIN_WORDS} words of prose — treat the score as indicative only\n`
      );
    }
    if (!r.passes) {
      process.stdout.write(
        `            below the floor of ${r.floor}. Shorten the sentences first — words per sentence ` +
          "is the term you control; syllables per word barely moves in Spanish.\n"
      );
    }
  }
  process.stdout.write(
    `\nThe score is a screen. The test is an operator performing the failure step from this document, ` +
      `unaided, while you time it and say nothing.\n`
  );
  process.exit(worst);
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("legible.mjs")) main();
