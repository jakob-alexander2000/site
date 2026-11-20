import Link from "next/link";
import { ContactBlock } from "@/components/ContactBlock";

export default function NotFound() {
  return (
    <main id="top" className="missing">
      <h1>This page is not on the site.</h1>
      <p>
        <Link href="/">Jakob Alex</Link>
      </p>
      <ContactBlock />
    </main>
  );
}
