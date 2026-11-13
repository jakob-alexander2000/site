"use client";

export function RunLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        const root = document.querySelector(".schnitt");
        if (!(root instanceof HTMLElement) || document.documentElement.dataset.schnitt !== "gl") return;
        event.preventDefault();
        const start = root.getBoundingClientRect().top + window.scrollY;
        const range = root.clientHeight - window.innerHeight;
        window.scrollTo({ top: start + Math.max(0, range) * 0.62, behavior: "auto" });
      }}
    >
      {children}
    </a>
  );
}
