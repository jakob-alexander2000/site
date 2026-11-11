import { DIAGRAM_TEXT, OPENING } from "@/lib/copy";
import type { Flagship, ShelfEntry } from "@/lib/close-reading";
import { DROPPED, PIPELINE, WORKED_QUESTION } from "@/lib/diagrams";
import { getFlagship } from "@/lib/flagship";
import { PROOF_SHELF } from "@/lib/proof-shelf";
import { SCORES } from "@/lib/scores";
import { SKILLS, type Skill } from "@/lib/skills";
import { contact } from "@/lib/contact";

const GRID_SCRIPT = `(function(){
  function apply(){
    var el=document.querySelector("[data-grid]");
    if(!el) return;
    var w=window.innerWidth,h=window.innerHeight,columns="4",margin="20px";
    if(h<=430&&w>=700){columns="4";margin="20px";}
    else if(w>=1280){columns="12";margin="96px";}
    else if(w>=744){columns="8";margin="48px";}
    el.setAttribute("data-columns",columns);
    el.style.paddingLeft=margin;
    el.style.paddingRight=margin;
  }
  apply();
  addEventListener("resize",apply);
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){
    document.documentElement.dataset.reduced="flat";
  }
  var root=document.querySelector("[data-flagship]");
  if(!root) return;
  var reduced=document.documentElement.dataset.reduced==="flat";
  function sentences(){return Array.prototype.slice.call(root.querySelectorAll("[data-sentence]"));}
  function active(){return root.querySelector("[aria-pressed='true']")||sentences()[0];}
  function select(button){
    if(!button) return;
    var id=button.getAttribute("data-sentence-id");
    sentences().forEach(function(el){
      var on=el===button;
      el.setAttribute("aria-pressed", on?"true":"false");
      if(on) el.setAttribute("data-active-sentence", id);
      else el.removeAttribute("data-active-sentence");
    });
    root.querySelectorAll("[data-thread]").forEach(function(thread){
      var on=thread.getAttribute("data-sentence-id")===id;
      thread.setAttribute("data-playing","false");
      if(on && !reduced){
        void thread.offsetWidth;
        thread.setAttribute("data-playing","true");
      }
    });
  }
  root.addEventListener("click", function(event){
    var sentence=event.target.closest("[data-sentence]");
    if(sentence) select(sentence);
    if(event.target.closest("[data-replay]")) select(active());
  });
  if(!reduced){
    var start=function(){
      var script=document.createElement("script");
      script.src="/close-reading-stage.js";
      script.async=true;
      script.onload=function(){
        var stage=window.__closeReadingStage;
        var canvas=document.querySelector("canvas[data-stage]");
        if(stage && canvas) stage.mount(canvas);
      };
      script.onerror=function(){ script.remove(); };
      document.body.appendChild(script);
    };
    if(window.requestIdleCallback) requestIdleCallback(start);
    else setTimeout(start, 1);
  }
})();`;

export function CloseReadingPage({
  flagship,
  shelf,
  skills,
}: {
  flagship?: Flagship | null;
  shelf?: readonly ShelfEntry[];
  skills?: readonly Skill[];
} = {}) {
  const item = flagship === undefined ? getFlagship() : flagship;
  const rows = shelf === undefined ? PROOF_SHELF : shelf;
  const gallery = skills === undefined ? SKILLS : skills;
  if (!item) return null;
  const before = "I studied comparative literature. Checking a sentence against its ";
  const accent = "passage";
  const after = " is the same job.";
  return (
    <main id="top" data-page="close-reading" data-grid data-columns="4">
      <p className="name" data-type="mono">
        Jakob Alex
      </p>
      <p className="links">
        <a href={contact.github}>GitHub</a>
        <a href={`mailto:${contact.email}`}>Email</a>
        {item.tryHref ? <a href={item.tryHref}>Try it</a> : null}
      </p>
      <h1 id="opening" data-opening data-type="display">
        {OPENING}
      </h1>
      <div data-flagship data-block="scene">
        <div className="sentences">
          {item.sentences.map((sentence, index) => (
            <div key={sentence.id}>
              <button
                type="button"
                data-sentence
                data-sentence-id={sentence.id}
                data-verdict={sentence.verdict}
                data-active-sentence={index === 0 ? sentence.id : undefined}
                aria-pressed={index === 0}
              >
                {sentence.verdict === "fail" ? `Fail. ${sentence.text}` : sentence.text}
              </button>
              <span data-tie>{index + 1}</span>
              <span
                data-thread
                data-sentence-id={sentence.id}
                data-playing="false"
                data-thread-end={sentence.verdict === "unsupported" ? "open" : "closed"}
              />
            </div>
          ))}
        </div>
        <div>
          {item.sentences.map((sentence) => (
            <p key={sentence.id} data-role="body" data-type="body">
              {sentence.evidence}
            </p>
          ))}
        </div>
        <div className="fold-links">
          <button type="button" data-replay>
            Replay
          </button>
        </div>
        <p data-role="body" data-type="body">
          {item.recorded}
        </p>
        <p data-passage data-role="body" data-type="body">
          {item.passage}
        </p>
        <canvas data-stage aria-hidden="true" />
      </div>
      <p data-role="body" data-type="body" className="craft">
        {before}
        <em>{accent}</em>
        {after}
      </p>
      <p data-role="body" data-type="body" id="diagrams">
        {DIAGRAM_TEXT}
      </p>
      {item.useCases.length ? (
        <section data-block="uses" aria-labelledby="uses-title">
          <h2 id="uses-title" data-type="heading">
            {item.title}
          </h2>
          <ul>
            {item.useCases.map((useCase) => (
              <li key={useCase.question} data-role="body" data-type="body">
                {useCase.question} <span data-type="mono">{useCase.source}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section data-block="dropped" aria-labelledby="dropped-title">
        <h2 id="dropped-title" data-type="heading">
          A dropped condition
        </h2>
        <p data-role="body" data-type="body" className="paper">
          {DROPPED.passage}
        </p>
        <p data-role="body" data-type="body">
          {DROPPED.answer}
        </p>
        <ul className="checks">
          {DROPPED.checks.map((check) => (
            <li key={check.name} data-verdict={check.verdict} data-type="body">
              {check.verdict === "fail" ? `Fail. ${check.name}` : `${check.name} pass`}
            </li>
          ))}
        </ul>
      </section>
      <section data-block="pipeline" aria-labelledby="pipeline-title">
        <h2 id="pipeline-title" data-type="heading">
          How a check runs
        </h2>
        <p data-role="body" data-type="body">
          {WORKED_QUESTION}
        </p>
        <ol className="pipeline">
          {PIPELINE.map((step, index) => (
            <li key={step} data-type="body">
              {index + 1}. {step}
            </li>
          ))}
        </ol>
        <svg className="pipeline-svg" viewBox="0 0 640 80" role="img" aria-label="Question, retrieve, draft, split, check, verdict">
          {PIPELINE.map((step, index) => (
            <g key={step} transform={`translate(${index * 106},8)`}>
              <rect width="96" height="64" fill="none" stroke="#2A2A2A" />
              <text x="8" y="36" fill="#F5F5F2" fontSize="16">
                {index + 1}. {step}
              </text>
            </g>
          ))}
        </svg>
      </section>
      <section data-block="scores" aria-labelledby="scores-title">
        <h2 id="scores-title" data-type="heading">
          Results
        </h2>
        <ul className="scores">
          {SCORES.map((score) => (
            <li key={score.id} data-score={score.id} data-type={score.id.endsWith("evals") ? "display" : "body"}>
              {score.value} {score.label}
              {score.date ? ` ${score.date}` : ""}
            </li>
          ))}
        </ul>
        <ol className="matrix" aria-label="18 example answers">
          {Array.from({ length: 18 }, (_, index) => (
            <li key={index} data-type="body">
              {index + 1} pass
            </li>
          ))}
        </ol>
      </section>
      <section data-block="limits" aria-labelledby="limits-title">
        <h2 id="limits-title" data-type="heading">
          Limits
        </h2>
        <p data-role="body" data-type="body">
          The span check matches words. It does not judge meaning. The golden run uses a stand-in model, so it catches code changes. The offline eval scores example answers written in advance, and it does not call a model. The sample handbook is not a policy.
        </p>
      </section>
      <section data-block="shelf" aria-labelledby="shelf-title">
        <h2 id="shelf-title" data-type="heading">
          Proof shelf
        </h2>
        <ul>
          {rows.map((entry) => (
            <li key={entry.id} data-shelf-entry={entry.id}>
              <p data-claim data-role="body" data-type="body">
                {entry.claim}
              </p>
              <a data-artifact={entry.id} href={entry.artifact.href}>
                {entry.artifact.label}
              </a>
              <p data-limit data-role="body" data-type="body">
                {entry.limit}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section data-block="skills" aria-label="Skills">
        <ul data-skill-list>
          {gallery.map((skill) => (
            <li key={skill.id} data-skill={skill.id}>
              <h2 data-type="heading">{skill.name}</h2>
              <p data-skill-line data-role="body" data-type="body">
                {skill.line}
              </p>
              <ol data-diagram={skill.id}>
                {skill.steps.map((step) => (
                  <li key={step} data-type="body">
                    {step}
                  </li>
                ))}
              </ol>
              <a data-proof={skill.id} href={skill.proof.href}>
                {skill.proof.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <footer>
        <div id="contact">
          <a href={contact.github}>GitHub</a>
          <a href={`mailto:${contact.email}`}>Email</a>
        </div>
      </footer>
      <script dangerouslySetInnerHTML={{ __html: GRID_SCRIPT }} />
    </main>
  );
}
