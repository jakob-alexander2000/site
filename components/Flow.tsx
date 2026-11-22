type Step = { step: string; line: string; fault?: string };

/** A numbered flow drawn with rules, in the style of the receipts. Wraps to a column on a phone. */
export function Flow({ steps, label, fig, caption }: { steps: readonly Step[]; label: string; fig: string; caption: string }) {
  return (
    <figure className="flow-figure">
      <ol className="flow" aria-label={label}>
        {steps.map((item, index) => (
          <li key={`${item.step}-${index}`} className={`flow-step${index === steps.length - 1 ? " flow-end" : ""}`}>
            <span className="meta quiet">{String(index + 1).padStart(2, "0")}</span>
            <span className="flow-name">{item.step}</span>
            <span className="flow-line">{item.line}</span>
            {item.fault ? <span className="meta fault flow-fault">{item.fault}</span> : null}
          </li>
        ))}
      </ol>
      <figcaption className="figcaption meta">
        <span>
          {fig} · {caption}
        </span>
      </figcaption>
    </figure>
  );
}
