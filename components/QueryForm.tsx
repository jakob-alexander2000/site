"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";

export function useSubmittedQuery(initial = "") {
  const [draft, setDraft] = useState(initial);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(draft.trim());
    setGeneration((value) => value + 1);
  }

  return { draft, setDraft, submitted, generation, onSubmit };
}

type Props = {
  tryId: string;
  note: string;
  draft: string;
  setDraft: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
};

export function QueryForm({ tryId, note, draft, setDraft, onSubmit, children }: Props) {
  const inputId = useId();

  return (
    <form className="well" onSubmit={onSubmit}>
      <label className="field" htmlFor={inputId}>
        <span className="kicker">Question</span>
        <input
          id={inputId}
          type="text"
          name="q"
          value={draft}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button type="submit" className="press" data-try={tryId}>
        Try it
      </button>
      <div className="results" aria-live="polite">
        {children}
      </div>
      <p className="well-note">{note}</p>
    </form>
  );
}
