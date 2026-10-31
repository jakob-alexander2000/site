"use client";

import { useRef } from "react";
import { useInView } from "@/components/useInView";
import {
  AUTOPSY_ANSWER,
  AUTOPSY_CHECKS,
  AUTOPSY_DROPPED,
  AUTOPSY_MODE,
  AUTOPSY_NOTE,
  AUTOPSY_PASSAGE,
  AUTOPSY_QUESTION,
  AUTOPSY_SAMPLE,
} from "@/lib/copy";

function Passage({ text, phrase }: { text: string; phrase: string }) {
  const start = text.indexOf(phrase);
  if (start < 0) return <p className="claim">{text}</p>;
  return (
    <p className="claim">
      {text.slice(0, start)}
      <mark>{phrase}</mark>
      {text.slice(start + phrase.length)}
    </p>
  );
}

export function AutopsyFace() {
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
        data-try="retrieval-autopsy"
        onClick={replay}
        aria-describedby="retrieval-autopsy-caption"
      >
        Try it
      </button>
      <div className="well cite autopsy" ref={well} data-live={seen ? "1" : "0"}>
        <p className="ask">{AUTOPSY_QUESTION}</p>
        <p className="face-label">{AUTOPSY_MODE}</p>
        <p className="claim">{AUTOPSY_ANSWER}</p>
        <p className="face-label">Passage</p>
        <Passage text={AUTOPSY_PASSAGE} phrase={AUTOPSY_DROPPED} />
        <ul className="claims" aria-label="Sample checks from Retrieval Autopsy">
          {AUTOPSY_CHECKS.map((check) => (
            <li key={check.name} className={check.verdict === "Fail" ? "row fail" : "row"}>
              <span className="bar" aria-hidden="true" />
              <p className="claim">{check.name}</p>
              <p className="v">{check.verdict}</p>
            </li>
          ))}
        </ul>
        <p className="well-note">
          {AUTOPSY_NOTE} {AUTOPSY_SAMPLE}
        </p>
      </div>
    </>
  );
}
