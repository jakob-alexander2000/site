import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { COLOPHON, GITHUB, READING } from "@/lib/copy";

export const metadata: Metadata = {
  title: "About · Jakob Alex",
  description:
    "Berlin. Comparative literature, software taught by doing, and tools that show their sources.",
};

export default function AboutPage() {
  return (
    <Shell current="about">
      <section className="reading frame" aria-labelledby="about-title">
        <p className="kicker">Berlin</p>
        <h1 id="about-title">About</h1>
        <p className="lede">{READING}</p>
        <p className="problem">
          The work is CiteBot, citebot-evals, Desk, and desk-index. Each one
          is on the home page, and each one can be tried there.
        </p>
        <p className="links">
          <a href={GITHUB}>github.com/jakob-alexander2000</a>
        </p>
        <p className="made">{COLOPHON}</p>
      </section>
    </Shell>
  );
}
