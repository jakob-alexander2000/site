"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { LAYERS, type LayerId } from "@/lib/schnitt-copy";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { showExplodedFallback } from "@/components/schnitt-fallback";

function splitSpan(text: string, span: string) {
  const index = text.indexOf(span);
  if (index < 0) return { before: text, span: "", after: "" };
  return { before: text.slice(0, index), span, after: text.slice(index + span.length) };
}

export function SchnittStage({ run }: { run: SchnittRun }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pass = run.sentences.find((sentence) => sentence.verdict === "pass");
  const fail = run.sentences.find((sentence) => sentence.verdict === "fail");
  const passage = splitSpan(run.passage.text, run.passage.span);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    if (document.documentElement.dataset.schnitt !== "gl") {
      showExplodedFallback(stage);
      return;
    }
    try {
      const attributes = {
        alpha: true,
        depth: true,
        stencil: false,
        antialias: false,
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: false,
      } as const;
      const gl = canvas.getContext("webgl2", attributes) || canvas.getContext("webgl", attributes);
      if (!gl) throw new Error("WebGL context is missing");
    } catch {
      document.documentElement.dataset.schnitt = "flat";
      showExplodedFallback(stage);
    }
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    if (document.documentElement.dataset.schnitt !== "gl") return;
    let destroy = () => {};
    let cancelled = false;
    const start = () => {
      if (cancelled || document.documentElement.dataset.schnitt !== "gl") return;
      void import("@/components/schnitt-scene")
        .then(({ mountSchnittScene }) => {
          if (cancelled || document.documentElement.dataset.schnitt !== "gl") return;
          try {
            destroy = mountSchnittScene(stage, canvas);
          } catch {
            document.documentElement.dataset.schnitt = "flat";
            showExplodedFallback(stage);
          }
        })
        .catch(() => {
          if (cancelled) return;
          document.documentElement.dataset.schnitt = "flat";
          showExplodedFallback(stage);
        });
    };
    void document.fonts.ready.then(start);
    return () => {
      cancelled = true;
      destroy();
    };
  }, []);

  return (
    <div className="schnitt-stage" id="schnitt-layers" ref={stageRef}>
      <div className="crops" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <canvas ref={canvasRef} className="schnitt-gl" aria-hidden="true" />
      <svg className="leaders" aria-hidden="true" />
      <svg className="tie-svg" data-thread="pass" aria-hidden="true">
        <path fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="stack">
        <Sheet id="handbook">
          <p className="file">{run.handbook.file.replace(".md", ".MD").toUpperCase()}</p>
          <p className="sheet-title">{run.handbook.title}</p>
          {run.handbook.lines.map((line) => (
            <p className="body" key={line}>
              {line}
            </p>
          ))}
        </Sheet>
        <Sheet id="passages">
          <p className="file">PASSAGE · {run.passage.id.toUpperCase()}</p>
          <p className="body">
            {passage.before}
            <span className="span" data-anchor="passage">
              {passage.span}
            </span>
            {passage.after}
          </p>
        </Sheet>
        <Sheet id="sentences">
          <p className="file">RECORDED CLAIMS</p>
          <p className="question">Q · {run.question}</p>
          {pass ? (
            <p className="body claim">
              <span data-anchor="sentence">{pass.text}</span>
            </p>
          ) : null}
          {fail ? (
            <p className="body claim is-fail">
              <span className="mark fail">FAIL</span>
              <span className="fail-text">
                {fail.text}
                <svg className="fail-loop" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" data-fail="loop">
                  <path
                    d="M50 4 C 86 4, 97 9, 97 20 C 97 31, 86 36, 50 36 C 14 36, 3 31, 3 20 C 3 9, 14 4, 52 5"
                    fill="none"
                    stroke="#C6302A"
                    strokeWidth="2.4"
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </p>
          ) : null}
        </Sheet>
        <Sheet id="verdict" verdict>
          <p className="file">VERDICT</p>
          {run.sentences.map((sentence, index) => (
            <p className="body verdict-row" key={sentence.id}>
              <span className={sentence.verdict === "fail" ? "mark fail" : "mark"}>
                {sentence.verdict === "fail" ? "FAIL" : "PASS"}
              </span>
              <span className="verdict-copy">
                S{index + 1} · {sentence.text}
                <span className="evidence">{sentence.evidence}</span>
              </span>
            </p>
          ))}
        </Sheet>
      </div>
    </div>
  );
}

function Sheet({ id, verdict = false, children }: { id: LayerId; verdict?: boolean; children: ReactNode }) {
  const layer = LAYERS.find((item) => item.id === id);
  return (
    <div className="plane-slot" data-plane={id}>
      {layer ? (
        <p className="callout" data-for={id}>
          <span className="leader-name">
            {layer.letter} · {layer.name}
          </span>
          <span className="leader-note">{layer.note}</span>
        </p>
      ) : null}
      <article className={verdict ? "sheet verdict" : "sheet"}>
        <span className="peg" data-peg={id} />
        {children}
      </article>
    </div>
  );
}
