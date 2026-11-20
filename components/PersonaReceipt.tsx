/** A construction drawing of one receipt: two attempts, the checks, the close. Drawn, not captured. */
export function PersonaReceipt({ id, label }: { id: string; label: string }) {
  const mono = "var(--font-mono), ui-monospace, monospace";
  const sans = "var(--font-sans), sans-serif";
  return (
    <svg className="work-drawing" viewBox="0 0 800 600" role="img" aria-label={label} data-visual={id}>
      <rect x="0" y="0" width="800" height="600" fill="#fbfaf7" />
      <g fill="none" stroke="#111111" strokeWidth="1">
        <rect x="120" y="48" width="560" height="504" />
        <line x1="120" y1="132" x2="680" y2="132" />
        <line x1="120" y1="300" x2="680" y2="300" strokeDasharray="4 6" />
        <line x1="120" y1="456" x2="680" y2="456" />
        <path d="M60 196 H112 M60 364 H112 M60 500 H112" />
      </g>
      <g fontFamily={mono} fontSize="16" fill="#3a3a36" letterSpacing="0.5">
        <text x="148" y="82">RECEIPT · V1</text>
        <text x="148" y="112">checks from the check library</text>
        <text x="148" y="172">ATTEMPT 1 · TIER CHEAP</text>
        <text x="148" y="340">ATTEMPT 2 · TIER STRONG</text>
        <text x="148" y="492">STATUS</text>
        <text x="20" y="190">A</text>
        <text x="20" y="358">B</text>
        <text x="20" y="494">C</text>
      </g>
      <g fontFamily={sans} fontSize="22" fontWeight="300" fill="#111111">
        <text x="148" y="214">not-empty</text>
        <text x="560" y="214" fontFamily={mono} fontSize="16">PASS</text>
        <text x="148" y="250">required-headings</text>
        <text x="560" y="250" fontFamily={mono} fontSize="16" fill="#c6302a">FAIL</text>
        <text x="148" y="382">not-empty</text>
        <text x="560" y="382" fontFamily={mono} fontSize="16">PASS</text>
        <text x="148" y="418">required-headings</text>
        <text x="560" y="418" fontFamily={mono} fontSize="16">PASS</text>
        <text x="148" y="530" fontSize="30" fontWeight="200">Passed</text>
        <text x="420" y="530" fontFamily={mono} fontSize="16" fill="#3a3a36">COST · TIME · TOKENS</text>
      </g>
      <ellipse cx="584" cy="244" rx="44" ry="20" fill="none" stroke="#c6302a" strokeWidth="1.5" />
      <path d="M628 244 C700 250 720 330 640 376" fill="none" stroke="#c6302a" strokeWidth="1.5" />
      <path d="M640 376 l4 -12 M640 376 l12 -4" fill="none" stroke="#c6302a" strokeWidth="1.5" />
    </svg>
  );
}
