import { Header } from "@/components/Header";
import { ProjectCard } from "@/components/ProjectCard";

export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <Header />

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
        {/* Hero */}
        <section aria-labelledby="hero-heading">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
            Berlin
          </p>
          <h1
            id="hero-heading"
            className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50"
          >
            Jakob Alex
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
            I build tools that ground answers in sources and show their work —
            claim, evidence, pass or fail.
          </p>
          <div className="mt-8">
            <a
              href="#work"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Selected work
            </a>
          </div>
        </section>

        {/* Selected work */}
        <section
          id="work"
          aria-labelledby="work-heading"
          className="mt-20 scroll-mt-20 sm:mt-28"
        >
          <h2
            id="work-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
          >
            Selected work
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Grounding tools — tool-using Q&A with visible verify, score the
            loop, run it on a local folder, and index the Markdown underneath.
          </p>

          <div className="mt-6 space-y-4">
            <ProjectCard
              title="CiteBot"
              status="Live"
              featured
              problem="Confident answers can invent. Citation chips alone don’t prove the draft came from the handbook."
              shipped="v2 agent loop: plan → handbook tools → draft → verify. UI shows Steps and Evidence — each claim pass or fail against sources. Live at /ask; scored harness at /harness."
              tradeoff="One handbook, bounded tools. Show the loop instead of a black-box answer."
              stack={["Next.js", "TypeScript", "Gemini", "Vercel"]}
              liveHref="https://citebot-chi.vercel.app/ask"
              liveLabel="Ask →"
              writeupHref="https://citebot-chi.vercel.app/harness"
              writeupLabel="Harness →"
              sourceHref="https://github.com/jakob-alexander2000/citebot"
            />

            <ProjectCard
              title="citebot-evals"
              status="18 of 18 saved answers pass"
              problem="A verify loop without a score is hard to trust — or to re-run."
              shipped="Eighteen fixed handbook cases (grounded and adversarial). One command: npm run eval → fixture Score: 18 of 18 saved answers pass. No API keys."
              tradeoff="Product-bound suite, not a mega-benchmark. Fixture CI only; live path optional."
              stack={["TypeScript", "Node"]}
              writeupHref="https://github.com/jakob-alexander2000/citebot-evals#scorecard-fixture"
              writeupLabel="Scorecard →"
              sourceHref="https://github.com/jakob-alexander2000/citebot-evals"
              sourceLabel="View source"
            />

            <ProjectCard
              title="Desk"
              status="Shipped"
              problem="Grounding in the browser is one thing; notes on disk need the same idea locally."
              shipped="Folder agent: CLI ask/report over Markdown on disk, plus a localhost UI. Same grounding idea as CiteBot, local corpus."
              tradeoff="CLI and localhost over Electron. Useful in minutes beats packaging for a first cut."
              stack={["Node", "TypeScript", "Gemini"]}
              writeupHref="https://github.com/jakob-alexander2000/desk#60-second-run"
              writeupLabel="60s run →"
              sourceHref="https://github.com/jakob-alexander2000/desk"
              sourceLabel="View source"
            />

            <ProjectCard
              title="desk-index"
              status="Shipped"
              problem="Sometimes you only need ranked Markdown hits — no model, no cloud."
              shipped="Go HTTP API and CLI: walk a folder of .md files into an in-memory inverted index. Search returns ranked paths, titles, and snippets. Stdlib only."
              tradeoff="In-memory TF-IDF over a database. Enough for a notes folder; zero deps."
              stack={["Go"]}
              writeupHref="https://github.com/jakob-alexander2000/desk-index#demo"
              writeupLabel="Demo →"
              sourceHref="https://github.com/jakob-alexander2000/desk-index"
              sourceLabel="View source"
            />
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          aria-labelledby="about-heading"
          className="mt-20 scroll-mt-20 sm:mt-28"
        >
          <h2
            id="about-heading"
            className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
          >
            About
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            <p>
              Based in Berlin. Literature background, CS by distance learning
              (finishing early next year). I care about product taste as much as
              the stack — clear scope, readable code, writing that explains the
              tradeoff.
            </p>
            <p>
              Recent work: CiteBot, a scored eval suite, Desk on a local
              folder, and a small Go search API underneath.
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
            GitHub is the best place to reach the work.
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
