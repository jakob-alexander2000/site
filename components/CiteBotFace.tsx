"use client";

import { useRef } from "react";
import { CLAIMS, PAGE_QUOTES } from "@/lib/copy";

export function CiteBotFace() {
  const well = useRef<HTMLDivElement>(null);

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
    <div className="well cite" ref={well} data-live="1">
      <div className="quotes">
        {PAGE_QUOTES.map((quote) => (
          <p key={quote}>{quote}</p>
        ))}
      </div>
      <ul className="claims" aria-label="Claims from one answer">
        {CLAIMS.map((claim) => (
          <li key={claim.text} className={claim.verdict === "Fail" ? "row fail" : "row"}>
            <span className="bulb" aria-hidden="true" />
            <div>
              <p className="claim">{claim.text}</p>
              <p className="src">{claim.source}</p>
            </div>
            <p className="v">{claim.verdict}</p>
          </li>
        ))}
      </ul>
      <button type="button" className="press" onClick={replay} aria-describedby="citebot-caption">
        Check
      </button>
    </div>
  );
}
