// Port of desk-index/internal/index/index.go.
// Ranking is tf * (documents / document frequency), the same formula as the Go server.
// Snippets use JavaScript string indexes. These sample notes are shorter than the
// snippet window, so the window is the whole note either way.

import { INDEX_NOTES } from "./index-notes.ts";

export type IndexHit = {
  path: string;
  title: string;
  score: number;
  snippet: string;
};

type Doc = {
  path: string;
  title: string;
  content: string;
  termFreq: Map<string, number>;
};

const WORD = /[a-z0-9]+/g;

function tokens(value: string): string[] {
  return value.toLowerCase().match(WORD) ?? [];
}

function tokenize(value: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of tokens(value)) {
    if (token.length < 2 || seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}

function termFreq(content: string): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens(content)) {
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
    const at = lower.indexOf(term);
    if (at >= 0 && (pos < 0 || at < pos)) pos = at;
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

const DOCS: Doc[] = [...INDEX_NOTES]
  .map((note) => ({
    path: note.path,
    title: titleFrom(note.path, note.content),
    content: note.content,
    termFreq: termFreq(note.content),
  }))
  .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

const POST = new Map<string, number[]>();
DOCS.forEach((doc, index) => {
  for (const term of doc.termFreq.keys()) {
    const list = POST.get(term);
    if (list) list.push(index);
    else POST.set(term, [index]);
  }
});

export function searchIndex(query: string, limit = 10): IndexHit[] {
  const terms = tokenize(query);
  if (!terms.length || limit <= 0) return [];

  const scores = new Map<number, number>();
  const nDocs = DOCS.length;
  for (const term of terms) {
    const posting = POST.get(term);
    const df = posting?.length ?? 0;
    if (!posting || df === 0) continue;
    const idf = nDocs / df;
    for (const docIndex of posting) {
      const tf = DOCS[docIndex]?.termFreq.get(term) ?? 0;
      scores.set(docIndex, (scores.get(docIndex) ?? 0) + tf * idf);
    }
  }

  const ranked = [...scores.entries()]
    .map(([index, score]) => ({ index, score, path: DOCS[index]?.path ?? "" }))
    .sort((a, b) => (a.score === b.score ? (a.path < b.path ? -1 : 1) : b.score - a.score))
    .slice(0, limit);

  return ranked.map((item) => {
    const doc = DOCS[item.index];
    if (!doc) return { path: "", title: "", score: item.score, snippet: "" };
    return {
      path: doc.path,
      title: doc.title,
      score: item.score,
      snippet: snippet(doc.content, terms),
    };
  });
}
