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
  const image = useRef<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = image.current;
    if (node && node.complete && node.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    return (
      <div className="still">
        <p className="tag" role="status">
          The still did not load. The links above still work.
        </p>
      </div>
    );
  }

  return (
    <div className="still">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={image}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
