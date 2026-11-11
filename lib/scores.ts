import type { Score } from "./close-reading";

export const SCORES: readonly Score[] = [
  { id: "citebot-evals", value: "18 of 18", date: "29 October 2026", label: "example answers" },
  { id: "citebot-golden", value: "8 of 8", date: "29 October 2026", label: "stand-in model" },
  { id: "autopsy-baseline", value: "25 of 32", date: null, label: "sample baseline" },
];
