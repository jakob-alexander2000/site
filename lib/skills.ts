export type Skill = {
  id: string;
  name: string;
  line: string;
  steps: readonly string[];
  proof: { href: string; label: string };
};

export const SKILLS: readonly Skill[] = [
  {
    id: "evaluation",
    name: "Evaluation",
    line: "I score example answers against the handbook, and the run does not call a model.",
    steps: ["Example answers", "Score", "No model"],
    proof: {
      href: "https://github.com/jakob-alexander2000/citebot-evals",
      label: "Question set",
    },
  },
  {
    id: "verification",
    name: "Verification",
    line: "I mark the condition a sample answer drops.",
    steps: ["Claim", "Passage", "Verdict"],
    proof: {
      href: "https://retrieval-autopsy.vercel.app/",
      label: "Checks",
    },
  },
  {
    id: "tool-use",
    name: "Tool use",
    line: "I stop the handbook agent after three tool calls, then the draft is checked.",
    steps: ["Plan", "At most three tools", "Draft", "Check"],
    proof: {
      href: "https://citebot-chi.vercel.app/harness",
      label: "Harness",
    },
  },
  {
    id: "typescript",
    name: "TypeScript",
    line: "I typecheck the handbook app in CI, and that same CI builds it.",
    steps: ["Typecheck", "Build"],
    proof: {
      href: "https://github.com/jakob-alexander2000/citebot/blob/main/.github/workflows/ci.yml",
      label: "CI",
    },
  },
  {
    id: "retrieval",
    name: "Retrieval",
    line: "I answer from one handbook and keep the passage next to the answer.",
    steps: ["Question", "Passage", "Cited answer"],
    proof: {
      href: "https://citebot-chi.vercel.app/ask",
      label: "Ask",
    },
  },
];
