import { SchnittMount } from "@/components/SchnittStage";
import { SchnittSheets } from "@/components/SchnittSheets";
import { contact } from "@/lib/contact";
import { HERO_AFTER, HERO_BEFORE, HERO_SCROLL, HERO_SUPPORT, HERO_WORD, PARTS_LINK } from "@/lib/schnitt-copy";
import type { SchnittRun } from "@/lib/schnitt-extract";
import { SHEETS } from "@/lib/plates";

export function SchnittHero({ run }: { run: SchnittRun }) {
  return (
    <section className="schnitt" id="top" data-schnitt aria-labelledby="name">
      <div className="schnitt-sticky">
        <header className="schnitt-head">
          <h1 id="name">Jakob Alex</h1>
          <nav className="schnitt-nav" aria-label="Sections">
            {SHEETS.map((sheet) => (
              <a key={sheet.id} href={`#${sheet.id}`} aria-label={sheet.label}>
                {sheet.name}
              </a>
            ))}
          </nav>
          {contact.email ? <a href={`mailto:${contact.email}`}>Email</a> : null}
        </header>
        <div className="schnitt-copy">
          <h2 className="display" id="opening">
            {HERO_BEFORE}
            <em>{HERO_WORD}</em>
            {HERO_AFTER}
          </h2>
          <p className="support">
            {HERO_SUPPORT}
            <span className="support-scroll"> {HERO_SCROLL}</span>
          </p>
          <p className="actions">
            {contact.email ? <a href={`mailto:${contact.email}`}>Email me</a> : null}
          </p>
        </div>
        <div className="stage-spacer" aria-hidden="true" />
        <div className="schnitt-stage" id="schnitt-layers">
          <SchnittSheets run={run} />
          <SchnittMount />
        </div>
        <footer className="schnitt-foot">
          <p className="hero-continue">
            <a href="#work" data-hero-thread>
              {PARTS_LINK}
              <span className="hero-thread" aria-hidden="true" />
            </a>
          </p>
          <p>
            <span>
              CiteBot · {run.evalCount.caption} · offline eval · {run.evalCount.dated}
            </span>
            <span>{run.recordedLabel}</span>
          </p>
        </footer>
      </div>
    </section>
  );
}
