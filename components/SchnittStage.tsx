"use client";

import { useEffect, useLayoutEffect } from "react";
import { placeThread, showExplodedFallback } from "@/components/schnitt-fallback";

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

/** Seconds of a visible page the 3D scene gets to appear before the flat drawing takes over. */
const SCENE_WATCHDOG_SECONDS = 10;

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

  // The flat drawing is laid out in CSS. Its thread is drawn from measurements, so a resize redraws it.
  useEffect(() => {
    const stage = document.getElementById("schnitt-layers");
    if (!(stage instanceof HTMLElement)) return;
    let last = stage.clientWidth;
    const observer = new ResizeObserver(() => {
      if (document.documentElement.dataset.schnitt !== "flat" || stage.clientWidth === last) return;
      last = stage.clientWidth;
      placeThread(stage);
    });
    observer.observe(stage);
    return () => observer.disconnect();
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
    // A scene that never becomes ready (no frames in a background tab, a stalled load) would leave the
    // hero blank, because the sheets stay hidden until the canvas is ready. Give it a fixed budget of
    // visible seconds, then show the flat drawing.
    let waited = 0;
    const watchdog = window.setInterval(() => {
      if (cancelled || stage.dataset.gl === "ready") {
        window.clearInterval(watchdog);
        return;
      }
      if (document.visibilityState !== "visible") return;
      waited += 1;
      if (waited >= SCENE_WATCHDOG_SECONDS) {
        window.clearInterval(watchdog);
        flatten();
      }
    }, 1000);
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
      window.clearInterval(watchdog);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("load", start);
      destroy();
    };
  }, []);

  return null;
}
