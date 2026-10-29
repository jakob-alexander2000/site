import { DeskDemo } from "@/components/DeskDemo";
import { EvalDemo } from "@/components/EvalDemo";
import { IndexDemo } from "@/components/IndexDemo";
import { ScrollPlay, TryButton } from "@/components/play";
import { Proof } from "@/components/Proof";
import { Shell } from "@/components/Shell";
import { CITEBOT, HERO_LEDE, PROJECTS, READING } from "@/lib/copy";

function Links({
  links,
}: {
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div className="links">
      {links.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <Shell current="work">
      <section className="intro frame" aria-labelledby="name">
        <p className="kicker">Berlin</p>
        <h1 id="name">Jakob Alex</h1>
        <p className="lede">{HERO_LEDE}</p>
        <div className="tries">
          <div className="try-pair">
            <TryButton targetId="proof-stage" name="CiteBot" />
            <a href={CITEBOT.links[0].href}>Live link</a>
          </div>
          <div className="try-pair">
            <TryButton targetId="eval-stage" name="citebot-evals" />
            <a href={PROJECTS.evals.links[0].href}>Live link</a>
          </div>
          <div className="try-pair">
            <TryButton targetId="desk-stage" name="Desk" />
            <a href={PROJECTS.desk.links[0].href}>Live link</a>
          </div>
          <div className="try-pair">
            <TryButton targetId="index-stage" name="desk-index" />
            <a href={PROJECTS.index.links[0].href}>Live link</a>
          </div>
        </div>
      </section>

      <section className="proof frame" aria-labelledby="citebot-title">
        <div className="section-head">
          <h2 id="citebot-title">CiteBot</h2>
          <p className="kind">Recorded run</p>
        </div>
        <p className="idea">{CITEBOT.idea}</p>
        <Proof />
        <p className="problem">{CITEBOT.problem}</p>
        <p className="made">{CITEBOT.made}</p>
        <Links links={CITEBOT.links} />
      </section>

      <section className="work frame" id="work" aria-labelledby="work-title">
        <div className="section-head">
          <h2 id="work-title">Selected work</h2>
        </div>
        <p className="idea">
          Each one runs on this page. Two places are open.
        </p>
        <div className="cards">
          <ScrollPlay id="eval-stage">
          <article className="card">
            <div className="section-head">
              <h3>{PROJECTS.evals.name}</h3>
              <p className="kind">
                <span className="live-dot" aria-hidden="true" />
                {PROJECTS.evals.kind}
              </p>
            </div>
            <p className="idea">{PROJECTS.evals.idea}</p>
            <p className="problem">{PROJECTS.evals.problem}</p>
            <EvalDemo />
            <p className="note">{PROJECTS.evals.note}</p>
            <p className="made">{PROJECTS.evals.made}</p>
            <Links links={PROJECTS.evals.links} />
          </article>
          </ScrollPlay>

          <ScrollPlay id="desk-stage">
          <article className="card">
            <div className="section-head">
              <h3>{PROJECTS.desk.name}</h3>
              <p className="kind">
                <span className="live-dot" aria-hidden="true" />
                {PROJECTS.desk.kind}
              </p>
            </div>
            <p className="idea">{PROJECTS.desk.idea}</p>
            <p className="problem">{PROJECTS.desk.problem}</p>
            <DeskDemo />
            <p className="note">{PROJECTS.desk.note}</p>
            <p className="made">{PROJECTS.desk.made}</p>
            <Links links={PROJECTS.desk.links} />
          </article>
          </ScrollPlay>

          <ScrollPlay id="index-stage">
          <article className="card">
            <div className="section-head">
              <h3>{PROJECTS.index.name}</h3>
              <p className="kind">
                <span className="live-dot" aria-hidden="true" />
                {PROJECTS.index.kind}
              </p>
            </div>
            <p className="idea">{PROJECTS.index.idea}</p>
            <p className="problem">{PROJECTS.index.problem}</p>
            <IndexDemo />
            <p className="note">{PROJECTS.index.note}</p>
            <p className="made">{PROJECTS.index.made}</p>
            <Links links={PROJECTS.index.links} />
          </article>
          </ScrollPlay>

          <div className="slot">
            <h3>Retrieval Autopsy</h3>
            <p>Not on this page yet.</p>
          </div>
          <div className="slot">
            <h3>Style Distance</h3>
            <p>Not on this page yet.</p>
          </div>
        </div>
      </section>

      <section className="reading frame" id="reading" aria-labelledby="reading-title">
        <h2 id="reading-title">Reading</h2>
        <p>{READING}</p>
      </section>
    </Shell>
  );
}
