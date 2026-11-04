"use client";

import { useEffect, useRef, useState } from "react";

export function ProductStill({
  src,
  width,
  height,
  alt,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
}) {
  const frame = useRef<HTMLDivElement | null>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setSettled(true);
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} className={settled ? "still is-colour" : "still"} data-settled={settled ? "1" : "0"}>
      {/* The still is the captured screenshot, kept at its own size. Colour is a CSS filter. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} />
    </div>
  );
}
