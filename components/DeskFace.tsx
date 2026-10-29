"use client";

import { Highlight } from "@/components/Highlight";
import { QueryForm, useSubmittedQuery } from "@/components/QueryForm";
import {
  SEARCH_EMPTY,
  SEARCH_HINT,
  SEARCH_SHORT,
  missSentence,
  queryPhase,
} from "@/lib/copy";
import { retrieve, tokenize } from "@/lib/desk-retrieve";
import { DESK_CHUNKS } from "@/lib/samples";

export function DeskFace() {
  const { draft, setDraft, submitted, generation, onSubmit } = useSubmittedQuery();
  const tokens = submitted ? tokenize(submitted) : [];
  const hits = submitted && tokens.length > 0 ? retrieve(DESK_CHUNKS, submitted, 3) : [];
  const phase = queryPhase(submitted, tokens.length, hits.length);

  return (
    <QueryForm
      tryId="desk"
      note="One query word scores 1.00 when it is in the note, or 1.50 when it is also in the file name. Writing an answer calls an AI, and that step is not run here."
      draft={draft}
      setDraft={setDraft}
      onSubmit={onSubmit}
    >
      {phase === "hit"
        ? hits.map((hit, index) => (
            <div
              className="hit show"
              key={`${hit.relPath}-${generation}`}
              style={{ ["--i" as string]: index }}
            >
              <div className="hit-top">
                <span className="rank">{index + 1}</span>
                <span className="path">{hit.relPath}</span>
                <span className="score-sm">
                  <span className="sr-only">Score </span>
                  {hit.score.toFixed(2)}
                </span>
              </div>
              <p className="excerpt">
                <Highlight text={hit.excerpt} tokens={tokens} />
              </p>
            </div>
          ))
        : null}
      {phase === "miss" ? (
        <p className="miss show" key={generation}>
          {missSentence(submitted ?? "")}
        </p>
      ) : null}
      {phase === "empty" ? <p className="hint">{SEARCH_EMPTY}</p> : null}
      {phase === "short" ? <p className="hint">{SEARCH_SHORT}</p> : null}
      {phase === "idle" ? <p className="hint">{SEARCH_HINT}</p> : null}
    </QueryForm>
  );
}
