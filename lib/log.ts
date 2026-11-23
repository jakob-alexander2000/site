/** Dated entries, newest first. Only things that happened. */
export type LogEntry = { date: string; kind: "Shipped" | "Note" | "Learned" | "Radar"; title: string; href?: string };

export const LOG: readonly LogEntry[] = [
  {
    date: "2026-11-23",
    kind: "Shipped",
    title: "Folded the three answer checks into one open-source product, answer-checker",
    href: "https://github.com/jakob-alexander2000/answer-checker",
  },
  {
    date: "2026-11-22",
    kind: "Shipped",
    title: "Recorded runs of the three answer checks, and how Persona and the benchmark work",
  },
  {
    date: "2026-11-22",
    kind: "Radar",
    title: "Week 47: German benchmarks exist now, so mine gets narrower",
    href: "https://github.com/jakob-alexander2000/studio/blob/main/research/radar/2026-W47.md",
  },
  { date: "2026-11-22", kind: "Shipped", title: "Rebuilt this site around the four layers I work in" },
];
