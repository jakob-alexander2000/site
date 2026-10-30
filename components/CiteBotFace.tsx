"use client";

import { useRef } from "react";
import { CITEBOT_QUESTION, CLAIMS, PAGE_QUOTES } from "@/lib/copy";
import { useInView } from "@/components/useInView";

export function CiteBotFace() {
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
        data-try="citebot"
        onClick={replay}
        aria-describedby="citebot-caption"
      >
        Try it
      </button>
      <div className="well cite" ref={well} data-live={seen ? "1" : "0"}>
        <p className="ask">{CITEBOT_QUESTION}</p>
        <div className="quotes">
          {PAGE_QUOTES.map((quote) => (
            <p key={quote}>{quote}</p>
          ))}
        </div>
        <ul className="claims" aria-label="Claims from one answer">
          {CLAIMS.map((claim) => (
            <li key={claim.text} className={claim.verdict === "Fail" ? "row fail" : "row"}>
              <span className="bar" aria-hidden="true" />
              <div>
                <p className="claim">{claim.text}</p>
                <p className="src">{claim.source}</p>
              </div>
              <p className="v">{claim.verdict}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
