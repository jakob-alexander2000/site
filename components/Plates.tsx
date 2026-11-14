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
  { top: "full-time employees only ", drop: true },
  { top: "", bottom: "employees " },
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
    {
      name: "Verdict",
      lines: run.sentences.flatMap((sentence, index) =>
        sentence.verdict === "fail"
          ? [`S${index + 1} · FAIL · ${sentence.text}`, sentence.evidence]
          : [`S${index + 1} · PASS · ${sentence.text}`],
      ),
    },
  ];
  const x0 = 150;
  const y0 = 28;
  const dx = 156;
  const dy = 56;
  const sw = 340;
  const sh = 68;
  const sheetBox = (index: number) => ({ x: x0 + index * dx, y: y0 + index * dy, w: sw, h: index === 5 ? 124 : sh });
  return (
    <div className="plates">
      <section className="plate" id="citebot" aria-labelledby="citebot-title">
        <p className="kicker">01 · CITEBOT</p>
        <h2 id="citebot-title">{CITEBOT_PLATE.headline}</h2>
        <p className="body">{CITEBOT_PLATE.body}</p>
        <figure>
          <div className="drawing-frame">
          <svg className="plate-drawing" viewBox="0 0 1280 520" role="img" aria-labelledby="citebot-drawing">
            <title id="citebot-drawing">Six sheets on a diagonal rail for the paid-leave question.</title>
            {steps.map((step, index) => {
              const box = sheetBox(index);
              const verdict = step.name === "Verdict";
              const ink = verdict ? "#F7F7F5" : "#111111";
              const labelX = box.x + box.w - dx + 8;
              return (
                <g key={step.name} className="draw-sheet" data-step={step.name.toLowerCase()}>
                  <line className="leader-line" x1={labelX + 28} y1={box.y - 6} x2={labelX + 28} y2={box.y} stroke="#111111" strokeWidth="1" />
                  <rect className={`sheet-face${verdict ? " verdict-sheet" : ""}`} x={box.x} y={box.y} width={box.w} height={box.h} fill={verdict ? "#111111" : "#FBFAF7"} stroke="#111111" />
                  {step.name === "Split"
                    ? run.sentences.map((sentence, sentenceIndex) => (
                        <text key={sentence.text} x={box.x + 12} y={box.y + 28 + sentenceIndex * 18} fill={ink} fontSize="15" fontFamily="Geist, sans-serif">
                          {`S${sentenceIndex + 1} · `}
                          <tspan className={sentence.verdict === "fail" ? "split-fail-sentence" : undefined}>{sentence.text}</tspan>
                        </text>
                      ))
                    : step.name === "Verdict"
                      ? (() => {
                        // Rows stack from a cursor so a wrapped pass line never runs into the FAIL loop below it.
                        let cursor = box.y + 28;
                        return run.sentences.flatMap((sentence, sentenceIndex) => {
                          if (sentence.verdict !== "fail") {
                            const lines = wrapLines(`S${sentenceIndex + 1} · PASS · ${sentence.text}`, 32);
                            const top = cursor;
                            cursor += lines.length * 18 + 12;
                            return lines.map((line, lineIndex) => (
                              <text key={line} x={box.x + 12} y={top + lineIndex * 18} fill={ink} fontSize="15" fontFamily="Geist, sans-serif">
                                {line}
                              </text>
                            ));
                          }
                          const y = cursor + 6;
                          cursor = y + 46;
                          return [
                            <g key="mark" className="fail-mark">
                              <text className="fail-word" x={box.x + 12} y={y} fill="#FF8A84" fontSize="15" fontFamily="ui-monospace, monospace">
                                {`S${sentenceIndex + 1} · FAIL`}
                              </text>
                              <ellipse className="pen-loop" cx={box.x + 52} cy={y - 6} rx="46" ry="10" fill="none" stroke="#C6302A" strokeWidth="1.6" />
                            </g>,
                            <text key="sentence" className="verdict-fail-sentence" x={box.x + 112} y={y} fill={ink} fontSize="15" fontFamily="Geist, sans-serif">
                              {sentence.text}
                            </text>,
                            <text key="why" className="verdict-fail-reason" x={box.x + 12} y={y + 28} fill="#F7F7F5" fontSize="15" fontFamily="Geist, sans-serif">
                              {sentence.evidence}
                            </text>,
                          ];
                        });
                      })()
                      : step.lines.flatMap((line) => wrapLines(line, 42)).map((line, lineIndex) => (
                          <text key={line} x={box.x + 12} y={box.y + 26 + lineIndex * 18} fill={ink} fontSize="15" fontFamily="Geist, sans-serif">
                            {line}
                          </text>
                        ))}
                </g>
              );
            })}
            {(["retrieve", "check"] as const).map((id) => {
              const index = id === "retrieve" ? 1 : 4;
              const box = sheetBox(index);
              // Hang text is 15 units on an 18-unit line, and each sheet is as tall as its text.
              const refusalLines = wrapLines(CITEBOT_PLATE.refusal, 12);
              const failLines = wrapLines(fail?.text ?? "", 12);
              const reasonLines = wrapLines(fail?.evidence ?? "", 12);
              const reasonTop = 42 + failLines.length * 18 + 6;
              const hangHeight = id === "retrieve" ? 22 + (refusalLines.length - 1) * 18 + 12 : reasonTop + (reasonLines.length - 1) * 18 + 12;
              const hang = { x: box.x, y: box.y + box.h + 16, w: dx - 14, h: hangHeight };
              return (
                <g key={id} data-hang={id}>
                  <line className="hang-leader" data-leader={id} x1={box.x + 16} y1={box.y + box.h} x2={box.x + 16} y2={hang.y} stroke="#111111" strokeWidth="1" strokeDasharray="4 4" />
                  <rect className="sheet-face hang-sheet" x={hang.x} y={hang.y} width={hang.w} height={hang.h} fill="#FBFAF7" stroke="#111111" strokeDasharray="6 4" />
                  {id === "retrieve" ? (
                    refusalLines.map((line, lineIndex) => (
                      <text key={line} x={hang.x + 8} y={hang.y + 22 + lineIndex * 18} fill="#111111" fontSize="15" fontFamily="Geist, sans-serif">
                        {line}
                      </text>
                    ))
                  ) : (
                    <>
                      <g className="fail-mark">
                        <text className="fail-word" x={hang.x + 28} y={hang.y + 16} textAnchor="middle" fill="#C6302A" fontSize="15" fontFamily="ui-monospace, monospace">FAIL</text>
                        <ellipse className="pen-loop" cx={hang.x + 28} cy={hang.y + 12} rx="24" ry="11" fill="none" stroke="#C6302A" strokeWidth="1.4" />
                      </g>
                      {failLines.map((line, lineIndex) => (
                        <text key={line} x={hang.x + 8} y={hang.y + 42 + lineIndex * 18} fill="#111111" fontSize="15" fontFamily="Geist, sans-serif">{line}</text>
                      ))}
                      {reasonLines.map((line, lineIndex) => (
                        <text key={line} x={hang.x + 8} y={hang.y + reasonTop + lineIndex * 18} fill="#111111" fontSize="15" fontFamily="Geist, sans-serif">{line}</text>
                      ))}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="sheet-labels" aria-hidden="true">
            {steps.map((step, index) => {
              const box = sheetBox(index);
              const labelX = box.x + box.w - dx + 8;
              return (
                <p key={step.name} className="leader-name" style={{ left: `${(labelX / 1280) * 100}%`, top: `${((box.y - 22) / 520) * 100}%` }}>
                  {step.name.toUpperCase()}
                </p>
              );
            })}
          </div>
          </div>
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
                  <svg className="fail-mark" viewBox="0 0 78 32" width="78" height="32" role="img" aria-label="FAIL">
                    <text className="fail-word" x="39" y="21" textAnchor="middle" fill="#C6302A" fontSize="13" fontFamily="ui-monospace, monospace">FAIL</text>
                    <ellipse className="pen-loop" cx="39" cy="16" rx="32" ry="13" fill="none" stroke="#C6302A" strokeWidth="1.6" />
                  </svg>
                  <span className="verdict-fail-sentence">{fail?.text}</span> {fail?.evidence}
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
                const twin = dropped && Boolean(bottom);
                return (
                  <span className={`pair${twin ? " is-twin" : ""}`} key={`${top}|${bottom}`}>
                    {dropped ? (
                      <s className="offcut" style={{ textDecoration: "line-through" }}>
                        {top}
                      </s>
                    ) : (
                      <span className="passage-line">{top}</span>
                    )}
                    {top && bottom ? (
                      twin ? (
                        <svg className="hair hair-around" viewBox="0 0 18 20" width="18" height="20" aria-hidden="true">
                          <polyline points="1,1 1,10 9,10 9,20" fill="none" stroke="#111111" strokeWidth="1" />
                        </svg>
                      ) : (
                        <svg className="hair" viewBox="0 0 2 18" width="2" height="18" aria-hidden="true">
                          <line x1="1" y1="0" x2="1" y2="18" stroke="#111111" strokeWidth="1" />
                        </svg>
                      )
                    ) : (
                      <span className="hair hair-gap" />
                    )}
                    <span className="answer-line">{bottom}</span>
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
          <div className="sheet-labels" aria-hidden="true">
            <p className="leader-name" style={{ left: "1.43%", top: "19.44%" }}>HOUSE VOICE</p>
            <p className="leader-name" style={{ left: "80.36%", top: "3.33%" }}>DRAFT</p>
          </div>
          </div>
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
