"use client";

import { useState } from "react";
import { forReaders } from "@/lib/copy";
import { RECORDED_CASES } from "@/lib/recorded-cases";
import { casePassed, scoreCase, type CheckResult } from "@/lib/score-case";

const PLAIN: Record<string, string> = {
  "answer-includes": "States what the pages say",
  "answer-excludes": "Leaves the false line out",
  "min-citations": "Names a page",
  "citation-source": "Names the right file",
  refusal: "Says the pages do not cover it",
  "verification-summary": "The check summary matches",
  response: "The reply arrived",
  "answer-nonempty": "The reply has words",
  noop: "Nothing to check",
};

type Row = {
  id: string;
  question: string;
  answer: string;
  ok: boolean;
  checks: CheckResult[];
};

function runScorecard(): Row[] {
  return RECORDED_CASES.map((item) => {
    const checks = scoreCase(item.expect, {
      answer: item.answer,
      citations: item.sources.map((source) => ({ source })),
    });
    return {
      id: item.id,
      question: item.question,
      answer: item.answer,
      ok: casePassed(checks),
      checks,
    };
  });
}

export function Scorecard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [runId, setRunId] = useState(0);

  function run() {
    setRows(runScorecard());
    setRunId((value) => value + 1);
  }

  const passed = rows?.filter((row) => row.ok).length ?? 0;

  return (
    <div className="tool">
      <p className="tool-lead">
        These fifteen questions are hand-written examples on a fixed test set.
        The button scores those examples. It does not score CiteBot's live
        answers. The full set is 18 of 18 example answers. Three examples stay
        in the repository.
      </p>
      <button type="button" className="ink tap" onClick={run}>
        {rows ? "Run the scorecard again" : "Run the scorecard"}
      </button>
      <p className="score-line" aria-live="polite">
        {rows
          ? `${passed} of the examples on this page pass. The full set is 18 of 18 example answers.`
          : "Not run yet."}
      </p>
      <ol className={rows ? "score-list ran" : "score-list"} key={runId}>
        {RECORDED_CASES.map((item) => {
          const row = rows?.find((candidate) => candidate.id === item.id);
          return (
            <li key={item.id}>
              <div className="score-q">
                <span>{forReaders(item.question)}</span>
              </div>
              <p className={row ? (row.ok ? "result pass" : "result fail") : "result"}>
                {row ? (row.ok ? "Pass" : "Fail") : "Not run"}
              </p>
              {row ? (
                <div className="recorded">
                  <p>{forReaders(row.answer)}</p>
                  <ul>
                    {row.checks.map((check) => (
                      <li key={check.name}>
                        {PLAIN[check.name] ?? forReaders(check.name)}
                        {check.ok ? null : (
                          <span className="check-detail">{forReaders(check.detail)}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
