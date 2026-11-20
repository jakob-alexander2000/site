/** Four construction drawings, one language: paper, a hairline, and a few large labels. */

export function PersonaDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-kicker">Receipt</p>
      <ol className="diagram-stack">
        <li>
          <span>Cheap model</span>
          <span className="diagram-fail">headings fail</span>
        </li>
        <li>
          <span>Strong model</span>
          <span>both checks pass</span>
        </li>
        <li className="diagram-close">
          <span>Passed</span>
          <span>with a receipt</span>
        </li>
      </ol>
    </div>
  );
}

export function CitebotDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-kicker">Verify</p>
      <ol className="diagram-stack">
        <li>
          <span>Source</span>
          <span>30 days of leave</span>
        </li>
        <li>
          <span>Claim</span>
          <span className="diagram-fail">PTO is unlimited</span>
        </li>
        <li className="diagram-close">
          <span>Verdict</span>
          <span className="diagram-fail">fail</span>
        </li>
      </ol>
    </div>
  );
}

export function AutopsyDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-kicker">Qualifier</p>
      <ol className="diagram-stack">
        <li>
          <span>Passage</span>
          <span>full-time, after probation</span>
        </li>
        <li>
          <span>Answer</span>
          <span className="diagram-fail">both dropped</span>
        </li>
        <li className="diagram-close">
          <span>Check</span>
          <span className="diagram-fail">fail</span>
        </li>
      </ol>
    </div>
  );
}

export function StyleDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-kicker">Distance</p>
      <ol className="diagram-stack">
        <li>
          <span>House voice</span>
          <span>close</span>
        </li>
        <li>
          <span>Draft</span>
          <span className="diagram-fail">1.33 off-voice</span>
        </li>
      </ol>
    </div>
  );
}
