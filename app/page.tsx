import type { ReactNode } from "react";
import { AutopsyFace } from "@/components/AutopsyFace";
import { CiteBotFace } from "@/components/CiteBotFace";
import { DeskFace } from "@/components/DeskFace";
import { EvalsFace } from "@/components/EvalsFace";
import { IndexFace } from "@/components/IndexFace";
import { StyleFace } from "@/components/StyleFace";
import { Instrument } from "@/components/Instrument";
import { SelectedIndex } from "@/components/SelectedIndex";
import { Shell } from "@/components/Shell";
import { EYE, HERO, SCOPE } from "@/lib/copy";
import { scoreSavedFixture } from "@/lib/eval-run";
import { PROJECTS, type ProjectId } from "@/lib/projects";

export default function Home() {
  const marks = scoreSavedFixture();
  const demos: Record<ProjectId, ReactNode> = {
    citebot: <CiteBotFace />,
    "citebot-evals": <EvalsFace marks={marks} />,
    "retrieval-autopsy": <AutopsyFace />,
    "style-distance": <StyleFace />,
    desk: <DeskFace />,
    "desk-index": <IndexFace />,
  };

  return (
    <Shell current="instruments">
      <section className="hero" aria-labelledby="name">
        <p className="kicker">Berlin</p>
        <h1 id="name">Jakob Alex</h1>
        <p className="lead">{HERO}</p>
        <p className="eye">{EYE}</p>
      </section>

      <section id="instruments" className="catalogue" aria-labelledby="catalogue-label">
        <h2 id="catalogue-label" className="kicker">
          Selected work
        </h2>
        <p className="scope">{SCOPE}</p>
        <SelectedIndex />
        <div className="grid">
          {PROJECTS.map((project) => (
            <Instrument
              key={project.id}
              id={project.id}
              model={project.model}
              mark={project.mark}
              name={project.name}
              idea={project.idea}
              caption={project.caption}
              problem={project.problem}
              made={project.made}
              stack={project.stack}
              links={project.links}
            >
              {demos[project.id]}
            </Instrument>
          ))}
        </div>
      </section>
    </Shell>
  );
}
