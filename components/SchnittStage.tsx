"use client";

import { useEffect, useLayoutEffect } from "react";
import { showExplodedFallback } from "@/components/schnitt-fallback";

function kick(task: () => void) {
  if (window.requestIdleCallback) window.requestIdleCallback(() => task(), { timeout: 800 });
  else window.setTimeout(task, 1);
}

export function SchnittMount() {
  useLayoutEffect(() => {
    const stage = document.getElementById("schnitt-layers");
    const canvas = stage?.querySelector("canvas");
    if (!(stage instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) return;
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
    const stage = document.getElementById("schnitt-layers");
    const canvas = stage?.querySelector("canvas");
    if (!(stage instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) return;
    if (document.documentElement.dataset.schnitt !== "gl") return;
    let destroy = () => {};
    let cancelled = false;
    const start = () => {
      kick(() => {
        if (cancelled || document.documentElement.dataset.schnitt !== "gl") return;
        void import("@/components/schnitt-scene")
          .then(async ({ mountSchnittScene }) => {
            if (cancelled || document.documentElement.dataset.schnitt !== "gl") return;
            try {
              destroy = await mountSchnittScene(stage, canvas);
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
      });
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      destroy();
    };
  }, []);

  return null;
}
