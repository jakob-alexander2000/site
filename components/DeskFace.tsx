"use client";

import { useState } from "react";
import { Highlight } from "@/components/Highlight";
import { Knob } from "@/components/Knob";
import { retrieve, tokenize } from "@/lib/desk-retrieve";
import { DESK_CHUNKS, DESK_STOPS } from "@/lib/samples";

export function DeskFace() {
  const [index, setIndex] = useState(0);
  const [gen, setGen] = useState(0);
  const query = DESK_STOPS[index] ?? DESK_STOPS[0];
  const hit = retrieve(DESK_CHUNKS, query, 3)[0];
  const tokens = tokenize(query);

  function onChange(next: number) {
    setIndex(next);
    setGen((n) => n + 1);
  }

  return (
    <div className="well desk">
      <Knob label="Question words" stops={DESK_STOPS} index={index} onChange={onChange} />
      {hit ? (
        <div className={gen > 0 ? "hit show" : "hit"} key={`${hit.relPath}-${gen}`}>
          <div className="hit-top">
            <span className="path">{hit.relPath}</span>
            <span className="score-sm">{hit.score.toFixed(2)}</span>
          </div>
          <p className="excerpt">
            <Highlight text={hit.excerpt} tokens={tokens} />
          </p>
        </div>
      ) : (
        <p className="excerpt">No note matched.</p>
      )}
      <p className="well-note">
        Search only, on sample-notes/desk-brief.md. Writing an answer calls an AI, and that
        step is not run here.
      </p>
    </div>
  );
}
