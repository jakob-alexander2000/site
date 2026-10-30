import Link from "next/link";
import type { ReactNode } from "react";
import { COLOPHON, GITHUB_PROFILE } from "@/lib/copy";

export type NavCurrent = "instruments" | "about";

export function Shell({
  current,
  children,
}: {
  current?: NavCurrent;
  children: ReactNode;
}) {
  return (
    <>
      <header className="top">
        <Link className="wordmark" href="/">
          Jakob Alex
        </Link>
        <nav aria-label="Pages">
          <Link
            href="/#instruments"
            aria-current={current === "instruments" ? "page" : undefined}
          >
            Instruments
          </Link>
          <Link href="/about" aria-current={current === "about" ? "page" : undefined}>
            About
          </Link>
          <a href={GITHUB_PROFILE}>GitHub</a>
        </nav>
      </header>
      <main id="content">{children}</main>
      <footer className="colophon">
        <p>© 2026 Jakob Alex</p>
        <p>{COLOPHON}</p>
      </footer>
    </>
  );
}
