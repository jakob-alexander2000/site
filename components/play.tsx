"use client";

import { useEffect, useRef, type ReactNode } from "react";

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Replay one explanatory sequence. Does nothing visual when motion is reduced. */
export function playStage(id: string) {
  const stage = document.getElementById(id);
  if (!stage) return;
  stage.dataset.played = "true";
  if (!reducedMotion()) {
    stage.classList.remove("is-playing");
    void stage.offsetWidth;
    stage.classList.add("is-playing");
  }
  stage.scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
    block: "nearest",
  });
}

export function TryButton({
  targetId,
  name,
}: {
  targetId: string;
  name: string;
}) {
  return (
    <button type="button" className="try" onClick={() => playStage(targetId)}>
      Try it
      <span>{name}</span>
    </button>
  );
}

/** Plays once when the visitor scrolls the block into view. Never on load. */
export function ScrollPlay({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion()) return;

    let scrolled = false;
    const onScroll = () => {
      scrolled = true;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || !scrolled || node.dataset.played === "true") {
          return;
        }
        node.dataset.played = "true";
        node.classList.add("is-playing");
        observer.disconnect();
      },
      { threshold: 0.4 },
    );

    window.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(node);
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={ref} id={id} className="play-root">
      {children}
    </div>
  );
}
