/** Dated entries, newest first. Only things that happened. */
export type LogEntry = { date: string; kind: "Shipped" | "Note" | "Learned" | "Radar"; title: string; href?: string };

export const LOG: readonly LogEntry[] = [
  {
    date: "2026-11-22",
    kind: "Radar",
    title: "Week 47: German benchmarks exist now, so mine gets narrower",
    href: "https://github.com/jakob-alexander2000/studio/blob/main/research/radar/2026-W47.md",
  },
  { date: "2026-11-22", kind: "Shipped", title: "Rebuilt this site around the four layers I work in" },
];
