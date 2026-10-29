export type NoteDoc = {
  path: string;
  title: string;
  content: string;
  termFreq: Map<string, number>;
};

export type Hit = {
  path: string;
  title: string;
  score: number;
  snippet: string;
};

const wordRe = /[a-z0-9]+/g;

/** In-memory ranker ported from desk-index internal/index/index.go. */

export function tokenize(s: string): string[] {
  const raw = s.toLowerCase().match(wordRe) ?? [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const t of raw) {
    if (t.length < 2 || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function termFreq(content: string): Map<string, number> {
  const tf = new Map<string, number>();
  const raw = content.toLowerCase().match(wordRe) ?? [];
  for (const t of raw) {
    if (t.length < 2) continue;
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  return tf;
}

export function titleFrom(rel: string, content: string): string {
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) return trimmed.slice(2).trim();
  }
  const base = rel.split("/").pop() ?? rel;
  return base.replace(/\.md$/i, "");
}

function collapseSpace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

export function snippet(content: string, terms: string[]): string {
  const lower = content.toLowerCase();
  let pos = -1;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i >= 0 && (pos < 0 || i < pos)) pos = i;
  }
  if (pos < 0) pos = 0;
  let start = pos - 40;
  if (start < 0) start = 0;
  let end = start + 160;
  if (end > content.length) end = content.length;
  let s = collapseSpace(content.slice(start, end).trim());
  if (start > 0) s = `…${s}`;
  if (end < content.length) s = `${s}…`;
  return s;
}

export function makeDoc(path: string, content: string): NoteDoc {
  return {
    path,
    title: titleFrom(path, content),
    content,
    termFreq: termFreq(content),
  };
}

export function search(docs: NoteDoc[], query: string, limit = 10): Hit[] {
  if (limit <= 0) limit = 10;
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const post = new Map<string, number[]>();
  docs.forEach((doc, i) => {
    for (const term of doc.termFreq.keys()) {
      const list = post.get(term);
      if (list) list.push(i);
      else post.set(term, [i]);
    }
  });

  const scores = new Map<number, number>();
  const nDocs = docs.length;
  for (const term of terms) {
    const posting = post.get(term);
    const df = posting?.length ?? 0;
    if (df === 0) continue;
    const idf = nDocs / df;
    for (const di of posting ?? []) {
      const tf = docs[di]?.termFreq.get(term) ?? 0;
      scores.set(di, (scores.get(di) ?? 0) + tf * idf);
    }
  }

  const ranked = [...scores.entries()].map(([i, s]) => ({ i, s }));
  ranked.sort((a, b) => {
    if (a.s === b.s) return (docs[a.i]?.path ?? "").localeCompare(docs[b.i]?.path ?? "");
    return b.s - a.s;
  });
  const top = ranked.slice(0, limit);
  return top.map((r) => {
    const doc = docs[r.i];
    if (!doc) return { path: "", title: "", score: r.s, snippet: "" };
    return {
      path: doc.path,
      title: doc.title,
      score: r.s,
      snippet: snippet(doc.content, terms),
    };
  });
}
