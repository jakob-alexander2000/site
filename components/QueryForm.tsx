"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useInView } from "@/components/useInView";

export function useSubmittedQuery(initial = "", showInitial = false) {
  const [draft, setDraft] = useState(initial);
  const [submitted, setSubmitted] = useState<string | null>(showInitial ? initial : null);
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
  const form = useRef<HTMLFormElement>(null);
  const arrived = useInView(form);

  return (
    <form className="well" ref={form} onSubmit={onSubmit}>
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
      <div className="results" data-arrived={arrived ? "1" : "0"} aria-live="polite">
        {children}
      </div>
      <p className="well-note">{note}</p>
    </form>
  );
}
