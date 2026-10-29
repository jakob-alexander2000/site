"use client";

import { useRef } from "react";
import { useNoteSequence } from "@/components/note-sequence";

const PASSAGE =
  "Full-time employees receive 30 days of paid vacation per calendar year, plus German public holidays observed in Berlin.";
const SOURCE =
  "https://github.com/jakob-alexander2000/citebot/blob/main/examples/nordlicht-corpus/pto-and-leave.md";

export function OpeningProof() {
  const ref = useRef<HTMLDivElement>(null);
  const { phase, readAgain } = useNoteSequence(ref);

  return (
    <div
      ref={ref}
      className={phase === "rest" ? "cite proof" : `cite proof ${phase}`}
    >
      <p className="sentence">
        <span className="wrong">
          Full-time employees receive 25 days of paid vacation.
        </span>
        <span className="sr-only">
          {" "}
          Struck through. The recorded check fails this sentence.
        </span>
        <a className="mark tap" href="#note-wrong-open">
          <span className="sr-only">Note </span>4
        </a>
      </p>
      <aside className="note note-1 fail" id="note-wrong-open" role="note">
        <p className="note-kicker">Hand-written example</p>
        <blockquote>{PASSAGE}</blockquote>
        <p className="verdict">Fail</p>
        <div className="note-actions">
          <a className="tap" href={SOURCE}>
            Source passage
          </a>
          <button type="button" className="replay tap" onClick={readAgain}>
            Read the check again
          </button>
        </div>
      </aside>
    </div>
  );
}
