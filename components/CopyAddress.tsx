"use client";

import { useState } from "react";

export function CopyAddress({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "fallback">("idle");
  const copy = async () => {
    const clipboard = navigator.clipboard;
    if (!clipboard?.writeText) {
      setState("fallback");
      return;
    }
    try {
      await clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("fallback");
    }
  };
  return (
    <span className="address-row">
      <a className="address pen-line" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="copy-address" onClick={() => void copy()}>
        Copy
      </button>
      <span className="copy-status" aria-live="polite">
        {state === "copied" ? "Copied" : state === "fallback" ? "Copy is unavailable" : ""}
      </span>
    </span>
  );
}
