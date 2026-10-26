import { Header } from "@/components/Header";
import { ProjectCard } from "@/components/ProjectCard";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Header />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        {/* Hero — verify loop first */}
        <section aria-labelledby="hero-heading">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            Berlin · Frontier applied AI
          </p>
          <h1
            id="hero-heading"
            className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50"
          >
            Jakob Alex
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
            An agent that verifies its own work. Claim → evidence → pass/fail —
            then a scored eval suite and a local folder tool beside it.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Building toward frontier applied / product AI roles. CS distance
            learning, graduating early next year. Humanities edge: taste +
            writing.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="https://citebot-chi.vercel.app/harness#grounded"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              See the verify loop
            </a>
            <a
              href="#work"
              className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
            >
              Hire arc ↓
            </a>
          </div>
        </section>

        {/* Selected work — one scroll: verify → evals → Desk */}
        <section
          id="work"
          aria-labelledby="work-heading"
          className="mt-20 scroll-mt-20 sm:mt-28"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="work-heading"
              className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
            >
              Hire arc
            </h2>
            <p className="font-mono text-[11px] text-zinc-400">
              verify → evals → local
            </p>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            One story a hiring manager can finish in under three minutes.
            CiteBot proves the loop; evals score it; Desk takes the same idea
            onto your machine.
          </p>

          <div className="mt-6 space-y-4">
            <ProjectCard
              title="CiteBot + verify harness"
              status="Live"
              featured
              problem="LLM answers look confident even when they invent. Citation chips alone don’t prove the prose survived contact with the evidence."
              shipped="RAG Q&A over a sample handbook, then a shared verify step that scores each claim pass / fail / unsupported and shows the evidence. Annotated grounded / mixed / trick examples on the writeup."
              tradeoff="One corpus, one verify path, Gemini Flash — not a multi-agent framework demo. Visible verification beats orchestration theater."
              stack={[
                "Next.js",
                "TypeScript",
                "Gemini",
                "RAG",
                "Verify harness",
                "Vercel",
              ]}
              liveHref="https://citebot-chi.vercel.app"
              liveLabel="Live demo"
              writeupHref="https://citebot-chi.vercel.app/harness#grounded"
              writeupLabel="Annotated examples →"
              sourceHref="https://github.com/jakob-alexander2000/citebot"
            />

            <ProjectCard
              title="citebot-evals"
              status="18/18"
              problem="A verify harness without a score is a vibe. Labs want a cloneable pass/fail table that backs the CiteBot story."
              shipped="18 fixed handbook cases (12 grounded + 6 adversarial). One command: npm run eval → fixture Score: 18/18. No API keys."
              tradeoff="Product-bound suite over mega-benchmarks. Fixture CI only — live CiteBot path is optional, never a flaky gate."
              stack={[
                "TypeScript",
                "Node",
                "Fixture scorecard",
                "CiteBot verify",
              ]}
              writeupHref="https://github.com/jakob-alexander2000/citebot-evals#scorecard-fixture"
              writeupLabel="Scorecard →"
              sourceHref="https://github.com/jakob-alexander2000/citebot-evals"
              sourceLabel="View source"
            />

            <ProjectCard
              title="Desk"
              status="Shipped"
              problem="Cloud RAG proves grounding in a browser. Product / desktop AI roles also want the corpus on your machine — ask a folder, get cited answers, write a report back."
              shipped="Local-first folder agent: CLI ask/report over notes on disk, plus a localhost UI on 127.0.0.1. Same grounding idea as CiteBot, local corpus. No Electron packaging."
              tradeoff="CLI + localhost UI over a packaged desktop app. Useful in five minutes beats installers and auto-update for a portfolio bet."
              stack={[
                "Node",
                "TypeScript",
                "Gemini",
                "Local RAG",
                "CLI",
              ]}
              writeupHref="https://github.com/jakob-alexander2000/desk#60-second-run"
              writeupLabel="60s run →"
              sourceHref="https://github.com/jakob-alexander2000/desk"
              sourceLabel="View source"
            />
          </div>
        </section>

        {/* About / How I work */}
        <section
          id="about"
          aria-labelledby="about-heading"
          className="mt-20 scroll-mt-20 sm:mt-28"
        >
          <h2
            id="about-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
          >
            How I work
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            <p>
              Based in Berlin. Background in literature, training in CS — I care
              about product taste as much as the stack. Coding bootcamp, then
              building products; finishing a CS degree by distance learning
              (graduation early next year).
            </p>
            <p>
              Focus: applied product / agent systems — verify loops, narrow
              evals, local tools. I scope ruthlessly, ship weekly when I can,
              and write for the next engineer — not the pitch-deck version.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="mt-20 scroll-mt-20 border-t border-zinc-200/80 pt-10 sm:mt-28 dark:border-zinc-800/80"
        >
          <h2
            id="contact-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
          >
            Contact
          </h2>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
            GitHub is the best place to reach the work. Email and LinkedIn
            soon.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <a
              href="https://github.com/jakob-alexander2000"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
            >
              github.com/jakob-alexander2000
            </a>
          </div>
        </section>
      </div>

      <footer className="border-t border-zinc-200/80 py-6 dark:border-zinc-800/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 text-xs text-zinc-400 sm:px-6">
          <span>© 2026 Jakob Alex</span>
          <span className="font-mono">Berlin</span>
        </div>
      </footer>
    </main>
  );
}
