"use client";

import { useEffect } from "react";

/** Scroll an in-page target so its heading sits near the top, after the 240vh hero has settled. */
function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const heading = el.matches("h1, h2, h3") ? el : (el.querySelector("h1, h2, h3") ?? el);
  const top = heading.getBoundingClientRect().top + window.scrollY - 16;
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}

export function ScrollToHash() {
  useEffect(() => {
    const go = (id: string) => {
      jump(id);
      window.requestAnimationFrame(() => {
        jump(id);
        window.setTimeout(() => jump(id), 50);
      });
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (
        !(link instanceof HTMLAnchorElement) ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const id = decodeURIComponent(link.hash.replace("#", ""));
      if (!id || !document.getElementById(id)) return;
      event.preventDefault();
      history.pushState(null, "", `#${id}`);
      go(id);
    };
    const onHash = () => {
      const id = decodeURIComponent(location.hash.replace("#", ""));
      if (id) go(id);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
  return null;
}
