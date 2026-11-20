const ATTEMPTS = [
  {
    tier: "Attempt 1 · tier cheap",
    checks: [
      { name: "not-empty", pass: true },
      { name: "required-headings", pass: false },
    ],
  },
  {
    tier: "Attempt 2 · tier strong",
    checks: [
      { name: "not-empty", pass: true },
      { name: "required-headings", pass: true },
    ],
  },
] as const;

/** One receipt as real text on paper: two attempts, the checks, the close. Drawn, not captured. */
export function PersonaReceipt({ id, label }: { id: string; label: string }) {
  return (
    <div className="work-receipt" role="img" aria-label={label} data-visual={id}>
      <div className="receipt-head" aria-hidden="true">
        <span>Receipt · v1</span>
        <span>checks from the check library</span>
      </div>
      {ATTEMPTS.map((attempt) => (
        <div className="receipt-attempt" key={attempt.tier} aria-hidden="true">
          <span className="receipt-tier">{attempt.tier}</span>
          {attempt.checks.map((check) => (
            <span className="receipt-check" key={check.name}>
              <span>{check.name}</span>
              <span className={check.pass ? "receipt-mark" : "receipt-mark receipt-fail"}>{check.pass ? "PASS" : "FAIL"}</span>
            </span>
          ))}
        </div>
      ))}
      <div className="receipt-status" aria-hidden="true">
        <span className="receipt-passed">Passed</span>
        <span>cost · time · tokens</span>
      </div>
    </div>
  );
}
