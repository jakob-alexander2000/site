"use client";

const ROWS = [
  {
    id: "citebot",
    name: "CiteBot",
    proof: "2 pass, 1 fail",
    live: "https://citebot-chi.vercel.app/ask",
  },
  {
    id: "citebot-evals",
    name: "citebot-evals",
    proof: "18/18",
    live: "https://github.com/jakob-alexander2000/citebot-evals",
  },
  {
    id: "desk",
    name: "Desk",
    proof: "Cited note",
    live: "https://github.com/jakob-alexander2000/desk",
  },
  {
    id: "desk-index",
    name: "desk-index",
    proof: "Ranked notes",
    live: "https://github.com/jakob-alexander2000/desk-index",
  },
] as const;

export function SelectedIndex() {
  function onTry(id: string) {
    const card = document.getElementById(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    card?.querySelector<HTMLButtonElement>("[data-try]")?.click();
  }

  return (
    <ul className="try-list">
      {ROWS.map((row) => (
        <li className="try-row" key={row.id}>
          <span className="try-name">{row.name}</span>
          <span className="try-proof">{row.proof}</span>
          <button type="button" className="press" onClick={() => onTry(row.id)}>
            Try it
          </button>
          <a href={row.live} target="_blank" rel="noreferrer">
            Live
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
