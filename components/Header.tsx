import Link from "next/link";

type Current = "home" | "playground";

export function Header({ current }: { current: Current }) {
  return (
    <header className="header gutter">
      <Link href="/" className="wordmark link" style={{ fontSize: 15, textDecoration: "none" }}>
        Jakob Alex
      </Link>
      <nav aria-label="Main">
        <Link href="/#work" className="meta link">
          Work
        </Link>
        <Link href="/#studio" className="meta link">
          Studio
        </Link>
        <Link href="/playground" className="meta link" aria-current={current === "playground" ? "page" : undefined}>
          Playground
        </Link>
        <Link href="/#about" className="meta link">
          About
        </Link>
        <Link href="/#contact" className="meta btn btn-primary">
          Say hello
        </Link>
      </nav>
    </header>
  );
}
