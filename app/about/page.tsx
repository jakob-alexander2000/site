import Link from "next/link";
import { Shell } from "@/components/Shell";
import { EYE, GITHUB_PROFILE } from "@/lib/copy";

export default function AboutPage() {
  return (
    <Shell current="about">
      <section className="hero about" aria-labelledby="about-label">
        <p className="kicker">About</p>
        <h1 id="about-label">Jakob Alex</h1>
        <p className="lead">{EYE}</p>
        <p className="eye">
          He reads an answer the way he reads a page: sentence by sentence, against the
          passage it came from. The instruments on the front page each do one thing, and
          each one can be tried there.
        </p>
        <p className="contact">
          <a href={GITHUB_PROFILE}>github.com/jakob-alexander2000</a>
        </p>
        <p>
          <Link href="/#instruments">Instruments</Link>
        </p>
      </section>
    </Shell>
  );
}
