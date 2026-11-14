import { BACKGROUND } from "@/lib/looks";
import { contact } from "@/lib/contact";
import { CITEBOT_PLATE, DROPPED, REVISION, STYLE_DISTANCE } from "@/lib/diagrams";
import { FLAGSHIP_CASES } from "@/lib/flagship";
import { FOOTER_SHEETS } from "@/lib/plates";
import { SKILLS } from "@/lib/skills";

function Rail() {
  return (
    <svg className="rail" viewBox="0 0 640 120" aria-hidden="true">
      <line x1="36" y1="96" x2="600" y2="24" stroke="#111111" strokeWidth="1" />
      {Array.from({ length: 6 }, (_, index) => {
        const x = 36 + index * 104;
        const y = 96 - index * 14;
        return <rect key={index} x={x} y={y - 28} width="72" height="36" fill="#FBFAF7" stroke="#111111" />;
      })}
    </svg>
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

export function Plates() {
  return (
    <div className="plates">
      <section className="plate" id="citebot" aria-labelledby="citebot-title">
        <p className="kicker">01 · CITEBOT</p>
        <h2 id="citebot-title">{CITEBOT_PLATE.headline}</h2>
        <p className="body">{CITEBOT_PLATE.body}</p>
        <figure>
          <Rail />
          <figcaption>Six sheets on a rail for the paid-leave question. Failure paths are dashed.</figcaption>
        </figure>
        <ol>
          {["Question", "Retrieve", "Draft", "Split", "Check", "Verdict"].map((step) => (
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
        <p className="plate-meta">Recorded fixture · 9 Nov 2026</p>
      </section>

      <section className="plate" id="autopsy" aria-labelledby="autopsy-title">
        <p className="kicker">02 · AUTOPSY</p>
        <h2 id="autopsy-title">{DROPPED.headline}</h2>
        <p className="body">{DROPPED.body}</p>
        <figure>
          <svg className="align" viewBox="0 0 640 80" aria-hidden="true">
            <text x="0" y="24" fill="#111111" fontSize="14">
              Passage
            </text>
            <text x="0" y="64" fill="#111111" fontSize="14">
              Answer
            </text>
            <line x1="96" y1="20" x2="620" y2="20" stroke="#111111" />
            <line x1="96" y1="60" x2="420" y2="60" stroke="#C6302A" />
          </svg>
          <figcaption>Kept words stay tied. Dropped words are struck and marked FAIL.</figcaption>
        </figure>
        <p className="kicker">Passage</p>
        <p className="body">{DROPPED.passage}</p>
        <p className="kicker">Answer</p>
        <p className="body">{DROPPED.answer}</p>
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
          <svg className="depth" viewBox="0 0 640 160" aria-hidden="true">
            <rect x="40" y="36" width="220" height="88" fill="#FBFAF7" stroke="#111111" />
            <rect x="360" y="16" width="220" height="88" fill="#FBFAF7" stroke="#111111" />
            <line x1="260" y1="80" x2="360" y2="60" stroke="#111111" />
          </svg>
          <figcaption>House voice at zero. The draft sits back by its distance. Synthetic demo.</figcaption>
        </figure>
        <p className="kicker">{STYLE_DISTANCE.label}</p>
        <p className="figure-row">
          <span>Drifted drafts {STYLE_DISTANCE.drifted}</span>
          <span>{STYLE_DISTANCE.driftedReading}</span>
        </p>
        <p className="figure-row">
          <span>Held-out pages {STYLE_DISTANCE.heldOut}</span>
          <span>{STYLE_DISTANCE.heldOutReading}</span>
        </p>
        <ol>
          <li>House voice at zero</li>
          <li>Held-out pages {STYLE_DISTANCE.heldOut}, {STYLE_DISTANCE.heldOutReading}</li>
          <li>Drifted drafts {STYLE_DISTANCE.drifted}, {STYLE_DISTANCE.driftedReading}</li>
        </ol>
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
