import { AlignLeaders } from "@/components/AlignLeaders";
import { RegisterMark } from "@/components/PartNote";
import { CopyAddress } from "@/components/CopyAddress";
import { BACKGROUND } from "@/lib/looks";
import { contact } from "@/lib/contact";
import { CITEBOT_PLATE, DROPPED, REVISION, STYLE_DISTANCE } from "@/lib/diagrams";
import { FLAGSHIP_CASES } from "@/lib/flagship";
import { FOOTER_SHEETS } from "@/lib/plates";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { PARTS_LABEL } from "@/lib/schnitt-copy";
import { SKILLS } from "@/lib/skills";

const ALIGNED = [
  { top: "In ", bottom: "In " },
  { top: "practice, ", bottom: "practice, " },
  { top: "full-time employees only ", drop: true, bottom: "employees " },
  { top: "receive ", bottom: "receive " },
  { top: "30 ", bottom: "30 " },
  { top: "days ", bottom: "days " },
  { top: "of ", bottom: "of " },
  { top: "paid ", bottom: "paid " },
  { top: "annual ", bottom: "annual " },
  { top: "leave ", bottom: "leave." },
  { top: "after the probation period", drop: true },
  { top: "." },
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
  return lines;
}

function SheetRule({ index }: { index: string }) {
  return (
    <div className="sheet-rule" aria-hidden="true">
      <RegisterMark />
      <RegisterMark />
      <RegisterMark />
      <RegisterMark />
      <span className="sheet-no">{index}</span>
      <span className="cut-mark" />
    </div>
  );
}

/** Label anchors on the 1280 x 380 CiteBot sheet, as shares of its box: x 0, 340, 780 and y 30. */
const LABEL_LEFT = { question: "0%", source: "26.5625%", answer: "60.9375%" } as const;
const LABEL_TOP = "7.8947%";

export function Plates({ run }: { run: SchnittRun }) {
  const cited = run.sentences.find((sentence) => sentence.verdict === "pass");
  const fail = run.sentences.find((sentence) => sentence.verdict === "fail");
  const spanAt = run.passage.text.indexOf(run.passage.span);
  const before = run.passage.text.slice(0, spanAt).trim();
  const after = run.passage.text.slice(spanAt + run.passage.span.length).trim();
  const question = wrapLines(run.question, 22);
  // Question, then source, then answer: one row of three columns on a 1280 x 380 sheet.
  const col = { question: 0, source: 340, answer: 780 };
  const spanY = 166;
  return (
    <div className="plates">
      <AlignLeaders />
      <section className="plate" id="citebot" aria-labelledby="citebot-title">
        <h2 id="citebot-title" className="kicker plate-continue">
          {PARTS_LABEL}
        </h2>
        <figure className="cite-figure">
          <ol className="cite-steps">
            <li>Question. {run.question}</li>
            <li>
              Source. {run.handbook.file}: {run.passage.text}
            </li>
            <li>
              Answer. {cited?.text} PASS, cited from {run.handbook.file}. {fail?.text} FAIL. {fail?.evidence}
            </li>
          </ol>
          <div className="drawing-frame">
            <svg className="plate-drawing" viewBox="0 0 1280 380" role="img" aria-labelledby="citebot-drawing">
              <title id="citebot-drawing">{`${run.question} ${run.passage.text} ${cited?.text ?? ""} ${fail?.text ?? ""} FAIL. ${fail?.evidence ?? ""}`}</title>
              <g data-col="question">
                {question.map((line, index) => (
                  <text key={line} className="cite-question" x={col.question} y={92 + index * 38} fill="#111111" fontSize="30" fontWeight="300" fontFamily="Geist, sans-serif">
                    {line}
                  </text>
                ))}
              </g>
              <g data-col="source">
                <rect className="sheet-face source-sheet" x={col.source} y={52} width={400} height={170} fill="#FBFAF7" stroke="#111111" />
                <text className="cite-file" x={col.source + 22} y={86} fill="#5A5A55" fontSize="15" fontFamily="ui-monospace, monospace">
                  {run.handbook.file}
                </text>
                <text x={col.source + 22} y={spanY - 36} fill="#111111" fontSize="24" fontWeight="300" fontFamily="Geist, sans-serif">
                  {before}
                </text>
                <text className="cite-span" x={col.source + 22} y={spanY} fill="#111111" fontSize="24" fontWeight="400" fontFamily="Geist, sans-serif">
                  {run.passage.span}
                </text>
                <line className="cite-underline" x1={col.source + 22} y1={spanY + 8} x2={col.source + 290} y2={spanY + 8} stroke="#111111" strokeWidth="1.5" />
                <text x={col.source + 22} y={spanY + 36} fill="#111111" fontSize="24" fontWeight="300" fontFamily="Geist, sans-serif">
                  {after}
                </text>
                <text className="cite-refusal" x={col.source} y={256} fill="#5A5A55" fontSize="15" fontFamily="ui-monospace, monospace">
                  {CITEBOT_PLATE.refusal}
                </text>
              </g>
              <g data-col="answer">
                <rect className="sheet-face verdict-sheet answer-sheet" x={col.answer} y={52} width={500} height={300} fill="#FBFAF7" stroke="#111111" />
                <text className="cite-mark" x={col.answer + 22} y={spanY} fill="#111111" fontSize="16" fontFamily="ui-monospace, monospace">
                  [1]
                </text>
                <text className="cite-sentence" x={col.answer + 62} y={spanY} fill="#111111" fontSize="22" fontWeight="400" fontFamily="Geist, sans-serif">
                  {cited?.text}
                </text>
                <g className="fail-mark">
                  <text className="fail-word verdict-fail-sentence cite-sentence" x={col.answer + 50} y={252} fill="#111111" fontSize="40" fontWeight="400" fontFamily="Geist, sans-serif">
                    {fail?.text}
                  </text>
                  <ellipse className="pen-loop" cx={col.answer + 200} cy={238} rx="176" ry="34" fill="none" stroke="#C6302A" strokeWidth="1.6" />
                </g>
                <text className="cite-fail-label" x={col.answer + 410} y={246} fill="#111111" fontSize="15" fontFamily="ui-monospace, monospace">
                  FAIL
                </text>
                <text className="verdict-fail-reason" x={col.answer + 50} y={318} fill="#3A3A36" fontSize="18" fontWeight="300" fontFamily="Geist, sans-serif">
                  {fail?.evidence}
                </text>
              </g>
              <line className="cite-line" data-from="mark" data-to="span" x1={col.answer + 18} y1={spanY - 8} x2={col.source + 294} y2={spanY - 8} stroke="#111111" strokeWidth="1" />
            </svg>
            <div className="sheet-labels">
              {(["question", "source", "answer"] as const).map((id) => (
                <p key={id} className="leader-name" data-for={id} style={{ left: LABEL_LEFT[id], top: LABEL_TOP, transform: "translateY(-50%)" }}>
                  {id === "question" ? "Question" : id === "source" ? "Source" : "Answer"}
                </p>
              ))}
            </div>
          </div>
          <div className="plate-stack cite-stack">
            <p className="leader-name" data-for="question">Question</p>
            <p className="cite-question">{run.question}</p>
            <p className="leader-name" data-for="source">Source</p>
            <div className="cite-source">
              <p className="cite-file">{run.handbook.file}</p>
              <p className="cite-passage">
                {before} <span className="cite-span">{run.passage.span}</span> {after}
              </p>
            </div>
            <p className="leader-name" data-for="answer">Answer</p>
            <div className="cite-answer">
              <p className="cite-sentence">
                <span className="cite-mark">[1]</span> {cited?.text}
              </p>
              <p className="cite-sentence cite-fail">
                <span className="cite-loop">
                  <span className="verdict-fail-sentence">{fail?.text}</span>
                  <svg className="cite-ring" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                    <ellipse cx="50" cy="20" rx="49" ry="19" fill="none" stroke="#C6302A" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                  </svg>
                </span>{" "}
                <span className="cite-fail-label">FAIL</span>
              </p>
              <p className="cite-why verdict-fail-reason">{fail?.evidence}</p>
            </div>
            <p className="cite-refusal">{CITEBOT_PLATE.refusal}</p>
            <svg className="cite-link" aria-hidden="true">
              <path className="cite-line" d="M 0 0" fill="none" stroke="#111111" strokeWidth="1" />
            </svg>
          </div>
          <figcaption>{CITEBOT_PLATE.body}</figcaption>
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
          <div className="autopsy-draw">
            <div className="label-rail">
              <p className="leader-name">Passage</p>
              <p className="leader-name">Answer</p>
            </div>
            <div className="word-align sheet-face" aria-hidden="true">
              {ALIGNED.map((column) => {
                const dropped = "drop" in column && column.drop;
                const top = column.top;
                const bottom = "bottom" in column ? column.bottom : "";
                const tied = Boolean(top) && (Boolean(bottom) || dropped);
                return (
                  <span className="pair" key={`${top}|${bottom}|${dropped ? "drop" : "keep"}`}>
                    <span className="passage-line">{top}</span>
                    {tied ? (
                      <svg className="hair" viewBox="0 0 2 18" width="2" height="18" aria-hidden="true">
                        <line x1="1" y1="0" x2="1" y2="18" stroke="#111111" strokeWidth="1" />
                      </svg>
                    ) : (
                      <span className="hair hair-gap" />
                    )}
                    <span className="answer-line">
                      {dropped ? (
                        <s className="offcut" style={{ textDecoration: "line-through" }}>
                          {top}
                        </s>
                      ) : null}
                      {bottom}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
          <p className="leader-note">The hairline ties each kept word. The struck spans are the ones the scorer dropped, including employees.</p>
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
                  {check.verdict === "fail" ? (
                    <svg className="fail-mark" viewBox="0 0 78 32" width="78" height="32" role="img" aria-label="FAIL">
                      <text className="fail-word" x="39" y="21" textAnchor="middle" fill="#FF8A84" fontSize="13" fontFamily="ui-monospace, monospace">FAIL</text>
                      <ellipse className="pen-loop" cx="39" cy="16" rx="32" ry="13" fill="none" stroke="#C6302A" strokeWidth="1.6" />
                    </svg>
                  ) : (
                    "PASS"
                  )}
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
          <div className="drawing-frame">
          <svg className="plate-drawing" viewBox="0 0 1120 360" role="img" aria-labelledby="style-drawing">
            <title id="style-drawing">House voice at zero, the draft set back, fins largest first.</title>
            <line className="leader-line" x1="118" y1="82" x2="150" y2="82" stroke="#111111" />
            <rect className="sheet-face voice-sheet" x="150" y="28" width="160" height="120" fill="#FBFAF7" stroke="#111111" />
            <text x="206" y="98" textAnchor="middle" fill="#111111" fontSize="36" fontFamily="Geist, sans-serif">0</text>
            <g className="fins">
              {STYLE_DISTANCE.fins.map((fin, index) => {
                const gap = 476;
                const width = (fin.z / STYLE_DISTANCE.fins[0].z) * gap;
                const y = 28 + index * 20;
                return (
                  <g key={fin.word}>
                    <text x="324" y={y + 13} fill="#111111" fontSize="15" fontFamily="ui-monospace, monospace">{fin.word}</text>
                    <rect className="fin-bar" data-z={fin.z} x="392" y={y + 2} width={width} height="12" fill="#111111" />
                  </g>
                );
              })}
            </g>
            <line className="leader-line" x1="924" y1="32" x2="960" y2="44" stroke="#111111" />
            <rect x="888" y="62" width="200" height="108" fill="none" stroke="#111111" strokeOpacity="0.35" />
            <rect className="sheet-face draft-sheet" x="868" y="44" width="200" height="108" fill="#FBFAF7" stroke="#111111" />
            <text x="882" y="72" fill="#111111" fontSize="15" fontFamily="ui-monospace, monospace">{STYLE_DISTANCE.label}</text>
            <line x1="310" y1="168" x2="310" y2="184" stroke="#111111" />
            <line x1="868" y1="168" x2="868" y2="184" stroke="#111111" />
            <line x1="310" y1="184" x2="868" y2="184" stroke="#111111" />
            <text className="depth-read" x="589" y="176" textAnchor="middle" fill="#111111" fontSize="15" fontFamily="ui-monospace, monospace">{STYLE_DISTANCE.heldOut}</text>
            <rect className="sheet-face verdict-sheet" x="16" y="208" width="1088" height="132" fill="#111111" />
            <text x="36" y="242" fill="#F7F7F5" fontSize="15" fontFamily="ui-monospace, monospace">VERDICT</text>
            <text className="figure-prose" x="36" y="276" fill="#F7F7F5" fontSize="18" fontFamily="Geist, sans-serif">
              Drifted drafts {STYLE_DISTANCE.drifted}, {STYLE_DISTANCE.driftedReading}
            </text>
            <text className="figure-prose" x="36" y="306" fill="#F7F7F5" fontSize="18" fontFamily="Geist, sans-serif">
              Held-out pages {STYLE_DISTANCE.heldOut}, {STYLE_DISTANCE.heldOutReading}
            </text>
          </svg>
          <div className="sheet-labels">
            <p className="leader-name" style={{ left: "1.43%", top: "19.44%" }}>HOUSE VOICE</p>
            <p className="leader-name" style={{ left: "80.36%", top: "3.33%" }}>DRAFT</p>
          </div>
          </div>
          <div className="cut-runway" aria-hidden="true" />
          <div className="plate-stack distance-sheets">
            <article className="voice-sheet">
              <p className="leader-name kicker">House voice</p>
              <p className="body">0</p>
              <ol className="fins">
                {STYLE_DISTANCE.fins.map((fin) => (
                  <li key={fin.word}>
                    <span className="fin-word">{fin.word}</span>
                    <span className="fin-bar" data-z={fin.z} style={{ width: `${((fin.z / STYLE_DISTANCE.fins[0].z) * 100).toFixed(1)}%` }} />
                  </li>
                ))}
              </ol>
            </article>
            <article className="draft-sheet">
              <p className="kicker">{STYLE_DISTANCE.label}</p>
              <p className="dimension">
                <span className="depth-read">{STYLE_DISTANCE.heldOut}</span>
              </p>
              <p className="body">Drifted drafts {STYLE_DISTANCE.drifted}, {STYLE_DISTANCE.driftedReading}</p>
              <p className="body">Held-out pages {STYLE_DISTANCE.heldOut}, {STYLE_DISTANCE.heldOutReading}</p>
            </article>
            <article className="verdict-sheet">
              <p className="kicker">Verdict</p>
              <p className="body">Both measured figures are printed on the draft sheet.</p>
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
              <details className="skill-strip">
                <summary>
                  <span className="strip-sheets" aria-hidden="true">
                    {skill.steps.map((step) => (
                      <span key={step} className="strip-sheet" />
                    ))}
                  </span>
                  <span className="kicker">{skill.name}</span>
                </summary>
                <ol className="strip-steps">
                  {skill.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </details>
              <p className="actions">
                <a href={skill.proof.href}>{skill.proof.label}</a>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="plate" id="about" aria-labelledby="about-title">
        <SheetRule index="05" />
        <p className="kicker">05 · ABOUT</p>
        <h2 id="about-title">About</h2>
        <p className="body">{BACKGROUND}</p>
        <p className="title-block">Drawn by Jakob Alex, Sheet 05 of 07, {REVISION}</p>
      </section>

      <section className="plate" id="contact" aria-labelledby="contact-title">
        <SheetRule index="06" />
        <p className="kicker">06 · CONTACT</p>
        <h2 id="contact-title">Contact</h2>
        <p className="kicker">Email</p>
        {contact.email ? <CopyAddress email={contact.email} /> : null}
        <p className="actions">
          <a href={contact.github}>GitHub</a>
        </p>
      </section>

      <section className="plate" id="footer" aria-labelledby="footer-title">
        <SheetRule index="07" />
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
