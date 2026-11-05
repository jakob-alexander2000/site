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
  const image = useRef<HTMLImageElement | null>(null);
  const [settled, setSettled] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // An error before hydration fires no onError; a finished image with no width has failed.
    const node = image.current;
    if (node && node.complete && node.naturalWidth === 0) setFailed(true);
  }, []);

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
      {failed ? (
        <p className="tag" role="status">
          The still did not load. The links above still work.
        </p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={image} src={src} alt={alt} width={width} height={height} onError={() => setFailed(true)} />
      )}
    </div>
  );
}
