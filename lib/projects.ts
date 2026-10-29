import { GITHUB_PROFILE } from "./copy";

export type ProjectLink = {
  label: string;
  href: string;
};

export const CITEBOT = {
  id: "citebot",
  model: "JA-01",
  mark: "Recorded run",
  name: "CiteBot",
  idea: "It checks each sentence of an answer against the handbook page that sentence came from.",
  caption: "Try it. Each sentence lights up as pass or fail.",
  problem:
    "A person reading an answer cannot tell which sentences the handbook actually supports.",
  made: "AI built the tool-using loop, the model fallback, and the fixed-question harness: Cursor Agent co-authored eight commits from 27 Oct 2026. Jakob: TODO(Jakob).",
  stack: "Next.js · TypeScript",
  links: [
    { label: "Ask a question", href: "https://citebot-chi.vercel.app/ask" },
    { label: "How the check works", href: "https://citebot-chi.vercel.app/harness" },
    { label: "Source", href: "https://github.com/jakob-alexander2000/citebot" },
  ] satisfies ProjectLink[],
};

export const EVALS = {
  id: "citebot-evals",
  model: "JA-02",
  mark: "Recorded run",
  name: "citebot-evals",
  idea: "It scores eighteen fixed handbook questions offline, without calling an AI.",
  problem:
    "One checked answer does not show that the same check holds across a fixed set of questions.",
  made: "AI co-authored the 27 Oct 2026 commit that rewrote the public scorecard notes. Jakob: TODO(Jakob).",
  stack: "TypeScript · Node",
  links: [
    {
      label: "Scorecard",
      href: "https://github.com/jakob-alexander2000/citebot-evals#scorecard-fixture",
    },
    { label: "Source", href: "https://github.com/jakob-alexander2000/citebot-evals" },
  ] satisfies ProjectLink[],
};

export const DESK = {
  id: "desk",
  model: "JA-03",
  mark: "Live demo",
  name: "Desk",
  idea: "It finds the note that matches a question and names the file.",
  caption: "Try it. The matching note appears, with its file name.",
  problem: "A person with notes on their own computer needs the file an answer came from.",
  made: "AI co-authored the 27 Oct 2026 commit that rewrote the public notes. The feature map keeps keyword search and drops a packaged app. Jakob: TODO(Jakob).",
  stack: "TypeScript · Node",
  links: [
    { label: "Run in 60 seconds", href: "https://github.com/jakob-alexander2000/desk#60-second-run" },
    { label: "Source", href: "https://github.com/jakob-alexander2000/desk" },
  ] satisfies ProjectLink[],
};

export const INDEX = {
  id: "desk-index",
  model: "JA-04",
  mark: "Live demo",
  name: "desk-index",
  idea: "It ranks notes in a folder, with no AI and no database.",
  caption: "Try it. Matching notes stack in rank order.",
  problem: "A person who only wants the matching notes does not need a written answer.",
  made: "No commit lists an AI co-author. One commit, 26 Oct 2026. Jakob: TODO(Jakob).",
  stack: "Go",
  links: [
    { label: "Demo", href: "https://github.com/jakob-alexander2000/desk-index#demo" },
    { label: "Source", href: "https://github.com/jakob-alexander2000/desk-index" },
  ] satisfies ProjectLink[],
};

export const PROFILE = GITHUB_PROFILE;
