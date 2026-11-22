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
