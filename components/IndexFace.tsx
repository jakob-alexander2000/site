"use client";

import { useState } from "react";
import { Highlight } from "@/components/Highlight";
import { Knob } from "@/components/Knob";
import { search, tokenize } from "@/lib/desk-index";
import { INDEX_DOCS, INDEX_STOPS } from "@/lib/samples";

const SLOTS = [0, 1];

export function IndexFace() {
  const [index, setIndex] = useState(0);
  const [gen, setGen] = useState(0);
  const query = INDEX_STOPS[index] ?? INDEX_STOPS[0];
  const hits = search(INDEX_DOCS, query, 4);
  const tokens = tokenize(query);

  function onChange(next: number) {
    setIndex(next);
    setGen((n) => n + 1);
  }

  return (
    <div className="well index">
      <Knob label="Search words" stops={INDEX_STOPS} index={index} onChange={onChange} />
      <div className="stack" aria-live="polite">
        {SLOTS.map((slot) => {
          const hit = hits[slot];
          if (!hit) {
            return (
              <div className="hit vacant" key={`empty-${slot}`}>
                <span className="path">—</span>
              </div>
            );
          }
          return (
            <div className={gen > 0 ? "hit show" : "hit"} key={`${hit.path}-${gen}`}>
              <div className="hit-top">
                <span className="rank">{slot + 1}</span>
                <span className="path">{hit.path}</span>
                <span className="score-sm">{hit.score.toFixed(2)}</span>
              </div>
              <p className="titleline">{hit.title}</p>
              <p className="excerpt">
                <Highlight text={hit.snippet} tokens={tokens} />
              </p>
            </div>
          );
        })}
      </div>
      <p className="well-note">
        Two sample notes, ops/oncall.md and remote-work.md, ranked with the Go server’s
        term score.
      </p>
    </div>
  );
}
