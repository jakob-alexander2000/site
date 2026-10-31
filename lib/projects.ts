import { AUTOPSY_CHECKS, CLAIMS, GITHUB_PROFILE, STYLE_RESULTS } from "./copy";
import { scoreSavedFixture } from "./eval-run";

export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  id: "citebot" | "citebot-evals" | "retrieval-autopsy" | "style-distance" | "desk" | "desk-index";
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
const autopsyPass = AUTOPSY_CHECKS.filter((check) => check.verdict === "Pass").length;
const autopsyFail = AUTOPSY_CHECKS.filter((check) => check.verdict === "Fail").length;

export const CITEBOT = {
  id: "citebot",
  model: "JA-01",
  mark: "Examples from CiteBot",
  name: "CiteBot",
  proof: `${citebotPass} pass, ${citebotFail} fail`,
  idea: "It checks each sentence of an answer against the handbook passages it looked up.",
  caption: "Try it. Each sentence lights up as pass or fail.",
  problem:
    "A person reading an answer cannot tell which sentences the handbook actually supports. The cost is acting on a rule the page does not state.",
  made: "Cursor Agent co-authored 8 of 24 commits, from 27 Oct 2026 to 28 Oct 2026. The first commit is 26 Oct 2026 and the last is 28 Oct 2026. Those co-authored commits include the step that calls tools, another AI when the first is busy, and fixed questions used as a check.",
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
  proof: `${evalPassed} of ${evalMarks.length} example answers`,
  idea: "It scores eighteen hand-written example answers on a fixed test set, without calling an AI.",
  caption: `Try it. ${evalMarks.length} example answers score ${evalPassed} of ${evalMarks.length}.`,
  problem:
    "Without fixed questions, a change to CiteBot can't be checked the same way twice.",
  made: "3 commits, from 26 Oct 2026 to 27 Oct 2026. Cursor Agent co-authored the 27 Oct 2026 commit that rewrote the public scorecard notes.",
  stack: "TypeScript · Node",
  links: [{ label: "Source", href: "https://github.com/jakob-alexander2000/citebot-evals" }],
} as const satisfies Project;

export const AUTOPSY = {
  id: "retrieval-autopsy",
  model: "JA-05",
  mark: "Sample example",
  name: "Retrieval Autopsy",
  proof: `${autopsyPass} pass, ${autopsyFail} fail`,
  idea: "It marks a limit the answer dropped, and it shows when keyword search and meaning search pick different passages.",
  caption: "Try it. The sample answer drops a limit, and that check fails.",
  problem:
    "A person reading the sample answer cannot see the limit the page kept. The cost is acting on a rule the passage narrowed.",
  made: "5 commits, from 29 Oct 2026 to 30 Oct 2026. Cursor Agent wrote 2 of 5 commits, both on 29 Oct 2026, and Jakob Alexander is named as co-author on those two.",
  stack: "React · TypeScript",
  links: [
    { label: "Live", href: "https://retrieval-autopsy.vercel.app" },
    { label: "Source", href: "https://github.com/jakob-alexander2000/retrieval-autopsy" },
  ],
} as const satisfies Project;

export const STYLE = {
  id: "style-distance",
  model: "JA-06",
  mark: "Sample",
  name: "Style Distance",
  proof: `${STYLE_RESULTS[0].distance} ${STYLE_RESULTS[0].reading}`,
  idea: "It scores how far a draft sits from a house voice. Burrows Delta stylometry does that by comparing how often the most common words appear.",
  caption: "Try it. The sample's rewritten drafts read off-voice. Pages held out of that voice read close.",
  problem:
    "A person can miss that a draft has left the house voice it is measured against. The cost is keeping a draft whose common words have already moved.",
  made: "7 commits, from 29 Oct 2026 to 30 Oct 2026. Cursor Agent wrote 4 of 7 commits, all on 29 Oct 2026, and Jakob Alexander is named as co-author on those four.",
  stack: "React · TypeScript",
  links: [
    { label: "Live", href: "https://style-distance.vercel.app" },
    { label: "Source", href: "https://github.com/jakob-alexander2000/style-distance" },
  ],
} as const satisfies Project;

export const DESK = {
  id: "desk",
  model: "JA-03",
  mark: "Live demo",
  name: "Desk",
  proof: "Cited note",
  idea: "When a note matches a question, it names that file.",
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
  idea: "A small Go search service for Markdown notes that searches notes without calling an AI.",
  caption: "Try it. Type a word. Matching notes stack in rank order.",
  problem:
    "A person who only wants the matching notes does not need a written answer. The cost is opening notes that do not contain the word.",
  made: "1 commit, on 26 Oct 2026. No commit lists an AI co-author.",
  stack: "Go",
  links: [{ label: "Source", href: "https://github.com/jakob-alexander2000/desk-index" }],
} as const satisfies Project;

/** Catalogue order. The home page renders this list and nothing else. */
export const PROJECTS = [CITEBOT, EVALS, AUTOPSY, STYLE, DESK, INDEX] as const;

export type ProjectId = (typeof PROJECTS)[number]["id"];

export const PROFILE = GITHUB_PROFILE;
