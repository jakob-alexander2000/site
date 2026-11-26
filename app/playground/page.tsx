import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { StatusStrip } from "@/components/StatusStrip";

export const metadata: Metadata = {
  title: "Playground · Jakob Alex",
  description: "Things I build because I want them to exist.",
  alternates: { canonical: "/playground" },
};

const FADERS = [48, 28, 88, 120] as const;

export default function Playground() {
  return (
    <div className="page">
      <div className="overlay" aria-hidden="true" />
      <StatusStrip />
      <Header current="playground" />
      <main id="main">
        <section id="top" className="gutter" style={{ paddingTop: 72 }} aria-labelledby="playground-title">
          <div className="split rule-heavy" style={{ alignItems: "flex-start" }}>
            <h1 id="playground-title" className="display" style={{ fontSize: "clamp(52px, 7vw, 112px)" }}>
              Playground
            </h1>
            <p className="body" style={{ maxWidth: 420 }}>
              Things I build because I want them to exist. No roadmap, no metrics, just stuff I use.
            </p>
          </div>
        </section>

        <section id="vierspur" className="section" style={{ paddingTop: 120 }} aria-labelledby="vierspur-title">
          <div className="meta-row rule-hair">
            <span className="meta">01</span>
            <span className="meta quiet">Browser · iPhone · iPad</span>
            <span className="meta quiet">2026</span>
            <span className="meta">In device testing</span>
          </div>
          <p className="wordmark" aria-hidden="true" style={{ margin: "32px 0 0 -0.04em", fontSize: "15vw", lineHeight: 0.8, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
            Vierspur
          </p>
          <div className="project" style={{ marginTop: 56 }}>
            <div className="project-copy" style={{ gap: 20 }}>
              <h2 id="vierspur-title" className="headline">
                Vierspur
              </h2>
              <p className="lead">A four-track tape recorder in your pocket.</p>
              <p>
                Four tracks, overdub, a click, and nothing else to fiddle with. The hard part was timing: every overdub is
                shifted by the device’s own latency, so takes land on the beat instead of just after it.
              </p>
            </div>
            <figure
              className="figure"
              aria-label="Plan drawing of four channel strips, track two armed"
              style={{ flex: "1 1 520px" }}
            >
              <div className="channel-strips" aria-hidden="true">
                {FADERS.map((top, index) => (
                  <div key={index} className={`strip${index === 1 ? " armed" : ""}`}>
                    <span className="meta">{index + 1}</span>
                    <div className="fader">
                      <span style={{ top }} />
                    </div>
                    <span className="arm" />
                  </div>
                ))}
              </div>
              <figcaption className="figcaption meta">
                <span>Fig. 1 · Four channels, track 2 armed</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <footer className="section" style={{ paddingBottom: 48 }}>
          <div className="split rule-hair">
            <Link href="/" className="meta link">
              ← Back to the work
            </Link>
            <Link href="/#contact" className="meta link">
              Say hello
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
