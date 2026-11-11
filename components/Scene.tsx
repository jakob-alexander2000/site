"use client";

import { useEffect, useState } from "react";
import type { Flagship } from "@/lib/close-reading";

export function Scene({ flagship }: { flagship: Flagship }) {
  const [active, setActive] = useState(flagship.sentences[0]?.id ?? "");
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const on = media.matches;
      setReduced(on);
      document.documentElement.dataset.reduced = on ? "flat" : "motion";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const script = document.createElement("script");
    script.src = "/close-reading-stage.js";
    script.async = true;
    script.onload = () => {
      const stage = (window as unknown as { __closeReadingStage?: { mount: (canvas: HTMLCanvasElement) => boolean } })
        .__closeReadingStage;
      const canvas = document.querySelector("canvas[data-stage]");
      if (stage && canvas instanceof HTMLCanvasElement) stage.mount(canvas);
    };
    script.onerror = () => {
      script.remove();
    };
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [reduced]);

  function select(id: string) {
    setActive(id);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), reduced ? 0 : 900);
  }

  return (
    <div data-flagship data-block="scene">
      <div className="sentences">
        {flagship.sentences.map((sentence, index) => (
          <div key={sentence.id}>
            <button
              type="button"
              data-sentence
              data-sentence-id={sentence.id}
              data-verdict={sentence.verdict}
              data-active-sentence={active === sentence.id ? sentence.id : undefined}
              aria-pressed={active === sentence.id}
              onClick={() => select(sentence.id)}
            >
              {sentence.verdict === "fail" ? `Fail. ${sentence.text}` : sentence.text}
            </button>
            <span data-tie>{index + 1}</span>
            <span
              data-thread
              data-sentence-id={sentence.id}
              data-playing={playing && active === sentence.id ? "true" : "false"}
              data-thread-end={sentence.verdict === "unsupported" ? "open" : "closed"}
            />
          </div>
        ))}
      </div>
      <div>
        {flagship.sentences.map((sentence) => (
          <p key={sentence.id} data-role="body" data-type="body">
            {sentence.evidence}
          </p>
        ))}
      </div>
      <div className="fold-links">
        <button type="button" data-replay onClick={() => select(active)}>
          Replay
        </button>
      </div>
      <p data-role="body" data-type="body">
        {flagship.recorded}
      </p>
      <p data-passage data-role="body" data-type="body">
        {flagship.passage}
      </p>
      {reduced ? null : <canvas data-stage aria-hidden="true" />}
    </div>
  );
}
