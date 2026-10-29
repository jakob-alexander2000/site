import { ReplayButton } from "@/components/ReplayButton";

const CAPTIONS = [
  "A question is asked.",
  "The answer splits into separate claims.",
  "One claim is a wrong draft, planted on purpose.",
  "Each claim draws a line to the sentence on the page.",
  "From a real run and the evaluation set. The third draft is wrong on purpose; the check catches it.",
];

export function Proof() {
  return (
    <div className="stage" id="proof-stage">
      <div className="stage-tools">
        <div className="caps" aria-live="polite">
          {CAPTIONS.map((caption, index) => (
            <p
              key={caption}
              className={index === CAPTIONS.length - 1 ? "cap last" : "cap"}
            >
              {caption}
            </p>
          ))}
        </div>
        <ReplayButton targetId="proof-stage" />
      </div>

      <p className="ask">
        How many paid vacation days do full-time employees get?
      </p>

      <div className="board">
        <p className="answer">
          Full-time employees receive 30 days of paid vacation per calendar
          year. Unused vacation carries over until March 31 of the following
          year.
        </p>

        <div className="pair">
          <div className="claim">
            <p>
              Full-time employees receive 30 days of paid vacation per calendar
              year.
            </p>
            <p className="src">pto-and-leave.md</p>
            <span className="v">Pass</span>
          </div>
          <div className="bridge" aria-hidden="true" />
          <blockquote className="passage">
            <p className="file">pto-and-leave.md</p>
            <p>
              Full-time employees receive{" "}
              <mark>30 days of paid vacation per calendar year</mark>, plus
              German public holidays observed in Berlin.
            </p>
          </blockquote>
        </div>

        <div className="pair">
          <div className="claim">
            <p>
              Unused vacation carries over until March 31 of the following
              year.
            </p>
            <p className="src">pto-and-leave.md</p>
            <span className="v">Pass</span>
          </div>
          <div className="bridge" aria-hidden="true" />
          <blockquote className="passage">
            <p>
              Unused PTO does not carry over past{" "}
              <mark>March 31 of the following year</mark> unless a manager
              approves an exception in writing.
            </p>
          </blockquote>
        </div>

        <article className="row fail">
          <div className="claim">
            <p>Full-time employees receive 25 days of paid vacation.</p>
            <p className="src">Planted wrong draft. The page says 30.</p>
            <span className="v">Fail</span>
          </div>
          <div className="bridge" aria-hidden="true" />
          <blockquote className="passage">
            <p>
              Full-time employees receive <mark>30 days</mark> of paid vacation
              per calendar year.
            </p>
            <p className="src">Planted wrong draft. The page says 30.</p>
          </blockquote>
        </article>
      </div>
    </div>
  );
}
