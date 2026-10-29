export const PAGE_TITLE =
  "Jakob Alex · Software that shows its work. CiteBot, citebot-evals, Desk, desk-index and Ledger API.";

export const GITHUB_PROFILE = "https://github.com/jakob-alexander2000";

export const HERO =
  "I build software that shows its work. Every answer cites its source, and every claim is checked against it.";

export const CITEBOT = {
  name: "CiteBot",
  summary:
    "Answers questions from one sample handbook. After the draft, a second step splits the answer into claims and checks each one against the passage it came from.",
  caption:
    "From a real run and the evaluation set. The third draft is wrong on purpose; the check catches it.",
  links: [
    {
      label: "Ask a question",
      href: "https://citebot-chi.vercel.app/ask",
    },
    {
      label: "How the check works",
      href: "https://citebot-chi.vercel.app/harness",
    },
    {
      label: "Source",
      href: "https://github.com/jakob-alexander2000/citebot",
    },
  ],
} as const;

export const CLAIMS = [
  {
    text: "Full-time employees receive 30 days of paid vacation per calendar year.",
    source: "pto-and-leave.md",
    verdict: "Pass",
  },
  {
    text: "Unused vacation carries over until March 31 of the following year.",
    source: "pto-and-leave.md",
    verdict: "Pass",
  },
  {
    text: "Full-time employees receive 25 days of paid vacation.",
    source: "Planted wrong draft. The page says 30.",
    verdict: "Fail",
  },
] as const;

export const ALSO_BUILT = [
  {
    name: "citebot-evals",
    summary:
      "Eighteen fixed handbook questions that score CiteBot offline in one command, without calling a model. Current score: 18 of 18.",
    stack: "TypeScript · Node",
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
  {
    name: "Desk",
    summary:
      "Ask questions of a folder of Markdown notes on your own disk. Answers cite the files, and a report can be written back to the folder.",
    stack: "TypeScript · Node · Gemini",
    links: [
      {
        label: "Run in 60 seconds",
        href: "https://github.com/jakob-alexander2000/desk#60-second-run",
      },
      {
        label: "Source",
        href: "https://github.com/jakob-alexander2000/desk",
      },
    ],
  },
  {
    name: "desk-index",
    summary:
      "A small search server for a folder of Markdown notes. Ranked results with snippets, standard library only, no database.",
    stack: "Go",
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
  {
    name: "Ledger API",
    summary:
      "A custody ledger for client cash. Append-only entries, settlement that is safe to retry, and amounts in whole cents.",
    stack: "Kotlin · Spring Boot · PostgreSQL",
    links: [
      {
        label: "Run locally",
        href: "https://github.com/jakob-alexander2000/ledger-api#run-locally",
      },
      {
        label: "Source",
        href: "https://github.com/jakob-alexander2000/ledger-api",
      },
    ],
  },
] as const;

export const ABOUT =
  "Based in Berlin. I studied comparative literature, and I still read software the same way: closely, and with sources.";
