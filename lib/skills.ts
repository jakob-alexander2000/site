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
    line: "I run the handbook questions through the agent loop, and a failed question stops the build.",
    steps: ["Questions", "Stand-in", "Check"],
    proof: {
      href: "https://citebot-chi.vercel.app/evals",
      label: "Evals",
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
    steps: ["Lint", "Tests", "Eval", "Build"],
    proof: {
      href: "https://github.com/jakob-alexander2000/citebot/actions/workflows/ci.yml",
      label: "Runs",
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
