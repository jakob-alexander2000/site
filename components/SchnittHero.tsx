import { ContactBlock } from "@/components/ContactBlock";
import { RunLink } from "@/components/RunLink";
import { SchnittStage } from "@/components/SchnittStage";
import { BUILT_LINK, HERO_AFTER, HERO_BEFORE, HERO_SUPPORT, HERO_WORD, PATTERN_LABEL, RUN_LINK } from "@/lib/schnitt-copy";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { LOOKS } from "@/lib/looks";

const source = LOOKS.find((look) => look.id === "citebot")?.source ?? "https://github.com/jakob-alexander2000/citebot";

export function SchnittHero({ run }: { run: SchnittRun }) {
  return (
    <section className="schnitt" id="top" data-schnitt aria-labelledby="name">
      <div className="schnitt-sticky">
        <header className="schnitt-head">
          <h1 id="name">Jakob Alex</h1>
          <nav className="schnitt-nav" aria-label="Work">
            <a href="#citebot">01 CiteBot</a>
            <a href="#autopsy">02 Retrieval Autopsy</a>
            <a href="#voice">03 Voice check</a>
          </nav>
          <ContactBlock />
        </header>
        <div className="schnitt-copy">
          <p className="display" id="opening">
            {HERO_BEFORE}
            <em>{HERO_WORD}</em>
            {HERO_AFTER}
          </p>
          <p className="support">{HERO_SUPPORT}</p>
          <p className="actions">
            <RunLink href="#schnitt-layers">{RUN_LINK}</RunLink>
            <a href={source}>{BUILT_LINK}</a>
          </p>
        </div>
        <SchnittStage run={run} />
        <p className="numeral" aria-hidden="true">
          {run.evalCount.passed}
        </p>
        <footer className="schnitt-foot">
          <p>{PATTERN_LABEL}</p>
          <p>
            <span>
              {run.evalCount.caption} · offline eval · {run.evalCount.dated}
            </span>
            <span>{run.recordedLabel}</span>
          </p>
        </footer>
      </div>
    </section>
  );
}
