/**
 * Recorded runs of the three answer checks. Every line here was copied from the tool's own
 * repo or produced by running its code; nothing is written for the site.
 *
 * - Retrieval Autopsy: `runKeyword(HANDBOOK, "How many days of annual leave do employees get?", "naive")`
 *   at commit 92cb0f5, sample handbook (synthetic).
 * - CiteBot: case `pto-wrong-count` in evals/golden.json, recorded eval run of 29 Oct 2026.
 * - Style Distance: the synthetic brand-voice demo and the validation cuts in its README.
 */

export type Verdict = "pass" | "fail";
export type CheckLine = { label: string; verdict: Verdict; note?: string };

export type Specimen = {
  id: "autopsy" | "citebot";
  tool: string;
  href: string;
  question: string;
  source: { label: string; text: string; marks: readonly string[] };
  answer: { label: string; text: string };
  checks: readonly CheckLine[];
  recorded: string;
};

export const AUTOPSY: Specimen = {
  id: "autopsy",
  tool: "Retrieval Autopsy",
  href: "https://retrieval-autopsy.vercel.app/",
  question: "How many days of annual leave do employees get?",
  source: {
    label: "passage",
    text: "In practice, full-time employees only receive 30 days of paid annual leave after the probation period.",
    marks: ["full-time employees only", "after the probation period"],
  },
  answer: { label: "answer", text: "In practice, employees receive 30 days of paid annual leave." },
  checks: [
    { label: "support", verdict: "pass" },
    { label: "scope", verdict: "pass" },
    { label: "qualifier", verdict: "fail", note: "two limits dropped" },
    { label: "omission", verdict: "pass" },
  ],
  recorded: "Recorded run on the sample handbook, which is synthetic",
};

export const CITEBOT: Specimen = {
  id: "citebot",
  tool: "CiteBot",
  href: "https://github.com/jakob-alexander2000/citebot",
  question: "How many paid vacation days do full-time employees get?",
  source: {
    label: "handbook",
    text: "Full-time employees receive 30 days of paid vacation per calendar year.",
    marks: ["30 days"],
  },
  answer: { label: "draft", text: "Full-time employees receive 25 days of paid vacation per calendar year." },
  checks: [
    { label: "citation", verdict: "pass", note: "pto-and-leave.md" },
    { label: "claim: 25 days", verdict: "fail", note: "page says 30" },
  ],
  recorded: "A wrong draft on purpose, from the eval run of 29 Oct 2026",
};

/** Burrows' Delta, with the cuts from the Austen and Brontë validation in the Style Distance README. */
export const VOICE = {
  tool: "Style Distance",
  href: "https://style-distance.vercel.app/",
  max: 1.8,
  cuts: { close: 0.785, off: 1.272 },
  readings: [
    { label: "pages in the house voice", value: 0.64, verdict: "pass" as Verdict },
    { label: "AI drafts", value: 1.33, verdict: "fail" as Verdict },
  ],
  recorded: "Synthetic house voice · measured in the browser, no model",
};

/** Fig. 2. Words only: thresholds stay out until Persona's repo is public. */
export const HANDOVER = [
  { step: "Strong model", line: "does the task first and sets the bar" },
  { step: "Cheap model", line: "runs the same task on cases it hasn’t seen" },
  { step: "Same checks", line: "score both answers the same way", fault: "falls short: the strong model keeps the task" },
  { step: "A person", line: "approves the switch, or doesn’t" },
  { step: "Cheap model", line: "takes over, and every run still ends in a receipt" },
] as const;

/** Fig. 3. The method of the German document benchmark, before any results. */
export const METHOD = [
  { step: "Public page", line: "a German policy or handbook page" },
  { step: "Question", line: "one a reader would really ask" },
  { step: "Answer", line: "from each model, from that page only" },
  { step: "Claims", line: "the answer split into single claims" },
  { step: "Checks", line: "each claim against the page", fault: "a dropped condition is a failure" },
] as const;
