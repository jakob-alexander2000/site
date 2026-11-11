import type { Flagship } from "./close-reading";

const citebot: Flagship = {
  id: "citebot",
  title: "CiteBot",
  passage: "Full-time employees receive 30 days of paid vacation per calendar year",
  recorded: "Recorded fixture, pinned 9 November 2026.",
  tryHref: "https://citebot-chi.vercel.app/ask",
  useCases: [
    {
      question: "How many paid vacation days do full-time employees get?",
      source: "pto-and-leave.md",
    },
    {
      question: "Which weekdays are desk days?",
      source: "welcome.md",
    },
    {
      question: "How many minutes is each demo slot before the hard stop?",
      source: "demo-day.md",
    },
  ],
  sentences: [
    {
      id: "pass-30",
      text: "Full-time employees receive 30 days.",
      verdict: "pass",
      span: "30 days of paid vacation",
      evidence: "30 days of paid vacation",
    },
    {
      id: "fail-unlimited",
      text: "PTO is unlimited.",
      verdict: "fail",
      span: "30 days",
      evidence: "The handbook says 30 days.",
    },
  ],
};

export const flagshipSlot: { value: Flagship } = { value: citebot };

export function getFlagship(): Flagship {
  return flagshipSlot.value;
}
