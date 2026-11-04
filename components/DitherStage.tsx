"use client";

import { useEffect, useRef, useState } from "react";
import { REVEAL_MS } from "@/lib/reveal";

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

type StageState = "still" | "playing" | "played" | "fallback";

export function DitherStage({
  name,
  src,
  poster,
  captured,
  alt,
}: {
  name: string;
  src: string;
  poster: string;
  captured: string;
  alt: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const posterRef = useRef<HTMLImageElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const workRef = useRef<HTMLCanvasElement | null>(null);
  const played = useRef(false);
  const [state, setState] = useState<StageState>("still");
  const [posterOk, setPosterOk] = useState(true);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const label = `Recording · ${captured}`;

  useEffect(() => {
    const poster = posterRef.current;
    if (poster && poster.complete && poster.naturalWidth > 0) paint(poster);
  }, []);

  function setCanvas(node: HTMLCanvasElement | null) {
    canvasRef.current = node;
    if (!node || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!node.getContext("2d")) setState("fallback");
  }

  function setVideo(node: HTMLVideoElement | null) {
    videoRef.current = node;
    if (!node) return;
    node.muted = true;
    node.defaultMuted = true;
  }

  function paint(source: CanvasImageSource) {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    const cols = 320;
    const rows = 200;
    if (!workRef.current) workRef.current = document.createElement("canvas");
    const work = workRef.current;
    work.width = cols;
    work.height = rows;
    const wctx = work.getContext("2d", { willReadFrequently: true });
    if (!wctx) return false;
    wctx.drawImage(source, 0, 0, cols, rows);
    const image = wctx.getImageData(0, 0, cols, rows);
    const data = image.data;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        const i = (y * cols + x) * 4;
        const luma = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        const threshold = (BAYER[y & 3][x & 3] + 0.5) / 16;
        const value = luma > threshold ? 255 : 0;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
      }
    }
    wctx.putImageData(image, 0, 0);
    canvas.width = cols;
    canvas.height = rows;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(work, 0, 0);
    return true;
  }

  function draw() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    paint(video);
  }

  function fail() {
    videoRef.current?.pause();
    setState("fallback");
  }

  function play() {
    if (played.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !canvas.getContext("2d")) {
      played.current = true;
      fail();
      return;
    }
    played.current = true;
    setState("playing");

    const start = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        fail();
        return;
      }
      video.playbackRate = Math.min(16, duration / (REVEAL_MS / 1000));
      const t0 = performance.now();
      const tick = (now: number) => {
        if (now - t0 >= REVEAL_MS) {
          video.pause();
          setElapsed(Math.round(now - t0));
          setState("played");
          return;
        }
        draw();
        requestAnimationFrame(tick);
      };
      video.play().then(
        () => requestAnimationFrame(tick),
        () => fail(),
      );
    };

    if (video.readyState >= 1) {
      start();
      return;
    }
    const onReady = () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("error", onError);
      start();
    };
    const onError = () => {
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("error", onError);
      fail();
    };
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("error", onError);
    video.load();
  }

  return (
    <figure
      className="stage"
      data-state={state}
      data-duration={REVEAL_MS}
      data-elapsed={elapsed ?? undefined}
      onPointerEnter={(event) => {
        if (
          event.pointerType === "mouse" &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
          play();
        }
      }}
    >
      <div className="plate">
        {posterOk ? (
          // The still is one frame of the recording, kept at its captured size.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={alt}
            width={720}
            height={450}
            className="poster"
            ref={posterRef}
            onLoad={(event) => {
              paint(event.currentTarget);
            }}
            onError={() => {
              setPosterOk(false);
              setState("fallback");
            }}
          />
        ) : (
          <p className="fallback">The still did not load.</p>
        )}
        <canvas ref={setCanvas} className="dither" width={320} height={200} aria-hidden="true" />
        {state === "fallback" ? null : (
          <button
            type="button"
            className="hit"
            aria-label={`Play ${name} recording`}
            onClick={play}
            onFocus={play}
          >
            <span className="tag play-label">Play</span>
          </button>
        )}
      </div>
      <video
        ref={setVideo}
        className="clip"
        src={src}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      />
      <figcaption className="tag">{label}</figcaption>
      {state === "fallback" && posterOk ? (
        <p className="fallback">The recording did not play. The still is from {captured}.</p>
      ) : null}
    </figure>
  );
}
