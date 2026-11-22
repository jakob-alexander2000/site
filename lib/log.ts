/** Dated entries, newest first. Only things that happened. */
export type LogEntry = { date: string; kind: "Shipped" | "Note" | "Learned" | "Radar"; title: string; href?: string };

export const LOG: readonly LogEntry[] = [
  { date: "2026-11-22", kind: "Shipped", title: "Rebuilt this site around the four layers I work in" },
];
