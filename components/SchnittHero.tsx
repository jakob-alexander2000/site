import { RunLink } from "@/components/RunLink";
import { SchnittStage } from "@/components/SchnittStage";
import { contact } from "@/lib/contact";
import { BUILT_LINK, HERO_AFTER, HERO_BEFORE, HERO_SCROLL, HERO_SUPPORT, HERO_WORD, PATTERN_LABEL, RUN_LINK } from "@/lib/schnitt-copy";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { LOOKS } from "@/lib/looks";

const source = LOOKS.find((look) => look.id === "citebot")?.source ?? contact.github;

export function SchnittHero({ run }: { run: SchnittRun }) {
  return (
    <section className="schnitt" id="top" data-schnitt aria-labelledby="name">
      <div className="schnitt-sticky">
        <header className="schnitt-head">
          <h1 id="name">Jakob Alex</h1>
          <nav className="schnitt-nav" aria-label="Work">
            <a href="#citebot" aria-label="01 CiteBot">
              01
            </a>
            <a href="#autopsy" aria-label="02 Retrieval Autopsy">
              02
            </a>
            <a href="#voice" aria-label="03 Voice check">
              03
            </a>
          </nav>
          {contact.email ? <a href={`mailto:${contact.email}`}>Email</a> : null}
          <a href={contact.github}>GitHub</a>
        </header>
        <div className="schnitt-copy">
          <p className="display" id="opening">
            {HERO_BEFORE}
            <em>{HERO_WORD}</em>
            {HERO_AFTER}
          </p>
          <p className="support">
            {HERO_SUPPORT}
            <span className="support-scroll"> {HERO_SCROLL}</span>
          </p>
          <p className="actions">
            <RunLink href="#schnitt-layers">{RUN_LINK}</RunLink>
            <a href={source}>{BUILT_LINK}</a>
          </p>
          <p className="numeral" aria-hidden="true">
            {run.evalCount.passed}
          </p>
        </div>
        <SchnittStage run={run} />
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
