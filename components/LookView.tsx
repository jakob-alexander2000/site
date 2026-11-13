import { Pen } from "@/components/Pen";
import { ProductStill } from "@/components/ProductStill";
import { PRODUCT_PAGE_COMING, proofHref, visibleLive, type Look } from "@/lib/looks";

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
        <nav aria-label={`Look ${look.index}`}>
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
      </div>
      <p className="tag">LOOK {look.index}</p>
      <h2 id={`${look.id}-title`}>{look.name}</h2>
      <p className="tag">{look.mark}</p>
      {look.paragraphs.map((paragraph) => (
        <p key={paragraph} className="copy">
          {withPen(paragraph, look.pen)}
        </p>
      ))}
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
      <figure className="frame">
        <ProductStill src={look.still} width={look.frame.width} height={look.frame.height} alt={look.alt} />
        <figcaption>{look.caption}</figcaption>
        {visibleLive(look) ? (
          <a className="product-link" href={look.live}>
            Product page
          </a>
        ) : (
          <p className="tag">{PRODUCT_PAGE_COMING}</p>
        )}
      </figure>
    </section>
  );
}
