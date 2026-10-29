import { TextLine } from "@/components/TextLine";
import { CITEBOT, CLAIMS } from "@/lib/copy";

export function CiteBotCheck() {
  return (
    <div className="main">
      <h3 className="ptitle">{CITEBOT.name}</h3>
      <p className="g1 summary">{CITEBOT.summary}</p>
      <ul className="ev" aria-label="Claims from one answer">
        {CLAIMS.map((claim) => (
          <li
            key={claim.text}
            className={claim.verdict === "Fail" ? "row fail" : "row"}
          >
            <div>
              <p className="claim">
                <TextLine text={claim.text} />
              </p>
              <p className="src">
                <TextLine text={claim.source} />
              </p>
            </div>
            <p className="v">{claim.verdict}</p>
          </li>
        ))}
      </ul>
      <p className="cap">{CITEBOT.caption}</p>
      <div className="links">
        {CITEBOT.links.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
