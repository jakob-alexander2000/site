export type Verdict = "pass" | "fail" | "unsupported";

export type FlagshipSentence = {
  id: string;
  text: string;
  verdict: Verdict;
  /** Verbatim span in the passage. Empty when nothing was retrieved for this sentence. */
  span: string;
  evidence: string;
};

/** One flagship. Replacing the product means replacing the object in lib/flagship.ts. */
export type Flagship = {
  id: string;
  title: string;
  passage: string;
  sentences: readonly FlagshipSentence[];
};

export type ShelfEntry = {
  id: string;
  claim: string;
  artifact: { href: string; label: string };
  limit: string;
};
