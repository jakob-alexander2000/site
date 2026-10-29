import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function Shell({
  current,
  children,
}: {
  current?: "work" | "about";
  children: ReactNode;
}) {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Header current={current} />
      <main id="content">{children}</main>
      <Footer />
    </>
  );
}
