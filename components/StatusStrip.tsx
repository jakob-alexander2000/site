import { ConstructionToggle } from "@/components/ConstructionToggle";
import { getReceipts, RECEIPTS_HOME, shortDate } from "@/lib/receipts";
import { NOW } from "@/lib/studio";

/** The machine, running: what was built when, and what I am working on now. */
export async function StatusStrip() {
  const receipts = await getReceipts();
  const clean = receipts?.lines.filter((line) => line.passed === line.total && !line.worse).length ?? 0;
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
        {receipts ? (
          <li>
            checks{" "}
            <a
              href={RECEIPTS_HOME}
              className={`link${clean < receipts.lines.length ? " fault" : ""}`}
              style={{ minHeight: 32 }}
            >
              {clean} of {receipts.lines.length} test sets pass
            </a>{" "}
            · {shortDate(receipts.date)}
          </li>
        ) : null}
        <li className="now">now: {NOW}</li>
      </ul>
      <ConstructionToggle />
    </div>
  );
}
