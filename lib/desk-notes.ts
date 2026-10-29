import { chunkNote, type DocChunk } from "./desk-retrieve";
import { DESK_BRIEF, DESK_MEETING } from "./sample-notes";

/**
 * Two notes from Desk's sample-notes folder.
 * A third sample note is not loaded on this page.
 */
export const DESK_NOTES: DocChunk[] = [
  ...chunkNote("desk-brief.md", DESK_BRIEF),
  ...chunkNote("meeting-2026-10-20.md", DESK_MEETING),
].sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0));

export const DESK_NOTE_TEXT: Record<string, string> = {
  "desk-brief.md": DESK_BRIEF,
  "meeting-2026-10-20.md": DESK_MEETING,
};
