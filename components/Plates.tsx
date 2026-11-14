import { BACKGROUND } from "@/lib/looks";
import { contact } from "@/lib/contact";
import { CITEBOT_PLATE, DROPPED, REVISION, STYLE_DISTANCE } from "@/lib/diagrams";
import { FLAGSHIP_CASES } from "@/lib/flagship";
import { FOOTER_SHEETS } from "@/lib/plates";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { SKILLS } from "@/lib/skills";

const ALIGNED = [
  { top: "In ", bottom: "In " },
  { top: "practice, ", bottom: "practice, " },
  { top: "full-time ", drop: true },
  { top: "employees ", bottom: "employees ", drop: true },
  { top: "only ", drop: true },
  { top: "receive ", bottom: "receive " },
  { top: "30 ", bottom: "30 " },
  { top: "days ", bottom: "days " },
  { top: "of ", bottom: "of " },
  { top: "paid ", bottom: "paid " },
  { top: "annual ", bottom: "annual " },
  { top: "leave ", bottom: "leave." },
  { top: "after the probation period.", drop: true },
] as const;

function wrapLines(text: string, max = 46) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function PenLoop({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <path
      className="pen-loop"
      d={`M ${x + w * 0.15} ${y + 2} C ${x + w} ${y - 2}, ${x + w + 8} ${y + h * 0.45}, ${x + w - 2} ${y + h} C ${x + w * 0.4} ${y + h + 6}, ${x - 6} ${y + h * 0.7}, ${x + 2} ${y + h * 0.35} C ${x - 2} ${y + 6}, ${x + w * 0.2} ${y - 1}, ${x + w * 0.2} ${y + 3}`}
      fill="none"
      stroke="#C6302A"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  );
}

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
          <svg className="plate-drawing" viewBox="0 0 1120 860" role="img" aria-labelledby="citebot-drawing">
            <title id="citebot-drawing">Six sheets on a diagonal rail for the paid-leave question.</title>
            {steps.map((step, index) => {
              const x = 210 + index * 64;
              const y = 28 + index * 108;
              const w = 500;
              const h = 86;
              const verdict = step.name === "Verdict";
              const ink = verdict ? "#F7F7F5" : "#111111";
              const lines = step.lines.flatMap((line) => wrapLines(line));
              return (
                <g key={step.name} className="draw-sheet" data-step={step.name.toLowerCase()}>
                  <text className="leader-name" x="16" y={y + 36} fill="#111111" fontSize="13" fontFamily="ui-monospace, monospace">
                    {step.name.toUpperCase()}
                  </text>
                  <line x1="132" y1={y + 32} x2={x} y2={y + 32} stroke="#111111" strokeWidth="1" />
                  <rect className={`sheet-face${verdict ? " verdict-sheet" : ""}`} x={x} y={y} width={w} height={h} fill={verdict ? "#111111" : "#FBFAF7"} stroke="#111111" />
                  {lines.map((line, lineIndex) => (
                    <text key={line} x={x + 14} y={y + 28 + lineIndex * 18} fill={ink} fontSize="15" fontFamily="Geist, sans-serif">
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
            <g data-hang="retrieve">
              <line className="hang-leader" data-leader="retrieve" x1="274" y1="156" x2="188" y2="156" stroke="#111111" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="188" y1="156" x2="188" y2="748" stroke="#111111" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="188" y1="748" x2="210" y2="748" stroke="#111111" strokeWidth="1" strokeDasharray="4 4" />
              <rect className="sheet-face hang-sheet" x="210" y="712" width="420" height="78" fill="none" stroke="#111111" strokeDasharray="6 4" />
              <text x="224" y="742" fill="#111111" fontSize="13" fontFamily="ui-monospace, monospace">NOTHING RETRIEVED</text>
              <text x="224" y="766" fill="#111111" fontSize="15" fontFamily="Geist, sans-serif">{CITEBOT_PLATE.refusal}</text>
            </g>
            <g data-hang="check">
              <line className="hang-leader" data-leader="check" x1="466" y1="492" x2="176" y2="492" stroke="#111111" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="176" y1="492" x2="176" y2="808" stroke="#111111" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="176" y1="808" x2="660" y2="808" stroke="#111111" strokeWidth="1" strokeDasharray="4 4" />
              <rect className="sheet-face hang-sheet" x="660" y="772" width="420" height="72" fill="none" stroke="#111111" strokeDasharray="6 4" />
              <text x="674" y="802" fill="#C6302A" fontSize="15" fontFamily="ui-monospace, monospace">FAIL</text>
              <PenLoop x={668} y={786} w={52} h={22} />
              <text x="740" y="802" fill="#111111" fontSize="15" fontFamily="Geist, sans-serif">{fail?.evidence}</text>
            </g>
          </svg>
          <div className="plate-stack">
            <ol className="rail-steps">
              {steps.map((step) => (
                <li key={step.name} className={`rail-sheet${step.name === "Verdict" ? " verdict-sheet" : ""}`}>
                  <p className="leader-name kicker">{step.name}</p>
                  {step.lines.map((line) => (
                    <p className="body" key={line}>
                      {line}
                    </p>
                  ))}
                </li>
              ))}
            </ol>
            <ul className="rail-fails">
              <li className="rail-fail" data-hang="retrieve">
                <p className="kicker">Nothing retrieved</p>
                <p className="body">{CITEBOT_PLATE.refusal}</p>
              </li>
              <li className="rail-fail" data-hang="check">
                <p className="kicker">Contradiction</p>
                <p className="body">
                  <span className="mark fail">FAIL</span> {fail?.evidence}
                  <svg className="pen-loop" viewBox="0 0 64 28" width="64" height="28" aria-hidden="true">
                    <PenLoop x={2} y={4} w={52} h={18} />
                  </svg>
                </p>
              </li>
            </ul>
          </div>
          <figcaption>Six sheets on a diagonal rail. Step names sit on leaders. Failure paths are dashed and hang from Retrieve and from Check.</figcaption>
        </figure>
        <ul className="cases">
          {FLAGSHIP_CASES.map((item) => (
            <li key={item.source}>
              <span className="kicker">{item.source}</span>
              {item.question}
            </li>
          ))}
        </ul>
        <p className="body">{CITEBOT_PLATE.limits}</p>
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
          <div className="drawing-grid">
            <p className="leader-name">Passage</p>
            <div className="word-align sheet-face" aria-hidden="true">
              {ALIGNED.map((column) => {
                const dropped = "drop" in column && column.drop;
                const top = column.top;
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
                    {top && bottom ? (
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
            <p className="leader-name">Answer</p>
            <p className="leader-note">The hairline under employees ties the answer word to its twin inside the struck span.</p>
          </div>
          <div className="word-read">
            <p className="passage-line">
              {ALIGNED.map((column) =>
                "drop" in column && column.drop ? (
                  <s className="offcut" key={column.top} style={{ textDecoration: "line-through" }}>
                    {column.top}
                  </s>
                ) : (
                  <span key={column.top}>{column.top}</span>
                ),
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
                <span className={check.verdict === "fail" ? "mark fail" : "mark"}>
                  {check.verdict === "fail" ? "FAIL" : "PASS"}
                  {check.verdict === "fail" ? (
                    <svg className="pen-loop" viewBox="0 0 64 28" width="64" height="28" aria-hidden="true">
                      <PenLoop x={2} y={4} w={54} h={18} />
                    </svg>
                  ) : null}
                </span>
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
          <svg className="plate-drawing" viewBox="0 0 1120 560" role="img" aria-labelledby="style-drawing">
            <title id="style-drawing">House voice at zero, the draft set back, fins largest first.</title>
            <text className="leader-name" x="16" y="78" fill="#111111" fontSize="13" fontFamily="ui-monospace, monospace">HOUSE VOICE</text>
            <line x1="132" y1="74" x2="200" y2="74" stroke="#111111" />
            <rect className="sheet-face voice-sheet" x="200" y="36" width="250" height="120" fill="#FBFAF7" stroke="#111111" />
            <text x="216" y="100" fill="#111111" fontSize="28" fontFamily="Geist, sans-serif">0</text>
            <g className="fins">
              {STYLE_DISTANCE.fins.map((fin, index) => {
                const width = (fin.z / STYLE_DISTANCE.fins[0].z) * 200;
                const y = 36 + index * 28;
                return (
                  <g key={fin.word}>
                    <text x="470" y={y + 16} fill="#111111" fontSize="13" fontFamily="ui-monospace, monospace">{fin.word}</text>
                    <rect className="fin-bar" data-z={fin.z} x="560" y={y + 4} width={width} height="14" fill="#111111" />
                  </g>
                );
              })}
            </g>
            <text className="leader-name" x="790" y="48" fill="#111111" fontSize="13" fontFamily="ui-monospace, monospace">DRAFT</text>
            <line x1="860" y1="44" x2="900" y2="90" stroke="#111111" />
            <g>
              <rect className="sheet-face draft-sheet" x="900" y="70" width="190" height="130" fill="#FBFAF7" stroke="#111111" />
              <text x="914" y="98" fill="#111111" fontSize="13" fontFamily="ui-monospace, monospace">{STYLE_DISTANCE.label}</text>
              <line x1="914" y1="118" x2="1070" y2="118" stroke="#111111" />
              <text className="depth-read" x="1000" y="112" fill="#111111" fontSize="13" fontFamily="ui-monospace, monospace">{STYLE_DISTANCE.heldOut}</text>
            </g>
            <rect className="sheet-face verdict-sheet" x="16" y="400" width="1088" height="130" fill="#111111" />
            <text x="36" y="438" fill="#F7F7F5" fontSize="13" fontFamily="ui-monospace, monospace">VERDICT</text>
            <text className="figure-prose" x="36" y="472" fill="#F7F7F5" fontSize="18" fontFamily="Geist, sans-serif">
              Drifted drafts {STYLE_DISTANCE.drifted}, {STYLE_DISTANCE.driftedReading}
            </text>
            <text className="figure-prose" x="36" y="500" fill="#F7F7F5" fontSize="18" fontFamily="Geist, sans-serif">
              Held-out pages {STYLE_DISTANCE.heldOut}, {STYLE_DISTANCE.heldOutReading}
            </text>
          </svg>
          <div className="plate-stack distance-sheets">
            <article className="voice-sheet">
              <p className="leader-name kicker">House voice</p>
              <p className="body">0</p>
            </article>
            <p className="dimension">
              <span className="depth-read">{STYLE_DISTANCE.heldOut}</span>
            </p>
            <ol className="fins">
              {STYLE_DISTANCE.fins.map((fin) => (
                <li key={fin.word}>
                  <span className="fin-word">{fin.word}</span>
                  <span className="fin-bar" data-z={fin.z} style={{ width: `${((fin.z / STYLE_DISTANCE.fins[0].z) * 100).toFixed(1)}%` }} />
                </li>
              ))}
            </ol>
            <article className="draft-sheet">
              <p className="kicker">{STYLE_DISTANCE.label}</p>
            </article>
            <article className="verdict-sheet">
              <p className="kicker">Verdict</p>
              <p className="figure-prose body">Drifted drafts {STYLE_DISTANCE.drifted}, {STYLE_DISTANCE.driftedReading}</p>
              <p className="figure-prose body">Held-out pages {STYLE_DISTANCE.heldOut}, {STYLE_DISTANCE.heldOutReading}</p>
            </article>
          </div>
          <figcaption>House voice at zero, the draft set back, fins largest first. Synthetic demo is printed on the draft sheet. The black sheet names both measured figures.</figcaption>
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
