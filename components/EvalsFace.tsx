"use client";

import { useRef } from "react";

export function EvalsFace({ marks }: { marks: boolean[] }) {
  const well = useRef<HTMLDivElement>(null);
  const passed = marks.filter(Boolean).length;

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
    <div className="well evals" ref={well} data-live="0">
      <p className="score">
        <span className="score-num">
          {passed}/{marks.length}
        </span>
        <span className="kicker">saved answers</span>
      </p>
      <div className="ticks" aria-hidden="true">
        {marks.map((ok, i) => (
          <span
            key={i}
            className={ok ? "tick" : "tick off"}
            style={{ ["--i" as string]: i }}
          />
        ))}
      </div>
      <p className="well-note">Suite checks on the saved answers. No AI is called.</p>
      <button
        type="button"
        className="press"
        data-try="citebot-evals"
        onClick={replay}
        aria-describedby="citebot-evals-caption"
      >
        Try it
      </button>
    </div>
  );
}
