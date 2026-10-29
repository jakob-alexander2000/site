import { makeDoc, type NoteDoc } from "./desk-index";
import { chunkText, type DocChunk } from "./desk-retrieve";

/** remote-work.md from the public desk-index sample folder. */
export const REMOTE_WORK = `# Remote work

Core hours are 10:00–16:00 Berlin time.
Async updates go in the shared notes folder.
`;

/** ops/oncall.md from the public desk-index sample folder, with the severity abbreviation written in words. */
export const ON_CALL = `# On-call

Primary on-call rotates weekly.
Escalate a severe incident through the pager channel within 15 minutes.
`;

/** Workflow from the public Desk sample note, without the stack lines that use abbreviations. */
export const DESK_BRIEF = `# Desk brief

Desk is a local-first folder agent. The workflow points at a folder of notes, asks a question grounded in those files, and can write a report back into the folder.
`;

export const SAMPLE_NOTES = [
  { path: "remote-work.md", content: REMOTE_WORK },
  { path: "ops/oncall.md", content: ON_CALL },
  { path: "desk-brief.md", content: DESK_BRIEF },
] as const;

export const DESK_CHUNKS: DocChunk[] = SAMPLE_NOTES.flatMap((note) =>
  chunkText(note.path, note.content),
);

export const INDEX_DOCS: NoteDoc[] = SAMPLE_NOTES.map((note) => makeDoc(note.path, note.content));
