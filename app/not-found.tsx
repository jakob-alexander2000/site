import { RunningHead } from "@/components/RunningHead";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <a className="skip" href="#missing">
        Skip to content
      </a>
      <RunningHead />
      <main id="missing" className="sheet">
        <section className="opening">
          <h1>This page is not on the site.</h1>
          <p className="sentence follow">
            <Link href="/">Back to the first page.</Link>
          </p>
        </section>
      </main>
    </>
  );
}
