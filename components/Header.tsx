import Link from "next/link";
import { GITHUB_PROFILE } from "@/lib/copy";

export type NavCurrent = "work" | "about";

export function Header({ current }: { current?: NavCurrent }) {
  return (
    <header className="top">
      <Link className="wordmark" href="/">
        Jakob Alex
      </Link>
      <nav aria-label="Pages">
        <Link
          href="/"
          aria-current={current === "work" ? "page" : undefined}
          className={current === "work" ? "on" : undefined}
        >
          Work
        </Link>
        <Link
          href="/about"
          aria-current={current === "about" ? "page" : undefined}
          className={current === "about" ? "on" : undefined}
        >
          About
        </Link>
        <a href={GITHUB_PROFILE}>GitHub</a>
      </nav>
    </header>
  );
}
