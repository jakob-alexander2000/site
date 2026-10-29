import { Fragment, type ReactNode } from "react";

/**
 * Chromium adds letter-spacing after a hyphen, which opens a gap in
 * words such as citebot-evals and desk-index. The hyphen glyph is
 * wrapped so its tracking stays at zero even if a parent sets tracking.
 */
export function TextLine({ text }: { text: string }): ReactNode {
  const parts = text.split("-");
  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) => (
    <Fragment key={`${index}:${part}`}>
      {index > 0 ? <span className="hyphen">-</span> : null}
      {part}
    </Fragment>
  ));
}
