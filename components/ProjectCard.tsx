import type { ReactNode } from "react";

type Props = {
  title: string;
  status?: string;
  problem: string;
  shipped: string;
  tradeoff?: string;
  stack: string[];
  liveHref?: string;
  sourceHref?: string;
  featured?: boolean;
  placeholder?: boolean;
  children?: ReactNode;
};

export function ProjectCard({
  title,
  status,
  problem,
  shipped,
  tradeoff,
  stack,
  liveHref,
  sourceHref,
  featured,
  placeholder,
}: Props) {
  return (
    <article
      className={
        placeholder
          ? "rounded-2xl border border-dashed border-zinc-300/90 bg-transparent p-6 sm:p-7 dark:border-zinc-700/80"
          : featured
            ? "rounded-2xl border border-zinc-900/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:p-7 dark:border-zinc-700 dark:bg-zinc-900/60 dark:shadow-none"
            : "rounded-2xl border border-zinc-200/90 bg-white/60 p-6 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900/40"
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3
          className={
            placeholder
              ? "font-serif text-2xl tracking-tight text-zinc-400 dark:text-zinc-500"
              : "font-serif text-2xl tracking-tight text-zinc-900 dark:text-zinc-50"
          }
        >
          {title}
        </h3>
        {status ? (
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {status}
          </span>
        ) : null}
      </div>

      <dl className="mt-5 space-y-3 text-sm leading-relaxed">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Problem
          </dt>
          <dd
            className={
              placeholder
                ? "mt-1 text-zinc-400 dark:text-zinc-500"
                : "mt-1 text-zinc-600 dark:text-zinc-300"
            }
          >
            {problem}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            Shipped
          </dt>
          <dd
            className={
              placeholder
                ? "mt-1 text-zinc-400 dark:text-zinc-500"
                : "mt-1 text-zinc-600 dark:text-zinc-300"
            }
          >
            {shipped}
          </dd>
        </div>
        {tradeoff ? (
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              Tradeoff
            </dt>
            <dd className="mt-1 text-zinc-600 dark:text-zinc-300">{tradeoff}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {stack.map((chip) => (
          <span
            key={chip}
            className={
              placeholder
                ? "rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-500"
                : "rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            }
          >
            {chip}
          </span>
        ))}
      </div>

      {(liveHref || sourceHref) && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {liveHref ? (
            <a
              href={liveHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Live demo
            </a>
          ) : null}
          {sourceHref ? (
            <a
              href={sourceHref}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Source →
            </a>
          ) : null}
        </div>
      )}
    </article>
  );
}
