export const CAPTURED = "4 Nov 2026";

/** The public CiteBot app is moving to a new model provider. Keep this false until that deployment answers again. */
export const showCiteBotLive = false;

export const BACKGROUND =
  "I came into software through a coding bootcamp, plus a distance-learning computer science degree, expected early 2027.";

export const OPENING_BEFORE = "I build tools that ";
export const OPENING_WORD = "check";
export const OPENING_AFTER = " what AI writes.";
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
  frame: { width: number; height: number };
  caption: string;
  stillFrom: string;
  alt: string;
};

export function visibleLive(look: Look): string | null {
  if (look.id === "citebot" && !showCiteBotLive) return null;
  return look.live;
}

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
    frame: { width: 900, height: 750 },
    caption: `Recording · development build, no AI model · ${CAPTURED}`,
    stillFrom: `the development build without an AI model, ${CAPTURED}`,
    alt: "Still from the CiteBot development build without an AI model, 4 Nov 2026. A stand-in quotes the passage; the check marks it supported and flags a dropped unless. The passage is pto-and-leave.md.",
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
    frame: { width: 900, height: 1350 },
    caption: `Recording · ${CAPTURED}`,
    stillFrom: CAPTURED,
    alt: "Still from the Retrieval Autopsy recording, 4 Nov 2026. Qualifier fails because the answer drops a condition.",
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
    frame: { width: 900, height: 1350 },
    caption: `Recording · ${CAPTURED}`,
    stillFrom: CAPTURED,
    alt: "Still from the Style Distance recording, 4 Nov 2026. The brand-voice demo reads off-voice.",
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
