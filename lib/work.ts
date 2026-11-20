export const REVISION = "20 Nov 2026";

export type ProjectId = "persona" | "citebot" | "autopsy" | "style";

export type Visual =
  | { kind: "image"; src: string; width: number; height: number; alt: string; caption: string }
  | { kind: "drawing"; id: string; label: string; caption: string };

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
    mark: "Flagship · in progress · formerly Dockbot",
    lead: "A model-agnostic agent app. Every task ends in a receipt: each model it tried, each check it passed, the cost and the time.",
    detail:
      "A cheaper model only takes over a job after it passes the same checks as a strong one. Hard budget caps stop a task before it overspends.",
    links: [],
    visual: {
      kind: "drawing",
      id: "persona-receipt",
      label:
        "Drawing of one task receipt. Attempt one on the cheap tier passes not-empty and fails required-headings; attempt two on the strong tier passes both; the receipt closes as passed with cost and time.",
      caption: "One receipt, drawn from the receipt schema: two attempts, the checks, the close.",
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
      kind: "image",
      src: "/work/citebot-verify.webp",
      width: 900,
      height: 675,
      alt: "CiteBot verify step on a two-part answer: thirty days of paid vacation passes against the handbook; carrying unused days past June fails, because the page says March 31.",
      caption: "The verify step on the live harness: one claim passes, one fails.",
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
      kind: "image",
      src: "/work/autopsy-qualifier.webp",
      width: 900,
      height: 675,
      alt: "Retrieval Autopsy result: Scope passes, Qualifier fails because the answer drops two conditions from the handbook passage.",
      caption: "Qualifier fails: the answer dropped two conditions.",
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
      kind: "image",
      src: "/work/style-distance.webp",
      width: 900,
      height: 675,
      alt: "Style Distance result: a distance of 1.33 marked off-voice, next to a held-out reference chunk that reads close.",
      caption: "A draft reads off-voice; the held-out chunk reads close.",
    },
  },
];

export type Skill = { name: string; shows: string; project: ProjectId };

/** Each skill names the project that shows it. A skill without a public project is not listed. */
export const SKILLS: readonly Skill[] = [
  { name: "Agent design", shows: "A receipt per task, budget caps, and routing between a cheap and a strong model.", project: "persona" },
  { name: "Evals in CI", shows: "Handbook questions run on every build, and a failed one stops it.", project: "citebot" },
  { name: "Claim verification", shows: "Each sentence is checked against the passage it came from.", project: "autopsy" },
  { name: "Retrieval", shows: "Keyword and meaning search compared on the same pages.", project: "autopsy" },
  { name: "Text measurement", shows: "Burrows’ Delta against a house voice, with a held-out check.", project: "style" },
  { name: "TypeScript and Playwright", shows: "End-to-end tests in Chromium and WebKit at phone and desktop sizes.", project: "persona" },
];

export function projectName(id: ProjectId): string {
  return PROJECTS.find((project) => project.id === id)?.name ?? id;
}
