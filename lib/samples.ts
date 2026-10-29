import { chunkText, type DocChunk } from "./desk-retrieve";
import { makeDoc, type NoteDoc } from "./desk-index";

/** desk sample-notes/desk-brief.md, byte for byte. */
export const DESK_BRIEF = `# Desk brief

Desk is a local-first folder agent.

## Workflow
1. Point at a folder of notes or docs
2. Ask a question grounded in those files
3. Optionally write a markdown report back into the folder

## Stack
- Node 20+
- Gemini API via \`GEMINI_API_KEY\`
- CLI primary; optional localhost UI (\`desk ui\`)

## Non-goals (v0.1)
- Electron / Tauri packaging
- Ollama (documented as future)
- Cloud sync
`;

/** desk-index sample-notes/ops/oncall.md */
export const ONCALL = `# On-call

Primary on-call rotates weekly.
Escalate sev-1 via the pager channel within 15 minutes.
`;

/** desk-index sample-notes/remote-work.md. The time range uses the file's en dash. */
export const REMOTE = `# Remote work

Core hours are 10:00–16:00 Berlin time.
Async updates go in the shared notes folder.
`;

export const DESK_CHUNKS: DocChunk[] = chunkText("desk-brief.md", DESK_BRIEF);

export const INDEX_DOCS: NoteDoc[] = [
  makeDoc("ops/oncall.md", ONCALL),
  makeDoc("remote-work.md", REMOTE),
];

export const DESK_STOPS = ["report", "Gemini", "folder"] as const;

export const INDEX_STOPS = ["Berlin", "pager", "Berlin pager", "core hours"] as const;
