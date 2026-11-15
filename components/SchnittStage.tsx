"use client";

import { useEffect, useLayoutEffect } from "react";
import { showExplodedFallback } from "@/components/schnitt-fallback";

function kick(task: () => void) {
  const idle = window.requestIdleCallback;
  if (!idle) {
    window.setTimeout(task, 0);
    return;
  }
  const run = (deadline: IdleDeadline) => {
    // A short idle slice cannot hold a module evaluation. Come back later.
    if (deadline.timeRemaining() < 12 && !deadline.didTimeout) {
      idle(run, { timeout: 800 });
      return;
    }
    // After a paint, a timer starts the import. The frame callback only schedules it.
    window.requestAnimationFrame(() => {
      window.setTimeout(task, 0);
    });
  };
  idle(run, { timeout: 800 });
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
    // A lost context (memory pressure on a phone) stops the scene for good and
    // leaves the static hero. Nothing waits for a restore.
    const flatten = () => {
      if (cancelled) return;
      cancelled = true;
      try {
        destroy();
      } catch {
        // The scene is already gone.
      }
      destroy = () => {};
      document.documentElement.dataset.schnitt = "flat";
      showExplodedFallback(stage);
    };
    const onLost = () => flatten();
    canvas.addEventListener("webglcontextlost", onLost);
    const start = () => {
      kick(() => {
        if (cancelled || document.documentElement.dataset.schnitt !== "gl") return;
        void import("@/components/schnitt-scene")
          .then(async ({ mountSchnittScene }) => {
            if (cancelled || document.documentElement.dataset.schnitt !== "gl") return;
            try {
              const teardown = await mountSchnittScene(stage, canvas);
              if (cancelled) {
                teardown();
                return;
              }
              destroy = teardown;
            } catch {
              if (cancelled) return;
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
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("load", start);
      destroy();
    };
  }, []);

  return null;
}
