export const GITHUB_PROFILE = "https://github.com/jakob-alexander2000";

export const HERO =
  "Jakob Alex builds software in Berlin that shows its sources and checks its own answers.";

export const SCOPE =
  "Six projects: question answering with a visible check, a fixed test set for it, a dropped limit marked on the passage, a measure of distance from a house voice, answers from a local folder, and Markdown search without calling an AI.";

export const EYE =
  "He studied comparative literature, so he checks a sentence against the passage it came from. He came to software through a coding bootcamp and is finishing a distance-learning computer science degree, graduating early next year.";

export const COLOPHON = "Set in Inter. Made in Berlin, with a guitar within reach.";

export const CLAIMS = [
  {
    // citebot/lib/harness-copy.ts:84, verdict pass at line 85.
    // Same sentence: citebot/tests/fixtures/agent-turns.json:60.
    text: "Full-time employees receive 30 days of paid vacation per calendar year.",
    source: "pto-and-leave.md",
    verdict: "Pass",
  },
  {
    // citebot/lib/harness-copy.ts:107, verdict fail at line 108.
    text: "Unused days can carry past June.",
    source: "The page says unused paid time off does not carry over past March 31.",
    verdict: "Fail",
  },
  {
    // citebot/evals/golden.json:102, verdict fail at citebot/tests/eval-harness.test.ts:69.
    text: "Full-time employees receive 25 days of paid vacation per calendar year.",
    source: "Planted wrong draft. The page says 30.",
    verdict: "Fail",
  },
] as const;

export const PAGE_QUOTES = [
  "Full-time employees receive 30 days of paid vacation per calendar year, plus German public holidays observed in Berlin.",
  "Unused paid time off does not carry over past March 31 of the following year unless a manager approves an exception in writing.",
] as const;

/** CiteBot's demo question (citebot lib/demo-questions.ts:12). The claims are separate examples: two from lib/harness-copy.ts, one planted draft from evals/golden.json. */
export const CITEBOT_QUESTION =
  "How many paid vacation days do full-time employees get, and when does unused paid time off expire?";

export function missSentence(query: string): string {
  const word = query.trim().replace(/[.?!]+$/g, "");
  return `No note mentions ${word}.`;
}

export type QueryPhase = "idle" | "empty" | "short" | "miss" | "hit";

export function queryPhase(submitted: string | null, tokens: number, hits: number): QueryPhase {
  if (submitted === null) return "idle";
  if (submitted.trim() === "") return "empty";
  if (tokens === 0) return "short";
  if (hits === 0) return "miss";
  return "hit";
}

/**
 * Retrieval Autopsy's annual-leave example.
 * Question: retrieval-autopsy src/sample/questions.ts:10.
 * Passage, answer, and verdicts: fixtures/answers.jsonl:2 (id leave-naive).
 * The same answer and verdicts are asserted at src/autopsy.test.ts:74 and :76-81.
 * The passage sentence also opens the annual-leave section at src/sample/handbook.ts:7.
 * Check names: src/ui/Scorecard.tsx:3-6. Pass and Fail: src/ui/Scorecard.tsx:25.
 */
export const AUTOPSY_QUESTION = "How many days of annual leave do employees get?";

export const AUTOPSY_PASSAGE =
  "In practice, full-time employees only receive 30 days of paid annual leave after the probation period.";

export const AUTOPSY_DROPPED = "full-time employees only";

export const AUTOPSY_ANSWER = "In practice, employees receive 30 days of paid annual leave.";

export const AUTOPSY_CHECKS = [
  { name: "Support", verdict: "Pass" },
  { name: "Scope", verdict: "Pass" },
  { name: "Qualifier", verdict: "Fail" },
  { name: "Omission", verdict: "Pass" },
] as const;

/** retrieval-autopsy src/App.tsx:225. The mode that produces the answer above. */
export const AUTOPSY_MODE = "Drops conditions";

/** retrieval-autopsy src/App.tsx:117. */
export const AUTOPSY_NOTE = "Conditions were stripped on purpose.";

/** retrieval-autopsy src/App.tsx:251. */
export const AUTOPSY_SAMPLE = "Synthetic sample. Not a real policy.";

/**
 * Style Distance brand-voice sample. The sentences are examples from the sample,
 * not the whole measurement.
 * House voice: style-distance public/samples/brand.json:9 (Boots).
 * Rewritten draft: public/samples/brand.json:46 (Boots, rewritten).
 * Readings and rounded numbers: README.md:89. The test locks the words
 * off-voice and close at src/lib/delta.test.ts:92-93, on the call at :85-91.
 * The page rounds with toFixed(2) at src/App.tsx:341 and :351.
 * "Pages held out" is the sample title at public/samples/brand.json:39.
 */
export const STYLE_HOUSE =
  "You tie the boots before the kettle boils.";

export const STYLE_DRAFT =
  "The securing of footwear is ordinarily completed before the heating of water has begun.";

export const STYLE_RESULTS = [
  { label: "Drifted drafts", distance: "1.33", reading: "off-voice" },
  { label: "Pages held out", distance: "0.64", reading: "close" },
] as const;

/**
 * Largest contributions from the same brand-sample call as delta.test.ts:85-89.
 * They are not written out on their own line in the repository. Reproduced with
 * reference/style_distance/delta.py (the parity source for src/lib/delta.ts:190,
 * which sorts by absolute contribution). Directions use the page's words at
 * src/components/RankBars.tsx:82. Shares are that absolute contribution divided
 * by the largest, the width formula at RankBars.tsx:78, rounded to one decimal.
 * which 30.18809060937146, is 21.915755894961187, you 12.604019927247485,
 * not 9.421265913838031.
 */
export const STYLE_WORDS = [
  { word: "which", direction: "over-used", share: "100%" },
  { word: "is", direction: "over-used", share: "72.6%" },
  { word: "you", direction: "under-used", share: "41.8%" },
  { word: "not", direction: "over-used", share: "31.2%" },
] as const;

/**
 * The page's scale, with the medians rounded the way src/App.tsx:318 does
 * (data/thresholds.json:3 closeMax 0.7854093168299701, :4 offVoiceMin 1.2723510703123002).
 */
export const STYLE_SCALE =
  "Close is at or under 0.79. Off-voice is at or over 1.27. Drifting is the open interval between those medians.";

/** Opening of public/samples/brand.json:4. */
export const STYLE_SAMPLE = "Synthetic. A made-up house voice and drafts written to leave it.";

export const DEFAULT_QUESTION = "What are core hours?";

export const SEARCH_HINT = "The question is filled in. Replace it with invoice to see a miss.";
export const SEARCH_EMPTY = "Type a word to search the notes.";
export const SEARCH_SHORT = "Type a longer word to search the notes.";
