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
  /** Instrument name, so each form's field and button are distinct to assistive tech. */
  instrument: string;
  note: string;
  draft: string;
  setDraft: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
};

export function QueryForm({ tryId, instrument, note, draft, setDraft, onSubmit, children }: Props) {
  const inputId = useId();
  const form = useRef<HTMLFormElement>(null);
  const arrived = useInView(form);

  return (
    <form className="well" ref={form} onSubmit={onSubmit}>
      <label className="field" htmlFor={inputId}>
        <span className="kicker">Question</span>
        <input
          id={inputId}
          aria-label={`Question for ${instrument}`}
          type="text"
          name="q"
          value={draft}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <button
        type="submit"
        className="press"
        data-try={tryId}
        aria-label={`Try it: ${instrument}`}
      >
        Try it
      </button>
      <div className="results" data-arrived={arrived ? "1" : "0"} aria-live="polite">
        {children}
      </div>
      <p className="well-note">{note}</p>
    </form>
  );
}
