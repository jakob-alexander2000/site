"use client";

import { useEffect, useRef, type ReactNode } from "react";

const STATIONS = ["top", "citebot", "autopsy", "voice"] as const;

function cameraIsSticky(): boolean {
  const camera = document.querySelector(".camera");
  if (!camera) return false;
  return getComputedStyle(camera).position === "sticky";
}

export function Volume({ children }: { children: ReactNode }) {
  const world = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const node = world.current;
    if (!node) return;
    let frame = 0;

    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

    const place = () => {
      root.classList.toggle("flat", window.innerHeight < 520);
    };

    const write = () => {
      place();
      frame = 0;
      if (!root.classList.contains("spatial") || !cameraIsSticky()) return;
      const p = (window.scrollY / maxScroll()) * (STATIONS.length - 1);
      node.style.setProperty("--p", p.toFixed(4));
      const front = Math.round(p);
      document.querySelectorAll(".plane").forEach((plane) => {
        plane.classList.toggle("is-front", Number(plane.getAttribute("data-i")) === front);
      });
    };

    const schedule = () => {
      if (document.hidden) return;
      if (!frame) frame = requestAnimationFrame(write);
    };

    const scrollToIndex = (index: number) => {
      const y = (index / (STATIONS.length - 1)) * (document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.max(0, y));
      write();
    };

    const focusPlane = (id: string) => {
      const plane = document.getElementById(id);
      const heading = plane?.querySelector("h1, h2");
      if (heading instanceof HTMLElement) heading.focus({ preventScroll: true });
    };

    const onClick = (event: MouseEvent) => {
      const control = (event.target as Element | null)?.closest?.("button[data-replay]");
      if (control instanceof HTMLButtonElement) {
        const flow = control.closest(".flow");
        if (!flow) return;
        const look = control.getAttribute("data-look") ?? "diagram";
        const playing =
          flow.classList.contains("is-drawing") &&
          !flow.classList.contains("is-paused") &&
          !flow.classList.contains("is-done");
        if (playing) {
          flow.classList.add("is-paused");
          control.textContent = "Replay";
          control.setAttribute("aria-label", `Replay the ${look} diagram`);
          return;
        }
        flow.classList.remove("is-drawing", "is-paused", "is-done");
        void (flow as HTMLElement).offsetWidth;
        flow.classList.add("is-drawing");
        control.textContent = "Pause";
        control.setAttribute("aria-label", `Pause the ${look} diagram`);
        return;
      }

      if (!root.classList.contains("spatial") || !cameraIsSticky()) return;
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!link) return;
      const id = link.getAttribute("href")?.slice(1) ?? "";
      const index = STATIONS.indexOf(id as (typeof STATIONS)[number]);
      if (index < 0) return;
      event.preventDefault();
      history.pushState(null, "", `#${id}`);
      scrollToIndex(index);
      focusPlane(id);
    };

    const onFocus = (event: FocusEvent) => {
      if (!root.classList.contains("spatial") || !cameraIsSticky()) return;
      const plane = (event.target as Element | null)?.closest?.(".plane");
      if (!plane) return;
      const index = Number(plane.getAttribute("data-i"));
      if (!Number.isFinite(index)) return;
      const current = Math.round((window.scrollY / maxScroll()) * (STATIONS.length - 1));
      if (current !== index) scrollToIndex(index);
    };

    const onHash = () => {
      if (!root.classList.contains("spatial") || !cameraIsSticky()) return;
      const id = location.hash.slice(1);
      const index = STATIONS.indexOf(id as (typeof STATIONS)[number]);
      if (index >= 0) scrollToIndex(index);
    };

    const onEnd = (event: AnimationEvent) => {
      if (event.animationName !== "draw") return;
      const flow = (event.target as Element | null)?.closest?.(".flow");
      if (!flow) return;
      flow.classList.add("is-done");
      flow.classList.remove("is-paused");
      const button = flow.querySelector("button[data-replay]");
      if (button) {
        const look = button.getAttribute("data-look") ?? "diagram";
        button.textContent = "Replay";
        button.setAttribute("aria-label", `Replay the ${look} diagram`);
      }
    };

    write();
    onHash();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocus);
    window.addEventListener("hashchange", onHash);
    document.addEventListener("animationend", onEnd);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocus);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("animationend", onEnd);
    };
  }, []);

  return (
    <div className="volume">
      <div className="camera">
        <div className="world" ref={world}>
          {children}
        </div>
      </div>
    </div>
  );
}
