export const REVISION = "20 Nov 2026";

export type ProjectId = "persona" | "citebot" | "autopsy" | "style";

export type Visual = { id: string; label: string };

export type Project = {
  id: ProjectId;
  index: string;
  name: string;
  mark: string;
  lead: string;
  detail: string;
  links: readonly { label: string; href: string }[];
  visual: Visual;
};

/** Selected work, flagship first. One picture each, none shared with the hero or each other. */
export const PROJECTS: readonly Project[] = [
  {
    id: "persona",
    index: "01",
    name: "Persona",
    mark: "Flagship, formerly Dockbot",
    lead: "Formerly Dockbot. A model-agnostic agent app. Every task ends in a receipt: each model it tried, each check it passed, the cost and the time.",
    detail:
      "A cheaper model only takes over a job after it passes the same checks as a strong one. Hard budget caps stop a task before it overspends.",
    links: [],
    visual: {
      id: "persona-receipt",
      label: "A receipt: the cheap model fails a headings check, the strong model passes both, and the task closes as passed.",
    },
  },
  {
    id: "citebot",
    index: "02",
    name: "CiteBot",
    mark: "Retrieval with a verify step",
    lead: "Answers from one sample employee handbook and checks every claim against the passage it cites: pass, fail, or unsupported.",
    detail: "A fixed set of handbook questions runs on every build. One failed question stops it.",
    links: [
      { label: "Evals", href: "https://citebot-chi.vercel.app/evals" },
      { label: "Source", href: "https://github.com/jakob-alexander2000/citebot" },
    ],
    visual: {
      id: "citebot-verify",
      label: "A source that says 30 days of leave, a claim that PTO is unlimited, and a failing verdict.",
    },
  },
  {
    id: "autopsy",
    index: "03",
    name: "Retrieval Autopsy",
    mark: "Free answer checker",
    lead: "Shows, sentence by sentence, where a document answer drops a condition, and where keyword and meaning search pick different passages.",
    detail: "No account and no key. Paste a few pages or use the sample handbook.",
    links: [
      { label: "Live", href: "https://retrieval-autopsy.vercel.app/" },
      { label: "Source", href: "https://github.com/jakob-alexander2000/retrieval-autopsy" },
    ],
    visual: {
      id: "autopsy-qualifier",
      label: "A passage that limits leave to full-time staff after probation, and an answer that dropped both conditions.",
    },
  },
  {
    id: "style",
    index: "04",
    name: "Style Distance",
    mark: "Voice check",
    lead: "Measures how far an AI draft has drifted from a house voice, as one number.",
    detail: "Burrows’ Delta over the most frequent words, with a held-out reference chunk as the yardstick.",
    links: [
      { label: "Live", href: "https://style-distance.vercel.app/" },
      { label: "Source", href: "https://github.com/jakob-alexander2000/style-distance" },
    ],
    visual: {
      id: "style-distance",
      label: "A house voice that reads close, and a draft 1.33 off-voice.",
    },
  },
];

export type Skill = {
  name: string;
  shows: string;
  /** The project on this page that shows it. */
  project: ProjectId;
  /** Public proof outside the page, when the project has none of its own. */
  proof?: { label: string; href: string };
};

/** Each skill names the project that shows it. A skill without a public project is not listed. */
export const SKILLS: readonly Skill[] = [
  { name: "Agent design", shows: "A receipt per task, budget caps, and routing between a cheap and a strong model.", project: "persona" },
  { name: "Evals in CI", shows: "Handbook questions run on every build, and a failed one stops it.", project: "citebot" },
  { name: "Claim verification", shows: "Each sentence is checked against the passage it came from.", project: "autopsy" },
  { name: "Retrieval", shows: "Keyword and meaning search compared on the same pages.", project: "autopsy" },
  { name: "Text measurement", shows: "Burrows’ Delta against a house voice, with a held-out check.", project: "style" },
  {
    name: "TypeScript and Playwright",
    shows: "This site: strict TypeScript, and end-to-end tests in Chromium and WebKit at phone and desktop sizes.",
    project: "persona",
    proof: { label: "This site’s tests", href: "https://github.com/jakob-alexander2000/site/tree/main/test" },
  },
];

export function projectName(id: ProjectId): string {
  return PROJECTS.find((project) => project.id === id)?.name ?? id;
}
