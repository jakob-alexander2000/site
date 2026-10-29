"use client";

import { useState } from "react";
import { playStage } from "@/components/play";
import { scoreSavedCases } from "@/lib/eval-cases";

const SCORED = scoreSavedCases();
const CLEARED = SCORED.filter((item) => item.passed).length;

export function EvalDemo() {
  const [open, setOpen] = useState<string | null>(SCORED[0]?.id ?? null);

  return (
    <div className="demo">
      <div className="demo-bar">
        <p className="demo-count">
          {CLEARED} of {SCORED.length} cleared
        </p>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => playStage("eval-stage")}
        >
          Score again
        </button>
      </div>
      <ol className="demo-list">
        {SCORED.map((item, index) => {
          const expanded = open === item.id;
          return (
            <li
              key={item.id}
              className="demo-row"
              style={{ ["--i" as string]: index }}
            >
              <button
                type="button"
                className="row-btn"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : item.id)}
              >
                <span className="row-q">{item.question}</span>
                <span className={item.passed ? "mark" : "mark bad"}>
                  {item.passed ? "Cleared" : "Missed"}
                </span>
              </button>
              {expanded ? (
                <ul className="checks">
                  {item.checks.map((check) => (
                    <li key={check.name}>
                      <span className="check-name">{check.name}</span>
                      <span>{check.detail}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
