export const GITHUB_PROFILE = "https://github.com/jakob-alexander2000";

export const HERO =
  "Jakob Alex builds software in Berlin that shows its sources and checks its own answers.";

export const SCOPE =
  "Four projects: question answering with a visible check, a fixed test set for it, answers from a local folder, and Markdown search without calling an AI.";

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

/** CiteBot's demo question (citebot lib/demo-questions.ts). The third claim is a planted draft from a separate test case. */
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

export const DEFAULT_QUESTION = "What are core hours?";

export const SEARCH_HINT = "The question is filled in. Replace it with invoice to see a miss.";
export const SEARCH_EMPTY = "Type a word to search the notes.";
export const SEARCH_SHORT = "Type a longer word to search the notes.";
