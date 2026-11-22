/** The studio operating system: four layers every project goes through. Persona is the worked example. */
export type LayerId = "research" | "design" | "code" | "checks";

export type Layer = {
  id: LayerId;
  index: string;
  name: string;
  who: string;
  when: string;
  line: string;
  /** Short label for the hero drawing. */
  caption: string;
};

export const LAYERS: readonly Layer[] = [
  {
    id: "research",
    index: "01",
    name: "Research",
    who: "Agent · radar",
    when: "Every Sunday",
    line: "A weekly radar finds what’s rising. The best gap turns into a brief before anything gets drawn.",
    caption: "the person with the problem",
  },
  {
    id: "design",
    index: "02",
    name: "Design",
    who: "Me · design system",
    when: "Per project",
    line: "A spec sheet says what the screen does, every state it can be in, and what it must never do.",
    caption: "screens that show the reasoning",
  },
  {
    id: "code",
    index: "03",
    name: "Code",
    who: "Agents · template repo",
    when: "Every commit",
    line: "Agents write the failing test first. I review every diff. Nothing merges unless the checks are green.",
    caption: "TypeScript, agents, retrieval",
  },
  {
    id: "checks",
    index: "04",
    name: "Checks",
    who: "Evals · release gates",
    when: "Every change",
    line: "Every run ends in a receipt. A failure isn’t hidden. It becomes next week’s research question.",
    caption: "every claim, before it ships",
  },
];

export type Row = { label: string; value: string; fault?: boolean };

export const PERSONA_BRIEF: readonly Row[] = [
  { label: "problem", value: "teams pay for the strongest model on every task, even the easy ones" },
  { label: "bet", value: "a cheaper model can take over once it passes the same checks" },
  { label: "guard", value: "hard budget caps stop a task before it overspends" },
];

export const PERSONA_SPEC: readonly Row[] = [
  { label: "job", value: "show what a task tried, passed and cost" },
  { label: "states", value: "running · fail · pass" },
  { label: "never", value: "switch models without a person approving", fault: true },
];

export const PERSONA_RECEIPT: readonly Row[] = [
  { label: "cheap model", value: "headings fail", fault: true },
  { label: "strong model", value: "pass" },
];

export const PERSONA_VERDICT = "passed";

export const NEXT_QUESTION = "Why do cheap models drop headings?";

/** The checks this site's own CI runs on every push, in order (see .github/workflows). */
export const SITE_CHECKS = ["build", "types", "lint", "unit", "copy scan", "end-to-end"] as const;

export const NOW = "Persona’s first real eval runs";
