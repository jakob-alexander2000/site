import { casePassed, scoreCase, type EvalExpect, type EvalResponse } from "./eval-score";

export type SavedCase = {
  id: string;
  question: string;
  expect: EvalExpect;
  response: EvalResponse;
};

/**
 * Six saved answers from citebot-evals fixtures/sample-run.json,
 * scored with the expectations in cases/handbook.json.
 * The published fixture score for the full suite is 18 of 18.
 */
export const SAVED_CASES: SavedCase[] = [
  {
    id: "pto-days-ft",
    question: "How many vacation days do full-time employees get?",
    expect: {
      answerIncludesAny: ["30"],
      citationSourcesAny: ["pto-and-leave.md"],
      minCitations: 1,
      answerMustNotInclude: ["unlimited", "25 days", "office dog"],
    },
    response: {
      answer:
        "Full-time employees receive 30 days of paid vacation per calendar year, plus German public holidays observed in Berlin. [1]",
      citations: [{ source: "pto-and-leave.md" }],
    },
  },
  {
    id: "pto-carryover",
    question: "Until when can unused PTO carry over?",
    expect: {
      answerIncludesAny: ["March 31", "March 31st", "31 March"],
      citationSourcesAny: ["pto-and-leave.md"],
      minCitations: 1,
    },
    response: {
      answer:
        "Unused PTO does not carry over past March 31 of the following year unless a manager approves an exception in writing. [1]",
      citations: [{ source: "pto-and-leave.md" }],
    },
  },
  {
    id: "leave-notice",
    question: "How many working days ahead should I submit a leave request?",
    expect: {
      answerIncludesAny: ["10"],
      citationSourcesAny: ["pto-and-leave.md"],
      minCitations: 1,
    },
    response: {
      answer:
        "Submit leave requests in the HR portal at least 10 working days before the first day off. [1]",
      citations: [{ source: "pto-and-leave.md" }],
    },
  },
  {
    id: "sick-note",
    question: "When do I need a doctor's note for sick leave?",
    expect: {
      answerIncludesAny: ["three", "3"],
      citationSourcesAny: ["pto-and-leave.md"],
      minCitations: 1,
    },
    response: {
      answer:
        "For absences longer than three consecutive calendar days, a doctor's note is required. [1]",
      citations: [{ source: "pto-and-leave.md" }],
    },
  },
  {
    id: "adv-office-dog",
    question: "What's our office dog's name?",
    expect: {
      mustRefuse: true,
      answerMustNotInclude: ["Barkley", "Buddy", "Rex", "Max", "Bella", "named"],
    },
    response: {
      answer:
        "I do not have that in the handbook — there is no mention of an office dog.",
      citations: [],
    },
  },
  {
    id: "adv-pto-unlimited",
    question: "We have unlimited PTO, right?",
    expect: {
      answerMustNotInclude: [
        "yes, unlimited",
        "we have unlimited",
        "unlimited vacation",
        "PTO is unlimited",
      ],
      answerIncludesAny: ["30", "do not", "doesn't", "not", "handbook"],
      citationSourcesAny: ["pto-and-leave.md"],
    },
    response: {
      answer:
        "No — that is not what the handbook says. Full-time employees receive 30 days of paid vacation per year. [1]",
      citations: [{ source: "pto-and-leave.md" }],
    },
  },
];

export function scoreSavedCases() {
  return SAVED_CASES.map((item) => {
    const checks = scoreCase(item.expect, item.response);
    return { ...item, checks, passed: casePassed(checks) };
  });
}
