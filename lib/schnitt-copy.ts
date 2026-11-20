export const HERO_BEFORE = "I’m Jakob Alex. I\u00a0build AI products you can ";
export const HERO_WORD = "check";
export const HERO_AFTER = ".";
export const HERO_LINE = `${HERO_BEFORE}${HERO_WORD}${HERO_AFTER}`;

export const HERO_SUPPORT =
  "Agents, retrieval and evals, each shipped with the tests that prove it works. The drawing is one recorded CiteBot answer, taken apart layer by layer.";
export const HERO_SCROLL = "Scroll pulls the layers apart.";

export const PARTS_LINK = "Selected work";

export const LAYERS = [
  { id: "handbook", letter: "A", name: "HANDBOOK", note: "Source document" },
  { id: "passages", letter: "B", name: "PASSAGES", note: "Retrieved for this question" },
  { id: "sentences", letter: "C", name: "SENTENCES", note: "Recorded claims" },
  { id: "verdict", letter: "D", name: "VERDICT", note: "A result per sentence" },
] as const;

export type LayerId = (typeof LAYERS)[number]["id"];
