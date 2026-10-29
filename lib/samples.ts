import { makeDoc, type NoteDoc } from "./desk-index";
import { chunkText, type DocChunk } from "./desk-retrieve";

/** Adapted example. Not a byte-for-byte copy of a repository sample. */
export const CORE_HOURS = `# Core hours

Core hours are 10:00–16:00 Berlin time.
The overlap is for questions and handoffs.
`;

/** Adapted example. */
export const PAID_TIME_OFF = `# Paid time off

Full-time employees receive 30 days of paid time off per calendar year.
Unused paid time off does not carry over past March 31.
`;

/** Adapted example. */
export const OFFSITE = `# Team offsite

The autumn offsite meets in Berlin.
Travel and meals follow the expense policy.
`;

export const SAMPLE_NOTES = [
  { path: "core-hours.md", content: CORE_HOURS },
  { path: "paid-time-off.md", content: PAID_TIME_OFF },
  { path: "offsite.md", content: OFFSITE },
] as const;

export const DESK_CHUNKS: DocChunk[] = SAMPLE_NOTES.flatMap((note) =>
  chunkText(note.path, note.content),
);

export const INDEX_DOCS: NoteDoc[] = SAMPLE_NOTES.map((note) => makeDoc(note.path, note.content));
