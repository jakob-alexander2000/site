export const HERO_BEFORE = "I build AI answers you can ";
export const HERO_WORD = "check";
export const HERO_AFTER = ", sentence by sentence.";
export const HERO_LINE = `${HERO_BEFORE}${HERO_WORD}${HERO_AFTER}`;

export const HERO_SUPPORT =
  "Each answer is built in layers, from the company's own documents up to a verdict on every sentence.";
export const HERO_SCROLL = "Scroll pulls the layers apart.";

export const RUN_LINK = "See CiteBot run";
export const BUILT_LINK = "How it is built";
export const PATTERN_LABEL = "PATTERN 01 · CITEBOT · EXPLODED VIEW";

export const LAYERS = [
  { id: "handbook", letter: "A", name: "HANDBOOK", note: "Source document" },
  { id: "passages", letter: "B", name: "PASSAGES", note: "Retrieved for this question" },
  { id: "sentences", letter: "C", name: "SENTENCES", note: "Recorded claims" },
  { id: "verdict", letter: "D", name: "VERDICT", note: "A result per sentence" },
] as const;

export type LayerId = (typeof LAYERS)[number]["id"];
