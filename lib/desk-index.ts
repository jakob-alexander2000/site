/**
 * desk-index ranking, ported from internal/index/index.go.
 * Score = term count × (notes ÷ notes containing the word).
 * Query words are unique. Ties break by path, ascending.
 */

export type IndexDoc = {
  path: string;
  title: string;
  content: string;
};

export type IndexHit = {
  path: string;
  title: string;
  score: number;
  snippet: string;
};

const WORD = /[a-z0-9]+/g;

type Indexed = IndexDoc & { termFreq: Map<string, number> };

function tokenize(value: string): string[] {
  const raw = value.toLowerCase().match(WORD) ?? [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const token of raw) {
    if (token.length < 2 || seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}

function termFreq(content: string): Map<string, number> {
  const freq = new Map<string, number>();
  const raw = content.toLowerCase().match(WORD) ?? [];
  for (const token of raw) {
    if (token.length < 2) continue;
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

function titleFrom(rel: string, content: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) return trimmed.slice(2).trim();
  }
  const base = rel.split("/").pop() ?? rel;
  return base.replace(/\.md$/i, "");
}

function collapseSpace(value: string): string {
  let out = "";
  let prev = false;
  for (const char of value) {
    if (/\s/u.test(char)) {
      if (!prev) {
        out += " ";
        prev = true;
      }
      continue;
    }
    prev = false;
    out += char;
  }
  return out;
}

function snippet(content: string, terms: string[]): string {
  const lower = content.toLowerCase();
  let pos = -1;
  for (const term of terms) {
    const found = lower.indexOf(term);
    if (found >= 0 && (pos < 0 || found < pos)) pos = found;
  }
  if (pos < 0) pos = 0;
  let start = pos - 40;
  if (start < 0) start = 0;
  let end = start + 160;
  if (end > content.length) end = content.length;
  let text = collapseSpace(content.slice(start, end).trim());
  if (start > 0) text = `…${text}`;
  if (end < content.length) text = `${text}…`;
  return text;
}

export function searchNotes(
  docs: IndexDoc[],
  query: string,
  limit = 10,
): IndexHit[] {
  const cap = limit <= 0 ? 10 : limit;
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const indexed: Indexed[] = docs.map((doc) => ({
    ...doc,
    title: doc.title || titleFrom(doc.path, doc.content),
    termFreq: termFreq(doc.content),
  }));

  const post = new Map<string, number[]>();
  indexed.forEach((doc, index) => {
    for (const term of doc.termFreq.keys()) {
      const list = post.get(term);
      if (list) list.push(index);
      else post.set(term, [index]);
    }
  });

  const scores = new Map<number, number>();
  const nDocs = indexed.length;
  for (const term of terms) {
    const posting = post.get(term);
    const df = posting?.length ?? 0;
    if (df === 0) continue;
    const idf = nDocs / df;
    for (const docIndex of posting ?? []) {
      const tf = indexed[docIndex]?.termFreq.get(term) ?? 0;
      scores.set(docIndex, (scores.get(docIndex) ?? 0) + tf * idf);
    }
  }

  const ranked = [...scores.entries()]
    .map(([index, score]) => ({ index, score }))
    .sort((a, b) => {
      if (a.score === b.score) {
        return indexed[a.index]!.path < indexed[b.index]!.path ? -1 : 1;
      }
      return b.score - a.score;
    })
    .slice(0, cap);

  return ranked.map(({ index, score }) => {
    const doc = indexed[index]!;
    return {
      path: doc.path,
      title: doc.title,
      score,
      snippet: snippet(doc.content, terms),
    };
  });
}

export { titleFrom };
