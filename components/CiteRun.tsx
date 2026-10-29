"use client";

import { useRef } from "react";
import { LiveDemo } from "@/components/LiveDemo";
import { useNoteSequence } from "@/components/note-sequence";

const PASSAGE_DAYS =
  "Full-time employees receive 30 days of paid vacation per calendar year, plus German public holidays observed in Berlin.";
const PASSAGE_CARRY =
  "Unused paid time off does not carry over past March 31 of the following year unless a manager approves an exception in writing.";
const SOURCE =
  "https://github.com/jakob-alexander2000/citebot/blob/main/examples/nordlicht-corpus/pto-and-leave.md";

export function CiteRun() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { phase, readAgain } = useNoteSequence(rootRef);

  return (
    <div
      ref={rootRef}
      className={phase === "rest" ? "cite" : `cite ${phase}`}
    >
      <div className="row pair">
        <p className="sentence">
          Full-time employees receive 30 days of paid vacation per calendar year.
          <a className="mark tap" href="#note-days">
            <span className="sr-only">Note </span>1
          </a>
        </p>
        <aside className="note note-1" id="note-days" role="note">
          <p className="note-kicker">Live CiteBot run</p>
          <p>Time off and leave</p>
          <blockquote>{PASSAGE_DAYS}</blockquote>
          <p className="verdict">Pass</p>
          <a className="tap" href={SOURCE}>
            Source passage
          </a>
        </aside>
      </div>
      <div className="row pair">
        <p className="sentence">
          Unused vacation carries over until March 31 of the following year.
          <a className="mark tap" href="#note-carry">
            <span className="sr-only">Note </span>2
          </a>
        </p>
        <aside className="note note-2" id="note-carry" role="note">
          <p className="note-kicker">Live CiteBot run</p>
          <p>Time off and leave</p>
          <blockquote>{PASSAGE_CARRY}</blockquote>
          <p className="verdict">Pass</p>
          <a className="tap" href={SOURCE}>
            Source passage
          </a>
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
          <a className="mark tap" href="#note-wrong">
            <span className="sr-only">Note </span>3
          </a>
        </p>
        <aside className="note note-3 fail" id="note-wrong" role="note">
          <p className="note-kicker">Hand-written example</p>
          <p>Planted wrong draft. The page says 30.</p>
          <blockquote>{PASSAGE_DAYS}</blockquote>
          <p className="verdict">Fail</p>
          <a className="tap" href={SOURCE}>
            Source passage
          </a>
        </aside>
      </div>
      <div className="row">
        <p className="caption">
          The first two sentences are from a live CiteBot run. The
          struck-through sentence is a hand-written example. It is wrong on
          purpose; the check catches it.
        </p>
      </div>
      <div className="row">
        <div className="links">
          <LiveDemo />
          <a className="tap" href="https://citebot-chi.vercel.app/harness">
            How the check works
          </a>
          <a className="tap" href="https://github.com/jakob-alexander2000/citebot">
            Source
          </a>
          <button type="button" className="replay tap" onClick={readAgain}>
            Read the check again
          </button>
        </div>
      </div>
    </div>
  );
}
