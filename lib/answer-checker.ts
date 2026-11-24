/**
 * answer-checker numbers, copied from the bench results at a fixed commit so every figure traces to a file.
 * Source: bench/de-arbeitsrecht/results/RESULTS.md at answer-checker 70e6cf6 (engine 0.2.0).
 * When the bench is rerun, update these and the commit together.
 */
export const RESULTS_URL =
  "https://github.com/jakob-alexander2000/answer-checker/blob/70e6cf6/bench/de-arbeitsrecht/results/RESULTS.md";
export const BENCH_URL = "https://github.com/jakob-alexander2000/answer-checker/tree/main/bench/de-arbeitsrecht";
export const REPO_URL = "https://github.com/jakob-alexander2000/answer-checker";
export const SAMPLE_REPORT = "/answer-checker/sample-audit.html";

export type Count = { hit: number; of: number };
export type BenchRow = { measure: string; heldOut: Count | number; all: Count | number; before: Count | number };

/** Columns: held-out (26, never tuned on), all 70 on engine 0.2, all 70 on engine 0.1. Plain numbers are percentages. */
export const BENCH: readonly BenchRow[] = [
  { measure: "Wrong answers caught", heldOut: { hit: 23, of: 26 }, all: { hit: 65, of: 70 }, before: { hit: 29, of: 70 } },
  { measure: "Faithful answers passed", heldOut: { hit: 20, of: 26 }, all: { hit: 64, of: 70 }, before: { hit: 62, of: 70 } },
  { measure: "Correct paraphrases passed", heldOut: { hit: 11, of: 26 }, all: { hit: 39, of: 70 }, before: { hit: 2, of: 70 } },
  { measure: "A fail verdict was right", heldOut: 52, all: 64, before: 28 },
];

/** The sample audit's summary, from examples/sample-audit/audit.json. */
export const SAMPLE = { answers: 70, flagged: 24, confirmed: 13, dismissed: 11 } as const;

export function cell(value: Count | number): string {
  if (typeof value === "number") return `${value}%`;
  return `${value.hit} of ${value.of} · ${Math.round((value.hit / value.of) * 100)}%`;
}
