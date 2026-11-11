export const OPENING =
  "I build AI products that companies can trust: answers tied to their sources, interfaces people actually understand.";

export const CRAFT =
  "I studied comparative literature. Checking a sentence against its passage is the same job.";

export const PASS_SENTENCE = "Full-time employees receive 30 days.";
export const FAIL_SENTENCE = "PTO is unlimited.";
export const PASS_SPAN = "Full-time employees receive 30 days of paid vacation per calendar year";
export const FAIL_EVIDENCE = "The handbook says 30 days.";
export const RECORDED = "Recorded fixture, pinned 9 November 2026.";

export type ExpectedShelfEntry = {
  id: string;
  claim: string;
  label: string;
  href: string;
  limit: string;
};

export const SHELF_COPY: readonly ExpectedShelfEntry[] = [
  {
    id: "citebot-evals",
    claim: "The offline eval scores 18 of 18 example answers.",
    label: "Eval run",
    href: "https://github.com/jakob-alexander2000/citebot-evals",
    limit: "It scores example answers written in advance, and it does not call a model.",
  },
  {
    id: "retrieval-autopsy",
    claim: "The sample answer drops full-time employees only, and Qualifier fails.",
    label: "Demo",
    href: "https://retrieval-autopsy.vercel.app/",
    limit: "The checks match spans and do not judge meaning. The sample is not a policy.",
  },
  {
    id: "citebot",
    claim: "Each claim is marked pass, fail, or unsupported against the passage it came from.",
    label: "App",
    href: "https://citebot-chi.vercel.app/",
    limit: "The golden run uses a stand-in model, so it catches code changes.",
  },
];

export const SCORES = [
  { id: "citebot-evals", value: "18 of 18", date: "29 October 2026", label: "example answers" },
  { id: "citebot-golden", value: "8 of 8", date: "29 October 2026", label: "stand-in model" },
  { id: "autopsy-baseline", value: "25 of 32", date: null, label: "sample baseline" },
] as const;

export const TRY_HREF = "https://citebot-chi.vercel.app/ask";

export const USE_CASES = [
  {
    question: "How many paid vacation days do full-time employees get?",
    source: "pto-and-leave.md",
  },
  {
    question: "Which weekdays are desk days?",
    source: "welcome.md",
  },
  {
    question: "How many minutes is each demo slot before the hard stop?",
    source: "demo-day.md",
  },
] as const;
