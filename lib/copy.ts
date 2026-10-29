export const GITHUB_PROFILE = "https://github.com/jakob-alexander2000";

export const HERO =
  "Jakob Alex builds software in Berlin that shows its sources and checks its own answers.";

export const EYE =
  "He studied comparative literature and taught himself software, so he checks a sentence against the passage it came from.";

export const COLOPHON = "Set in Inter. Made in Berlin, with a guitar within reach.";

export const CLAIMS = [
  {
    text: "Full-time employees receive 30 days of paid vacation per calendar year.",
    source: "pto-and-leave.md",
    verdict: "Pass",
  },
  {
    text: "Unused vacation carries over until March 31 of the following year.",
    source: "pto-and-leave.md",
    verdict: "Pass",
  },
  {
    text: "Full-time employees receive 25 days of paid vacation.",
    source: "Planted wrong draft. The page says 30.",
    verdict: "Fail",
  },
] as const;

export const PAGE_QUOTES = [
  "Full-time employees receive 30 days of paid vacation per calendar year, plus German public holidays observed in Berlin.",
  "Unused PTO does not carry over past March 31 of the following year unless a manager approves an exception in writing.",
] as const;
