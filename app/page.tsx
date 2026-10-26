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
            Berlin · Builder
          </p>
          <h1
            id="hero-heading"
            className="mt-4 font-serif text-4xl leading-[1.1] tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50"
          >
            Jakob Alex
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-300">
            If it&apos;s on this site, it runs or it isn&apos;t here.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            I ship small, sharp products — live demos, real citations, the
            boring product decisions that make LLM tools usable. CS distance
            learning, graduating early next year.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="https://citebot-chi.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Try CiteBot
            </a>
            <a
              href="https://github.com/jakob-alexander2000/citebot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:text-zinc-50"
            >
              CiteBot source
            </a>
          </div>
        </section>

        {/* Selected work */}
        <section
          id="work"
          aria-labelledby="work-heading"
          className="mt-20 scroll-mt-20 sm:mt-28"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="work-heading"
              className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
            >
              Selected work
            </h2>
            <p className="text-xs text-zinc-400">Proof over pitch</p>
          </div>

          <div className="mt-6 space-y-4">
            <ProjectCard
              title="CiteBot"
              status="Live"
              featured
              problem="Company handbooks and policy docs are hard to search. Generic chatbots invent answers."
              shipped="RAG Q&A over a sample employee handbook with numbered citation chips, a handbook browser, and a public demo — no multi-tenant billing, one corpus, one tool loop."
              tradeoff="Gemini Flash + embeddings over a heavier agent stack. Citations and a readable corpus beat framework demos."
              stack={[
                "Next.js",
                "TypeScript",
                "Gemini",
                "RAG",
                "Tailwind",
                "Vercel",
              ]}
              liveHref="https://citebot-chi.vercel.app"
              sourceHref="https://github.com/jakob-alexander2000/citebot"
            />

            <ProjectCard
              title="Desk"
              status="Next"
              placeholder
              problem="Product / FDE roles want a real CRUD slice — auth, list/detail, seed data — not another chat UI."
              shipped="Placeholder. Week-2 internal tool metaphor (pipeline or deal notes)."
              stack={["React", "TypeScript", "Auth", "CRUD"]}
            />

            <ProjectCard
              title="Ingest"
              status="Later"
              placeholder
              problem="Backend stretch roles want a small service with tests and a container, not another SPA."
              shipped="Placeholder. Only if week 1 finishes early — Go HTTP + Docker."
              stack={["Go", "HTTP", "Docker"]}
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
              building products; currently finishing a CS degree by distance
              learning (graduation early next year).
            </p>
            <p>
              Lately: agentic / LLM systems, demos you can click, and the
              boring decisions that make them usable. I scope ruthlessly, ship
              weekly when I can, and write for the next engineer — not the pitch
              deck version.
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
