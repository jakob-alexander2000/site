export type Step = { k: string; text: string };

export type Mechanism = {
  id: "citebot" | "autopsy" | "voice";
  repo: string;
  revision: string;
  plate: string;
  input: string;
  steps: readonly Step[];
  outputs: readonly Step[];
  limits: readonly string[];
  excerpts: readonly { file: string; excerpt: string }[];
};

export const MECHANISMS: readonly Mechanism[] = [
  {
    id: "citebot",
    repo: "citebot",
    revision: "bbcab1199615b2fd00950edd476f17d3e4562d43",
    plate: "lib/eval-local.ts",
    input: "A question.",
    steps: [
      { k: "Search", text: "Search the sample handbook for passages." },
      {
        k: "Draft",
        text: "The stand-in copies overlapping sentences, or it says: The documents do not cover this.",
      },
      {
        k: "Check",
        text: "Each sentence is scored by overlap with the retrieved passage.",
      },
    ],
    outputs: [
      { k: "Pass", text: "The sentence overlaps a retrieved passage." },
      { k: "Pass", text: "A refusal when no passage was retrieved. No passage was retrieved." },
      {
        k: "Unsupported",
        text: "The retrieved passages do not state this. No answer text to verify. The answer refuses even though a passage was retrieved.",
      },
    ],
    limits: [
      "This plate does not call a model. A provider check can mark fail when the claim contradicts the context. This plate does not run that check.",
    ],
    excerpts: [
      { file: "lib/eval-local.ts", excerpt: "The documents do not cover this." },
      { file: "lib/eval-local.ts", excerpt: "The retrieved passages do not state this." },
      { file: "lib/eval-local.ts", excerpt: "No passage was retrieved." },
      { file: "lib/eval-local.ts", excerpt: "The answer refuses even though a passage was retrieved." },
      { file: "lib/eval-local.ts", excerpt: "No answer text to verify." },
      {
        file: "lib/eval-local.ts",
        excerpt: "Same verdict tokens as verify, scored by overlap with the retrieved passages.",
      },
      { file: "lib/verify.ts", excerpt: "the claim contradicts the context" },
    ],
  },
  {
    id: "autopsy",
    repo: "retrieval-autopsy",
    revision: "9470b71ddda1691233c26b0c72b2354e032a70a5",
    plate: "src/answer/draft.ts",
    input: "A question and a handbook. Keyword search returns passages.",
    steps: [
      { k: "Keeps the wording", text: "Sentences taken from the top passage." },
      {
        k: "Drops conditions",
        text: "Conditions were stripped on purpose. full-time employees only becomes employees.",
      },
    ],
    outputs: [
      { k: "Support", text: "There is no answer to check. A sentence is not in the retrieved passages." },
      { k: "Scope", text: "The answer widens who this is for." },
      { k: "Qualifier", text: "The answer drops a limit that was in the passage." },
      { k: "Omission", text: "No condition that would change the result was dropped. A dropped one fails." },
    ],
    limits: [
      "The checks match spans in the text. They do not judge meaning. It is synthetic. It is not a real policy. The linked page has no /api/answer route, so it uses the passage wording.",
    ],
    excerpts: [
      { file: "src/answer/draft.ts", excerpt: "full-time employees only" },
      { file: "src/App.tsx", excerpt: "Conditions were stripped on purpose." },
      { file: "src/App.tsx", excerpt: "Sentences taken from the top passage." },
      { file: "src/App.tsx", excerpt: "Keeps the wording" },
      { file: "src/App.tsx", excerpt: "Drops conditions" },
      { file: "src/score/score.ts", excerpt: "There is no answer to check." },
      { file: "src/score/score.ts", excerpt: "A sentence is not in the retrieved passages." },
      { file: "src/score/score.ts", excerpt: "The answer widens who this is for." },
      { file: "src/score/score.ts", excerpt: "No condition that would change the result was dropped." },
      { file: "README.md", excerpt: "It is synthetic. It is not a real policy." },
      { file: "README.md", excerpt: "has no /api/answer route" },
    ],
  },
  {
    id: "voice",
    repo: "style-distance",
    revision: "3898d225ca0d6b4aefe99d978bb17d5bb3fd55c4",
    plate: "src/lib/delta.ts",
    input: "At least two texts in the house voice, and a draft.",
    steps: [
      { k: "Tokenise", text: "Split the texts into words." },
      { k: "Frequent words", text: "A word from only one reference text is left out." },
      { k: "z-score", text: "Compare each rate with the reference mean and its sample spread." },
      { k: "Distance", text: "The distance is the mean of the absolute z differences." },
    ],
    outputs: [
      { k: "close", text: "Close means at or under the median same-author distance." },
      { k: "drifting", text: "Drifting is the open interval between the medians." },
      { k: "off-voice", text: "Off-voice means at or over the median cross-author distance." },
    ],
    limits: [
      "Delta needs at least two reference texts. A draft has no words after tokenising. Not enough words with a spread to measure a distance. The distance uses frequent-word rates. It does not check whether the draft is true. The synthetic demo has to land on the calibrated readings. Its drifted draft reads off-voice.",
    ],
    excerpts: [
      { file: "src/lib/delta.ts", excerpt: "Delta needs at least two reference texts." },
      { file: "src/lib/delta.ts", excerpt: "A draft has no words after tokenising." },
      { file: "src/lib/delta.ts", excerpt: "Not enough words with a spread to measure a distance." },
      { file: "src/lib/delta.ts", excerpt: "reference text left out" },
      { file: "data/thresholds.json", excerpt: "Drifting is the open interval between the medians." },
      { file: "data/thresholds.json", excerpt: "Off-voice means at or over the median cross-author distance." },
      { file: "data/thresholds.json", excerpt: "Close means at or under the median same-author distance." },
      {
        file: "reference/tests/test_brand.py",
        excerpt: "The synthetic demo has to land on the calibrated readings.",
      },
    ],
  },
];

export function mechanismFor(id: Mechanism["id"]): Mechanism {
  const found = MECHANISMS.find((item) => item.id === id);
  if (!found) throw new Error(`Missing mechanism ${id}`);
  return found;
}

export function sourceUrl(repo: string, revision: string, file: string): string {
  return `https://raw.githubusercontent.com/jakob-alexander2000/${repo}/${revision}/${file}`;
}
