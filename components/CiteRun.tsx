"use client";

import { useEffect, useRef, useState } from "react";
import { LiveDemo } from "@/components/LiveDemo";

const PASSAGE_DAYS =
  "Full-time employees receive 30 days of paid vacation per calendar year, plus German public holidays observed in Berlin.";
const PASSAGE_CARRY =
  "Unused PTO does not carry over past March 31 of the following year unless a manager approves an exception in writing.";
const SOURCE =
  "https://github.com/jakob-alexander2000/citebot/blob/main/examples/nordlicht-corpus/pto-and-leave.md";

export function CiteRun() {
  const rootRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);
  const [phase, setPhase] = useState<"rest" | "armed" | "play">("rest");

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 900px)").matches;
    if (reduce || narrow) return;

    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (first) {
          first = false;
          if (!entry.isIntersecting) setPhase("armed");
          return;
        }
        if (entry.isIntersecting && !played.current) {
          played.current = true;
          setPhase("play");
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function readAgain() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    played.current = true;
    setPhase("armed");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("play"));
    });
  }

  return (
    <div
      ref={rootRef}
      className={phase === "rest" ? "cite" : `cite ${phase}`}
    >
      <div className="row pair">
        <p className="sentence">
          Full-time employees receive 30 days of paid vacation per calendar year.
          <a className="mark" href="#note-days">
            <span className="sr-only">Note </span>1
          </a>
        </p>
        <aside className="note note-1" id="note-days" role="note">
          <p className="note-kicker">pto-and-leave.md</p>
          <blockquote>{PASSAGE_DAYS}</blockquote>
          <p className="verdict">Pass</p>
          <a href={SOURCE}>Source passage</a>
        </aside>
      </div>
      <div className="row pair">
        <p className="sentence">
          Unused vacation carries over until March 31 of the following year.
          <a className="mark" href="#note-carry">
            <span className="sr-only">Note </span>2
          </a>
        </p>
        <aside className="note note-2" id="note-carry" role="note">
          <p className="note-kicker">pto-and-leave.md</p>
          <blockquote>{PASSAGE_CARRY}</blockquote>
          <p className="verdict">Pass</p>
          <a href={SOURCE}>Source passage</a>
        </aside>
      </div>
      <div className="row pair">
        <p className="sentence">
          <span className="wrong">
            Full-time employees receive 25 days of paid vacation.
          </span>
          <span className="sr-only">
            {" "}
            Struck through. The recorded check fails this sentence.
          </span>
          <a className="mark" href="#note-wrong">
            <span className="sr-only">Note </span>3
          </a>
        </p>
        <aside className="note note-3 fail" id="note-wrong" role="note">
          <p className="note-kicker">Planted wrong draft. The page says 30.</p>
          <blockquote>{PASSAGE_DAYS}</blockquote>
          <p className="verdict">Fail</p>
          <a href={SOURCE}>Source passage</a>
        </aside>
      </div>
      <div className="row">
        <p className="caption">
          From a real run and the evaluation set. The third draft is wrong on
          purpose; the check catches it.
        </p>
        <p className="caption margin-caption">
          Scroll, or rest on a number. The note is the passage.
        </p>
      </div>
      <div className="row">
        <div className="links">
          <LiveDemo />
          <a href="https://citebot-chi.vercel.app/harness">How the check works</a>
          <a href="https://github.com/jakob-alexander2000/citebot">Source</a>
          <button type="button" className="replay" onClick={readAgain}>
            Read the check again
          </button>
        </div>
      </div>
    </div>
  );
}
