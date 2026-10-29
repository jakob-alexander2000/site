"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export function useNoteSequence(ref: RefObject<HTMLElement | null>) {
  const played = useRef(false);
  const [phase, setPhase] = useState<"rest" | "armed" | "play">("rest");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let first = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (first) {
          first = false;
          if (!entry.isIntersecting) setPhase("armed");
          return;
        }
        if (entry.isIntersecting && !played.current) {
          played.current = true;
          setPhase("play");
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  function readAgain() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    played.current = true;
    setPhase("armed");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase("play"));
    });
  }

  return { phase, readAgain };
}
