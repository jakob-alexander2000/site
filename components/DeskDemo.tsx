"use client";

import { useState } from "react";
import { playStage } from "@/components/play";
import { DESK_NOTES } from "@/lib/desk-notes";
import { retrieve } from "@/lib/desk-retrieve";

const SUGGESTED = ["write a report", "folder agent", "CiteBot"];

export function DeskDemo() {
  const [query, setQuery] = useState("write a report");
  const [submitted, setSubmitted] = useState("write a report");
  const hits = retrieve(DESK_NOTES, submitted, 4);
  const blank = hits.length > 0 && hits.every((hit) => hit.score === 0);

  return (
    <div className="demo">
      <form
        className="query"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(query);
          requestAnimationFrame(() => playStage("desk-stage"));
        }}
      >
        <label htmlFor="desk-query">Search the notes</label>
        <div className="query-row">
          <input
            id="desk-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn">
            Search
          </button>
        </div>
      </form>
      <div className="chips">
        {SUGGESTED.map((item) => (
          <button
            key={item}
            type="button"
            className="chip"
            onClick={() => {
              setQuery(item);
              setSubmitted(item);
              requestAnimationFrame(() => playStage("desk-stage"));
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <ol className="demo-list" aria-live="polite">
        {hits.map((hit, index) => (
          <li
            key={hit.relPath}
            className="hit"
            style={{ ["--i" as string]: index }}
          >
            <div className="hit-top">
              <span className="path">{hit.relPath}</span>
              <span className="score">{hit.score.toFixed(2)}</span>
            </div>
            <p className="snip">{hit.excerpt}</p>
          </li>
        ))}
      </ol>
      {hits.length === 0 ? (
        <p className="demo-note">No note contains those words.</p>
      ) : null}
      {blank ? (
        <p className="demo-note">
          No word longer than two letters. Desk returns the first notes with a
          score of 0.
        </p>
      ) : null}
    </div>
  );
}
