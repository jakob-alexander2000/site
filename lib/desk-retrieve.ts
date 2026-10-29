/**
 * Desk's keyword retrieve, ported from desk/src/retrieve.ts and the
 * chunking loop in desk/src/scan.ts. Same scores, same excerpts.
 */

export type DocChunk = {
  relPath: string;
  text: string;
  startLine: number;
  endLine: number;
};

export type DeskHit = {
  relPath: string;
  startLine: number;
  endLine: number;
  excerpt: string;
  score: number;
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9äöüß\u20ac$]+/gi, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function toHit(chunk: DocChunk, score: number): DeskHit {
  const excerpt =
    chunk.text.length > 280
      ? `${chunk.text.slice(0, 277).trim()}…`
      : chunk.text;
  return {
    relPath: chunk.relPath,
    startLine: chunk.startLine,
    endLine: chunk.endLine,
    excerpt,
    score: Math.round(score * 100) / 100,
  };
}

export function retrieve(
  chunks: DocChunk[],
  query: string,
  k = 8,
): DeskHit[] {
  const tokens = tokenize(query);
  if (!tokens.length) {
    return chunks.slice(0, k).map((chunk) => toHit(chunk, 0));
  }

  const scored = chunks.map((chunk) => {
    const text = chunk.text.toLowerCase();
    let score = 0;
    for (const token of tokens) {
      if (text.includes(token)) score += 1;
      if (chunk.relPath.toLowerCase().includes(token)) score += 0.5;
    }
    score = score / Math.sqrt(tokens.length);
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((row) => row.score > 0)
    .slice(0, k)
    .map(({ chunk, score }) => toHit(chunk, score));
}

/** Same chunk loop as Desk's scan.ts, for notes short enough to be one chunk. */
export function chunkNote(relPath: string, content: string): DocChunk[] {
  const lines = content.split(/\r?\n/);
  const chunks: DocChunk[] = [];
  let buf: string[] = [];
  let startLine = 1;
  let chars = 0;

  const flush = (endLine: number) => {
    const text = buf.join("\n").trim();
    if (!text) return;
    chunks.push({ relPath, text, startLine, endLine });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (buf.length === 0) startLine = i + 1;
    buf.push(line);
    chars += line.length + 1;
    if (chars >= 900 && line.trim() === "") {
      flush(i + 1);
      buf = [];
      chars = 0;
    }
  }
  if (buf.length) flush(lines.length);
  return chunks;
}
