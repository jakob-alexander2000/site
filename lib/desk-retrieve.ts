// Port of desk/src/retrieve.ts and the chunking in desk/src/scan.ts.
// The currency symbols in the original tokenizer are built at runtime so this
// page does not print them. These sample notes contain neither.

import { DESK_NOTES } from "./desk-notes.ts";

export type DeskHit = {
  path: string;
  title: string;
  score: number;
  excerpt: string;
  lines: string;
};

type Chunk = {
  relPath: string;
  startLine: number;
  endLine: number;
  text: string;
};

function tokenize(value: string): string[] {
  const currency = String.fromCharCode(0x20ac);
  const pattern = new RegExp(`[^a-z0-9äöüß${currency}$]+`, "gi");
  return value
    .toLowerCase()
    .replace(pattern, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function chunkText(relPath: string, content: string, targetChars = 900): Chunk[] {
  const lines = content.split(/\r?\n/);
  const chunks: Chunk[] = [];
  let buf: string[] = [];
  let startLine = 1;
  let chars = 0;

  const flush = (endLine: number) => {
    const text = buf.join("\n").trim();
    if (!text) return;
    chunks.push({ relPath, startLine, endLine, text });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (buf.length === 0) startLine = i + 1;
    buf.push(line);
    chars += line.length + 1;
    const blank = line.trim() === "";
    if (chars >= targetChars && blank) {
      flush(i + 1);
      buf = [];
      chars = 0;
    }
  }
  if (buf.length) flush(lines.length);
  return chunks;
}

function titleFrom(content: string, relPath: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) return trimmed.slice(2).trim();
  }
  return relPath;
}

const CHUNKS: Chunk[] = DESK_NOTES.flatMap((note) =>
  chunkText(note.path, note.content),
);

const TITLES = new Map<string, string>(
  DESK_NOTES.map((note) => [note.path, titleFrom(note.content, note.path)]),
);

export function searchDesk(query: string, k = 8): DeskHit[] {
  const tokens = tokenize(query);
  const ranked = tokens.length
    ? CHUNKS.map((chunk) => {
        const text = chunk.text.toLowerCase();
        let score = 0;
        for (const token of tokens) {
          if (text.includes(token)) score += 1;
          if (chunk.relPath.toLowerCase().includes(token)) score += 0.5;
        }
        score = score / Math.sqrt(tokens.length);
        return { chunk, score };
      })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
    : CHUNKS.slice(0, k).map((chunk) => ({ chunk, score: 0 }));

  return ranked.map(({ chunk, score }) => {
    const body = chunk.text.replace(/^\s*#{1,6}[ \t]*[^\n]*\n+/, "");
    const excerpt = body.length > 280 ? `${body.slice(0, 277).trim()}…` : body;
    return {
      path: chunk.relPath,
      title: TITLES.get(chunk.relPath) ?? chunk.relPath,
      score: Math.round(score * 100) / 100,
      excerpt,
      lines: `${chunk.startLine}–${chunk.endLine}`,
    };
  });
}
