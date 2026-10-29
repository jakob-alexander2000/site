import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell>
      <section className="reading frame">
        <h1>This page is not on the site.</h1>
        <p className="links">
          <Link href="/">Back home</Link>
        </p>
      </section>
    </Shell>
  );
}
