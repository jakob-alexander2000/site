export const CAPTURED = "4 Nov 2026";

export const OPENING_BEFORE = "I build AI tools whose answers you can ";
export const OPENING_WORD = "check";
export const OPENING_AFTER = ", sentence by sentence.";
export const OPENING = `${OPENING_BEFORE}${OPENING_WORD}${OPENING_AFTER}`;

export type Proof = {
  repo: string;
  file: string;
  line: number;
  excerpt: string;
};

export type Look = {
  id: "citebot" | "autopsy" | "voice";
  index: "01" | "02" | "03";
  name: string;
  mark: string;
  paragraphs: readonly string[];
  /** A word already in a paragraph. Underlined, not set in italic. */
  pen?: string;
  live: string;
  source: string;
  proofs: readonly Proof[];
  clip: string;
  poster: string;
  alt: string;
};

export const LOOKS: readonly Look[] = [
  {
    id: "citebot",
    index: "01",
    name: "CiteBot",
    mark: "In progress",
    paragraphs: [
      "CiteBot answers a question from one sample employee handbook and shows the passage that answer came from.",
      "Each claim is checked against those passages and marked pass, fail, or unsupported.",
    ],
    live: "https://citebot-chi.vercel.app/ask",
    source: "https://github.com/jakob-alexander2000/citebot",
    proofs: [
      {
        repo: "citebot",
        file: "README.md",
        line: 3,
        excerpt:
          "CiteBot answers a question from one sample employee handbook and shows the passage that answer came from.",
      },
      {
        repo: "citebot",
        file: "README.md",
        line: 7,
        excerpt:
          "Each claim is checked against those passages and marked pass, fail, or unsupported.",
      },
    ],
    clip: "/recordings/citebot.mp4",
    poster: "/recordings/citebot.jpg",
    alt: "Still from the CiteBot recording, 4 Nov 2026. The ask screen shows a handbook question, and the page reads the handbook.",
  },
  {
    id: "autopsy",
    index: "02",
    name: "Retrieval Autopsy",
    mark: "Free answer checker",
    paragraphs: [
      "No account and no key. It shows where an answer drops a condition, sentence by sentence.",
    ],
    pen: "condition",
    live: "https://retrieval-autopsy.vercel.app/",
    source: "https://github.com/jakob-alexander2000/retrieval-autopsy",
    proofs: [
      {
        repo: "retrieval-autopsy",
        file: "README.md",
        line: 11,
        excerpt: "No account and no key.",
      },
      {
        repo: "retrieval-autopsy",
        file: "README.md",
        line: 3,
        excerpt: "drops a condition",
      },
      {
        repo: "retrieval-autopsy",
        file: "README.md",
        line: 5,
        excerpt: "sentence by sentence",
      },
    ],
    clip: "/recordings/autopsy.mp4",
    poster: "/recordings/autopsy.jpg",
    alt: "Still from the Retrieval Autopsy recording, 4 Nov 2026. The scorecard shows a dropped condition, and Qualifier fails.",
  },
  {
    id: "voice",
    index: "03",
    name: "Voice check",
    mark: "Style Distance",
    paragraphs: [
      "Style Distance measures how far an AI draft has drifted from a house voice.",
    ],
    live: "https://style-distance.vercel.app/",
    source: "https://github.com/jakob-alexander2000/style-distance",
    proofs: [
      {
        repo: "style-distance",
        file: "README.md",
        line: 1,
        excerpt: "Style Distance",
      },
      {
        repo: "style-distance",
        file: "README.md",
        line: 3,
        excerpt: "how far an AI draft has drifted from a house voice",
      },
    ],
    clip: "/recordings/style.mp4",
    poster: "/recordings/style.jpg",
    alt: "Still from the Style Distance recording, 4 Nov 2026. The brand-voice demo is on screen.",
  },
];

export function proofHref(proof: Proof): string {
  return `https://github.com/jakob-alexander2000/${proof.repo}/blob/main/${proof.file}#L${proof.line}`;
}

export function rawProofUrl(proof: Proof): string {
  return `https://raw.githubusercontent.com/jakob-alexander2000/${proof.repo}/main/${proof.file}`;
}

export function lookCopy(look: Look): string {
  return [look.mark, ...look.paragraphs].join(" ");
}
