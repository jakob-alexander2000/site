import { CiteBotFace } from "@/components/CiteBotFace";
import { DeskFace } from "@/components/DeskFace";
import { EvalsFace } from "@/components/EvalsFace";
import { IndexFace } from "@/components/IndexFace";
import { Instrument } from "@/components/Instrument";
import { SelectedIndex } from "@/components/SelectedIndex";
import { Shell } from "@/components/Shell";
import { EYE, HERO } from "@/lib/copy";
import { scoreSavedFixture } from "@/lib/eval-run";
import { CITEBOT, DESK, EVALS, INDEX } from "@/lib/projects";

export default function Home() {
  const marks = scoreSavedFixture();
  const passed = marks.filter(Boolean).length;
  const evalsCaption = `Try it. ${marks.length} saved answers score ${passed} of ${marks.length}.`;

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
        <SelectedIndex />
        <div className="grid">
          <Instrument {...CITEBOT}>
            <CiteBotFace />
          </Instrument>
          <Instrument {...EVALS} caption={evalsCaption}>
            <EvalsFace marks={marks} />
          </Instrument>
          <Instrument {...DESK}>
            <DeskFace />
          </Instrument>
          <Instrument {...INDEX}>
            <IndexFace />
          </Instrument>
          <article className="instrument open" id="retrieval-autopsy" aria-labelledby="retrieval-autopsy-title">
            <div className="plate">
              <div className="plate-top">
                <span className="model">Bay 05</span>
                <span className="kicker">Open</span>
              </div>
              <h3 id="retrieval-autopsy-title">Retrieval Autopsy</h3>
              <p className="caption">Room for a later tool.</p>
              <div className="well empty" aria-hidden="true">
                <span className="plus">+</span>
              </div>
            </div>
          </article>
          <article className="instrument open" id="style-distance" aria-labelledby="style-distance-title">
            <div className="plate">
              <div className="plate-top">
                <span className="model">Bay 06</span>
                <span className="kicker">Open</span>
              </div>
              <h3 id="style-distance-title">Style Distance</h3>
              <p className="caption">Room for a later tool.</p>
              <div className="well empty" aria-hidden="true">
                <span className="plus">+</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </Shell>
  );
}
