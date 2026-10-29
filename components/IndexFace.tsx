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
import { search, tokenize } from "@/lib/desk-index";
import { plainExcerpt } from "@/lib/plain-excerpt";
import { INDEX_DOCS } from "@/lib/samples";

export function IndexFace() {
  const { draft, setDraft, submitted, generation, onSubmit } = useSubmittedQuery();
  const tokens = submitted ? tokenize(submitted) : [];
  const hits = submitted && tokens.length > 0 ? search(INDEX_DOCS, submitted, 3) : [];
  const phase = queryPhase(submitted, tokens.length, hits.length);

  return (
    <QueryForm
      tryId="desk-index"
      note="The sample notes are adapted examples. The score multiplies how often the word appears in the note by the number of notes, then divides by how many notes contain the word. No AI is called."
      draft={draft}
      setDraft={setDraft}
      onSubmit={onSubmit}
    >
      {phase === "hit"
        ? hits.map((hit, index) => (
            <div
              className="hit show"
              key={`${hit.path}-${generation}`}
              style={{ ["--i" as string]: index }}
            >
              <div className="hit-top">
                <span className="rank">{index + 1}</span>
                <span className="path">{hit.path}</span>
                <span className="score-sm">
                  <span className="sr-only">Score </span>
                  {hit.score.toFixed(2)}
                </span>
              </div>
              <p className="titleline">{hit.title}</p>
              <p className="excerpt">
                <Highlight text={plainExcerpt(hit.snippet)} tokens={tokens} />
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
