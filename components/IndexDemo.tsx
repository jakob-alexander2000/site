"use client";

import { useState } from "react";
import { playStage } from "@/components/play";
import { searchNotes } from "@/lib/desk-index";
import { INDEX_NOTES } from "@/lib/index-notes";

const SUGGESTED = ["core hours", "Berlin", "on-call"];

function formatScore(score: number): string {
  return String(Math.round(score * 100) / 100);
}

export function IndexDemo() {
  const [query, setQuery] = useState("core hours");
  const [submitted, setSubmitted] = useState("core hours");
  const hits = searchNotes(INDEX_NOTES, submitted, 5);
  const top = hits[0]?.score ?? 1;

  return (
    <div className="demo">
      <form
        className="query"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(query);
          requestAnimationFrame(() => playStage("index-stage"));
        }}
      >
        <label htmlFor="index-query">Rank the notes</label>
        <div className="query-row">
          <input
            id="index-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn">
            Rank
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
              requestAnimationFrame(() => playStage("index-stage"));
            }}
          >
            {item}
          </button>
        ))}
      </div>
      {hits.length === 0 ? (
        <p className="demo-note" aria-live="polite">
          No word of two letters or more. desk-index returns no notes.
        </p>
      ) : (
        <ol className="demo-list" aria-live="polite">
          {hits.map((hit, index) => (
            <li
              key={hit.path}
              className="hit"
              style={{
                ["--i" as string]: index,
                ["--p" as string]: top > 0 ? hit.score / top : 0,
              }}
            >
              <div className="hit-top">
                <span className="path">{hit.path}</span>
                <span className="score">{formatScore(hit.score)}</span>
              </div>
              <p className="rank-title">{hit.title}</p>
              <div className="bar" aria-hidden="true">
                <span />
              </div>
              <p className="snip">{hit.snippet}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
