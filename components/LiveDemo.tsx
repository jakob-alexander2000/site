"use client";

import { useEffect, useId, useRef, useState } from "react";

const ASK = "https://citebot-chi.vercel.app/ask";

export function LiveDemo() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open]);

  return (
    <>
      <button type="button" className="ink" onClick={() => setOpen(true)}>
        Live demo
      </button>
      {open ? (
        <div
          className="dialog-back"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dialog-bar">
              <h3 id={titleId}>CiteBot</h3>
              <a href={ASK}>Open in a new tab</a>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <iframe title="CiteBot live demo" src={ASK} />
          </div>
        </div>
      ) : null}
    </>
  );
}
