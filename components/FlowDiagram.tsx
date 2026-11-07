import { mechanismFor, type Mechanism } from "@/lib/mechanisms";

function Plate({ spec }: { spec: Mechanism }) {
  const short = spec.revision.slice(0, 7);
  return (
    <figcaption className="tag">
      {spec.plate} · {short}
    </figcaption>
  );
}

function Replay({ name }: { name: string }) {
  return (
    <button type="button" data-replay="" data-look={name} aria-label={`Replay the ${name} diagram`}>
      Replay
    </button>
  );
}

function Cite({ spec, name }: { spec: Mechanism; name: string }) {
  return (
    <figure className="flow flow-cite" data-revision={spec.revision} data-file={spec.plate}>
      <Plate spec={spec} />
      <div className="cut">
        <div className="rail">
          <svg viewBox="0 0 8 100" preserveAspectRatio="none" aria-hidden="true">
            <line className="trace" x1="4" y1="0" x2="4" y2="100" pathLength="1" />
          </svg>
          <ol className="steps">
            <li>
              <span className="k">Input</span>
              {spec.input}
            </li>
            {spec.steps.map((step) => (
              <li key={step.k}>
                <span className="k">{step.k}</span>
                {step.text}
              </li>
            ))}
          </ol>
        </div>
        <div className="outcomes">
          <p className="k">Output</p>
          <ul>
            {spec.outputs.map((row) => (
              <li key={row.text}>
                <span className="k">{row.k}</span>
                {row.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {spec.limits.map((limit) => (
        <p className="limit" key={limit}>
          {limit}
        </p>
      ))}
      <Replay name={name} />
    </figure>
  );
}

function Autopsy({ spec, name }: { spec: Mechanism; name: string }) {
  const keeps = spec.steps[0];
  const drops = spec.steps[1];
  return (
    <figure className="flow flow-autopsy" data-revision={spec.revision} data-file={spec.plate}>
      <Plate spec={spec} />
      <p className="k">Input</p>
      <p className="line">{spec.input}</p>
      <div className="split">
        <div>
          <p className="k">{keeps.k}</p>
          <p className="line">{keeps.text}</p>
        </div>
        <div className="drop">
          <p className="k">{drops.k}</p>
          <p className="phrase">
            <span className="gone">full-time employees only</span>
            <svg viewBox="0 0 100 8" aria-hidden="true">
              <line className="trace" x1="0" y1="4" x2="100" y2="4" pathLength="1" />
            </svg>
            <span className="to">employees</span>
          </p>
          <p className="line">{drops.text}</p>
        </div>
      </div>
      <p className="k">Output</p>
      <ol className="checks">
        {spec.outputs.map((row) => (
          <li key={row.k}>
            <span className="k">{row.k}</span>
            {row.text}
          </li>
        ))}
      </ol>
      {spec.limits.map((limit) => (
        <p className="limit" key={limit}>
          {limit}
        </p>
      ))}
      <Replay name={name} />
    </figure>
  );
}

function Voice({ spec, name }: { spec: Mechanism; name: string }) {
  return (
    <figure className="flow flow-voice" data-revision={spec.revision} data-file={spec.plate}>
      <Plate spec={spec} />
      <p className="k">Input</p>
      <p className="line">{spec.input}</p>
      <ol className="meter">
        {spec.steps.map((step) => (
          <li key={step.k}>
            <span className="k">{step.k}</span>
            {step.text}
          </li>
        ))}
      </ol>
      <div className="ruler">
        <svg viewBox="0 0 100 8" aria-hidden="true">
          <line className="trace" x1="0" y1="4" x2="100" y2="4" pathLength="1" />
        </svg>
        {spec.outputs.map((row) => (
          <span key={row.k}>{row.k}</span>
        ))}
      </div>
      <p className="k">Output</p>
      {spec.outputs.map((row) => (
        <p className="line" key={row.k}>
          {row.text}
        </p>
      ))}
      {spec.limits.map((limit) => (
        <p className="limit" key={limit}>
          {limit}
        </p>
      ))}
      <Replay name={name} />
    </figure>
  );
}

export function FlowDiagram({ id, name }: { id: Mechanism["id"]; name: string }) {
  const spec = mechanismFor(id);
  if (id === "citebot") return <Cite spec={spec} name={name} />;
  if (id === "autopsy") return <Autopsy spec={spec} name={name} />;
  return <Voice spec={spec} name={name} />;
}
