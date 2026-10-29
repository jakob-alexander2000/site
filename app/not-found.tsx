import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function NotFound() {
  return (
    <Shell>
      <section className="band grid rule" aria-labelledby="missing-label">
        <h1 id="missing-label" className="lab">
          Not found
        </h1>
        <div className="main">
          <p className="big">This page is not on the site.</p>
          <div className="links">
            <Link href="/">Work</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
