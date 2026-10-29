import { CLAIMS, GITHUB_PROFILE } from "./copy";
import { scoreSavedFixture } from "./eval-run";

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: "citebot" | "citebot-evals" | "desk" | "desk-index";
  model: string;
  mark: string;
  name: string;
  proof: string;
  idea: string;
  caption: string;
  problem: string;
  made: string;
  stack: string;
  links: readonly ProjectLink[];
};

const citebotPass = CLAIMS.filter((claim) => claim.verdict === "Pass").length;
const citebotFail = CLAIMS.filter((claim) => claim.verdict === "Fail").length;
const evalMarks = scoreSavedFixture();
const evalPassed = evalMarks.filter(Boolean).length;

export const CITEBOT = {
  id: "citebot",
  model: "JA-01",
  mark: "Recorded run",
  name: "CiteBot",
  proof: `${citebotPass} pass, ${citebotFail} fail`,
  idea: "It checks each sentence of an answer against the handbook page that sentence came from.",
  caption: "Try it. Each sentence lights up as pass or fail.",
  problem:
    "A person reading an answer cannot tell which sentences the handbook actually supports. The cost is acting on a rule the page does not state.",
  made: "Cursor Agent co-authored 8 of 24 commits, from 27 Oct 2026 to 28 Oct 2026. The first commit is 26 Oct 2026 and the last is 28 Oct 2026. Those co-authored commits include the tool-using loop, the model fallback, and the fixed-question harness.",
  stack: "Next.js · TypeScript",
  links: [
    { label: "Live", href: "https://citebot-chi.vercel.app/ask" },
    { label: "How the check works", href: "https://citebot-chi.vercel.app/harness" },
    { label: "Source", href: "https://github.com/jakob-alexander2000/citebot" },
  ],
} as const satisfies Project;

export const EVALS = {
  id: "citebot-evals",
  model: "JA-02",
  mark: "Recorded run",
  name: "citebot-evals",
  proof: `${evalPassed}/${evalMarks.length}`,
  idea: "It scores eighteen fixed handbook questions offline, without calling an AI.",
  caption: `Try it. ${evalMarks.length} saved answers score ${evalPassed} of ${evalMarks.length}.`,
  problem:
    "One checked answer does not show that the same check holds across a fixed set of questions. The cost is a missed failure that the next answer repeats.",
  made: "3 commits, from 26 Oct 2026 to 27 Oct 2026. Cursor Agent co-authored the 27 Oct 2026 commit that rewrote the public scorecard notes.",
  stack: "TypeScript · Node",
  links: [{ label: "Source", href: "https://github.com/jakob-alexander2000/citebot-evals" }],
} as const satisfies Project;

export const DESK = {
  id: "desk",
  model: "JA-03",
  mark: "Live demo",
  name: "Desk",
  proof: "Cited note",
  idea: "It finds the note that matches a question and names the file.",
  caption: "Try it. Type a word. The matching notes appear with their scores.",
  problem:
    "A person with notes on their own computer needs the file an answer came from. Without that file name, the cost is a sentence they cannot check.",
  made: "2 commits, from 26 Oct 2026 to 27 Oct 2026. Cursor Agent co-authored the 27 Oct 2026 commit that rewrote the public notes. The feature map keeps keyword search and drops a packaged app.",
  stack: "TypeScript · Node",
  links: [{ label: "Source", href: "https://github.com/jakob-alexander2000/desk" }],
} as const satisfies Project;

export const INDEX = {
  id: "desk-index",
  model: "JA-04",
  mark: "Live demo",
  name: "desk-index",
  proof: "Ranked notes",
  idea: "It ranks notes in a folder, with no AI and no database.",
  caption: "Try it. Type a word. Matching notes stack in rank order.",
  problem:
    "A person who only wants the matching notes does not need a written answer. The cost is opening notes that do not contain the word.",
  made: "1 commit, on 26 Oct 2026. No commit lists an AI co-author.",
  stack: "Go",
  links: [{ label: "Source", href: "https://github.com/jakob-alexander2000/desk-index" }],
} as const satisfies Project;

/** Catalogue order. The home page renders this list and nothing else. */
export const PROJECTS = [CITEBOT, EVALS, DESK, INDEX] as const;

export type ProjectId = (typeof PROJECTS)[number]["id"];

export const PROFILE = GITHUB_PROFILE;
