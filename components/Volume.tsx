"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function Volume({ children }: { children: ReactNode }) {
  const world = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const node = world.current;
    if (!node) return;
    let frame = 0;
    let fromPointer = false;

    const place = () => {
      root.classList.toggle("flat", window.innerHeight < 520);
    };

    const write = () => {
      place();
      frame = 0;
      const planes = [...document.querySelectorAll<HTMLElement>(".plane")];
      if (!root.classList.contains("spatial") || root.classList.contains("flat")) {
        for (const plane of planes) {
          plane.style.removeProperty("--depth");
          plane.classList.remove("is-front");
        }
        return;
      }
      const anchor = window.innerHeight * 0.42;
      let active = 0;
      const layoutTop = (plane: HTMLElement) => {
        let y = 0;
        let node: HTMLElement | null = plane;
        while (node) {
          y += node.offsetTop;
          node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
        }
        return y - window.scrollY;
      };
      planes.forEach((plane, index) => {
        if (layoutTop(plane) <= anchor) active = index;
      });
      const focused = document.activeElement;
      const focusedPlane = focused instanceof Element ? focused.closest(".plane") : null;
      if (focusedPlane instanceof HTMLElement) {
        const index = planes.indexOf(focusedPlane);
        if (index > active) active = index;
      }
      planes.forEach((plane, index) => {
        const depth = index - active;
        plane.style.setProperty("--depth", String(depth > 0 ? 1 : 0));
        plane.classList.toggle("is-front", depth === 0);
      });
    };

    const schedule = () => {
      if (document.hidden) return;
      if (!frame) frame = requestAnimationFrame(write);
    };

    const alignHash = () => {
      const id = location.hash.replace(/^#/, "");
      if (!id) return;
      const target = document.getElementById(id);
      if (!(target instanceof HTMLElement)) return;
      let y = 0;
      let node: HTMLElement | null = target;
      while (node) {
        y += node.offsetTop;
        node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
      }
      window.scrollTo(0, Math.max(0, y - 8));
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
      }
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

    const onFocus = (event: FocusEvent) => {
      const pointer = fromPointer;
      fromPointer = false;
      write();
      const current = event.target;
      if (!(current instanceof HTMLElement) || pointer) return;
      requestAnimationFrame(() => {
        const rect = current.getBoundingClientRect();
        const clipped =
          rect.height < 1 ||
          rect.top < 0 ||
          rect.bottom > window.innerHeight ||
          rect.left < 0 ||
          rect.right > window.innerWidth;
        if (clipped) current.scrollIntoView({ block: "center", inline: "nearest" });
      });
    };

    const onHash = () => {
      write();
      alignHash();
      requestAnimationFrame(() => {
        alignHash();
        write();
      });
    };

    write();
    onHash();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("hashchange", onHash);
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    const onPointer = () => {
      fromPointer = true;
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("animationend", onEnd);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("visibilitychange", schedule);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocus);
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
