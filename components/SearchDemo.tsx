"use client";

import { useId, useState } from "react";
import { forReaders } from "@/lib/copy";
import { searchDesk } from "@/lib/desk-retrieve";
import { searchIndex } from "@/lib/index-search";

type Hit = {
  path: string;
  title: string;
  score: number;
  snippet: string;
  lines?: string;
};

type Props = {
  kind: "desk" | "index";
  suggestions: readonly string[];
  lead: string;
};

function showScore(score: number): string {
  if (Number.isInteger(score)) return String(score);
  const trimmed = score.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return trimmed;
}

function flatten(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function SearchDemo({ kind, suggestions, lead }: Props) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [caption, setCaption] = useState("");

  function run(next: string) {
    setQuery(next);
    if (kind === "desk") {
      const found = searchDesk(next);
      const empty = next.trim().length === 0;
      setHits(
        found.map((hit) => ({
          path: hit.path,
          title: hit.title,
          score: hit.score,
          snippet: flatten(hit.excerpt),
          lines: hit.lines,
        })),
      );
      setCaption(
        empty
          ? "Empty question. Desk returns the first passages."
          : found.length
            ? `${found.length} passage${found.length === 1 ? "" : "s"}.`
            : "No note contains those words.",
      );
      return;
    }
    const found = searchIndex(next);
    setHits(found);
    setCaption(
      found.length
        ? `${found.length} note${found.length === 1 ? "" : "s"}.`
        : next.trim().length < 2
          ? "The index needs a word of at least two letters."
          : "No note contains those words.",
    );
  }

  return (
    <div className="tool">
      <p className="tool-lead">{lead}</p>
      <form
        className="search"
        onSubmit={(event) => {
          event.preventDefault();
          run(query);
        }}
      >
        <label htmlFor={inputId}>Search the sample notes</label>
        <div className="search-row">
          <input
            id={inputId}
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="ink tap">
            Search
          </button>
        </div>
      </form>
      <div className="suggestions">
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" className="tap" onClick={() => run(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
      <p className="score-line" aria-live="polite">
        {caption || "Not run yet."}
      </p>
      {hits && hits.length > 0 ? (
        <ol className="hits">
          {hits.map((hit) => (
            <li key={hit.path}>
              <p className="hit-path">
                <span>{hit.path}</span>
                <span className="hit-score">{showScore(hit.score)}</span>
              </p>
              <p className="hit-title">{hit.title}</p>
              {hit.lines ? <p className="hit-lines">Lines {hit.lines}</p> : null}
              <p className="hit-snip">{forReaders(hit.snippet)}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
