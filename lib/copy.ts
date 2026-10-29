export const GITHUB = "https://github.com/jakob-alexander2000";

export const HERO_LEDE =
  "Berlin. Comparative literature, software he taught himself, and tools that show their sources and check each claim.";

export const CITEBOT = {
  idea: "CiteBot answers a handbook question, then checks each claim against the page it came from.",
  problem:
    "An answer can sound sure and still be wrong. Anyone reading an answer taken from a handbook has that problem.",
  made: "26 Oct 2026 – 28 Oct 2026 · 24 commits. AI built the commits that list Cursor Agent as co-author from 27 Oct: the tool-using loop, the overload fallback, the event log, the onboard path, and the golden-question harness. Jakob decided: TODO(Jakob): your decisions are not written in the repo.",
  todo: "TODO(Jakob): your decisions are not written in the repo.",
  links: [
    { label: "Live demo", href: "https://citebot-chi.vercel.app/ask" },
    {
      label: "How the check works",
      href: "https://citebot-chi.vercel.app/harness",
    },
    { label: "Source", href: "https://github.com/jakob-alexander2000/citebot" },
  ],
} as const;

export const PROJECTS = {
  evals: {
    name: "citebot-evals",
    kind: "Live demo",
    idea: "Eighteen fixed handbook questions score CiteBot offline, without calling a model.",
    problem:
      "A check you cannot run again is only a story. Anyone who needs the same questions to come out the same way has that problem.",
    note: "The published fixture score is 18 of 18. These six saved answers are re-scored here with the same checker.",
    made: "26 Oct 2026 – 27 Oct 2026 · 3 commits. AI built the 27 Oct documentation commit, which lists Cursor Agent as co-author. Jakob decided: TODO(Jakob): your decisions are not written in the repo.",
    todo: "TODO(Jakob): your decisions are not written in the repo.",
    links: [
      {
        label: "Scorecard",
        href: "https://github.com/jakob-alexander2000/citebot-evals#scorecard-fixture",
      },
      {
        label: "Source",
        href: "https://github.com/jakob-alexander2000/citebot-evals",
      },
    ],
  },
  desk: {
    name: "Desk",
    kind: "Live demo",
    idea: "Ask a folder of notes on your own computer, and the answer cites the files.",
    problem:
      "Notes that stay on one machine never reach a website checker. Someone with a folder of Markdown notes has that problem.",
    note: "This searches two notes from Desk’s sample folder with Desk’s own keyword rules. The local app writes the answer with a model. That step is not run here, and no answer is invented.",
    made: "26 Oct 2026 – 27 Oct 2026 · 2 commits. AI built the 27 Oct documentation commit, which lists Cursor Agent as co-author. Jakob decided: TODO(Jakob): your decisions are not written in the repo.",
    todo: "TODO(Jakob): your decisions are not written in the repo.",
    links: [
      {
        label: "Run in 60 seconds",
        href: "https://github.com/jakob-alexander2000/desk#60-second-run",
      },
      { label: "Source", href: "https://github.com/jakob-alexander2000/desk" },
    ],
  },
  index: {
    name: "desk-index",
    kind: "Live demo",
    idea: "Rank the notes in a folder, with no model and no database.",
    problem:
      "A written answer is extra when you only need the matching note. Someone looking through a folder of Markdown notes has that problem.",
    note: "This ranks two notes from the desk-index sample folder. The score is how often a word appears, times the number of notes, divided by how many notes contain that word.",
    made: "26 Oct 2026 · 1 commit by Jakob Alex. AI built nothing listed here: no co-author on the commit. Jakob decided: TODO(Jakob): your decisions are not written in the repo.",
    todo: "TODO(Jakob): your decisions are not written in the repo.",
    links: [
      {
        label: "Demo",
        href: "https://github.com/jakob-alexander2000/desk-index#demo",
      },
      {
        label: "Source",
        href: "https://github.com/jakob-alexander2000/desk-index",
      },
    ],
  },
} as const;

export const READING =
  "He studied comparative literature and taught himself software. He reads a claim the way he was trained to read a page: closely, and against the source. A fresh eye is for what a long habit stops seeing.";

export const COLOPHON = "Set in Geist. Made in Berlin, with a guitar within reach.";
