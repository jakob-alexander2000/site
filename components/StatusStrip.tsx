import { ConstructionToggle } from "@/components/ConstructionToggle";
import { NOW } from "@/lib/studio";

/** The machine, running: what was built when, and what I am working on now. */
export function StatusStrip() {
  const commit = process.env.BUILD_COMMIT ?? "local";
  const date = process.env.BUILD_DATE ?? "";
  return (
    <div className="status gutter mono" role="region" aria-label="Site status">
      <ul>
        <li>
          <span className="dot" aria-hidden="true" />
          build{" "}
          <a href={`https://github.com/jakob-alexander2000/site/commit/${commit}`} className="link" style={{ minHeight: 32 }}>
            {commit}
          </a>{" "}
          · {date}
        </li>
        <li className="now">now: {NOW}</li>
      </ul>
      <ConstructionToggle />
    </div>
  );
}
