import { ContactBlock } from "@/components/ContactBlock";
import { LookView } from "@/components/LookView";
import { Pen } from "@/components/Pen";
import { Volume } from "@/components/Volume";
import { BACKGROUND, LOOKS, OPENING_AFTER, OPENING_BEFORE, OPENING_WORD } from "@/lib/looks";

export default function Home() {
  return (
    <main>
      <Volume>
        <section className="plane screen is-front" id="top" data-i="0" aria-labelledby="name">
          <h1 id="name" tabIndex={-1}>
            Jakob Alex
          </h1>
          <p className="lede" id="opening">
            {OPENING_BEFORE}
            <Pen italic>{OPENING_WORD}</Pen>
            {OPENING_AFTER}
          </p>
          <p className="quiet">{BACKGROUND}</p>
          <ContactBlock />
          <nav className="index" aria-label="Looks">
            <a href="#citebot">01 CiteBot</a>
            <a href="#autopsy">02 Retrieval Autopsy</a>
            <a href="#voice">03 Voice check</a>
          </nav>
        </section>
        {LOOKS.map((look, index) => (
          <LookView key={look.id} look={look} index={index + 1} />
        ))}
      </Volume>
    </main>
  );
}
