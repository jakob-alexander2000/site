import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell>
      <section className="hero" aria-labelledby="missing-label">
        <p className="kicker">Missing</p>
        <h1 id="missing-label">This page is not on the site.</h1>
        <p>
          <Link href="/">Instruments</Link>
        </p>
      </section>
    </Shell>
  );
}
