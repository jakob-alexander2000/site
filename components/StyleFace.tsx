"use client";

import { useRef } from "react";
import { useInView } from "@/components/useInView";
import {
  STYLE_DRAFT,
  STYLE_HOUSE,
  STYLE_RESULTS,
  STYLE_SAMPLE,
  STYLE_SCALE,
  STYLE_WORDS,
} from "@/lib/copy";

export function StyleFace() {
  const well = useRef<HTMLDivElement>(null);
  const seen = useInView(well);

  function replay() {
    const el = well.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.dataset.live = "0";
    if (reduce) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (well.current) well.current.dataset.live = "1";
      });
    });
  }

  return (
    <>
      <button
        type="button"
        className="press"
        data-try="style-distance"
        onClick={replay}
        aria-describedby="style-distance-caption"
      >
        Try it
      </button>
      <div className="well style" ref={well} data-live={seen ? "1" : "0"}>
        <p className="face-label">House voice, an example</p>
        <p className="claim">{STYLE_HOUSE}</p>
        <p className="face-label">Rewritten draft, an example</p>
        <p className="claim">{STYLE_DRAFT}</p>
        <ul className="claims" aria-label="Sample readings from Style Distance">
          {STYLE_RESULTS.map((result, index) => (
            <li key={result.label} className="row" style={{ ["--i" as string]: index }}>
              <span className="bar" aria-hidden="true" />
              <p className="claim">{result.label}</p>
              <p className="v">
                <span className="delta-num">{result.distance}</span> {result.reading}
              </p>
            </li>
          ))}
        </ul>
        <ul className="delta-lines" aria-label="Largest contributions in the whole sample">
          {STYLE_WORDS.map((row, index) => (
            <li key={row.word} className="delta-line" style={{ ["--i" as string]: index }}>
              <span className="delta-word">{row.word}</span>
              <span className="delta-track" aria-hidden="true">
                <span className="delta-fill" style={{ ["--share" as string]: row.share }} />
              </span>
              <span className="delta-dir">{row.direction}</span>
            </li>
          ))}
        </ul>
        <p className="well-note">
          {STYLE_SAMPLE} These two sentences are an example. The readings and the four words are for
          the whole sample. {STYLE_SCALE}
        </p>
      </div>
    </>
  );
}
