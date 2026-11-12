"use client";

import { useEffect, useRef } from "react";
import { LAYERS } from "@/lib/schnitt-copy";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { mountSchnittScene, placeFlatThread } from "@/components/schnitt-scene";

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

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    let destroy = () => {};
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      const narrow = window.innerWidth < 800;
      const flat = document.documentElement.dataset.schnitt !== "gl" || narrow;
      if (flat) {
        stage.closest(".schnitt")?.classList.add("is-stack");
        placeFlatThread(stage);
        stage.dataset.gl = "off";
        return;
      }
      try {
        destroy = mountSchnittScene(stage, canvas);
      } catch {
        document.documentElement.dataset.schnitt = "flat";
        placeFlatThread(stage);
        stage.dataset.gl = "off";
      }
    };
    void document.fonts.ready.then(start);
    const redraw = () => {
      const stack = stage.closest(".schnitt")?.classList.contains("is-stack");
      if (document.documentElement.dataset.schnitt !== "gl" || stack) placeFlatThread(stage);
    };
    window.addEventListener("resize", redraw);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", redraw);
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
      <svg className="tie-svg" data-thread="pass" aria-hidden="true">
        <path fill="none" stroke="#111111" strokeWidth="1.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="flat-planes">
        <div className="plane-row" data-plane="handbook">
          <Leader id="handbook" />
          <div className="sheet">
            <p className="file">{run.handbook.file.replace(".md", ".MD").toUpperCase()}</p>
            <p className="sheet-title">{run.handbook.title}</p>
            {run.handbook.lines.map((line) => (
              <p className="body" key={line}>
                {line}
              </p>
            ))}
          </div>
        </div>
        <div className="plane-row" data-plane="passages">
          <Leader id="passages" />
          <div className="sheet">
            <p className="file">PASSAGE · {run.passage.id.toUpperCase()}</p>
            <p className="body">
              {passage.before}
              <span data-anchor="passage">
                <span className="dot" aria-hidden="true" />
                {passage.span}
              </span>
              {passage.after}
            </p>
          </div>
        </div>
        <div className="plane-row" data-plane="sentences">
          <Leader id="sentences" />
          <div className="sheet">
            <p className="file">RECORDED CLAIMS</p>
            <p className="question">Q · {run.question}</p>
            {pass ? (
              <p className="body claim">
                <span data-anchor="sentence">
                  <span className="dot" aria-hidden="true" />
                  {pass.text}
                </span>
              </p>
            ) : null}
            {fail ? (
              <p className="body claim is-fail">
                <span className="mark fail">FAIL</span>
                <span className="fail-text">{fail.text}</span>
                <svg className="pen" viewBox="0 0 148 56" aria-hidden="true" data-fail="loop">
                  <path
                    d="M16 32 C 14 12, 52 5, 86 11 C 122 18, 136 32, 124 42 C 108 54, 64 53, 40 44 C 22 37, 20 30, 34 26"
                    fill="none"
                    stroke="#C6302A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </p>
            ) : null}
          </div>
        </div>
        <div className="plane-row" data-plane="verdict">
          <Leader id="verdict" />
          <div className="sheet verdict">
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
          </div>
        </div>
      </div>
    </div>
  );
}

function Leader({ id }: { id: (typeof LAYERS)[number]["id"] }) {
  const layer = LAYERS.find((item) => item.id === id);
  if (!layer) return null;
  return (
    <p className="leader">
      <span className="leader-name">
        {layer.letter} · {layer.name}
      </span>
      <span className="leader-note">{layer.note}</span>
    </p>
  );
}
