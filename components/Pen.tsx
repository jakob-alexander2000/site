"use client";

import { useEffect, useRef } from "react";
import type { RoughAnnotation } from "rough-notation/lib/model";

export function Pen({ children, italic = false }: { children: string; italic?: boolean }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let gone = false;
    let annotation: RoughAnnotation | undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    void import("rough-notation").then(({ annotate }) => {
      if (gone || !ref.current) return;
      annotation = annotate(ref.current, {
        type: "underline",
        color: "#ffffff",
        strokeWidth: 1,
        padding: 2,
        animationDuration: reduce ? 0 : 700,
        iterations: 1,
        animate: !reduce,
      });
      annotation.show();
    });
    return () => {
      gone = true;
      annotation?.remove();
    };
  }, []);

  if (italic) {
    return (
      <em ref={ref} className="pen">
        {children}
      </em>
    );
  }

  return (
    <span ref={ref} className="pen">
      {children}
    </span>
  );
}
