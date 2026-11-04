import { DitherStage } from "@/components/DitherStage";
import { Pen } from "@/components/Pen";
import { proofHref, visibleLive, type Look } from "@/lib/looks";

function withPen(text: string, word?: string) {
  if (!word) return text;
  const index = text.indexOf(word);
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <Pen>{word}</Pen>
      {text.slice(index + word.length)}
    </>
  );
}

export function LookView({ look }: { look: Look }) {
  const proof = look.proofs[0];
  return (
    <section className="screen" id={look.id} aria-labelledby={`${look.id}-title`}>
      <div className="run">
        <a href="#top">Jakob Alex</a>
        <nav aria-label="Looks">
          <a href="#citebot">01</a>
          <a href="#autopsy">02</a>
          <a href="#voice">03</a>
        </nav>
      </div>
      <p className="tag">LOOK {look.index}</p>
      <h2 id={`${look.id}-title`}>{look.name}</h2>
      <p className="tag">{look.mark}</p>
      {look.paragraphs.map((paragraph) => (
        <p key={paragraph} className="copy">
          {withPen(paragraph, look.pen)}
        </p>
      ))}
      <DitherStage
        name={look.name}
        src={look.clip}
        poster={look.poster}
        width={look.frame.width}
        height={look.frame.height}
        caption={look.caption}
        stillFrom={look.stillFrom}
        alt={look.alt}
      />
      <ul className="links">
        {visibleLive(look) ? (
          <li>
            <a href={look.live}>Live</a>
          </li>
        ) : null}
        <li>
          <a href={look.source}>Source</a>
        </li>
        {proof ? (
          <li>
            <a href={proofHref(proof)}>Proof</a>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
