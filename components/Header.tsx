import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-[var(--background)]/85 backdrop-blur-md dark:border-zinc-800/80">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Jakob Alex
        </Link>
        <nav className="flex items-center gap-5">
          <a
            href="#work"
            className="text-xs text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Work
          </a>
          <a
            href="#about"
            className="text-xs text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            About
          </a>
          <a
            href="https://github.com/jakob-alexander2000"
            className="text-xs text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
