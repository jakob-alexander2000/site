import { Plane } from "@/components/Plane";
import {
  LAYERS,
  NEXT_QUESTION,
  PERSONA_BRIEF,
  PERSONA_RECEIPT,
  PERSONA_SPEC,
  PERSONA_VERDICT,
  SITE_CHECKS,
  type LayerId,
  type Row,
} from "@/lib/studio";

function Record({ rows }: { rows: readonly Row[] }) {
  return (
    <dl>
      {rows.map((row) => (
        <div className="kv" key={row.label}>
          <dt>{row.label}</dt>
          <dd className={row.fault ? "fault" : undefined}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Artefact({ id }: { id: LayerId }) {
  if (id === "research") {
    return (
      <div className="panel mono" role="group" aria-label="Research output: the Persona brief">
        <div className="pair">
          <span>brief · persona</span>
          <span className="quiet">research</span>
        </div>
        <hr className="hr" />
        <Record rows={PERSONA_BRIEF} />
      </div>
    );
  }
  if (id === "design") {
    return (
      <div className="panel spec-sheet" role="group" aria-label="Design output: a page of the Persona spec sheet">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="wire" aria-hidden="true">
            <span style={{ height: 8, width: "60%", background: "var(--ink)" }} />
            <span style={{ height: 1, marginTop: 6 }} />
            <span style={{ width: "80%" }} />
            <span style={{ width: "70%" }} />
            <span style={{ width: "40%", background: "var(--fault)" }} />
            <span style={{ marginTop: "auto", height: 22, width: "50%", background: "var(--ink)" }} />
            <span className="spec" style={{ position: "absolute", right: -8, top: "40%", height: "auto", background: "var(--ground)" }}>
              12 px
            </span>
          </div>
          <span className="meta quiet">Receipt screen</span>
        </div>
        <div className="mono">
          <Record rows={PERSONA_SPEC} />
        </div>
      </div>
    );
  }
  if (id === "code") {
    return (
      <div className="panel panel-dark mono" role="group" aria-label="Code output: the rule the tests guard, and this site's checks">
        <pre className="code">
          <span style={{ color: "#9a9a97" }}>{"// a switch is only allowed if nothing fails\n"}</span>
          {"if (run.checks.failed.length > 0) keep(strongModel)\nelse ask(person, \"switch to the cheap model?\")"}
        </pre>
        <hr className="hr" style={{ borderTopColor: "#2c2c2c" }} />
        <span className="meta" style={{ color: "#9a9a97" }}>
          Every push to this site runs
        </span>
        <ul className="chips">
          {SITE_CHECKS.map((check) => (
            <li key={check}>{check} ✓</li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="loop" role="group" aria-label="Checks output: the receipt, with one failure sent back to research">
      <div className="panel mono">
        <div className="pair">
          <span>receipt</span>
          <span className="quiet">weekly report</span>
        </div>
        <hr className="hr" />
        {PERSONA_RECEIPT.map((row) => (
          <div className="pair" key={row.label}>
            <span>{row.label}</span>
            <span className={row.fault ? "fault" : undefined}>{row.value}</span>
          </div>
        ))}
        <hr className="hr hr-ink" />
        <div className="pair" style={{ fontWeight: 500 }}>
          <span>verdict</span>
          <span>{PERSONA_VERDICT}</span>
        </div>
      </div>
      <a href="#studio-research" className="loop-back">
        <span className="meta fault">Back to research</span>
        <span style={{ fontSize: 22, lineHeight: "26px", fontWeight: 700, letterSpacing: "-0.02em" }}>{NEXT_QUESTION}</span>
        <span className="meta">Next week’s question ↑</span>
      </a>
    </div>
  );
}

/** Fig. 1 pulled apart: one layer per row, with Persona going through it. */
export function StudioSection() {
  return (
    <section id="studio" className="section" aria-labelledby="studio-title">
      <div className="meta-row rule-heavy">
        <span className="meta">Studio</span>
        <span className="meta quiet">The operating system, in action</span>
        <span className="meta quiet">Worked example: Persona</span>
      </div>
      <div className="split" style={{ marginTop: 40, alignItems: "flex-end" }}>
        <h2 id="studio-title" className="display">
          Studio
        </h2>
        <p className="body" style={{ maxWidth: 440 }}>
          Every project goes through the same four layers. Agents do the legwork and I make the calls. Here is Fig.&nbsp;1
          pulled apart, with Persona going through it.
        </p>
      </div>
      <div style={{ marginTop: 72 }}>
        {LAYERS.map((layer) => (
          <article key={layer.id} id={`studio-${layer.id}`} className="layer" aria-labelledby={`layer-${layer.id}`}>
            <div className="layer-drawing">
              <Plane id={layer.id} />
            </div>
            <div className="layer-text">
              <div className="layer-meta rule-hair" style={{ paddingTop: 10 }}>
                <span className="meta">{layer.index}</span>
                <span className="meta quiet">{layer.who}</span>
                <span className="meta quiet">{layer.when}</span>
              </div>
              <h3 id={`layer-${layer.id}`} className="layer-title">
                {layer.name}
              </h3>
              <p className="body">{layer.line}</p>
              <Artefact id={layer.id} />
            </div>
          </article>
        ))}
      </div>
      <div className="split rule-hair">
        <span className="meta quiet">Fig. 4 · Fig. 1, pulled apart</span>
        <a href="#top" className="meta link">
          Back to Fig. 1
        </a>
      </div>
    </section>
  );
}
