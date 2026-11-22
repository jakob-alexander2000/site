/** Selected work, flagship first. Only facts that are already public or shown in the repo. */
export type Project = {
  id: "persona" | "checks" | "benchmark";
  index: string;
  name: string;
  kind: string;
  year: string;
  status: string;
};

export const PROJECTS: readonly Project[] = [
  { id: "persona", index: "01", name: "Persona", kind: "Agent app", year: "2026", status: "Measuring" },
  { id: "checks", index: "02", name: "Answer checks", kind: "Three tools", year: "2026", status: "Live" },
  { id: "benchmark", index: "03", name: "German document QA", kind: "Research", year: "2026", status: "Next" },
];

export type AnswerCheck = { name: string; line: string; href: string };

/** The three small tools, each with a public link. */
export const ANSWER_CHECKS: readonly AnswerCheck[] = [
  {
    name: "CiteBot",
    line: "Checks every claim against the handbook passage it cites.",
    href: "https://github.com/jakob-alexander2000/citebot",
  },
  {
    name: "Retrieval Autopsy",
    line: "Shows where an answer drops a condition, sentence by sentence.",
    href: "https://retrieval-autopsy.vercel.app/",
  },
  {
    name: "Style Distance",
    line: "Measures how far a draft has drifted from a house voice, as one number.",
    href: "https://style-distance.vercel.app/",
  },
];
