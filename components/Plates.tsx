import { BACKGROUND } from "@/lib/looks";
import { contact } from "@/lib/contact";
import { CITEBOT_PLATE, DROPPED, PIPELINE, REVISION, STYLE_DISTANCE } from "@/lib/diagrams";
import { FLAGSHIP_CASES } from "@/lib/flagship";
import { FOOTER_SHEETS } from "@/lib/plates";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { SKILLS } from "@/lib/skills";

const ALIGNED = [
  { top: "In ", bottom: "In " },
  { top: "practice, ", bottom: "practice, " },
  { drop: "full-time employees only ", bottom: "employees " },
  { top: "receive ", bottom: "receive " },
  { top: "30 ", bottom: "30 " },
  { top: "days ", bottom: "days " },
  { top: "of ", bottom: "of " },
  { top: "paid ", bottom: "paid " },
  { top: "annual ", bottom: "annual " },
  { top: "leave ", bottom: "leave." },
  { drop: "after the probation period." },
] as const;

function Strip({ count }: { count: number }) {
  return (
    <svg className="strip" viewBox="0 0 220 36" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <rect key={index} x={8 + index * 28} y={18 - index * 3} width="36" height="14" fill="#FBFAF7" stroke="#111111" />
      ))}
    </svg>
  );
}

export function Plates({ run }: { run: SchnittRun }) {
  const fail = run.sentences.find((sentence) => sentence.verdict === "fail");
  const steps = [
    { name: "Question", lines: [run.question] },
    { name: "Retrieve", lines: [run.handbook.file, run.passage.span] },
    { name: "Draft", lines: run.sentences.map((sentence) => sentence.text) },
    { name: "Split", lines: run.sentences.map((sentence, index) => `S${index + 1} · ${sentence.text}`) },
    { name: "Check", lines: run.sentences.map((sentence, index) => `S${index + 1} · ${sentence.verdict === "fail" ? "FAIL" : "PASS"}`) },
    { name: "Verdict", lines: run.sentences.map((sentence) => `${sentence.verdict === "fail" ? "FAIL" : "PASS"} · ${sentence.evidence}`) },
  ];
  return (
    <div className="plates">
      <section className="plate" id="citebot" aria-labelledby="citebot-title">
        <p className="kicker">01 · CITEBOT</p>
        <h2 id="citebot-title">{CITEBOT_PLATE.headline}</h2>
        <p className="body">{CITEBOT_PLATE.body}</p>
        <figure>
          <div className="plate-viewport">
            <ol className="rail-steps">
              {steps.map((step) => (
                <li key={step.name} className="rail-sheet" data-rail="citebot">
                  <p className="kicker">{step.name}</p>
                  {step.lines.map((line) => (
                    <p className="body" key={line}>
                      {line}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
          </div>
          <figcaption>Six sheets on a diagonal rail, one step of the paid-leave question on each.</figcaption>
        </figure>
        <ul className="rail-fails">
          <li className="rail-fail">
            <p className="kicker">Nothing retrieved</p>
            <p className="body">{CITEBOT_PLATE.refusal}</p>
          </li>
          <li className="rail-fail">
            <p className="kicker">Contradiction</p>
            <p className="body">FAIL · {fail?.evidence}</p>
          </li>
        </ul>
        <ol>
          {PIPELINE.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <ul className="cases">
          {FLAGSHIP_CASES.map((item) => (
            <li key={item.source}>
              <span className="kicker">{item.source}</span>
              {item.question}
            </li>
          ))}
        </ul>
        <p className="body">{CITEBOT_PLATE.limits}</p>
        <p className="body">{CITEBOT_PLATE.refusal}</p>
        <p className="body">{CITEBOT_PLATE.contradiction}</p>
        <p className="actions">
          <a href={CITEBOT_PLATE.source}>Source</a>
          <a href={CITEBOT_PLATE.harness}>Harness</a>
        </p>
        <p className="plate-meta">{run.recordedLabel}</p>
      </section>

      <section className="plate" id="autopsy" aria-labelledby="autopsy-title">
        <p className="kicker">02 · AUTOPSY</p>
        <h2 id="autopsy-title">{DROPPED.headline}</h2>
        <p className="body">{DROPPED.body}</p>
        <figure>
          <div className="word-align">
            {ALIGNED.map((column) => {
              const dropped = "drop" in column;
              const top = dropped ? column.drop : "top" in column ? column.top : "";
              const bottom = "bottom" in column ? column.bottom : "";
              return (
                <span className="pair" key={`${top}|${bottom}`}>
                  {dropped ? (
                    <s className="offcut" style={{ textDecoration: "line-through" }}>
                      {top}
                    </s>
                  ) : (
                    <span className="passage-line">{top}</span>
                  )}
                  {top && bottom && !dropped ? (
                    <svg className="hair" viewBox="0 0 2 18" width="2" height="18" aria-hidden="true">
                      <line x1="1" y1="0" x2="1" y2="18" stroke="#111111" strokeWidth="1" />
                    </svg>
                  ) : (
                    <span className="hair hair-gap" />
                  )}
                  <span className="answer-line">{bottom}</span>
                </span>
              );
            })}
          </div>
          <div className="word-read">
            <p className="passage-line">
              {ALIGNED.map((column) =>
                "drop" in column ? (
                  <s className="offcut" key={column.drop} style={{ textDecoration: "line-through" }}>
                    {column.drop}
                  </s>
                ) : "top" in column ? (
                  <span key={column.top}>{column.top}</span>
                ) : null,
              )}
            </p>
            <p className="answer-line">
              {ALIGNED.map((column) => ("bottom" in column ? <span key={column.bottom}>{column.bottom}</span> : null))}
            </p>
          </div>
          <figcaption>Kept words are tied. Dropped spans are struck.</figcaption>
        </figure>
        <article className="verdict-sheet">
          <p className="kicker">Verdict on this answer</p>
          <ol>
            {DROPPED.checks.map((check) => (
              <li key={check.name}>
                <span className="kicker">{check.name}</span>
                <span>{check.detail}</span>
                <span className={check.verdict === "fail" ? "mark fail" : "mark"}>{check.verdict === "fail" ? "FAIL" : "PASS"}</span>
              </li>
            ))}
          </ol>
        </article>
        <ol>
          {DROPPED.flow.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="body">{DROPPED.limits}</p>
        <p className="actions">
          <a href={DROPPED.demo}>Demo</a>
          <a href={DROPPED.source}>Source</a>
        </p>
      </section>

      <section className="plate" id="style" aria-labelledby="style-title">
        <p className="kicker">03 · STYLE DISTANCE</p>
        <h2 id="style-title">{STYLE_DISTANCE.headline}</h2>
        <p className="body">{STYLE_DISTANCE.body}</p>
        <figure>
          <div className="distance-sheets">
            <article className="voice-sheet">
              <p className="kicker">House voice</p>
              <p className="body">0</p>
            </article>
            <ol className="fins">
              {STYLE_DISTANCE.fins.map((word, index) => (
                <li key={word} style={{ width: `${100 - index * 12}%` }}>
                  {word}
                </li>
              ))}
            </ol>
            <article className="draft-sheet">
              <p className="kicker">{STYLE_DISTANCE.label}</p>
              <p className="dimension">
                <span className="depth-read">{STYLE_DISTANCE.heldOut}</span>
              </p>
              <p className="body">Drifted drafts {STYLE_DISTANCE.drifted}, {STYLE_DISTANCE.driftedReading}</p>
              <p className="body">Held-out pages {STYLE_DISTANCE.heldOut}, {STYLE_DISTANCE.heldOutReading}</p>
            </article>
          </div>
          <figcaption>House voice at zero, the draft set back, fins largest first. Synthetic demo is printed on the draft sheet.</figcaption>
        </figure>
        <p className="actions">
          <a href={STYLE_DISTANCE.live}>Live</a>
          <a href={STYLE_DISTANCE.source}>Source</a>
        </p>
      </section>

      <section className="plate" id="skills" aria-labelledby="skills-title">
        <p className="kicker">04 · SKILLS</p>
        <h2 id="skills-title">Skills with proofs</h2>
        <p className="body">Each row is a thing I can show, with the steps drawn and a public proof.</p>
        <ol className="skills">
          {SKILLS.map((skill) => (
            <li key={skill.id} id={skill.id}>
              <h3>{skill.name}</h3>
              <p className="body">{skill.line}</p>
              <Strip count={skill.steps.length} />
              <ol>
                {skill.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="actions">
                <a href={skill.proof.href}>{skill.proof.label}</a>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="plate" id="about" aria-labelledby="about-title">
        <p className="kicker">05 · ABOUT</p>
        <h2 id="about-title">About</h2>
        <p className="body">{BACKGROUND}</p>
        <p className="title-block">Drawn by Jakob Alex, Sheet 05 of 07, {REVISION}</p>
      </section>

      <section className="plate" id="contact" aria-labelledby="contact-title">
        <p className="kicker">06 · CONTACT</p>
        <h2 id="contact-title">Contact</h2>
        <p className="kicker">Email</p>
        {contact.email ? (
          <a className="address" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        ) : null}
        <p className="actions">
          <a href={contact.github}>GitHub</a>
        </p>
      </section>

      <section className="plate" id="footer" aria-labelledby="footer-title">
        <p className="kicker">07 · FOOTER</p>
        <h2 id="footer-title">Sheet index</h2>
        <nav className="sheet-index" aria-label="Sheet index">
          {FOOTER_SHEETS.map((sheet) => (
            <a key={sheet.index} href={`#${sheet.id}`} aria-label={sheet.label}>
              {sheet.index}
            </a>
          ))}
        </nav>
        <p className="actions">
          <a href="https://github.com/jakob-alexander2000/site">Source of this site</a>
        </p>
        <p className="plate-meta">{REVISION}</p>
      </section>
    </div>
  );
}
