export const DROPPED = {
  passage:
    "In practice, full-time employees only receive 30 days of paid annual leave after the probation period.",
  answer: "In practice, employees receive 30 days of paid annual leave.",
  checks: [
    { name: "Support", verdict: "pass" },
    { name: "Scope", verdict: "pass" },
    { name: "Qualifier", verdict: "fail" },
    { name: "Omission", verdict: "pass" },
  ],
} as const;

export const PIPELINE = [
  "Question",
  "Retrieve",
  "Draft",
  "Split",
  "Check",
  "Verdict",
] as const;

export const WORKED_QUESTION = "How many paid vacation days do full-time employees get?";
