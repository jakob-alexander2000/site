import { COLOPHON, GITHUB } from "@/lib/copy";

export function Footer() {
  return (
    <footer className="foot">
      <div className="frame foot-inner">
        <p>© 2026 Jakob Alex</p>
        <p>{COLOPHON}</p>
        <a href={GITHUB}>github.com/jakob-alexander2000</a>
      </div>
    </footer>
  );
}
