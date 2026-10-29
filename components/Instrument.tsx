import type { ReactNode } from "react";
import { DECISIONS, visibleDecision } from "@/lib/copy";
import type { ProjectLink } from "@/lib/projects";

type Props = {
  id: string;
  model: string;
  mark: string;
  name: string;
  idea: string;
  caption: string;
  problem: string;
  made: string;
  stack: string;
  links: readonly ProjectLink[];
  children: ReactNode;
};

export function Instrument({
  id,
  model,
  mark,
  name,
  idea,
  caption,
  problem,
  made,
  stack,
  links,
  children,
}: Props) {
  const titleId = `${id}-title`;
  const captionId = `${id}-caption`;
  const decision = visibleDecision(DECISIONS[id]);

  return (
    <article className="instrument" id={id} aria-labelledby={titleId}>
      <p className="plate-top">
        <span className="model">{model}</span>
        <span className="kicker">{mark}</span>
      </p>
      <h3 id={titleId}>{name}</h3>
      <p className="idea">{idea}</p>
      {children}
      <p id={captionId} className="caption">
        {caption}
      </p>
      <p className="problem">{problem}</p>
      <p className="made">{made}</p>
      {decision ? <p className="decision">{decision}</p> : null}
      <p className="meta">{stack}</p>
      <ul className="links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
