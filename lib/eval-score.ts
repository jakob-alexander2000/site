/**
 * citebot-evals score.ts, the offline checker.
 * A case clears when every configured check holds.
 */

export type EvalCitation = { source: string };

export type EvalExpect = {
  answerIncludesAny?: string[];
  answerMustNotInclude?: string[];
  minCitations?: number;
  citationSourcesAny?: string[];
  mustRefuse?: boolean;
};

export type EvalResponse = {
  answer: string;
  citations: EvalCitation[];
  error?: string;
};

export type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const REFUSAL_MARKERS = [
  "do not have",
  "don't have",
  "not in the handbook",
  "not covered",
  "handbook does not",
  "no information",
  "i don't know",
  "i do not know",
  "cannot find",
  "can't find",
  "not mentioned",
  "doesn't mention",
  "does not mention",
  "insufficient",
  "no mention",
  "outside the handbook",
  "not stated",
];

function includesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((needle) => h.includes(needle.toLowerCase()));
}

function includesNone(haystack: string, needles: string[]): boolean {
  return !includesAny(haystack, needles);
}

function looksLikeRefusal(answer: string): boolean {
  return includesAny(answer, REFUSAL_MARKERS);
}

export function scoreCase(
  expect: EvalExpect,
  response: EvalResponse,
): CheckResult[] {
  const checks: CheckResult[] = [];
  const answer = response.answer || "";
  const citations = response.citations || [];
  const sources = citations.map((item) => item.source).join(" | ");

  if (response.error) {
    checks.push({ name: "response", ok: false, detail: response.error });
    return checks;
  }

  if (!answer.trim()) {
    checks.push({
      name: "answer-nonempty",
      ok: false,
      detail: "Empty answer",
    });
    return checks;
  }

  if (expect.answerIncludesAny?.length) {
    const ok = includesAny(answer, expect.answerIncludesAny);
    checks.push({
      name: "answer-includes",
      ok,
      detail: ok
        ? `matched one of: ${expect.answerIncludesAny.join(" | ")}`
        : `missing all of: ${expect.answerIncludesAny.join(" | ")}`,
    });
  }

  if (expect.answerMustNotInclude?.length) {
    const ok = includesNone(answer, expect.answerMustNotInclude);
    checks.push({
      name: "answer-excludes",
      ok,
      detail: ok
        ? "no forbidden substrings"
        : `hit forbidden: ${expect.answerMustNotInclude.filter((needle) => includesAny(answer, [needle])).join(", ")}`,
    });
  }

  if (typeof expect.minCitations === "number") {
    const ok = citations.length >= expect.minCitations;
    checks.push({
      name: "min-citations",
      ok,
      detail: `${citations.length} citation(s); need ≥ ${expect.minCitations}`,
    });
  }

  if (expect.citationSourcesAny?.length) {
    const ok = expect.citationSourcesAny.some((want) =>
      citations.some((item) =>
        item.source.toLowerCase().includes(want.toLowerCase()),
      ),
    );
    checks.push({
      name: "citation-source",
      ok,
      detail: ok
        ? `sources: ${sources || "(none)"}`
        : `wanted one of [${expect.citationSourcesAny.join(", ")}]; got [${sources || "none"}]`,
    });
  }

  if (expect.mustRefuse) {
    const ok = looksLikeRefusal(answer);
    checks.push({
      name: "refusal",
      ok,
      detail: ok
        ? "answer looks like a handbook refusal"
        : "expected refusal / not-in-handbook language",
    });
  }

  if (checks.length === 0) {
    checks.push({
      name: "noop",
      ok: true,
      detail: "no expectations configured",
    });
  }

  return checks;
}

export function casePassed(checks: CheckResult[]): boolean {
  return checks.length > 0 && checks.every((check) => check.ok);
}
