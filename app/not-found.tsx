import Link from "next/link";

export default function NotFound() {
  return (
    <main id="top" className="screen">
      <h1>This page is not on the site.</h1>
      <p>
        <Link href="/">Jakob Alex</Link>
      </p>
      <p>
        <a href="mailto:jdevacc2000@gmail.com">Email</a>
      </p>
    </main>
  );
}
