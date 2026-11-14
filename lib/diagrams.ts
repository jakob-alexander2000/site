export const PIPELINE = ["Question", "Retrieve", "Draft", "Split", "Check", "Verdict"] as const;

export const CITEBOT_PLATE = {
  headline: "Answers that point to the line they came from.",
  body: "CiteBot answers from a company handbook. It splits the draft into sentences and checks each one against the retrieved passage before you see it.",
  limits:
    "The golden run uses a stand-in model, so it catches code changes. The span check matches words. It does not judge meaning.",
  refusal: "Nothing retrieved ends in a refusal.",
  contradiction: "A contradicted sentence ends in FAIL beside its passage.",
  source: "https://github.com/jakob-alexander2000/citebot",
  harness: "https://citebot-chi.vercel.app/harness",
} as const;

export const DROPPED = {
  headline: "Shows where an answer drops a condition.",
  body: "Paste a passage and the answer an assistant gave. It lines them up word by word and names what fell out. No account, no key.",
  passage: "In practice, full-time employees only receive 30 days of paid annual leave after the probation period.",
  answer: "In practice, employees receive 30 days of paid annual leave.",
  limits: "The checks match spans and do not judge meaning. The sample is not a policy.",
  flow: ["Paste passage and answer", "Align word by word", "Mark what fell out", "Score four checks"],
  /** Verdicts and details are the scorer's own output for the public sample `leave-naive` at this commit. */
  scorer: "https://raw.githubusercontent.com/jakob-alexander2000/retrieval-autopsy/584ac36beb3b337d46eb881ccaffd9c3ed10983e/src/score/score.ts",
  sample: "https://raw.githubusercontent.com/jakob-alexander2000/retrieval-autopsy/584ac36beb3b337d46eb881ccaffd9c3ed10983e/fixtures/answers.jsonl",
  checks: [
    { name: "Support", verdict: "pass", detail: "Every sentence is made of words from a retrieved passage." },
    { name: "Scope", verdict: "pass", detail: "The answer stays inside who the handbook is for." },
    { name: "Qualifier", verdict: "fail", detail: "The answer drops “full-time employees only” and “after the probation period”." },
    { name: "Omission", verdict: "pass", detail: "No condition that would change the result was dropped." },
  ],
  demo: "https://retrieval-autopsy.vercel.app/",
  source: "https://github.com/jakob-alexander2000/retrieval-autopsy",
} as const;

export const STYLE_DISTANCE = {
  headline: "Measures how far an AI draft has drifted from a house voice.",
  body: "Burrows' Delta is the mean absolute z-score over the most frequent words, with the house voice at zero. It runs in the browser. No account, no key, and no model. English and German.",
  label: "Synthetic demo",
  drifted: "1.33",
  driftedReading: "off-voice",
  heldOut: "0.64",
  heldOutReading: "close",
  live: "https://style-distance.vercel.app/",
  source: "https://github.com/jakob-alexander2000/style-distance",
  readme: "https://raw.githubusercontent.com/jakob-alexander2000/style-distance/main/README.md",
} as const;

export const REVISION = "14 Nov 2026";
