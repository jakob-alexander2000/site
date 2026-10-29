import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header, type NavCurrent } from "@/components/Header";

export function Shell({
  current,
  children,
}: {
  current?: NavCurrent;
  children: ReactNode;
}) {
  return (
    <div className="wrap">
      <Header current={current} />
      <main id="content">{children}</main>
      <Footer />
    </div>
  );
}
