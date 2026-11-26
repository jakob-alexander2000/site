import Link from "next/link";
import { Axonometric } from "@/components/Axonometric";
import { ContactBlock } from "@/components/ContactBlock";
import { Header } from "@/components/Header";
import { StatusStrip } from "@/components/StatusStrip";
import { StudioSection } from "@/components/StudioSection";
import { LOG } from "@/lib/log";
import { Flow } from "@/components/Flow";
import { Specimens } from "@/components/Specimens";
import { getReceipts, stampFor } from "@/lib/receipts";
import { HANDOVER, METHOD } from "@/lib/specimens";
import { PERSONA_RECEIPT, PERSONA_VERDICT } from "@/lib/studio";
import { PROJECTS } from "@/lib/work";

export default async function Home() {
  const receipts = await getReceipts();
  const stamps = {
    autopsy: stampFor(receipts, "answer-checker", "handbook-samples"),
    citebot: stampFor(receipts, "answer-checker", "unit"),
    voice: stampFor(receipts, "answer-checker", "unit"),
  };
  return (
    <div className="page">
      <div className="overlay" aria-hidden="true" />
      <StatusStrip />
      <Header current="home" />
      <main id="main">
        <section id="top" className="gutter" style={{ paddingTop: 72 }} aria-labelledby="opening">
          <div className="meta-row rule-heavy">
            <span className="meta">Computer science student</span>
            <span className="meta quiet">Looking for my first AI engineering role</span>
            <span className="meta quiet">Research · Design · Code · Checks</span>
          </div>
          <span className="spec" style={{ marginTop: 16 }}>
            h1 · Archivo 700 · 132 / 116 · −4.5%
          </span>
          <h1 id="opening" className="display" style={{ marginTop: 40, maxWidth: 1300 }}>
            I build AI tools that show their working.
          </h1>
          <div className="hero-body">
            <div className="hero-copy">
              <p className="body">
                Hi, I’m Jakob. I like AI most when you can see why it said what it said. So I research the problem, design
                the screens, write the code, and then try very hard to prove myself wrong.
              </p>
              <div className="actions">
                <a href="#persona" className="btn btn-primary meta">
                  See my best project
                </a>
                <Link href="/playground" className="btn meta">
                  Or the fun stuff
                </Link>
              </div>
            </div>
            <figure className="figure">
              <Axonometric />
              <figcaption className="figcaption meta">
                <span>Fig. 1 · Section through one project</span>
                <a href="#studio" className="link" style={{ minHeight: 24 }}>
                  Pulled apart in Fig. 4
                </a>
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="work" className="section" aria-labelledby="work-title">
          <div className="split rule-heavy">
            <h2 id="work-title" className="headline">
              Work
            </h2>
            <span className="meta quiet">Three projects, one obsession: AI you can check</span>
          </div>
          <div className="index" role="list" aria-label="Projects">
            {PROJECTS.map((project) => (
              <a key={project.id} href={`#${project.id}`} className="index-row" role="listitem">
                <span className="meta">{project.index}</span>
                <span className="index-name">{project.name}</span>
                <span className="meta quiet hide-sm">{project.kind}</span>
                <span className="meta quiet hide-sm">{project.year}</span>
                <span className="meta">{project.status}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="persona" className="section project" aria-labelledby="persona-title" style={{ paddingTop: 144 }}>
          <div className="project-copy">
            <span className="meta quiet">01 · Agent app · 2026</span>
            <h3 id="persona-title" className="display" style={{ fontSize: "clamp(56px, 6vw, 96px)" }}>
              Persona
            </h3>
            <p className="lead">Stop paying the expensive model for jobs the cheap one can do.</p>
            <p>
              Persona lets a cheaper model take over a recurring task only after it passes the same checks as a strong one.
              Every task ends in a receipt: what it tried, what passed, what it cost. A person approves every switch.
            </p>
            <a href="#studio" className="btn btn-primary meta" style={{ alignSelf: "flex-start" }}>
              See how it was made
            </a>
          </div>
          <div className="project-aside">
            <div className="panel mono" role="group" aria-label="A Persona receipt" style={{ maxWidth: 360, marginLeft: "auto" }}>
              <div className="pair">
                <span>receipt</span>
                <span className="quiet">weekly report</span>
              </div>
              <hr className="hr" />
              {PERSONA_RECEIPT.map((row) => (
                <div className="pair" key={row.label}>
                  <span>{row.label}</span>
                  <span className={row.fault ? "fault" : undefined}>{row.value}</span>
                </div>
              ))}
              <hr className="hr hr-ink" />
              <div className="pair" style={{ fontWeight: 500 }}>
                <span>verdict</span>
                <span>{PERSONA_VERDICT}</span>
              </div>
            </div>
          </div>
          <Flow
            steps={HANDOVER}
            label="How a task moves from the strong model to the cheap one"
            fig="Fig. 2"
            caption="How a task changes hands"
          />
        </section>

        <section id="checks" className="section" style={{ paddingTop: 144 }} aria-labelledby="checks-title">
          <div className="split rule-hair" style={{ paddingTop: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <span className="meta quiet">02 · Product · Open source</span>
              <h3 id="checks-title" className="headline">
                answer-checker
              </h3>
            </div>
            <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ margin: 0 }}>
                It checks a document chatbot&apos;s answer against its sources before a user sees it. It catches the
                condition an answer dropped, the claim no source backs, and drift from the house voice. English and
                German, free to self-host. The panels below are recorded runs, and its tests run again every week.
              </p>
              <a href="https://github.com/jakob-alexander2000/answer-checker" className="link meta">
                Source and docs on GitHub →
              </a>
            </div>
          </div>
          <Specimens stamps={stamps} />
        </section>

        <section id="benchmark" className="section" style={{ paddingTop: 144 }} aria-labelledby="benchmark-title">
          <div className="split rule-hair" style={{ paddingTop: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
              <span className="meta quiet">03 · Research · Next</span>
              <h3 id="benchmark-title" className="headline">
                How well do models answer from German documents?
              </h3>
            </div>
            <p style={{ maxWidth: 460 }}>
              An open benchmark on public German policy and handbook pages, scored claim by claim. It looks hardest at one
              thing: conditions an answer quietly drops. Data and results go in the log as I go.
            </p>
          </div>
          <Flow steps={METHOD} label="How the benchmark scores an answer" fig="Fig. 3" caption="The method, before any results" />
        </section>

        <StudioSection />

        <section id="log" className="section" aria-labelledby="log-title">
          <div className="rule-heavy" style={{ display: "flex", flexWrap: "wrap", gap: 48 }}>
            <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 id="log-title" className="headline">
                Log
              </h2>
              <p className="quiet" style={{ fontSize: 16, maxWidth: 240 }}>
                What I shipped, learned and noticed, dated.
              </p>
            </div>
            <ol style={{ flex: "1 1 560px", minWidth: 0, listStyle: "none", margin: 0, padding: 0 }}>
              {LOG.map((entry) => (
                <li key={`${entry.date}-${entry.title}`} className="log-row">
                  <time className="mono quiet" dateTime={entry.date}>
                    {entry.date}
                  </time>
                  <span className="meta">{entry.kind}</span>
                  <span className="log-title">{entry.href ? <a href={entry.href} className="link">{entry.title}</a> : entry.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className="section" aria-labelledby="about-title">
          <div className="rule-heavy" style={{ display: "flex", flexWrap: "wrap", gap: 48 }}>
            <h2 id="about-title" className="headline" style={{ flex: "0 0 260px" }}>
              About
            </h2>
            <div style={{ flex: "1 1 420px", minWidth: 0, maxWidth: 560, display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ fontSize: 20, lineHeight: "30px" }}>
                I came into software through a coding bootcamp and am finishing a distance-learning degree in computer
                science. I’m happiest when a system has to earn the trust of someone who didn’t build it.
              </p>
              <p>
                When I’m not doing that, I build odd little tools for myself. Some of them end up in the{" "}
                <Link href="/playground">playground</Link>.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="section" aria-labelledby="contact-title">
          <div className="split rule-heavy" style={{ alignItems: "flex-end" }}>
            <h2 id="contact-title" className="display" style={{ fontSize: "clamp(36px, 4.6vw, 72px)", maxWidth: 900 }}>
              Got a problem where the AI has to be right? I’d like to hear about it.
            </h2>
            <ContactBlock />
          </div>
          <div className="footer-links">
            <Link href="/playground" className="meta link">
              Playground
            </Link>
            <a href="https://github.com/jakob-alexander2000/site" className="meta link quiet">
              Source of this site
            </a>
          </div>
        </section>
      </main>
      <p className="wordmark giant" aria-hidden="true">
        Jakob Alex
      </p>
    </div>
  );
}
