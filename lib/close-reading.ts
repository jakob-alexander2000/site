export type Verdict = "pass" | "fail" | "unsupported";

export type FlagshipSentence = {
  id: string;
  text: string;
  verdict: Verdict;
  span: string;
  evidence: string;
};

export type UseCase = {
  question: string;
  source: string;
};

export type Flagship = {
  id: string;
  title: string;
  passage: string;
  sentences: readonly FlagshipSentence[];
  useCases: readonly UseCase[];
  tryHref: string | null;
  recorded: string;
};

export type ShelfEntry = {
  id: string;
  claim: string;
  artifact: { href: string; label: string };
  limit: string;
};

export type Score = {
  id: string;
  value: string;
  date: string | null;
  label: string;
};
