import { FlowDiagram } from "@/components/FlowDiagram";
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

export function LookView({ look, index }: { look: Look; index: number }) {
  const proof = look.proofs[0];
  return (
    <section className="plane screen" id={look.id} data-i={index} aria-labelledby={`${look.id}-title`}>
      <div className="run">
        <a href="#top">Jakob Alex</a>
        <nav aria-label="Looks">
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
      <div className="plane-body">
        <div className="mast">
          <p className="tag">LOOK {look.index}</p>
          <h2 id={`${look.id}-title`} tabIndex={-1}>
            {look.name}
          </h2>
          <p className="tag">{look.mark}</p>
        </div>
        <div className="story">
          {look.paragraphs.map((paragraph) => (
            <p key={paragraph} className="copy">
              {withPen(paragraph, look.pen)}
            </p>
          ))}
        </div>
        <ul className="links">
          {visibleLive(look) ? (
            <li>
              <a href={look.live} aria-label={`Live · ${look.name}`}>
                Live
              </a>
            </li>
          ) : null}
          <li>
            <a href={look.source} aria-label={`Source · ${look.name}`}>
              Source
            </a>
          </li>
          {proof ? (
            <li>
              <a href={proofHref(proof)} aria-label={`Proof · ${look.name}`}>
                Proof
              </a>
            </li>
          ) : null}
        </ul>
        <div className="evidence">
          <FlowDiagram id={look.id} name={look.name} />
          <figure className="frame">
            <ProductStill src={look.still} width={look.frame.width} height={look.frame.height} alt={look.alt} />
            <figcaption>{look.caption}</figcaption>
            {visibleLive(look) ? (
              <a className="product-link" href={look.live} aria-label={`Product page · ${look.name}`}>
                Product page
              </a>
            ) : (
              <p className="tag">{PRODUCT_PAGE_COMING}</p>
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}
