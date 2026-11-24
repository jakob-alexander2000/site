import type { Metadata } from "next";
import Link from "next/link";
import { ContactBlock } from "@/components/ContactBlock";
import { Flow } from "@/components/Flow";
import { Header } from "@/components/Header";
import { StatusStrip } from "@/components/StatusStrip";
import { BENCH, BENCH_URL, cell, REPO_URL, RESULTS_URL, SAMPLE, SAMPLE_REPORT } from "@/lib/answer-checker";

export const metadata: Metadata = {
  title: "answer-checker · Jakob Alex",
  description:
    "Checks a document chatbot's answers against its sources, offline, in English and German. Open source, with measured results and a sample audit.",
};

const CHECKS = [
  { name: "Support", line: "Every sentence is in a retrieved passage, and doesn't say its opposite." },
  { name: "Scope", line: "The answer doesn't widen who a rule is for." },
  { name: "Qualifier", line: "Numbers, deadlines and limits match the source, and none are made up." },
  { name: "Omission", line: "No condition or exception the source attaches to the rule is dropped." },
] as const;

const AUDIT = [
  { step: "Your log", line: "Questions, answers and the passages each answer came from, as JSON lines." },
  { step: "Checker", line: "Runs all four checks on every answer and flags the ones that fail." },
  { step: "Review", line: "I read every flag and confirm it or dismiss it as a false alarm." },
  { step: "Spot check", line: "I read a sample of the answers that passed and add what the checker missed." },
  { step: "Report", line: "Findings with the source text marked, and a fix list ordered by severity." },
] as const;

export default function AnswerChecker() {
  return (
    <div className="page">
      <div className="overlay" aria-hidden="true" />
      <StatusStrip />
      <Header current="answer-checker" />
      <main id="main">
        <section id="top" className="gutter" style={{ paddingTop: 72 }} aria-labelledby="product-title">
          <div className="meta-row rule-heavy">
            <span className="meta">Product</span>
            <span className="meta quiet">Open source · MIT</span>
            <span className="meta quiet">English · German</span>
            <span className="meta quiet">Engine 0.2</span>
          </div>
          <h1 id="product-title" className="display" style={{ marginTop: 40, fontSize: "clamp(52px, 7vw, 112px)" }}>
            answer-checker
          </h1>
          <div className="split" style={{ marginTop: 40, alignItems: "flex-start" }}>
            <p className="lead" style={{ maxWidth: 620, margin: 0 }}>
              It checks a document chatbot&apos;s answers against the passages they came from, before a user reads
              them. No language model, no network, the same result every time.
            </p>
            <div className="actions">
              <a href={REPO_URL} className="btn btn-primary" style={{ fontWeight: 500 }}>
                Source and docs
              </a>
              <a href={SAMPLE_REPORT} className="btn" style={{ fontWeight: 500 }}>
                Sample audit
              </a>
            </div>
          </div>
        </section>

        <section id="checks" className="section" style={{ paddingTop: 144 }} aria-labelledby="checks-title">
          <div className="split rule-hair" style={{ paddingTop: 24, alignItems: "flex-start" }}>
            <h2 id="checks-title" className="headline" style={{ flex: "0 0 260px" }}>
              Four checks
            </h2>
            <ol style={{ flex: "1 1 560px", minWidth: 0, listStyle: "none", margin: 0, padding: 0 }}>
              {CHECKS.map((check, index) => (
                <li key={check.name} className="check-row" style={{ display: "grid", gridTemplateColumns: "minmax(120px, 200px) minmax(0, 1fr)" }}>
                  <span className="meta">
                    <span className="quiet">{String(index + 1).padStart(2, "0")}</span> {check.name}
                  </span>
                  <span>{check.line}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="measured" className="section" style={{ paddingTop: 144 }} aria-labelledby="measured-title">
          <div className="split rule-hair" style={{ paddingTop: 24, alignItems: "flex-start" }}>
            <div style={{ flex: "0 0 260px", display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 id="measured-title" className="headline">
                Measured
              </h2>
              <p className="quiet" style={{ fontSize: 16, margin: 0 }}>
                70 questions from seven German employment laws. Each has a faithful answer, a correct paraphrase and a
                wrong one.
              </p>
            </div>
            <div style={{ flex: "1 1 560px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="bench-scroll">
                <table className="bench mono">
                  <caption className="meta quiet">de-arbeitsrecht · engine 0.2 against 0.1</caption>
                  <thead>
                    <tr>
                      <th scope="col">Measure</th>
                      <th scope="col">Held-out, 26</th>
                      <th scope="col">All 70</th>
                      <th scope="col">All 70, engine 0.1</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BENCH.map((row) => (
                      <tr key={row.measure}>
                        <th scope="row">{row.measure}</th>
                        <td>{cell(row.heldOut)}</td>
                        <td>{cell(row.all)}</td>
                        <td className="quiet">{cell(row.before)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ margin: 0, maxWidth: 620 }}>
                I tuned the checker on 44 of the questions. The other 26 were written first and only scored at the end,
                so the held-out column is the fair one. On it, a flag is right about half the time. That is why an
                audit has a person read every flag.
              </p>
              <p className="quiet" style={{ margin: 0, maxWidth: 620 }}>
                Where it still fails: a wrong answer that only swaps one verb, a paraphrase in new words, and a range
                matched against one number inside it.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0 32px" }}>
                <a href={RESULTS_URL} className="link meta">
                  Full results →
                </a>
                <a href={BENCH_URL} className="link meta">
                  The questions →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="audit" className="section" style={{ paddingTop: 144 }} aria-labelledby="audit-title">
          <div className="split rule-hair" style={{ paddingTop: 24, alignItems: "flex-start" }}>
            <h2 id="audit-title" className="headline" style={{ flex: "0 0 260px" }}>
              Audit
            </h2>
            <div style={{ flex: "1 1 560px", minWidth: 0, maxWidth: 620, display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ margin: 0 }}>
                The checker is free to run yourself. The audit is the part a tool can&apos;t do alone: I run it over your
                chatbot&apos;s real answers, read every flag, and hand back a report in German or English that says what
                to change.
              </p>
            </div>
          </div>
          <Flow steps={AUDIT} label="How an audit runs" fig="Fig. 1" caption="From your log to a fix list" />
          <div className="split" style={{ marginTop: 48, alignItems: "flex-start" }}>
            <div className="panel mono" role="group" aria-label="The sample audit" style={{ flex: "0 1 360px" }}>
              <div className="pair">
                <span>sample audit</span>
                <span className="quiet">German</span>
              </div>
              <hr className="hr" />
              <div className="pair">
                <span>answers checked</span>
                <span>{SAMPLE.answers}</span>
              </div>
              <div className="pair">
                <span>flagged</span>
                <span>{SAMPLE.flagged}</span>
              </div>
              <div className="pair">
                <span>confirmed</span>
                <span>{SAMPLE.confirmed}</span>
              </div>
              <div className="pair">
                <span>dismissed</span>
                <span>{SAMPLE.dismissed}</span>
              </div>
              <hr className="hr hr-ink" />
              <a href={SAMPLE_REPORT} className="link" style={{ fontWeight: 500 }}>
                Open the report →
              </a>
            </div>
            <p className="quiet" style={{ flex: "1 1 360px", maxWidth: 460, margin: 0 }}>
              The sample is built from the test set, not from a client. The answer key stands in for my review, and
              because most of its questions were used for tuning, it scores better than a real chatbot would.
            </p>
          </div>
        </section>

        <section id="contact" className="section" aria-labelledby="contact-title">
          <div className="split rule-heavy" style={{ alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
              <h2 id="contact-title" className="display" style={{ fontSize: "clamp(36px, 4.6vw, 72px)" }}>
                Get in touch
              </h2>
              <p style={{ margin: 0, maxWidth: 560 }}>
                If your chatbot answers from documents and has to get them right, write to me with what it answers
                from and who reads the answers. I&apos;ll tell you whether an audit makes sense.
              </p>
            </div>
            <ContactBlock />
          </div>
          <div className="footer-links">
            <Link href="/" className="meta link">
              Home
            </Link>
            <Link href="/playground" className="meta link quiet">
              Playground
            </Link>
          </div>
        </section>
      </main>
      <p className="wordmark giant" aria-hidden="true">
        Jakob Alex
      </p>
    </div>
  );
}
