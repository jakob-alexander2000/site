export type DocChunk = {
  id: string;
  relPath: string;
  startLine: number;
  endLine: number;
  text: string;
};

export type Citation = {
  relPath: string;
  startLine: number;
  endLine: number;
  excerpt: string;
  score: number;
};

/**
 * Keyword retrieve from Desk src/retrieve.ts.
 * The original tokenizer also treats a euro sign as a break. This sample
 * has none, so that character is omitted and the scores on these notes match.
 */
export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9äöüß$]+/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

export function chunkText(relPath: string, content: string, targetChars = 900): DocChunk[] {
  const lines = content.split(/\r?\n/);
  const chunks: DocChunk[] = [];
  let buf: string[] = [];
  let startLine = 1;
  let chars = 0;

  const flush = (endLine: number) => {
    const text = buf.join("\n").trim();
    if (!text) return;
    chunks.push({
      id: `${relPath}:${startLine}-${endLine}`,
      relPath,
      startLine,
      endLine,
      text,
    });
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

export function retrieve(chunks: DocChunk[], query: string, k = 8): Citation[] {
  const qTokens = tokenize(query);
  if (!qTokens.length) {
    return chunks.slice(0, k).map((c) => toCitation(c, 0));
  }

  const scored = chunks.map((c) => {
    const text = c.text.toLowerCase();
    let score = 0;
    for (const t of qTokens) {
      if (text.includes(t)) score += 1;
      if (c.relPath.toLowerCase().includes(t)) score += 0.5;
    }
    score = score / Math.sqrt(qTokens.length);
    return { c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, k)
    .map(({ c, score }) => toCitation(c, score));
}

function toCitation(c: DocChunk, score: number): Citation {
  const excerpt = c.text.length > 280 ? `${c.text.slice(0, 277).trim()}…` : c.text;
  return {
    relPath: c.relPath,
    startLine: c.startLine,
    endLine: c.endLine,
    excerpt,
    score: Math.round(score * 100) / 100,
  };
}
