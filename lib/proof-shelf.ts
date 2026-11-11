import type { ShelfEntry } from "./close-reading";

export const PROOF_SHELF: ShelfEntry[] = [
  {
    id: "citebot-evals",
    claim: "The offline eval scores 18 of 18 example answers.",
    artifact: {
      href: "https://github.com/jakob-alexander2000/citebot-evals",
      label: "Eval run",
    },
    limit: "It scores example answers written in advance, and it does not call a model.",
  },
  {
    id: "retrieval-autopsy",
    claim: "The sample answer drops full-time employees only, and Qualifier fails.",
    artifact: {
      href: "https://retrieval-autopsy.vercel.app/",
      label: "Demo",
    },
    limit: "The checks match spans and do not judge meaning. The sample is not a policy.",
  },
  {
    id: "citebot",
    claim: "Each claim is marked pass, fail, or unsupported against the passage it came from.",
    artifact: {
      href: "https://citebot-chi.vercel.app/",
      label: "App",
    },
    limit: "The golden run uses a stand-in model, so it catches code changes.",
  },
];
