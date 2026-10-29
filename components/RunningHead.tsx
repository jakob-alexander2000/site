import Link from "next/link";

export function RunningHead() {
  return (
    <header className="running">
      <div className="running-inner">
        <Link href="/#opening" className="wordmark">
          Jakob Alex
        </Link>
        <p className="place">Berlin</p>
        <a className="place link" href="https://github.com/jakob-alexander2000">
          github.com/jakob-alexander2000
        </a>
      </div>
    </header>
  );
}
