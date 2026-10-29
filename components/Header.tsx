import Link from "next/link";
import { GITHUB } from "@/lib/copy";

export function Header({ current }: { current?: "work" | "about" }) {
  return (
    <header className="top">
      <div className="frame top-inner">
        <Link href="/" className="wordmark">
          Jakob Alex
        </Link>
        <nav aria-label="Page">
          <Link href="/#work" aria-current={current === "work" ? "page" : undefined}>
            Work
          </Link>
          <Link href="/about" aria-current={current === "about" ? "page" : undefined}>
            About
          </Link>
          <a href={GITHUB}>GitHub</a>
        </nav>
      </div>
    </header>
  );
}
