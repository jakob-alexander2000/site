import Link from "next/link";
import { ContactBlock } from "@/components/ContactBlock";

export default function NotFound() {
  return (
    <main id="main" className="gutter" style={{ paddingTop: 120, paddingBottom: 120, display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 className="display">This page is not on the site.</h1>
      <Link href="/" className="meta link">
        Back to Jakob Alex
      </Link>
      <ContactBlock />
    </main>
  );
}
